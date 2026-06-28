import type { ThemeProps } from "./types";

function formatDate(date?: string): string {
  if (!date) return "Present";
  const parts = date.split("-");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
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

function languageDots(fluency?: string): string {
  const levels: Record<string, number> = {
    "natif": 5, "native": 5, "bilingue": 5, "courant": 4, "fluent": 4,
    "avance": 3, "advanced": 3, "intermediaire": 2, "intermediate": 2, "debutant": 1, "beginner": 1,
  };
  const key = (fluency || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const level = levels[key] ?? 3;
  return "◉".repeat(level) + "○".repeat(5 - level);
}

export function ElegantTheme({ resume, colors: colorOverrides = {} }: ThemeProps) {
  const ROSE = colorOverrides.rose ?? "#C7736A";
  const GOLD = colorOverrides.gold ?? "#B8922A";
  const BLUSH = colorOverrides.blush ?? "#FFFBF8";
  const BLUSH_BORDER = colorOverrides.blushBorder ?? "#E8D5CE";
  const TEXT = "#2C2025";
  const MUTED = "#9B7B75";

  const s = {
    page: {
      fontFamily: "'Lato', 'Helvetica Neue', Arial, sans-serif",
      color: TEXT,
      backgroundColor: BLUSH,
      padding: "28px 44px",
      maxWidth: "210mm",
      lineHeight: 1.5,
      fontSize: "13px",
      boxSizing: "border-box" as const,
    } as React.CSSProperties,
    header: {
      textAlign: "center" as const,
      marginBottom: "14px",
    } as React.CSSProperties,
    name: {
      fontFamily: "'Cormorant Garamond', 'Garamond', 'Georgia', serif",
      fontSize: "30px",
      fontWeight: 300,
      color: TEXT,
      letterSpacing: "3px",
      marginBottom: "6px",
      lineHeight: 1.1,
    } as React.CSSProperties,
    headerLabel: {
      fontFamily: "'Cormorant Garamond', 'Garamond', Georgia, serif",
      fontSize: "13px",
      fontStyle: "italic" as const,
      color: ROSE,
      marginBottom: "10px",
    } as React.CSSProperties,
    ornament: {
      color: GOLD,
      fontSize: "14px",
      letterSpacing: "2px",
      marginBottom: "14px",
    } as React.CSSProperties,
    contactRow: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap" as const,
      gap: "16px",
      fontSize: "12px",
      color: MUTED,
    } as React.CSSProperties,
    sectionTitle: {
      fontFamily: "'Cormorant Garamond', 'Garamond', Georgia, serif",
      fontVariant: "small-caps" as const,
      fontSize: "13px",
      fontWeight: 600,
      color: ROSE,
      letterSpacing: "3px",
      textTransform: "uppercase" as const,
      borderBottom: `1px solid ${BLUSH_BORDER}`,
      paddingBottom: "6px",
      marginBottom: "10px",
      marginTop: "12px",
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
      color: TEXT,
      display: "flex",
      alignItems: "center",
      gap: "6px",
    } as React.CSSProperties,
    entryTitleBullet: {
      color: ROSE,
      fontSize: "10px",
    } as React.CSSProperties,
    entryDate: {
      fontSize: "11px",
      color: MUTED,
      fontStyle: "italic" as const,
      flexShrink: 0,
      marginLeft: "12px",
    } as React.CSSProperties,
    entryMeta: {
      fontSize: "12px",
      color: MUTED,
      fontStyle: "italic" as const,
      marginBottom: "8px",
    } as React.CSSProperties,
    summary: {
      fontSize: "14px",
      color: "#5C4040",
      fontStyle: "italic" as const,
      lineHeight: 1.5,
      marginBottom: "4px",
    } as React.CSSProperties,
    text: {
      fontSize: "13px",
      color: TEXT,
      marginBottom: "4px",
    } as React.CSSProperties,
    bullet: {
      fontSize: "13px",
      color: TEXT,
      paddingLeft: "14px",
      marginBottom: "3px",
      position: "relative" as const,
    } as React.CSSProperties,
    bulletMark: {
      position: "absolute" as const,
      left: 0,
      color: ROSE,
    } as React.CSSProperties,
    skillSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "4px",
    } as React.CSSProperties,
    skillGroup: {
      borderBottom: `1px solid ${BLUSH_BORDER}`,
      paddingBottom: "10px",
    } as React.CSSProperties,
    skillName: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontVariant: "small-caps" as const,
      fontSize: "13px",
      fontWeight: 600,
      color: ROSE,
      letterSpacing: "1px",
    } as React.CSSProperties,
    skillKw: {
      fontSize: "11px",
      color: MUTED,
      fontStyle: "italic" as const,
      marginTop: "2px",
    } as React.CSSProperties,
    langItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${BLUSH_BORDER}`,
      paddingBottom: "6px",
      marginBottom: "6px",
      fontSize: "13px",
    } as React.CSSProperties,
    langDots: {
      color: ROSE,
      letterSpacing: "3px",
      fontSize: "14px",
    } as React.CSSProperties,
  };

  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city].filter(Boolean) as string[];

  return (
    <div style={s.page}>
      <div style={s.header}>
        {b.image && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img
              src={b.image}
              alt={b.name || "photo"}
              style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${BLUSH_BORDER}` }}
            />
          </div>
        )}
        {b.name && <h1 style={s.name}>{b.name}</h1>}
        {b.label && <div style={s.headerLabel}>{b.label}</div>}
        <div style={s.ornament}>{"─────── ◆ ───────"}</div>
        <div style={s.contactRow}>
          {contactItems.map((item, i) => <span key={i}>{item}</span>)}
        </div>
      </div>

      {b.summary && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Profil</h2>
          <p style={s.summary}>{b.summary}</p>
        </>
      )}

      {resume.work && resume.work.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Experience Professionnelle</h2>
          {resume.work.map((w, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "12px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>
                  <span style={s.entryTitleBullet}>{"◆"}</span>
                  {w.position}
                </div>
                <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}</div>
              </div>
              <div style={s.entryMeta}>{w.name}{w.location ? ` - ${w.location}` : ""}</div>
              {w.summary && <p style={s.text}>{w.summary}</p>}
              {w.highlights && w.highlights.map((h, j) => (
                <div key={j} style={s.bullet}>
                  <span style={s.bulletMark}>{"·"}</span> {h}
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
                <div style={s.entryTitle}>
                  <span style={s.entryTitleBullet}>{"◆"}</span>
                  {e.studyType}{e.area ? ` en ${e.area}` : ""}
                </div>
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
          <div style={s.skillSection}>
            {resume.skills.map((sk, i) => (
              <div key={i} style={s.skillGroup}>
                <div style={s.skillName}>{sk.name}{sk.level ? ` - ${sk.level}` : ""}</div>
                {sk.keywords && sk.keywords.length > 0 && (
                  <div style={s.skillKw}>{sk.keywords.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Projets</h2>
          {resume.projects.map((p, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>
                  <span style={s.entryTitleBullet}>{"◆"}</span>
                  {p.name}
                </div>
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
          {resume.languages.map((l, i) => (
            <div key={i} style={s.langItem}>
              <span style={{ fontWeight: 600 }}>{l.language}</span>
              <span>
                <span style={{ color: MUTED, fontSize: "11px", marginRight: "8px", fontStyle: "italic" }}>{l.fluency}</span>
                <span style={s.langDots}>{languageDots(l.fluency)}</span>
              </span>
            </div>
          ))}
        </>
      )}

      {resume.certificates && resume.certificates.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Certifications</h2>
          {resume.certificates.map((c, i) => (
            <div key={i} style={{ ...s.text, marginBottom: "6px" }}>
              <span style={s.entryTitleBullet}>{"◆"} </span>
              <strong>{c.name}</strong> - {c.issuer} ({formatDate(c.date)})
            </div>
          ))}
        </>
      )}

      {resume.awards && resume.awards.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Distinctions</h2>
          {resume.awards.map((a, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>
                  <span style={s.entryTitleBullet}>{"◆"}</span>
                  {a.title}
                </div>
                <div style={s.entryDate}>{formatDate(a.date)}</div>
              </div>
              <div style={s.entryMeta}>{a.awarder}</div>
              {a.summary && <p style={s.text}>{a.summary}</p>}
            </div>
          ))}
        </>
      )}

      {resume.volunteer && resume.volunteer.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Engagement</h2>
          {resume.volunteer.map((v, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={s.entryRow}>
                <div style={s.entryTitle}>
                  <span style={s.entryTitleBullet}>{"◆"}</span>
                  {v.position}
                </div>
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
            <div key={i} style={{ ...s.text, marginBottom: "6px" }}>
              <span style={s.entryTitleBullet}>{"◆"} </span>
              <em>{p.name}</em>
              {p.publisher ? ` - ${p.publisher}` : ""}
              {p.releaseDate ? ` (${formatDate(p.releaseDate)})` : ""}
            </div>
          ))}
        </>
      )}

      {resume.interests && resume.interests.length > 0 && (
        <>
          <h2 className="cv-section-title" style={s.sectionTitle}>Centres d&apos;interet</h2>
          <p style={{ ...s.text, color: MUTED, fontStyle: "italic" as const }}>
            {resume.interests.map((item) => item.name).join("  ·  ")}
          </p>
        </>
      )}
    </div>
  );
}
