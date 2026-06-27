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
  if (!end) return `${s} - Présent`;
  return `${s} - ${e}`;
}

const styles = {
  page: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#1a1a2e",
    padding: "24px 32px",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: 1.45,
    fontSize: "13px",
  } as React.CSSProperties,
  header: {
    textAlign: "center" as const,
    borderBottom: "3px solid #1a1a2e",
    paddingBottom: "24px",
    marginBottom: "14px",
  } as React.CSSProperties,
  name: {
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
    color: "#1a1a2e",
  } as React.CSSProperties,
  label: {
    fontSize: "16px",
    color: "#4a4a6a",
    fontStyle: "italic" as const,
    marginBottom: "12px",
  } as React.CSSProperties,
  contact: {
    fontSize: "12px",
    color: "#555",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: "16px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    color: "#1a1a2e",
    borderBottom: "1px solid #ccc",
    paddingBottom: "6px",
    marginBottom: "16px",
    marginTop: "14px",
  } as React.CSSProperties,
  entryTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: "2px",
  } as React.CSSProperties,
  entryMeta: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic" as const,
    marginBottom: "6px",
  } as React.CSSProperties,
  entrySummary: {
    fontSize: "13px",
    color: "#333",
    marginBottom: "6px",
  } as React.CSSProperties,
  highlight: {
    fontSize: "13px",
    color: "#333",
    marginLeft: "16px",
    marginBottom: "3px",
    listStyleType: "disc" as const,
  } as React.CSSProperties,
  summary: {
    fontSize: "14px",
    color: "#333",
    fontStyle: "italic" as const,
    lineHeight: 1.5,
  } as React.CSSProperties,
  skillGroup: {
    marginBottom: "8px",
  } as React.CSSProperties,
  skillName: {
    fontWeight: 700,
    fontSize: "13px",
  } as React.CSSProperties,
  skillKeywords: {
    fontSize: "13px",
    color: "#555",
  } as React.CSSProperties,
};

export function ClassicTheme({ resume }: { resume: Resume }) {
  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city && `${b.location.city}, ${b.location.countryCode}`].filter(Boolean);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        {b.image && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img
              src={b.image}
              alt={b.name || "photo"}
              style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #1a1a2e" }}
            />
          </div>
        )}
        {b.name && <h1 style={styles.name}>{b.name}</h1>}
        {b.label && <p style={styles.label}>{b.label}</p>}
        <div style={styles.contact}>
          {contactItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
        {b.profiles && b.profiles.length > 0 && (
          <div style={{ ...styles.contact, marginTop: "6px" }}>
            {b.profiles.filter((p) => p.network).map((p, i) => (
              <span key={i}>{p.network}: {p.username}</span>
            ))}
          </div>
        )}
      </header>

      {b.summary && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Profil</h2>
          <p style={styles.summary}>{b.summary}</p>
        </>
      )}

      {resume.work && resume.work.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Expérience Professionnelle</h2>
          {resume.work.map((w, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "18px" }}>
              <div style={styles.entryTitle}>{w.position} — {w.name}</div>
              <div style={styles.entryMeta}>
                {dateRange(w.startDate, w.endDate)}{w.location ? ` | ${w.location}` : ""}
              </div>
              {w.summary && <p style={styles.entrySummary}>{w.summary}</p>}
              {w.highlights && w.highlights.length > 0 && (
                <ul style={{ margin: "4px 0", padding: 0 }}>
                  {w.highlights.map((h, j) => (
                    <li key={j} style={styles.highlight}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {resume.education && resume.education.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Formation</h2>
          {resume.education.map((e, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={styles.entryTitle}>
                {e.studyType} {e.area ? `en ${e.area}` : ""} — {e.institution}
              </div>
              <div style={styles.entryMeta}>
                {dateRange(e.startDate, e.endDate)}{e.score ? ` | ${e.score}` : ""}
              </div>
              {e.courses && e.courses.length > 0 && (
                <p style={styles.entrySummary}>Cours: {e.courses.join(", ")}</p>
              )}
            </div>
          ))}
        </>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Compétences</h2>
          {resume.skills.map((s, i) => (
            <div key={i} style={styles.skillGroup}>
              <span style={styles.skillName}>{s.name}</span>
              {s.level && <span style={{ fontSize: "12px", color: "#888" }}> ({s.level})</span>}
              {s.keywords && s.keywords.length > 0 && (
                <span style={styles.skillKeywords}>: {s.keywords.join(", ")}</span>
              )}
            </div>
          ))}
        </>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Projets</h2>
          {resume.projects.map((p, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={styles.entryTitle}>{p.name}</div>
              <div style={styles.entryMeta}>{dateRange(p.startDate, p.endDate)}</div>
              {p.description && <p style={styles.entrySummary}>{p.description}</p>}
              {p.highlights && p.highlights.length > 0 && (
                <ul style={{ margin: "4px 0", padding: 0 }}>
                  {p.highlights.map((h, j) => (
                    <li key={j} style={styles.highlight}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {resume.languages && resume.languages.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Langues</h2>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {resume.languages.map((l, i) => (
              <span key={i} style={{ fontSize: "13px" }}>
                <strong>{l.language}</strong>: {l.fluency}
              </span>
            ))}
          </div>
        </>
      )}

      {resume.certificates && resume.certificates.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Certifications</h2>
          {resume.certificates.map((c, i) => (
            <div key={i} className="cv-entry" style={{ fontSize: "13px", marginBottom: "4px" }}>
              <strong>{c.name}</strong> — {c.issuer} ({formatDate(c.date)})
            </div>
          ))}
        </>
      )}

      {resume.awards && resume.awards.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Récompenses</h2>
          {resume.awards.map((a, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "13px" }}>
                <strong>{a.title}</strong> — {a.awarder} ({formatDate(a.date)})
              </div>
              {a.summary && <p style={{ fontSize: "12px", color: "#555", margin: "2px 0" }}>{a.summary}</p>}
            </div>
          ))}
        </>
      )}

      {resume.volunteer && resume.volunteer.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Bénévolat</h2>
          {resume.volunteer.map((v, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
              <div style={styles.entryTitle}>{v.position} — {v.organization}</div>
              <div style={styles.entryMeta}>{dateRange(v.startDate, v.endDate)}</div>
              {v.summary && <p style={styles.entrySummary}>{v.summary}</p>}
            </div>
          ))}
        </>
      )}

      {resume.interests && resume.interests.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Centres d&apos;intérêt</h2>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {resume.interests.map((item, i) => (
              <span key={i} style={{ fontSize: "13px" }}>
                <strong>{item.name}</strong>
                {item.keywords && item.keywords.length > 0 && `: ${item.keywords.join(", ")}`}
              </span>
            ))}
          </div>
        </>
      )}

      {resume.publications && resume.publications.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>Publications</h2>
          {resume.publications.map((p, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "13px" }}>
                <strong>{p.name}</strong>
                {p.publisher ? ` - ${p.publisher}` : ""}
                {p.releaseDate ? ` (${formatDate(p.releaseDate)})` : ""}
              </div>
              {p.summary && <p style={{ fontSize: "12px", color: "#555", margin: "2px 0" }}>{p.summary}</p>}
            </div>
          ))}
        </>
      )}

      {resume.references && resume.references.length > 0 && (
        <>
          <h2 className="cv-section-title" style={styles.sectionTitle}>References</h2>
          {resume.references.map((r, i) => (
            <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{r.name}</div>
              <p style={{ fontSize: "12px", color: "#555", fontStyle: "italic", margin: "2px 0" }}>
                &ldquo;{r.reference}&rdquo;
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
