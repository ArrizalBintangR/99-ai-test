import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { QuizGeneratorForm } from "@/components/quiz-generator-form";
import { QuizDisplay } from "@/components/quiz-display";
import { AnswerKey } from "@/components/answer-key";
import { ExportQuiz } from "@/components/export-quiz";
import { QuizLoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, QuizConfig } from "@shared/schema";

export default function Home() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const generateQuizMutation = useMutation({
    mutationFn: async (config: QuizConfig) => {
      const response = await apiRequest("POST", "/api/quiz/generate", config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate quiz");
      }
      
      return data;
    },
    onSuccess: (data) => {
      setQuiz(data.quiz);
      setError(null);
      setTimeout(() => {
        quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to generate quiz. Please try again.");
      setQuiz(null);
    },
  });

  const handleSubmit = (data: QuizConfig) => {
    setError(null);
    generateQuizMutation.mutate(data);
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onNewQuiz={handleNewQuiz} 
        showNewQuizButton={quiz !== null}
      />
      
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <div className="space-y-12" ref={formRef}>
          {!quiz && !generateQuizMutation.isPending && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold tracking-tight" data-testid="text-page-title">
                  Property Industry Quiz Generator
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Create professional, factual property knowledge assessments for 99 Group employees with AI-powered question generation.
                </p>
              </div>
              
              {error && (
                <ErrorState 
                  title="Quiz Generation Failed" 
                  message={error} 
                  onRetry={handleRetry}
                />
              )}
              
              {!error && (
                <QuizGeneratorForm 
                  onSubmit={handleSubmit}
                  isLoading={generateQuizMutation.isPending}
                />
              )}
            </div>
          )}

          {generateQuizMutation.isPending && (
            <QuizLoadingState />
          )}

          {quiz && !generateQuizMutation.isPending && (
            <div className="space-y-12" ref={quizRef}>
              <QuizDisplay quiz={quiz} />
              
              <Separator />
              
              <AnswerKey quiz={quiz} />
              
              <Separator />
              
              <ExportQuiz quiz={quiz} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t py-6 mt-12">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            This quiz is for learning and assessment purposes only. All content is factual and evidence-based.
          </p>
        </div>
      </footer>
    </div>
  );
}
