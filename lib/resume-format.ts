import type { ProjectContent } from "@/types";

// Pure display helpers shared by resume templates (safe for renderToStaticMarkup).

/** "Jan 2023 – Present", "Jan 2023 – Mar 2024", "Mar 2024", or "" when no dates are set. */
export function dateRange(
  start?: string,
  end?: string,
  current?: boolean,
): string {
  const to = current ? "Present" : end;
  if (start && to) return `${start} – ${to}`;
  return start || to || "";
}

export function projectDates(p: ProjectContent): string {
  return dateRange(p.startDate, p.endDate, p.current);
}

/** Secondary line for a project: role and, for contributions, the entry type. */
export function projectMeta(p: ProjectContent): string {
  return [p.role, p.kind === "contribution" ? "Open-source contribution" : ""]
    .filter(Boolean)
    .join(" · ");
}

/** URL without protocol or trailing slash, e.g. "github.com/you/project". */
export function displayUrl(url?: string): string {
  return (url ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** href for a contact value or URL: mailto:/tel: for email and phone, https:// added when missing. */
export function linkHref(
  value: string,
  kind: "url" | "email" | "phone" = "url",
): string {
  const v = value.trim();
  if (kind === "email") return `mailto:${v}`;
  if (kind === "phone") return `tel:${v.replace(/[^\d+]/g, "")}`;
  return /^[a-z][a-z\d+.-]*:/i.test(v) ? v : `https://${v}`;
}
