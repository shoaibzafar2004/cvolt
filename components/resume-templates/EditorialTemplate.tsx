import type {
  ResumeData,
  WorkContent,
  EducationContent,
  SkillsContent,
  CertificationContent,
  LanguageContent,
  ProjectContent,
} from "@/types";
import { displayUrl, projectDates, projectMeta } from "@/lib/resume-format";

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Layout:
//   — Warm header: square photo flush-left + name / job title / contact right
//   — Full-width dark section bars with white text
//   — Professional Summary (full width)
//   — Academic Background (2 equal columns)
//   — Career History (2 equal columns)
//   — Bottom row: Core Skills (left) | Certifications / Languages (right)
// A4: 794px × 1123px

const PHOTO_W = 186;
const H_PAD = 36; // horizontal page padding
const INNER_W = 794 - H_PAD * 2; // 722
const COL_GAP = 28;
const COL_W = (INNER_W - COL_GAP) / 2; // ~347

const BODY = "#2d2d2d";
const MUTED = "#666666";

export const EDITORIAL_THEMES: Record<
  string,
  {
    label: string;
    sidebarBg: string; // ThemePicker left swatch + section bar bg
    accent: string; // section bar bg (same as sidebarBg for single-color)
    headerBg: string;
  }
> = {
  olive: {
    label: "Olive",
    sidebarBg: "#494836",
    accent: "#494836",
    headerBg: "#eae7e0",
  },
  navy: {
    label: "Navy",
    sidebarBg: "#1e3a5f",
    accent: "#1e3a5f",
    headerBg: "#e2e8f2",
  },
  burgundy: {
    label: "Burgundy",
    sidebarBg: "#6b2737",
    accent: "#6b2737",
    headerBg: "#f0e8ea",
  },
};

export default function EditorialTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data;
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  const { accent: ACCENT } =
    EDITORIAL_THEMES[p.theme ?? "olive"] ?? EDITORIAL_THEMES.olive;

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

  const initial = (p.name || "Y")[0].toUpperCase();

  // Split arrays into two equal columns
  const half = (arr: typeof work) => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  };
  const [workLeft, workRight] = half(work);
  const [eduLeft, eduRight] = half(education);

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        backgroundColor: "#ffffff",
        fontFamily: '"Source Sans 3", Arial, sans-serif',
        fontSize: 11,
        color: BODY,
        boxSizing: "border-box",
        padding: 20,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 300; src: url('/fonts/source-sans-300.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 400; src: url('/fonts/source-sans-400.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 600; src: url('/fonts/source-sans-600.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 700; src: url('/fonts/source-sans-700.woff2') format('woff2'); }
      `,
        }}
      />

      {/* ══════════════════════════════════
          HEADER — photo left, info right
      ══════════════════════════════════ */}
      <div
        style={{ display: "flex", backgroundColor: "#ffffff", minHeight: 164 }}
      >
        {/* Square photo — flush to left edge */}
        <div
          style={{
            width: PHOTO_W,
            minHeight: 164,
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: "#c8c4bc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {p.photoUrl ? (
            <img
              src={p.photoUrl}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 58,
                fontWeight: 700,
                color: ACCENT,
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          )}
        </div>

        {/* Name + title + contact */}
        <div
          style={{
            flex: 1,
            padding: "24px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: BODY,
              textTransform: "uppercase",
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            {p.name || "Your Name"}
          </div>
          {/* Job title */}
          {p.jobTitle && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: ACCENT,
                textTransform: "uppercase",
                letterSpacing: 3,
                marginTop: 6,
                marginBottom: 14,
              }}
            >
              {p.jobTitle}
            </div>
          )}
          {/* Contact rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {p.phone && <HeaderContact icon="✆" text={p.phone} />}
            {p.email && <HeaderContact icon="✉" text={p.email} />}
            {p.website && <HeaderContact icon="⊕" text={p.website} />}
            {p.location && <HeaderContact icon="◉" text={p.location} />}
            {p.linkedIn && <HeaderContact icon="in" text={p.linkedIn} />}
            {p.github && <HeaderContact icon="gh" text={p.github} />}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          PROFESSIONAL SUMMARY
      ══════════════════════════════════ */}
      {p.summary && (
        <div style={{ marginTop: 20 }}>
          <SectionBar title="Professional Summary" accent={ACCENT} />
          <div style={{ padding: `16px ${H_PAD}px 20px` }}>
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
        </div>
      )}

      {/* ══════════════════════════════════
          ACADEMIC BACKGROUND — 2 columns
      ══════════════════════════════════ */}
      {education.length > 0 && (
        <div>
          <SectionBar title="Academic Background" accent={ACCENT} />
          <div
            style={{
              display: "flex",
              gap: COL_GAP,
              padding: `18px ${H_PAD}px 22px`,
            }}
          >
            <div style={{ width: COL_W, flexShrink: 0 }}>
              {eduLeft.map((s) => {
                const c = s.content as EducationContent;
                return <EduEntry key={s.id} c={c} accent={ACCENT} />;
              })}
            </div>
            <div
              style={{ width: 1, backgroundColor: "#e0e0e0", flexShrink: 0 }}
            />
            <div style={{ width: COL_W, flexShrink: 0 }}>
              {eduRight.map((s) => {
                const c = s.content as EducationContent;
                return <EduEntry key={s.id} c={c} accent={ACCENT} />;
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          CAREER HISTORY — 2 columns
      ══════════════════════════════════ */}
      {work.length > 0 && (
        <div>
          <SectionBar title="Career History" accent={ACCENT} />
          <div
            style={{
              display: "flex",
              gap: COL_GAP,
              padding: `18px ${H_PAD}px 22px`,
            }}
          >
            <div style={{ width: COL_W, flexShrink: 0 }}>
              {workLeft.map((s) => {
                const c = s.content as WorkContent;
                return <WorkEntry key={s.id} c={c} accent={ACCENT} />;
              })}
            </div>
            <div
              style={{ width: 1, backgroundColor: "#e0e0e0", flexShrink: 0 }}
            />
            <div style={{ width: COL_W, flexShrink: 0 }}>
              {workRight.map((s) => {
                const c = s.content as WorkContent;
                return <WorkEntry key={s.id} c={c} accent={ACCENT} />;
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          PROJECTS — 2 columns
      ══════════════════════════════════ */}
      {projects.length > 0 && (
        <div>
          <SectionBar title="Projects" accent={ACCENT} />
          <div
            style={{
              display: "flex",
              gap: COL_GAP,
              padding: `18px ${H_PAD}px 22px`,
            }}
          >
            {[
              projects.slice(0, Math.ceil(projects.length / 2)),
              projects.slice(Math.ceil(projects.length / 2)),
            ].map((col, ci) => (
              <div key={ci} style={{ width: COL_W, flexShrink: 0 }}>
                {col.map((proj, i) => (
                  <ProjectEntry key={i} p={proj} accent={ACCENT} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          BOTTOM ROW: Skills | Certs + Langs
      ══════════════════════════════════ */}
      {(skills.length > 0 || certs.length > 0 || langs.length > 0) && (
        <div style={{ display: "flex" }}>
          {/* Core Skills */}
          {skills.length > 0 && (
            <div style={{ width: COL_W + H_PAD, flexShrink: 0 }}>
              <SectionBar title="Core Skills" accent={ACCENT} />
              <div style={{ padding: `16px ${H_PAD}px 20px` }}>
                {skills.map((sk, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
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
            </div>
          )}

          {/* Certifications + Languages */}
          {(certs.length > 0 || langs.length > 0) && (
            <div style={{ flex: 1 }}>
              {certs.length > 0 && (
                <>
                  <SectionBar title="Certifications" accent={ACCENT} />
                  <div style={{ padding: `16px ${H_PAD}px 20px` }}>
                    {certs.map((c, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: BODY,
                          }}
                        >
                          {c.name}
                        </div>
                        {c.issuer && (
                          <div
                            style={{
                              fontSize: 10.5,
                              color: ACCENT,
                              fontWeight: 600,
                            }}
                          >
                            {c.issuer}
                          </div>
                        )}
                        {c.date && (
                          <div
                            style={{
                              fontSize: 10,
                              color: MUTED,
                              fontStyle: "italic",
                              marginTop: 1,
                            }}
                          >
                            {c.date}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {langs.length > 0 && (
                <>
                  <SectionBar title="Languages" accent={ACCENT} />
                  <div style={{ padding: `16px ${H_PAD}px 20px` }}>
                    {langs.map((l, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
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
                        {l.language}
                        {l.proficiency ? (
                          <span style={{ color: MUTED }}>
                            {" "}
                            · {l.proficiency}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Full-width dark section bar ──
function SectionBar({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ backgroundColor: accent, padding: "7px 36px" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: 2.5,
        }}
      >
        {title}
      </div>
    </div>
  );
}

// ── Header contact row ──
function HeaderContact({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 10,
        color: "#555555",
      }}
    >
      <span style={{ fontSize: 11, lineHeight: 1 }}>{icon}</span>
      <span style={{ wordBreak: "break-all" }}>{text}</span>
    </div>
  );
}

// ── Education entry ──
function EduEntry({ c, accent }: { c: EducationContent; accent: string }) {
  return (
    <div style={{ marginBottom: 14, pageBreakInside: "avoid" }}>
      {(c.startDate || c.endDate) && (
        <div
          style={{
            fontSize: 9.5,
            color: "#888888",
            fontStyle: "italic",
            marginBottom: 2,
          }}
        >
          {c.startDate && c.endDate
            ? `${c.startDate} – ${c.endDate}`
            : (c.endDate ?? c.startDate)}
          {c.gpa ? `  ·  ${c.gpa} GPA` : ""}
        </div>
      )}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#1a1a1a",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {c.institution}
      </div>
      <div
        style={{ fontSize: 10.5, color: accent, fontWeight: 600, marginTop: 1 }}
      >
        {c.degree}
        {c.field ? ` in ${c.field}` : ""}
      </div>
    </div>
  );
}

// ── Work entry ──
function WorkEntry({ c, accent }: { c: WorkContent; accent: string }) {
  return (
    <div style={{ marginBottom: 16, pageBreakInside: "avoid" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#1a1a1a",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {c.role}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 10.5, color: accent, fontWeight: 600 }}>
          {c.company}
        </span>
        {(c.startDate || c.endDate || c.current) && (
          <span
            style={{
              fontSize: 9.5,
              color: "#888888",
              fontStyle: "italic",
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {c.startDate}
            {c.startDate && (c.current || c.endDate)
              ? ` – ${c.current ? "Present" : c.endDate}`
              : ""}
          </span>
        )}
      </div>
      {c.bullets.filter(Boolean).map((b, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 7,
            marginBottom: 3,
            fontSize: 10.5,
            lineHeight: 1.6,
            color: "#3d3d3d",
          }}
        >
          <span style={{ color: accent, flexShrink: 0 }}>•</span>
          <div dangerouslySetInnerHTML={{ __html: b }} />
        </div>
      ))}
    </div>
  );
}

function ProjectEntry({ p, accent }: { p: ProjectContent; accent: string }) {
  const meta = projectMeta(p);
  const dates = projectDates(p);
  return (
    <div style={{ marginBottom: 16, pageBreakInside: "avoid" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#1a1a1a",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {p.name}
      </div>
      {(meta || dates) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 10.5, color: accent, fontWeight: 600 }}>
            {meta}
          </span>
          {dates && (
            <span
              style={{
                fontSize: 9.5,
                color: "#888888",
                fontStyle: "italic",
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              {dates}
            </span>
          )}
        </div>
      )}
      {p.url && (
        <div style={{ fontSize: 9.5, color: "#888888" }}>
          {displayUrl(p.url)}
        </div>
      )}
      <div style={{ height: 5 }} />
      {p.description && (
        <div
          style={{
            fontSize: 10.5,
            lineHeight: 1.6,
            color: "#3d3d3d",
            marginBottom: 3,
          }}
        >
          {p.description}
        </div>
      )}
      {p.bullets.filter(Boolean).map((b, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 7,
            marginBottom: 3,
            fontSize: 10.5,
            lineHeight: 1.6,
            color: "#3d3d3d",
          }}
        >
          <span style={{ color: accent, flexShrink: 0 }}>•</span>
          <div dangerouslySetInnerHTML={{ __html: b }} />
        </div>
      ))}
      {p.techStack && p.techStack.length > 0 && (
        <div
          style={{
            fontSize: 9.5,
            color: "#888888",
            fontStyle: "italic",
            marginTop: 3,
          }}
        >
          Built with {p.techStack.join(", ")}
        </div>
      )}
    </div>
  );
}
