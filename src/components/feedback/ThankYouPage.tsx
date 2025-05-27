"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalyzeFeedbackSentimentOutput } from "@/ai/flows/analyze-feedback-sentiment";
import { CheckCircle, AlertTriangle, BrainCircuit } from "lucide-react";

interface ThankYouPageProps {
  analysisResult: AnalyzeFeedbackSentimentOutput | null;
  error?: string | null;
  onReset: () => void;
}

export function ThankYouPage({ analysisResult, error, onReset }: ThankYouPageProps) {
  return (
    <Card className="w-full shadow-xl animate-in fade-in duration-500">
      <CardHeader className="items-center text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
        <CardDescription className="text-lg">
          Your feedback has been successfully submitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive flex items-center justify-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <p>There was an issue analyzing your feedback: {error}</p>
          </div>
        )}
        {analysisResult && !error && (
          <div className="p-6 bg-secondary/50 rounded-lg shadow-inner space-y-4">
            <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-foreground">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <h3>Feedback Analysis Summary:</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-3 bg-background rounded-md shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Sentiment</p>
                <p className="text-lg font-semibold capitalize">{analysisResult.sentiment}</p>
              </div>
              <div className="p-3 bg-background rounded-md shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Topic</p>
                <p className="text-lg font-semibold capitalize">{analysisResult.topic}</p>
              </div>
              <div className="p-3 bg-background rounded-md shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold">{Math.round(analysisResult.confidence * 100)}%</p>
              </div>
            </div>
          </div>
        )}
        {!analysisResult && !error && (
            <p className="text-muted-foreground">Your feedback is valuable to us.</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onReset} variant="outline" size="lg">
          Submit Another Feedback
        </Button>
      </CardFooter>
    </Card>
  );
}
