'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { UIWord } from '@/lib/htmlInteractive';

export default function InteractiveWordPopover({
  word,
  highlighted,
}: {
  word: UIWord;
  highlighted: boolean;
}) {
  const pill = (label: string) => (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
      {label}
    </span>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={
            highlighted
              ? 'cursor-pointer rounded px-1 bg-yellow-100 ring-1 ring-yellow-300'
              : 'cursor-pointer'
          }
        >
          {word.german}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-72 z-50">
        <div className="space-y-2">
          <div className="text-lg font-semibold">{word.german}</div>
          {word.prevod && (
            <div>
              <span className="text-muted-foreground text-xs">
                Prevod:{' '}
              </span>
              <span className="font-medium">{word.prevod}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {word.tip && pill(`Tip: ${word.tip}`)}
            {word.padez && pill(`Padež: ${word.padez}`)}
            {word.clan && pill(`Član: ${word.clan}`)}
            {word.glagol && pill('Glagol')}
          </div>
          {word.note && (
            <div className="text-sm text-muted-foreground">
              {word.note}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
