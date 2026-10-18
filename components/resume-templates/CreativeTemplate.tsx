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
// Dark left sidebar (#1a1a1a) + white right column. Same two-column structure.
// Strong contrast variant — suits tech/design roles.
// A4: 794px × 1123px

const SIDEBAR_W = 230;
const MAIN_W = 794 - SIDEBAR_W;
const LIGHT_TEXT = "#f0f0f0";
const MAIN_MUTED = "#555555";
const MAIN_BORDER = "#e0e0e0";

export const CREATIVE_THEMES: Record<
  string,
  {
    label: string;
    sidebarBg: string;
    accent: string;
    darkBorder: string;
  }
> = {
  carbon: {
    label: "Carbon",
    sidebarBg: "#1c1c1c",
    accent: "#c8a96e",
    darkBorder: "#333333",
  },
  slate: {
    label: "Slate",
    sidebarBg: "#1e2a3a",
    accent: "#60a5fa",
    darkBorder: "#2a3a4e",
  },
  forest: {
    label: "Forest",
    sidebarBg: "#1a2e1f",
    accent: "#4ade80",
    darkBorder: "#2a3e2f",
  },
};

export default function CreativeTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data;
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

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

  const levelPct: Record<string, number> = {
    Beginner: 25,
    Intermediate: 50,
    Advanced: 75,
    Expert: 100,
  };

  const {
    sidebarBg: DARK,
    accent: ACCENT,
    darkBorder: DARK_BORDER,
  } = CREATIVE_THEMES[p.theme ?? "carbon"] ?? CREATIVE_THEMES.carbon;
  const DARK_MUTED = "#a0a0a0";

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        fontFamily: '"Libre Franklin", Arial, sans-serif',
        fontSize: 11,
        display: "flex",
        boxSizing: "border-box",
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

      {/* ── Dark left sidebar ── */}
      <div
        style={{
          width: SIDEBAR_W,
          backgroundColor: DARK,
          color: LIGHT_TEXT,
          padding: "40px 22px",
          boxSizing: "border-box",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Name block */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 300,
              letterSpacing: 3,
              lineHeight: 1,
              textTransform: "uppercase",
              color: LIGHT_TEXT,
            }}
          >
            {(p.name || "Your Name").split(" ")[0]}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 3,
              lineHeight: 1.15,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {(p.name || "").split(" ").slice(1).join(" ") || "\u00A0"}
          </div>
          {p.jobTitle && (
            <div
              style={{
                marginTop: 8,
                fontSize: 8,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: DARK_MUTED,
              }}
            >
              {p.jobTitle}
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              height: 1,
              backgroundColor: ACCENT,
              width: 40,
            }}
          />
        </div>

        {/* Contact */}
        <SideSection title="Contact" accent={ACCENT} border={DARK_BORDER}>
          <div style={{ fontSize: 9.5, lineHeight: 2, color: DARK_MUTED }}>
            {p.location && (
              <div style={{ color: LIGHT_TEXT }}>◉ {p.location}</div>
            )}
            {p.phone && <div>✆ {p.phone}</div>}
            {p.email && (
              <div style={{ wordBreak: "break-all" }}>✉ {p.email}</div>
            )}
            {p.linkedIn && (
              <div style={{ wordBreak: "break-all", marginTop: 4 }}>
                ⊕ {p.linkedIn}
              </div>
            )}
            {p.github && (
              <div style={{ wordBreak: "break-all" }}>⊕ {p.github}</div>
            )}
            {p.website && (
              <div style={{ wordBreak: "break-all" }}>⊕ {p.website}</div>
            )}
          </div>
        </SideSection>

        {/* Skills */}
        {skills.length > 0 && (
          <SideSection title="Skills" accent={ACCENT} border={DARK_BORDER}>
            {skills.map((sk, i) => (
              <div key={i} style={{ marginBottom: 9 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 9.5,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: LIGHT_TEXT }}>{sk.name}</span>
                  <span style={{ color: DARK_MUTED, fontSize: 8.5 }}>
                    {sk.level}
                  </span>
                </div>
                <div
                  style={{
                    height: 2,
                    backgroundColor: DARK_BORDER,
                    borderRadius: 1,
                  }}
                >
                  <div
                    style={{
                      height: 2,
                      width: `${levelPct[sk.level] ?? 50}%`,
                      backgroundColor: ACCENT,
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            ))}
          </SideSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <SideSection title="Education" accent={ACCENT} border={DARK_BORDER}>
            {education.map((s) => {
              const c = s.content as EducationContent;
              return (
                <div
                  key={s.id}
                  style={{
                    marginBottom: 12,
                    fontSize: 9.5,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: LIGHT_TEXT,
                      textTransform: "uppercase",
                      fontSize: 9,
                      letterSpacing: 0.5,
                    }}
                  >
                    {c.degree}
                  </div>
                  <div style={{ color: DARK_MUTED, marginTop: 2 }}>
                    {c.institution}
                  </div>
                  {c.field && (
                    <div style={{ color: DARK_MUTED }}>{c.field}</div>
                  )}
                  {(c.startDate || c.endDate) && (
                    <div style={{ color: ACCENT, fontSize: 9, marginTop: 2 }}>
                      {c.startDate}
                      {c.endDate ? ` – ${c.endDate}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </SideSection>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <SideSection title="Languages" accent={ACCENT} border={DARK_BORDER}>
            {langs.map((l, i) => (
              <div
                key={i}
                style={{ fontSize: 9.5, marginBottom: 4, color: LIGHT_TEXT }}
              >
                {l.language}
                {l.proficiency && (
                  <span style={{ color: DARK_MUTED }}> · {l.proficiency}</span>
                )}
              </div>
            ))}
          </SideSection>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <SideSection
            title="Certifications"
            accent={ACCENT}
            border={DARK_BORDER}
          >
            {certs.map((c, i) => (
              <div key={i} style={{ marginBottom: 6, fontSize: 9.5 }}>
                <div style={{ color: LIGHT_TEXT, fontWeight: 600 }}>
                  {c.name}
                </div>
                {c.issuer && (
                  <div style={{ color: DARK_MUTED }}>{c.issuer}</div>
                )}
                {c.date && (
                  <div style={{ color: ACCENT, fontSize: 9 }}>{c.date}</div>
                )}
              </div>
            ))}
          </SideSection>
        )}
      </div>

      {/* ── White right column ── */}
      <div
        style={{
          width: MAIN_W,
          backgroundColor: "#ffffff",
          padding: "40px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* Work experience */}
        {work.length > 0 && (
          <MainSection title="Work Experience" accent={DARK}>
            {work.map((s) => {
              const c = s.content as WorkContent;
              return (
                <div
                  key={s.id}
                  style={{
                    marginBottom: 18,
                    paddingLeft: 12,
                    borderLeft: `2px solid ${MAIN_BORDER}`,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: MAIN_MUTED,
                    }}
                  >
                    {c.role}
                    {c.startDate && (
                      <span style={{ fontWeight: 400, marginLeft: 6 }}>
                        | {c.startDate} –{" "}
                        {c.current ? "Present" : (c.endDate ?? "")}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: DARK,
                      marginTop: 3,
                    }}
                  >
                    {c.company}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {c.bullets.filter(Boolean).map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 6,
                          marginBottom: 3,
                          fontSize: 10.5,
                          lineHeight: 1.55,
                          color: "#333333",
                        }}
                      >
                        <span style={{ flexShrink: 0, color: MAIN_MUTED }}>
                          ·
                        </span>
                        <div dangerouslySetInnerHTML={{ __html: b }} />
                      </div>
                    ))}
                    {c.skills && c.skills.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px 6px",
                          marginTop: 6,
                        }}
                      >
                        {c.skills.map((skill, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 9,
                              color: "#ffffff",
                              backgroundColor: MAIN_MUTED,
                              padding: "1px 7px",
                              borderRadius: 10,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </MainSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <MainSection title="Projects" accent={DARK}>
            {projects.map((proj, i) => {
              const meta = projectMeta(proj);
              const dates = projectDates(proj);
              return (
                <div
                  key={i}
                  style={{
                    marginBottom: 18,
                    paddingLeft: 12,
                    borderLeft: `2px solid ${MAIN_BORDER}`,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: MAIN_MUTED,
                    }}
                  >
                    {meta || "Project"}
                    {dates && (
                      <span style={{ fontWeight: 400, marginLeft: 6 }}>
                        | {dates}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: DARK,
                      marginTop: 3,
                    }}
                  >
                    {proj.name}
                  </div>
                  {proj.url && (
                    <div
                      style={{ fontSize: 9, color: MAIN_MUTED, marginTop: 1 }}
                    >
                      {displayUrl(proj.url)}
                    </div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    {proj.description && (
                      <div
                        style={{
                          fontSize: 10.5,
                          lineHeight: 1.55,
                          color: "#333333",
                          marginBottom: 3,
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
                          gap: 6,
                          marginBottom: 3,
                          fontSize: 10.5,
                          lineHeight: 1.55,
                          color: "#333333",
                        }}
                      >
                        <span style={{ flexShrink: 0, color: MAIN_MUTED }}>
                          ·
                        </span>
                        <div dangerouslySetInnerHTML={{ __html: b }} />
                      </div>
                    ))}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px 6px",
                          marginTop: 6,
                        }}
                      >
                        {proj.techStack.map((t, j) => (
                          <span
                            key={j}
                            style={{
                              fontSize: 9,
                              color: "#ffffff",
                              backgroundColor: MAIN_MUTED,
                              padding: "1px 7px",
                              borderRadius: 10,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </MainSection>
        )}
      </div>
    </div>
  );
}

function SideSection({
  title,
  children,
  accent,
  border,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
  border: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2.5,
          color: accent,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: `1px solid ${border}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function MainSection({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: accent,
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: `2px solid ${accent}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
