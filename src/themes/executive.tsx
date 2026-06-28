import type { ThemeProps } from "./types";

function formatDate(date?: string): string {
  if (!date) return "Present";
  const parts = date.split("-");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  }
  return date;
}

function dateRange(start?: string, end?: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!start && !end) return "";
  if (!end) return `${s} - Present`;
  return `${s} - ${e}`;
}

export function ExecutiveTheme({ resume, colors: colorOverrides = {} }: ThemeProps) {
  const GOLD = colorOverrides.gold ?? "#C9A84C";
  const DARK = colorOverrides.dark ?? "#1C1C1E";
  const MUTED = "#6E6E73";
  const GOLD_LIGHT = colorOverrides.goldLight ?? "#F5EDD6";

  const s = {
    page: {
      fontFamily: "'Raleway', 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
      color: DARK,
      borderLeft: `4px solid ${DARK}`,
      padding: "22px 36px",
      maxWidth: "210mm",
      lineHeight: 1.45,
      fontSize: "13px",
      backgroundColor: "#FAFAF8",
      boxSizing: "border-box" as const,
    } as React.CSSProperties,
    name: {
      fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
      fontSize: "26px",
      fontWeight: 700,
      color: DARK,
      letterSpacing: "1px",
      marginBottom: "4px",
      lineHeight: 1.1,
    } as React.CSSProperties,
    label: {
      fontSize: "14px",
      color: MUTED,
      marginBottom: "16px",
      fontStyle: "italic" as const,
    } as React.CSSProperties,
    contactRow: {
      fontSize: "12px",
      color: MUTED,
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "0",
      marginBottom: "14px",
      borderBottom: `1px solid ${GOLD}`,
      paddingBottom: "10px",
    } as React.CSSProperties,
    contactItem: {
      marginRight: "12px",
    } as React.CSSProperties,
    contactSep: {
      color: GOLD,
      marginRight: "12px",
    } as React.CSSProperties,
    summary: {
      fontSize: "13px",
      color: "#3C3C3E",
      lineHeight: 1.5,
      fontStyle: "italic" as const,
      borderLeft: `3px solid ${GOLD}`,
      paddingLeft: "16px",
      marginBottom: "12px",
    } as React.CSSProperties,
    sectionTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: "12px",
      fontWeight: 700,
      fontVariant: "small-caps" as const,
      letterSpacing: "3px",
      color: DARK,
      textTransform: "uppercase" as const,
      borderBottom: `1px solid ${GOLD}`,
      paddingBottom: "6px",
      marginBottom: "16px",
      marginTop: "14px",
    } as React.CSSProperties,
    entryRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "2px",
    } as React.CSSProperties,
    entryTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: DARK,
    } as React.CSSProperties,
    entryDate: {
      fontSize: "12px",
      color: GOLD,
      fontWeight: 600,
      whiteSpace: "nowrap" as const,
      marginLeft: "16px",
      flexShrink: 0,
    } as React.CSSProperties,
    entryMeta: {
      fontSize: "12px",
      color: MUTED,
      marginBottom: "8px",
    } as React.CSSProperties,
    text: {
      fontSize: "13px",
      color: "#3C3C3E",
      marginBottom: "4px",
    } as React.CSSProperties,
    bullet: {
      fontSize: "13px",
      color: "#3C3C3E",
      paddingLeft: "16px",
      marginBottom: "3px",
      position: "relative" as const,
    } as React.CSSProperties,
    bulletMark: {
      position: "absolute" as const,
      left: 0,
      color: GOLD,
      fontWeight: 700,
    } as React.CSSProperties,
    skillRow: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "8px",
      marginBottom: "8px",
    } as React.CSSProperties,
    skillBadge: {
      backgroundColor: GOLD_LIGHT,
      color: DARK,
      padding: "2px 6px",
      borderRadius: "2px",
      fontSize: "12px",
      fontWeight: 500,
    } as React.CSSProperties,
  };

  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city].filter(Boolean) as string[];

  return (
    <div style={s.page}>
      {b.name && <h1 style={s.name}>{b.name}</h1>}
      {b.label && <div style={s.label}>{b.label}</div>}
      <div style={s.contactRow}>
        {contactItems.map((item, i) => (
          <span key={i}>
            <span style={s.contactItem}>{item}</span>
            {i < contactItems.length - 1 && <span style={s.contactSep}> | </span>}
          </span>
        ))}
      </div>

      {b.summary && <p style={s.summary}>{b.summary}</p>}

      {resume.work && resume.work.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Experience Professionnelle</h2>
          {resume.work.map((w, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "12px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>{w.position}</div>
                <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}</div>
              </div>
              <div style={s.entryMeta}>{w.name}{w.location ? ` - ${w.location}` : ""}</div>
              {w.summary && <p style={s.text}>{w.summary}</p>}
              {w.highlights && w.highlights.map((h, j) => (
                <div key={j} style={s.bullet}>
                  <span style={s.bulletMark}>-</span> {h}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {resume.education && resume.education.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Formation</h2>
          {resume.education.map((e, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>{e.studyType}{e.area ? ` en ${e.area}` : ""}</div>
                <div style={s.entryDate}>{dateRange(e.startDate, e.endDate)}</div>
              </div>
              <div style={s.entryMeta}>{e.institution}{e.score ? ` - ${e.score}` : ""}</div>
            </div>
          ))}
        </>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Competences</h2>
          {resume.skills.map((sk, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: MUTED, marginBottom: "4px", letterSpacing: "1px", textTransform: "uppercase" as const }}>
                {sk.name}{sk.level ? ` - ${sk.level}` : ""}
              </div>
              {sk.keywords && sk.keywords.length > 0 && (
                <div style={s.skillRow}>
                  {sk.keywords.map((kw, j) => <span key={j} style={s.skillBadge}>{kw}</span>)}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Projets</h2>
          {resume.projects.map((p, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>{p.name}</div>
                <div style={s.entryDate}>{dateRange(p.startDate, p.endDate)}</div>
              </div>
              {p.description && <p style={s.text}>{p.description}</p>}
            </div>
          ))}
        </>
      )}

      {resume.languages && resume.languages.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Langues</h2>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" as const }}>
            {resume.languages.map((l, i) => (
              <span key={i} style={{ fontSize: "13px" }}>
                <strong>{l.language}</strong> - {l.fluency}
              </span>
            ))}
          </div>
        </>
      )}

      {resume.certificates && resume.certificates.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Certifications</h2>
          {resume.certificates.map((c, i) => (
            <div key={i} style={{ ...s.text, marginBottom: "6px" }}>
              <strong>{c.name}</strong> - {c.issuer} ({formatDate(c.date)})
            </div>
          ))}
        </>
      )}

      {resume.awards && resume.awards.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Recompenses</h2>
          {resume.awards.map((a, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
              <div style={s.entryRow}>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{a.title}</div>
                <div style={s.entryDate}>{formatDate(a.date)}</div>
              </div>
              <div style={s.entryMeta}>{a.awarder}</div>
            </div>
          ))}
        </>
      )}

      {resume.volunteer && resume.volunteer.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Benevolat</h2>
          {resume.volunteer.map((v, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>{v.position}</div>
                <div style={s.entryDate}>{dateRange(v.startDate, v.endDate)}</div>
              </div>
              <div style={s.entryMeta}>{v.organization}</div>
              {v.summary && <p style={s.text}>{v.summary}</p>}
            </div>
          ))}
        </>
      )}

      {resume.publications && resume.publications.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Publications</h2>
          {resume.publications.map((p, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
              <div style={s.entryRow}>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{p.name}</div>
                <div style={s.entryDate}>{formatDate(p.releaseDate)}</div>
              </div>
              {p.publisher && <div style={s.entryMeta}>{p.publisher}</div>}
            </div>
          ))}
        </>
      )}

      {resume.interests && resume.interests.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Centres d'interet</h2>
          <p style={s.text}>
            {resume.interests.map((item) => item.name).join("  |  ")}
          </p>
        </>
      )}
    </div>
  );
}
