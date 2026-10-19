import type { CSSProperties, ReactNode } from "react";
import { linkHref } from "@/lib/resume-format";

// Clickable link inside a resume template — becomes a live link in the PDF.
// Inherits colour and decoration so it looks exactly like the text it wraps.
export default function ResumeLink({
  href,
  kind = "url",
  style,
  children,
}: {
  href?: string;
  kind?: "url" | "email" | "phone";
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (!href) return <>{children}</>;
  return (
    <a
      href={linkHref(href, kind)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "inherit", textDecoration: "none", ...style }}
    >
      {children}
    </a>
  );
}
