import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Quiz } from "@shared/schema";

interface ExportQuizProps {
  quiz: Quiz;
}

function formatQuizAsPlainText(quiz: Quiz): string {
  const lines: string[] = [];
  
  lines.push("=".repeat(60));
  lines.push("PROPERTY INDUSTRY QUIZ - 99 GROUP");
  lines.push("=".repeat(60));
  lines.push("");
  
  lines.push("INTRODUCTION");
  lines.push("-".repeat(40));
  lines.push(`Topic: ${quiz.topic}`);
  lines.push(`Learning Objective: ${quiz.learningObjective}`);
  lines.push(`Intended Audience: ${quiz.audience}`);
  lines.push(`Number of Questions: ${quiz.numberOfQuestions}`);
  lines.push(`Difficulty Mode: ${quiz.difficultyMode.charAt(0).toUpperCase() + quiz.difficultyMode.slice(1)}`);
  lines.push("");
  
  lines.push("=".repeat(60));
  lines.push("QUIZ QUESTIONS");
  lines.push("=".repeat(60));
  lines.push("");
  
  quiz.questions.forEach((question, index) => {
    lines.push(`QUESTION ${index + 1} [${question.difficulty.toUpperCase()}]${question.type === "case_study" ? " - CASE STUDY" : ""}`);
    lines.push("-".repeat(40));
    
    if (question.scenario) {
      lines.push("");
      lines.push("Scenario:");
      lines.push(question.scenario);
      lines.push("");
    }
    
    lines.push(question.question);
    lines.push("");
    
    question.options.forEach((option) => {
      lines.push(`${option.letter}. ${option.text}`);
    });
    
    lines.push("");
    lines.push("");
  });
  
  lines.push("=".repeat(60));
  lines.push("ANSWER KEY & LEARNING SECTION");
  lines.push("=".repeat(60));
  lines.push("");
  
  quiz.answers.forEach((answer) => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    const correctOption = question?.options.find(opt => opt.letter === answer.correctAnswer);
    
    lines.push(`QUESTION ${answer.questionId}`);
    lines.push("-".repeat(40));
    lines.push(`Correct Answer: ${answer.correctAnswer}. ${correctOption?.text || ""}`);
    lines.push("");
    lines.push("Explanation:");
    lines.push(answer.explanation);
    lines.push("");
    lines.push("Why This Matters (Practical Learning Note):");
    lines.push(answer.learningNote);
    
    if (answer.references.length > 0) {
      lines.push("");
      lines.push("References:");
      answer.references.forEach((ref, idx) => {
        lines.push(`${idx + 1}. ${ref}`);
      });
    }
    
    lines.push("");
    lines.push("");
  });
  
  lines.push("=".repeat(60));
  lines.push("END OF QUIZ");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("This quiz is for learning and assessment, not opinion or prediction.");
  lines.push("Accuracy, clarity, and relevance to the property industry are mandatory.");
  lines.push("");
  lines.push(`Generated: ${new Date(quiz.createdAt).toLocaleString()}`);
  
  return lines.join("\n");
}

export function ExportQuiz({ quiz }: ExportQuizProps) {
  const handleExport = () => {
    const content = formatQuizAsPlainText(quiz);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-${quiz.topic.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Export Quiz</CardTitle>
          <CardDescription>
            Download the complete quiz with answers as a plain text file
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          data-testid="button-export-quiz"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">Plain Text Format (.txt)</p>
            <p className="text-muted-foreground">
              Clean, readable structure with no formatting symbols
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
