'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { getMarkRange } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { InteractiveWordExtension } from '@/lib/tiptap/interactive-word';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  LessonBlock,
  TextualLessonBlock,
  GrammarLessonBlock,
  LessonContentBlock,
} from '@/types/sprachenwald';

type EditTextBlockDialogProps = {
  block: TextualLessonBlock | GrammarLessonBlock;
  onSave: (id: string, data: Partial<LessonBlock>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

type PartOfSpeech = 'imenica' | 'glagol' | 'pridev' | 'ostalo';

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const isBold = editor.isActive('bold');
  const isItalic = editor.isActive('italic');
  const isStrike = editor.isActive('strike');
  const inIW = editor.isActive('interactiveWord');

  const buttonClass = (active: boolean) =>
    active ? 'bg-muted text-foreground' : 'hover:bg-muted';

  return (
    <div className="border rounded-t-md p-2 flex flex-wrap items-center gap-2 bg-gray-50">
      <Button
        size="sm"
        variant="ghost"
        className={buttonClass(isBold)}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={buttonClass(isItalic)}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={buttonClass(isStrike)}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        Strike
      </Button>
      <div className="mx-2 h-6 w-px bg-border" />
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          editor
            .chain()
            .focus()
            .setInteractiveWordFromSelection()
            .run()
        }
        title="Wrap selection as interactive word"
      >
        Make Interactive
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          editor.chain().focus().unsetInteractiveWord().run()
        }
        disabled={!inIW}
        title="Remove interactive word"
      >
        Remove
      </Button>
    </div>
  );
};

export const EditTextBlockDialog: React.FC<
  EditTextBlockDialogProps
> = ({ block, onSave, isOpen, onOpenChange }) => {
  const [title, setTitle] = useState('');
  const [serbianContent, setSerbianContent] = useState('');
  const [panelVisible, setPanelVisible] = useState(false);
  const [iwGerman, setIwGerman] = useState('');
  const [iwSerbian, setIwSerbian] = useState('');
  const [iwArticle, setIwArticle] = useState('');
  const [iwPOS, setIwPOS] = useState<PartOfSpeech | ''>('');
  const [iwInfo, setIwInfo] = useState('');
  const [iwExample, setIwExample] = useState('');

  const iwRangeRef = useRef<{ from: number; to: number } | null>(
    null
  );
  const iwAttrsRef = useRef<{
    german?: string;
    serbian?: string | null;
    article?: string | null;
    partOfSpeech?: PartOfSpeech | null;
    info?: string | null;
    example?: string | null;
  }>({});

  const editor = useEditor({
    extensions: [
      StarterKit, // history included
      Typography,
      Placeholder.configure({ placeholder: 'Napiši nemački tekst…' }),
      CharacterCount,
      InteractiveWordExtension,
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert min-w-full focus:outline-none p-2',
      },
    },
  });

  const computeInteractiveWordRange = useCallback((ed: Editor) => {
    const { state } = ed;
    const markType = state.schema.marks['interactiveWord'];
    const sel = state.selection;
    const pos = sel.empty ? sel.$head.pos : sel.from;
    const resolved = state.doc.resolve(pos);
    return getMarkRange(resolved, markType) || null;
  }, []);

  const refreshPanelFromSelection = useCallback(
    (ed: Editor) => {
      const inIW = ed.isActive('interactiveWord');
      setPanelVisible(inIW);

      if (!inIW) {
        iwRangeRef.current = null;
        iwAttrsRef.current = {};
        return;
      }

      const range = computeInteractiveWordRange(ed);
      if (!range) {
        iwRangeRef.current = null;
        iwAttrsRef.current = {};
        return;
      }
      iwRangeRef.current = range;

      const attrs = (ed.getAttributes('interactiveWord') ||
        {}) as typeof iwAttrsRef.current;
      iwAttrsRef.current = attrs;

      const selectedText =
        ed.state.doc.textBetween(range.from, range.to) || '';

      setIwGerman((attrs.german as string) || selectedText || '');
      setIwSerbian((attrs.serbian as string) || '');
      setIwArticle((attrs.article as string) || '');
      setIwPOS((attrs.partOfSpeech as PartOfSpeech) || '');
      setIwInfo((attrs.info as string) || '');
      setIwExample((attrs.example as string) || '');
    },
    [computeInteractiveWordRange]
  );

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => refreshPanelFromSelection(editor);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    // initial
    refreshPanelFromSelection(editor);
    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, refreshPanelFromSelection]);

  useEffect(() => {
    if (!isOpen || !block || !editor) return;

    setTitle(block.title);
    const firstTextBlock = (block.content || []).find(
      (c) => (c as LessonContentBlock)?.type === 'text'
    ) as LessonContentBlock | undefined;

    editor.commands.setContent(firstTextBlock?.german ?? '');
    setSerbianContent(firstTextBlock?.serbian ?? '');

    setTimeout(() => editor && refreshPanelFromSelection(editor), 0);
  }, [block, isOpen, editor, refreshPanelFromSelection]);

  const applyAttrToStoredRange = (partial: {
    serbian?: string;
    article?: string;
    partOfSpeech?: PartOfSpeech | '';
    info?: string;
    example?: string;
  }) => {
    if (!editor) return;
    const rng = iwRangeRef.current;
    if (!rng) return;

    editor.commands.command(({ state, tr, dispatch }) => {
      const markType = state.schema.marks['interactiveWord'];
      if (!markType) return false;

      const currentRange =
        getMarkRange(state.doc.resolve(rng.from), markType) ||
        getMarkRange(state.doc.resolve(rng.to), markType);
      const range = currentRange || rng;

      const existing = iwAttrsRef.current || {};
      const merged: Record<string, string> = {
        ...(existing.german ? { german: existing.german } : {}),
        ...(existing.serbian ? { serbian: existing.serbian } : {}),
        ...(existing.article ? { article: existing.article } : {}),
        ...(existing.partOfSpeech
          ? { partOfSpeech: existing.partOfSpeech }
          : {}),
        ...(existing.info ? { info: existing.info } : {}),
        ...(existing.example ? { example: existing.example } : {}),
      };

      if (partial.serbian !== undefined)
        merged.serbian = partial.serbian;
      if (partial.article !== undefined)
        merged.article = partial.article;
      if (partial.partOfSpeech !== undefined)
        merged.partOfSpeech = partial.partOfSpeech || '';
      if (partial.info !== undefined) merged.info = partial.info;
      if (partial.example !== undefined)
        merged.example = partial.example;

      tr.removeMark(range.from, range.to, markType);
      tr.addMark(range.from, range.to, markType.create(merged));

      if (dispatch) dispatch(tr);

      iwRangeRef.current = range;
      iwAttrsRef.current = {
        german: merged.german,
        serbian: merged.serbian ?? null,
        article: merged.article ?? null,
        partOfSpeech: (merged.partOfSpeech as PartOfSpeech) ?? null,
        info: merged.info ?? null,
        example: merged.example ?? null,
      };
      return true;
    });
  };

  const handleSubmit = () => {
    if (!editor) return;
    const finalHtml = editor.getHTML();
    const content: LessonContentBlock[] = [
      { type: 'text', german: finalHtml, serbian: serbianContent },
    ];
    onSave(block.id, { title, content });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit {block.type} Block</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-1 md:pr-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-title-edit">Block Title</Label>
              <Input
                id="block-title-edit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>German Content</Label>
              <p className="text-xs text-muted-foreground">
                Tip: select a word and click <em>Make Interactive</em>
                , or type <code>[[word]]</code>.
              </p>
              <div className="border rounded-md mt-1">
                <Toolbar editor={editor} />
                <EditorContent editor={editor} />
                <div className="flex justify-end px-2 py-1 text-xs text-muted-foreground">
                  <span>
                    {editor?.storage.characterCount.characters() ?? 0}{' '}
                    chars
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="serbian-content-edit">
                Serbian Paragraph Translation
              </Label>
              <Textarea
                id="serbian-content-edit"
                value={serbianContent}
                onChange={(e) => setSerbianContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-4">
            {panelVisible ? (
              <div className="p-3 border rounded-md bg-gray-50">
                <p className="font-semibold mb-2">
                  Interactive Word Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>German (from selection)</Label>
                    <Input value={iwGerman} readOnly />
                  </div>
                  <div>
                    <Label>Serbian</Label>
                    <Input
                      value={iwSerbian}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwSerbian(v);
                        applyAttrToStoredRange({ serbian: v });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Article</Label>
                    <Input
                      placeholder="der / die / das"
                      value={iwArticle}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwArticle(v);
                        applyAttrToStoredRange({ article: v });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Part of Speech</Label>
                    <Select
                      value={iwPOS || ''}
                      onValueChange={(v) => {
                        const val = v as PartOfSpeech;
                        setIwPOS(val);
                        applyAttrToStoredRange({ partOfSpeech: val });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imenica">
                          Imenica (Noun)
                        </SelectItem>
                        <SelectItem value="glagol">
                          Glagol (Verb)
                        </SelectItem>
                        <SelectItem value="pridev">
                          Pridev (Adjective)
                        </SelectItem>
                        <SelectItem value="ostalo">
                          Ostalo (Other)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Info (optional)</Label>
                    <Input
                      value={iwInfo}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwInfo(v);
                        applyAttrToStoredRange({ info: v });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Example (optional)</Label>
                    <Input
                      value={iwExample}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwExample(v);
                        applyAttrToStoredRange({ example: v });
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .unsetInteractiveWord()
                        .run()
                    }
                  >
                    Remove Mark
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 border rounded-md bg-gray-50 text-sm text-muted-foreground">
                Select an interactive word to edit its details here.
              </div>
            )}
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
