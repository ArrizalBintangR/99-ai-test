import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { QuizGeneratorForm } from "@/components/quiz-generator-form";
import { QuizDisplay } from "@/components/quiz-display";
import { AnswerKey } from "@/components/answer-key";
import { ExportQuiz } from "@/components/export-quiz";
import { QuizLoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Clock, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, QuizConfig } from "@shared/schema";

const STORAGE_KEY = "quiz-ai-recent-quizzes";
const MAX_RECENT_QUIZZES = 5;

function getRecentQuizzes(): Quiz[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQuizToStorage(quiz: Quiz): void {
  try {
    const existing = getRecentQuizzes();
    // Remove duplicate if exists
    const filtered = existing.filter(q => q.id !== quiz.id);
    // Add new quiz at the beginning
    const updated = [quiz, ...filtered].slice(0, MAX_RECENT_QUIZZES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

function clearRecentQuizzes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export default function Home() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  // Load recent quizzes from localStorage on mount
  useEffect(() => {
    setRecentQuizzes(getRecentQuizzes());
  }, []);

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
      // Save to localStorage
      saveQuizToStorage(data.quiz);
      setRecentQuizzes(getRecentQuizzes());
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

  const handleLoadQuiz = (loadedQuiz: Quiz) => {
    setQuiz(loadedQuiz);
    setError(null);
    setTimeout(() => {
      quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleClearHistory = () => {
    clearRecentQuizzes();
    setRecentQuizzes([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

              {/* Recent Quizzes Section */}
              {recentQuizzes.length > 0 && (
                <Card className="w-full max-w-2xl mx-auto">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent Quizzes
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearHistory}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentQuizzes.map((recentQuiz) => (
                      <button
                        key={recentQuiz.id}
                        onClick={() => handleLoadQuiz(recentQuiz)}
                        className="w-full p-3 rounded-md border bg-card hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{recentQuiz.topic}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(recentQuiz.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {recentQuiz.numberOfQuestions} Q
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {recentQuiz.difficultyMode}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
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
