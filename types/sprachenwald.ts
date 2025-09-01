import { Timestamp } from 'firebase/firestore';

// Represents a single interactive word within a lesson
export interface InteractiveWord {
  german: string;
  serbian: string;
  info?: string; // e.g., "der, die, das", "Akkusativ", etc.
}

// Represents a block of text in a lesson (could be a paragraph)
export interface LessonContentBlock {
  type: 'text';
  german: InteractiveWord[];
  serbian: string;
}

// Represents a footnote
export interface Footnote {
  id: number;
  text: string;
}

// Represents the hedgehog helper message
export interface HedgehogMessage {
  type: 'hedgehog';
  text: string;
}

// Main Lesson Structure
export interface Lesson {
  title: string;
  slug: string;
  content: (LessonContentBlock | HedgehogMessage)[];
  footnotes: Footnote[];
  vocabulary: Omit<InteractiveWord, 'info'>[]; // Simplified list for "Add to Vocabulary"
  quizzes: Quiz[];
  createdAt: Timestamp;
  order: number;
}

export interface LessonWithId extends Lesson {
  id: string;
}

// User's Personal Vocabulary Word
export interface VocabularyWord extends InteractiveWord {
  id: string; // Firestore document ID
  userId: string;
  lessonId: string;
  addedAt: Timestamp;
  type: 'imenica' | 'glagol' | 'pridev' | 'ostalo'; // Noun, Verb, Adjective, Other
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
  question: string; // Use ___ for the blank
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
  audioSrc: string; // URL to audio file (placeholder for now)
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
