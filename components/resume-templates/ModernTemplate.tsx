import type {
  ResumeData,
  WorkContent,
  EducationContent,
  SkillsContent,
  CertificationContent,
  LanguageContent,
  ProjectContent,
} from "@/types";
import {
  GitHubIcon,
  GlobeIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from "./ContactIcons";
import { displayUrl, projectDates, projectMeta } from "@/lib/resume-format";

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Two-column: left sidebar 30% light bg + right main 70%.
// Inspired by: spaced-caps section headers, circle markers, skill underline bars.
// A4: 794px × 1123px

const SIDEBAR_W = 220;
const MAIN_W = 794 - SIDEBAR_W;
const ACCENT = "#2d2d2d";
const SIDEBAR_BG = "#f4f4f2";
const MUTED = "#6b6b6b";
const BORDER = "#d0d0cc";
const CIRCLE = "⊙";

export default function ModernTemplate({ data }: { data: ResumeData }) {
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

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        fontFamily: '"Libre Franklin", "Arial Narrow", Arial, sans-serif',
        fontSize: 11,
        color: ACCENT,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
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

      {/* ── Top header bar ── */}
      <div
        style={{
          padding: "36px 40px 24px",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 300,
                letterSpacing: 2,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {(p.name || "Your Name").split(" ")[0]}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 2,
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            >
              {(p.name || "").split(" ").slice(1).join(" ") || "\u00A0"}
            </div>
            {p.jobTitle && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 9,
                  fontWeight: 400,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {p.jobTitle}
              </div>
            )}
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: 9.5,
              color: MUTED,
              lineHeight: 2,
            }}
          >
            {p.location && (
              <div>
                <PinIcon /> {p.location}
              </div>
            )}
            {p.phone && (
              <div>
                <PhoneIcon /> {p.phone}
              </div>
            )}
            {p.email && (
              <div>
                <MailIcon /> {p.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left sidebar */}
        <div
          style={{
            width: SIDEBAR_W,
            backgroundColor: SIDEBAR_BG,
            padding: "28px 20px",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          {/* Education */}
          {education.length > 0 && (
            <SideSection title="Education">
              {education.map((s) => {
                const c = s.content as EducationContent;
                return (
                  <div
                    key={s.id}
                    style={{ marginBottom: 14, pageBreakInside: "avoid" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: MUTED,
                          fontSize: 10,
                          marginTop: 1,
                          flexShrink: 0,
                        }}
                      >
                        {CIRCLE}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 9,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {c.degree}
                        </div>
                        <div
                          style={{
                            fontSize: 9.5,
                            marginTop: 2,
                            borderLeft: `2px solid ${BORDER}`,
                            paddingLeft: 6,
                          }}
                        >
                          <div>{c.institution}</div>
                          {c.field && (
                            <div style={{ color: MUTED }}>
                              Field of Study: {c.field}
                            </div>
                          )}
                          {(c.startDate || c.endDate) && (
                            <div style={{ color: MUTED, marginTop: 2 }}>
                              {c.startDate}
                              {c.endDate ? ` – ${c.endDate}` : ""}
                            </div>
                          )}
                          {c.gpa && (
                            <div style={{ color: MUTED }}>GPA: {c.gpa}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </SideSection>
          )}

          {/* Links */}
          {(p.linkedIn || p.github || p.website) && (
            <SideSection title="Links">
              {p.linkedIn && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ color: MUTED, fontSize: 9 }}>
                    <LinkedInIcon style={{ marginRight: 4 }} />
                    LinkedIn:
                  </div>
                  <div style={{ fontSize: 9, wordBreak: "break-all" }}>
                    {p.linkedIn}
                  </div>
                </div>
              )}
              {p.github && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ color: MUTED, fontSize: 9 }}>
                    <GitHubIcon style={{ marginRight: 4 }} />
                    GitHub:
                  </div>
                  <div style={{ fontSize: 9, wordBreak: "break-all" }}>
                    {p.github}
                  </div>
                </div>
              )}
              {p.website && (
                <div>
                  <div style={{ color: MUTED, fontSize: 9 }}>
                    <GlobeIcon style={{ marginRight: 4 }} />
                    Website:
                  </div>
                  <div style={{ fontSize: 9, wordBreak: "break-all" }}>
                    {p.website}
                  </div>
                </div>
              )}
            </SideSection>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <SideSection title="Skills">
              {skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, marginBottom: 3 }}>{sk.name}</div>
                  <div
                    style={{
                      height: 2,
                      backgroundColor: BORDER,
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

          {/* Languages */}
          {langs.length > 0 && (
            <SideSection title="Languages">
              {langs.map((l, i) => (
                <div key={i} style={{ fontSize: 10, marginBottom: 4 }}>
                  {l.language}
                  {l.proficiency ? (
                    <span style={{ color: MUTED }}> · {l.proficiency}</span>
                  ) : null}
                </div>
              ))}
            </SideSection>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <SideSection title="Certifications">
              {certs.map((c, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 9.5 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  {c.issuer && <div style={{ color: MUTED }}>{c.issuer}</div>}
                  {c.date && <div style={{ color: MUTED }}>{c.date}</div>}
                </div>
              ))}
            </SideSection>
          )}
        </div>

        {/* Right main */}
        <div
          style={{
            width: MAIN_W,
            padding: "28px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* About Me */}
          {p.summary && (
            <MainSection title="About Me">
              <div
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <span style={{ color: MUTED, flexShrink: 0 }}>{CIRCLE}</span>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{p.summary}</p>
              </div>
            </MainSection>
          )}

          {/* Work experience */}
          {work.length > 0 && (
            <MainSection title="Work Experience">
              {work.map((s) => {
                const c = s.content as WorkContent;
                return (
                  <div
                    key={s.id}
                    style={{ marginBottom: 18, pageBreakInside: "avoid" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{ color: MUTED, flexShrink: 0, marginTop: 1 }}
                      >
                        {CIRCLE}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            color: MUTED,
                          }}
                        >
                          {c.role}
                          {c.startDate
                            ? ` | ${c.startDate} – ${c.current ? "Present" : (c.endDate ?? "")}`
                            : ""}
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            marginTop: 2,
                          }}
                        >
                          {c.company}
                        </div>
                        <div style={{ marginTop: 5 }}>
                          {c.bullets.filter(Boolean).map((b, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                gap: 6,
                                marginBottom: 3,
                                fontSize: 10.5,
                                lineHeight: 1.5,
                              }}
                            >
                              <span style={{ flexShrink: 0, color: MUTED }}>
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
                                    color: MUTED,
                                    backgroundColor: "#eeeeec",
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
                    </div>
                  </div>
                );
              })}
            </MainSection>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <MainSection title="Projects">
              {projects.map((proj, i) => {
                const meta = projectMeta(proj);
                const dates = projectDates(proj);
                const topLine = [meta || "Project", dates]
                  .filter(Boolean)
                  .join(" | ");
                return (
                  <div
                    key={i}
                    style={{ marginBottom: 18, pageBreakInside: "avoid" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{ color: MUTED, flexShrink: 0, marginTop: 1 }}
                      >
                        {CIRCLE}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            color: MUTED,
                          }}
                        >
                          {topLine}
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            marginTop: 2,
                          }}
                        >
                          {proj.name}
                        </div>
                        {proj.url && (
                          <div
                            style={{ fontSize: 9, color: MUTED, marginTop: 1 }}
                          >
                            {displayUrl(proj.url)}
                          </div>
                        )}
                        <div style={{ marginTop: 5 }}>
                          {proj.description && (
                            <div
                              style={{
                                fontSize: 10.5,
                                lineHeight: 1.5,
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
                                lineHeight: 1.5,
                              }}
                            >
                              <span style={{ flexShrink: 0, color: MUTED }}>
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
                                    color: MUTED,
                                    backgroundColor: "#eeeeec",
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
                    </div>
                  </div>
                );
              })}
            </MainSection>
          )}
        </div>
      </div>
    </div>
  );
}

function SideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 8,
          paddingBottom: 5,
          borderBottom: `1px solid ${BORDER}`,
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 10,
          paddingBottom: 5,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
