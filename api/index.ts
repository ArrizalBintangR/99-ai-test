import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { validatePropertyTopic, generateQuiz } from "../server/github-models";
import { storage } from "../server/storage";
import { quizConfigSchema } from "../shared/schema";
import { z } from "zod";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Quiz generation endpoint
app.post("/api/quiz/generate", async (req: Request, res: Response) => {
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
        message:
          validation.reason ||
          "The topic is not related to the property industry or is too vague. Please provide a specific property industry topic.",
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
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app;
