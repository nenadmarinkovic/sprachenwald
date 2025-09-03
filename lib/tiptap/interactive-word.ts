// extensions/interactive-word.ts
import {
  Mark,
  mergeAttributes,
  InputRule,
  PasteRule,
} from '@tiptap/core';

export type PartOfSpeech = 'imenica' | 'glagol' | 'pridev' | 'ostalo';

export interface InteractiveWordAttributes {
  german?: string | null;
  serbian?: string | null;
  article?: string | null;
  partOfSpeech?: PartOfSpeech | null;
  info?: string | null;
  example?: string | null;
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
        serbian: { default: null },
        article: { default: null },
        partOfSpeech: { default: null },
        info: { default: null },
        example: { default: null },
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
            const serbian = el.getAttribute('data-serbian');
            const article = el.getAttribute('data-article');
            const partOfSpeech = el.getAttribute(
              'data-part-of-speech'
            ) as PartOfSpeech | null;
            const info = el.getAttribute('data-info');
            const example = el.getAttribute('data-example');
            const slug = el.getAttribute('data-slug');
            return {
              german,
              serbian,
              article,
              partOfSpeech,
              info,
              example,
              slug,
            };
          },
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      const pos =
        (HTMLAttributes.partOfSpeech as PartOfSpeech | null) ?? null;
      const german = (HTMLAttributes.german as string | null) ?? '';
      const slug =
        (HTMLAttributes.slug as string | null) ??
        (german ? slugify(german) : '');

      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-interactive-word': 'true',
          'data-german': german || '',
          'data-serbian':
            (HTMLAttributes.serbian as string | null) || '',
          'data-article':
            (HTMLAttributes.article as string | null) || '',
          'data-part-of-speech': pos || '',
          'data-info': (HTMLAttributes.info as string | null) || '',
          'data-example':
            (HTMLAttributes.example as string | null) || '',
          'data-slug': slug || '',
          class: `sw-iw ${pos ? `sw-iw--${pos}` : ''}`,
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
