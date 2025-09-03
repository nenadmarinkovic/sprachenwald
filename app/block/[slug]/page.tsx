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
  InteractiveWord as VocabWord,
  LessonContentBlock,
  HedgehogMessage,
  MultipleChoiceQuiz,
  Quiz,
} from '@/types/sprachenwald';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

import parse, { DOMNode } from 'html-react-parser';
import {
  type Node as DomNodeBase,
  type Element as DomElement,
  Text,
} from 'domhandler';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import LessonFilters, {
  PartOfSpeech,
} from '@/components/LessonFilters';
import NextBlockNav from '@/components/BlockPager';

const isDomElement = (n: DOMNode): n is DomElement => {
  const t = (n as DomNodeBase).type;
  return t === 'tag' || t === 'script' || t === 'style';
};
const isTextNode = (n: DOMNode): n is Text =>
  (n as DomNodeBase).type === 'text';

const getInnerText = (el: DomElement): string =>
  (el.children ?? [])
    .map((child) => {
      const c = child as DOMNode;
      if (isTextNode(c)) return (c as Text).data ?? '';
      if (isDomElement(c)) return getInnerText(c as DomElement);
      return '';
    })
    .join('')
    .trim();

type Padez =
  | 'nominativ'
  | 'genitiv'
  | 'dativ'
  | 'akuzativ'
  | 'vokativ'
  | 'instrumental'
  | 'lokativ'
  | '';

type UIWord = {
  german: string;
  prevod?: string;
  tip?: PartOfSpeech | '';
  note?: string;
  padez?: Padez | '';
  clan?: string;
  glagol?: boolean;
};

const InteractiveWordPopover = ({
  word,
  highlighted,
}: {
  word: UIWord;
  highlighted: boolean;
}) => {
  const pill = (label: string) => (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
      {label}
    </span>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={
            highlighted
              ? 'cursor-pointer rounded px-1 bg-yellow-100 ring-1 ring-yellow-300'
              : 'cursor-pointer'
          }
        >
          {word.german}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-72 z-50">
        <div className="space-y-2">
          <div className="text-lg font-semibold">{word.german}</div>
          {word.prevod && (
            <div>
              <span className="text-muted-foreground text-xs">
                Prevod:{' '}
              </span>
              <span className="font-medium">{word.prevod}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {word.tip && pill(`Tip: ${word.tip}`)}
            {word.padez && pill(`Padež: ${word.padez}`)}
            {word.clan && pill(`Član: ${word.clan}`)}
            {word.glagol && pill('Glagol')}
          </div>
          {word.note && (
            <div className="text-sm text-muted-foreground">
              {word.note}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const QuizRenderer = ({ quizzes }: { quizzes: Quiz[] }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const handleAnswerChange = (idx: number, answer: string) =>
    setAnswers((p) => ({ ...p, [idx]: answer }));
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
              <div className="space-y-2">
                {quiz.options.map((option, i) => {
                  const state = submitted
                    ? isCorrect(quiz, option)
                      ? 'correct'
                      : answers[index] === option
                      ? 'incorrect'
                      : 'none'
                    : 'none';
                  return (
                    <label
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
                      <input
                        type="radio"
                        name={`q${index}`}
                        value={option}
                        onChange={() =>
                          handleAnswerChange(index, option)
                        }
                        disabled={submitted}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {!submitted && (
                <Button
                  onClick={() => setSubmitted(true)}
                  className="mt-3"
                >
                  Check Answers
                </Button>
              )}
            </div>
          );
        }
        return <div key={index}>Unsupported quiz type.</div>;
      })}
    </div>
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

  const [filterTip, setFilterTip] = useState<PartOfSpeech | ''>('');
  const [caseSet, setCaseSet] = useState({
    nominativ: false,
    genitiv: false,
    dativ: false,
    akuzativ: false,
  });
  const [colorByArticle, setColorByArticle] = useState(false);
  const [lessons, setLessons] = useState<LessonWithId[]>([]);
  const [blocksByLesson, setBlocksByLesson] = useState<
    Record<string, LessonBlock[]>
  >({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);

      // 1) load ordered lessons
      const lessonsQuery = query(
        collection(db, 'lessons'),
        orderBy('order', 'asc')
      );
      const lessonSnap = await getDocs(lessonsQuery);
      const ls = lessonSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as LessonWithId)
      );
      if (cancelled) return;
      setLessons(ls);

      // 2) find the active block & collect blocks for its lesson
      let found: LessonBlock | null = null;
      let currentLessonBlocks: LessonBlock[] = [];
      let currentLessonId: string | null = null;

      for (const lesson of ls) {
        const blocksQ = query(
          collection(db, 'lessons', lesson.id, 'blocks'),
          orderBy('order', 'asc')
        );
        const blocksSnap = await getDocs(blocksQ);
        const blocks = blocksSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as LessonBlock)
        );

        // cache these blocks
        if (!cancelled) {
          setBlocksByLesson((prev) => ({
            ...prev,
            [lesson.id]: blocks,
          }));
        }

        const match = blocks.find((b) => b.slug === slug);
        if (match) {
          found = match;
          currentLessonBlocks = blocks;
          currentLessonId = lesson.id;
          break;
        }
      }

      // 3) (optional) prefetch next lesson's blocks for smoother nav
      if (currentLessonId) {
        const currentIdx = ls.findIndex(
          (l) => l.id === currentLessonId
        );
        const nextLesson =
          currentIdx !== -1 ? ls[currentIdx + 1] : undefined;
        if (nextLesson && !cancelled) {
          const blocksQ = query(
            collection(db, 'lessons', nextLesson.id, 'blocks'),
            orderBy('order', 'asc')
          );
          const blocksSnap = await getDocs(blocksQ);
          const blocks = blocksSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() } as LessonBlock)
          );
          setBlocksByLesson((prev) => ({
            ...prev,
            [nextLesson.id]: blocks,
          }));
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
    const vocabulary: VocabWord[] = [];

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
                  serbian: domNode.attribs['data-prevod'] || '',
                  article: domNode.attribs['data-clan'] || '',
                  partOfSpeech: domNode.attribs['data-tip'] || '',
                  info: domNode.attribs['data-note'] || '',
                  example: '',
                } as VocabWord);
              }
              return undefined;
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
        const attrs = domNode.attribs;
        const tip = (attrs['data-tip'] || '') as PartOfSpeech | '';
        const padez = (attrs['data-padez'] || '') as Padez | '';
        const articleRaw = (attrs['data-clan'] || '').toLowerCase(); // der | die | das | ''
        const glagol = (attrs['data-glagol'] || '') === 'true';
        const matchesTip = filterTip ? tip === filterTip : true;

        const someCase =
          caseSet.nominativ ||
          caseSet.genitiv ||
          caseSet.dativ ||
          caseSet.akuzativ;

        const matchesCase = !someCase
          ? true
          : (caseSet.nominativ && padez === 'nominativ') ||
            (caseSet.genitiv && padez === 'genitiv') ||
            (caseSet.dativ && padez === 'dativ') ||
            (caseSet.akuzativ && padez === 'akuzativ');

        const german =
          attrs['data-german'] || getInnerText(domNode) || '…';

        const uiWord: UIWord = {
          german,
          prevod: attrs['data-prevod'] || '',
          tip,
          note: attrs['data-note'] || '',
          padez,
          clan: attrs['data-clan'] || '',
          glagol,
        };

        const caseClass =
          someCase && matchesCase
            ? padez === 'nominativ'
              ? 'sw-case--nominativ'
              : padez === 'genitiv'
              ? 'sw-case--genitiv'
              : padez === 'dativ'
              ? 'sw-case--dativ'
              : padez === 'akuzativ'
              ? 'sw-case--akuzativ'
              : ''
            : '';

        const articleClass =
          colorByArticle && matchesTip && matchesCase
            ? articleRaw === 'der'
              ? 'sw-article--der'
              : articleRaw === 'die'
              ? 'sw-article--die'
              : articleRaw === 'das'
              ? 'sw-article--das'
              : ''
            : '';

        const highlighted = Boolean(caseClass);

        return (
          <span className={`${caseClass} ${articleClass}`.trim()}>
            <InteractiveWordPopover
              word={uiWord}
              highlighted={highlighted}
            />
          </span>
        );
      }
      return undefined;
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
                {idx === 0 && (
                  <LessonFilters
                    filterTip={filterTip}
                    setFilterTip={setFilterTip}
                    caseSet={caseSet}
                    setCaseSet={setCaseSet}
                    colorByArticle={colorByArticle}
                    setColorByArticle={setColorByArticle}
                  />
                )}

                <div className="prose max-w-none text-lg">
                  {parse(textBlock.german, parserOptions)}
                </div>
                {textBlock.serbian && (
                  <p className="text-md text-gray-500 mt-2">
                    {textBlock.serbian}
                  </p>
                )}
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

  if (isLoading)
    return <div className="text-center p-12">Učitavanje...</div>;
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

      {activeBlock && (
        <NextBlockNav
          lessons={lessons}
          blocksByLesson={blocksByLesson}
          currentLessonId={activeBlock.lessonId}
          currentBlockSlug={activeBlock.slug}
          className="mt-12"
        />
      )}

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
