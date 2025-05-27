"use client";

import * as React from "react";
import Image from "next/image"; // Added Image import
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  feedbackSchema,
  type FeedbackFormData,
  ROLE_OPTIONS,
  IMPACT_ASSESSMENT_OPTIONS,
  RATING_SCALE_OPTIONS,
  LIKELIHOOD_OPTIONS,
  SERVICE_OPTIONS,
  type ServiceOptionField,
} from "@/lib/schema";
import { analyzeFeedbackSentiment, type AnalyzeFeedbackSentimentOutput } from "@/ai/flows/analyze-feedback-sentiment";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { StarRating } from "./StarRating";
import { StepIndicator } from "./StepIndicator";
import { ThankYouPage } from "./ThankYouPage";

const TOTAL_STEPS = 6;

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
      organizationName: "",
      personName: "",
      // role: undefined, // Will be set by Select
      otherRole: "",
      overallExperience: 0,
      // impactAssessment: undefined, // Will be set by RadioGroup
      qualityOfService: 0,
      deliveryTime: 0,
      // brandStrategyAlignment: undefined,
      services_graphicDesign: false,
      services_videography: false,
      services_videoEditing: false,
      services_websiteDevelopment: false,
      services_socialMediaMarketing: false,
      services_adFilm: false,
      services_other: false,
      services_other_detail: "",
      // businessGoalsAlignment: undefined,
      // deadlineAdherence: undefined,
      // feedbackIncorporation: undefined,
      // digitalMarketingResults: undefined,
      // contentCreationRating: undefined,
      pleasantSurprises: "",
      // teamResponseTime: undefined,
      workingRelationship: "",
      futureServicesImprovements: "",
      // likelihoodToContinue: undefined,
      // likelihoodToRecommend: undefined,
      otherComments: "",
    },
    mode: "onChange",
  });

  const watchedRole = form.watch("role");
  const watchedServicesOther = form.watch("services_other");

  const onSubmit = async (data: FeedbackFormData) => {
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // Step 1: Send data to Next.js API route
      const sheetResponse = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!sheetResponse.ok) {
        const errorData = await sheetResponse.json();
        throw new Error(errorData.error || "Failed to save feedback to Google Sheet");
      }

      // Step 2: Perform sentiment analysis
      const feedbackParts = [];
      if (data.workingRelationship) feedbackParts.push(`Working Relationship: ${data.workingRelationship}`);
      if (data.otherComments) feedbackParts.push(`Other Comments: ${data.otherComments}`);
      if (data.pleasantSurprises) feedbackParts.push(`Pleasant Surprises: ${data.pleasantSurprises}`);
      if (data.futureServicesImprovements) feedbackParts.push(`Future Services/Improvements: ${data.futureServicesImprovements}`);

      const combinedFeedback = feedbackParts.join("\n\n");

      const analysisResult = await analyzeFeedbackSentiment({
        feedbackText: combinedFeedback || "No detailed textual feedback provided.",
      });
      setAnalysisResult(analysisResult);

      // Show success toast
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable input. Your feedback has been recorded and analyzed.",
      });
    } catch (error) {
      console.error("Error during submission:", error);
      setAnalysisError((error as Error).message || "An unexpected error occurred during submission.");
      toast({
        title: "Submission Error",
        description: "Failed to process feedback. Your feedback may not have been recorded.",
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
      isValid = await form.trigger(["organizationName", "personName", "role", "otherRole"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["overallExperience", "impactAssessment", "qualityOfService", "deliveryTime"]);
    } else if (currentStep === 3) {
      const serviceFieldsToTrigger: ServiceOptionField[] = SERVICE_OPTIONS.map((s) => s.id) as ServiceOptionField[];
      serviceFieldsToTrigger.push("services_other_detail" as ServiceOptionField);
      isValid = await form.trigger(["brandStrategyAlignment", ...serviceFieldsToTrigger, "businessGoalsAlignment", "deadlineAdherence"]);
    } else if (currentStep === 4) {
      isValid = await form.trigger(["feedbackIncorporation", "digitalMarketingResults", "contentCreationRating"]);
    } else if (currentStep === 5) {
      isValid = await form.trigger(["teamResponseTime", "workingRelationship", "pleasantSurprises", "futureServicesImprovements"]);
    }
    // Step 6 will be handled by the submit button directly

    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      // Optional: scroll to the first error
      const firstErrorField = Object.keys(form.formState.errors)[0] as keyof FeedbackFormData;
      if (firstErrorField) {
        const element = document.getElementsByName(firstErrorField)[0];
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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

  const renderRadioGroup = (field: any, options: readonly string[], description?: string) => (
    <RadioGroup
      onValueChange={field.onChange}
      defaultValue={field.value}
      className="flex flex-col space-y-2 pt-1 sm:flex-row sm:space-y-0 sm:space-x-4"
    >
      {options.map((option) => (
        <FormItem key={option} className="flex items-center space-x-2 space-y-0">
          <FormControl>
            <RadioGroupItem value={option} />
          </FormControl>
          <FormLabel className="font-normal">{option}</FormLabel>
        </FormItem>
      ))}
      {description && <FormDescription>{description}</FormDescription>}
    </RadioGroup>
  );

  return (
    <Card className="w-full shadow-2xl animate-in fade-in duration-500 border-border/60">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="Megamind Logo"
                width={200}
                height={50}
                data-ai-hint="megamind logo"
                priority // Optional: if logo is critical for LCP
              />
            </div>
            <CardTitle className="text-4xl font-extrabold text-center text-primary tracking-tight">Feedback for Megamind</CardTitle>
            <CardDescription className="text-center text-muted-foreground text-lg pt-1">
              Your insights help us grow. Please take a few moments to share your experience.
            </CardDescription>
            <div className="pt-6">
              <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 min-h-[420px] max-h-[65vh] overflow-y-auto p-8 pr-5">
            {/* Step 1: Organisation Info */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">1. Organisation Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company's name" {...field} className="text-base py-5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">2. Name of the person *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} className="text-base py-5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">3. Position/Role in the Organisation *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base py-5">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-base">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedRole === "Other" && (
                  <FormField
                    control={form.control}
                    name="otherRole"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel className="text-base">Please specify your role *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your specific role" {...field} className="text-base py-5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Step 2: Overall Experience & Impact */}
            {currentStep === 2 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="overallExperience"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormLabel className="text-base mt-2">4. How would you rate your overall experience with Megamind? *</FormLabel>
                      <FormControl>
                        <StarRating rating={field.value || 0} setRating={field.onChange} size={36} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="impactAssessment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        5. How would you assess the impact and results of our services on your brand? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, IMPACT_ASSESSMENT_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualityOfService"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormLabel className="text-base mt-2">6. Quality of services provided *</FormLabel>
                      <FormControl>
                        <StarRating rating={field.value || 0} setRating={field.onChange} size={36} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start">
                      <FormLabel className="text-base mt-2">7. Delivery Time of services *</FormLabel>
                      <FormControl>
                        <StarRating rating={field.value || 0} setRating={field.onChange} size={36} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Service Specifics */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="brandStrategyAlignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        8. How would you rate our Brand Strategy in terms of aligning with your business (1=Poor, 5=Excellent)? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, RATING_SCALE_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="text-base mt-2">9. Which service(s) did we provide for you? *</FormLabel>
                  <div className="space-y-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    {SERVICE_OPTIONS.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name={service.id as ServiceOptionField}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 bg-secondary/50 rounded-md border border-border/30 hover:border-primary/50 transition-colors">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5" />
                            </FormControl>
                            <FormLabel className="font-normal text-base">{service.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage>
                    {form.formState.errors[SERVICE_OPTIONS[0].id as ServiceOptionField]?.message ||
                      form.formState.errors.services_other_detail?.message}
                  </FormMessage>
                </FormItem>

                {watchedServicesOther && (
                  <FormField
                    control={form.control}
                    name="services_other_detail"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel className="text-base">Please specify other service(s) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Details for other service" {...field} className="text-base py-5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="businessGoalsAlignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        10. How well do our services align with your business goals this month (1=Poorly, 5=Perfectly)? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, RATING_SCALE_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadlineAdherence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        11. How would you rate our ability to meet deadlines this month (1=Poor, 5=Excellent)? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, RATING_SCALE_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 4: Feedback & Marketing Performance */}
            {currentStep === 4 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="feedbackIncorporation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        12. Do you feel your feedback and requests were understood and incorporated into the work? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, ["yes", "no"])}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="digitalMarketingResults"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        13. How would you rate our Digital Marketing services in driving measurable results for your business (1=Poor, 5=Excellent)? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, RATING_SCALE_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentCreationRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        14. How would you rate our Content Creation & Creative in representing your brand (1=Poor, 5=Excellent)? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, RATING_SCALE_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 5: Open Feedback & Team Interaction */}
            {currentStep === 5 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="pleasantSurprises"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        15. Were there any deliverables that pleasantly surprised you? If so, we would love to know which ones and what made them
                        stand out for you.
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe any pleasant surprises..." {...field} rows={4} className="text-base py-3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamResponseTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        16. How well did the team respond to your enquiries (1=Poorly, 5=Excellently)? *
                      </FormLabel>
                      <FormControl>{renderRadioGroup(field, RATING_SCALE_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workingRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        17. How would you describe the overall working relationship with our team? (Please specify any areas where we fell short) *
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your working relationship..." {...field} rows={5} className="text-base py-3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="futureServicesImprovements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">
                        18. Are there any additional services or improvements you would like to see in the coming months?
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Suggestions for future services or improvements..." {...field} rows={4} className="text-base py-3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 6: Likelihood & Final Comments */}
            {currentStep === 6 && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <FormField
                  control={form.control}
                  name="likelihoodToContinue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">19. How likely are you to continue using our service in the coming months? *</FormLabel>
                      <FormControl>{renderRadioGroup(field, LIKELIHOOD_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="likelihoodToRecommend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">20. How likely are you to recommend Megamind to others? *</FormLabel>
                      <FormControl>{renderRadioGroup(field, LIKELIHOOD_OPTIONS)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mt-2">21. Any other comments or suggestions for improvement? *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your final thoughts..." {...field} rows={5} className="text-base py-3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-8 pb-8 px-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || isLoading}
              size="lg"
              className="py-6 px-6 text-base"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Previous
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNextStep} disabled={isLoading} size="lg" className="py-6 px-8 text-base">
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isDirty || (form.formState.isDirty && !form.formState.isValid)}
                size="lg"
                className="py-6 px-8 text-base"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                Submit
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
