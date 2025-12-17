import { FileQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onGetStarted?: () => void;
}

export function EmptyState({ onGetStarted }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h2 className="text-2xl font-semibold tracking-tight mb-2">
        No Quiz Generated Yet
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start by entering a property industry topic above to generate a professional knowledge assessment quiz for 99 Group employees.
      </p>
      
      {onGetStarted && (
        <Button onClick={onGetStarted} data-testid="button-get-started">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Your First Quiz
        </Button>
      )}
    </div>
  );
}
