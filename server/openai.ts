import OpenAI from "openai";
import { z } from "zod";
import type { Quiz, QuizQuestion, QuizAnswer, DifficultyMode } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TopicValidationResult {
  isValid: boolean;
  reason?: string;
}

export async function validatePropertyTopic(topic: string): Promise<TopicValidationResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5",
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
    response_format: { type: "json_object" },
    max_completion_tokens: 256,
  });

  let result: Record<string, unknown>;
  
  try {
    result = JSON.parse(response.choices[0].message.content || "{}");
  } catch {
    console.error("Failed to parse topic validation response");
    return {
      isValid: false,
      reason: "Unable to validate topic. Please try again with a clearer property industry topic.",
    };
  }

  return {
    isValid: result.isValid === true,
    reason: typeof result.reason === "string" ? result.reason : undefined,
  };
}

export async function generateQuiz(
  topic: string,
  numberOfQuestions: number,
  difficultyMode: DifficultyMode
): Promise<Omit<Quiz, "id" | "createdAt">> {
  const difficultyInstruction = difficultyMode === "mixed"
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

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "You are an expert property industry knowledge quiz generator. You create factual, professional quizzes for corporate learning and assessment. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
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
    console.error("Quiz validation failed:", parseResult.error.flatten());
    throw new Error("Generated quiz data is malformed. Please try again with a different topic.");
  }

  const validatedData = parseResult.data;

  if (validatedData.questions.length !== validatedData.answers.length) {
    console.error("Question/answer count mismatch:", {
      questions: validatedData.questions.length,
      answers: validatedData.answers.length,
    });
    throw new Error("Generated quiz has mismatched questions and answers. Please try again.");
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
