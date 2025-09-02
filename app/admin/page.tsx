'use client';
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  LayoutDashboard,
  BookCopy,
  Puzzle,
  Film,
  CheckCircle,
  Mic,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  Lesson,
  LessonWithId,
  LessonBlock,
  TextualLessonBlock,
  VideoLessonBlock,
  QuizLessonBlock,
  VocabularyLessonBlock,
  GrammarLessonBlock,
} from '@/types/sprachenwald';

import {
  DndContext,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableLessonItem } from '@/components/admin/SortableLessonItem';
import { AddLessonDialog } from '@/components/admin/AddLessonDialog';
import { EditLessonDialog } from '@/components/admin/EditLessonDialog';
import { EditTextBlockDialog } from '@/components/admin/EditTextBlockDialog';
import { EditVideoBlockDialog } from '@/components/admin/EditVideoBlockDialog';
import { EditQuizBlockDialog } from '@/components/admin/EditQuizBlockDialog';
import { EditVocabularyBlockDialog } from '@/components/admin/EditVocabularyBlockDialog';
import { DeleteConfirmationDialog } from '@/components/admin/DeleteConfirmationDialog';
import { SortableBlockItem } from '@/components/admin/SortableBlockItem';

const BLOCK_TYPES: Array<{
  id: LessonBlock['type'];
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'text', label: 'Textual Lesson', icon: <BookCopy /> },
  { id: 'grammar', label: 'Grammar', icon: <Puzzle /> },
  { id: 'video', label: 'Video', icon: <Film /> },
  { id: 'quiz', label: 'Quiz', icon: <CheckCircle /> },
  { id: 'vocabulary', label: 'Vocabulary', icon: <Mic /> },
];

const createSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

type NewTextual = Omit<TextualLessonBlock, 'id'>;
type NewQuiz = Omit<QuizLessonBlock, 'id'>;
type NewVideo = Omit<VideoLessonBlock, 'id'>;
type NewGrammar = Omit<GrammarLessonBlock, 'id'>;
type NewVocabulary = Omit<VocabularyLessonBlock, 'id'>;

type NewLessonBlockUnion =
  | NewTextual
  | NewQuiz
  | NewVideo
  | NewGrammar
  | NewVocabulary;

function buildNewBlock(params: {
  blockType: LessonBlock['type'];
  lessonId: string;
  lessonTitle: string;
  order: number;
  title: string;
  slug: string;
}): NewLessonBlockUnion {
  const { blockType, lessonId, lessonTitle, order, title, slug } =
    params;
  const base = { title, slug, order, lessonId, lessonTitle };

  switch (blockType) {
    case 'text':
      return {
        ...base,
        type: 'text',
        content: [],
      } satisfies NewTextual;

    case 'grammar':
      return {
        ...base,
        type: 'grammar',
        content: [],
      } satisfies NewGrammar;

    case 'quiz':
      return {
        ...base,
        type: 'quiz',
        quizzes: [],
      } satisfies NewQuiz;

    case 'video':
      return {
        ...base,
        type: 'video',
        videoUrl: '',
        description: '',
      } satisfies NewVideo;

    case 'vocabulary':
      return {
        ...base,
        type: 'vocabulary',
        words: [],
      } satisfies NewVocabulary;
  }
}

const AdminPage = () => {
  const [allLessons, setAllLessons] = useState<LessonWithId[]>([]);
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithId | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([]);
  const [lessonToEdit, setLessonToEdit] =
    useState<LessonWithId | null>(null);
  const [blockToEdit, setBlockToEdit] = useState<LessonBlock | null>(
    null
  );
  const [blockToDelete, setBlockToDelete] =
    useState<LessonBlock | null>(null);

  useEffect(() => {
    const lessonsQuery = query(
      collection(db, 'lessons'),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(lessonsQuery, (snapshot) => {
      setAllLessons(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as LessonWithId)
        )
      );
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedLesson) {
      setLessonBlocks([]);
      return;
    }
    const blocksQuery = query(
      collection(db, 'lessons', selectedLesson.id, 'blocks'),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(blocksQuery, (snapshot) => {
      setLessonBlocks(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as LessonBlock)
        )
      );
    });
    return () => unsubscribe();
  }, [selectedLesson]);

  const handleAddLesson = async (
    title: string,
    selectedBlockTypes: LessonBlock['type'][]
  ) => {
    if (!title.trim()) return;

    const newLessonData: Lesson = {
      title,
      slug: createSlug(title),
      order: allLessons.length,
      createdAt: Timestamp.now(),
    };

    const lessonRef = await addDoc(
      collection(db, 'lessons'),
      newLessonData
    );

    const batch = writeBatch(db);
    selectedBlockTypes.forEach((blockType, index) => {
      const blockInfo = BLOCK_TYPES.find((b) => b.id === blockType)!;
      const blockTitle = blockInfo.label;

      const payload = buildNewBlock({
        blockType,
        lessonId: lessonRef.id,
        lessonTitle: title,
        order: index,
        title: blockTitle,
        slug: createSlug(`${title}-${blockTitle}`),
      });

      const blockRef = doc(
        collection(db, 'lessons', lessonRef.id, 'blocks')
      );
      batch.set(blockRef, payload);
    });

    await batch.commit();
  };

  const handleAddBlock = async (blockType: LessonBlock['type']) => {
    if (!selectedLesson) return;

    const blockInfo = BLOCK_TYPES.find((b) => b.id === blockType)!;
    const blockTitle = prompt(
      `Enter title for new ${blockInfo.label}:`,
      blockInfo.label
    );
    if (!blockTitle) return;

    const payload = buildNewBlock({
      blockType,
      lessonId: selectedLesson.id,
      lessonTitle: selectedLesson.title,
      order: lessonBlocks.length,
      title: blockTitle,
      slug: createSlug(`${selectedLesson.title}-${blockTitle}`),
    });

    await addDoc(
      collection(db, 'lessons', selectedLesson.id, 'blocks'),
      payload
    );
  };

  const handleUpdateLesson = async (
    lessonId: string,
    title: string
  ) => {
    const slug = createSlug(title);
    await updateDoc(doc(db, 'lessons', lessonId), { title, slug });
    setLessonToEdit(null);
  };

  const handleUpdateBlock = async (
    blockId: string,
    data: Partial<LessonBlock>
  ) => {
    if (!selectedLesson) return;
    const blockRef = doc(
      db,
      'lessons',
      selectedLesson.id,
      'blocks',
      blockId
    );
    await updateDoc(blockRef, data);
    setBlockToEdit(null);
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!selectedLesson) return;
    await deleteDoc(
      doc(db, 'lessons', selectedLesson.id, 'blocks', blockId)
    );
    setBlockToDelete(null);
  };

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = allLessons.findIndex(
        (l) => l.id === active.id
      );
      const newIndex = allLessons.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(allLessons, oldIndex, newIndex);
      setAllLessons(newOrder);

      const batch = writeBatch(db);
      newOrder.forEach((lesson, index) => {
        batch.update(doc(db, 'lessons', lesson.id), { order: index });
      });
      await batch.commit();
    }
  };

  const handleBlockDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (selectedLesson && over && active.id !== over.id) {
      const oldIndex = lessonBlocks.findIndex(
        (b) => b.id === active.id
      );
      const newIndex = lessonBlocks.findIndex(
        (b) => b.id === over.id
      );
      const newOrder = arrayMove(lessonBlocks, oldIndex, newIndex);
      setLessonBlocks(newOrder);

      const batch = writeBatch(db);
      newOrder.forEach((block, index) => {
        batch.update(
          doc(db, 'lessons', selectedLesson.id, 'blocks', block.id),
          { order: index }
        );
      });
      await batch.commit();
    }
  };

  const renderEditDialog = () => {
    if (!blockToEdit) return null;
    switch (blockToEdit.type) {
      case 'text':
      case 'grammar':
        return (
          <EditTextBlockDialog
            isOpen={!!blockToEdit}
            onOpenChange={() => setBlockToEdit(null)}
            block={
              blockToEdit as TextualLessonBlock | GrammarLessonBlock
            }
            onSave={handleUpdateBlock}
          />
        );
      case 'video':
        return (
          <EditVideoBlockDialog
            isOpen={!!blockToEdit}
            onOpenChange={() => setBlockToEdit(null)}
            block={blockToEdit as VideoLessonBlock}
            onSave={handleUpdateBlock}
          />
        );
      case 'vocabulary':
        return (
          <EditVocabularyBlockDialog
            isOpen={!!blockToEdit}
            onOpenChange={() => setBlockToEdit(null)}
            block={blockToEdit as VocabularyLessonBlock}
            onSave={handleUpdateBlock}
          />
        );
      case 'quiz':
        return (
          <EditQuizBlockDialog
            isOpen={!!blockToEdit}
            onOpenChange={() => setBlockToEdit(null)}
            block={blockToEdit as QuizLessonBlock}
            onSave={handleUpdateBlock}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <LayoutDashboard /> Admin Panel
        </h1>
        <AddLessonDialog onSave={handleAddLesson} />
        <div className="flex-grow overflow-y-auto">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={allLessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {allLessons.map((lesson) => (
                <SortableLessonItem
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  onClick={() => setSelectedLesson(lesson)}
                  isSelected={selectedLesson?.id === lesson.id}
                  order={lesson.order}
                  onEdit={() => setLessonToEdit(lesson)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </aside>

      <main className="w-full md:w-2/3 lg:w-3/4 p-8 overflow-y-auto">
        {selectedLesson ? (
          <div>
            <h2 className="text-3xl font-bold mb-4">
              {selectedLesson.title}
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Lesson Blocks</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleBlockDragEnd}
                >
                  <SortableContext
                    items={lessonBlocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {lessonBlocks.map((block) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        onEdit={() => setBlockToEdit(block)}
                        onRemove={() => setBlockToDelete(block)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {lessonBlocks.length === 0 && (
                  <p className="text-gray-500 py-4 text-center">
                    No blocks defined for this lesson.
                  </p>
                )}

                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">
                    Add New Block to {selectedLesson.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((blockType) => (
                      <Button
                        key={blockType.id}
                        variant="outline"
                        onClick={() => handleAddBlock(blockType.id)}
                      >
                        {blockType.icon}
                        <span className="ml-2">
                          {blockType.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500 flex items-center justify-center h-full">
            <p>Select a lesson to see its blocks.</p>
          </div>
        )}

        {lessonToEdit && (
          <EditLessonDialog
            isOpen={!!lessonToEdit}
            onOpenChange={() => setLessonToEdit(null)}
            lesson={lessonToEdit}
            onSave={handleUpdateLesson}
          />
        )}

        {renderEditDialog()}

        {blockToDelete && (
          <DeleteConfirmationDialog
            isOpen={!!blockToDelete}
            onOpenChange={() => setBlockToDelete(null)}
            block={blockToDelete}
            onConfirm={handleDeleteBlock}
          />
        )}
      </main>
    </div>
  );
};

export default AdminPage;
