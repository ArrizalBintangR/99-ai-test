import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuizLoadingState() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
            </div>
            <div className="relative flex items-center justify-center h-16 w-16">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Generating Your Quiz
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Creating professional property industry questions with explanations and learning notes...
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>This may take a moment</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
