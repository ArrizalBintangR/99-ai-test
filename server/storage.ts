import type { Quiz } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getQuiz(id: string): Promise<Quiz | undefined>;
  getAllQuizzes(): Promise<Quiz[]>;
  createQuiz(quiz: Omit<Quiz, "id" | "createdAt">): Promise<Quiz>;
}

export class MemStorage implements IStorage {
  private quizzes: Map<string, Quiz>;

  constructor() {
    this.quizzes = new Map();
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createQuiz(quizData: Omit<Quiz, "id" | "createdAt">): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...quizData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }
}

export const storage = new MemStorage();
