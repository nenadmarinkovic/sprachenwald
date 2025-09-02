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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  PlusCircle,
  BookCopy,
  Puzzle,
  Film,
  CheckCircle as CheckIcon,
  Mic,
} from 'lucide-react';
import { LessonBlock } from '@/types/sprachenwald';

const BLOCK_TYPES = [
  { id: 'text', label: 'Textual Lesson', icon: <BookCopy /> },
  { id: 'grammar', label: 'Grammar', icon: <Puzzle /> },
  { id: 'video', label: 'Video', icon: <Film /> },
  { id: 'quiz', label: 'Quiz', icon: <CheckIcon /> },
  { id: 'vocabulary', label: 'Vocabulary', icon: <Mic /> },
] as const satisfies ReadonlyArray<{
  id: LessonBlock['type'];
  label: string;
  icon: React.ReactNode;
}>;

export const AddBlockDialog = ({
  onSave,
}: {
  onSave: (selectedBlockTypes: LessonBlock['type'][]) => void;
}) => {
  const [selectedBlocks, setSelectedBlocks] = useState(
    new Set<LessonBlock['type']>()
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleBlockTypeToggle = (blockType: LessonBlock['type']) => {
    const next = new Set(selectedBlocks);
    if (next.has(blockType)) next.delete(blockType);
    else next.add(blockType);
    setSelectedBlocks(next);
  };

  const handleSubmit = () => {
    onSave(Array.from(selectedBlocks));
    setSelectedBlocks(new Set());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="flex w-32 cursor-pointer"
        >
          <span>Add block</span>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Blocks to Lesson</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label>Select Block Types to Add</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {BLOCK_TYPES.map((blockType) => (
                <div
                  key={blockType.id}
                  className="flex items-center space-x-2 p-3 border rounded-md"
                >
                  <Checkbox
                    id={`add-${blockType.id}`}
                    checked={selectedBlocks.has(blockType.id)}
                    onCheckedChange={() =>
                      handleBlockTypeToggle(blockType.id)
                    }
                  />
                  <Label
                    htmlFor={`add-${blockType.id}`}
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
          <Button onClick={handleSubmit}>Add Selected Blocks</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
