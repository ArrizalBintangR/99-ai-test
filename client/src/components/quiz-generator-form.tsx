import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2, Minus, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { quizConfigSchema, type QuizConfig, difficultyModes } from "@shared/schema";

interface QuizGeneratorFormProps {
  onSubmit: (data: QuizConfig) => void;
  isLoading: boolean;
}

const difficultyDescriptions: Record<string, string> = {
  mixed: "Combines easy, medium, and hard questions for balanced assessment",
  easy: "Foundational concepts suitable for newcomers",
  medium: "Practical scenarios for experienced professionals",
  hard: "Advanced topics requiring deep industry expertise",
};

export function QuizGeneratorForm({ onSubmit, isLoading }: QuizGeneratorFormProps) {
  const form = useForm<QuizConfig>({
    resolver: zodResolver(quizConfigSchema),
    defaultValues: {
      topic: "",
      numberOfQuestions: 10,
      difficultyMode: "mixed",
    },
  });

  const currentQuestionCount = form.watch("numberOfQuestions");
  const currentDifficulty = form.watch("difficultyMode");

  const handleIncrement = () => {
    if (currentQuestionCount < 20) {
      form.setValue("numberOfQuestions", currentQuestionCount + 1);
    }
  };

  const handleDecrement = () => {
    if (currentQuestionCount > 3) {
      form.setValue("numberOfQuestions", currentQuestionCount - 1);
    }
  };

  const handleFormSubmit = (data: QuizConfig) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Generate Property Quiz
        </CardTitle>
        <CardDescription className="text-base">
          Create a professional knowledge assessment for 99 Group employees based on property industry topics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Quiz Topic
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Top skills of a property agent in 2025"
                      className="text-base"
                      data-testid="input-topic"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>Enter a property industry topic. Non-property topics will be rejected.</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-8 md:grid-cols-2">
              <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Number of Questions
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleDecrement}
                          disabled={currentQuestionCount <= 3}
                          data-testid="button-decrement-questions"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span 
                            className="text-3xl font-mono font-semibold"
                            data-testid="text-question-count"
                          >
                            {field.value}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleIncrement}
                          disabled={currentQuestionCount >= 20}
                          data-testid="button-increment-questions"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-center">
                      Between 3 and 20 questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Difficulty Mode
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-2"
                      >
                        {difficultyModes.map((mode) => (
                          <div key={mode}>
                            <RadioGroupItem
                              value={mode}
                              id={`difficulty-${mode}`}
                              className="peer sr-only"
                              data-testid={`radio-difficulty-${mode}`}
                            />
                            <Label
                              htmlFor={`difficulty-${mode}`}
                              className="flex items-center justify-center rounded-md border-2 border-muted bg-transparent px-3 py-2 text-sm font-medium capitalize cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover-elevate"
                            >
                              {mode}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="min-h-[2.5rem]">
                      {difficultyDescriptions[currentDifficulty]}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={isLoading}
                data-testid="button-generate-quiz"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Quiz
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                disabled={isLoading}
                data-testid="button-clear-form"
              >
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
