import type {
  ResumeData,
  WorkContent,
  EducationContent,
  SkillsContent,
  CertificationContent,
  LanguageContent,
  ProjectContent,
} from "@/types";
import CertExtras from "./CertExtras";
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
// Classic pro sidebar: light sidebar with rectangular photo, skills + summary.
// Right column: work experience + education with colored section headers.
// A4: 794px × 1123px

const SIDEBAR_W = 240;
const MAIN_W = 794 - SIDEBAR_W;

export const PRO_SIDEBAR_THEMES: Record<
  string,
  {
    label: string;
    accent: string;
    sidebarBg: string;
    sidebarBorder: string;
  }
> = {
  teal: {
    label: "Teal",
    accent: "#0f766e",
    sidebarBg: "#f0f4f4",
    sidebarBorder: "#c8dada",
  },
  navy: {
    label: "Navy",
    accent: "#1e40af",
    sidebarBg: "#f0f2f8",
    sidebarBorder: "#c5ccdf",
  },
  burgundy: {
    label: "Burgundy",
    accent: "#9f1239",
    sidebarBg: "#f7f0f2",
    sidebarBorder: "#e0c6cc",
  },
};

const DARK = "#1c1c1c";
const MUTED = "#6b7280";

export default function ProSidebarTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data;
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  const {
    accent: ACCENT,
    sidebarBg: SIDEBAR_BG,
    sidebarBorder: SIDEBAR_BORDER,
  } = PRO_SIDEBAR_THEMES[p.theme ?? "teal"] ?? PRO_SIDEBAR_THEMES.teal;

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

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        display: "flex",
        fontFamily: '"Source Sans 3", "Arial", sans-serif',
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

      {/* ── Left sidebar ── */}
      <div
        style={{
          width: SIDEBAR_W,
          backgroundColor: SIDEBAR_BG,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Photo */}
        <div
          style={{
            width: SIDEBAR_W,
            height: 210,
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: "#d1d5db",
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
                fontSize: 72,
                fontWeight: 700,
                color: "#9ca3af",
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          )}
        </div>

        {/* Name + title */}
        <div
          style={{
            padding: "20px 22px 0",
            borderBottom: `2px solid ${ACCENT}`,
            paddingBottom: 16,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: DARK,
              lineHeight: 1.1,
            }}
          >
            {p.name || "Your Name"}
          </div>
          {p.jobTitle && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: ACCENT,
                marginTop: 4,
              }}
            >
              {p.jobTitle}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Contact */}
          <SideSection title="Contact" accent={ACCENT}>
            <div style={{ fontSize: 10, color: MUTED, lineHeight: 2 }}>
              {p.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: ACCENT }}>
                    <PhoneIcon />
                  </span>{" "}
                  {p.phone}
                </div>
              )}
              {p.email && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT }}>
                    <MailIcon />
                  </span>{" "}
                  <span style={{ wordBreak: "break-all" }}>{p.email}</span>
                </div>
              )}
              {p.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: ACCENT }}>
                    <PinIcon />
                  </span>{" "}
                  {p.location}
                </div>
              )}
              {p.linkedIn && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT }}>
                    <LinkedInIcon />
                  </span>{" "}
                  <span style={{ wordBreak: "break-all" }}>{p.linkedIn}</span>
                </div>
              )}
              {p.github && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT }}>
                    <GitHubIcon />
                  </span>{" "}
                  <span style={{ wordBreak: "break-all" }}>{p.github}</span>
                </div>
              )}
              {p.website && (
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
                >
                  <span style={{ color: ACCENT }}>
                    <GlobeIcon />
                  </span>{" "}
                  <span style={{ wordBreak: "break-all" }}>{p.website}</span>
                </div>
              )}
            </div>
          </SideSection>

          {/* Skills */}
          {skills.length > 0 && (
            <SideSection title="Skills" accent={ACCENT}>
              {skills.map((sk, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 5,
                    fontSize: 10.5,
                    color: DARK,
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
            </SideSection>
          )}

          {/* Summary */}
          {p.summary && (
            <SideSection title="Summary" accent={ACCENT}>
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
            </SideSection>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <SideSection title="Languages" accent={ACCENT}>
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
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: ACCENT,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: DARK }}>{l.language}</span>
                  {l.proficiency && (
                    <span style={{ color: MUTED, fontSize: 9.5 }}>
                      · {l.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </SideSection>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <SideSection title="Certifications" accent={ACCENT}>
              {certs.map((c, i) => (
                <div key={i} style={{ marginBottom: 8, fontSize: 10 }}>
                  <div style={{ fontWeight: 600, color: DARK }}>{c.name}</div>
                  {c.issuer && <div style={{ color: MUTED }}>{c.issuer}</div>}
                  {c.date && (
                    <div style={{ color: ACCENT, fontSize: 9.5 }}>{c.date}</div>
                  )}
                  <CertExtras
                    cert={c}
                    linkColor={ACCENT}
                    mutedColor={MUTED}
                    fontSize={9.5}
                  />
                </div>
              ))}
            </SideSection>
          )}
        </div>
      </div>

      {/* ── Right main column ── */}
      <div
        style={{
          width: MAIN_W,
          backgroundColor: "#ffffff",
          padding: "36px 36px",
          boxSizing: "border-box",
        }}
      >
        {/* Work Experience */}
        {work.length > 0 && (
          <MainSection title="Work Experience" accent={ACCENT}>
            {work.map((s) => {
              const c = s.content as WorkContent;
              return (
                <div
                  key={s.id}
                  style={{ marginBottom: 18, pageBreakInside: "avoid" }}
                >
                  {/* Role + dates row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 1,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: 11.5, color: DARK }}
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
                          marginLeft: 8,
                        }}
                      >
                        {c.startDate}
                        {c.startDate && (c.current || c.endDate)
                          ? `–${c.current ? "Present" : c.endDate}`
                          : ""}
                      </span>
                    )}
                  </div>
                  {/* Company */}
                  <div
                    style={{
                      fontSize: 10.5,
                      color: ACCENT,
                      fontWeight: 600,
                      marginBottom: 6,
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
                        gap: 7,
                        marginBottom: 3,
                        fontSize: 10.5,
                        lineHeight: 1.6,
                        color: "#333333",
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
                  {/* Skill tags */}
                  {c.skills && c.skills.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "3px 5px",
                        marginTop: 6,
                      }}
                    >
                      {c.skills.map((skill, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 9,
                            color: ACCENT,
                            border: `1px solid ${ACCENT}44`,
                            backgroundColor: `${ACCENT}12`,
                            padding: "1px 6px",
                            borderRadius: 3,
                          }}
                        >
                          {skill}
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
            {projects.map((proj, i) => {
              const meta = projectMeta(proj);
              const dates = projectDates(proj).replace(" – ", "–");
              return (
                <div
                  key={i}
                  style={{ marginBottom: 18, pageBreakInside: "avoid" }}
                >
                  {/* Name + dates row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 1,
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: 11.5, color: DARK }}
                    >
                      {proj.name}
                    </span>
                    {dates && (
                      <span
                        style={{
                          fontSize: 9.5,
                          color: MUTED,
                          fontStyle: "italic",
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {dates}
                      </span>
                    )}
                  </div>
                  {/* Role · type · link */}
                  {(meta || proj.url) && (
                    <div
                      style={{
                        fontSize: 10.5,
                        color: ACCENT,
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      {meta}
                      {meta && proj.url ? " · " : ""}
                      {proj.url && (
                        <span style={{ color: MUTED, fontWeight: 400 }}>
                          {displayUrl(proj.url)}
                        </span>
                      )}
                    </div>
                  )}
                  {proj.description && (
                    <div
                      style={{
                        fontSize: 10.5,
                        lineHeight: 1.6,
                        color: "#333333",
                        marginBottom: 3,
                      }}
                    >
                      {proj.description}
                    </div>
                  )}
                  {/* Bullets */}
                  {proj.bullets.filter(Boolean).map((b, j) => (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        gap: 7,
                        marginBottom: 3,
                        fontSize: 10.5,
                        lineHeight: 1.6,
                        color: "#333333",
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
                  {/* Tech tags */}
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "3px 5px",
                        marginTop: 6,
                      }}
                    >
                      {proj.techStack.map((t, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 9,
                            color: ACCENT,
                            border: `1px solid ${ACCENT}44`,
                            backgroundColor: `${ACCENT}12`,
                            padding: "1px 6px",
                            borderRadius: 3,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </MainSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <MainSection title="Education" accent={ACCENT}>
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
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{ fontWeight: 700, fontSize: 11.5, color: DARK }}
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
                        marginLeft: 8,
                      }}
                    >
                      {c.endDate ?? c.startDate}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: ACCENT,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {c.institution}
                  </div>
                  {c.gpa && (
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>
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

function SideSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.8,
          color: accent,
          marginBottom: 8,
          paddingBottom: 5,
          borderBottom: `1px solid ${accent}44`,
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
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#1c1c1c",
          marginBottom: 4,
          paddingBottom: 6,
          borderBottom: `2px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 4,
            height: 14,
            backgroundColor: accent,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        {title}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
