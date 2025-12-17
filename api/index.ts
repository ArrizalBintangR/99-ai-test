import "dotenv/config";
import express, { type Request, Response } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { randomUUID } from "crypto";

// ============ SCHEMA ============
const difficultyModes = ["mixed", "easy", "medium", "hard"] as const;
type DifficultyMode = (typeof difficultyModes)[number];

const questionTypes = ["multiple_choice", "case_study"] as const;
type QuestionType = (typeof questionTypes)[number];

const difficultyLevels = ["easy", "medium", "hard"] as const;
type DifficultyLevel = (typeof difficultyLevels)[number];

const quizConfigSchema = z.object({
  topic: z
    .string()
    .min(5, "Topic must be at least 5 characters")
    .max(200, "Topic must be less than 200 characters"),
  numberOfQuestions: z.number().min(3).max(20).default(10),
  difficultyMode: z.enum(difficultyModes).default("mixed"),
});

interface QuizOption {
  letter: "A" | "B" | "C" | "D";
  text: string;
}

interface QuizQuestion {
  id: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question: string;
  scenario?: string;
  options: QuizOption[];
}

interface QuizAnswer {
  questionId: number;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  learningNote: string;
  references: string[];
}

interface Quiz {
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

// ============ STORAGE ============
class MemStorage {
  private quizzes: Map<string, Quiz>;

  constructor() {
    this.quizzes = new Map();
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

const storage = new MemStorage();

// ============ GITHUB MODELS ============
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is not set");
    }
    client = new OpenAI({ baseURL: endpoint, apiKey: token });
  }
  return client;
}

interface TopicValidationResult {
  isValid: boolean;
  reason?: string;
}

async function validatePropertyTopic(
  topic: string
): Promise<TopicValidationResult> {
  const response = await getClient().chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content: `You are a topic validator for a property industry quiz generator. Your job is to determine if a topic is related to the property/real estate industry and is specific enough to generate a quiz.

VALID topics include:
- Property market trends, updates, analysis
- Property agent skills, training, best practices
- Real estate transactions, processes, regulations
- Property valuation, pricing strategies
- Residential, commercial, industrial property
- Property investment, financing, mortgages
- Property laws, contracts, documentation
- Property marketing, sales techniques
- Property management, maintenance
- Urban development, zoning, land use
- Property technology (proptech)
- Regional property markets (Indonesia, Singapore, Malaysia, etc.)

INVALID topics include:
- Topics not related to property/real estate industry
- Too vague topics like just "property" or "real estate"
- Topics about specific individuals unless related to property industry
- Entertainment, sports, general news unrelated to property
- Personal advice or opinion-based topics

Respond with JSON in this format: { "isValid": boolean, "reason": string }
If invalid, explain why briefly in the reason field.`,
      },
      {
        role: "user",
        content: `Topic: "${topic}"`,
      },
    ],
  });

  let result: Record<string, unknown>;

  try {
    result = JSON.parse(response.choices[0].message.content || "{}");
  } catch {
    return {
      isValid: false,
      reason:
        "Unable to validate topic. Please try again with a clearer property industry topic.",
    };
  }

  return {
    isValid: result.isValid === true,
    reason: typeof result.reason === "string" ? result.reason : undefined,
  };
}

async function generateQuiz(
  topic: string,
  numberOfQuestions: number,
  difficultyMode: DifficultyMode
): Promise<Omit<Quiz, "id" | "createdAt">> {
  const difficultyInstruction =
    difficultyMode === "mixed"
      ? "Generate a mix of easy, medium, and hard questions (roughly equal distribution)."
      : `Generate all questions at ${difficultyMode} difficulty level.`;

  const prompt = `You are an automated quiz generation system for 99 Group, a leading property technology company in Southeast Asia.

Generate a professional, factual, property-industry knowledge quiz based on the following topic:

TOPIC: "${topic}"
NUMBER OF QUESTIONS: ${numberOfQuestions}
DIFFICULTY MODE: ${difficultyMode}
${difficultyInstruction}

VALIDATION RULES (STRICT):
- Do not speculate or make up facts
- Do not use outdated information
- All content must be factual and evidence-based
- Align terminology with professional property industry standards
- Focus on Indonesia/Southeast Asia context where relevant, but include global best practices

QUIZ STRUCTURE:
1. Provide a brief learning objective (1-2 sentences)
2. Generate ${numberOfQuestions} questions using:
   - Multiple choice questions (standard format)
   - Scenario-based questions labeled as "case_study" (about 30% of questions)
3. Each question must have exactly 4 options (A, B, C, D)
4. For each question, provide:
   - The correct answer
   - A clear explanation
   - A practical learning note (why this matters in real property work)
   - 1-2 reference links to credible sources when possible

Respond with JSON in this exact format:
{
  "learningObjective": "string describing what the quiz teaches",
  "audience": "99 Group employees",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "case_study",
      "difficulty": "easy" | "medium" | "hard",
      "question": "The question text",
      "scenario": "Optional scenario text for case studies only",
      "options": [
        { "letter": "A", "text": "Option A text" },
        { "letter": "B", "text": "Option B text" },
        { "letter": "C", "text": "Option C text" },
        { "letter": "D", "text": "Option D text" }
      ]
    }
  ],
  "answers": [
    {
      "questionId": 1,
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "Why this is correct",
      "learningNote": "Practical application in property work",
      "references": ["https://example.com/source1"]
    }
  ]
}`;

  const response = await getClient().chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "You are an expert property industry knowledge quiz generator. You create factual, professional quizzes for corporate learning and assessment. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawContent = response.choices[0].message.content || "{}";

  let result: Record<string, unknown>;

  try {
    result = JSON.parse(rawContent);
  } catch {
    throw new Error("Failed to parse quiz response from AI. Please try again.");
  }

  const quizOptionSchema = z.object({
    letter: z.enum(["A", "B", "C", "D"]),
    text: z.string(),
  });

  const quizQuestionSchema = z.object({
    id: z.number(),
    type: z.enum(["multiple_choice", "case_study"]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    question: z.string(),
    scenario: z.string().optional(),
    options: z.array(quizOptionSchema).length(4),
  });

  const quizAnswerSchema = z.object({
    questionId: z.number(),
    correctAnswer: z.enum(["A", "B", "C", "D"]),
    explanation: z.string(),
    learningNote: z.string(),
    references: z.array(z.string()).default([]),
  });

  const quizResponseSchema = z.object({
    learningObjective: z.string(),
    audience: z.string().default("99 Group employees"),
    questions: z.array(quizQuestionSchema),
    answers: z.array(quizAnswerSchema),
  });

  const parseResult = quizResponseSchema.safeParse(result);

  if (!parseResult.success) {
    throw new Error(
      "Generated quiz data is malformed. Please try again with a different topic."
    );
  }

  const validatedData = parseResult.data;

  if (validatedData.questions.length !== validatedData.answers.length) {
    throw new Error(
      "Generated quiz has mismatched questions and answers. Please try again."
    );
  }

  if (validatedData.questions.length < 1) {
    throw new Error("No questions were generated. Please try a more specific topic.");
  }

  return {
    topic,
    learningObjective: validatedData.learningObjective || `Learn about ${topic}`,
    audience: validatedData.audience || "99 Group employees",
    numberOfQuestions: validatedData.questions.length,
    difficultyMode,
    questions: validatedData.questions as QuizQuestion[],
    answers: validatedData.answers as QuizAnswer[],
  };
}

// ============ EXPRESS APP ============
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
