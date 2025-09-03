'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonWithId, LessonBlock } from '@/types/sprachenwald';

type Props = {
  lessons: LessonWithId[];
  blocksByLesson: Record<string, LessonBlock[]>;
  currentLessonId: string;
  currentBlockSlug: string;
  className?: string;
};

export default function BlockPager({
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

  let prevBlock: LessonBlock | null = null;
  let prevLessonTitle: string | null = null;

  if (blockIdx > 0) {
    prevBlock = blocks[blockIdx - 1];
    prevLessonTitle = lessons[lessonIdx].title;
  } else {
    for (let i = lessonIdx - 1; i >= 0; i--) {
      const candidateLesson = lessons[i];
      const candidateBlocks =
        blocksByLesson[candidateLesson.id] || [];
      if (candidateBlocks.length > 0) {
        prevBlock = candidateBlocks[candidateBlocks.length - 1];
        prevLessonTitle = candidateLesson.title;
        break;
      }
    }
  }

  if (!prevBlock && !nextBlock) return null;

  return (
    <nav
      className={className ?? 'mt-10'}
      aria-label="Block pagination"
    >
      <div className="flex items-center justify-between gap-4">
        {prevBlock ? (
          <Link
            href={`/block/${prevBlock.slug}`}
            className="group inline-flex items-center gap-3 rounded-xl border px-4 py-2 font-medium text-blue-700 hover:bg-blue-50 max-w-[46vw]"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="truncate">
              <span className="text-gray-500 mr-2">
                {prevLessonTitle ? `${prevLessonTitle}:` : ''}
              </span>
              {prevBlock.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {nextBlock ? (
          <Link
            href={`/block/${nextBlock.slug}`}
            className="group inline-flex items-center gap-3 rounded-xl border px-4 py-2 font-medium text-blue-700 hover:bg-blue-50 max-w-[46vw]"
          >
            <span className="truncate">
              <span className="text-gray-500 mr-2">
                {nextLessonTitle ? `${nextLessonTitle}:` : ''}
              </span>
              {nextBlock.title}
            </span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
