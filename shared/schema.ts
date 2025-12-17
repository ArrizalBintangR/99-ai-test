import { z } from "zod";

export const difficultyModes = ["mixed", "easy", "medium", "hard"] as const;
export type DifficultyMode = typeof difficultyModes[number];

export const questionTypes = ["multiple_choice", "case_study"] as const;
export type QuestionType = typeof questionTypes[number];

export const difficultyLevels = ["easy", "medium", "hard"] as const;
export type DifficultyLevel = typeof difficultyLevels[number];

export const quizConfigSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters").max(200, "Topic must be less than 200 characters"),
  numberOfQuestions: z.number().min(3).max(20).default(10),
  difficultyMode: z.enum(difficultyModes).default("mixed"),
});

export type QuizConfig = z.infer<typeof quizConfigSchema>;

export interface QuizOption {
  letter: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question: string;
  scenario?: string;
  options: QuizOption[];
}

export interface QuizAnswer {
  questionId: number;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  learningNote: string;
  references: string[];
}

export interface Quiz {
  id: string;
  topic: string;
  learningObjective: string;
  audience: string;
  numberOfQuestions: number;
  difficultyMode: DifficultyMode;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  createdAt: string;
}

export interface GenerateQuizRequest {
  topic: string;
  numberOfQuestions: number;
  difficultyMode: DifficultyMode;
}

export interface GenerateQuizResponse {
  quiz: Quiz;
}

export interface ValidationError {
  isValid: false;
  reason: string;
}

export interface ValidationSuccess {
  isValid: true;
}

export type TopicValidationResult = ValidationError | ValidationSuccess;
