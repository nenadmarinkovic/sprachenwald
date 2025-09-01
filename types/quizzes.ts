import { Timestamp } from 'firebase/firestore';

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

export type Quiz = MultipleChoiceQuiz | FillInTheBlankQuiz;

export interface Lesson {
  title: string;
  content: string;
  slug: string;
  quizzes: Quiz[];
  createdAt: Timestamp;
  order: number;
}

export interface LessonWithId extends Lesson {
  id: string;
}
