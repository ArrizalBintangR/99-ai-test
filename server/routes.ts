import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validatePropertyTopic, generateQuiz } from "./github-models";
import { quizConfigSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const parseResult = quizConfigSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const { topic, numberOfQuestions, difficultyMode } = parseResult.data;

      const validation = await validatePropertyTopic(topic);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Invalid topic",
          message: validation.reason || "The topic is not related to the property industry or is too vague. Please provide a specific property industry topic.",
        });
      }

      const quizData = await generateQuiz(topic, numberOfQuestions, difficultyMode);
      const quiz = await storage.createQuiz(quizData);

      return res.status(200).json({ quiz });
    } catch (error) {
      console.error("Quiz generation error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.flatten().fieldErrors,
        });
      }

      return res.status(500).json({
        error: "Failed to generate quiz",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  });

  app.get("/api/quiz/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const quiz = await storage.getQuiz(id);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      return res.status(200).json({ quiz });
    } catch (error) {
      console.error("Get quiz error:", error);
      return res.status(500).json({
        error: "Failed to get quiz",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  });

  app.get("/api/quizzes", async (_req, res) => {
    try {
      const quizzes = await storage.getAllQuizzes();
      return res.status(200).json({ quizzes });
    } catch (error) {
      console.error("Get quizzes error:", error);
      return res.status(500).json({
        error: "Failed to get quizzes",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  });

  return httpServer;
}
