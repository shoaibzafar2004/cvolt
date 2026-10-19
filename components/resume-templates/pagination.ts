import type { CSSProperties } from "react";

// Shared print-pagination styles for resume templates (PDFs are printed with
// zero page margins, so templates control spacing across page breaks).

/** Padding and borders repeat on every page this box spans, giving continuation pages a top/bottom margin. */
export const REPEAT_PADDING: CSSProperties = {
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};

/** Never split this box, and never end a page right after it (headings, entry headers). */
export const KEEP_WITH_NEXT: CSSProperties = {
  breakInside: "avoid",
  breakAfter: "avoid",
};

/** Never split this box across pages (a bullet, a tag row, a small entry). */
export const NO_SPLIT: CSSProperties = { breakInside: "avoid" };

/**
 * Print-only page background, for layouts whose coloured columns must reach
 * the bottom of every page (including the last one, below the content).
 * `stops` is a horizontal linear-gradient stop list across the 794px page.
 */
export function printPageBackground(stops: string): string {
  return `@media print { html { background: #ffffff linear-gradient(to right, ${stops}) repeat-y !important; } }`;
}

/** Never split this box, and never put a page break right before it (first bullet of an entry). */
export const KEEP_WITH_PREV: CSSProperties = {
  breakInside: "avoid",
  breakBefore: "avoid",
};
