import { z } from "zod";

export const feedbackSchema = z.object({
  experienceRating: z.number({
    required_error: "Please select a rating.",
    invalid_type_error: "Please select a rating.",
  }).min(1, "Please select a rating from 1 to 5 stars.").max(5, "Rating cannot exceed 5 stars."),
  positiveFeedback: z.string()
    .min(10, "Please provide at least 10 characters for what went well.")
    .max(1000, "Positive feedback cannot exceed 1000 characters."),
  improvementFeedback: z.string()
    .min(10, "Please provide at least 10 characters for areas of improvement.")
    .max(1000, "Improvement feedback cannot exceed 1000 characters."),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
