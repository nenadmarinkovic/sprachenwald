'use client';
import React, { useState, useMemo } from 'react';
import { VocabularyWord } from '@/types/sprachenwald';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FlashcardExerciseProps {
  words: VocabularyWord[];
}

export const FlashcardExercise = ({
  words,
}: FlashcardExerciseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const shuffledWords = useMemo(
    () => [...words].sort(() => Math.random() - 0.5),
    [words]
  );

  if (words.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">
          Sačuvajte neke reči iz lekcija da biste započeli vežbu!
        </p>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledWords.length);
  };

  const currentWord = shuffledWords[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        className="w-full max-w-md h-64 perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card
          className={`w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of the card */}
          <div className="absolute w-full h-full backface-hidden flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold">
                {currentWord.german}
              </p>
              {currentWord.info && (
                <p className="text-muted-foreground mt-2">
                  ({currentWord.info})
                </p>
              )}
            </CardContent>
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center bg-muted">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-semibold">
                {currentWord.serbian}
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleNext}>Sledeća reč</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Kartica {currentIndex + 1} od {shuffledWords.length}
      </p>
    </div>
  );
};
