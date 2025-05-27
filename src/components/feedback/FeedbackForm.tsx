"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackFormData } from "@/lib/schema";
import { analyzeFeedbackSentiment, type AnalyzeFeedbackSentimentOutput } from "@/ai/flows/analyze-feedback-sentiment";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, ArrowRight, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { StarRating } from "./StarRating";
import { StepIndicator } from "./StepIndicator";
import { ThankYouPage } from "./ThankYouPage";

const TOTAL_STEPS = 2;

export function FeedbackForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeFeedbackSentimentOutput | null>(null);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      experienceRating: 0, // Will be validated against min(1)
      positiveFeedback: "",
      improvementFeedback: "",
    },
    mode: "onChange", // show errors as user types
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const combinedFeedback = `Positive: ${data.positiveFeedback}\nCould be improved: ${data.improvementFeedback}`;
      const result = await analyzeFeedbackSentiment({ feedbackText: combinedFeedback });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      setAnalysisError((error as Error).message || "An unexpected error occurred during analysis.");
      toast({
        title: "Analysis Error",
        description: "Failed to analyze feedback sentiment. Your feedback is still recorded.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await form.trigger("experienceRating");
    }
    // No specific validation needed for step 2 before submission, as submit handles all fields.
    
    if (isValid || currentStep > 1) { // if currentStep is > 1, it implies previous steps were valid.
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep((prev) => prev + 1);
        }
    } else if (currentStep === TOTAL_STEPS) { // on the last step, trigger full form validation
        form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleResetForm = () => {
    form.reset();
    setCurrentStep(1);
    setIsSubmitted(false);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return <ThankYouPage analysisResult={analysisResult} error={analysisError} onReset={handleResetForm} />;
  }

  return (
    <Card className="w-full shadow-xl animate-in fade-in duration-500">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">FeedbackFlow</CardTitle>
            <CardDescription className="text-center text-md">
              Help us improve by sharing your experience.
            </CardDescription>
            <div className="pt-4">
              <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </div>
          </CardHeader>

          <CardContent className="space-y-8 min-h-[300px]"> {/* Added min-height for consistent form size */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="experienceRating"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel className="text-xl font-semibold mb-4">
                        How would you rate your overall experience?
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 0}
                          setRating={(value) => {
                            field.onChange(value);
                            form.trigger("experienceRating"); // Trigger validation on change
                          }}
                          size={40}
                        />
                      </FormControl>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <h2 className="text-xl font-semibold text-center mb-4">Tell us more details</h2>
                <FormField
                  control={form.control}
                  name="positiveFeedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-lg">
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                        <span>What went well?</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you liked or what was positive about your experience..."
                          {...field}
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="improvementFeedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-lg">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <span>What could be improved?</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe any areas for improvement or suggestions you have..."
                          {...field}
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isLoading}
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNextStep} disabled={isLoading} size="lg">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !form.formState.isValid} size="lg">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Feedback
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
