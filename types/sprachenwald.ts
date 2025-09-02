import { Timestamp } from 'firebase/firestore';

export interface InteractiveWord {
  german: string;
  serbian: string;
  info?: string;
  article?: string;
  example?: string;
}

export interface LessonContentBlock {
  type: 'text';
  german: InteractiveWord[];
  serbian: string;
}

export interface Footnote {
  id: number;
  text: string;
}

export interface HedgehogMessage {
  type: 'hedgehog';
  text: string;
}

export interface Lesson {
  title: string;
  slug: string;
  content: (LessonContentBlock | HedgehogMessage)[];
  footnotes: Footnote[];
  vocabulary: Omit<InteractiveWord, 'info'>[];
  quizzes: Quiz[];
  createdAt: Timestamp;
  order: number;
}

export interface LessonWithId extends Lesson {
  id: string;
}

export interface VocabularyWord extends InteractiveWord {
  id: string;
  userId: string;
  lessonId: string;
  addedAt: Timestamp;
  type: 'imenica' | 'glagol' | 'pridev' | 'ostalo';
}

// --- QUIZ TYPES ---

export interface MultipleChoiceQuiz {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface FillInTheBlankQuiz {
  type: 'fill-in-the-blank';
  question: string;
  correctAnswer: string;
}

export interface MatchQuiz {
  type: 'match';
  question: string;
  pairs: {
    prompt: string;
    answer: string;
  }[];
}

export interface AudioQuiz {
  type: 'audio';
  question: string;
  audioSrc: string;
  options: string[];
  correctAnswer: string;
}

export interface SentenceOrderQuiz {
  type: 'sentence-order';
  question: string;
  scrambled: string[];
  correctOrder: string[];
}

export type Quiz =
  | MultipleChoiceQuiz
  | FillInTheBlankQuiz
  | MatchQuiz
  | AudioQuiz
  | SentenceOrderQuiz;
