import type { ResumeData } from "@/types";

// Word-level change measure for the free re-edit rule: how much of a purchased
// resume's text has been added, removed or rewritten since the purchase.
// Pure — safe on server and client.

/** Free re-edits must stay within this share of the purchased text. */
export const FREE_EDIT_LIMIT = 0.1;

// personalInfo keys that aren't resume text (styling / media)
const NON_TEXT_KEYS = new Set(["theme", "photoUrl"]);

function collectText(value: unknown, out: string[]): void {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectText(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectText(v, out));
}

/** All words in the resume, lower-cased, with HTML tags and entities stripped. */
export function resumeWords(data: ResumeData): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data.personalInfo ?? {})) {
    if (!NON_TEXT_KEYS.has(key)) collectText(value, parts);
  }
  for (const section of data.sections ?? [])
    collectText(section.content, parts);
  return parts
    .join(" ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#.@/-]+/u)
    .map((w) => w.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter(Boolean);
}

/**
 * Share of the original text that changed, 0 = identical. Words are compared as
 * a multiset: replacing one word counts once, adding or removing a word counts
 * once, reordering counts as no change.
 */
export function changeRatio(original: ResumeData, current: ResumeData): number {
  const counts = new Map<string, number>();
  const before = resumeWords(original);
  for (const w of before) counts.set(w, (counts.get(w) ?? 0) + 1);
  for (const w of resumeWords(current)) counts.set(w, (counts.get(w) ?? 0) - 1);

  let removed = 0;
  let added = 0;
  for (const n of counts.values()) {
    if (n > 0) removed += n;
    else added -= n;
  }
  return Math.max(removed, added) / Math.max(before.length, 1);
}
