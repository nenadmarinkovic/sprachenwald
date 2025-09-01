import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableLessonItem({
  id,
  title,
  onClick,
  isSelected,
  order,
}: {
  id: string;
  title: string;
  onClick: () => void;
  isSelected: boolean;
  order: number;
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
      className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isSelected
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <button
        onClick={onClick}
        className="flex-grow text-left flex items-center gap-2"
      >
        <span className="font-mono text-xs text-gray-500">
          {order + 1}.
        </span>
        <span>{title}</span>
      </button>
      <div {...listeners} className="cursor-grab p-1 touch-none">
        <GripVertical size={16} />
      </div>
    </div>
  );
}
