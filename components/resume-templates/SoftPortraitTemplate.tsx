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
// Clean light sidebar: compact portrait photo, large name, accent title.
// Neutral white sidebar — accent controls headings, icons, dividers.
// Right column: minimal section headers with single rule line.
// A4: 794px × 1123px

const SIDEBAR_W = 228;
const MAIN_W = 794 - SIDEBAR_W;
const DARK = "#1a1a1a";
const BODY = "#3d3d3d";
const MUTED = "#7a7a7a";

export const SOFT_PORTRAIT_THEMES: Record<
  string,
  {
    label: string;
    accent: string;
    sidebarBg: string; // used as ThemePicker left-half swatch
  }
> = {
  slate: { label: "Slate", accent: "#334155", sidebarBg: "#f8f9fb" },
  teal: { label: "Teal", accent: "#0d9488", sidebarBg: "#f3faf9" },
  berry: { label: "Berry", accent: "#7c3aed", sidebarBg: "#f9f7fe" },
};

export default function SoftPortraitTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data;
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  const { accent: ACCENT, sidebarBg: SIDEBAR_BG } =
    SOFT_PORTRAIT_THEMES[p.theme ?? "slate"] ?? SOFT_PORTRAIT_THEMES.slate;

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
  const nameParts = (p.name || "Your Name").split(" ");

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        display: "flex",
        fontFamily: '"Source Sans 3", Arial, sans-serif',
        fontSize: 11,
        color: DARK,
        boxSizing: "border-box",
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

      {/* ── Light sidebar ── */}
      <div
        style={{
          width: SIDEBAR_W,
          minHeight: 1123,
          backgroundColor: SIDEBAR_BG,
          borderRight: `1px solid #e5e7eb`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Portrait photo — compact, centered */}
        <div
          style={{
            padding: "32px 22px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 126,
              height: 150,
              overflow: "hidden",
              border: `3px solid ${ACCENT}`,
              backgroundColor: "#d1d5db",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
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
                  fontSize: 52,
                  fontWeight: 700,
                  color: "#9ca3af",
                  lineHeight: 1,
                }}
              >
                {initial}
              </span>
            )}
          </div>
        </div>

        {/* Name + title */}
        <div style={{ padding: "16px 22px 14px", textAlign: "center" }}>
          {nameParts.map((part, i) => (
            <div
              key={i}
              style={{
                fontSize: i === 0 ? 20 : 22,
                fontWeight: i === 0 ? 400 : 700,
                lineHeight: 1.1,
                color: DARK,
              }}
            >
              {part}
            </div>
          ))}
          {p.jobTitle && (
            <div
              style={{
                fontSize: 10.5,
                color: ACCENT,
                fontWeight: 600,
                marginTop: 6,
                letterSpacing: 0.3,
              }}
            >
              {p.jobTitle}
            </div>
          )}
        </div>

        <div
          style={{
            height: 1,
            backgroundColor: ACCENT,
            marginInline: 22,
            opacity: 0.35,
          }}
        />

        <div
          style={{
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Contact */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: MUTED, lineHeight: 2 }}>
              {p.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: ACCENT, fontSize: 11 }}>✆</span>
                  <span>{p.phone}</span>
                </div>
              )}
              {p.email && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT, fontSize: 11 }}>✉</span>
                  <span style={{ wordBreak: "break-all", lineHeight: 1.5 }}>
                    {p.email}
                  </span>
                </div>
              )}
              {p.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: ACCENT, fontSize: 11 }}>◉</span>
                  <span>{p.location}</span>
                </div>
              )}
              {p.linkedIn && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT, fontSize: 11 }}>⊕</span>
                  <span style={{ wordBreak: "break-all", lineHeight: 1.5 }}>
                    {p.linkedIn}
                  </span>
                </div>
              )}
              {p.github && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT, fontSize: 11 }}>⊕</span>
                  <span style={{ wordBreak: "break-all", lineHeight: 1.5 }}>
                    {p.github}
                  </span>
                </div>
              )}
              {p.website && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT, fontSize: 11 }}>⊕</span>
                  <span style={{ wordBreak: "break-all", lineHeight: 1.5 }}>
                    {p.website}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              height: 1,
              backgroundColor: ACCENT,
              opacity: 0.2,
              marginBottom: 16,
            }}
          />

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SideHeading title="Skills" accent={ACCENT} />
              {skills.map((sk, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 5,
                    fontSize: 10.5,
                    color: BODY,
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
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

          {skills.length > 0 && (
            <div
              style={{
                height: 1,
                backgroundColor: ACCENT,
                opacity: 0.2,
                marginBottom: 16,
              }}
            />
          )}

          {/* Summary */}
          {p.summary && (
            <div style={{ marginBottom: 18 }}>
              <SideHeading title="Summary" accent={ACCENT} />
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  lineHeight: 1.75,
                  color: MUTED,
                }}
              >
                {p.summary}
              </p>
            </div>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {p.summary && (
                <div
                  style={{
                    height: 1,
                    backgroundColor: ACCENT,
                    opacity: 0.2,
                    marginBottom: 16,
                  }}
                />
              )}
              <SideHeading title="Languages" accent={ACCENT} />
              {langs.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 5,
                    fontSize: 10.5,
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: ACCENT,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: BODY }}>{l.language}</span>
                  {l.proficiency && (
                    <span style={{ color: MUTED, fontSize: 9.5 }}>
                      · {l.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  height: 1,
                  backgroundColor: ACCENT,
                  opacity: 0.2,
                  marginBottom: 16,
                }}
              />
              <SideHeading title="Certifications" accent={ACCENT} />
              {certs.map((c, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: BODY }}>
                    {c.name}
                  </div>
                  {c.issuer && (
                    <div style={{ fontSize: 9.5, color: MUTED }}>
                      {c.issuer}
                    </div>
                  )}
                  {c.date && (
                    <div style={{ fontSize: 9.5, color: ACCENT }}>{c.date}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right main column ── */}
      <div
        style={{
          width: MAIN_W,
          backgroundColor: "#ffffff",
          padding: "36px 38px",
          boxSizing: "border-box",
        }}
      >
        {/* Work Experience */}
        {work.length > 0 && (
          <MainSection title="Work Experience" accent={ACCENT}>
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
                  {/* Role + dates */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, fontWeight: 700, color: DARK }}
                    >
                      {c.role}
                    </span>
                    {(c.startDate || c.endDate || c.current) && (
                      <span
                        style={{
                          fontSize: 9.5,
                          color: MUTED,
                          fontStyle: "italic",
                          flexShrink: 0,
                        }}
                      >
                        {c.startDate}
                        {c.startDate && (c.current || c.endDate)
                          ? ` – ${c.current ? "Present" : c.endDate}`
                          : ""}
                      </span>
                    )}
                  </div>
                  {/* Company */}
                  <div
                    style={{
                      fontSize: 11,
                      color: ACCENT,
                      fontWeight: 600,
                      marginBottom: 5,
                    }}
                  >
                    {c.company}
                  </div>
                  {/* Bullets */}
                  {c.bullets.filter(Boolean).map((b, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 3,
                        fontSize: 10.5,
                        lineHeight: 1.6,
                        color: BODY,
                      }}
                    >
                      <span
                        style={{ flexShrink: 0, color: ACCENT, marginTop: 1 }}
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
                            border: `1px solid ${ACCENT}44`,
                            backgroundColor: `${ACCENT}10`,
                            padding: "1px 6px",
                            borderRadius: 2,
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
          </MainSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <MainSection title="Projects" accent={ACCENT}>
            {projects.map((proj, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < projects.length - 1 ? 14 : 0,
                  pageBreakInside: "avoid",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>
                  {proj.name}
                  {proj.url && (
                    <span
                      style={{ fontWeight: 400, color: MUTED, fontSize: 9.5 }}
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
                      marginTop: 2,
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
                      gap: 8,
                      marginBottom: 3,
                      fontSize: 10.5,
                      lineHeight: 1.6,
                      color: BODY,
                    }}
                  >
                    <span style={{ flexShrink: 0, color: ACCENT }}>•</span>
                    <div dangerouslySetInnerHTML={{ __html: b }} />
                  </div>
                ))}
              </div>
            ))}
          </MainSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <MainSection title="Education" accent={ACCENT}>
            {education.map((s, idx) => {
              const c = s.content as EducationContent;
              return (
                <div
                  key={s.id}
                  style={{
                    marginBottom: idx < education.length - 1 ? 12 : 0,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, fontWeight: 700, color: DARK }}
                    >
                      {c.degree}
                      {c.field ? ` in ${c.field}` : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 9.5,
                        color: MUTED,
                        fontStyle: "italic",
                        flexShrink: 0,
                      }}
                    >
                      {c.startDate && c.endDate
                        ? `${c.startDate} – ${c.endDate}`
                        : (c.endDate ?? c.startDate)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: ACCENT,
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    {c.institution}
                  </div>
                  {c.gpa && (
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      GPA: {c.gpa}
                    </div>
                  )}
                </div>
              );
            })}
          </MainSection>
        )}
      </div>
    </div>
  );
}

function SideHeading({ title, accent }: { title: string; accent: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: accent,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
  );
}

function MainSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1a1a1a",
          paddingBottom: 5,
          marginBottom: 14,
          borderBottom: `1.5px solid ${accent}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
