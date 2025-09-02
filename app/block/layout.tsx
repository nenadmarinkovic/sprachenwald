'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import {
  BookOpen,
  BookCopy,
  CheckCircle,
  Film,
  Mic,
  Puzzle,
} from 'lucide-react';
import { LessonWithId, LessonBlock } from '@/types/sprachenwald';

const blockIcons: Record<string, React.ReactNode> = {
  text: <BookCopy className="h-4 w-4" />,
  grammar: <Puzzle className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  quiz: <CheckCircle className="h-4 w-4" />,
  vocabulary: <Mic className="h-4 w-4" />,
};

type SidebarData = LessonWithId & { blocks: LessonBlock[] };

export default function BlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeSlug = pathname.split('/').pop() || '';
  const [sidebarData, setSidebarData] = useState<SidebarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const lessonsQuery = query(
        collection(db, 'lessons'),
        orderBy('order', 'asc')
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      const lessons = lessonsSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as LessonWithId)
      );

      const populated = await Promise.all(
        lessons.map(async (lesson) => {
          const blocksQuery = query(
            collection(db, 'lessons', lesson.id, 'blocks'),
            orderBy('order', 'asc')
          );
          const blocksSnap = await getDocs(blocksQuery);
          const blocks = blocksSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() } as LessonBlock)
          );
          return { ...lesson, blocks };
        })
      );

      if (!cancelled) {
        setSidebarData(populated);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
      <aside className="w-full md:w-1/4 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} /> Sadržaj
        </h2>
        {loading ? (
          <div className="text-sm text-gray-500 p-2">Učitavanje…</div>
        ) : (
          <nav className="space-y-4">
            {sidebarData.map((lesson) => (
              <div key={lesson.id}>
                <h3 className="font-bold p-2 rounded-md text-gray-800">
                  {lesson.order + 1}. {lesson.title}
                </h3>
                <div className="pl-4 mt-1 space-y-1 border-l-2 ml-2">
                  {lesson.blocks.map((block) => {
                    const isActive = activeSlug === block.slug;
                    return (
                      <Link
                        key={block.id}
                        href={`/block/${block.slug}`}
                      >
                        <div
                          className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                            isActive
                              ? 'bg-green-100 text-green-800'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {blockIcons[block.type] ?? (
                            <BookCopy className="h-4 w-4" />
                          )}
                          {block.title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        )}
      </aside>

      <main className="w-full md:w-3/4 p-6 md:p-8 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}
