"use client";

import { Progress } from "@/components/ui/progress";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <Progress value={progressPercentage} aria-label={`Form progress: ${Math.round(progressPercentage)}% complete`} />
    </div>
  );
}
