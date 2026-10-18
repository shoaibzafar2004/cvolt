import type {
  ResumeData,
  WorkContent,
  EducationContent,
  SkillsContent,
  CertificationContent,
  LanguageContent,
  ProjectContent,
} from "@/types";

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Font: Libre Franklin — clean geometric sans-serif.
// Layout:
//   — Dark full-width header: giant letter-spaced name + job subtitle
//   — White two-column body:
//       Left  (~58%): Experience · Education
//       Right (~42%): Contact (icon badges) · Summary · Skills · Languages · Certs
// Section headings: bold uppercase + thin line extending right.
// No photo. ATS-friendly, professional.
// A4: 794px × 1123px

const PAD = 44; // horizontal body padding
const GAP = 28; // gap between columns
const COL_TOT = 794 - PAD * 2; // 706
const LEFT_W = Math.round(COL_TOT * 0.57); // 402
const RIGHT_W = COL_TOT - GAP - LEFT_W; // 276

const BODY = "#2d2d2d";
const MUTED = "#6b7280";
const RULE = "#e0e4ea";

export const BOLD_HEADER_THEMES: Record<
  string,
  {
    label: string;
    sidebarBg: string; // header gradient start (also ThemePicker left swatch)
    gradientEnd: string; // header gradient end
    accent: string; // headings, icons, dates
  }
> = {
  navy: {
    label: "Navy",
    sidebarBg: "#1a2744",
    gradientEnd: "#2d6a9f",
    accent: "#1a2744",
  },
  teal: {
    label: "Teal",
    sidebarBg: "#0d3d3d",
    gradientEnd: "#0d9488",
    accent: "#0d9488",
  },
  charcoal: {
    label: "Charcoal",
    sidebarBg: "#2d2d3e",
    gradientEnd: "#6b5b9a",
    accent: "#4f4f7a",
  },
};

export default function BoldHeaderTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data;
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  const {
    sidebarBg: HEADER_START,
    gradientEnd: HEADER_END,
    accent: ACCENT,
  } = BOLD_HEADER_THEMES[p.theme ?? "navy"] ?? BOLD_HEADER_THEMES.navy;

  const work = sorted.filter((s) => s.type === "work");
  const education = sorted.filter((s) => s.type === "education");
  const skillsSec = sorted.find((s) => s.type === "skills");
  const certSec = sorted.find((s) => s.type === "certifications");
  const langSec = sorted.find((s) => s.type === "languages");
  const projSec = sorted.find((s) => s.type === "projects");

  const skills = skillsSec ? (skillsSec.content as SkillsContent).skills : [];
  const certs = certSec ? (certSec.content as CertificationContent[]) : [];
  const langs = langSec ? (langSec.content as LanguageContent[]) : [];
  const projects = projSec ? (projSec.content as ProjectContent[]) : [];

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        backgroundColor: "#ffffff",
        fontFamily: '"Libre Franklin", Arial, sans-serif',
        fontSize: 11,
        color: BODY,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 300; src: url('/fonts/libre-franklin-300.woff2') format('woff2'); }
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 400; src: url('/fonts/libre-franklin-400.woff2') format('woff2'); }
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 600; src: url('/fonts/libre-franklin-600.woff2') format('woff2'); }
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 700; src: url('/fonts/libre-franklin-700.woff2') format('woff2'); }
      `,
        }}
      />

      {/* ══════════════════════════════════════
          FULL-WIDTH HEADER
      ══════════════════════════════════════ */}
      <div
        style={{
          background: `linear-gradient(135deg, ${HEADER_START} 0%, ${HEADER_END} 100%)`,
          padding: "36px 44px 32px",
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        {/* Name — giant, centered, thick */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 500,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: 12,
            lineHeight: 1,
            marginBottom: 14,
            textShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          {p.name || "Your Name"}
        </div>
        {/* Centered thin rule */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.3)",
            marginBottom: 12,
            marginInline: "auto",
            width: "60%",
          }}
        />
        {/* Job title — centered */}
        {p.jobTitle && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            {p.jobTitle}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          TWO-COLUMN BODY
      ══════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          gap: GAP,
          padding: `32px ${PAD}px 40px`,
          flex: 1,
        }}
      >
        {/* ── LEFT column: Experience + Education + Projects ── */}
        <div style={{ width: LEFT_W, flexShrink: 0 }}>
          {/* Experience */}
          {work.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <ColHeading title="Experience" accent={ACCENT} />
              {work.map((s, idx) => {
                const c = s.content as WorkContent;
                return (
                  <div
                    key={s.id}
                    style={{
                      marginBottom: idx < work.length - 1 ? 18 : 0,
                      pageBreakInside: "avoid",
                    }}
                  >
                    {/* Role title */}
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: BODY,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 1,
                      }}
                    >
                      {c.role}
                    </div>
                    {/* Company */}
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: ACCENT,
                        marginBottom: 1,
                      }}
                    >
                      {c.company}
                    </div>
                    {/* Dates */}
                    {(c.startDate || c.endDate || c.current) && (
                      <div
                        style={{
                          fontSize: 9.5,
                          color: MUTED,
                          marginBottom: 6,
                          fontStyle: "italic",
                        }}
                      >
                        {c.startDate}
                        {c.startDate && (c.current || c.endDate)
                          ? ` – ${c.current ? "Present" : c.endDate}`
                          : ""}
                      </div>
                    )}
                    {/* Bullets */}
                    {c.bullets.filter(Boolean).map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 7,
                          marginBottom: 3,
                          fontSize: 10.5,
                          lineHeight: 1.65,
                          color: BODY,
                        }}
                      >
                        <span
                          style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}
                        >
                          •
                        </span>
                        <div dangerouslySetInnerHTML={{ __html: b }} />
                      </div>
                    ))}
                    {c.skills && c.skills.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "3px 5px",
                          marginTop: 5,
                        }}
                      >
                        {c.skills.map((sk, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 9,
                              color: ACCENT,
                              border: `1px solid ${ACCENT}55`,
                              padding: "1px 6px",
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <ColHeading title="Education" accent={ACCENT} />
              {education.map((s, idx) => {
                const c = s.content as EducationContent;
                return (
                  <div
                    key={s.id}
                    style={{
                      marginBottom: idx < education.length - 1 ? 14 : 0,
                      pageBreakInside: "avoid",
                    }}
                  >
                    {/* Dates */}
                    {(c.startDate || c.endDate) && (
                      <div
                        style={{
                          fontSize: 9.5,
                          color: MUTED,
                          fontStyle: "italic",
                          marginBottom: 2,
                        }}
                      >
                        {c.startDate && c.endDate
                          ? `${c.startDate} – ${c.endDate}`
                          : (c.endDate ?? c.startDate)}
                      </div>
                    )}
                    {/* Institution */}
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: BODY,
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                        marginBottom: 1,
                      }}
                    >
                      {c.institution}
                    </div>
                    {/* Degree */}
                    <div style={{ fontSize: 10.5, color: MUTED }}>
                      {c.degree}
                      {c.field ? `, ${c.field}` : ""}
                    </div>
                    {c.gpa && (
                      <div
                        style={{ fontSize: 9.5, color: MUTED, marginTop: 1 }}
                      >
                        GPA: {c.gpa}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <ColHeading title="Projects" accent={ACCENT} />
              {projects.map((proj, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i < projects.length - 1 ? 16 : 0,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: BODY,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 1,
                    }}
                  >
                    {proj.name}
                    {proj.url && (
                      <span
                        style={{
                          fontWeight: 400,
                          color: MUTED,
                          fontSize: 9.5,
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        {" "}
                        · {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <div
                      style={{
                        fontSize: 10,
                        color: MUTED,
                        fontStyle: "italic",
                        marginBottom: 4,
                      }}
                    >
                      {proj.description}
                    </div>
                  )}
                  {proj.bullets.filter(Boolean).map((b, j) => (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        gap: 7,
                        marginBottom: 3,
                        fontSize: 10.5,
                        lineHeight: 1.65,
                        color: BODY,
                      }}
                    >
                      <span
                        style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}
                      >
                        •
                      </span>
                      <div dangerouslySetInnerHTML={{ __html: b }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vertical rule */}
        <div style={{ width: 1, backgroundColor: RULE, flexShrink: 0 }} />

        {/* ── RIGHT column: Contact + Summary + Skills + Languages + Certs ── */}
        <div style={{ width: RIGHT_W, flexShrink: 0 }}>
          {/* Contact */}
          <div style={{ marginBottom: 26 }}>
            <ColHeading title="Contact" accent={ACCENT} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.phone && (
                <ContactRow icon="✆" text={p.phone} accent={ACCENT} />
              )}
              {p.email && (
                <ContactRow icon="✉" text={p.email} accent={ACCENT} wrap />
              )}
              {p.location && (
                <ContactRow icon="◉" text={p.location} accent={ACCENT} />
              )}
              {p.linkedIn && (
                <ContactRow icon="in" text={p.linkedIn} accent={ACCENT} wrap />
              )}
              {p.github && (
                <ContactRow icon="gh" text={p.github} accent={ACCENT} wrap />
              )}
              {p.website && (
                <ContactRow icon="⊕" text={p.website} accent={ACCENT} wrap />
              )}
            </div>
          </div>

          {/* Summary */}
          {p.summary && (
            <div style={{ marginBottom: 26 }}>
              <ColHeading title="Summary" accent={ACCENT} />
              <p
                style={{
                  margin: 0,
                  fontSize: 10.5,
                  lineHeight: 1.8,
                  color: MUTED,
                }}
              >
                {p.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <ColHeading title="Skills" accent={ACCENT} />
              {skills.map((sk, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 6,
                    fontSize: 10.5,
                    color: BODY,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: ACCENT,
                      flexShrink: 0,
                    }}
                  />
                  {sk.name}
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <ColHeading title="Languages" accent={ACCENT} />
              {langs.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 6,
                    fontSize: 10.5,
                    color: BODY,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: ACCENT,
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    {l.language}
                    {l.proficiency ? (
                      <span style={{ color: MUTED }}> · {l.proficiency}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <ColHeading title="Certifications" accent={ACCENT} />
              {certs.map((c, i) => (
                <div
                  key={i}
                  style={{ marginBottom: 10, pageBreakInside: "avoid" }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: BODY }}>
                    {c.name}
                  </div>
                  {c.issuer && (
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>
                      {c.issuer}
                    </div>
                  )}
                  {c.date && (
                    <div
                      style={{
                        fontSize: 9.5,
                        color: ACCENT,
                        marginTop: 1,
                        fontStyle: "italic",
                      }}
                    >
                      {c.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Section heading: bold uppercase + thin line extending right
function ColHeading({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2.5,
            color: accent,
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        <div style={{ flex: 1, height: 1, backgroundColor: `${accent}44` }} />
      </div>
    </div>
  );
}

// Contact row: small circular icon badge + text
function ContactRow({
  icon,
  text,
  accent,
  wrap,
}: {
  icon: string;
  text: string;
  accent: string;
  wrap?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: icon === "in" || icon === "gh" ? 7.5 : 10,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#4b5563",
          lineHeight: 1.55,
          wordBreak: wrap ? "break-all" : "normal",
          marginTop: 3,
        }}
      >
        {text}
      </span>
    </div>
  );
}
