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
import {
  Lesson,
  LessonWithId,
  InteractiveWord,
} from '@/types/sprachenwald';
import { AddQuizDialog } from '@/components/AddQuizDialog';

const AdminPage = () => {
  const [allLessons, setAllLessons] = useState<LessonWithId[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<
    string | null
  >(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

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

  const selectedLesson = allLessons.find(
    (lesson) => lesson.id === selectedLessonId
  );

  useEffect(() => {
    if (selectedLesson) {
      setTitle(selectedLesson.title);
      setContent(JSON.stringify(selectedLesson.content, null, 2));
    } else {
      setTitle('');
      setContent(
        JSON.stringify(
          [
            {
              type: 'text',
              german: [
                { german: 'Beispiel', serbian: 'Primer', info: 'n.' },
              ],
              serbian: 'Primer recenice.',
            },
          ],
          null,
          2
        )
      );
    }
  }, [selectedLesson]);

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

  const handleOpenLessonDialog = (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
    setError(null);
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

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      setError('Sadržaj nije validan JSON format.');
      setIsLoading(false);
      return;
    }

    const slug = createSlug(title);
    const isEditing = !!selectedLessonId;
    const currentLesson = allLessons.find(
      (l) => l.id === selectedLessonId
    );

    const vocabulary: Omit<InteractiveWord, 'info'>[] = [];
    if (Array.isArray(parsedContent)) {
      parsedContent.forEach((block) => {
        if (block.type === 'text' && Array.isArray(block.german)) {
          block.german.forEach((word: InteractiveWord) => {
            vocabulary.push({
              german: word.german,
              serbian: word.serbian,
            });
          });
        }
      });
    }

    const uniqueVocabulary = Array.from(
      new Map(vocabulary.map((item) => [item.german, item])).values()
    );

    const lessonData: Partial<Lesson> = {
      title,
      content: parsedContent,
      slug,
      vocabulary: uniqueVocabulary,
      quizzes: isEditing ? currentLesson?.quizzes ?? [] : [],
      order: isEditing
        ? currentLesson?.order ?? allLessons.length
        : allLessons.length,
    };

    try {
      if (isEditing) {
        const lessonRef = doc(db, 'lessons', selectedLessonId);
        await updateDoc(lessonRef, lessonData);
      } else {
        await addDoc(collection(db, 'lessons'), {
          ...lessonData,
          createdAt: Timestamp.now(),
        });
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
                Unesite detalje za lekciju ovde. Sadržaj mora biti u
                JSON formatu.
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
                <Label htmlFor="content">
                  Sadržaj lekcije (JSON)
                </Label>
                <Textarea
                  id="content"
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="font-mono text-sm"
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
          {selectedLesson ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Kvizovi za: {selectedLesson.title}
                </CardTitle>
                <CardDescription>
                  Dodajte i upravljajte kvizovima za ovu lekciju.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedLesson.quizzes?.map((quiz, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium text-sm">
                      {index + 1}. {quiz.question}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {(!selectedLesson.quizzes ||
                  selectedLesson.quizzes.length === 0) && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Još nema dodatih kvizova.
                  </p>
                )}
                <AddQuizDialog
                  lessonId={selectedLessonId}
                  currentQuizzes={selectedLesson.quizzes || []}
                />
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
