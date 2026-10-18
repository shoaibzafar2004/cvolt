import { z } from "zod";

export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().min(1, "Location is required"),
  linkedIn: z
    .union([z.url({ error: "Enter a valid URL" }), z.literal("")])
    .optional(),
  website: z
    .union([z.url({ error: "Enter a valid URL" }), z.literal("")])
    .optional(),
  photoUrl: z.string().optional(),
});

export const workEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  bullets: z.array(z.string()),
  skills: z.array(z.string()).optional(),
});

export const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

export const skillItemSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
});

export const skillsSchema = z.object({
  skills: z.array(skillItemSchema).min(1, "Add at least one skill"),
});

export const certificationEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().optional(),
  date: z.string().optional(),
});

export const languageEntrySchema = z.object({
  id: z.string(),
  language: z.string().min(1, "Language is required"),
  proficiency: z.string().optional(),
});

export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  url: z
    .union([z.url({ error: "Enter a valid URL" }), z.literal("")])
    .optional(),
  bullets: z.array(z.string()),
});

export const step3Schema = z.object({
  education: z.array(educationEntrySchema),
  skills: z.array(skillItemSchema).min(1, "Add at least one skill"),
  certifications: z.array(certificationEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
});

export const summarySchema = z.object({
  summary: z
    .string()
    .max(500, "Summary must be 500 characters or less")
    .optional(),
});

export const step2Schema = z.object({
  workEntries: z.array(workEntrySchema),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type WorkEntryFormData = z.infer<typeof workEntrySchema>;
export type EducationEntryFormData = z.infer<typeof educationEntrySchema>;
export type SkillItemData = z.infer<typeof skillItemSchema>;
export type SkillsFormData = z.infer<typeof skillsSchema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type SummaryFormData = z.infer<typeof summarySchema>;
