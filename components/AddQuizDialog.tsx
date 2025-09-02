'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { Quiz } from '@/types/sprachenwald';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AddQuizDialogProps {
  lessonId: string; // ✅ required
  blockId: string; // ✅ new: which block to update
  currentQuizzes: Quiz[]; // current quizzes (for immediate UI)
}

export const AddQuizDialog = ({
  lessonId,
  blockId,
  currentQuizzes,
}: AddQuizDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizType, setQuizType] = useState<
    'multiple-choice' | 'fill-in-the-blank'
  >('multiple-choice');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctMcAnswer, setCorrectMcAnswer] = useState('');
  const [fibCorrectAnswer, setFibCorrectAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    setMcOptions((opts) => {
      const copy = [...opts];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddQuiz = async () => {
    if (!currentQuestion.trim()) return;

    let newQuiz: Quiz | null = null;

    if (quizType === 'multiple-choice') {
      const filteredOptions = mcOptions
        .map((o) => o.trim())
        .filter(Boolean);
      if (
        filteredOptions.length < 2 ||
        !correctMcAnswer.trim() ||
        !filteredOptions.includes(correctMcAnswer)
      ) {
        alert(
          'Please provide at least two options and select a valid correct answer.'
        );
        return;
      }
      newQuiz = {
        type: 'multiple-choice',
        question: currentQuestion.trim(),
        options: filteredOptions,
        correctAnswer: correctMcAnswer.trim(),
      };
    } else {
      if (!fibCorrectAnswer.trim()) {
        alert('Please provide a correct answer.');
        return;
      }
      newQuiz = {
        type: 'fill-in-the-blank',
        question: currentQuestion.trim(),
        correctAnswer: fibCorrectAnswer.trim(),
      };
    }

    if (!newQuiz) return;

    try {
      setSaving(true);

      // ✅ Update the BLOCK doc, not the LESSON doc
      const blockRef = doc(
        db,
        'lessons',
        lessonId,
        'blocks',
        blockId
      );

      // Optional: fetch latest quizzes to avoid clobbering concurrent edits
      const snap = await getDoc(blockRef);
      const existing =
        (snap.exists() && (snap.data().quizzes as Quiz[])) ||
        currentQuizzes ||
        [];

      const updatedQuizzes = [...existing, newQuiz];
      await updateDoc(blockRef, { quizzes: updatedQuizzes });

      // reset form
      setCurrentQuestion('');
      setMcOptions(['', '', '', '']);
      setCorrectMcAnswer('');
      setFibCorrectAnswer('');

      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setCurrentQuestion('');
    setMcOptions(['', '', '', '']);
    setCorrectMcAnswer('');
    setFibCorrectAnswer('');
    setQuizType('multiple-choice');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) =>
        open ? setIsOpen(true) : closeAndReset()
      }
    >
      <DialogTrigger asChild>
        <Button className="w-full mt-4">
          <PlusCircle size={16} className="mr-2" /> Dodaj novi kviz
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj novi kviz</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quizType">Tip kviza</Label>
            <Select
              onValueChange={(
                value: 'multiple-choice' | 'fill-in-the-blank'
              ) => setQuizType(value)}
              value={quizType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Izaberite tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">
                  Višestruki izbor
                </SelectItem>
                <SelectItem value="fill-in-the-blank">
                  Popuni prazninu
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentQuestion">Pitanje</Label>
            {quizType === 'fill-in-the-blank' && (
              <p className="text-xs text-muted-foreground">
                Koristite ___ da označite prazninu.
              </p>
            )}
            <Input
              id="currentQuestion"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
            />
          </div>

          {quizType === 'multiple-choice' && (
            <div className="space-y-3">
              {mcOptions.map((option, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`option-${index}`}>
                    Opcija {index + 1}
                  </Label>
                  <Input
                    id={`option-${index}`}
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(index, e.target.value)
                    }
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="correctMcAnswer">Tačan odgovor</Label>
                <Select
                  onValueChange={setCorrectMcAnswer}
                  value={correctMcAnswer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberite tačan odgovor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mcOptions
                      .map((o) => o.trim())
                      .filter(Boolean)
                      .map((opt, i) => (
                        <SelectItem key={i} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {quizType === 'fill-in-the-blank' && (
            <div className="space-y-2">
              <Label htmlFor="fibCorrectAnswer">Tačan odgovor</Label>
              <Input
                id="fibCorrectAnswer"
                value={fibCorrectAnswer}
                onChange={(e) => setFibCorrectAnswer(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleAddQuiz}
            type="button"
            disabled={saving}
          >
            {saving ? 'Snima…' : 'Dodaj kviz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
