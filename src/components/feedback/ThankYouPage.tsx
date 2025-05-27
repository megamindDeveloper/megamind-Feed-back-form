
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalyzeFeedbackSentimentOutput } from "@/ai/flows/analyze-feedback-sentiment";
import { CheckCircle, AlertTriangle, BrainCircuit, Smile, MessageSquareText, BarChartBig, ThumbsUp, ThumbsDown, Meh } from "lucide-react";

interface ThankYouPageProps {
  analysisResult: AnalyzeFeedbackSentimentOutput | null;
  error?: string | null;
  onReset: () => void;
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment === "positive") return <ThumbsUp className="h-6 w-6 text-green-500" />;
  if (lowerSentiment === "negative") return <ThumbsDown className="h-6 w-6 text-red-500" />;
  return <Meh className="h-6 w-6 text-yellow-500" />;
};

export function ThankYouPage({ analysisResult, error, onReset }: ThankYouPageProps) {
  return (
    <Card className="w-full shadow-2xl animate-in fade-in duration-500 border-border/60">
      <CardHeader className="items-center text-center py-10">
        <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
        <CardTitle className="text-4xl font-extrabold tracking-tight">Thank You!</CardTitle>
        <CardDescription className="text-xl text-muted-foreground mt-2">
          Your feedback has been successfully submitted. We appreciate your time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-6 pb-10 sm:px-10">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center justify-center space-x-3 text-base">
            <AlertTriangle className="h-6 w-6" />
            <p>There was an issue analyzing your feedback: {error}</p>
          </div>
        )}
        {analysisResult && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-3 text-xl font-semibold text-foreground">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <h2>Feedback Analysis Summary:</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background/70 p-4 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment</CardTitle>
                  <SentimentIcon sentiment={analysisResult.sentiment} />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold capitalize">{analysisResult.sentiment}</div>
                </CardContent>
              </Card>
              <Card className="bg-background/70 p-4 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Topic</CardTitle>
                  <MessageSquareText className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold capitalize">{analysisResult.topic}</div>
                </CardContent>
              </Card>
              <Card className="bg-background/70 p-4 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Confidence</CardTitle>
                   <BarChartBig className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-2xl font-bold">{Math.round(analysisResult.confidence * 100)}%</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {!analysisResult && !error && (
            <p className="text-center text-muted-foreground text-lg">
              We value your input and will use it to improve our services.
            </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center py-8">
        <Button onClick={onReset} variant="outline" size="lg" className="py-6 px-8 text-base">
          Submit Another Feedback
        </Button>
      </CardFooter>
    </Card>
  );
}
