import type { Resume } from "@/lib/schemas/resume";

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

const ACCENT = "#6C63FF";
const ACCENT_LIGHT = "#EDE9FF";
const TEAL = "#0F9688";
const PURPLE = "#C026D3";
const TEXT = "#1E1B3C";
const MUTED = "#64748B";
const BORDER = "#E2E0FF";
const CARD_BG = "#F8F9FF";

const s = {
  page: {
    fontFamily: "'Outfit', 'Inter', 'Segoe UI', system-ui, sans-serif",
    color: TEXT,
    backgroundColor: "#FFFFFF",
    maxWidth: "210mm",
    lineHeight: 1.6,
    fontSize: "13px",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  header: {
    background: `linear-gradient(120deg, ${TEAL}, ${ACCENT}, ${PURPLE})`,
    padding: "28px 36px 20px",
    color: "#fff",
  } as React.CSSProperties,
  name: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "4px",
    lineHeight: 1.1,
  } as React.CSSProperties,
  headerLabel: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.85)",
    marginBottom: "16px",
  } as React.CSSProperties,
  contactPills: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
  } as React.CSSProperties,
  pill: {
    background: "rgba(255,255,255,0.2)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    color: "#fff",
  } as React.CSSProperties,
  body: {
    padding: "24px 36px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: ACCENT,
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    borderBottom: `2px solid ${ACCENT}`,
    paddingBottom: "6px",
    marginBottom: "12px",
    marginTop: "20px",
  } as React.CSSProperties,
  card: {
    backgroundColor: CARD_BG,
    borderRadius: "10px",
    borderTop: `3px solid ${ACCENT}`,
    padding: "16px",
    marginBottom: "12px",
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
  } as React.CSSProperties,
  entryDate: {
    fontSize: "11px",
    color: MUTED,
    backgroundColor: ACCENT_LIGHT,
    padding: "2px 8px",
    borderRadius: "12px",
    whiteSpace: "nowrap" as const,
    marginLeft: "8px",
    flexShrink: 0,
  } as React.CSSProperties,
  entryMeta: {
    fontSize: "12px",
    color: ACCENT,
    fontWeight: 600,
    marginBottom: "8px",
  } as React.CSSProperties,
  text: {
    fontSize: "13px",
    color: "#4A4A6A",
    marginBottom: "4px",
  } as React.CSSProperties,
  bullet: {
    fontSize: "13px",
    color: "#4A4A6A",
    paddingLeft: "16px",
    marginBottom: "3px",
    position: "relative" as const,
  } as React.CSSProperties,
  tag: {
    display: "inline-block",
    backgroundColor: ACCENT_LIGHT,
    color: ACCENT,
    padding: "3px 10px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: 500,
    marginRight: "6px",
    marginBottom: "6px",
  } as React.CSSProperties,
  summary: {
    fontSize: "13px",
    color: "#4A4A6A",
    lineHeight: 1.8,
    backgroundColor: CARD_BG,
    borderLeft: `4px solid ${ACCENT}`,
    padding: "12px 16px",
    borderRadius: "0 8px 8px 0",
    marginBottom: "4px",
  } as React.CSSProperties,
};

export function AuroraTheme({ resume }: { resume: Resume }) {
  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city].filter(Boolean) as string[];

  return (
    <div style={s.page}>
      <div style={s.header}>
        {b.name && <h1 style={s.name}>{b.name}</h1>}
        {b.label && <div style={s.headerLabel}>{b.label}</div>}
        <div style={s.contactPills}>
          {contactItems.map((item, i) => <span key={i} style={s.pill}>{item}</span>)}
        </div>
      </div>

      <div style={s.body}>
        {b.summary && <p style={s.summary}>{b.summary}</p>}

        {resume.work && resume.work.length > 0 && (
          <>
            <h2 className="cv-section-title" style={s.sectionTitle}>Experience</h2>
            {resume.work.map((w, i) => (
              <div key={i} className="cv-entry" style={s.card}>
                <div style={s.entryRow}>
                  <div style={s.entryTitle}>{w.position}</div>
                  <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}</div>
                </div>
                <div style={s.entryMeta}>{w.name}{w.location ? ` - ${w.location}` : ""}</div>
                {w.summary && <p style={s.text}>{w.summary}</p>}
                {w.highlights && w.highlights.map((h, j) => (
                  <div key={j} style={s.bullet}>
                    <span style={{ position: "absolute", left: 0, color: ACCENT }}>›</span> {h}
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
              <div key={i} className="cv-entry" style={s.card}>
                <div style={s.entryRow}>
                  <div style={s.entryTitle}>{e.studyType}{e.area ? ` en ${e.area}` : ""}</div>
                  <div style={s.entryDate}>{dateRange(e.startDate, e.endDate)}</div>
                </div>
                <div style={s.entryMeta}>{e.institution}</div>
                {e.score && <div style={s.text}>Mention : {e.score}</div>}
              </div>
            ))}
          </>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <>
            <h2 className="cv-section-title" style={s.sectionTitle}>Competences</h2>
            <div style={{ marginBottom: "8px" }}>
              {resume.skills.map((sk, i) => (
                <div key={i} className="cv-entry" style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: MUTED, marginBottom: "6px" }}>
                    {sk.name}{sk.level ? ` - ${sk.level}` : ""}
                  </div>
                  <div>
                    {sk.keywords && sk.keywords.map((kw, j) => (
                      <span key={j} style={s.tag}>{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <>
            <h2 className="cv-section-title" style={s.sectionTitle}>Projets</h2>
            {resume.projects.map((p, i) => (
              <div key={i} className="cv-entry" style={s.card}>
                <div style={s.entryRow}>
                  <div style={s.entryTitle}>{p.name}</div>
                  <div style={s.entryDate}>{dateRange(p.startDate, p.endDate)}</div>
                </div>
                {p.description && <p style={s.text}>{p.description}</p>}
                {p.keywords && p.keywords.length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    {p.keywords.map((kw, j) => <span key={j} style={s.tag}>{kw}</span>)}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <>
            <h2 className="cv-section-title" style={s.sectionTitle}>Langues</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const }}>
              {resume.languages.map((l, i) => (
                <div key={i} style={{ ...s.card, marginBottom: 0, padding: "10px 16px", flex: "0 0 auto" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{l.language}</div>
                  <div style={{ fontSize: "11px", color: ACCENT }}>{l.fluency}</div>
                </div>
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
              <div key={i} className="cv-entry" style={s.card}>
                <div style={s.entryRow}>
                  <div style={s.entryTitle}>{a.title}</div>
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
            <h2 className="cv-section-title" style={s.sectionTitle}>Benevolat</h2>
            {resume.volunteer.map((v, i) => (
              <div key={i} className="cv-entry" style={s.card}>
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
              <div key={i} style={{ ...s.text, marginBottom: "8px" }}>
                <strong>{p.name}</strong>
                {p.publisher ? ` - ${p.publisher}` : ""}
                {p.releaseDate ? ` (${formatDate(p.releaseDate)})` : ""}
              </div>
            ))}
          </>
        )}

        {resume.interests && resume.interests.length > 0 && (
          <>
            <h2 className="cv-section-title" style={s.sectionTitle}>Centres d'interet</h2>
            <div>
              {resume.interests.map((item, i) => (
                <span key={i} style={s.tag}>{item.name}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
