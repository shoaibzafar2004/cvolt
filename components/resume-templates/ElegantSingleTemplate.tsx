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
// Elegant single-column — warm cream bg, large serif name, circle entry markers,
// italic dates. Inspired by warm editorial resume style. ATS-friendly.
// A4: 794px × 1123px

const BG = "#f5f0e6";
const DARK = "#2a1f0e";
const ACCENT = "#7a5c2e";
const MUTED = "#9c8060";
const DIVIDER = "#d8c9b0";

export default function ElegantSingleTemplate({ data }: { data: ResumeData }) {
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
        padding: "48px 60px",
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

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 24,
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
                fontSize: 34,
                fontWeight: 700,
                color: BG,
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: '"Lora", serif',
              fontSize: 28,
              fontWeight: 400,
              color: DARK,
              lineHeight: 1,
            }}
          >
            {firstName}
          </div>
          <div
            style={{
              fontFamily: '"Lora", serif',
              fontSize: 28,
              fontWeight: 700,
              color: DARK,
              lineHeight: 1.1,
            }}
          >
            {lastName || "\u00A0"}
          </div>
          {p.jobTitle && (
            <div
              style={{
                fontFamily: '"Source Sans 3", sans-serif',
                fontSize: 8.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: ACCENT,
                marginTop: 6,
              }}
            >
              {p.jobTitle}
            </div>
          )}
        </div>

        {/* Contact block */}
        <div
          style={{
            fontFamily: '"Source Sans 3", sans-serif',
            fontSize: 9.5,
            color: MUTED,
            lineHeight: 1.9,
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
              <PhoneIcon /> {p.phone}
            </div>
          )}
          {p.email && (
            <div>
              <MailIcon /> {p.email}
            </div>
          )}
          {p.linkedIn && (
            <div>
              <LinkedInIcon /> {p.linkedIn}
            </div>
          )}
          {p.github && (
            <div>
              <GitHubIcon /> {p.github}
            </div>
          )}
          {p.website && (
            <div>
              <GlobeIcon /> {p.website}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: DIVIDER, marginBottom: 28 }} />

      {/* ── About Me ── */}
      {p.summary && (
        <Section title="About Me">
          <p
            style={{
              fontFamily: '"Source Sans 3", sans-serif',
              fontSize: 10.5,
              color: MUTED,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {p.summary}
          </p>
        </Section>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((s) => {
            const c = s.content as EducationContent;
            return (
              <Entry key={s.id}>
                <div
                  style={{
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontWeight: 700,
                    fontSize: 11.5,
                  }}
                >
                  {c.degree}
                  {c.field ? ` in ${c.field}` : ""}
                </div>
                <div
                  style={{
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontSize: 10.5,
                    marginTop: 1,
                  }}
                >
                  {c.institution}
                </div>
                {(c.startDate || c.endDate) && (
                  <div
                    style={{
                      fontFamily: '"Lora", serif',
                      fontStyle: "italic",
                      fontSize: 10,
                      color: MUTED,
                      marginTop: 2,
                      marginBottom: 4,
                    }}
                  >
                    {c.endDate ?? c.startDate}
                  </div>
                )}
                {c.gpa && <Bullet>GPA: {c.gpa}</Bullet>}
              </Entry>
            );
          })}
        </Section>
      )}

      {/* ── Work ── */}
      {work.length > 0 && (
        <Section title="Work History">
          {work.map((s) => {
            const c = s.content as WorkContent;
            return (
              <Entry key={s.id}>
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
                  <Bullet key={i} html={b} />
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
              </Entry>
            );
          })}
        </Section>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj, i) => {
            const meta = projectMeta(proj);
            const dates = projectDates(proj).replace(" – ", " to ");
            return (
              <Entry key={i}>
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
                      color: DARK,
                      marginTop: 1,
                    }}
                  >
                    {meta}
                    {meta && proj.url ? " · " : ""}
                    {proj.url && (
                      <span style={{ color: ACCENT }}>
                        {displayUrl(proj.url)}
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
                  <Bullet key={j} html={b} />
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
              </Entry>
            );
          })}
        </Section>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <Section title="Skills">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 0",
              fontFamily: '"Source Sans 3", sans-serif',
              fontSize: 10.5,
            }}
          >
            {skills.map((sk, i) => (
              <span key={i}>
                {i > 0 && (
                  <span style={{ color: DIVIDER, margin: "0 8px" }}>|</span>
                )}
                <span>{sk.name}</span>
                <span style={{ color: MUTED, fontSize: 9.5 }}>
                  {" "}
                  ({sk.level})
                </span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Certifications ── */}
      {certs.length > 0 && (
        <Section title="Certifications">
          {certs.map((c, i) => (
            <Entry key={i}>
              <div
                style={{
                  fontFamily: '"Source Sans 3", sans-serif',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {c.name}
              </div>
              {c.issuer && (
                <div
                  style={{
                    fontFamily: '"Source Sans 3", sans-serif',
                    fontSize: 10.5,
                    color: MUTED,
                  }}
                >
                  {c.issuer}
                </div>
              )}
              {c.date && (
                <div
                  style={{
                    fontFamily: '"Lora", serif',
                    fontStyle: "italic",
                    fontSize: 10,
                    color: MUTED,
                  }}
                >
                  {c.date}
                </div>
              )}
            </Entry>
          ))}
        </Section>
      )}

      {/* ── Languages ── */}
      {langs.length > 0 && (
        <Section title="Languages">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 0",
              fontFamily: '"Source Sans 3", sans-serif',
              fontSize: 10.5,
            }}
          >
            {langs.map((l, i) => (
              <span key={i}>
                {i > 0 && (
                  <span style={{ color: DIVIDER, margin: "0 8px" }}>|</span>
                )}
                <span>{l.language}</span>
                {l.proficiency && (
                  <span style={{ color: MUTED, fontSize: 9.5 }}>
                    {" "}
                    ({l.proficiency})
                  </span>
                )}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
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
          fontFamily: '"Lora", serif',
          fontSize: 15,
          fontWeight: 600,
          color: ACCENT,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Entry({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        marginBottom: 16,
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
            backgroundColor: BG,
          }}
        />
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Bullet({
  children,
  html,
}: {
  children?: React.ReactNode;
  html?: string;
}) {
  return (
    <div
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
      {html !== undefined ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <span>{children}</span>
      )}
    </div>
  );
}
