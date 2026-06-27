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

const BLACK = "#0A0A0A";
const YELLOW = "#FFEB3B";
const MUTED = "#555555";
const WHITE = "#FFFFFF";

const s = {
  page: {
    fontFamily: "'DM Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
    color: BLACK,
    backgroundColor: WHITE,
    maxWidth: "210mm",
    lineHeight: 1.4,
    fontSize: "13px",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  header: {
    padding: "20px 28px 0",
    backgroundColor: WHITE,
  } as React.CSSProperties,
  name: {
    fontFamily: "'Bebas Neue', 'Anton', 'Impact', 'Arial Black', sans-serif",
    fontSize: "64px",
    fontWeight: 900,
    color: BLACK,
    textTransform: "uppercase" as const,
    letterSpacing: "4px",
    lineHeight: 0.9,
    marginBottom: "10px",
    wordBreak: "break-word" as const,
  } as React.CSSProperties,
  labelBand: {
    backgroundColor: BLACK,
    color: YELLOW,
    padding: "6px 28px",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    marginBottom: "0",
  } as React.CSSProperties,
  yellowRule: {
    height: "4px",
    backgroundColor: YELLOW,
    width: "100%",
  } as React.CSSProperties,
  contactRow: {
    padding: "10px 28px",
    fontSize: "12px",
    color: MUTED,
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0",
    borderBottom: `1px solid #EEEEEE`,
    marginBottom: "0",
  } as React.CSSProperties,
  contactItem: {
    marginRight: "16px",
  } as React.CSSProperties,
  body: {
    padding: "0 28px 20px",
  } as React.CSSProperties,
  sectionBand: {
    backgroundColor: BLACK,
    color: YELLOW,
    fontFamily: "'Bebas Neue', 'Anton', Impact, 'Arial Black', sans-serif",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    padding: "5px 0 5px 0",
    marginBottom: "14px",
    marginTop: "16px",
    paddingLeft: "12px",
  } as React.CSSProperties,
  entryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2px",
  } as React.CSSProperties,
  entryCompany: {
    fontSize: "15px",
    fontWeight: 900,
    color: BLACK,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  entryPosition: {
    fontSize: "13px",
    color: YELLOW,
    fontWeight: 700,
    backgroundColor: BLACK,
    padding: "1px 8px",
    display: "inline-block",
    marginBottom: "6px",
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  entryDate: {
    fontSize: "11px",
    fontWeight: 700,
    color: BLACK,
    backgroundColor: YELLOW,
    padding: "2px 8px",
    borderRadius: "2px",
    whiteSpace: "nowrap" as const,
    marginLeft: "12px",
    flexShrink: 0,
  } as React.CSSProperties,
  entryMeta: {
    fontSize: "12px",
    color: MUTED,
    marginBottom: "8px",
  } as React.CSSProperties,
  text: {
    fontSize: "13px",
    color: "#333333",
    marginBottom: "4px",
  } as React.CSSProperties,
  bullet: {
    fontSize: "13px",
    color: "#333333",
    paddingLeft: "14px",
    marginBottom: "4px",
    borderLeft: `4px solid ${YELLOW}`,
    paddingTop: "1px",
    paddingBottom: "1px",
  } as React.CSSProperties,
  skillGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "4px",
  } as React.CSSProperties,
  skillItem: {
    borderBottom: `2px solid ${YELLOW}`,
    paddingBottom: "6px",
  } as React.CSSProperties,
  skillName: {
    fontSize: "13px",
    fontWeight: 900,
    color: BLACK,
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  skillKw: {
    fontSize: "11px",
    color: MUTED,
    marginTop: "2px",
  } as React.CSSProperties,
  summary: {
    fontSize: "14px",
    color: "#333333",
    lineHeight: 1.7,
    borderLeft: `6px solid ${YELLOW}`,
    paddingLeft: "14px",
    marginTop: "16px",
    marginBottom: "4px",
  } as React.CSSProperties,
};

export function BoldTheme({ resume }: { resume: Resume }) {
  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city].filter(Boolean) as string[];

  return (
    <div style={s.page}>
      <div style={s.header}>
        {b.name && <h1 style={s.name}>{b.name}</h1>}
      </div>
      {b.label && <div style={s.labelBand}>{b.label}</div>}
      <div style={s.yellowRule} />
      <div style={s.contactRow}>
        {contactItems.map((item, i) => (
          <span key={i} style={s.contactItem}>{item}{i < contactItems.length - 1 ? " |" : ""}</span>
        ))}
      </div>

      <div style={s.body}>
        {b.summary && <p style={s.summary}>{b.summary}</p>}

        {resume.work && resume.work.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Experience</div>
            {resume.work.map((w, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "20px" }}>
                <div style={s.entryRow}>
                  <div style={s.entryCompany}>{w.name}</div>
                  <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}</div>
                </div>
                <div style={s.entryPosition}>{w.position}</div>
                {w.location && <div style={s.entryMeta}>{w.location}</div>}
                {w.summary && <p style={s.text}>{w.summary}</p>}
                {w.highlights && w.highlights.map((h, j) => (
                  <div key={j} style={s.bullet}>{h}</div>
                ))}
              </div>
            ))}
          </>
        )}

        {resume.education && resume.education.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Formation</div>
            {resume.education.map((e, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
                <div style={s.entryRow}>
                  <div style={s.entryCompany}>{e.institution}</div>
                  <div style={s.entryDate}>{dateRange(e.startDate, e.endDate)}</div>
                </div>
                <div style={s.entryPosition}>{e.studyType}{e.area ? ` - ${e.area}` : ""}</div>
                {e.score && <div style={s.entryMeta}>{e.score}</div>}
              </div>
            ))}
          </>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Competences</div>
            <div style={s.skillGrid}>
              {resume.skills.map((sk, i) => (
                <div key={i} style={s.skillItem}>
                  <div style={s.skillName}>{sk.name}</div>
                  {sk.level && <div style={{ ...s.skillKw, fontWeight: 700 }}>{sk.level}</div>}
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
            <div className="cv-section-title" style={s.sectionBand}>Projets</div>
            {resume.projects.map((p, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "16px" }}>
                <div style={s.entryRow}>
                  <div style={s.entryCompany}>{p.name}</div>
                  <div style={s.entryDate}>{dateRange(p.startDate, p.endDate)}</div>
                </div>
                {p.description && <p style={s.text}>{p.description}</p>}
                {p.keywords && p.keywords.length > 0 && (
                  <div style={{ fontSize: "11px", color: MUTED, marginTop: "4px" }}>{p.keywords.join(" | ")}</div>
                )}
              </div>
            ))}
          </>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Langues</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" as const }}>
              {resume.languages.map((l, i) => (
                <div key={i} style={{ backgroundColor: "#F5F5F5", padding: "8px 16px", borderBottom: `3px solid ${YELLOW}` }}>
                  <div style={{ fontWeight: 900, fontSize: "13px", textTransform: "uppercase" as const }}>{l.language}</div>
                  <div style={{ fontSize: "11px", color: MUTED }}>{l.fluency}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {resume.certificates && resume.certificates.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Certifications</div>
            {resume.certificates.map((c, i) => (
              <div key={i} style={{ ...s.text, marginBottom: "6px" }}>
                <strong style={{ textTransform: "uppercase" as const }}>{c.name}</strong> - {c.issuer}
                <span style={{ ...s.entryDate, display: "inline", padding: "1px 6px", marginLeft: "8px" }}>{formatDate(c.date)}</span>
              </div>
            ))}
          </>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Distinctions</div>
            {resume.awards.map((a, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
                <div style={s.entryRow}>
                  <div style={s.entryCompany}>{a.title}</div>
                  <div style={s.entryDate}>{formatDate(a.date)}</div>
                </div>
                <div style={s.entryMeta}>{a.awarder}</div>
              </div>
            ))}
          </>
        )}

        {resume.volunteer && resume.volunteer.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Engagement</div>
            {resume.volunteer.map((v, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
                <div style={s.entryRow}>
                  <div style={s.entryCompany}>{v.organization}</div>
                  <div style={s.entryDate}>{dateRange(v.startDate, v.endDate)}</div>
                </div>
                <div style={s.entryPosition}>{v.position}</div>
                {v.summary && <p style={s.text}>{v.summary}</p>}
              </div>
            ))}
          </>
        )}

        {resume.publications && resume.publications.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Publications</div>
            {resume.publications.map((p, i) => (
              <div key={i} style={{ ...s.text, marginBottom: "6px" }}>
                <strong style={{ textTransform: "uppercase" as const }}>{p.name}</strong>
                {p.publisher ? ` - ${p.publisher}` : ""}
                {p.releaseDate ? ` (${formatDate(p.releaseDate)})` : ""}
              </div>
            ))}
          </>
        )}

        {resume.interests && resume.interests.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Interets</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px" }}>
              {resume.interests.map((item, i) => (
                <span key={i} style={{ backgroundColor: YELLOW, color: BLACK, padding: "4px 12px", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" as const, borderRadius: "2px" }}>
                  {item.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
