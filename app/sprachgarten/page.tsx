'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { VocabularyWord } from '@/types/sprachenwald';
import { Book, BrainCircuit, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const SprachgartenPage = () => {
  const { user } = useUser();
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const vocabQuery = query(
        collection(db, 'userVocabulary'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(vocabQuery, (snapshot) => {
        const userVocab = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as VocabularyWord)
        );
        setVocabulary(userVocab);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const renderVocabularyList = (words: VocabularyWord[]) => {
    if (words.length === 0) {
      return (
        <p className="text-muted-foreground text-center p-8">
          Nemate sačuvanih reči u ovoj kategoriji.
        </p>
      );
    }
    return (
      <div className="space-y-2 p-4">
        {words.map((word) => (
          <div
            key={word.id}
            className="p-3 bg-muted rounded-md flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{word.german}</p>
              <p className="text-sm text-muted-foreground">
                {word.serbian}
              </p>
            </div>
            {word.info && (
              <p className="text-sm font-mono bg-background p-1 rounded-sm">
                {word.info}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center p-12">Učitavanje...</div>;
  }

  if (!user) {
    return (
      <div className="text-center p-12">
        Morate biti prijavljeni da biste videli svoj Sprachgarten.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Vaš Sprachgarten
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Vaša lična bašta reči za vežbanje i učenje.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vocabulary">
            <Book className="w-4 h-4 mr-2" />
            Rečnik
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <BrainCircuit className="w-4 h-4 mr-2" />
            Vežbe
          </TabsTrigger>
        </TabsList>
        <TabsContent value="vocabulary">
          <Card>
            <CardHeader>
              <CardTitle>Lista Reči</CardTitle>
              <CardDescription>
                Sve reči koje ste sačuvali iz lekcija.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVocabularyList(vocabulary)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>Vežbe</CardTitle>
              <CardDescription>
                Uskoro stižu vežbe za vaš sačuvani vokabular!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-12">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Spremamo Anki-style kartice i druge vežbe.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprachgartenPage;
