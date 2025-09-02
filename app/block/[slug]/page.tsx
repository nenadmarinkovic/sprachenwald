'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import {
  BookOpen,
  CheckCircle,
  Film,
  Puzzle,
  BookCopy,
  Mic,
} from 'lucide-react';
import {
  LessonWithId,
  LessonBlock,
  InteractiveWord,
  LessonContentBlock,
  HedgehogMessage,
} from '@/types/sprachenwald';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const blockIcons: { [key: string]: React.ReactNode } = {
  text: <BookCopy className="h-4 w-4" />,
  quiz: <CheckCircle className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  grammar: <Puzzle className="h-4 w-4" />,
  vocabulary: <Mic className="h-4 w-4" />,
};

type SidebarData = LessonWithId & { blocks: LessonBlock[] };

export default function LessonBlockPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [sidebarData, setSidebarData] = useState<SidebarData[]>([]);
  const [activeBlock, setActiveBlock] = useState<LessonBlock | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      const lessonsQuery = query(
        collection(db, 'lessons'),
        orderBy('order', 'asc')
      );
      const lessonSnapshot = await getDocs(lessonsQuery);
      const lessons = lessonSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as LessonWithId)
      );

      const populatedLessons = await Promise.all(
        lessons.map(async (lesson) => {
          const blocksQuery = query(
            collection(db, 'lessons', lesson.id, 'blocks'),
            orderBy('order', 'asc')
          );
          const blocksSnapshot = await getDocs(blocksQuery);
          const blocks = blocksSnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as LessonBlock)
          );
          return { ...lesson, blocks };
        })
      );
      setSidebarData(populatedLessons);
    };

    fetchSidebarData();
  }, []);

  useEffect(() => {
    if (sidebarData.length > 0 && slug) {
      for (const lesson of sidebarData) {
        const foundBlock = lesson.blocks.find((p) => p.slug === slug);
        if (foundBlock) {
          setActiveBlock(foundBlock);
          break;
        }
      }
    }
    setIsLoading(false);
  }, [sidebarData, slug]);

  const renderInteractiveText = (
    word: InteractiveWord,
    index: number
  ) => (
    <Popover key={index}>
      <PopoverTrigger asChild>
        <span
          className="cursor-pointer font-semibold text-blue-700 hover:bg-blue-100 rounded p-1"
          onDoubleClick={() => {}}
        >
          {word.german}{' '}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto z-50">
        <div className="p-2">
          <p className="font-bold text-lg">{word.german}</p>
          <p className="text-md text-gray-600">{word.serbian}</p>
          {word.info && (
            <p className="text-sm text-gray-500 mt-1">
              ({word.info})
            </p>
          )}
          {word.article && (
            <p className="text-sm text-gray-500 mt-1">
              Član: {word.article}
            </p>
          )}
          {word.example && (
            <p className="text-sm text-gray-500 mt-1">
              Primer: {word.example}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  const renderLessonBlockContent = (block: LessonBlock) => {
    switch (block.type) {
      case 'text':
      case 'grammar':
        return block.content.map((contentItem, index) => {
          if (contentItem.type === 'text') {
            const textBlock = contentItem as LessonContentBlock;
            return (
              <div key={index} className="mb-6 leading-relaxed">
                <p className="text-lg text-gray-800">
                  {textBlock.german.map(renderInteractiveText)}
                </p>
                <p className="text-md text-gray-500 mt-2">
                  {textBlock.serbian}
                </p>
              </div>
            );
          }
          if (contentItem.type === 'hedgehog') {
            const hedgehogBlock = contentItem as HedgehogMessage;
            return (
              <div
                key={index}
                className="my-8 flex items-center gap-4 bg-amber-100 p-4 rounded-lg"
              >
                <span className="text-4xl">🦔</span>
                <p className="text-amber-900 font-medium">
                  {hedgehogBlock.text}
                </p>
              </div>
            );
          }
          return null;
        });
      default:
        return (
          <div>
            Sadržaj za ovaj deo lekcije će uskoro biti dostupan.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
      <aside className="w-full md:w-1/4 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} /> Sadržaj
        </h2>
        <nav className="space-y-4">
          {sidebarData.map((lesson) => (
            <div key={lesson.id}>
              <h3 className="font-bold p-2 rounded-md text-gray-800">
                {lesson.order + 1}. {lesson.title}
              </h3>
              <div className="pl-4 mt-1 space-y-1 border-l-2 ml-2">
                {lesson.blocks.map((block) => (
                  <Link
                    key={block.id}
                    href={`/block/${block.slug}`}
                    passHref
                  >
                    <div
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                        activeBlock?.id === block.id
                          ? 'bg-green-100 text-green-800'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {blockIcons[block.type] || (
                        <BookCopy className="h-4 w-4" />
                      )}
                      {block.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="w-full md:w-3/4 p-6 md:p-8 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="text-center p-12">Učitavanje...</div>
        ) : activeBlock ? (
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              {activeBlock.title}
            </h1>
            {renderLessonBlockContent(activeBlock)}
          </div>
        ) : (
          <div className="text-center text-gray-500 flex items-center justify-center h-full">
            <p>
              Sadržaj nije pronađen. Molimo izaberite blok iz menija.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
