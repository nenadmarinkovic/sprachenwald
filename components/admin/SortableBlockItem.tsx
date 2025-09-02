'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { BlockContentPreview } from './BlockContentPreview';

export function SortableAccordionBlockItem({
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
    <div ref={setNodeRef} style={style} {...attributes}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={block.id} className="bg-white">
          <div className="flex items-center justify-between pr-4">
            <AccordionTrigger className="flex-grow">
              <div className="flex items-center gap-2">
                <div
                  {...listeners}
                  className="cursor-grab p-2 touch-none"
                >
                  <GripVertical size={16} />
                </div>
                <span>
                  {block.order + 1}. {block.title} ({block.type})
                </span>
              </div>
            </AccordionTrigger>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-2"
                >
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
                  Edit Content
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Block
                </Button>
              </PopoverContent>
            </Popover>
          </div>
          <AccordionContent>
            <BlockContentPreview block={block} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
