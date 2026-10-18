import {
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  AlignLeft,
  type LucideIcon,
} from "lucide-react";

// Single source of truth for the /build steps. Used by the step wrapper,
// the ?step= URL parsing, and the "Edit your resume" links on template previews.
export const BUILD_STEPS: {
  step: number;
  label: string;
  sublabel: string;
  icon: LucideIcon;
}[] = [
  {
    step: 1,
    label: "Personal info",
    sublabel: "Name, title, contact",
    icon: User,
  },
  {
    step: 2,
    label: "Work experience",
    sublabel: "Jobs and achievements",
    icon: Briefcase,
  },
  {
    step: 3,
    label: "Projects",
    sublabel: "Side projects, open source",
    icon: FolderGit2,
  },
  {
    step: 4,
    label: "Education & skills",
    sublabel: "Degrees, skills, extras",
    icon: GraduationCap,
  },
  {
    step: 5,
    label: "Summary",
    sublabel: "Professional overview",
    icon: AlignLeft,
  },
];

export const TOTAL_STEPS = BUILD_STEPS.length;
