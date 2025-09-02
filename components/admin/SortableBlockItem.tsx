'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
