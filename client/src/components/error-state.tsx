import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-destructive/50">
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">
              {title}
            </h3>
            <p className="text-muted-foreground max-w-md" data-testid="text-error-message">
              {message}
            </p>
          </div>
          
          {onRetry && (
            <Button 
              variant="outline" 
              onClick={onRetry}
              data-testid="button-retry"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
