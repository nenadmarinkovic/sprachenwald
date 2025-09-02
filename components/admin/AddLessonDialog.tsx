'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  PlusCircle,
  BookCopy,
  Puzzle,
  Film,
  CheckCircle,
  Mic,
} from 'lucide-react';
import { LessonBlock } from '@/types/sprachenwald';

const BLOCK_TYPES = [
  { id: 'text', label: 'Textual Lesson', icon: <BookCopy /> },
  { id: 'grammar', label: 'Grammar', icon: <Puzzle /> },
  { id: 'video', label: 'Video', icon: <Film /> },
  { id: 'quiz', label: 'Quiz', icon: <CheckCircle /> },
  { id: 'vocabulary', label: 'Vocabulary', icon: <Mic /> },
];

export const AddLessonDialog = ({
  onSave,
}: {
  onSave: (
    title: string,
    selectedBlockTypes: LessonBlock['type'][]
  ) => void;
}) => {
  const [title, setTitle] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState(
    new Set<LessonBlock['type']>()
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleBlockTypeToggle = (blockType: LessonBlock['type']) => {
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
                    checked={selectedBlocks.has(
                      blockType.id as LessonBlock['type']
                    )}
                    onCheckedChange={() =>
                      handleBlockTypeToggle(
                        blockType.id as LessonBlock['type']
                      )
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
