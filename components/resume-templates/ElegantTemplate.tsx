import type { ResumeData, WorkContent, EducationContent, SkillsContent, CertificationContent, LanguageContent, ProjectContent } from '@/types'

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Inspired by: warm cream bg, large serif name, serif section headings in warm brown,
// decorative circle entry markers, italic date ranges, simple bullet skills.
// A4: 794px × 1123px

const BG        = '#f5f0e6'
const DARK      = '#2a1f0e'
const ACCENT    = '#7a5c2e'
const MUTED     = '#9c8060'
const DIVIDER   = '#d8c9b0'
const LEFT_W    = 250
const RIGHT_W   = 794 - LEFT_W

export default function ElegantTemplate({ data }: { data: ResumeData }) {
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

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: '"Lora", "Georgia", serif', fontSize: 11, color: DARK, backgroundColor: BG, display: 'flex', boxSizing: 'border-box' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face { font-family: 'Lora'; font-style: normal; font-weight: 400; src: url('/fonts/lora-400.woff2') format('woff2'); }
        @font-face { font-family: 'Lora'; font-style: normal; font-weight: 600; src: url('/fonts/lora-600.woff2') format('woff2'); }
        @font-face { font-family: 'Lora'; font-style: normal; font-weight: 700; src: url('/fonts/lora-700.woff2') format('woff2'); }
        @font-face { font-family: 'Lora'; font-style: italic; font-weight: 400; src: url('/fonts/lora-400-italic.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 300; src: url('/fonts/source-sans-300.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 400; src: url('/fonts/source-sans-400.woff2') format('woff2'); }
        @font-face { font-family: 'Source Sans 3'; font-style: normal; font-weight: 600; src: url('/fonts/source-sans-600.woff2') format('woff2'); }
      ` }} />

      {/* ── Left column ── */}
      <div style={{ width: LEFT_W, padding: '40px 24px 40px 28px', boxSizing: 'border-box', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Photo or monogram fallback */}
        <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, flexShrink: 0 }}>
          {p.photoUrl
            ? <img src={p.photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: '"Lora", serif', fontSize: 44, fontWeight: 700, color: BG, lineHeight: 1 }}>{initial}</span>
          }
        </div>

        {/* Name */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: '"Lora", serif', fontSize: 28, fontWeight: 400, color: DARK, lineHeight: 1.1 }}>{firstName}</div>
          <div style={{ fontFamily: '"Lora", serif', fontSize: 28, fontWeight: 700, color: DARK, lineHeight: 1.1 }}>{lastName || '\u00A0'}</div>
        </div>

        {/* Job title */}
        {p.jobTitle && (
          <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 8.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: ACCENT, marginBottom: 16 }}>
            {p.jobTitle}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: DIVIDER, marginBottom: 22 }} />

        {/* About Me */}
        {p.summary && (
          <LeftSection title="About Me">
            <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 10, color: MUTED, lineHeight: 1.7, margin: 0 }}>
              {p.summary}
            </p>
          </LeftSection>
        )}

        {/* Contact */}
        <LeftSection title="Contact Information">
          <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 10, lineHeight: 1.9 }}>
            {p.location && <div><span style={{ marginRight: 6 }}>◉</span><span style={{ color: MUTED }}>{p.location}</span></div>}
            {p.phone    && <div><span style={{ marginRight: 6 }}>✆</span><span style={{ color: MUTED }}>{p.phone}</span></div>}
            {p.email    && <div><span style={{ marginRight: 6 }}>✉</span><span style={{ color: MUTED }}>{p.email}</span></div>}
            {p.linkedIn && <div><span style={{ marginRight: 6 }}>⊕</span><span style={{ color: MUTED, wordBreak: 'break-all' }}>{p.linkedIn}</span></div>}
            {p.website  && <div><span style={{ marginRight: 6 }}>⊕</span><span style={{ color: MUTED, wordBreak: 'break-all' }}>{p.website}</span></div>}
          </div>
        </LeftSection>

        {/* Skills */}
        {skills.length > 0 && (
          <LeftSection title="Skills">
            {skills.map((sk, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5, fontFamily: '"Source Sans 3", sans-serif', fontSize: 10 }}>
                <span style={{ color: ACCENT, marginTop: 1, flexShrink: 0 }}>•</span>
                <span>{sk.name}</span>
              </div>
            ))}
          </LeftSection>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <LeftSection title="Languages">
            {langs.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5, fontFamily: '"Source Sans 3", sans-serif', fontSize: 10 }}>
                <span style={{ color: ACCENT, marginTop: 1, flexShrink: 0 }}>•</span>
                <span>{l.language}{l.proficiency ? <span style={{ color: MUTED }}> · {l.proficiency}</span> : null}</span>
              </div>
            ))}
          </LeftSection>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <LeftSection title="Certifications">
            {certs.map((c, i) => (
              <div key={i} style={{ marginBottom: 8, fontFamily: '"Source Sans 3", sans-serif', fontSize: 10 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                {c.issuer && <div style={{ color: MUTED }}>{c.issuer}</div>}
                {c.date   && <div style={{ color: MUTED, fontSize: 9 }}>{c.date}</div>}
              </div>
            ))}
          </LeftSection>
        )}
      </div>

      {/* ── Right column ── */}
      <div style={{ width: RIGHT_W, padding: '40px 32px 40px 28px', boxSizing: 'border-box', borderLeft: `1px solid ${DIVIDER}` }}>

        {/* Work history */}
        {work.length > 0 && (
          <RightSection title="Work History">
            {work.map((s) => {
              const c = s.content as WorkContent
              return (
                <div key={s.id} style={{ display: 'flex', gap: 14, marginBottom: 20, pageBreakInside: 'avoid' }}>
                  {/* Circle marker */}
                  <div style={{ flexShrink: 0, marginTop: 3 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${ACCENT}`, backgroundColor: BG }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, fontSize: 11.5, color: DARK }}>
                      {c.role}
                    </div>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 10.5, color: DARK, marginTop: 1 }}>
                      {c.company}
                    </div>
                    {(c.startDate || c.endDate) && (
                      <div style={{ fontFamily: '"Lora", serif', fontStyle: 'italic', fontSize: 10, color: MUTED, marginTop: 2, marginBottom: 6 }}>
                        {c.startDate}{c.endDate || c.current ? ` to ${c.current ? 'Present' : c.endDate}` : ''}
                      </div>
                    )}
                    {c.bullets.filter(Boolean).map((b, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3, fontFamily: '"Source Sans 3", sans-serif', fontSize: 10.5, lineHeight: 1.55 }}>
                        <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
                        <span>{b}</span>
                      </div>
                    ))}
                    {c.skills && c.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', marginTop: 6 }}>
                        {c.skills.map((skill, i) => (
                          <span key={i} style={{ fontSize: 9, color: ACCENT, border: `1px solid ${DIVIDER}`, backgroundColor: BG, padding: '1px 7px', borderRadius: 10, fontFamily: '"Source Sans 3", sans-serif' }}>{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </RightSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <RightSection title="Education">
            {education.map((s) => {
              const c = s.content as EducationContent
              return (
                <div key={s.id} style={{ display: 'flex', gap: 14, marginBottom: 18, pageBreakInside: 'avoid' }}>
                  <div style={{ flexShrink: 0, marginTop: 3 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${ACCENT}`, backgroundColor: BG }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, fontSize: 11.5, color: DARK }}>
                      {c.degree}{c.field ? ` in ${c.field}` : ''}
                    </div>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 10.5, color: DARK, marginTop: 1 }}>
                      {c.institution}
                    </div>
                    {(c.startDate || c.endDate) && (
                      <div style={{ fontFamily: '"Lora", serif', fontStyle: 'italic', fontSize: 10, color: MUTED, marginTop: 2, marginBottom: 4 }}>
                        {c.endDate ?? c.startDate}
                      </div>
                    )}
                    {c.gpa && (
                      <div style={{ display: 'flex', gap: 8, fontFamily: '"Source Sans 3", sans-serif', fontSize: 10.5 }}>
                        <span style={{ color: ACCENT }}>•</span>
                        <span>GPA: {c.gpa}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </RightSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <RightSection title="Projects">
            {projects.map((proj, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div style={{ flexShrink: 0, marginTop: 3 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${ACCENT}`, backgroundColor: BG }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontWeight: 700, fontSize: 11.5, color: DARK }}>
                    {proj.name}
                    {proj.url && <span style={{ fontWeight: 400, color: MUTED, fontSize: 9.5 }}> · {proj.url}</span>}
                  </div>
                  {proj.description && (
                    <div style={{ fontFamily: '"Lora", serif', fontStyle: 'italic', fontSize: 10, color: MUTED, marginTop: 2, marginBottom: 4 }}>
                      {proj.description}
                    </div>
                  )}
                  {proj.bullets.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 3, fontFamily: '"Source Sans 3", sans-serif', fontSize: 10.5, lineHeight: 1.55 }}>
                      <span style={{ color: ACCENT, flexShrink: 0 }}>•</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </RightSection>
        )}
      </div>
    </div>
  )
}

function LeftSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: '"Lora", serif', fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function RightSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontFamily: '"Lora", serif', fontSize: 16, fontWeight: 600, color: ACCENT, marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  )
}
