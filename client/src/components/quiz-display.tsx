import { useState } from "react";
import { FileText, MessageSquare, ChevronRight, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Quiz, QuizQuestion, QuizOption } from "@shared/schema";

interface QuizDisplayProps {
  quiz: Quiz;
}

type UserAnswers = Record<number, "A" | "B" | "C" | "D">;
type QuizMode = "taking" | "results";

function QuestionTypeBadge({ type }: { type: QuizQuestion["type"] }) {
  if (type === "case_study") {
    return (
      <Badge variant="secondary" className="text-xs">
        <FileText className="h-3 w-3 mr-1" />
        Case Study
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      <MessageSquare className="h-3 w-3 mr-1" />
      Multiple Choice
    </Badge>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: QuizQuestion["difficulty"] }) {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    easy: "default",
    medium: "secondary",
    hard: "destructive",
  };
  
  return (
    <Badge variant={variants[difficulty]} className="text-xs capitalize">
      {difficulty}
    </Badge>
  );
}

interface QuestionOptionProps {
  option: QuizOption;
  questionId: number;
  isSelected: boolean;
  onSelect: () => void;
  mode: QuizMode;
  correctAnswer?: "A" | "B" | "C" | "D";
}

function QuestionOption({ option, questionId, isSelected, onSelect, mode, correctAnswer }: QuestionOptionProps) {
  const isCorrect = option.letter === correctAnswer;
  const showResult = mode === "results";
  const isWrongSelection = showResult && isSelected && !isCorrect;
  const isCorrectSelection = showResult && isSelected && isCorrect;
  const isCorrectAnswer = showResult && isCorrect;

  return (
    <button 
      type="button"
      onClick={onSelect}
      disabled={mode === "results"}
      className={cn(
        "flex items-start gap-3 p-4 rounded-md border bg-card transition-all w-full text-left",
        mode === "taking" && "hover:border-primary hover:bg-accent cursor-pointer",
        mode === "taking" && isSelected && "border-primary bg-primary/10 ring-2 ring-primary",
        mode === "results" && "cursor-default",
        isCorrectAnswer && "border-green-500 bg-green-50 dark:bg-green-950/30",
        isWrongSelection && "border-red-500 bg-red-50 dark:bg-red-950/30"
      )}
      data-testid={`option-${questionId}-${option.letter}`}
    >
      <span className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold",
        !showResult && !isSelected && "bg-muted",
        !showResult && isSelected && "bg-primary text-primary-foreground",
        isCorrectAnswer && "bg-green-500 text-white",
        isWrongSelection && "bg-red-500 text-white"
      )}>
        {showResult && isCorrect ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : showResult && isWrongSelection ? (
          <XCircle className="h-4 w-4" />
        ) : (
          option.letter
        )}
      </span>
      <span className="text-base leading-relaxed pt-0.5">{option.text}</span>
    </button>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selectedAnswer?: "A" | "B" | "C" | "D";
  onSelectAnswer: (letter: "A" | "B" | "C" | "D") => void;
  mode: QuizMode;
  correctAnswer?: "A" | "B" | "C" | "D";
  explanation?: string;
}

function QuestionCard({ question, index, total, selectedAnswer, onSelectAnswer, mode, correctAnswer, explanation }: QuestionCardProps) {
  const isCorrect = mode === "results" && selectedAnswer === correctAnswer;
  const isIncorrect = mode === "results" && selectedAnswer && selectedAnswer !== correctAnswer;

  return (
    <Card className={cn(
      "overflow-visible",
      mode === "results" && isCorrect && "ring-2 ring-green-500",
      mode === "results" && isIncorrect && "ring-2 ring-red-500"
    )} data-testid={`card-question-${question.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">
            Question <span className="font-mono">{index + 1}</span> of <span className="font-mono">{total}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <QuestionTypeBadge type={question.type} />
          <DifficultyBadge difficulty={question.difficulty} />
          {mode === "results" && (
            <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
              {isCorrect ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Correct</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Incorrect</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {question.scenario && (
          <div className="rounded-md bg-muted/50 p-4 border-l-4 border-primary">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Scenario
            </p>
            <p className="text-base leading-relaxed">{question.scenario}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-relaxed" data-testid={`text-question-${question.id}`}>
            {question.question}
          </h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option) => (
            <QuestionOption 
              key={option.letter} 
              option={option} 
              questionId={question.id}
              isSelected={selectedAnswer === option.letter}
              onSelect={() => onSelectAnswer(option.letter)}
              mode={mode}
              correctAnswer={correctAnswer}
            />
          ))}
        </div>

        {mode === "results" && explanation && (
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-4 border-l-4 border-blue-500">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
              Explanation
            </p>
            <p className="text-base leading-relaxed">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QuizDisplay({ quiz }: QuizDisplayProps) {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [mode, setMode] = useState<QuizMode>("taking");

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = quiz.questions.length;
  const allAnswered = answeredCount === totalQuestions;

  const handleSelectAnswer = (questionId: number, letter: "A" | "B" | "C" | "D") => {
    if (mode === "results") return;
    setUserAnswers(prev => ({ ...prev, [questionId]: letter }));
  };

  const handleSubmitQuiz = () => {
    setMode("results");
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setMode("taking");
  };

  const getAnswer = (questionId: number) => {
    return quiz.answers.find(a => a.questionId === questionId);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      const answer = getAnswer(question.id);
      if (answer && userAnswers[question.id] === answer.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = mode === "results" ? calculateScore() : 0;
  const percentage = mode === "results" ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-quiz-topic">
            {quiz.topic}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed" data-testid="text-learning-objective">
            {quiz.learningObjective}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span data-testid="text-quiz-audience">
            Intended for: <strong className="text-foreground">{quiz.audience}</strong>
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span data-testid="text-quiz-question-count">
            <strong className="text-foreground font-mono">{quiz.numberOfQuestions}</strong> questions
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span data-testid="text-quiz-difficulty">
            Difficulty: <strong className="text-foreground capitalize">{quiz.difficultyMode}</strong>
          </span>
        </div>
      </div>

      {mode === "results" && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Trophy className={cn(
                  "h-12 w-12",
                  percentage >= 80 ? "text-yellow-500" : percentage >= 60 ? "text-gray-400" : "text-orange-400"
                )} />
                <div>
                  <h2 className="text-2xl font-bold">Quiz Complete!</h2>
                  <p className="text-muted-foreground">
                    You scored <strong className="text-foreground">{score}</strong> out of <strong className="text-foreground">{totalQuestions}</strong> ({percentage}%)
                  </p>
                </div>
              </div>
              <Button onClick={handleRetakeQuiz} variant="outline" size="lg">
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "taking" && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Progress: <strong className="text-foreground">{answeredCount}</strong> of <strong className="text-foreground">{totalQuestions}</strong> questions answered
              </p>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="space-y-8">
        {quiz.questions.map((question, index) => {
          const answer = getAnswer(question.id);
          return (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              total={quiz.questions.length}
              selectedAnswer={userAnswers[question.id]}
              onSelectAnswer={(letter) => handleSelectAnswer(question.id, letter)}
              mode={mode}
              correctAnswer={mode === "results" ? answer?.correctAnswer : undefined}
              explanation={mode === "results" ? answer?.explanation : undefined}
            />
          );
        })}
      </div>

      {mode === "taking" && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleSubmitQuiz} 
            size="lg" 
            disabled={!allAnswered}
            className="min-w-[200px]"
          >
            {allAnswered ? "Submit Quiz" : `Answer all questions (${answeredCount}/${totalQuestions})`}
          </Button>
        </div>
      )}
    </div>
  );
}
