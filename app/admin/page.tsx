'use client';
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Book,
  PlusCircle,
  Trash2,
  LayoutDashboard,
} from 'lucide-react';

interface MultipleChoiceQuiz {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

interface FillInTheBlankQuiz {
  type: 'fill-in-the-blank';
  question: string;
  correctAnswer: string;
}

type Quiz = MultipleChoiceQuiz | FillInTheBlankQuiz;

interface Lesson {
  title: string;
  content: string;
  slug: string;
  quizzes: Quiz[];
  createdAt: Timestamp;
}

interface LessonWithId extends Lesson {
  id: string;
}

const AdminPage = () => {
  const [allLessons, setAllLessons] = useState<LessonWithId[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<
    string | null
  >(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [quizType, setQuizType] = useState<
    'multiple-choice' | 'fill-in-the-blank'
  >('multiple-choice');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctMcAnswer, setCorrectMcAnswer] = useState('');
  const [fibCorrectAnswer, setFibCorrectAnswer] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(lessonsQuery, (snapshot) => {
      const lessonsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as LessonWithId)
      );
      setAllLessons(lessonsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      const selectedLesson = allLessons.find(
        (lesson) => lesson.id === selectedLessonId
      );
      if (selectedLesson) {
        setTitle(selectedLesson.title);
        setContent(selectedLesson.content);
        setQuizzes(selectedLesson.quizzes || []);
      }
    } else {
      setTitle('');
      setContent('');
      setQuizzes([]);
    }
  }, [selectedLessonId, allLessons]);

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/đ/g, 'dj')
      .replace(/š/g, 's')
      .replace(/č/g, 'c')
      .replace(/ć/g, 'c')
      .replace(/ž/g, 'z')
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...mcOptions];
    newOptions[index] = value;
    setMcOptions(newOptions);
  };

  const handleAddQuiz = () => {
    if (!currentQuestion.trim()) {
      alert('Molimo unesite pitanje za kviz.');
      return;
    }

    let newQuiz: Quiz | null = null;
    if (quizType === 'multiple-choice') {
      const filteredOptions = mcOptions.filter(
        (opt) => opt.trim() !== ''
      );
      if (filteredOptions.length < 2 || !correctMcAnswer.trim()) {
        alert(
          'Molimo unesite bar dve opcije i odaberite tačan odgovor.'
        );
        return;
      }
      if (!filteredOptions.includes(correctMcAnswer)) {
        alert('Tačan odgovor mora biti jedna od ponuđenih opcija.');
        return;
      }
      newQuiz = {
        type: 'multiple-choice',
        question: currentQuestion,
        options: filteredOptions,
        correctAnswer: correctMcAnswer,
      };
    } else {
      if (!fibCorrectAnswer.trim()) {
        alert('Molimo unesite tačan odgovor.');
        return;
      }
      newQuiz = {
        type: 'fill-in-the-blank',
        question: currentQuestion,
        correctAnswer: fibCorrectAnswer,
      };
    }

    if (newQuiz) {
      setQuizzes([...quizzes, newQuiz]);
      setCurrentQuestion('');
      setMcOptions(['', '', '', '']);
      setCorrectMcAnswer('');
      setFibCorrectAnswer('');
    }
  };

  const handleRemoveQuiz = (indexToRemove: number) => {
    setQuizzes(quizzes.filter((_, index) => index !== indexToRemove));
  };

  const handleSelectLesson = (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    setSuccess(null);
    setError(null);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!title || !content) {
      setError('Naslov i sadržaj su obavezni.');
      setIsLoading(false);
      return;
    }

    const slug = createSlug(title);
    const lessonData = { title, content, slug, quizzes };

    try {
      if (selectedLessonId) {
        const lessonRef = doc(db, 'lessons', selectedLessonId);
        await updateDoc(
          lessonRef,
          lessonData as { [x: string]: unknown }
        );
        setSuccess('Lekcija je uspešno ažurirana!');
      } else {
        const lessonsCollection = collection(db, 'lessons');
        await addDoc(lessonsCollection, {
          ...lessonData,
          createdAt: Timestamp.now(),
        });
        setSuccess('Lekcija je uspešno dodata!');
        handleSelectLesson(null);
      }
    } catch (err) {
      console.error('Greška pri čuvanju lekcije:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Došlo je do neočekivane greške.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-1/4 bg-white border-r p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <LayoutDashboard /> Admin Panel
        </h1>
        <button
          onClick={() => handleSelectLesson(null)}
          className="w-full mb-4 flex items-center justify-center gap-2 h-10 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          <PlusCircle size={16} /> Nova Lekcija
        </button>
        <nav className="space-y-1">
          {allLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson.id)}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedLessonId === lesson.id
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {lesson.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="w-3/4 p-8 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          <div className="p-8 space-y-6 bg-white rounded-2xl mb-8 border">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Book />
                {selectedLessonId
                  ? 'Izmeni lekciju'
                  : 'Dodaj novu lekciju'}
              </h2>
            </div>

            <form className="space-y-6" onSubmit={handleSaveLesson}>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Naslov lekcije
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sadržaj lekcije
                </label>
                <textarea
                  id="content"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 px-4 py-2 flex items-center justify-center gap-2 text-white bg-green-600 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-green-300"
              >
                {isLoading ? (
                  'Čuvanje...'
                ) : (
                  <>
                    <PlusCircle size={20} /> Sačuvaj lekciju
                  </>
                )}
              </button>
              {error && (
                <p className="text-red-500 text-sm text-center mt-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-500 text-sm text-center mt-2">
                  {success}
                </p>
              )}
            </form>
          </div>

          <div className="p-8 space-y-6 bg-white rounded-2xl  border">
            <h2 className="text-2xl font-bold text-gray-800">
              Kvizovi za lekciju
            </h2>
            <div className="space-y-2">
              {quizzes.map((quiz, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                >
                  <span className="font-medium text-sm">
                    {index + 1}. {quiz.question}
                  </span>
                  <button
                    onClick={() => handleRemoveQuiz(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Još nema dodatih kvizova.
                </p>
              )}
            </div>
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-xl font-semibold">
                Dodaj novi kviz
              </h3>
              <div>
                <label
                  htmlFor="quizType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tip kviza
                </label>
                <select
                  id="quizType"
                  value={quizType}
                  onChange={(e) =>
                    setQuizType(
                      e.target.value as
                        | 'multiple-choice'
                        | 'fill-in-the-blank'
                    )
                  }
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  <option value="multiple-choice">
                    Višestruki izbor
                  </option>
                  <option value="fill-in-the-blank">
                    Popuni prazninu
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="currentQuestion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pitanje
                </label>
                {quizType === 'fill-in-the-blank' && (
                  <small className="text-xs text-gray-500">
                    Koristite ___ da označite prazninu.
                  </small>
                )}
                <input
                  id="currentQuestion"
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md"
                />
              </div>
              {quizType === 'multiple-choice' && (
                <div className="space-y-3">
                  {mcOptions.map((option, index) => (
                    <div key={index}>
                      <label
                        htmlFor={`option-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Opcija {index + 1}
                      </label>
                      <input
                        id={`option-${index}`}
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        className="w-full h-9 px-3 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                  <div>
                    <label
                      htmlFor="correctMcAnswer"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tačan odgovor
                    </label>
                    <select
                      id="correctMcAnswer"
                      value={correctMcAnswer}
                      onChange={(e) =>
                        setCorrectMcAnswer(e.target.value)
                      }
                      className="w-full h-10 px-3 border border-gray-300 rounded-md"
                    >
                      <option value="">
                        Odaberite tačan odgovor
                      </option>
                      {mcOptions
                        .filter((opt) => opt)
                        .map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
              {quizType === 'fill-in-the-blank' && (
                <div>
                  <label
                    htmlFor="fibCorrectAnswer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tačan odgovor
                  </label>
                  <input
                    id="fibCorrectAnswer"
                    type="text"
                    value={fibCorrectAnswer}
                    onChange={(e) =>
                      setFibCorrectAnswer(e.target.value)
                    }
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              <button
                onClick={handleAddQuiz}
                type="button"
                className="w-full h-10 px-4 py-2 flex items-center justify-center gap-2 text-white bg-blue-600 rounded-md font-semibold hover:bg-blue-700"
              >
                Dodaj kviz u lekciju
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
