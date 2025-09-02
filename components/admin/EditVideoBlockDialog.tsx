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
import { LessonBlock, VideoLessonBlock } from '@/types/sprachenwald';

export const EditVideoBlockDialog = ({
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
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setVideoUrl(block.videoUrl);
    }
  }, [block]);

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
