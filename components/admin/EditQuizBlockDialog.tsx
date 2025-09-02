'use client';
import React, { useState } from 'react';
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
import { LessonBlock, QuizLessonBlock } from '@/types/sprachenwald';
import { AddQuizDialog } from '@/components/AddQuizDialog';

export const EditQuizBlockDialog = ({
  block,
  onSave,
  isOpen,
  onOpenChange,
}: {
  block: QuizLessonBlock;
  onSave: (id: string, data: Partial<LessonBlock>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(block.title);

  const handleSubmit = () => {
    onSave(block.id, { title });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="block-title-quiz">Block Title</Label>
            <Input
              id="block-title-quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="p-4 border rounded-md">
            <h4 className="font-medium mb-2">Manage Questions</h4>
            {block.quizzes?.map((quiz, index) => (
              <div key={index} className="text-sm p-2 border-b">
                {index + 1}. {quiz.question}
              </div>
            ))}
            {(!block.quizzes || block.quizzes.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No quizzes yet.
              </p>
            )}
            <AddQuizDialog
              lessonId={block.lessonId}
              currentQuizzes={block.quizzes || []}
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
