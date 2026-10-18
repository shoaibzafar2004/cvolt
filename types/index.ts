export type SectionType =
  "work" | "education" | "skills" | "certifications" | "languages" | "projects";

export interface PersonalInfo {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  photoUrl?: string;
  summary?: string;
  theme?: string;
}

export interface WorkContent {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
  skills?: string[];
}

export interface EducationContent {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface SkillItem {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface SkillsContent {
  skills: SkillItem[];
}

export interface CertificationContent {
  name: string;
  issuer?: string;
  date?: string;
}

export interface LanguageContent {
  language: string;
  proficiency?: string;
}

export type ProjectKind = "project" | "contribution";

// Entries saved before the Projects step existed only have name, description, url and bullets.
export interface ProjectContent {
  name: string;
  kind?: ProjectKind; // treated as "project" when missing
  role?: string;
  url?: string;
  description?: string;
  techStack?: string[];
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export type SectionContent =
  | WorkContent
  | EducationContent
  | SkillsContent
  | CertificationContent[]
  | LanguageContent[]
  | ProjectContent[];

export interface Section {
  id: string;
  type: SectionType;
  content: SectionContent;
  displayOrder: number;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: Section[];
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
  isActive: boolean;
  category: "clean" | "modern" | "creative";
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  snapshotId: string | null;
  templateId: string;
  stripePaymentId?: string;
  safepayPaymentId?: string;
  amount: number;
  currency: "usd" | "pkr";
  status: "pending" | "completed" | "failed";
  purchasedAt: string;
  expiresAt: string;
}

export interface ResumeSnapshot {
  id: string;
  resumeId: string;
  paymentId: string;
  snapshotData: ResumeData;
  charCount: number;
  createdAt: string;
}
