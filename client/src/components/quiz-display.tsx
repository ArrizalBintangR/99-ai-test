import { FileText, MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Quiz, QuizQuestion, QuizOption } from "@shared/schema";

interface QuizDisplayProps {
  quiz: Quiz;
}

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

function QuestionOption({ option, questionId }: { option: QuizOption; questionId: number }) {
  return (
    <div 
      className="flex items-start gap-3 p-4 rounded-md border bg-card hover-elevate cursor-default transition-colors"
      data-testid={`option-${questionId}-${option.letter}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-sm font-semibold">
        {option.letter}
      </span>
      <span className="text-base leading-relaxed pt-0.5">{option.text}</span>
    </div>
  );
}

function QuestionCard({ question, index, total }: { question: QuizQuestion; index: number; total: number }) {
  return (
    <Card className="overflow-visible" data-testid={`card-question-${question.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">
            Question <span className="font-mono">{index + 1}</span> of <span className="font-mono">{total}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <QuestionTypeBadge type={question.type} />
          <DifficultyBadge difficulty={question.difficulty} />
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
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuizDisplay({ quiz }: QuizDisplayProps) {
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

      <Separator />

      <div className="space-y-8">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            total={quiz.questions.length}
          />
        ))}
      </div>
    </div>
  );
}
