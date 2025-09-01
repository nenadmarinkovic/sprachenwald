'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { BookOpen } from 'lucide-react';
import {
  LessonWithId,
  LessonContentBlock,
  MultipleChoiceQuiz,
  FillInTheBlankQuiz,
  HedgehogMessage,
} from '@/types/sprachenwald';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/hooks/useUser';

const MultipleChoiceQuizComponent = ({
  quiz,
  index,
}: {
  quiz: MultipleChoiceQuiz;
  index: number;
}) => {
  return (
    <div className="p-6 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        {index + 1}. {quiz.question}
      </h3>
    </div>
  );
};

const FillInTheBlankQuizComponent = ({
  quiz,
  index,
}: {
  quiz: FillInTheBlankQuiz;
  index: number;
}) => {
  return (
    <div className="p-6 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        {index + 1}. {quiz.question.replace(/___/g, '______')}
      </h3>
    </div>
  );
};

export default function LessonPageLayout() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();

  const [allLessons, setAllLessons] = useState<LessonWithId[]>([]);
  const [currentLesson, setCurrentLesson] =
    useState<LessonWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(
      lessonsQuery,
      (snapshot) => {
        const lessonsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as LessonWithId)
        );
        setAllLessons(lessonsData);
        const activeLesson = lessonsData.find((l) => l.slug === slug);
        setCurrentLesson(activeLesson || null);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching lessons:', error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [slug]);

  const handleWordSelection = (germanWord: string) => {
    setSelectedWords((prev) => ({
      ...prev,
      [germanWord]: !prev[germanWord],
    }));
  };

  const handleAddVocabulary = async () => {
    if (!user || !currentLesson || !currentLesson.vocabulary) return;
    const wordsToAdd = currentLesson.vocabulary.filter(
      (word) => selectedWords[word.german]
    );

    for (const word of wordsToAdd) {
      await addDoc(collection(db, 'userVocabulary'), {
        ...word,
        userId: user.uid,
        lessonId: currentLesson.id,
        addedAt: Timestamp.now(),
        type: 'ostalo',
      });
    }
    alert(`${wordsToAdd.length} reči je dodato u vaš Sprachgarten!`);
    setSelectedWords({});
  };

  const renderInteractiveText = (
    block: LessonContentBlock,
    blockKey: number
  ) => (
    <div key={blockKey} className="mb-6 leading-relaxed">
      <p className="text-lg text-gray-800">
        {block.german.map((word, index) => (
          <Popover key={index}>
            <PopoverTrigger asChild>
              <span className="cursor-pointer font-semibold text-blue-700 hover:bg-blue-100 rounded p-1">
                {word.german}{' '}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <div className="p-2">
                <p className="font-bold text-lg">{word.german}</p>
                <p className="text-md text-gray-600">
                  {word.serbian}
                </p>
                {word.info && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {word.info}
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </p>
      <p className="text-md text-gray-500 mt-2">{block.serbian}</p>
    </div>
  );

  const renderHedgehog = (
    block: HedgehogMessage,
    blockKey: number
  ) => (
    <div
      key={blockKey}
      className="my-8 flex items-center gap-4 bg-amber-100 p-4 rounded-lg"
    >
      <span className="text-4xl">🦔</span>
      <p className="text-amber-900 font-medium">{block.text}</p>
    </div>
  );

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="text-center p-12">Učitavanje lekcije...</div>
      );
    if (!currentLesson)
      return (
        <div className="text-center p-12">
          Lekcija nije pronađena.
        </div>
      );

    return (
      <>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
          {currentLesson.title}
        </h1>

        {Array.isArray(currentLesson.content) ? (
          currentLesson.content.map((block, index) => {
            switch (block.type) {
              case 'text':
                return renderInteractiveText(
                  block as LessonContentBlock,
                  index
                );
              case 'hedgehog':
                return renderHedgehog(
                  block as HedgehogMessage,
                  index
                );
              default:
                return null;
            }
          })
        ) : (
          <div
            className="prose lg:prose-lg max-w-none text-gray-700 mb-8"
            dangerouslySetInnerHTML={{
              __html: String(currentLesson.content).replace(
                /\n/g,
                '<br />'
              ),
            }}
          />
        )}

        {currentLesson.vocabulary &&
          Array.isArray(currentLesson.vocabulary) &&
          currentLesson.vocabulary.length > 0 && (
            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">
                Dodaj u Rečnik (Sprachgarten)
              </h2>
              {user ? (
                <>
                  <div className="space-y-2">
                    {currentLesson.vocabulary.map((word, index) => (
                      <div
                        key={index}
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
                    da biste sačuvali reči u svoj lični rečnik.
                  </p>
                </div>
              )}
            </div>
          )}

        {currentLesson.quizzes?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 border-t pt-8">
              Kviz
            </h2>
            {currentLesson.quizzes.map((quiz, index) => {
              switch (quiz.type) {
                case 'multiple-choice':
                  return (
                    <MultipleChoiceQuizComponent
                      key={index}
                      index={index}
                      quiz={quiz}
                    />
                  );
                case 'fill-in-the-blank':
                  return (
                    <FillInTheBlankQuizComponent
                      key={index}
                      index={index}
                      quiz={quiz}
                    />
                  );
                default:
                  return (
                    <div
                      key={index}
                      className="p-4 bg-yellow-100 rounded-md"
                    >
                      Tip kviza još uvek nije podržan.
                    </div>
                  );
              }
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
      <aside className="w-full md:w-1/4 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} /> Lekcije
        </h2>
        <nav className="space-y-1">
          {allLessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.slug}`}
              prefetch={false}
              passHref
            >
              <div
                className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  slug === lesson.slug
                    ? 'bg-green-100 text-green-800 font-semibold'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lesson.title}
              </div>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="w-full md:w-3/4 p-6 md:p-8 overflow-y-auto bg-white">
        {renderContent()}
      </main>
    </div>
  );
}
