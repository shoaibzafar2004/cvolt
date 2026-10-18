import type {
  ResumeData,
  WorkContent,
  EducationContent,
  SkillsContent,
  CertificationContent,
  LanguageContent,
  ProjectContent,
} from '@/types'

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Font: Libre Franklin — geometric, clean, wide letterforms.
// Layout:
//   — Full-width header: giant stacked name (left) + contact strip (right)
//   — Thin rule
//   — Two-column body: left 58% (Profile + Work Experience) | right 42% (Education + Skills + Languages)
// No photo, no sidebar colour. Pure typographic.
// A4: 794px × 1123px

const PAD = 44 // horizontal page padding
const GAP = 28 // column gap
const LEFT = 420 // left column width
const RIGHT = 794 - PAD * 2 - GAP - LEFT // ≈ 258

export const GEOMETRIC_THEMES: Record<
  string,
  {
    label: string
    accent: string
    sidebarBg: string // used as left-half of ThemePicker swatch
  }
> = {
  classic: { label: 'Classic', accent: '#55565c', sidebarBg: '#55565c' },
  navy: { label: 'Navy', accent: '#1b3a6b', sidebarBg: '#1b3a6b' },
  forest: { label: 'Forest', accent: '#14532d', sidebarBg: '#14532d' },
}

const MUTED = '#666666'
const BODY = '#2d2d2d'
const RULE = '#d8d8d8'

export default function GeometricTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder)

  const { accent: ACCENT } = GEOMETRIC_THEMES[p.theme ?? 'classic'] ?? GEOMETRIC_THEMES.classic

  const work = sorted.filter((s) => s.type === 'work')
  const education = sorted.filter((s) => s.type === 'education')
  const skillsSec = sorted.find((s) => s.type === 'skills')
  const certSec = sorted.find((s) => s.type === 'certifications')
  const langSec = sorted.find((s) => s.type === 'languages')
  const projSec = sorted.find((s) => s.type === 'projects')

  const skills = skillsSec ? (skillsSec.content as SkillsContent).skills : []
  const certs = certSec ? (certSec.content as CertificationContent[]) : []
  const langs = langSec ? (langSec.content as LanguageContent[]) : []
  const projects = projSec ? (projSec.content as ProjectContent[]) : []

  const nameParts = (p.name || 'Your Name').trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  return (
    <div
      style={{
        width: 794,
        minHeight: 1123,
        backgroundColor: '#ffffff',
        fontFamily: '"Libre Franklin", Arial, sans-serif',
        fontSize: 11,
        color: BODY,
        boxSizing: 'border-box',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 300; src: url('/fonts/libre-franklin-300.woff2') format('woff2'); }
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 400; src: url('/fonts/libre-franklin-400.woff2') format('woff2'); }
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 600; src: url('/fonts/libre-franklin-600.woff2') format('woff2'); }
        @font-face { font-family: 'Libre Franklin'; font-style: normal; font-weight: 700; src: url('/fonts/libre-franklin-700.woff2') format('woff2'); }
        @page { margin: 36px 0; }
        @page :first { margin: 0; }
      `,
        }}
      />

      {/* ══════════════════════
          HEADER — full width
      ══════════════════════ */}
      <div
        style={{
          padding: `40px ${PAD}px 24px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Name + title */}
        <div>
          {/* First name */}
          <div
            style={{
              fontSize: 50,
              fontWeight: 500,
              lineHeight: 1,
              color: '#55565c',
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            {firstName}
          </div>
          {/* Last name — accent colour */}
          {lastName && (
            <div
              style={{
                fontSize: 50,
                fontWeight: 500,
                lineHeight: 1.02,
                color: ACCENT,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}
            >
              {lastName}
            </div>
          )}
          {/* Job title */}
          {p.jobTitle && (
            <div
              style={{
                marginTop: 10,
                fontSize: 9.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 3.5,
                color: MUTED,
              }}
            >
              {p.jobTitle}
            </div>
          )}
        </div>

        {/* Contact strip — right */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            marginTop: 6,
            alignItems: 'flex-start',
            minWidth: 200,
          }}
        >
          {p.phone && <ContactRow icon="✆" text={p.phone} accent={ACCENT} />}
          {p.email && <ContactRow icon="✉" text={p.email} accent={ACCENT} />}
          {p.location && <ContactRow icon="◉" text={p.location} accent={ACCENT} />}
          {p.linkedIn && <ContactRow icon="⊕" text={p.linkedIn} accent={ACCENT} />}
          {p.website && <ContactRow icon="⊕" text={p.website} accent={ACCENT} />}
        </div>
      </div>

      {/* Full-width rule */}
      <div style={{ height: 1.5, backgroundColor: ACCENT, marginInline: PAD, marginBottom: 20 }} />

      {/* ══════════════════════
          BODY — two columns
      ══════════════════════ */}
      <div style={{ padding: `0 ${PAD}px 16px`, display: 'flex', gap: GAP }}>
        {/* ── LEFT column ── */}
        <div style={{ width: LEFT, flexShrink: 0 }}>
          {/* Profile / About Me */}
          {p.summary && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Profile" accent={ACCENT} />
              <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.6, color: MUTED }}>
                {p.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {work.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Work Experience" accent={ACCENT} />
              {work.map((s, idx) => {
                const c = s.content as WorkContent
                const dateStr = [c.startDate, c.current ? 'Present' : c.endDate]
                  .filter(Boolean)
                  .join(' – ')
                return (
                  <div
                    key={s.id}
                    style={{
                      marginBottom: idx < work.length - 1 ? 12 : 0,
                      pageBreakInside: 'avoid',
                    }}
                  >
                    {/* Date + Company */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                          color: ACCENT,
                        }}
                      >
                        {dateStr}
                      </span>
                      <span style={{ fontSize: 10, color: MUTED, flexShrink: 0, marginLeft: 8 }}>
                        {c.company}
                      </span>
                    </div>
                    {/* Role */}
                    <div
                      style={{ fontSize: 12, fontWeight: 700, color: '#55565c', marginBottom: 6 }}
                    >
                      {c.role}
                    </div>
                    {/* Bullets — square markers */}
                    {c.bullets.filter(Boolean).map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: 8,
                          marginBottom: 3,
                          fontSize: 10.5,
                          lineHeight: 1.4,
                          color: BODY,
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 7,
                            color: ACCENT,
                            marginTop: 4,
                            lineHeight: 1,
                          }}
                        >
                          ■
                        </span>
                        <div dangerouslySetInnerHTML={{ __html: b }} />
                      </div>
                    ))}
                    {c.skills && c.skills.length > 0 && (
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 6px', marginTop: 6 }}
                      >
                        {c.skills.map((sk, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 9,
                              color: ACCENT,
                              border: `1px solid ${ACCENT}`,
                              padding: '1px 6px',
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Projects" accent={ACCENT} />
              {projects.map((proj, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i < projects.length - 1 ? 16 : 0,
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#55565c', marginBottom: 2 }}>
                    {proj.name}
                    {proj.url && (
                      <span style={{ fontWeight: 400, color: MUTED, fontSize: 9.5 }}>
                        {' '}
                        · {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <div
                      style={{ fontSize: 10, color: MUTED, fontStyle: 'italic', marginBottom: 4 }}
                    >
                      {proj.description}
                    </div>
                  )}
                  {proj.bullets.filter(Boolean).map((b, j) => (
                    <div
                      key={j}
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 3,
                        fontSize: 10.5,
                        lineHeight: 1.4,
                        color: BODY,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 7,
                          color: ACCENT,
                          marginTop: 4,
                          lineHeight: 1,
                        }}
                      >
                        ■
                      </span>
                      <div dangerouslySetInnerHTML={{ __html: b }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vertical rule between columns */}
        <div style={{ width: 1, backgroundColor: RULE, flexShrink: 0 }} />

        {/* ── RIGHT column ── */}
        <div style={{ width: RIGHT, flexShrink: 0 }}>
          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Education" accent={ACCENT} />
              {education.map((s, idx) => {
                const c = s.content as EducationContent
                const dateStr = [c.startDate, c.endDate].filter(Boolean).join(' – ')
                return (
                  <div
                    key={s.id}
                    style={{
                      marginBottom: idx < education.length - 1 ? 14 : 0,
                      pageBreakInside: 'avoid',
                    }}
                  >
                    {dateStr && (
                      <div
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                          color: ACCENT,
                          marginBottom: 2,
                        }}
                      >
                        {dateStr}
                      </div>
                    )}
                    <div
                      style={{ fontSize: 11.5, fontWeight: 700, color: '#55565c', lineHeight: 1.2 }}
                    >
                      {c.institution}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {c.degree}
                      {c.field ? ` of ${c.field}` : ''}
                    </div>
                    {c.gpa && (
                      <div style={{ fontSize: 9.5, color: MUTED, marginTop: 1 }}>GPA: {c.gpa}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Skills" accent={ACCENT} />
              {skills.map((sk, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 6,
                    fontSize: 10.5,
                    color: BODY,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 7,
                      color: ACCENT,
                      marginTop: 4,
                      lineHeight: 1,
                    }}
                  >
                    ■
                  </span>
                  <span>{sk.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Languages" accent={ACCENT} />
              {langs.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 6,
                    fontSize: 10.5,
                    color: BODY,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 7,
                      color: ACCENT,
                      marginTop: 4,
                      lineHeight: 1,
                    }}
                  >
                    ■
                  </span>
                  <span>
                    {l.language}
                    {l.proficiency && <span style={{ color: MUTED }}> · {l.proficiency}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionHeading title="Certifications" accent={ACCENT} />
              {certs.map((c, i) => (
                <div key={i} style={{ marginBottom: 10, pageBreakInside: 'avoid' }}>
                  {c.date && (
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        color: ACCENT,
                        marginBottom: 2,
                      }}
                    >
                      {c.date}
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#55565c' }}>{c.name}</div>
                  {c.issuer && (
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{c.issuer}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <div style={{ width: 3, height: 13, backgroundColor: accent, flexShrink: 0 }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            color: accent,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ height: 1, backgroundColor: RULE }} />
    </div>
  )
}

function ContactRow({ icon, text, accent }: { icon: string; text: string; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontSize: 11, color: accent, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, color: MUTED, wordBreak: 'break-all', lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  )
}
