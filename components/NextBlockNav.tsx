'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LessonWithId, LessonBlock } from '@/types/sprachenwald';

type Props = {
  lessons: LessonWithId[];
  blocksByLesson: Record<string, LessonBlock[]>;
  currentLessonId: string;
  currentBlockSlug: string;
  className?: string;
};

export default function NextBlockNav({
  lessons,
  blocksByLesson,
  currentLessonId,
  currentBlockSlug,
  className,
}: Props) {
  const lessonIdx = lessons.findIndex(
    (l) => l.id === currentLessonId
  );
  if (lessonIdx === -1) return null;

  const blocks = blocksByLesson[currentLessonId] || [];
  const blockIdx = blocks.findIndex(
    (b) => b.slug === currentBlockSlug
  );
  if (blockIdx === -1) return null;

  let nextBlock: LessonBlock | null = null;
  let nextLessonTitle: string | null = null;

  if (blockIdx < blocks.length - 1) {
    nextBlock = blocks[blockIdx + 1];
    nextLessonTitle = lessons[lessonIdx].title;
  } else {
    for (let i = lessonIdx + 1; i < lessons.length; i++) {
      const candidateLesson = lessons[i];
      const candidateBlocks =
        blocksByLesson[candidateLesson.id] || [];
      if (candidateBlocks.length > 0) {
        nextBlock = candidateBlocks[0];
        nextLessonTitle = candidateLesson.title;
        break;
      }
    }
  }

  if (!nextBlock) return null;

  return (
    <div className={className ?? 'mt-10 flex justify-end'}>
      <Link
        href={`/block/${nextBlock.slug}`}
        className="group inline-flex items-center gap-3 rounded-xl border px-4 py-2 font-medium text-blue-700 hover:bg-blue-50"
      >
        <span className="truncate max-w-[56vw]">
          <span className="text-gray-500 mr-2">
            {nextLessonTitle ? `${nextLessonTitle}:` : ''}
          </span>
          {nextBlock.title}
        </span>
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
