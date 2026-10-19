import { Fragment, type CSSProperties } from "react";
import type { CertificationContent } from "@/types";
import { displayUrl } from "@/lib/resume-format";
import ResumeLink from "./ResumeLink";

// Optional credential link + "skill · skill" line under a certification.
// Each template passes its own colours so the extras match its styling.
export default function CertExtras({
  cert,
  linkColor,
  mutedColor,
  fontSize = 9.5,
  style,
}: {
  cert: CertificationContent;
  linkColor: string;
  mutedColor: string;
  fontSize?: number;
  style?: CSSProperties;
}) {
  const skills = (cert.skills ?? []).filter(Boolean);
  if (!cert.url && skills.length === 0) return null;
  return (
    <div style={{ fontSize, lineHeight: 1.45, marginTop: 2, ...style }}>
      {cert.url && (
        <ResumeLink
          href={cert.url}
          style={{
            display: "block",
            color: linkColor,
            overflowWrap: "anywhere",
          }}
        >
          {/* Prefer wrapping after "/" rather than mid-word in narrow columns */}
          {displayUrl(cert.url)
            .split("/")
            .map((part, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <>
                    /<wbr />
                  </>
                )}
                {part}
              </Fragment>
            ))}
        </ResumeLink>
      )}
      {skills.length > 0 && (
        <div style={{ color: mutedColor }}>{skills.join(" · ")}</div>
      )}
    </div>
  );
}
