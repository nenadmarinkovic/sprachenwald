import type { DOMNode } from 'html-react-parser';
import {
  type Node as DomNodeBase,
  type Element as DomElement,
  Text,
} from 'domhandler';

export const isDomElement = (n: DOMNode): n is DomElement => {
  const t = (n as DomNodeBase).type;
  return t === 'tag' || t === 'script' || t === 'style';
};

export const isTextNode = (n: DOMNode): n is Text =>
  (n as DomNodeBase).type === 'text';

export const getInnerText = (el: DomElement): string =>
  (el.children ?? [])
    .map((child) => {
      const c = child as DOMNode;
      if (isTextNode(c)) return (c as Text).data ?? '';
      if (isDomElement(c)) return getInnerText(c as DomElement);
      return '';
    })
    .join('')
    .trim();

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

export type UIWord = {
  german: string;
  prevod?: string;
  tip?: PartOfSpeech | '';
  note?: string;
  padez?: Padez | '';
  clan?: string;
  glagol?: boolean;
};
