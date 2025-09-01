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
import { Quiz } from '@/types/quizzes';

interface AddQuizDialogProps {
  onAddQuiz: (newQuiz: Quiz) => void;
}

export const AddQuizDialog = ({ onAddQuiz }: AddQuizDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizType, setQuizType] = useState<
    'multiple-choice' | 'fill-in-the-blank'
  >('multiple-choice');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctMcAnswer, setCorrectMcAnswer] = useState('');
  const [fibCorrectAnswer, setFibCorrectAnswer] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...mcOptions];
    newOptions[index] = value;
    setMcOptions(newOptions);
  };

  const handleAddQuiz = () => {
    if (!currentQuestion.trim()) return;

    let newQuiz: Quiz | null = null;
    if (quizType === 'multiple-choice') {
      const filteredOptions = mcOptions.filter(
        (opt) => opt.trim() !== ''
      );
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
        question: currentQuestion,
        options: filteredOptions,
        correctAnswer: correctMcAnswer,
      };
    } else {
      if (!fibCorrectAnswer.trim()) {
        alert('Please provide a correct answer.');
        return;
      }
      newQuiz = {
        type: 'fill-in-the-blank',
        question: currentQuestion,
        correctAnswer: fibCorrectAnswer,
      };
    }

    if (newQuiz) {
      onAddQuiz(newQuiz);
      setCurrentQuestion('');
      setMcOptions(['', '', '', '']);
      setCorrectMcAnswer('');
      setFibCorrectAnswer('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              defaultValue={quizType}
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
                      .filter((opt) => opt)
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
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleAddQuiz} type="button">
            Dodaj kviz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
