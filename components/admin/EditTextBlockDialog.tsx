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
import { Textarea } from '@/components/ui/textarea';
import {
  LessonBlock,
  TextualLessonBlock,
  LessonContentBlock,
  GrammarLessonBlock,
} from '@/types/sprachenwald';

export const EditTextBlockDialog = ({
  block,
  onSave,
  isOpen,
  onOpenChange,
}: {
  block: TextualLessonBlock | GrammarLessonBlock;
  onSave: (id: string, data: Partial<LessonBlock>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState('');
  const [germanContent, setGermanContent] = useState('');
  const [serbianContent, setSerbianContent] = useState('');

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setGermanContent(
        block.content
          .map((c) =>
            c.type === 'text'
              ? c.german.map((w) => w.german).join(' ')
              : ''
          )
          .join('\n')
      );
      setSerbianContent(
        block.content
          .map((c) => (c.type === 'text' ? c.serbian : ''))
          .join('\n')
      );
    }
  }, [block]);

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
