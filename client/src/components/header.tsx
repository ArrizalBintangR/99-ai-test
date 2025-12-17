import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onNewQuiz?: () => void;
  showNewQuizButton?: boolean;
}

export function Header({ onNewQuiz, showNewQuizButton = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-4xl flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight" data-testid="text-brand-name">
              99 Group
            </span>
            <span className="text-xs text-muted-foreground">
              Quiz Generator
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showNewQuizButton && onNewQuiz && (
            <Button
              onClick={onNewQuiz}
              size="sm"
              data-testid="button-new-quiz"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Quiz
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
