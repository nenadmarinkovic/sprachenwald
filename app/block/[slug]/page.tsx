'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import {
  LessonWithId,
  LessonBlock,
  InteractiveWord,
  LessonContentBlock,
  HedgehogMessage,
  MultipleChoiceQuiz,
  Quiz,
} from '@/types/sprachenwald';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import parse, { DOMNode } from 'html-react-parser';
import {
  type Node as DomNodeBase,
  type Element as DomElement,
  Text,
} from 'domhandler';

const isDomElement = (n: DOMNode): n is DomElement => {
  const t = (n as DomNodeBase).type;
  return t === 'tag' || t === 'script' || t === 'style';
};

const isTextNode = (n: DOMNode): n is Text => {
  return (n as DomNodeBase).type === 'text';
};

const getInnerText = (el: DomElement): string =>
  ((el as DomElement).children ?? [])
    .map((child) => {
      const domNodeChild = child as DOMNode;
      if (isTextNode(domNodeChild)) return domNodeChild.data ?? '';
      if (isDomElement(domNodeChild))
        return getInnerText(domNodeChild as DomElement);
      return '';
    })
    .join('')
    .trim();

const QuizRenderer = ({ quizzes }: { quizzes: Quiz[] }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (idx: number, answer: string) =>
    setAnswers((prev) => ({ ...prev, [idx]: answer }));

  const isCorrect = (quiz: MultipleChoiceQuiz, answer: string) =>
    quiz.correctAnswer === answer;

  return (
    <div className="space-y-8">
      {quizzes.map((quiz, index) => {
        if (quiz.type === 'multiple-choice') {
          return (
            <div key={index} className="p-4 border rounded-lg">
              <p className="font-semibold mb-4">
                {index + 1}. {quiz.question}
              </p>
              <RadioGroup
                onValueChange={(v) => handleAnswerChange(index, v)}
                disabled={submitted}
              >
                {quiz.options.map((option, i) => {
                  const state = submitted
                    ? isCorrect(quiz, option)
                      ? 'correct'
                      : answers[index] === option
                      ? 'incorrect'
                      : 'none'
                    : 'none';
                  return (
                    <div
                      key={i}
                      className={`flex items-center space-x-2 p-2 rounded-md ${
                        submitted && state === 'correct'
                          ? 'bg-green-100'
                          : ''
                      } ${
                        submitted && state === 'incorrect'
                          ? 'bg-red-100'
                          : ''
                      }`}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`q${index}-o${i}`}
                      />
                      <Label htmlFor={`q${index}-o${i}`}>
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          );
        }
        return <div key={index}>Unsupported quiz type.</div>;
      })}
      {!submitted && (
        <Button onClick={() => setSubmitted(true)}>
          Check Answers
        </Button>
      )}
    </div>
  );
};

const InteractiveWordPopover = ({
  word,
}: {
  word: InteractiveWord;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer font-semibold text-blue-700 hover:bg-blue-100 rounded p-1">
          {word.german}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto z-50">
        <div className="p-2 space-y-1">
          <p className="font-bold text-lg">{word.german}</p>
          <p className="text-md text-gray-600">{word.serbian}</p>
          {word.partOfSpeech && (
            <p className="text-sm font-medium text-purple-600 capitalize">
              {word.partOfSpeech}
            </p>
          )}
          {word.info && (
            <p className="text-sm text-gray-500">({word.info})</p>
          )}
          {word.article && (
            <p className="text-sm text-gray-500">
              Član: {word.article}
            </p>
          )}
          {word.example && (
            <p className="text-sm text-gray-500">
              Primer: {word.example}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function BlockPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();

  const [activeBlock, setActiveBlock] = useState<LessonBlock | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const lessonsQuery = query(
        collection(db, 'lessons'),
        orderBy('order', 'asc')
      );
      const lessonSnap = await getDocs(lessonsQuery);
      const ls = lessonSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as LessonWithId)
      );

      let found: LessonBlock | null = null;
      for (const lesson of ls) {
        const blocksQ = query(
          collection(db, 'lessons', lesson.id, 'blocks'),
          orderBy('order', 'asc')
        );
        const blocksSnap = await getDocs(blocksQ);
        const blocks = blocksSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as LessonBlock)
        );
        const match = blocks.find((b) => b.slug === slug);
        if (match) {
          found = match;
          break;
        }
      }

      if (!cancelled) {
        setActiveBlock(found);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const blockVocabulary = useMemo(() => {
    if (!activeBlock) return [];
    const vocabulary: InteractiveWord[] = [];

    if (
      activeBlock.type === 'text' ||
      activeBlock.type === 'grammar'
    ) {
      activeBlock.content.forEach((c) => {
        if (c.type === 'text') {
          const contentBlock = c as LessonContentBlock;
          parse(contentBlock.german, {
            replace: (domNode: DOMNode) => {
              if (
                isDomElement(domNode) &&
                domNode.attribs?.['data-interactive-word']
              ) {
                const inner = getInnerText(domNode);
                vocabulary.push({
                  german:
                    domNode.attribs['data-german'] || inner || '',
                  serbian: domNode.attribs['data-serbian'] || '',
                  article: domNode.attribs['data-article'] || '',
                  partOfSpeech:
                    domNode.attribs['data-part-of-speech'] || '',
                  info: domNode.attribs['data-info'] || '',
                  example: domNode.attribs['data-example'] || '',
                });
              }
            },
          });
        }
      });
    } else if (activeBlock.type === 'vocabulary') {
      vocabulary.push(...activeBlock.words);
    }

    return vocabulary;
  }, [activeBlock]);

  const handleAddVocabulary = async () => {
    if (!user || !activeBlock) return;
    const wordsToAdd = blockVocabulary.filter(
      (w) => selectedWords[w.german]
    );
    for (const word of wordsToAdd) {
      await addDoc(collection(db, 'userVocabulary'), {
        ...word,
        userId: user.uid,
        lessonId: activeBlock.lessonId,
        addedAt: Timestamp.now(),
        type: 'ostalo',
      });
    }
    alert(`${wordsToAdd.length} reči je dodato u vaš Sprachgarten!`);
    setSelectedWords({});
  };

  const parserOptions = {
    replace: (domNode: DOMNode) => {
      if (
        isDomElement(domNode) &&
        domNode.attribs?.['data-interactive-word']
      ) {
        const inner = getInnerText(domNode);
        const wordData: InteractiveWord = {
          german: domNode.attribs['data-german'] || inner || '…',
          serbian: domNode.attribs['data-serbian'] || '…',
          article: domNode.attribs['data-article'] || '',
          partOfSpeech: domNode.attribs['data-part-of-speech'] || '',
          info: domNode.attribs['data-info'] || '',
          example: domNode.attribs['data-example'] || '',
        };
        return <InteractiveWordPopover word={wordData} />;
      }
    },
  };

  const renderLessonBlockContent = (block: LessonBlock) => {
    switch (block.type) {
      case 'text':
      case 'grammar':
        return block.content.map((contentItem, idx) => {
          if (contentItem.type === 'text') {
            const textBlock = contentItem as LessonContentBlock;
            return (
              <div key={idx} className="mb-6 leading-relaxed">
                <div className="prose max-w-none text-lg">
                  {parse(textBlock.german, parserOptions)}
                </div>
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
                key={idx}
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
      case 'video':
        return (
          <div>
            {block.videoUrl ? (
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe
                  src={block.videoUrl.replace('watch?v=', 'embed/')}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            ) : (
              <div className="p-4 bg-gray-100 text-gray-600 rounded-md">
                Nema video snimka za ovaj deo lekcije.
              </div>
            )}
            {block.description && <p>{block.description}</p>}
          </div>
        );
      case 'vocabulary':
        return (
          <div className="space-y-2">
            {block.words.map((word, i) => (
              <div
                key={`${word.german}-${i}`}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-semibold">
                  {word.article} {word.german}
                </span>
                <span>{word.serbian}</span>
              </div>
            ))}
          </div>
        );
      case 'quiz':
        return <QuizRenderer quizzes={block.quizzes} />;
      default:
        return (
          <div>
            Sadržaj za ovaj deo lekcije će uskoro biti dostupan.
          </div>
        );
    }
  };

  if (isLoading) {
    return <div className="text-center p-12">Učitavanje...</div>;
  }

  if (!activeBlock) {
    return (
      <div className="text-center text-gray-500 flex items-center justify-center h-full">
        <p>Sadržaj nije pronađen. Molimo izaberite blok iz menija.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
        {activeBlock.title}
      </h1>
      {renderLessonBlockContent(activeBlock)}

      {blockVocabulary.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">
            Dodaj u Rečnik (Sprachgarten)
          </h2>
          {user ? (
            <>
              <div className="space-y-2">
                {blockVocabulary.map((word, index) => (
                  <div
                    key={`${word.german}-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`vocab-${index}`}
                      onCheckedChange={() =>
                        setSelectedWords((p) => ({
                          ...p,
                          [word.german]: !p[word.german],
                        }))
                      }
                      checked={!!selectedWords[word.german]}
                    />
                    <label
                      htmlFor={`vocab-${index}`}
                      className="flex-grow cursor-pointer"
                    >
                      <span className="font-semibold">
                        {word.german}
                      </span>{' '}
                      - <span>{word.serbian}</span>
                    </label>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleAddVocabulary}
                className="mt-6"
                disabled={Object.values(selectedWords).every(
                  (v) => !v
                )}
              >
                Dodaj selektovano
              </Button>
            </>
          ) : (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <p className="text-gray-700">
                <Link
                  href="/login"
                  className="font-bold text-green-600 hover:underline"
                >
                  Prijavite se
                </Link>{' '}
                ili{' '}
                <Link
                  href="/signup"
                  className="font-bold text-green-600 hover:underline"
                >
                  registrujte
                </Link>{' '}
                da biste sačuvali reči.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
