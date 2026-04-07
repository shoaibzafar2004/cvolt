import type { ResumeData, WorkContent, EducationContent, SkillsContent, CertificationContent, LanguageContent, ProjectContent } from '@/types'

// RULES: Inline styles ONLY. No Tailwind. No hooks. No fetches.
// Two-column: left sidebar 30% (dark bg) + right main 70%.

const colors = {
  sidebarBg: '#1e293b',
  sidebarText: '#e2e8f0',
  sidebarMuted: '#94a3b8',
  sidebarAccent: '#38bdf8',
  mainText: '#1a1a1a',
  mainMuted: '#555555',
  mainBorder: '#e2e8f0',
  accent: '#0ea5e9',
}

export default function ModernTemplate({ data }: { data: ResumeData }) {
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
    <div style={{ width: 794, minHeight: 1123, fontFamily: '"Inter", sans-serif', fontSize: 11, color: colors.mainText, backgroundColor: '#ffffff', display: 'flex', boxSizing: 'border-box', lineHeight: 1.5 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Sidebar */}
      <div style={{ width: '30%', backgroundColor: colors.sidebarBg, color: colors.sidebarText, padding: '40px 20px', boxSizing: 'border-box', flexShrink: 0 }}>
        {/* Name + title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
            {personalInfo.name || 'Your Name'}
          </h1>
          {personalInfo.jobTitle && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: colors.sidebarAccent, fontWeight: 500 }}>
              {personalInfo.jobTitle}
            </p>
          )}
        </div>

        {/* Contact */}
        <SideSection title="Contact">
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            personalInfo.linkedIn,
            personalInfo.website,
          ].filter(Boolean).map((item, i) => (
            <p key={i} style={{ margin: '0 0 4px', fontSize: 10, color: colors.sidebarMuted, wordBreak: 'break-all' }}>{item}</p>
          ))}
        </SideSection>

        {/* Skills */}
        {skills.length > 0 && (
          <SideSection title="Skills">
            {skills.map((s) => {
              const pct = { Beginner: '25%', Intermediate: '50%', Advanced: '75%', Expert: '100%' }[s.level] ?? '50%'
              return (
                <div key={s.name} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: colors.sidebarText }}>{s.name}</span>
                    <span style={{ fontSize: 9, color: colors.sidebarMuted }}>{s.level}</span>
                  </div>
                  <div style={{ height: 3, backgroundColor: '#334155', borderRadius: 2 }}>
                    <div style={{ height: 3, width: pct, backgroundColor: colors.sidebarAccent, borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </SideSection>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <SideSection title="Languages">
            {langs.map((l, i) => (
              <p key={i} style={{ margin: '0 0 3px', fontSize: 10, color: colors.sidebarMuted }}>
                <span style={{ color: colors.sidebarText, fontWeight: 500 }}>{l.language}</span>
                {l.proficiency ? ` · ${l.proficiency}` : ''}
              </p>
            ))}
          </SideSection>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <SideSection title="Certifications">
            {certs.map((c, i) => (
              <p key={i} style={{ margin: '0 0 4px', fontSize: 10, color: colors.sidebarMuted }}>
                <span style={{ color: colors.sidebarText, fontWeight: 500 }}>{c.name}</span>
                {c.issuer ? <><br />{c.issuer}</> : null}
              </p>
            ))}
          </SideSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 32px', boxSizing: 'border-box' }}>
        {/* Work */}
        {work.length > 0 && (
          <MainSection title="Experience" accent={colors.accent}>
            {work.map((s) => {
              const c = s.content as WorkContent
              return (
                <div key={s.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{c.role}</span>
                    <span style={{ fontSize: 10, color: colors.mainMuted }}>{c.startDate} – {c.current ? 'Present' : c.endDate}</span>
                  </div>
                  <div style={{ color: colors.accent, fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{c.company}</div>
                  {c.bullets.filter(Boolean).map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 2, fontSize: 10.5 }}>
                      <span style={{ color: colors.accent, flexShrink: 0 }}>▸</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </MainSection>
        )}

        {/* Education */}
        {education.length > 0 && (
          <MainSection title="Education" accent={colors.accent}>
            {education.map((s) => {
              const c = s.content as EducationContent
              return (
                <div key={s.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{c.degree} in {c.field}</span>
                    <span style={{ fontSize: 10, color: colors.mainMuted }}>{c.startDate} – {c.endDate ?? 'Present'}</span>
                  </div>
                  <div style={{ color: colors.mainMuted, fontSize: 11 }}>{c.institution}{c.gpa ? ` · GPA ${c.gpa}` : ''}</div>
                </div>
              )
            })}
          </MainSection>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <MainSection title="Projects" accent={colors.accent}>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{p.name}</div>
                {p.description && <div style={{ color: colors.mainMuted, fontSize: 10.5, marginBottom: 3 }}>{p.description}</div>}
                {p.bullets.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 2, fontSize: 10.5 }}>
                    <span style={{ color: colors.accent, flexShrink: 0 }}>▸</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  )
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.sidebarAccent }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function MainSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 4, height: 16, backgroundColor: accent, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
