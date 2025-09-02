'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LessonBlock } from '@/types/sprachenwald';

export const DeleteConfirmationDialog = ({
  block,
  onConfirm,
  isOpen,
  onOpenChange,
}: {
  block: LessonBlock;
  onConfirm: (id: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(block.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete
            the block titled {block.title}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
