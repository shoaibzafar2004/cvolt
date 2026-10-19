import { describe, expect, it } from "vitest";
import { changeRatio, FREE_EDIT_LIMIT, resumeWords } from "@/lib/resume-diff";
import type { ResumeData, WorkContent } from "@/types";
import { fullResume } from "../fixtures";

function withFirstBullet(data: ResumeData, bullet: string): ResumeData {
  const copy = structuredClone(data);
  (copy.sections[0].content as WorkContent).bullets[0] = bullet;
  return copy;
}

describe("resumeWords", () => {
  it("strips HTML tags and entities and lower-cases", () => {
    const words = resumeWords(fullResume());
    expect(words).toContain("payments");
    expect(words).toContain("mentored");
    expect(words).not.toContain("<strong>");
    expect(words.some((w) => w.includes("nbsp"))).toBe(false);
  });

  it("ignores styling fields (theme, photo)", () => {
    const a = fullResume();
    const b = structuredClone(a);
    b.personalInfo.theme = "teal";
    b.personalInfo.photoUrl = "data:image/png;base64,AAAA";
    expect(resumeWords(b)).toEqual(resumeWords(a));
  });
});

describe("changeRatio", () => {
  it("is 0 for identical resumes", () => {
    expect(changeRatio(fullResume(), fullResume())).toBe(0);
  });

  it("is 0 when only section ids or order change", () => {
    const a = fullResume();
    const b = structuredClone(a);
    b.sections = b.sections.reverse().map((s, i) => ({ ...s, id: `new${i}` }));
    expect(changeRatio(a, b)).toBe(0);
  });

  it("is 0 for a colour theme change", () => {
    const b = fullResume();
    b.personalInfo.theme = "burgundy";
    expect(changeRatio(fullResume(), b)).toBe(0);
  });

  it("counts a one-word change as small and within the free limit", () => {
    const a = fullResume();
    const b = withFirstBullet(
      a,
      "Drove the <strong>payments</strong> rewrite, cutting checkout errors by 40%.",
    );
    const ratio = changeRatio(a, b);
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(FREE_EDIT_LIMIT);
  });

  it("counts a same-length rewrite as a change (char count would miss it)", () => {
    const a = fullResume();
    const original = (a.sections[0].content as WorkContent).bullets[0];
    const rewrite = "x".repeat(original.length);
    expect(changeRatio(a, withFirstBullet(a, rewrite))).toBeGreaterThan(0);
  });

  it("exceeds the free limit when a lot of new text is added", () => {
    const a = fullResume();
    const b = withFirstBullet(a, "brand new achievement text ".repeat(40));
    expect(changeRatio(a, b)).toBeGreaterThan(FREE_EDIT_LIMIT);
  });

  it("exceeds the free limit when most text is removed", () => {
    const a = fullResume();
    const b = structuredClone(a);
    b.sections = b.sections.filter((s) => s.type === "skills");
    expect(changeRatio(a, b)).toBeGreaterThan(FREE_EDIT_LIMIT);
  });
});
