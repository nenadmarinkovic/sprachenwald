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
import { Trash2, PlusCircle } from 'lucide-react';
import {
  LessonBlock,
  VocabularyLessonBlock,
  InteractiveWord,
} from '@/types/sprachenwald';

export const EditVocabularyBlockDialog = ({
  block,
  onSave,
  isOpen,
  onOpenChange,
}: {
  block: VocabularyLessonBlock;
  onSave: (id: string, data: Partial<LessonBlock>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [title, setTitle] = useState(block.title);
  const [words, setWords] = useState<InteractiveWord[]>(
    block.words || []
  );

  const handleWordChange = (
    index: number,
    field: keyof InteractiveWord,
    value: string
  ) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const addWord = () => {
    setWords([
      ...words,
      { german: '', serbian: '', article: '', example: '' },
    ]);
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSave(block.id, { title, words });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Vocabulary Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div>
            <Label htmlFor="block-title-vocab">Block Title</Label>
            <Input
              id="block-title-vocab"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {words.map((word, index) => (
            <div
              key={index}
              className="p-3 border rounded-md space-y-2 relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7"
                onClick={() => removeWord(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>German</Label>
                  <Input
                    value={word.german}
                    onChange={(e) =>
                      handleWordChange(
                        index,
                        'german',
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Serbian</Label>
                  <Input
                    value={word.serbian}
                    onChange={(e) =>
                      handleWordChange(
                        index,
                        'serbian',
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Article</Label>
                  <Input
                    value={word.article}
                    onChange={(e) =>
                      handleWordChange(
                        index,
                        'article',
                        e.target.value
                      )
                    }
                    placeholder="e.g., der, die, das"
                  />
                </div>
                <div>
                  <Label>Example</Label>
                  <Input
                    value={word.example}
                    onChange={(e) =>
                      handleWordChange(
                        index,
                        'example',
                        e.target.value
                      )
                    }
                    placeholder="Example sentence..."
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addWord}>
            <PlusCircle size={16} className="mr-2" /> Add Word
          </Button>
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
