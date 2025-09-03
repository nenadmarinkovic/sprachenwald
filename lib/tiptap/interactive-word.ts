// lib/tiptap/interactive-word.ts
import {
  Mark,
  mergeAttributes,
  InputRule,
  PasteRule,
} from '@tiptap/core';

export type PartOfSpeech =
  | 'imenica'
  | 'glagol'
  | 'pridev'
  | 'prilog'
  | 'zamenica'
  | 'predlog'
  | 'veznik'
  | 'ostalo';
export type Padez =
  | 'nominativ'
  | 'genitiv'
  | 'dativ'
  | 'akuzativ'
  | '';

export interface InteractiveWordAttributes {
  german?: string | null;
  prevod?: string | null;
  tip?: PartOfSpeech | null;
  note?: string | null;
  padez?: Padez | null;
  clan?: string | null;
  glagol?: 'true' | 'false' | null;
  slug?: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    interactiveWord: {
      setInteractiveWord: (
        attrs?: InteractiveWordAttributes
      ) => ReturnType;
      toggleInteractiveWord: (
        attrs?: InteractiveWordAttributes
      ) => ReturnType;
      unsetInteractiveWord: () => ReturnType;
      setInteractiveWordFromSelection: () => ReturnType;
    };
  }
}

const slugify = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const InteractiveWordExtension =
  Mark.create<InteractiveWordAttributes>({
    name: 'interactiveWord',

    inclusive() {
      return false;
    },

    addAttributes() {
      return {
        german: { default: null },
        prevod: { default: null },
        tip: { default: null },
        note: { default: null },
        padez: { default: null },
        clan: { default: null },
        glagol: { default: null },
        slug: { default: null },
      };
    },

    parseHTML() {
      return [
        {
          tag: 'span[data-interactive-word="true"]',
          getAttrs: (el) => {
            if (typeof el === 'string') return false;
            const german = el.getAttribute('data-german');
            const prevod = el.getAttribute('data-prevod');
            const tip = el.getAttribute(
              'data-tip'
            ) as PartOfSpeech | null;
            const note = el.getAttribute('data-note');
            const padez = el.getAttribute(
              'data-padez'
            ) as Padez | null;
            const clan = el.getAttribute('data-clan');
            const glagol = el.getAttribute('data-glagol') as
              | 'true'
              | 'false'
              | null;
            const slug = el.getAttribute('data-slug');
            return {
              german,
              prevod,
              tip,
              note,
              padez,
              clan,
              glagol,
              slug,
            };
          },
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      const german = (HTMLAttributes.german as string | null) ?? '';
      const slug =
        (HTMLAttributes.slug as string | null) ??
        (german ? slugify(german) : '');

      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-interactive-word': 'true',
          'data-german': german || '',
          'data-prevod':
            (HTMLAttributes.prevod as string | null) || '',
          'data-tip': (HTMLAttributes.tip as string | null) || '',
          'data-note': (HTMLAttributes.note as string | null) || '',
          'data-padez': (HTMLAttributes.padez as string | null) || '',
          'data-clan': (HTMLAttributes.clan as string | null) || '',
          'data-glagol':
            (HTMLAttributes.glagol as string | null) || '',
          'data-slug': slug || '',
        }),
        0,
      ];
    },

    addInputRules() {
      return [
        new InputRule({
          find: /\[\[([^\]]+)\]\]$/,
          handler: ({ state, range, match, commands }) => {
            const word = (match[1] || '').trim();
            if (!word) return;
            state.tr.insertText(word, range.from, range.to);
            commands.setTextSelection({
              from: range.from,
              to: range.from + word.length,
            });
            commands.setInteractiveWord({
              german: word,
              slug: slugify(word),
            });
          },
        }),
      ];
    },

    addPasteRules() {
      return [
        new PasteRule({
          find: /\[\[([^\]]+)\]\]/g,
          handler: ({ state, range, match, commands }) => {
            const word = (match[1] || '').trim();
            if (!word) return;
            state.tr.insertText(word, range.from, range.to);
            commands.setTextSelection({
              from: range.from,
              to: range.from + word.length,
            });
            commands.setInteractiveWord({
              german: word,
              slug: slugify(word),
            });
          },
        }),
      ];
    },

    addCommands() {
      return {
        setInteractiveWord:
          (attrs) =>
          ({ commands }) => {
            const withSlug =
              attrs?.german && !attrs.slug
                ? { ...attrs, slug: slugify(attrs.german) }
                : attrs;
            return commands.setMark(this.name, withSlug);
          },

        toggleInteractiveWord:
          (attrs) =>
          ({ commands }) => {
            const withSlug =
              attrs?.german && !attrs.slug
                ? { ...attrs, slug: slugify(attrs.german) }
                : attrs;
            return commands.toggleMark(this.name, withSlug);
          },

        unsetInteractiveWord:
          () =>
          ({ commands }) =>
            commands.unsetMark(this.name),

        setInteractiveWordFromSelection:
          () =>
          ({ state, commands }) => {
            const { from, to } = state.selection;
            const text = state.doc.textBetween(from, to).trim();
            if (!text) return false;
            return commands.setMark(this.name, {
              german: text,
              slug: slugify(text),
            });
          },
      };
    },
  });
