import { describe, expect, it } from "vitest";
import { pdfHash } from "@/lib/purchases";
import type { WorkContent } from "@/types";
import { fullResume } from "../fixtures";

// pdfHash decides whether a free re-edit re-renders the PDF.
describe("pdfHash", () => {
  it("is stable when section ids change (steps re-insert sections on save)", () => {
    const a = fullResume();
    const b = structuredClone(a);
    b.sections = b.sections.map((s, i) => ({ ...s, id: `reinserted-${i}` }));
    expect(pdfHash("clean", b)).toBe(pdfHash("clean", a));
  });

  it("is stable when sections come back from the DB in another order", () => {
    const a = fullResume();
    const b = structuredClone(a);
    b.sections.reverse();
    expect(pdfHash("clean", b)).toBe(pdfHash("clean", a));
  });

  it("changes with content, theme or template", () => {
    const base = pdfHash("clean", fullResume());

    const edited = fullResume();
    (edited.sections[0].content as WorkContent).bullets[0] = "Different.";
    expect(pdfHash("clean", edited)).not.toBe(base);

    const recoloured = fullResume();
    recoloured.personalInfo.theme = "teal";
    expect(pdfHash("clean", recoloured)).not.toBe(base);

    expect(pdfHash("modern", fullResume())).not.toBe(base);
  });
});
