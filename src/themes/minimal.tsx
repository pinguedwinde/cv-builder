import type { Resume } from "@/lib/schemas/resume";

function formatDate(date?: string): string {
  if (!date) return "Présent";
  const parts = date.split("-");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return `${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  }
  return date;
}

function dateRange(start?: string, end?: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!start && !end) return "";
  if (!end) return `depuis ${s}`;
  return `${s} - ${e}`;
}

const s = {
  page: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
    color: "#000000",
    padding: "8px 12px",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: 1.5,
    fontSize: "11px",
    backgroundColor: "#ffffff",
    textAlign: "justify" as const,
  } as React.CSSProperties,
  name: {
    fontSize: "18px",
    fontWeight: 400,
    letterSpacing: "-0.5px",
    marginBottom: "0px",
    textAlign: "left" as const,
  } as React.CSSProperties,
  label: {
    fontSize: "11px",
    color: "#666",
    marginBottom: "1px",
    textAlign: "left" as const,
  } as React.CSSProperties,
  contact: {
    fontSize: "10px",
    color: "#888",
    marginBottom: "3px",
    borderBottom: "1px solid #000",
    paddingBottom: "2px",
    textAlign: "left" as const,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "3px",
    color: "#000",
    marginBottom: "2px",
    marginTop: "4px",
    textAlign: "left" as const,
  } as React.CSSProperties,
  entryTitle: {
    fontSize: "11px",
    fontWeight: 700,
    marginBottom: "0px",
    textAlign: "left" as const,
  } as React.CSSProperties,
  entryMeta: {
    fontSize: "10px",
    color: "#888",
    marginBottom: "1px",
    textAlign: "left" as const,
  } as React.CSSProperties,
  text: {
    fontSize: "11px",
    color: "#333",
    marginBottom: "1px",
  } as React.CSSProperties,
  bullet: {
    fontSize: "11px",
    color: "#333",
    paddingLeft: "10px",
    marginBottom: "0px",
    position: "relative" as const,
  } as React.CSSProperties,
  separator: {
    border: "none",
    borderTop: "1px solid #e0e0e0",
    margin: "3px 0",
  } as React.CSSProperties,
};

export function MinimalTheme({ resume }: { resume: Resume }) {
  const b = resume.basics;
  const contactParts = [b.email, b.phone, b.url, b.location?.city].filter(Boolean);

  return (
    <div style={s.page}>
      {b.name && <h1 style={s.name}>{b.name}</h1>}
      {b.label && <div style={s.label}>{b.label}</div>}
      <div style={s.contact}>{contactParts.join("  ·  ")}</div>

      {b.summary && (
        <>
          <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 0 2px 0" }} />
          <p style={{ ...s.text, lineHeight: 1.4, fontStyle: "italic" }}>{b.summary}</p>
        </>
      )}

      {resume.work && resume.work.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Expérience</div>
          {resume.work.map((w, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "3px" }}>
              <div style={s.entryTitle}>{w.position}</div>
              <div style={s.entryMeta}>
                {w.name}{w.location ? `, ${w.location}` : ""} — {dateRange(w.startDate, w.endDate)}
              </div>
              {w.summary && <p style={s.text}>{w.summary}</p>}
              {w.highlights && w.highlights.length > 0 && w.highlights.map((h, j) => (
                <div key={j} style={s.bullet}>
                  <span style={{ position: "absolute", left: 0 }}>→</span> {h}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {resume.education && resume.education.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Formation</div>
          {resume.education.map((e, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "2px" }}>
              <div style={s.entryTitle}>{e.institution}</div>
              <div style={s.entryMeta}>
                {e.studyType} {e.area ? `— ${e.area}` : ""} — {dateRange(e.startDate, e.endDate)}
              </div>
            </div>
          ))}
        </>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Compétences</div>
          {resume.skills.map((sk, i) => (
            <div key={i} style={{ marginBottom: "3px" }}>
              <span style={{ fontWeight: 700, fontSize: "12px" }}>{sk.name}</span>
              {sk.keywords && sk.keywords.length > 0 && (
                <span style={{ fontSize: "12px", color: "#555" }}> — {sk.keywords.join(", ")}</span>
              )}
            </div>
          ))}
        </>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Projets</div>
          {resume.projects.map((p, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "2px" }}>
              <div style={s.entryTitle}>{p.name}</div>
              <div style={s.entryMeta}>{dateRange(p.startDate, p.endDate)}</div>
              {p.description && <p style={s.text}>{p.description}</p>}
            </div>
          ))}
        </>
      )}

      {resume.languages && resume.languages.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Langues</div>
          <p style={s.text}>
            {resume.languages.map((l) => `${l.language} (${l.fluency})`).join("  ·  ")}
          </p>
        </>
      )}

      {resume.certificates && resume.certificates.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Certifications</div>
          {resume.certificates.map((c, i) => (
            <div key={i} style={{ marginBottom: "2px", fontSize: "11px" }}>
              {c.name} — {c.issuer} ({formatDate(c.date)})
            </div>
          ))}
        </>
      )}

      {resume.awards && resume.awards.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Récompenses</div>
          {resume.awards.map((a, i) => (
            <div key={i} style={{ marginBottom: "2px", fontSize: "11px" }}>
              {a.title} — {a.awarder} ({formatDate(a.date)})
            </div>
          ))}
        </>
      )}

      {resume.volunteer && resume.volunteer.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Benevolat</div>
          {resume.volunteer.map((v, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "2px" }}>
              <div style={s.entryTitle}>{v.position} - {v.organization}</div>
              <div style={s.entryMeta}>{dateRange(v.startDate, v.endDate)}</div>
              {v.summary && <p style={s.text}>{v.summary}</p>}
              {v.highlights && v.highlights.length > 0 && v.highlights.map((h, j) => (
                <div key={j} style={s.bullet}>
                  <span style={{ position: "absolute", left: 0 }}>→</span> {h}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {resume.publications && resume.publications.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Publications</div>
          {resume.publications.map((p, i) => (
            <div key={i} style={{ marginBottom: "2px", fontSize: "11px" }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              {p.publisher ? ` - ${p.publisher}` : ""}
              {p.releaseDate ? ` (${formatDate(p.releaseDate)})` : ""}
            </div>
          ))}
        </>
      )}

      {resume.interests && resume.interests.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Intérêts</div>
          <p style={s.text}>
            {resume.interests.map((item) => item.name).join("  ·  ")}
          </p>
        </>
      )}

      {resume.references && resume.references.length > 0 && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>Références</div>
          {resume.references.map((r, i) => (
            <div key={i} style={{ marginBottom: "3px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700 }}>{r.name}</div>
              <p style={{ fontSize: "10px", color: "#666", fontStyle: "italic", margin: "1px 0" }}>
                &ldquo;{r.reference}&rdquo;
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
