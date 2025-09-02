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
  PlusCircle,
  LayoutDashboard,
  BookCopy,
  Puzzle,
  Film,
  CheckCircle,
  Mic,
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Lesson,
  LessonWithId,
  LessonBlock,
  TextualLessonBlock,
  VideoLessonBlock,
  LessonContentBlock,
} from '@/types/sprachenwald';

const BLOCK_TYPES = [
  { id: 'text', label: 'Textual Lesson', icon: <BookCopy /> },
  { id: 'grammar', label: 'Grammar', icon: <Puzzle /> },
  { id: 'video', label: 'Video', icon: <Film /> },
  { id: 'quiz', label: 'Quiz', icon: <CheckCircle /> },
  { id: 'vocabulary', label: 'Vocabulary', icon: <Mic /> },
];

const AddLessonDialog = ({
  onSave,
}: {
  onSave: (title: string, selectedBlockTypes: string[]) => void;
}) => {
  const [title, setTitle] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState(
    new Set<string>()
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleBlockTypeToggle = (blockType: string) => {
    const newSelection = new Set(selectedBlocks);
    if (newSelection.has(blockType)) {
      newSelection.delete(blockType);
    } else {
      newSelection.add(blockType);
    }
    setSelectedBlocks(newSelection);
  };

  const handleSubmit = () => {
    onSave(title, Array.from(selectedBlocks));
    setTitle('');
    setSelectedBlocks(new Set());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4">
          <PlusCircle size={16} className="mr-2" /> Nova Lekcija
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Dodaj Novu Lekciju</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label htmlFor="lesson-title">Naslov Lekcije</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Struktura Lekcije (Blokovi)</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {BLOCK_TYPES.map((blockType) => (
                <div
                  key={blockType.id}
                  className="flex items-center space-x-2 p-3 border rounded-md"
                >
                  <Checkbox
                    id={blockType.id}
                    checked={selectedBlocks.has(blockType.id)}
                    onCheckedChange={() =>
                      handleBlockTypeToggle(blockType.id)
                    }
                  />
                  <Label
                    htmlFor={blockType.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {blockType.icon} {blockType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            Sačuvaj Lekciju i Blokove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditTextBlockDialog = ({
  block,
  onSave,
  isOpen,
  onOpenChange,
}: {
  block: TextualLessonBlock;
  onSave: (id: string, data: Partial<LessonBlock>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(block.title);
  const [germanContent, setGermanContent] = useState(() =>
    block.content
      .map((c) =>
        c.type === 'text'
          ? c.german.map((w) => w.german).join(' ')
          : ''
      )
      .join('\n')
  );
  const [serbianContent, setSerbianContent] = useState(() =>
    block.content
      .map((c) => (c.type === 'text' ? c.serbian : ''))
      .join('\n')
  );

  const handleSubmit = () => {
    const content: LessonContentBlock[] = germanContent
      .split('\n')
      .map((germanLine, index) => ({
        type: 'text',
        german: germanLine
          .split(' ')
          .map((word) => ({ german: word, serbian: '...' })),
        serbian: serbianContent.split('\n')[index] || '',
      }));
    onSave(block.id, { title, content });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {block.type} Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="block-title-edit">Block Title</Label>
            <Input
              id="block-title-edit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="german-content-edit">
              German Content
            </Label>
            <Textarea
              id="german-content-edit"
              value={germanContent}
              onChange={(e) => setGermanContent(e.target.value)}
              rows={8}
            />
          </div>
          <div>
            <Label htmlFor="serbian-content-edit">
              Serbian Content
            </Label>
            <Textarea
              id="serbian-content-edit"
              value={serbianContent}
              onChange={(e) => setSerbianContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditVideoBlockDialog = ({
  block,
  onSave,
  isOpen,
  onOpenChange,
}: {
  block: VideoLessonBlock;
  onSave: (id: string, data: Partial<LessonBlock>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(block.title);
  const [videoUrl, setVideoUrl] = useState(block.videoUrl);

  const handleSubmit = () => {
    onSave(block.id, { title, videoUrl });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="block-title-video">Block Title</Label>
            <Input
              id="block-title-video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="block-video-url">Video URL</Label>
            <Input
              id="block-video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({
  block,
  onConfirm,
  isOpen,
  onOpenChange,
}: {
  block: LessonBlock;
  onConfirm: (id: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogDescription>
          This will permanently delete the block {block.title}. This
          action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          variant="destructive"
          onClick={() => onConfirm(block.id)}
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// --- MAIN ADMIN PAGE COMPONENT ---
const AdminPage = () => {
  const [allLessons, setAllLessons] = useState<LessonWithId[]>([]);
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithId | null>(null);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([]);
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
          (doc) => ({ id: doc.id, ...doc.data() } as LessonWithId)
        )
      );
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedLesson) {
      const blocksQuery = query(
        collection(db, 'lessons', selectedLesson.id, 'blocks'),
        orderBy('order', 'asc')
      );
      const unsubscribe = onSnapshot(blocksQuery, (snapshot) => {
        setLessonBlocks(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as LessonBlock)
          )
        );
      });
      return () => unsubscribe();
    } else {
      setLessonBlocks([]);
    }
  }, [selectedLesson]);

  const createSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

  const handleAddLesson = async (
    title: string,
    selectedBlockTypes: string[]
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
      const newBlock = {
        title: blockTitle,
        slug: createSlug(`${title}-${blockTitle}`),
        type: blockType,
        order: index,
        lessonId: lessonRef.id,
        lessonTitle: title,
        content: [],
        quizzes: [],
        videoUrl: '',
        words: [],
      };
      const blockRef = doc(
        collection(db, 'lessons', lessonRef.id, 'blocks')
      );
      batch.set(blockRef, newBlock);
    });
    await batch.commit();
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

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <LayoutDashboard /> Admin Panel
        </h1>
        <AddLessonDialog onSave={handleAddLesson} />
        <nav className="space-y-1">
          {allLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedLesson?.id === lesson.id
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {lesson.order + 1}. {lesson.title}
            </button>
          ))}
        </nav>
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
                {lessonBlocks.length > 0 ? (
                  lessonBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-3 border-b flex justify-between items-center"
                    >
                      <span className="flex items-center gap-2">
                        {
                          BLOCK_TYPES.find((b) => b.id === block.type)
                            ?.icon
                        }
                        {block.order + 1}. {block.title}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBlockToEdit(block)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setBlockToDelete(block)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 py-4">
                    No blocks defined for this lesson. You can define
                    them when creating a new lesson.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500 flex items-center justify-center h-full">
            <p>Select a lesson to see its blocks.</p>
          </div>
        )}

        {blockToEdit &&
          (blockToEdit.type === 'text' ||
            blockToEdit.type === 'grammar') && (
            <EditTextBlockDialog
              isOpen={!!blockToEdit}
              onOpenChange={() => setBlockToEdit(null)}
              block={blockToEdit as TextualLessonBlock}
              onSave={handleUpdateBlock}
            />
          )}
        {blockToEdit && blockToEdit.type === 'video' && (
          <EditVideoBlockDialog
            isOpen={!!blockToEdit}
            onOpenChange={() => setBlockToEdit(null)}
            block={blockToEdit as VideoLessonBlock}
            onSave={handleUpdateBlock}
          />
        )}

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
