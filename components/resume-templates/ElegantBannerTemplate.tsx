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
import {
  KEEP_WITH_NEXT,
  KEEP_WITH_PREV,
  NO_SPLIT,
  REPEAT_PADDING,
  printPageBackground,
} from "./pagination";
import { displayUrl, projectDates, projectMeta } from "@/lib/resume-format";

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Elegant banner variant — wide warm brown header band across the top with name +
// contact info. Two-column body below on cream bg. Photo in banner.
// A4: 794px × 1123px

const BG = "#f5f0e6";
const BANNER_BG = "#5c3520";
const BANNER_MUT = "#c8a882";
const DARK = "#2a1f0e";
const ACCENT = "#7a5c2e";
const MUTED = "#9c8060";
const DIVIDER = "#d8c9b0";
const LEFT_W = 240;
const RIGHT_W = 794 - LEFT_W;

export default function ElegantBannerTemplate({ data }: { data: ResumeData }) {
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
        color: DARK,
        backgroundColor: BG,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
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
        ${printPageBackground(`${BG} ${LEFT_W - 1}px, ${DIVIDER} ${LEFT_W - 1}px ${LEFT_W}px, ${BG} ${LEFT_W}px`)}
      `,
        }}
      />

      {/* ── Top banner ── */}
      <div
        style={{
          backgroundColor: BANNER_BG,
          padding: "28px 40px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Photo or monogram */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "3px solid rgba(255,255,255,0.15)",
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
                fontSize: 32,
                fontWeight: 700,
                color: BG,
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          )}
        </div>

        {/* Name + title */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontFamily: '"Lora", serif',
                fontSize: 30,
                fontWeight: 400,
                color: "#f5ede0",
                lineHeight: 1,
              }}
            >
              {firstName}
            </span>
            <span
              style={{
                fontFamily: '"Lora", serif',
                fontSize: 30,
                fontWeight: 700,
                color: "#f5ede0",
                lineHeight: 1,
              }}
            >
              {lastName}
            </span>
          </div>
          {p.jobTitle && (
            <div
              style={{
                fontFamily: '"Source Sans 3", sans-serif',
                fontSize: 9,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 2.5,
                color: BANNER_MUT,
                marginTop: 8,
              }}
            >
              {p.jobTitle}
            </div>
          )}
        </div>

        {/* Contact */}
        <div
          style={{
            fontFamily: '"Source Sans 3", sans-serif',
            fontSize: 9.5,
            color: BANNER_MUT,
            lineHeight: 2,
            textAlign: "right",
          }}
        >
          {p.location && (
            <div>
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
            <div>
              <MailIcon />{" "}
              <ResumeLink href={p.email} kind="email">
                {p.email}
              </ResumeLink>
            </div>
          )}
          {p.linkedIn && (
            <div style={{ wordBreak: "break-all" }}>
              <LinkedInIcon />{" "}
              <ResumeLink href={p.linkedIn}>{p.linkedIn}</ResumeLink>
            </div>
          )}
          {p.github && (
            <div style={{ wordBreak: "break-all" }}>
              <GitHubIcon /> <ResumeLink href={p.github}>{p.github}</ResumeLink>
            </div>
          )}
          {p.website && (
            <div style={{ wordBreak: "break-all" }}>
              <GlobeIcon />{" "}
              <ResumeLink href={p.website}>{p.website}</ResumeLink>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left column */}
        <div
          style={{
            width: LEFT_W,
            padding: "28px 22px 28px 28px",
            ...REPEAT_PADDING,
            boxSizing: "border-box",
            borderRight: `1px solid ${DIVIDER}`,
            flexShrink: 0,
          }}
        >
          {/* About Me */}
          {p.summary && (
            <LeftSection title="About Me">
              <p
                style={{
                  fontFamily: '"Source Sans 3", sans-serif',
                  fontSize: 10,
                  color: MUTED,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {p.summary}
              </p>
            </LeftSection>
          )}

          {/* Education */}
          {education.length > 0 && (
            <LeftSection title="Education">
              {education.map((s) => {
                const c = s.content as EducationContent;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 14,
                      ...NO_SPLIT,
                    }}
                  >
                    <div style={{ paddingTop: 4, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          border: `2px solid ${ACCENT}`,
                          backgroundColor: BG,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: '"Source Sans 3", sans-serif',
                        fontSize: 10,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: DARK }}>
                        {c.degree}
                      </div>
                      {c.field && <div style={{ color: MUTED }}>{c.field}</div>}
                      <div style={{ color: DARK }}>{c.institution}</div>
                      {(c.endDate || c.startDate) && (
                        <div
                          style={{
                            fontFamily: '"Lora", serif',
                            fontStyle: "italic",
                            fontSize: 9.5,
                            color: MUTED,
                            marginTop: 2,
                          }}
                        >
                          {c.endDate ?? c.startDate}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </LeftSection>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <LeftSection title="Skills">
              {skills.map((sk, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    marginBottom: 6,
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontSize: 10.5,
                  }}
                >
                  <span style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}>
                    •
                  </span>
                  <span>
                    {sk.name}
                    <span style={{ color: MUTED, fontSize: 9.5 }}>
                      {" "}
                      · {sk.level}
                    </span>
                  </span>
                </div>
              ))}
            </LeftSection>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <LeftSection title="Languages">
              {langs.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    marginBottom: 5,
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontSize: 10.5,
                  }}
                >
                  <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
                  <span>
                    {l.language}
                    {l.proficiency ? (
                      <span style={{ color: MUTED }}> · {l.proficiency}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </LeftSection>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <LeftSection title="Certifications">
              {certs.map((c, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 8,
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontSize: 10,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  {c.issuer && <div style={{ color: MUTED }}>{c.issuer}</div>}
                  {c.date && (
                    <div
                      style={{
                        fontFamily: '"Lora", serif',
                        fontStyle: "italic",
                        fontSize: 9.5,
                        color: MUTED,
                      }}
                    >
                      {c.date}
                    </div>
                  )}
                  <CertExtras
                    cert={c}
                    linkColor={ACCENT}
                    mutedColor={MUTED}
                    fontSize={9.5}
                  />
                </div>
              ))}
            </LeftSection>
          )}
        </div>

        {/* Right column */}
        <div
          style={{
            width: RIGHT_W,
            padding: "28px 32px 28px 28px",
            ...REPEAT_PADDING,
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
                    }}
                  >
                    <div style={{ paddingTop: 4, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `2px solid ${ACCENT}`,
                          backgroundColor: BG,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={KEEP_WITH_NEXT}>
                        <div
                          style={{
                            fontFamily: '"Source Sans 3", sans-serif',
                            fontWeight: 700,
                            fontSize: 11.5,
                          }}
                        >
                          {c.role}
                        </div>
                        <div
                          style={{
                            fontFamily: '"Source Sans 3", sans-serif',
                            fontSize: 10.5,
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
                      </div>
                      {c.bullets.filter(Boolean).map((b, i) => (
                        <div
                          key={i}
                          style={{
                            ...(i === 0 ? KEEP_WITH_PREV : NO_SPLIT),
                            display: "flex",
                            gap: 8,
                            marginBottom: 3,
                            fontFamily: '"Source Sans 3", sans-serif',
                            fontSize: 10.5,
                            lineHeight: 1.55,
                          }}
                        >
                          <span style={{ color: ACCENT, flexShrink: 0 }}>
                            •
                          </span>
                          <div dangerouslySetInnerHTML={{ __html: b }} />
                        </div>
                      ))}
                      {c.skills && c.skills.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            ...NO_SPLIT,
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
                                border: `1px solid ${DIVIDER}`,
                                backgroundColor: BG,
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
                    }}
                  >
                    <div style={{ paddingTop: 4, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `2px solid ${ACCENT}`,
                          backgroundColor: BG,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={KEEP_WITH_NEXT}>
                        <div
                          style={{
                            fontFamily: '"Source Sans 3", sans-serif',
                            fontWeight: 700,
                            fontSize: 11.5,
                          }}
                        >
                          {proj.name}
                        </div>
                        {(meta || proj.url) && (
                          <div
                            style={{
                              fontFamily: '"Source Sans 3", sans-serif',
                              fontSize: 10.5,
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
                      </div>
                      {proj.bullets.filter(Boolean).map((b, j) => (
                        <div
                          key={j}
                          style={{
                            ...(j === 0 ? KEEP_WITH_PREV : NO_SPLIT),
                            display: "flex",
                            gap: 8,
                            marginBottom: 3,
                            fontFamily: '"Source Sans 3", sans-serif',
                            fontSize: 10.5,
                            lineHeight: 1.55,
                          }}
                        >
                          <span style={{ color: ACCENT, flexShrink: 0 }}>
                            •
                          </span>
                          <div dangerouslySetInnerHTML={{ __html: b }} />
                        </div>
                      ))}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            ...NO_SPLIT,
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
                                border: `1px solid ${DIVIDER}`,
                                backgroundColor: BG,
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
    </div>
  );
}

function LeftSection({
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
          ...KEEP_WITH_NEXT,
          fontFamily: '"Lora", serif',
          fontSize: 13,
          fontWeight: 600,
          color: ACCENT,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: `1px solid ${DIVIDER}`,
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
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          ...KEEP_WITH_NEXT,
          fontFamily: '"Lora", serif',
          fontSize: 15,
          fontWeight: 600,
          color: DARK,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...KEEP_WITH_NEXT,
          height: 1,
          backgroundColor: DIVIDER,
          marginBottom: 14,
        }}
      />
      {children}
    </div>
  );
}
