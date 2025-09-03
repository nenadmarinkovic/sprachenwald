'use client';
import React from 'react';
import { LessonBlock } from '@/types/sprachenwald';

export const BlockContentPreview = ({
  block,
}: {
  block: LessonBlock;
}) => {
  const renderContent = () => {
    switch (block.type) {
      case 'text':
      case 'grammar':
        return (
          <div className="prose prose-sm dark:prose-invert">
            {block.content.map(
              (item, index) =>
                item.type === 'text' && (
                  <div key={index}>
                    <p>
                      <strong>DE:</strong>{' '}
                      {Array.isArray(item.german)
                        ? item.german
                            .map((w: { german: string }) => w.german)
                            .join(' ')
                        : item.german}
                    </p>
                    <p>
                      <strong>SRB:</strong> {item.serbian}
                    </p>
                  </div>
                )
            )}
          </div>
        );
      case 'video':
        return (
          <p>
            <strong>URL:</strong>{' '}
            <a
              href={block.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {block.videoUrl}
            </a>
          </p>
        );
      case 'vocabulary':
        return (
          <ul>
            {block.words.slice(0, 5).map((word, index) => (
              <li key={index}>
                <strong>{word.german}</strong> - {word.serbian}
              </li>
            ))}
            {block.words.length > 5 && (
              <li>...and {block.words.length - 5} more.</li>
            )}
          </ul>
        );
      case 'quiz':
        return (
          <ul>
            {block.quizzes.slice(0, 3).map((quiz, index) => (
              <li key={index}>{quiz.question}</li>
            ))}
            {block.quizzes.length > 3 && (
              <li>
                ...and {block.quizzes.length - 3} more questions.
              </li>
            )}
          </ul>
        );
      default:
        return <p>No preview available.</p>;
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md">{renderContent()}</div>
  );
};
