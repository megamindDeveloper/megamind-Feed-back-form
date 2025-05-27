
import { z } from "zod";

const roleOptions = [
  "CEO",
  "COO",
  "Managing Director",
  "CMO",
  "Head of Marketing",
  "Marketing Manager",
  "Brand Manager",
  "Project Manager",
  "Social Media Manager",
  "Other",
] as const;

const impactAssessmentOptions = [
  "Very Positive",
  "Positive",
  "Neutral",
  "Negative",
  "Very Negative",
] as const;

const ratingScaleOptions = ["1", "2", "3", "4", "5"] as const;

const likelihoodOptions = [
  "Very Likely",
  "Likely",
  "Neutral",
  "Unlikely",
  "Very Unlikely",
] as const;

export const feedbackSchema = z.object({
  // Step 1
  organizationName: z.string().min(1, "Organization name is required."),
  personName: z.string().min(1, "Your name is required."),
  role: z.enum(roleOptions, { required_error: "Please select your role." }),
  otherRole: z.string().optional(),

  // Step 2
  overallExperience: z.number().min(1, "Please rate your overall experience (1-5 stars).").max(5),
  impactAssessment: z.enum(impactAssessmentOptions, { required_error: "Please assess the impact." }),
  qualityOfService: z.number().min(1, "Please rate the quality of services (1-5 stars).").max(5),
  deliveryTime: z.number().min(1, "Please rate the delivery time (1-5 stars).").max(5),
  
  // Step 3
  brandStrategyAlignment: z.enum(ratingScaleOptions, { required_error: "Please rate brand strategy alignment." }),
  services_graphicDesign: z.boolean().optional().default(false),
  services_videography: z.boolean().optional().default(false),
  services_videoEditing: z.boolean().optional().default(false),
  services_websiteDevelopment: z.boolean().optional().default(false),
  services_socialMediaMarketing: z.boolean().optional().default(false),
  services_adFilm: z.boolean().optional().default(false),
  services_other: z.boolean().optional().default(false),
  services_other_detail: z.string().optional(),
  businessGoalsAlignment: z.enum(ratingScaleOptions, { required_error: "Please rate business goals alignment." }),
  deadlineAdherence: z.enum(ratingScaleOptions, { required_error: "Please rate deadline adherence." }),

  // Step 4
  feedbackIncorporation: z.enum(["yes", "no"], { required_error: "Please select if feedback was incorporated." }),
  digitalMarketingResults: z.enum(ratingScaleOptions, { required_error: "Please rate digital marketing results." }),
  contentCreationRating: z.enum(ratingScaleOptions, { required_error: "Please rate content creation." }),

  // Step 5
  pleasantSurprises: z.string().max(1000, "Pleasant surprises description cannot exceed 1000 characters.").optional(),
  teamResponseTime: z.enum(ratingScaleOptions, { required_error: "Please rate team response time." }),
  workingRelationship: z.string().min(10, "Please describe the working relationship (min 10 characters).").max(1000, "Cannot exceed 1000 characters."),
  futureServicesImprovements: z.string().max(1000, "Future services/improvements description cannot exceed 1000 characters.").optional(),
  
  // Step 6
  likelihoodToContinue: z.enum(likelihoodOptions, { required_error: "Please select likelihood to continue." }),
  likelihoodToRecommend: z.enum(likelihoodOptions, { required_error: "Please select likelihood to recommend." }),
  otherComments: z.string().min(10, "Please provide any other comments (min 10 characters).").max(1000, "Cannot exceed 1000 characters."),
})
.refine(data => {
  if (data.role === "Other") {
    return data.otherRole && data.otherRole.trim() !== "";
  }
  return true;
}, {
  message: "Please specify your role if 'Other' is selected.",
  path: ["otherRole"],
})
.superRefine((data, ctx) => {
  const anyServiceSelected = 
    data.services_graphicDesign || 
    data.services_videography || 
    data.services_videoEditing || 
    data.services_websiteDevelopment || 
    data.services_socialMediaMarketing || 
    data.services_adFilm || 
    data.services_other;

  if (!anyServiceSelected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select at least one service.",
      path: ["services_graphicDesign"], // Path for the first checkbox for simplicity
    });
  }

  if (data.services_other && (!data.services_other_detail || data.services_other_detail.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the 'Other' service.",
      path: ["services_other_detail"],
    });
  }
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

// Constants for options to be used in the form
export const ROLE_OPTIONS = roleOptions;
export const IMPACT_ASSESSMENT_OPTIONS = impactAssessmentOptions;
export const RATING_SCALE_OPTIONS = ratingScaleOptions;
export const LIKELIHOOD_OPTIONS = likelihoodOptions;

export const SERVICE_OPTIONS = [
  { id: "services_graphicDesign", label: "Graphic Designing" },
  { id: "services_videography", label: "Videography" },
  { id: "services_videoEditing", label: "Video Editing" },
  { id: "services_websiteDevelopment", label: "Website Development" },
  { id: "services_socialMediaMarketing", label: "Social Media Marketing" },
  { id: "services_adFilm", label: "Ad Film" },
  { id: "services_other", label: "Other" },
] as const;
type ServiceOptionKey = typeof SERVICE_OPTIONS[number]["id"];
export type ServiceOptionField = ServiceOptionKey;

