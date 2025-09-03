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

type Props = {
  onSave: (selectedBlockTypes: LessonBlock['type'][]) => void;
  existingBlockTypes?: LessonBlock['type'][];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

export const AddBlockDialog = ({
  onSave,
  existingBlockTypes = [],
  isOpen: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: Props) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [selectedBlocks, setSelectedBlocks] = useState(
    new Set<LessonBlock['type']>()
  );

  const handleBlockTypeToggle = (blockType: LessonBlock['type']) => {
    if (existingBlockTypes.includes(blockType)) return;
    const next = new Set(selectedBlocks);
    if (next.has(blockType)) {
      next.delete(blockType);
    } else {
      next.add(blockType);
    }
    setSelectedBlocks(next);
  };

  const handleSubmit = () => {
    const allowed = Array.from(selectedBlocks).filter(
      (t) => !existingBlockTypes.includes(t)
    );
    if (allowed.length > 0) onSave(allowed);
    setSelectedBlocks(new Set());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="default" size="icon" className="flex w-32">
            <span className="mr-2">Add block</span>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Blocks to Lesson</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <Label>Select Block Types to Add</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {BLOCK_TYPES.map((bt) => {
                const alreadyExists = existingBlockTypes.includes(
                  bt.id
                );
                return (
                  <div
                    key={bt.id}
                    className={`flex items-center space-x-2 p-3 border rounded-md ${
                      alreadyExists
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <Checkbox
                      id={`add-${bt.id}`}
                      checked={selectedBlocks.has(bt.id)}
                      disabled={alreadyExists}
                      onCheckedChange={() =>
                        handleBlockTypeToggle(bt.id)
                      }
                    />
                    <Label
                      htmlFor={`add-${bt.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {bt.icon} {bt.label}
                      {alreadyExists && (
                        <span className="text-xs text-gray-500">
                          (already added)
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
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
