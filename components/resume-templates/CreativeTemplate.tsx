import type { ResumeData, WorkContent, EducationContent, SkillsContent, CertificationContent, LanguageContent, ProjectContent } from '@/types'

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Bold accent header, horizontal rule section dividers, typographic feel.

const colors = {
  accent: '#7c3aed',
  accentLight: '#ede9fe',
  text: '#18181b',
  muted: '#52525b',
  border: '#e4e4e7',
  headerBg: '#faf5ff',
}

export default function CreativeTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, sections } = data
  const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder)

  const work = sorted.filter((s) => s.type === 'work')
  const education = sorted.filter((s) => s.type === 'education')
  const skillsSection = sorted.find((s) => s.type === 'skills')
  const certSection = sorted.find((s) => s.type === 'certifications')
  const langSection = sorted.find((s) => s.type === 'languages')
  const projSection = sorted.find((s) => s.type === 'projects')

  const skills = skillsSection ? (skillsSection.content as SkillsContent).skills : []
  const certs = certSection ? (certSection.content as CertificationContent[]) : []
  const langs = langSection ? (langSection.content as LanguageContent[]) : []
  const projects = projSection ? (projSection.content as ProjectContent[]) : []

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: '"Georgia", "Times New Roman", serif', fontSize: 11, color: colors.text, backgroundColor: '#ffffff', boxSizing: 'border-box', lineHeight: 1.6 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* Bold header band */}
      <div style={{ backgroundColor: colors.headerBg, borderBottom: `4px solid ${colors.accent}`, padding: '36px 56px 28px' }}>
        <h1 style={{ margin: 0, fontFamily: '"Playfair Display", Georgia, serif', fontSize: 32, fontWeight: 700, color: colors.accent, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          {personalInfo.name || 'Your Name'}
        </h1>
        {personalInfo.jobTitle && (
          <p style={{ margin: '6px 0 0', fontFamily: '"Inter", sans-serif', fontSize: 13, color: colors.muted, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {personalInfo.jobTitle}
          </p>
        )}
        {/* Contact bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 20px', marginTop: 12, fontFamily: '"Inter", sans-serif', fontSize: 10, color: colors.muted }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedIn, personalInfo.website].filter(Boolean).map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: colors.accent }}>·</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 56px' }}>
        {/* Work */}
        {work.length > 0 && (
          <CreativeSection title="Experience">
            {work.map((s) => {
              const c = s.content as WorkContent
              return (
                <div key={s.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 12 }}>{c.role}</span>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 10, color: colors.muted }}>
                      {c.startDate} – {c.current ? 'Present' : c.endDate}
                    </span>
                  </div>
                  <div style={{ fontFamily: '"Inter", sans-serif', color: colors.accent, fontSize: 11, fontWeight: 500, marginBottom: 5 }}>{c.company}</div>
                  {c.bullets.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ fontFamily: '"Inter", sans-serif', display: 'flex', gap: 8, marginBottom: 3, fontSize: 10.5 }}>
                      <span style={{ color: colors.accent, flexShrink: 0, fontWeight: 700 }}>—</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </CreativeSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <CreativeSection title="Education">
            {education.map((s) => {
              const c = s.content as EducationContent
              return (
                <div key={s.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 12 }}>{c.degree} in {c.field}</span>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 10, color: colors.muted }}>{c.startDate} – {c.endDate ?? 'Present'}</span>
                  </div>
                  <div style={{ fontFamily: '"Inter", sans-serif', color: colors.muted, fontSize: 11 }}>
                    {c.institution}{c.gpa ? ` · GPA ${c.gpa}` : ''}
                  </div>
                </div>
              )
            })}
          </CreativeSection>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <CreativeSection title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map((skill) => (
                <span key={skill.name} style={{ fontFamily: '"Inter", sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: colors.accentLight, color: colors.accent, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500 }}>
                  {skill.name}
                  <span style={{ color: colors.muted, fontWeight: 400, fontSize: 9 }}>· {skill.level}</span>
                </span>
              ))}
            </div>
          </CreativeSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <CreativeSection title="Projects">
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 12 }}>{p.name}</div>
                {p.description && <div style={{ fontFamily: '"Inter", sans-serif', color: colors.muted, fontSize: 10.5, fontStyle: 'italic', marginBottom: 3 }}>{p.description}</div>}
              </div>
            ))}
          </CreativeSection>
        )}

        {/* Two-column footer: certs + languages */}
        {(certs.length > 0 || langs.length > 0) && (
          <div style={{ display: 'flex', gap: 40, marginTop: 4 }}>
            {certs.length > 0 && (
              <div style={{ flex: 1 }}>
                <CreativeSection title="Certifications">
                  {certs.map((c, i) => (
                    <p key={i} style={{ fontFamily: '"Inter", sans-serif', margin: '0 0 4px', fontSize: 10.5 }}>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                      {c.issuer ? <span style={{ color: colors.muted }}> · {c.issuer}</span> : null}
                    </p>
                  ))}
                </CreativeSection>
              </div>
            )}
            {langs.length > 0 && (
              <div style={{ flex: 1 }}>
                <CreativeSection title="Languages">
                  {langs.map((l, i) => (
                    <p key={i} style={{ fontFamily: '"Inter", sans-serif', margin: '0 0 4px', fontSize: 10.5 }}>
                      <span style={{ fontWeight: 500 }}>{l.language}</span>
                      {l.proficiency ? <span style={{ color: colors.muted }}> · {l.proficiency}</span> : null}
                    </p>
                  ))}
                </CreativeSection>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CreativeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontFamily: '"Playfair Display", Georgia, serif', fontSize: 14, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap' }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: 1, backgroundColor: colors.accent, opacity: 0.3 }} />
      </div>
      {children}
    </div>
  )
}
