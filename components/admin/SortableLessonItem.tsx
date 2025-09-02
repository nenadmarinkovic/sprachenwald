'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit } from 'lucide-react';
import { Button } from '../ui/button';

export function SortableLessonItem({
  id,
  title,
  order,
  onClick,
  isSelected,
  onEdit,
}: {
  id: string;
  title: string;
  order: number;
  onClick: () => void;
  isSelected: boolean;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between my-1 rounded-md transition-colors ${
        isSelected
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <button
        onClick={onClick}
        className="flex-grow text-left px-3 py-2 text-sm font-medium"
      >
        {order + 1}. {title}
      </button>

      <div className="flex items-center pr-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit size={14} />
        </Button>
        <div {...listeners} className="cursor-grab p-2 touch-none">
          <GripVertical size={16} />
        </div>
      </div>
    </div>
  );
}
