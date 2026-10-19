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
import ResumeLink from "./ResumeLink";
import { displayUrl, projectDates, projectMeta } from "@/lib/resume-format";

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Elegant dark sidebar variant — deep warm brown left sidebar, cream right column.
// Photo/monogram in sidebar. Same serif typography and circle markers.
// A4: 794px × 1123px

const CREAM = "#f5f0e6";
const DARK = "#2a1f0e";
const MUTED = "#9c8060";
const DIVIDER = "#d8c9b0";
const LEFT_W = 230;
const RIGHT_W = 794 - LEFT_W;

export const ELEGANT_DARK_THEMES: Record<
  string,
  {
    label: string;
    sidebarBg: string;
    accent: string;
    sidebarDiv: string;
    sidebarMut: string;
  }
> = {
  amber: {
    label: "Amber",
    sidebarBg: "#3b1f0a",
    accent: "#c8935a",
    sidebarDiv: "#5c3520",
    sidebarMut: "#a07850",
  },
  midnight: {
    label: "Midnight",
    sidebarBg: "#0f172a",
    accent: "#818cf8",
    sidebarDiv: "#1e3a5f",
    sidebarMut: "#7090b0",
  },
  forest: {
    label: "Forest",
    sidebarBg: "#1a2e1a",
    accent: "#86efac",
    sidebarDiv: "#2a4a2a",
    sidebarMut: "#6a9a6a",
  },
};

export default function ElegantDarkTemplate({ data }: { data: ResumeData }) {
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

  const {
    sidebarBg: SIDEBAR_BG,
    accent: ACCENT,
    sidebarDiv: SIDEBAR_DIV,
    sidebarMut: SIDEBAR_MUT,
  } = ELEGANT_DARK_THEMES[p.theme ?? "amber"] ?? ELEGANT_DARK_THEMES.amber;

  const firstName = (p.name || "Your Name").split(" ")[0];
  const lastName = (p.name || "").split(" ").slice(1).join(" ");
  const initial = (p.name || "Y")[0].toUpperCase();

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        fontFamily: '"Lora", "Georgia", serif',
        fontSize: 11,
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face { font-family: 'Lora'; font-style: normal; font-weight: 400; src: url('/fonts/lora-400.woff2') format('woff2'); }
        @font-face { font-family: 'Lora'; font-style: normal; font-weight: 600; src: url('/fonts/lora-600.woff2') format('woff2'); }
        @font-face { font-family: 'Lora'; font-style: normal; font-weight: 700; src: url('/fonts/lora-700.woff2') format('woff2'); }
        @font-face { font-family: 'Lora'; font-style: italic; font-weight: 400; src: url('/fonts/lora-400-italic.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 300; src: url('/fonts/source-sans-300.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 400; src: url('/fonts/source-sans-400.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 600; src: url('/fonts/source-sans-600.woff2') format('woff2'); }
      `,
        }}
      />

      {/* ── Dark left sidebar ── */}
      <div
        style={{
          width: LEFT_W,
          backgroundColor: SIDEBAR_BG,
          padding: "40px 22px",
          boxSizing: "border-box",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Photo or monogram */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            border: `3px solid ${SIDEBAR_DIV}`,
          }}
        >
          {p.photoUrl ? (
            <img
              src={p.photoUrl}
              alt={p.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontFamily: '"Lora", serif',
                fontSize: 38,
                fontWeight: 700,
                color: CREAM,
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          )}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 6 }}>
          <div
            style={{
              fontFamily: '"Lora", serif',
              fontSize: 22,
              fontWeight: 400,
              color: "#f0e8d8",
              lineHeight: 1.1,
            }}
          >
            {firstName}
          </div>
          <div
            style={{
              fontFamily: '"Lora", serif',
              fontSize: 22,
              fontWeight: 700,
              color: ACCENT,
              lineHeight: 1.1,
            }}
          >
            {lastName || "\u00A0"}
          </div>
        </div>

        {/* Job title */}
        {p.jobTitle && (
          <div
            style={{
              fontFamily: '"Source Sans 3", sans-serif',
              fontSize: 8,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: SIDEBAR_MUT,
              marginBottom: 18,
            }}
          >
            {p.jobTitle}
          </div>
        )}

        <div
          style={{ height: 1, backgroundColor: SIDEBAR_DIV, marginBottom: 20 }}
        />

        {/* Contact */}
        <SideSection title="Contact" accent={ACCENT} border={SIDEBAR_DIV}>
          <div
            style={{
              fontFamily: '"Source Sans 3", sans-serif',
              fontSize: 9.5,
              lineHeight: 2,
              color: SIDEBAR_MUT,
            }}
          >
            {p.location && (
              <div style={{ color: "#f0e8d8" }}>
                <PinIcon /> {p.location}
              </div>
            )}
            {p.phone && (
              <div>
                <PhoneIcon />{" "}
                <ResumeLink href={p.phone} kind="phone">
                  {p.phone}
                </ResumeLink>
              </div>
            )}
            {p.email && (
              <div style={{ wordBreak: "break-all" }}>
                <MailIcon />{" "}
                <ResumeLink href={p.email} kind="email">
                  {p.email}
                </ResumeLink>
              </div>
            )}
            {p.linkedIn && (
              <div style={{ wordBreak: "break-all", marginTop: 4 }}>
                <LinkedInIcon />{" "}
                <ResumeLink href={p.linkedIn}>{p.linkedIn}</ResumeLink>
              </div>
            )}
            {p.github && (
              <div style={{ wordBreak: "break-all" }}>
                <GitHubIcon />{" "}
                <ResumeLink href={p.github}>{p.github}</ResumeLink>
              </div>
            )}
            {p.website && (
              <div style={{ wordBreak: "break-all" }}>
                <GlobeIcon />{" "}
                <ResumeLink href={p.website}>{p.website}</ResumeLink>
              </div>
            )}
          </div>
        </SideSection>

        {/* Skills */}
        {skills.length > 0 && (
          <SideSection title="Skills" accent={ACCENT} border={SIDEBAR_DIV}>
            {skills.map((sk, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  marginBottom: 6,
                  fontFamily: '"Source Sans 3", sans-serif',
                  fontSize: 10,
                }}
              >
                <span style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}>
                  •
                </span>
                <span style={{ color: "#f0e8d8" }}>{sk.name}</span>
              </div>
            ))}
          </SideSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <SideSection title="Education" accent={ACCENT} border={SIDEBAR_DIV}>
            {education.map((s) => {
              const c = s.content as EducationContent;
              return (
                <div
                  key={s.id}
                  style={{
                    marginBottom: 12,
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontSize: 9.5,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#f0e8d8",
                      textTransform: "uppercase",
                      fontSize: 9,
                      letterSpacing: 0.5,
                    }}
                  >
                    {c.degree}
                  </div>
                  <div style={{ color: SIDEBAR_MUT, marginTop: 2 }}>
                    {c.institution}
                  </div>
                  {c.field && (
                    <div style={{ color: SIDEBAR_MUT }}>{c.field}</div>
                  )}
                  {(c.endDate || c.startDate) && (
                    <div
                      style={{
                        fontFamily: '"Lora", serif',
                        fontStyle: "italic",
                        fontSize: 9,
                        color: ACCENT,
                        marginTop: 2,
                      }}
                    >
                      {c.endDate ?? c.startDate}
                    </div>
                  )}
                </div>
              );
            })}
          </SideSection>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <SideSection title="Languages" accent={ACCENT} border={SIDEBAR_DIV}>
            {langs.map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  marginBottom: 5,
                  fontFamily: '"Source Sans 3", sans-serif',
                  fontSize: 10,
                }}
              >
                <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
                <span style={{ color: "#f0e8d8" }}>
                  {l.language}
                  {l.proficiency ? (
                    <span style={{ color: SIDEBAR_MUT }}>
                      {" "}
                      · {l.proficiency}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </SideSection>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <SideSection
            title="Certifications"
            accent={ACCENT}
            border={SIDEBAR_DIV}
          >
            {certs.map((c, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  fontFamily: '"Source Sans 3", sans-serif',
                  fontSize: 9.5,
                }}
              >
                <div style={{ color: "#f0e8d8", fontWeight: 600 }}>
                  {c.name}
                </div>
                {c.issuer && (
                  <div style={{ color: SIDEBAR_MUT }}>{c.issuer}</div>
                )}
                {c.date && (
                  <div
                    style={{
                      fontFamily: '"Lora", serif',
                      fontStyle: "italic",
                      color: ACCENT,
                      fontSize: 9,
                    }}
                  >
                    {c.date}
                  </div>
                )}
                <CertExtras
                  cert={c}
                  linkColor={ACCENT}
                  mutedColor={SIDEBAR_MUT}
                  fontSize={9}
                />
              </div>
            ))}
          </SideSection>
        )}
      </div>

      {/* ── Cream right column ── */}
      <div
        style={{
          width: RIGHT_W,
          backgroundColor: CREAM,
          padding: "40px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* Work */}
        {work.length > 0 && (
          <RightSection title="Work History">
            {work.map((s) => {
              const c = s.content as WorkContent;
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    marginBottom: 18,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ paddingTop: 4, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: `2px solid ${ACCENT}`,
                        backgroundColor: CREAM,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: '"Source Sans 3", sans-serif',
                        fontWeight: 700,
                        fontSize: 11.5,
                        color: DARK,
                      }}
                    >
                      {c.role}
                    </div>
                    <div
                      style={{
                        fontFamily: '"Source Sans 3", sans-serif',
                        fontSize: 10.5,
                        color: DARK,
                        marginTop: 1,
                      }}
                    >
                      {c.company}
                    </div>
                    {(c.startDate || c.endDate || c.current) && (
                      <div
                        style={{
                          fontFamily: '"Lora", serif',
                          fontStyle: "italic",
                          fontSize: 10,
                          color: MUTED,
                          marginTop: 2,
                          marginBottom: 5,
                        }}
                      >
                        {c.startDate}
                        {c.startDate && (c.current || c.endDate)
                          ? ` to ${c.current ? "Present" : c.endDate}`
                          : ""}
                      </div>
                    )}
                    {c.bullets.filter(Boolean).map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 3,
                          fontFamily: '"Source Sans 3", sans-serif',
                          fontSize: 10.5,
                          lineHeight: 1.55,
                        }}
                      >
                        <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
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
                              color: ACCENT,
                              border: `1px solid ${ACCENT}33`,
                              backgroundColor: `${ACCENT}15`,
                              padding: "1px 7px",
                              borderRadius: 10,
                              fontFamily: '"Source Sans 3", sans-serif',
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
          </RightSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <RightSection title="Projects">
            {projects.map((proj, i) => {
              const meta = projectMeta(proj);
              const dates = projectDates(proj).replace(" – ", " to ");
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    marginBottom: 18,
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ paddingTop: 4, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: `2px solid ${ACCENT}`,
                        backgroundColor: CREAM,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: '"Source Sans 3", sans-serif',
                        fontWeight: 700,
                        fontSize: 11.5,
                        color: DARK,
                      }}
                    >
                      {proj.name}
                    </div>
                    {(meta || proj.url) && (
                      <div
                        style={{
                          fontFamily: '"Source Sans 3", sans-serif',
                          fontSize: 10.5,
                          color: DARK,
                          marginTop: 1,
                        }}
                      >
                        {meta}
                        {meta && proj.url ? " · " : ""}
                        {proj.url && (
                          <span style={{ color: ACCENT }}>
                            <ResumeLink href={proj.url}>
                              {displayUrl(proj.url)}
                            </ResumeLink>
                          </span>
                        )}
                      </div>
                    )}
                    {(dates || proj.description) && (
                      <div
                        style={{
                          fontFamily: '"Lora", serif',
                          fontStyle: "italic",
                          fontSize: 10,
                          color: MUTED,
                          marginTop: 2,
                          marginBottom: 5,
                        }}
                      >
                        {dates}
                        {dates && proj.description ? " — " : ""}
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
                          fontFamily: '"Source Sans 3", sans-serif',
                          fontSize: 10.5,
                          lineHeight: 1.55,
                        }}
                      >
                        <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
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
                              color: ACCENT,
                              border: `1px solid ${ACCENT}33`,
                              backgroundColor: `${ACCENT}15`,
                              padding: "1px 7px",
                              borderRadius: 10,
                              fontFamily: '"Source Sans 3", sans-serif',
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
          </RightSection>
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
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: '"Lora", serif',
          fontSize: 11,
          fontWeight: 600,
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

function RightSection({
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
          fontFamily: '"Lora", serif',
          fontSize: 15,
          fontWeight: 600,
          color: DARK,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ height: 1, backgroundColor: DIVIDER, marginBottom: 14 }} />
      {children}
    </div>
  );
}
