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
  Timestamp,
} from 'firebase/firestore';
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react';

interface MultipleChoiceQuizData {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

interface FillInTheBlankQuizData {
  type: 'fill-in-the-blank';
  question: string;
  correctAnswer: string;
}

type QuizData = MultipleChoiceQuizData | FillInTheBlankQuizData;

interface Lesson {
  title: string;
  content: string;
  slug: string;
  quizzes: QuizData[];
  createdAt: Timestamp;
}

interface LessonWithId extends Lesson {
  id: string;
}

const MultipleChoiceQuiz = ({
  quiz,
  index,
}: {
  quiz: MultipleChoiceQuizData;
  index: number;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    null
  );
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const isCorrect = selectedAnswer === quiz.correctAnswer;

  const handleCheckAnswer = () => {
    if (selectedAnswer) setIsAnswerChecked(true);
  };

  return (
    <div className="p-6 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        {index + 1}. {quiz.question}
      </h3>
      <div className="space-y-3">
        {quiz.options.map(
          (option, idx) =>
            option && (
              <div
                key={idx}
                className={`flex items-center p-3 rounded-md transition-colors ${
                  isAnswerChecked && option === quiz.correctAnswer
                    ? 'bg-green-100'
                    : ''
                } ${
                  isAnswerChecked &&
                  selectedAnswer === option &&
                  !isCorrect
                    ? 'bg-red-100'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name={`${quiz.question}-${index}`}
                  id={`${quiz.question}-${index}-${idx}`}
                  value={option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isAnswerChecked}
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <label
                  htmlFor={`${quiz.question}-${index}-${idx}`}
                  className="ml-3 block text-md text-gray-800"
                >
                  {option}
                </label>
              </div>
            )
        )}
      </div>
      <button
        onClick={handleCheckAnswer}
        disabled={!selectedAnswer || isAnswerChecked}
        className="mt-5 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg disabled:bg-gray-400 hover:bg-green-700 transition-colors"
      >
        Proveri
      </button>
      {isAnswerChecked && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            isCorrect
              ? 'bg-green-100 text-green-900'
              : 'bg-red-100 text-red-900'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>
            {isCorrect
              ? 'Tačno!'
              : `Netačno. Tačan odgovor je: ${quiz.correctAnswer}`}
          </span>
        </div>
      )}
    </div>
  );
};

const FillInTheBlankQuiz = ({
  quiz,
  index,
}: {
  quiz: FillInTheBlankQuizData;
  index: number;
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const isCorrect =
    userAnswer.trim().toLowerCase() ===
    quiz.correctAnswer.toLowerCase();

  const handleCheckAnswer = () => {
    if (userAnswer) setIsAnswerChecked(true);
  };

  const questionText = quiz.question.split('___').map((part, i) =>
    i === 0 ? (
      part
    ) : (
      <React.Fragment key={i}>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isAnswerChecked}
          className="inline-block w-40 mx-2 px-2 py-1 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent"
        />
        {part}
      </React.Fragment>
    )
  );

  return (
    <div className="p-6 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <label
        className="text-lg font-semibold mb-4 block"
        htmlFor={`fill-blank-${index}`}
      >
        {index + 1}. {questionText}
      </label>
      <button
        onClick={handleCheckAnswer}
        disabled={!userAnswer || isAnswerChecked}
        className="mt-5 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg disabled:bg-gray-400 hover:bg-green-700 transition-colors"
      >
        Proveri
      </button>
      {isAnswerChecked && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            isCorrect
              ? 'bg-green-100 text-green-900'
              : 'bg-red-100 text-red-900'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>
            {isCorrect
              ? 'Tačno!'
              : `Netačno. Tačan odgovor je: ${quiz.correctAnswer}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default function LessonPageLayout() {
  const params = useParams();
  const slug = params.slug as string;

  const [allLessons, setAllLessons] = useState<LessonWithId[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      orderBy('createdAt', 'asc')
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-500">
          Učitavanje lekcije...
        </div>
      );
    }

    if (!currentLesson) {
      return (
        <div className="text-center text-gray-500">
          Lekcija nije pronađena. Molimo izaberite lekciju iz menija.
        </div>
      );
    }

    return (
      <>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          {currentLesson.title}
        </h1>
        <div
          className="prose lg:prose-lg max-w-none text-gray-700 mb-8"
          dangerouslySetInnerHTML={{
            __html: currentLesson.content.replace(/\n/g, '<br />'),
          }}
        />

        {currentLesson.quizzes &&
          currentLesson.quizzes.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 border-t pt-6 text-gray-900">
                Kviz
              </h2>
              {currentLesson.quizzes.map((quiz, index) => {
                switch (quiz.type) {
                  case 'multiple-choice':
                    return (
                      <MultipleChoiceQuiz
                        key={index}
                        index={index}
                        quiz={quiz as MultipleChoiceQuizData}
                      />
                    );
                  case 'fill-in-the-blank':
                    return (
                      <FillInTheBlankQuiz
                        key={index}
                        index={index}
                        quiz={quiz as FillInTheBlankQuizData}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )}
      </>
    );
  };

  return (
    <div className="flex h-[calc(100vh-65px)]">
      {' '}
      <aside className="w-full md:w-1/4 bg-gray-50 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Lekcije
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
