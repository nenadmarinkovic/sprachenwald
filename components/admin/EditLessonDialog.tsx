'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LessonWithId } from '@/types/sprachenwald';

export const EditLessonDialog = ({
  lesson,
  isOpen,
  onOpenChange,
  onSave,
}: {
  lesson: LessonWithId;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lessonId: string, title: string) => void;
}) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
    }
  }, [lesson]);

  const handleSubmit = () => {
    onSave(lesson.id, title);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="lesson-title-edit">Lesson Title</Label>
          <Input
            id="lesson-title-edit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
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
