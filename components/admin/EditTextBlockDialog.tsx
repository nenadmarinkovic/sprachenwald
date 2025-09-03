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
import {
  InteractiveWordExtension,
  PartOfSpeech,
  Padez,
} from '@/lib/tiptap/interactive-word';

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
import { Switch } from '@/components/ui/switch';

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
  const [iwPrevod, setIwPrevod] = useState('');
  const [iwTip, setIwTip] = useState<PartOfSpeech | ''>('');
  const [iwNote, setIwNote] = useState('');
  const [iwPadez, setIwPadez] = useState<Padez | ''>('');
  const [iwClan, setIwClan] = useState('');
  const [iwGlagol, setIwGlagol] = useState(false);

  const iwRangeRef = useRef<{ from: number; to: number } | null>(
    null
  );
  const iwAttrsRef = useRef<{
    german?: string | null;
    prevod?: string | null;
    tip?: PartOfSpeech | null;
    note?: string | null;
    padez?: Padez | null;
    clan?: string | null;
    glagol?: 'true' | 'false' | null;
    slug?: string | null;
  }>({});

  const editor = useEditor({
    extensions: [
      StarterKit,
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

  const computeRange = useCallback((ed: Editor) => {
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

      const range = computeRange(ed);
      if (!range) {
        iwRangeRef.current = null;
        iwAttrsRef.current = {};
        return;
      }
      iwRangeRef.current = range;

      const attrs = (ed.getAttributes('interactiveWord') ||
        {}) as typeof iwAttrsRef.current;
      iwAttrsRef.current = attrs;

      const text =
        ed.state.doc.textBetween(range.from, range.to) || '';
      setIwGerman((attrs.german as string) || text || '');
      setIwPrevod((attrs.prevod as string) || '');
      setIwTip((attrs.tip as PartOfSpeech) || '');
      setIwNote((attrs.note as string) || '');
      setIwPadez((attrs.padez as Padez) || '');
      setIwClan((attrs.clan as string) || '');
      setIwGlagol(((attrs.glagol as string) || 'false') === 'true');
    },
    [computeRange]
  );

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => refreshPanelFromSelection(editor);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    refreshPanelFromSelection(editor);
    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, refreshPanelFromSelection]);

  useEffect(() => {
    if (!isOpen || !block || !editor) return;
    setTitle(block.title);
    const firstText = (block.content || []).find(
      (c) => (c as LessonContentBlock)?.type === 'text'
    ) as LessonContentBlock | undefined;

    editor.commands.setContent(firstText?.german ?? '');
    setSerbianContent(firstText?.serbian ?? '');
    setTimeout(() => editor && refreshPanelFromSelection(editor), 0);
  }, [block, isOpen, editor, refreshPanelFromSelection]);

  const applyAttr = (
    partial: Partial<{
      prevod: string;
      tip: PartOfSpeech | '';
      note: string;
      padez: Padez | '';
      clan: string;
      glagol: boolean;
    }>
  ) => {
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
        ...(existing.slug ? { slug: existing.slug } : {}),
        ...(existing.prevod ? { prevod: existing.prevod } : {}),
        ...(existing.tip ? { tip: existing.tip } : {}),
        ...(existing.note ? { note: existing.note } : {}),
        ...(existing.padez ? { padez: existing.padez } : {}),
        ...(existing.clan ? { clan: existing.clan } : {}),
        ...(existing.glagol ? { glagol: existing.glagol } : {}),
      };

      if (partial.prevod !== undefined)
        merged.prevod = partial.prevod;
      if (partial.tip !== undefined) merged.tip = partial.tip || '';
      if (partial.note !== undefined) merged.note = partial.note;
      if (partial.padez !== undefined)
        merged.padez = partial.padez || '';
      if (partial.clan !== undefined) merged.clan = partial.clan;
      if (partial.glagol !== undefined)
        merged.glagol = partial.glagol ? 'true' : 'false';

      tr.removeMark(range.from, range.to, markType);
      tr.addMark(range.from, range.to, markType.create(merged));

      if (dispatch) dispatch(tr);

      iwRangeRef.current = range;
      iwAttrsRef.current = {
        german: merged.german ?? null,
        slug: merged.slug ?? null,
        prevod: merged.prevod ?? null,
        tip: (merged.tip as PartOfSpeech) ?? null,
        note: merged.note ?? null,
        padez: (merged.padez as Padez) ?? null,
        clan: merged.clan ?? null,
        glagol: (merged.glagol as 'true' | 'false') ?? null,
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

  const tipSelectValue = iwTip === '' ? 'none' : iwTip;
  const padezSelectValue = iwPadez === '' ? 'none' : iwPadez;

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
                    <Label>German</Label>
                    <Input value={iwGerman} readOnly />
                  </div>

                  <div>
                    <Label>Prevod</Label>
                    <Input
                      value={iwPrevod}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwPrevod(v);
                        applyAttr({ prevod: v });
                      }}
                    />
                  </div>

                  <div>
                    <Label>Član</Label>
                    <Input
                      placeholder="der / die / das"
                      value={iwClan}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwClan(v);
                        applyAttr({ clan: v });
                      }}
                    />
                  </div>

                  <div>
                    <Label>Tip reči</Label>
                    <Select
                      value={tipSelectValue}
                      onValueChange={(v) => {
                        if (v === 'none') {
                          setIwTip('');
                          applyAttr({ tip: '' });
                          return;
                        }
                        const val = v as PartOfSpeech;
                        setIwTip(val);
                        applyAttr({ tip: val });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberi…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        <SelectItem value="imenica">
                          Imenica
                        </SelectItem>
                        <SelectItem value="glagol">Glagol</SelectItem>
                        <SelectItem value="pridev">Pridev</SelectItem>
                        <SelectItem value="prilog">Prilog</SelectItem>
                        <SelectItem value="zamenica">
                          Zamenica
                        </SelectItem>
                        <SelectItem value="predlog">
                          Predlog
                        </SelectItem>
                        <SelectItem value="veznik">Veznik</SelectItem>
                        <SelectItem value="ostalo">Ostalo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Padež</Label>
                    <Select
                      value={padezSelectValue}
                      onValueChange={(v) => {
                        if (v === 'none') {
                          setIwPadez('');
                          applyAttr({ padez: '' });
                          return;
                        }
                        const val = v as Padez;
                        setIwPadez(val);
                        applyAttr({ padez: val });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="(opciono)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        <SelectItem value="nominativ">
                          Nominativ
                        </SelectItem>
                        <SelectItem value="genitiv">
                          Genitiv
                        </SelectItem>
                        <SelectItem value="dativ">Dativ</SelectItem>
                        <SelectItem value="akuzativ">
                          Akuzativ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <Switch
                      checked={iwGlagol}
                      onCheckedChange={(checked) => {
                        setIwGlagol(checked);
                        applyAttr({ glagol: checked });
                      }}
                      id="iw-glagol"
                    />
                    <Label htmlFor="iw-glagol">Glagol</Label>
                  </div>

                  <div className="col-span-2">
                    <Label>Text (napomena)</Label>
                    <Textarea
                      value={iwNote}
                      onChange={(e) => {
                        const v = e.target.value;
                        setIwNote(v);
                        applyAttr({ note: v });
                      }}
                      rows={3}
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
