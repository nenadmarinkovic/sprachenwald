import { Timestamp } from 'firebase/firestore';

export interface InteractiveWord {
  german: string;
  serbian: string;
  info?: string;
  article?: string;
  example?: string;
  partOfSpeech?: string;
}

export interface LessonContentBlock {
  type: 'text';
  german: string;
  serbian: string;
}

export interface HedgehogMessage {
  type: 'hedgehog';
  text: string;
}

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
  pairs: { prompt: string; answer: string }[];
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

export interface BaseLessonBlock {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessonId: string;
  lessonTitle: string;
}

export interface TextualLessonBlock extends BaseLessonBlock {
  type: 'text';
  content: (LessonContentBlock | HedgehogMessage)[];
}

export interface QuizLessonBlock extends BaseLessonBlock {
  type: 'quiz';
  quizzes: Quiz[];
}

export interface VideoLessonBlock extends BaseLessonBlock {
  type: 'video';
  videoUrl: string;
  description?: string;
}

export interface GrammarLessonBlock extends BaseLessonBlock {
  type: 'grammar';
  content: (LessonContentBlock | HedgehogMessage)[];
}

export interface VocabularyLessonBlock extends BaseLessonBlock {
  type: 'vocabulary';
  words: InteractiveWord[];
}

export type LessonBlock =
  | TextualLessonBlock
  | QuizLessonBlock
  | VideoLessonBlock
  | GrammarLessonBlock
  | VocabularyLessonBlock;

export interface Lesson {
  title: string;
  slug: string;
  order: number;
  createdAt: Timestamp;
}

export interface LessonWithId extends Lesson {
  id: string;
}

export interface Footnote {
  id: number;
  text: string;
}

export interface VocabularyWord extends InteractiveWord {
  id: string;
  userId: string;
  lessonId: string;
  addedAt: Timestamp;
  type: 'imenica' | 'glagol' | 'pridev' | 'ostalo';
}
