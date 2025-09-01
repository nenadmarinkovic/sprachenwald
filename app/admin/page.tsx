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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlusCircle, Trash2, LayoutDashboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SortableLessonItem } from '@/components/SortableLessonItem';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { DndContextProvider } from '@/context/DnDContextProvider';

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
  order: number;
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
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

  useEffect(() => {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      orderBy('order', 'asc')
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allLessons.findIndex(
        (lesson) => lesson.id === active.id
      );
      const newIndex = allLessons.findIndex(
        (lesson) => lesson.id === over.id
      );
      const newOrder = arrayMove(allLessons, oldIndex, newIndex);
      setAllLessons(newOrder);

      const batch = writeBatch(db);
      newOrder.forEach((lesson, index) => {
        const lessonRef = doc(db, 'lessons', lesson.id);
        batch.update(lessonRef, { order: index });
      });
      await batch.commit();
    }
  };

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

  const handleAddQuiz = async () => {
    if (!currentQuestion.trim() || !selectedLessonId) return;

    let newQuiz: Quiz | null = null;
    if (quizType === 'multiple-choice') {
      const filteredOptions = mcOptions.filter(
        (opt) => opt.trim() !== ''
      );
      if (
        filteredOptions.length < 2 ||
        !correctMcAnswer.trim() ||
        !filteredOptions.includes(correctMcAnswer)
      ) {
        alert(
          'Please provide at least two options and select a valid correct answer.'
        );
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
        alert('Please provide a correct answer.');
        return;
      }
      newQuiz = {
        type: 'fill-in-the-blank',
        question: currentQuestion,
        correctAnswer: fibCorrectAnswer,
      };
    }

    if (newQuiz) {
      const updatedQuizzes = [...quizzes, newQuiz];
      const lessonRef = doc(db, 'lessons', selectedLessonId);
      await updateDoc(lessonRef, { quizzes: updatedQuizzes });

      setQuizzes(updatedQuizzes);
      setCurrentQuestion('');
      setMcOptions(['', '', '', '']);
      setCorrectMcAnswer('');
      setFibCorrectAnswer('');
      setIsQuizDialogOpen(false);
    }
  };

  const handleRemoveQuiz = async (indexToRemove: number) => {
    if (!selectedLessonId) return;
    const updatedQuizzes = quizzes.filter(
      (_, index) => index !== indexToRemove
    );
    const lessonRef = doc(db, 'lessons', selectedLessonId);
    await updateDoc(lessonRef, { quizzes: updatedQuizzes });
    setQuizzes(updatedQuizzes);
  };

  const handleOpenLessonDialog = (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    setError(null);
    setSuccess(null);
    if (!lessonId) {
      setTitle('');
      setContent('');
      setQuizzes([]);
    }
    setIsLessonDialogOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Naslov i sadržaj su obavezni.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const slug = createSlug(title);
    const isEditing = !!selectedLessonId;
    const currentLesson = allLessons.find(
      (l) => l.id === selectedLessonId
    );

    const lessonData = {
      title,
      content,
      slug,
      quizzes: isEditing ? currentLesson?.quizzes ?? [] : [],
      order: isEditing
        ? currentLesson?.order ?? allLessons.length
        : allLessons.length,
    };

    try {
      if (isEditing) {
        const lessonRef = doc(db, 'lessons', selectedLessonId);
        await updateDoc(lessonRef, lessonData);
        setSuccess('Lekcija je uspešno ažurirana!');
      } else {
        await addDoc(collection(db, 'lessons'), {
          ...lessonData,
          createdAt: Timestamp.now(),
        });
        setSuccess('Lekcija je uspešno dodata!');
      }
      setIsLessonDialogOpen(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Došlo je do greške.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLessonForQuiz = allLessons.find(
    (l) => l.id === selectedLessonId
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard /> Admin
          </h1>
        </div>

        <Dialog
          open={isLessonDialogOpen}
          onOpenChange={setIsLessonDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenLessonDialog(null)}
              className="w-full mb-4"
            >
              <PlusCircle size={16} className="mr-2" /> Nova Lekcija
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {selectedLessonId
                  ? 'Izmeni lekciju'
                  : 'Dodaj novu lekciju'}
              </DialogTitle>
              <DialogDescription>
                Unesite detalje za lekciju ovde.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4 py-4"
              onSubmit={handleSaveLesson}
            >
              <div className="space-y-2">
                <Label htmlFor="title">Naslov lekcije</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Sadržaj lekcije</Label>
                <Textarea
                  id="content"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Čuvanje...' : 'Sačuvaj lekciju'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <DndContextProvider
          onDragEnd={handleDragEnd}
          items={allLessons}
        >
          <nav className="space-y-1">
            {allLessons.map((lesson) => (
              <SortableLessonItem
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                order={lesson.order}
                onClick={() => handleOpenLessonDialog(lesson.id)}
                isSelected={selectedLessonId === lesson.id}
              />
            ))}
          </nav>
        </DndContextProvider>
      </aside>

      <main className="w-full md:w-2/3 lg:w-3/4 p-8 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto">
          {selectedLessonForQuiz ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Kvizovi za: {selectedLessonForQuiz.title}
                </CardTitle>
                <CardDescription>
                  Dodajte i upravljajte kvizovima za ovu lekciju.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium text-sm">
                      {index + 1}. {quiz.question}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuiz(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Još nema dodatih kvizova.
                  </p>
                )}
                <Dialog
                  open={isQuizDialogOpen}
                  onOpenChange={setIsQuizDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <PlusCircle size={16} className="mr-2" /> Dodaj
                      novi kviz
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dodaj novi kviz</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="quizType">Tip kviza</Label>
                        <Select
                          onValueChange={(
                            value:
                              | 'multiple-choice'
                              | 'fill-in-the-blank'
                          ) => setQuizType(value)}
                          defaultValue={quizType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Izaberite tip" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">
                              Višestruki izbor
                            </SelectItem>
                            <SelectItem value="fill-in-the-blank">
                              Popuni prazninu
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentQuestion">
                          Pitanje
                        </Label>
                        {quizType === 'fill-in-the-blank' && (
                          <p className="text-xs text-muted-foreground">
                            Koristite ___ da označite prazninu.
                          </p>
                        )}
                        <Input
                          id="currentQuestion"
                          value={currentQuestion}
                          onChange={(e) =>
                            setCurrentQuestion(e.target.value)
                          }
                        />
                      </div>

                      {quizType === 'multiple-choice' && (
                        <div className="space-y-3">
                          {mcOptions.map((option, index) => (
                            <div key={index} className="space-y-2">
                              <Label htmlFor={`option-${index}`}>
                                Opcija {index + 1}
                              </Label>
                              <Input
                                id={`option-${index}`}
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(
                                    index,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                          <div className="space-y-2">
                            <Label htmlFor="correctMcAnswer">
                              Tačan odgovor
                            </Label>
                            <Select
                              onValueChange={setCorrectMcAnswer}
                              value={correctMcAnswer}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Odaberite tačan odgovor" />
                              </SelectTrigger>
                              <SelectContent>
                                {mcOptions
                                  .filter((opt) => opt)
                                  .map((opt, i) => (
                                    <SelectItem key={i} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {quizType === 'fill-in-the-blank' && (
                        <div className="space-y-2">
                          <Label htmlFor="fibCorrectAnswer">
                            Tačan odgovor
                          </Label>
                          <Input
                            id="fibCorrectAnswer"
                            value={fibCorrectAnswer}
                            onChange={(e) =>
                              setFibCorrectAnswer(e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button onClick={handleAddQuiz} type="button">
                        Dodaj kviz
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">
              <p>Izaberite lekciju da vidite detalje i kvizove.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
