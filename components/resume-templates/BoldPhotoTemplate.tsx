import type { ResumeData, WorkContent, EducationContent, SkillsContent, CertificationContent, LanguageContent, ProjectContent } from '@/types'

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Bold split layout: black sidebar (photo + about + skills) + white main column.
// Inspired by: high-contrast executive style, lime-yellow accent, large name header.
// A4: 794px × 1123px

const SIDEBAR_W = 220
const MAIN_W    = 794 - SIDEBAR_W

export const BOLD_PHOTO_THEMES: Record<string, {
  label: string
  sidebarBg: string
  accent: string
  sidebarText: string
  sidebarMuted: string
}> = {
  noir: {
    label: 'Noir',
    sidebarBg: '#111111',
    accent:    '#c5d500',
    sidebarText:  '#cccccc',
    sidebarMuted: '#888888',
  },
  ocean: {
    label: 'Ocean',
    sidebarBg: '#0d1b2a',
    accent:    '#00b4d8',
    sidebarText:  '#b8d4e8',
    sidebarMuted: '#6b9ab8',
  },
  ember: {
    label: 'Ember',
    sidebarBg: '#1c0f0a',
    accent:    '#f97316',
    sidebarText:  '#e8c9b8',
    sidebarMuted: '#a07060',
  },
}

const MAIN_BG = '#ffffff'
const DARK    = '#1a1a1a'
const MUTED   = '#555555'

const levelPct: Record<string, number> = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 }

export default function BoldPhotoTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder)

  const work      = sorted.filter((s) => s.type === 'work')
  const education = sorted.filter((s) => s.type === 'education')
  const skillsSec = sorted.find((s) => s.type === 'skills')
  const certSec   = sorted.find((s) => s.type === 'certifications')
  const langSec   = sorted.find((s) => s.type === 'languages')
  const projSec   = sorted.find((s) => s.type === 'projects')

  const skills   = skillsSec ? (skillsSec.content as SkillsContent).skills : []
  const certs    = certSec   ? (certSec.content   as CertificationContent[]) : []
  const langs    = langSec   ? (langSec.content   as LanguageContent[]) : []
  const projects = projSec   ? (projSec.content   as ProjectContent[]) : []

  const firstName = (p.name || 'Your Name').split(' ')[0]
  const lastName  = (p.name || '').split(' ').slice(1).join(' ')
  const initial   = (p.name || 'Y')[0].toUpperCase()

  const { sidebarBg: SIDEBAR_BG, accent: ACCENT, sidebarText: SIDEBAR_TEXT, sidebarMuted: SIDEBAR_MUTED } =
    BOLD_PHOTO_THEMES[p.theme ?? 'noir'] ?? BOLD_PHOTO_THEMES.noir

  return (
    <div style={{ width: 794, minHeight: 1123, display: 'flex', fontFamily: '"Inter", "Arial", sans-serif', fontSize: 11, color: DARK, boxSizing: 'border-box' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 300; src: url('/fonts/inter-400.woff2') format('woff2'); }
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: url('/fonts/inter-400.woff2') format('woff2'); }
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; src: url('/fonts/inter-600.woff2') format('woff2'); }
        @font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: url('/fonts/inter-700.woff2') format('woff2'); }
      ` }} />

      {/* ── Left sidebar ── */}
      <div style={{ width: SIDEBAR_W, backgroundColor: SIDEBAR_BG, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Photo */}
        <div style={{ width: SIDEBAR_W, height: 200, overflow: 'hidden', flexShrink: 0, backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.photoUrl
            ? <img src={p.photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            : <span style={{ fontSize: 64, fontWeight: 700, color: '#333', lineHeight: 1 }}>{initial}</span>
          }
        </div>

        <div style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* About Me */}
          {p.summary && (
            <SideSection title="About Me" accent={ACCENT}>
              <p style={{ margin: 0, fontSize: 10, color: SIDEBAR_TEXT, lineHeight: 1.7 }}>
                {p.summary}
              </p>
            </SideSection>
          )}

          {/* Contact */}
          <SideSection title="Contact" accent={ACCENT}>
            <div style={{ fontSize: 10, color: SIDEBAR_TEXT, lineHeight: 1.9 }}>
              {p.phone    && <div>✆ {p.phone}</div>}
              {p.email    && <div style={{ wordBreak: 'break-all' }}>✉ {p.email}</div>}
              {p.location && <div>◉ {p.location}</div>}
              {p.linkedIn && <div style={{ wordBreak: 'break-all' }}>⊕ {p.linkedIn}</div>}
              {p.website  && <div style={{ wordBreak: 'break-all' }}>⊕ {p.website}</div>}
            </div>
          </SideSection>

          {/* Skills */}
          {skills.length > 0 && (
            <SideSection title="Skills" accent={ACCENT}>
              {skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: SIDEBAR_TEXT, marginBottom: 3 }}>
                    <span>{sk.name}</span>
                    <span style={{ color: SIDEBAR_MUTED, fontSize: 9 }}>{sk.level}</span>
                  </div>
                  <div style={{ height: 2, backgroundColor: '#333333', borderRadius: 1 }}>
                    <div style={{ height: 2, width: `${levelPct[sk.level] ?? 50}%`, backgroundColor: ACCENT, borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </SideSection>
          )}

          {/* Languages */}
          {langs.length > 0 && (
            <SideSection title="Languages" accent={ACCENT}>
              {langs.map((l, i) => (
                <div key={i} style={{ fontSize: 10, color: SIDEBAR_TEXT, marginBottom: 4 }}>
                  {l.language}
                  {l.proficiency && <span style={{ color: SIDEBAR_MUTED }}> · {l.proficiency}</span>}
                </div>
              ))}
            </SideSection>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <SideSection title="Certifications" accent={ACCENT}>
              {certs.map((c, i) => (
                <div key={i} style={{ marginBottom: 8, fontSize: 10 }}>
                  <div style={{ color: SIDEBAR_TEXT, fontWeight: 600 }}>{c.name}</div>
                  {c.issuer && <div style={{ color: SIDEBAR_MUTED }}>{c.issuer}</div>}
                  {c.date   && <div style={{ color: SIDEBAR_MUTED, fontSize: 9 }}>{c.date}</div>}
                </div>
              ))}
            </SideSection>
          )}
        </div>
      </div>

      {/* ── Right main column ── */}
      <div style={{ width: MAIN_W, backgroundColor: MAIN_BG, display: 'flex', flexDirection: 'column' }}>

        {/* Name header */}
        <div style={{ padding: '36px 32px 24px', borderBottom: `3px solid ${ACCENT}` }}>
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontSize: 34, fontWeight: 300, letterSpacing: 1, color: DARK, textTransform: 'uppercase' }}>
              {firstName}{' '}
            </span>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: 1, color: DARK, textTransform: 'uppercase' }}>
              {lastName}
            </span>
          </div>
          {p.jobTitle && (
            <div style={{ marginTop: 6, fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2.5, color: MUTED }}>
              {p.jobTitle}
            </div>
          )}
        </div>

        {/* Sections */}
        <div style={{ padding: '24px 32px', flex: 1 }}>

          {/* Experience */}
          {work.length > 0 && (
            <MainSection title="Experience" accent={ACCENT}>
              {work.map((s) => {
                const c = s.content as WorkContent
                return (
                  <div key={s.id} style={{ marginBottom: 16, pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{c.role}</span>
                      <span style={{ fontSize: 9.5, color: MUTED, fontStyle: 'italic', flexShrink: 0, marginLeft: 8 }}>
                        {c.startDate}{c.startDate && (c.current || c.endDate) ? ` – ${c.current ? 'Now' : c.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: ACCENT, fontWeight: 600, marginBottom: 5 }}>{c.company}</div>
                    {c.bullets.filter(Boolean).map((b, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 2.5, fontSize: 10.5, lineHeight: 1.55 }}>
                        <span style={{ color: ACCENT, flexShrink: 0, fontWeight: 700 }}>—</span>
                        <span style={{ color: MUTED }} dangerouslySetInnerHTML={{ __html: b }} />
                      </div>
                    ))}
                    {c.skills && c.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 5px', marginTop: 6 }}>
                        {c.skills.map((skill, i) => (
                          <span key={i} style={{ fontSize: 9, color: DARK, backgroundColor: '#f0f0f0', padding: '1px 7px', borderRadius: 3 }}>{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </MainSection>
          )}

          {/* Education */}
          {education.length > 0 && (
            <MainSection title="Education" accent={ACCENT}>
              {education.map((s) => {
                const c = s.content as EducationContent
                return (
                  <div key={s.id} style={{ marginBottom: 12, pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {c.degree}{c.field ? ` — ${c.field}` : ''}
                      </span>
                      <span style={{ fontSize: 9.5, color: MUTED, fontStyle: 'italic', flexShrink: 0, marginLeft: 8 }}>
                        {c.endDate ?? c.startDate}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: ACCENT, fontWeight: 600 }}>{c.institution}</div>
                    {c.gpa && <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>GPA: {c.gpa}</div>}
                  </div>
                )
              })}
            </MainSection>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <MainSection title="Projects" accent={ACCENT}>
              {projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {proj.name}
                    {proj.url && <span style={{ fontWeight: 400, color: MUTED, fontSize: 9.5, textTransform: 'none', letterSpacing: 0 }}> · {proj.url}</span>}
                  </div>
                  {proj.description && <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{proj.description}</div>}
                  {proj.bullets.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: 7, marginBottom: 2.5, fontSize: 10.5, lineHeight: 1.55, marginTop: 3 }}>
                      <span style={{ color: ACCENT, flexShrink: 0, fontWeight: 700 }}>—</span>
                      <span style={{ color: MUTED }} dangerouslySetInnerHTML={{ __html: b }} />
                    </div>
                  ))}
                </div>
              ))}
            </MainSection>
          )}
        </div>
      </div>
    </div>
  )
}

function SideSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid #2a2a2a` }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function MainSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 16, backgroundColor: accent, flexShrink: 0 }} />
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: DARK }}>
          {title}
        </div>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e8e8e8' }} />
      </div>
      {children}
    </div>
  )
}
