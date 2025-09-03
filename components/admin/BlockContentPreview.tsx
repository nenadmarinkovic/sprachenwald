'use client';

import React from 'react';
import type {
  LessonBlock,
  LessonContentBlock,
  TextualLessonBlock,
  GrammarLessonBlock,
  InteractiveWord,
} from '@/types/sprachenwald';
import parse, { domToReact } from 'html-react-parser';
import type {
  Element as DomElement,
  HTMLReactParserOptions,
  DOMNode,
} from 'html-react-parser';
import { type Node as DomNodeBase, Text } from 'domhandler';

const isDomElement = (n: DOMNode): n is DomElement => {
  const t = (n as DomNodeBase).type;
  return t === 'tag' || t === 'script' || t === 'style';
};

const isTextNode = (n: DOMNode): n is Text => {
  return (n as DomNodeBase).type === 'text';
};

function normalizeGerman(
  input: string | InteractiveWord[] | undefined
): string {
  if (Array.isArray(input)) {
    return input
      .map((w) => w.german ?? '')
      .join(' ')
      .trim();
  }
  return typeof input === 'string' ? input : '';
}

const germanPreviewParser = (
  limitChars?: number
): HTMLReactParserOptions => {
  let charCount = 0;

  return {
    replace: (node) => {
      if (isDomElement(node)) {
        const name = node.name?.toLowerCase() ?? '';

        if (
          [
            'script',
            'style',
            'iframe',
            'img',
            'video',
            'audio',
          ].includes(name)
        ) {
          return <></>;
        }

        const attribs = node.attribs ?? {};
        const isAnnotatedSpan =
          name === 'span' &&
          (attribs['data-interactive-word'] ||
            attribs['data-annotation'] ||
            attribs['german']);

        if (isAnnotatedSpan) {
          const children: DOMNode[] =
            (node.children as DOMNode[]) ?? [];
          return (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-blue-700 font-medium">
              {domToReact(children, germanPreviewParser(limitChars))}
            </span>
          );
        }
      }

      if (limitChars && isTextNode(node)) {
        const remaining = limitChars - charCount;
        if (remaining <= 0) return <></>;
        const text = node.data ?? '';
        if (text.length <= remaining) {
          charCount += text.length;
          return text;
        } else {
          charCount = limitChars;
          return text.slice(0, remaining) + '…';
        }
      }

      return undefined;
    },
  };
};

export const BlockContentPreview = ({
  block,
}: {
  block: LessonBlock;
}) => {
  const renderTextish = () => {
    const content =
      (block as TextualLessonBlock | GrammarLessonBlock).content ??
      [];

    const items = content
      .filter((i): i is LessonContentBlock => i?.type === 'text')
      .slice(0, 2);

    if (items.length === 0) {
      return <p className="text-gray-500">No text yet.</p>;
    }

    return (
      <div className="prose prose-sm dark:prose-invert">
        {items.map((item, idx) => {
          const germanHtml = normalizeGerman(item.german);
          const serbian =
            (item as Extract<LessonContentBlock, { type: 'text' }>)
              .serbian ?? '';

          return (
            <div key={idx} className="mb-3">
              {/* ⚠️ Use block elements to avoid <p> inside <p> */}
              <div className="mb-1 font-semibold">
                German content:
              </div>
              <div className="text-gray-800">
                {germanHtml
                  ? parse(germanHtml, germanPreviewParser(450))
                  : '—'}
              </div>

              {serbian && (
                <div className="text-gray-800 mt-2">
                  <span className="font-semibold">Prevod:</span>{' '}
                  {serbian}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text':
      case 'grammar':
        return renderTextish();

      case 'video':
        return block.videoUrl ? (
          <p>
            <strong>URL:</strong>{' '}
            <a
              href={block.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {block.videoUrl}
            </a>
          </p>
        ) : (
          <p className="text-gray-500">No video URL.</p>
        );

      case 'vocabulary': {
        const words = block.words ?? [];
        if (words.length === 0)
          return <p className="text-gray-500">No words yet.</p>;
        return (
          <ul className="list-disc pl-5">
            {words.slice(0, 5).map((word, index) => (
              <li key={index}>
                <strong>
                  {[word.article, word.german]
                    .filter(Boolean)
                    .join(' ')}
                </strong>
                {word.serbian ? ` — ${word.serbian}` : ''}
              </li>
            ))}
            {words.length > 5 && (
              <li className="text-gray-600">
                …and {words.length - 5} more.
              </li>
            )}
          </ul>
        );
      }

      case 'quiz': {
        const quizzes = block.quizzes ?? [];
        if (quizzes.length === 0)
          return <p className="text-gray-500">No questions yet.</p>;
        return (
          <ul className="list-disc pl-5">
            {quizzes.slice(0, 3).map((quiz, index) => (
              <li key={index}>{quiz.question}</li>
            ))}
            {quizzes.length > 3 && (
              <li className="text-gray-600">
                …and {quizzes.length - 3} more questions.
              </li>
            )}
          </ul>
        );
      }

      default:
        return <p className="text-gray-500">No preview available.</p>;
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md">{renderContent()}</div>
  );
};
