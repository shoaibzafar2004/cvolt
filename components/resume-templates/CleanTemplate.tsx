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
} from "./pagination";
import { displayUrl, projectDates, projectMeta } from "@/lib/resume-format";

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Must render identically in browser and via ReactDOMServer.renderToStaticMarkup().
// A4: 794px × 1123px. Fonts via @font-face in <style> tag below.

export const CLEAN_THEMES: Record<string, { label: string; accent: string }> = {
  blue: { label: "Blue", accent: "#1d4ed8" },
  emerald: { label: "Emerald", accent: "#059669" },
  rose: { label: "Rose", accent: "#e11d48" },
};

export default function CleanTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, sections } = data;

  const { accent } =
    CLEAN_THEMES[personalInfo.theme ?? "blue"] ?? CLEAN_THEMES.blue;
  const colors = {
    text: "#1a1a1a",
    muted: "#555555",
    border: "#d4d4d4",
    accent,
  };
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  const work = sorted.filter((s) => s.type === "work");
  const education = sorted.filter((s) => s.type === "education");
  const skillsSection = sorted.find((s) => s.type === "skills");
  const certSection = sorted.find((s) => s.type === "certifications");
  const langSection = sorted.find((s) => s.type === "languages");
  const projSection = sorted.find((s) => s.type === "projects");

  const skills = skillsSection
    ? (skillsSection.content as SkillsContent).skills
    : [];
  const certs = certSection
    ? (certSection.content as CertificationContent[])
    : [];
  const langs = langSection ? (langSection.content as LanguageContent[]) : [];
  const projects = projSection ? (projSection.content as ProjectContent[]) : [];

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        fontFamily: '"Inter", sans-serif',
        fontSize: 11,
        color: colors.text,
        backgroundColor: "#ffffff",
        padding: "48px 56px",
        ...REPEAT_PADDING,
        boxSizing: "border-box",
        lineHeight: 1.5,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: url('/fonts/inter-400.woff2') format('woff2'); }
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: url('/fonts/inter-500.woff2') format('woff2'); }
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; src: url('/fonts/inter-600.woff2') format('woff2'); }
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: url('/fonts/inter-700.woff2') format('woff2'); }
      `,
        }}
      />

      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          borderBottom: `2px solid ${colors.accent}`,
          paddingBottom: 16,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: colors.text,
            letterSpacing: "-0.5px",
          }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: colors.accent,
              fontWeight: 500,
            }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        <div
          style={{
            display: "flex",
            ...NO_SPLIT,
            flexWrap: "wrap",
            gap: "0 16px",
            marginTop: 8,
            fontSize: 10,
            color: colors.muted,
          }}
        >
          {personalInfo.email && (
            <span>
              <MailIcon />{" "}
              <ResumeLink href={personalInfo.email} kind="email">
                {personalInfo.email}
              </ResumeLink>
            </span>
          )}
          {personalInfo.phone && (
            <span>
              <PhoneIcon />{" "}
              <ResumeLink href={personalInfo.phone} kind="phone">
                {personalInfo.phone}
              </ResumeLink>
            </span>
          )}
          {personalInfo.location && (
            <span>
              <PinIcon /> {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedIn && (
            <span>
              <LinkedInIcon />{" "}
              <ResumeLink href={personalInfo.linkedIn}>
                {personalInfo.linkedIn}
              </ResumeLink>
            </span>
          )}
          {personalInfo.github && (
            <span>
              <GitHubIcon />{" "}
              <ResumeLink href={personalInfo.github}>
                {personalInfo.github}
              </ResumeLink>
            </span>
          )}
          {personalInfo.website && (
            <span>
              <GlobeIcon />{" "}
              <ResumeLink href={personalInfo.website}>
                {personalInfo.website}
              </ResumeLink>
            </span>
          )}
        </div>
      </div>

      {/* About Me */}
      {personalInfo.summary && (
        <Section title="About Me" accent={colors.accent} border={colors.border}>
          <p style={{ margin: 0, lineHeight: 1.7, color: colors.muted }}>
            {personalInfo.summary}
          </p>
        </Section>
      )}

      {/* Work experience */}
      {work.length > 0 && (
        <Section
          title="Experience"
          accent={colors.accent}
          border={colors.border}
        >
          {work.map((s) => {
            const c = s.content as WorkContent;
            return (
              <div key={s.id} style={{ marginBottom: 14 }}>
                <div style={KEEP_WITH_NEXT}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 12 }}>
                      {c.role}
                    </span>
                    <span style={{ fontSize: 10, color: colors.muted }}>
                      {c.startDate} – {c.current ? "Present" : c.endDate}
                    </span>
                  </div>
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: 11,
                      marginBottom: 4,
                    }}
                  >
                    {c.company}
                  </div>
                </div>
                {c.bullets.filter(Boolean).map((b, i) => (
                  <div
                    key={i}
                    style={{
                      ...(i === 0 ? KEEP_WITH_PREV : NO_SPLIT),
                      display: "flex",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ color: colors.accent, flexShrink: 0 }}>
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
                          color: colors.accent,
                          border: `1px solid ${colors.accent}`,
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
            );
          })}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects" accent={colors.accent} border={colors.border}>
          {projects.map((p, i) => {
            const meta = projectMeta(p);
            const dates = projectDates(p);
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={KEEP_WITH_NEXT}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 12 }}>
                      {p.name}
                    </span>
                    {dates && (
                      <span style={{ fontSize: 10, color: colors.muted }}>
                        {dates}
                      </span>
                    )}
                  </div>
                  {(meta || p.url) && (
                    <div
                      style={{
                        color: colors.muted,
                        fontSize: 11,
                        marginBottom: 4,
                      }}
                    >
                      {meta}
                      {meta && p.url ? " · " : ""}
                      {p.url && (
                        <span style={{ color: colors.accent }}>
                          <ResumeLink href={p.url}>
                            {displayUrl(p.url)}
                          </ResumeLink>
                        </span>
                      )}
                    </div>
                  )}
                  {p.description && (
                    <div style={{ marginBottom: 3 }}>{p.description}</div>
                  )}
                </div>
                {p.bullets.filter(Boolean).map((b, j) => (
                  <div
                    key={j}
                    style={{
                      ...(j === 0 ? KEEP_WITH_PREV : NO_SPLIT),
                      display: "flex",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ color: colors.accent, flexShrink: 0 }}>
                      •
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: b }} />
                  </div>
                ))}
                {p.techStack && p.techStack.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      ...NO_SPLIT,
                      flexWrap: "wrap",
                      gap: "4px 6px",
                      marginTop: 6,
                    }}
                  >
                    {p.techStack.map((t, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: 9,
                          color: colors.accent,
                          border: `1px solid ${colors.accent}`,
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
            );
          })}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section
          title="Education"
          accent={colors.accent}
          border={colors.border}
        >
          {education.map((s) => {
            const c = s.content as EducationContent;
            return (
              <div key={s.id} style={{ marginBottom: 10, ...NO_SPLIT }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 12 }}>
                    {c.degree} in {c.field}
                  </span>
                  <span style={{ fontSize: 10, color: colors.muted }}>
                    {c.startDate} – {c.endDate ?? "Present"}
                  </span>
                </div>
                <div style={{ color: colors.muted, fontSize: 11 }}>
                  {c.institution}
                  {c.gpa ? ` · GPA ${c.gpa}` : ""}
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills" accent={colors.accent} border={colors.border}>
          <div
            style={{ display: "flex", ...NO_SPLIT, flexWrap: "wrap", gap: 6 }}
          >
            {skills.map((skill, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#f0f4ff",
                  color: colors.accent,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 500,
                }}
              >
                {skill.name}
                <span
                  style={{ color: colors.muted, fontWeight: 400, fontSize: 9 }}
                >
                  · {skill.level}
                </span>
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <Section
          title="Certifications"
          accent={colors.accent}
          border={colors.border}
        >
          {certs.map((c, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>
                  {c.name}
                  {c.issuer ? (
                    <span style={{ fontWeight: 400, color: colors.muted }}>
                      {" "}
                      · {c.issuer}
                    </span>
                  ) : null}
                </span>
                {c.date && (
                  <span style={{ fontSize: 10, color: colors.muted }}>
                    {c.date}
                  </span>
                )}
              </div>
              <CertExtras
                cert={c}
                linkColor={colors.accent}
                mutedColor={colors.muted}
                fontSize={10}
                style={{ marginTop: 0 }}
              />
            </div>
          ))}
        </Section>
      )}

      {/* Languages */}
      {langs.length > 0 && (
        <Section
          title="Languages"
          accent={colors.accent}
          border={colors.border}
        >
          <div
            style={{
              display: "flex",
              ...NO_SPLIT,
              flexWrap: "wrap",
              gap: "4px 24px",
            }}
          >
            {langs.map((l, i) => (
              <span key={i}>
                <span style={{ fontWeight: 500 }}>{l.language}</span>
                {l.proficiency ? (
                  <span style={{ color: colors.muted }}>
                    {" "}
                    · {l.proficiency}
                  </span>
                ) : null}
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
  accent,
  border,
  children,
}: {
  title: string;
  accent: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          ...KEEP_WITH_NEXT,
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: accent,
          borderBottom: `1px solid ${border}`,
          paddingBottom: 4,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
