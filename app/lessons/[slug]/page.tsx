'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

interface Lesson {
  id: string;
  title: string;
  content: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

// This function can remain outside the component
async function getLesson(slug: string): Promise<Lesson | null> {
  const q = query(
    collection(db, 'lessons'),
    where('slug', '==', slug)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Lesson;
}

export default function LessonPage({
  params,
}: {
  params: { slug: string };
}) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    null
  );
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Check if the slug is available before fetching
    if (params.slug) {
      setIsLoading(true);
      getLesson(params.slug)
        .then(setLesson)
        .finally(() => setIsLoading(false));
    }
  }, [params.slug]);

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsAnswerChecked(true);
      setIsCorrect(selectedAnswer === lesson?.quiz.correctAnswer);
    }
  };

  if (isLoading) {
    return <div>Učitavanje lekcije...</div>;
  }

  if (!lesson) {
    return <div>Lekcija nije pronađena.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
      <div className="prose lg:prose-xl mb-8">
        <p>{lesson.content}</p>
      </div>

      {lesson.quiz && (
        <div className="p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {lesson.quiz.question}
          </h2>
          <div className="space-y-4">
            {lesson.quiz.options.map(
              (option, index) =>
                option && (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      name="quiz"
                      id={`option-${index}`}
                      value={option}
                      onChange={(e) =>
                        setSelectedAnswer(e.target.value)
                      }
                      disabled={isAnswerChecked}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="ml-3 block text-lg text-gray-700"
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
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
          >
            Proveri odgovor
          </button>
          {isAnswerChecked && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isCorrect
                ? 'Tačno!'
                : `Netačno. Tačan odgovor je: ${lesson.quiz.correctAnswer}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
