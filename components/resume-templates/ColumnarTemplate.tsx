import type { ResumeData, WorkContent, EducationContent, SkillsContent, CertificationContent, LanguageContent, ProjectContent } from '@/types'

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Layout:
//   — Centered header: large bold name + job title + single contact line
//   — Two-column body rows: narrow LEFT label | wide RIGHT content
//   — Thin horizontal rule divides each section
// A4: 794px × 1123px

const PAD_X    = 52
const PAD_Y    = 40
const LABEL_W  = 118
const GAP      = 26

const BODY  = '#1a1a1a'
const MUTED = '#5a5a5a'
const RULE  = '#c8c8c8'

export const COLUMNAR_THEMES: Record<string, {
  label: string
  sidebarBg: string
  accent: string
}> = {
  black:   { label: 'Black',   sidebarBg: '#1a1a1a', accent: '#1a1a1a' },
  navy:    { label: 'Navy',    sidebarBg: '#1e3a5f', accent: '#1e3a5f' },
  forest:  { label: 'Forest',  sidebarBg: '#1a3d2b', accent: '#1a3d2b' },
}

export default function ColumnarTemplate({ data }: { data: ResumeData }) {
  const { personalInfo: p, sections } = data
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder)

  const { accent: ACCENT } =
    COLUMNAR_THEMES[p.theme ?? 'black'] ?? COLUMNAR_THEMES.black

  const work      = sorted.filter((s) => s.type === 'work')
  const education = sorted.filter((s) => s.type === 'education')
  const skillsSec = sorted.find((s) => s.type === 'skills')
  const certSec   = sorted.find((s) => s.type === 'certifications')
  const langSec   = sorted.find((s) => s.type === 'languages')
  const projSec   = sorted.find((s) => s.type === 'projects')

  const skills   = skillsSec ? (skillsSec.content as SkillsContent).skills : []
  const certs    = certSec   ? (certSec.content as CertificationContent[]) : []
  const langs    = langSec   ? (langSec.content as LanguageContent[]) : []
  const projects = projSec   ? (projSec.content as ProjectContent[]) : []

  // Build contact items
  const contacts: string[] = []
  if (p.email)    contacts.push(p.email)
  if (p.phone)    contacts.push(p.phone)
  if (p.website)  contacts.push(p.website)
  if (p.linkedIn) contacts.push(p.linkedIn)
  if (p.location) contacts.push(p.location)

  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: '#ffffff', fontFamily: '"Source Sans 3", Arial, sans-serif', fontSize: 11, color: BODY, boxSizing: 'border-box', padding: `${PAD_Y}px ${PAD_X}px` }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 300; src: url('/fonts/source-sans-300.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 400; src: url('/fonts/source-sans-400.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 600; src: url('/fonts/source-sans-600.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 700; src: url('/fonts/source-sans-700.woff2') format('woff2'); }
      ` }} />

      {/* ══════════════════════════════════
          HEADER — centered
      ══════════════════════════════════ */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {/* Name */}
        <div style={{ fontSize: 38, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: 4, lineHeight: 1, marginBottom: 8 }}>
          {p.name || 'Your Name'}
        </div>
        {/* Job title */}
        {p.jobTitle && (
          <div style={{ fontSize: 12, fontWeight: 400, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>
            {p.jobTitle}
          </div>
        )}
        {/* Contact line */}
        {contacts.length > 0 && (
          <div style={{ fontSize: 9.5, color: MUTED, letterSpacing: 0.3 }}>
            {contacts.join('  |  ')}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          SUMMARY
      ══════════════════════════════════ */}
      {p.summary && (
        <SectionRow label="Summary" accent={ACCENT}>
          <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.75, color: MUTED }}>{p.summary}</p>
        </SectionRow>
      )}

      {/* ══════════════════════════════════
          WORK EXPERIENCE
      ══════════════════════════════════ */}
      {work.length > 0 && (
        <SectionRow label="Work Experience" accent={ACCENT}>
          {work.map((s, idx) => {
            const c = s.content as WorkContent
            return (
              <div key={s.id} style={{ marginBottom: idx < work.length - 1 ? 16 : 0, pageBreakInside: 'avoid' }}>
                {/* Role + dates row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: BODY }}>{c.role}</div>
                  {(c.startDate || c.endDate || c.current) && (
                    <div style={{ fontSize: 9.5, color: MUTED, fontStyle: 'italic', flexShrink: 0, marginLeft: 10 }}>
                      {c.startDate}{c.startDate && (c.current || c.endDate) ? ` – ${c.current ? 'Present' : c.endDate}` : ''}
                    </div>
                  )}
                </div>
                {/* Company */}
                {c.company && (
                  <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 5 }}>{c.company}</div>
                )}
                {/* Bullets */}
                {c.bullets.filter(Boolean).map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 3, fontSize: 10.5, lineHeight: 1.6, color: BODY }}>
                    <span style={{ flexShrink: 0 }}>•</span>
                    <div dangerouslySetInnerHTML={{ __html: b }} />
                  </div>
                ))}
              </div>
            )
          })}
        </SectionRow>
      )}

      {/* ══════════════════════════════════
          EDUCATION
      ══════════════════════════════════ */}
      {education.length > 0 && (
        <SectionRow label="Education" accent={ACCENT}>
          {education.map((s, idx) => {
            const c = s.content as EducationContent
            return (
              <div key={s.id} style={{ marginBottom: idx < education.length - 1 ? 14 : 0, pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: BODY }}>{c.institution}</div>
                  {(c.startDate || c.endDate) && (
                    <div style={{ fontSize: 9.5, color: MUTED, fontStyle: 'italic', flexShrink: 0, marginLeft: 10 }}>
                      {c.startDate && c.endDate ? `${c.startDate} – ${c.endDate}` : (c.endDate ?? c.startDate)}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10.5, color: MUTED, marginBottom: c.gpa ? 2 : 0 }}>
                  {c.degree}{c.field ? ` in ${c.field}` : ''}
                </div>
                {c.gpa && <div style={{ fontSize: 10, color: MUTED }}>Final CGPA: {c.gpa}</div>}
              </div>
            )
          })}
        </SectionRow>
      )}

      {/* ══════════════════════════════════
          PROJECTS
      ══════════════════════════════════ */}
      {projects.length > 0 && (
        <SectionRow label="Projects" accent={ACCENT}>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: i < projects.length - 1 ? 14 : 0, pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: BODY }}>{proj.name}</div>
                {proj.url && <div style={{ fontSize: 9.5, color: MUTED, fontStyle: 'italic' }}>{proj.url}</div>}
              </div>
              {proj.description && <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 4 }}>{proj.description}</div>}
              {proj.bullets.filter(Boolean).map((b, j) => (
                <div key={j} style={{ display: 'flex', gap: 7, marginBottom: 3, fontSize: 10.5, lineHeight: 1.6, color: BODY }}>
                  <span style={{ flexShrink: 0 }}>•</span>
                  <div dangerouslySetInnerHTML={{ __html: b }} />
                </div>
              ))}
            </div>
          ))}
        </SectionRow>
      )}

      {/* ══════════════════════════════════
          KEY SKILLS
      ══════════════════════════════════ */}
      {skills.length > 0 && (
        <SectionRow label="Key Skills" accent={ACCENT}>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 40, rowGap: 0 }}>
            {skills.map((sk, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5, fontSize: 10.5, color: BODY, width: 'calc(50% - 20px)' }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{sk.name}</span>
              </div>
            ))}
          </div>
        </SectionRow>
      )}

      {/* ══════════════════════════════════
          CERTIFICATIONS
      ══════════════════════════════════ */}
      {certs.length > 0 && (
        <SectionRow label="Certifications" accent={ACCENT}>
          {certs.map((c, i) => (
            <div key={i} style={{ marginBottom: i < certs.length - 1 ? 10 : 0, pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BODY }}>{c.name}</div>
                {c.date && <div style={{ fontSize: 9.5, color: MUTED, fontStyle: 'italic' }}>{c.date}</div>}
              </div>
              {c.issuer && <div style={{ fontSize: 10.5, color: MUTED }}>{c.issuer}</div>}
            </div>
          ))}
        </SectionRow>
      )}

      {/* ══════════════════════════════════
          LANGUAGES
      ══════════════════════════════════ */}
      {langs.length > 0 && (
        <SectionRow label="Languages" accent={ACCENT}>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 40, rowGap: 0 }}>
            {langs.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5, fontSize: 10.5, color: BODY, width: 'calc(50% - 20px)' }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{l.language}{l.proficiency ? <span style={{ color: MUTED }}> · {l.proficiency}</span> : null}</span>
              </div>
            ))}
          </div>
        </SectionRow>
      )}
    </div>
  )
}

// ── Section row: horizontal rule + label left + content right ──
function SectionRow({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {/* Top rule */}
      <div style={{ height: 1, backgroundColor: RULE, marginBottom: 12 }} />
      {/* Label + content */}
      <div style={{ display: 'flex', gap: GAP, marginBottom: 18 }}>
        {/* Label */}
        <div style={{ width: LABEL_W, flexShrink: 0, paddingTop: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent }}>
            {label}
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
