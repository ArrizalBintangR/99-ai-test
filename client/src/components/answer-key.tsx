import { CheckCircle2, Lightbulb, ExternalLink, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Quiz, QuizAnswer, QuizQuestion } from "@shared/schema";

interface AnswerKeyProps {
  quiz: Quiz;
}

function AnswerItem({ answer, question }: { answer: QuizAnswer; question: QuizQuestion }) {
  const correctOption = question.options.find(opt => opt.letter === answer.correctAnswer);
  
  return (
    <AccordionItem 
      value={`question-${answer.questionId}`} 
      className="border rounded-md px-0 data-[state=open]:bg-card"
    >
      <AccordionTrigger 
        className="px-4 py-3 hover:no-underline"
        data-testid={`accordion-trigger-${answer.questionId}`}
      >
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold">
            {answer.questionId}
          </span>
          <span className="text-sm font-medium line-clamp-1 pr-4">
            {question.question}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-md bg-green-500/10 dark:bg-green-500/20 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Correct Answer
              </p>
              <p className="font-semibold" data-testid={`text-correct-answer-${answer.questionId}`}>
                {answer.correctAnswer}. {correctOption?.text}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Explanation
            </p>
            <p className="text-sm leading-relaxed" data-testid={`text-explanation-${answer.questionId}`}>
              {answer.explanation}
            </p>
          </div>

          <div className="rounded-md bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Why This Matters
              </p>
            </div>
            <p className="text-sm leading-relaxed" data-testid={`text-learning-note-${answer.questionId}`}>
              {answer.learningNote}
            </p>
          </div>

          {answer.references.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                References
              </p>
              <div className="flex flex-wrap gap-2">
                {answer.references.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                    data-testid={`link-reference-${answer.questionId}-${idx}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function AnswerKey({ quiz }: AnswerKeyProps) {
  const questionMap = new Map(quiz.questions.map(q => [q.id, q]));
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-xl font-semibold">
          Answer Key & Learning Section
        </CardTitle>
        <Badge variant="secondary" className="shrink-0">
          {quiz.answers.length} answers
        </Badge>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-3">
          {quiz.answers.map((answer) => {
            const question = questionMap.get(answer.questionId);
            if (!question) return null;
            
            return (
              <AnswerItem
                key={answer.questionId}
                answer={answer}
                question={question}
              />
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
