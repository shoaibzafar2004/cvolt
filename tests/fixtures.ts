import type { ResumeData } from "@/types";

/** A complete resume touching every section type and contact field. */
export function fullResume(): ResumeData {
  return {
    personalInfo: {
      name: "Alex Morgan",
      jobTitle: "Senior Software Engineer",
      email: "alex@example.com",
      phone: "+1 (555) 010-2030",
      location: "Berlin, Germany",
      linkedIn: "linkedin.com/in/alex-morgan",
      github: "https://github.com/alexmorgan",
      website: "alexmorgan.dev",
      summary:
        "Engineer with ten years of experience building web platforms and payment systems.",
      theme: "navy",
    },
    sections: [
      {
        id: "w1",
        type: "work",
        displayOrder: 0,
        content: {
          company: "Acme Corp",
          role: "Senior Software Engineer",
          startDate: "2021-03",
          current: true,
          bullets: [
            "Led the <strong>payments</strong> rewrite, cutting checkout errors by 40%.",
            "Mentored&nbsp;four engineers and ran the hiring loop.",
          ],
          skills: ["TypeScript", "React"],
        },
      },
      {
        id: "w2",
        type: "work",
        displayOrder: 1,
        content: {
          company: "Globex",
          role: "Software Engineer",
          startDate: "2017-06",
          endDate: "2021-02",
          current: false,
          bullets: ["Built the reporting API used by 200 customers."],
        },
      },
      {
        id: "p1",
        type: "projects",
        displayOrder: 0,
        content: [
          {
            name: "OpenThing",
            kind: "contribution",
            role: "Maintainer",
            url: "https://github.com/alexmorgan/openthing",
            description: "A small open-source library.",
            techStack: ["Rust"],
            bullets: ["Shipped v2 with a plugin API."],
          },
        ],
      },
      {
        id: "e1",
        type: "education",
        displayOrder: 0,
        content: {
          institution: "TU Berlin",
          degree: "BSc",
          field: "Computer Science",
          startDate: "2013-10",
          endDate: "2017-03",
        },
      },
      {
        id: "s1",
        type: "skills",
        displayOrder: 0,
        content: {
          skills: [
            { name: "TypeScript", level: "Expert" },
            { name: "Postgres", level: "Advanced" },
          ],
        },
      },
      {
        id: "c1",
        type: "certifications",
        displayOrder: 0,
        content: [
          {
            name: "AWS Solutions Architect",
            issuer: "Amazon",
            date: "2023-05",
            url: "https://www.credly.com/badges/abc123",
            skills: ["AWS"],
          },
        ],
      },
      {
        id: "l1",
        type: "languages",
        displayOrder: 0,
        content: [{ language: "English", proficiency: "Native" }],
      },
    ],
  };
}

/** Only the required fields — what a user has after step 1. */
export function minimalResume(): ResumeData {
  return {
    personalInfo: {
      name: "Sam Lee",
      jobTitle: "Designer",
      email: "sam@example.com",
      phone: "123",
      location: "Lisbon",
    },
    sections: [],
  };
}
