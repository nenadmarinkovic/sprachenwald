'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  Timestamp,
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
import { useUser } from '@/hooks/useUser';

const blockIcons: { [key: string]: React.ReactNode } = {
  text: <BookCopy className="h-4 w-4" />,
  grammar: <Puzzle className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  quiz: <CheckCircle className="h-4 w-4" />,
  vocabulary: <Mic className="h-4 w-4" />,
};

type SidebarData = LessonWithId & { blocks: LessonBlock[] };

const QuizRenderer = ({ quizzes }: { quizzes: Quiz[] }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleAnswerChange = (
    questionIndex: number,
    answer: string
  ) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => setSubmitted(true);

  const isCorrect = (quiz: MultipleChoiceQuiz, answer: string) => {
    return quiz.correctAnswer === answer;
  };

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
                onValueChange={(value) =>
                  handleAnswerChange(index, value)
                }
                disabled={submitted}
              >
                {quiz.options.map((option, i) => {
                  const answerState = submitted
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
                        submitted && answerState === 'correct'
                          ? 'bg-green-100'
                          : ''
                      } ${
                        submitted && answerState === 'incorrect'
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
        <Button onClick={handleSubmit}>Check Answers</Button>
      )}
    </div>
  );
};

export default function LessonBlockPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();

  const [sidebarData, setSidebarData] = useState<SidebarData[]>([]);
  const [activeBlock, setActiveBlock] = useState<LessonBlock | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setIsLoading(true);
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

  const blockVocabulary = useMemo(() => {
    if (!activeBlock) return [];
    if (
      activeBlock.type === 'text' ||
      activeBlock.type === 'grammar'
    ) {
      return activeBlock.content.flatMap((c) =>
        c.type === 'text' ? c.german : []
      );
    }
    if (activeBlock.type === 'vocabulary') {
      return activeBlock.words;
    }
    return [];
  }, [activeBlock]);

  const handleWordSelection = (germanWord: string) => {
    setSelectedWords((prev) => ({
      ...prev,
      [germanWord]: !prev[germanWord],
    }));
  };

  const handleAddVocabulary = async () => {
    if (!user || !activeBlock) return;
    const wordsToAdd = blockVocabulary.filter(
      (word) => selectedWords[word.german]
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

  const renderInteractiveText = (
    word: InteractiveWord,
    index: number
  ) => (
    <Popover key={index}>
      <PopoverTrigger asChild>
        <span className="cursor-pointer font-semibold text-blue-700 hover:bg-blue-100 rounded p-1">
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
      case 'video':
        return (
          <div>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={block.videoUrl.replace('watch?v=', 'embed/')}
                frameBorder="0"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
            {block.description && <p>{block.description}</p>}
          </div>
        );
      case 'vocabulary':
        return (
          <div className="space-y-2">
            {block.words.map((word, index) => (
              <div
                key={index}
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
                              handleWordSelection(word.german)
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
