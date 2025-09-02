'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LessonBlock } from '@/types/sprachenwald';

export function SortableBlockItem({
  block,
  onEdit,
  onRemove,
}: {
  block: LessonBlock;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-3 border-b flex justify-between items-center bg-white"
    >
      <div className="flex items-center gap-2">
        <div {...listeners} className="cursor-grab p-1 touch-none">
          <GripVertical size={16} />
        </div>
        <span>
          {block.order + 1}. {block.title} ({block.type})
        </span>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
