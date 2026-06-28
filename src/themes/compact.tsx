import { usePdfMode } from "@/lib/pdf-context";
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
  if (!end) return `${s}-Présent`;
  return `${s}-${e}`;
}

const colors = {
  primary: "#7c2d12",
  primaryLight: "#fef2f2",
  dark: "#1f2937",
  text: "#374151",
  muted: "#6b7280",
  light: "#f9fafb",
  border: "#d1d5db",
  white: "#ffffff",
};

const s = {
  page: {
    fontFamily: "'Source Sans 3', 'Source Sans Pro', 'Segoe UI', sans-serif",
    color: colors.text,
    fontSize: "11px",
    lineHeight: 1.4,
    padding: "20px 22px",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: "12px",
    marginBottom: "16px",
  } as React.CSSProperties,
  headerLeft: {
    flex: 1,
  } as React.CSSProperties,
  headerRight: {
    textAlign: "right" as const,
    fontSize: "10px",
    color: colors.muted,
    lineHeight: 1.6,
  } as React.CSSProperties,
  name: {
    fontSize: "24px",
    fontWeight: 800,
    color: colors.dark,
    letterSpacing: "-0.3px",
    lineHeight: 1.1,
  } as React.CSSProperties,
  label: {
    fontSize: "12px",
    color: colors.primary,
    fontWeight: 600,
    marginTop: "2px",
  } as React.CSSProperties,
  columns: {
    display: "flex",
    gap: "16px",
  } as React.CSSProperties,
  leftCol: {
    flex: "0 0 55%",
  } as React.CSSProperties,
  rightCol: {
    flex: 1,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: colors.primary,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: "3px",
    marginBottom: "8px",
    marginTop: "14px",
  } as React.CSSProperties,
  entryTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: colors.dark,
    lineHeight: 1.3,
  } as React.CSSProperties,
  entryMeta: {
    fontSize: "10px",
    color: colors.muted,
    marginBottom: "3px",
  } as React.CSSProperties,
  entryText: {
    fontSize: "11px",
    color: colors.text,
    marginBottom: "2px",
  } as React.CSSProperties,
  bullet: {
    fontSize: "11px",
    color: colors.text,
    marginLeft: "10px",
    marginBottom: "1px",
    listStyleType: "disc" as const,
  } as React.CSSProperties,
  skillRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    marginBottom: "3px",
    paddingBottom: "2px",
    borderBottom: `1px dotted ${colors.border}`,
  } as React.CSSProperties,
  skillName: {
    fontWeight: 600,
    color: colors.dark,
  } as React.CSSProperties,
  skillKw: {
    fontSize: "10px",
    color: colors.muted,
    textAlign: "right" as const,
    maxWidth: "60%",
  } as React.CSSProperties,
  langItem: {
    fontSize: "11px",
    marginBottom: "2px",
  } as React.CSSProperties,
  certItem: {
    fontSize: "10px",
    marginBottom: "3px",
    lineHeight: 1.4,
  } as React.CSSProperties,
};

export function CompactTheme({ resume }: { resume: Resume }) {
  const pdfMode = usePdfMode();
  const b = resume.basics;

  const header = (
    <header style={s.header}>
      <div style={s.headerLeft}>
        {b.name && <h1 style={s.name}>{b.name}</h1>}
        {b.label && <div style={s.label}>{b.label}</div>}
      </div>
      <div style={s.headerRight}>
        {b.email && <div>{b.email}</div>}
        {b.phone && <div>{b.phone}</div>}
        {b.url && <div>{b.url}</div>}
        {b.location?.city && <div>{b.location.city}, {b.location.countryCode}</div>}
        {b.profiles && b.profiles.filter((p) => p.network).map((p, i) => (
          <div key={i}>{p.network}: {p.username}</div>
        ))}
      </div>
    </header>
  );

  // PDF mode: column-count on the page root so PagedJS never breaks before the columns;
  // header and summary use column-span:all to stay full-width above both columns.
  if (pdfMode) {
    return (
      <div style={{ ...s.page, columnCount: 2, columnGap: "16px" } as React.CSSProperties}>
        <header style={{ ...s.header, columnSpan: "all" } as React.CSSProperties}>
          <div style={s.headerLeft}>
            {b.name && <h1 style={s.name}>{b.name}</h1>}
            {b.label && <div style={s.label}>{b.label}</div>}
          </div>
          <div style={s.headerRight}>
            {b.email && <div>{b.email}</div>}
            {b.phone && <div>{b.phone}</div>}
            {b.url && <div>{b.url}</div>}
            {b.location?.city && <div>{b.location.city}, {b.location.countryCode}</div>}
            {b.profiles && b.profiles.filter((p) => p.network).map((p, i) => (
              <div key={i}>{p.network}: {p.username}</div>
            ))}
          </div>
        </header>

        {b.summary && (
          <p style={{ fontSize: "11px", color: colors.text, marginBottom: "12px", lineHeight: 1.5, columnSpan: "all" } as React.CSSProperties}>
            {b.summary}
          </p>
        )}

        {resume.work && resume.work.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Expérience Professionnelle</div>
            {resume.work.map((w, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
                <div style={s.entryTitle}>{w.position} — {w.name}</div>
                <div style={s.entryMeta}>
                  {dateRange(w.startDate, w.endDate)}{w.location ? ` | ${w.location}` : ""}
                </div>
                {w.summary && <p style={s.entryText}>{w.summary}</p>}
                {w.highlights && w.highlights.length > 0 && (
                  <ul style={{ margin: "2px 0", padding: 0 }}>
                    {w.highlights.map((h, j) => (
                      <li key={j} style={s.bullet}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Projets</div>
            {resume.projects.map((p, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                <div style={s.entryTitle}>{p.name}</div>
                <div style={s.entryMeta}>{dateRange(p.startDate, p.endDate)}</div>
                {p.description && <p style={s.entryText}>{p.description}</p>}
                {p.keywords && p.keywords.length > 0 && (
                  <p style={{ fontSize: "10px", color: colors.muted }}>{p.keywords.join(", ")}</p>
                )}
              </div>
            ))}
          </>
        )}

        {resume.volunteer && resume.volunteer.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Bénévolat</div>
            {resume.volunteer.map((v, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                <div style={s.entryTitle}>{v.position} — {v.organization}</div>
                <div style={s.entryMeta}>{dateRange(v.startDate, v.endDate)}</div>
                {v.summary && <p style={s.entryText}>{v.summary}</p>}
              </div>
            ))}
          </>
        )}

        {resume.references && resume.references.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Références</div>
            {resume.references.map((r, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600 }}>{r.name}</div>
                <p style={{ fontSize: "10px", color: colors.muted, fontStyle: "italic", margin: 0 }}>
                  &ldquo;{r.reference}&rdquo;
                </p>
              </div>
            ))}
          </>
        )}

        {resume.education && resume.education.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Formation</div>
            {resume.education.map((e, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                <div style={s.entryTitle}>{e.institution}</div>
                <div style={s.entryMeta}>
                  {e.studyType} {e.area ? `- ${e.area}` : ""} | {dateRange(e.startDate, e.endDate)}
                </div>
                {e.score && <div style={{ fontSize: "10px", color: colors.muted }}>{e.score}</div>}
              </div>
            ))}
          </>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Compétences</div>
            {resume.skills.map((sk, i) => (
              <div key={i} style={s.skillRow}>
                <span style={s.skillName}>{sk.name}</span>
                <span style={s.skillKw}>
                  {sk.keywords && sk.keywords.length > 0 ? sk.keywords.join(", ") : sk.level}
                </span>
              </div>
            ))}
          </>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Langues</div>
            {resume.languages.map((l, i) => (
              <div key={i} style={s.langItem}>
                <strong>{l.language}</strong> — {l.fluency}
              </div>
            ))}
          </>
        )}

        {resume.certificates && resume.certificates.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Certifications</div>
            {resume.certificates.map((c, i) => (
              <div key={i} className="cv-entry" style={s.certItem}>
                <strong>{c.name}</strong> — {c.issuer} ({formatDate(c.date)})
              </div>
            ))}
          </>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Récompenses</div>
            {resume.awards.map((a, i) => (
              <div key={i} className="cv-entry" style={s.certItem}>
                <strong>{a.title}</strong> — {a.awarder} ({formatDate(a.date)})
              </div>
            ))}
          </>
        )}

        {resume.interests && resume.interests.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Centres d&apos;intérêt</div>
            {resume.interests.map((item, i) => (
              <div key={i} style={{ fontSize: "11px", marginBottom: "2px" }}>
                <strong>{item.name}</strong>
                {item.keywords && item.keywords.length > 0 && (
                  <span style={{ color: colors.muted }}> — {item.keywords.join(", ")}</span>
                )}
              </div>
            ))}
          </>
        )}

        {resume.publications && resume.publications.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionTitle}>Publications</div>
            {resume.publications.map((p, i) => (
              <div key={i} className="cv-entry" style={s.certItem}>
                <strong>{p.name}</strong> — {p.publisher} ({formatDate(p.releaseDate)})
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  // Screen mode: two-column layout
  return (
    <div style={s.page}>
      {header}

      {b.summary && (
        <p style={{ fontSize: "11px", color: colors.text, marginBottom: "12px", lineHeight: 1.5 }}>
          {b.summary}
        </p>
      )}

      <div style={s.columns}>
        <div style={s.leftCol}>
          {resume.work && resume.work.length > 0 && (
            <>
              <div style={s.sectionTitle}>Expérience Professionnelle</div>
              {resume.work.map((w, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={s.entryTitle}>{w.position} — {w.name}</div>
                  <div style={s.entryMeta}>
                    {dateRange(w.startDate, w.endDate)}{w.location ? ` | ${w.location}` : ""}
                  </div>
                  {w.summary && <p style={s.entryText}>{w.summary}</p>}
                  {w.highlights && w.highlights.length > 0 && (
                    <ul style={{ margin: "2px 0", padding: 0 }}>
                      {w.highlights.map((h, j) => (
                        <li key={j} style={s.bullet}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

          {resume.projects && resume.projects.length > 0 && (
            <>
              <div style={s.sectionTitle}>Projets</div>
              {resume.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={s.entryTitle}>{p.name}</div>
                  <div style={s.entryMeta}>{dateRange(p.startDate, p.endDate)}</div>
                  {p.description && <p style={s.entryText}>{p.description}</p>}
                  {p.keywords && p.keywords.length > 0 && (
                    <p style={{ fontSize: "10px", color: colors.muted }}>{p.keywords.join(", ")}</p>
                  )}
                </div>
              ))}
            </>
          )}

          {resume.volunteer && resume.volunteer.length > 0 && (
            <>
              <div style={s.sectionTitle}>Bénévolat</div>
              {resume.volunteer.map((v, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={s.entryTitle}>{v.position} — {v.organization}</div>
                  <div style={s.entryMeta}>{dateRange(v.startDate, v.endDate)}</div>
                  {v.summary && <p style={s.entryText}>{v.summary}</p>}
                </div>
              ))}
            </>
          )}

          {resume.references && resume.references.length > 0 && (
            <>
              <div style={s.sectionTitle}>Références</div>
              {resume.references.map((r, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600 }}>{r.name}</div>
                  <p style={{ fontSize: "10px", color: colors.muted, fontStyle: "italic", margin: 0 }}>
                    &ldquo;{r.reference}&rdquo;
                  </p>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={s.rightCol}>
          {resume.education && resume.education.length > 0 && (
            <>
              <div style={s.sectionTitle}>Formation</div>
              {resume.education.map((e, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={s.entryTitle}>{e.institution}</div>
                  <div style={s.entryMeta}>
                    {e.studyType} {e.area ? `- ${e.area}` : ""} | {dateRange(e.startDate, e.endDate)}
                  </div>
                  {e.score && <div style={{ fontSize: "10px", color: colors.muted }}>{e.score}</div>}
                </div>
              ))}
            </>
          )}

          {resume.skills && resume.skills.length > 0 && (
            <>
              <div style={s.sectionTitle}>Compétences</div>
              {resume.skills.map((sk, i) => (
                <div key={i} style={s.skillRow}>
                  <span style={s.skillName}>{sk.name}</span>
                  <span style={s.skillKw}>
                    {sk.keywords && sk.keywords.length > 0 ? sk.keywords.join(", ") : sk.level}
                  </span>
                </div>
              ))}
            </>
          )}

          {resume.languages && resume.languages.length > 0 && (
            <>
              <div style={s.sectionTitle}>Langues</div>
              {resume.languages.map((l, i) => (
                <div key={i} style={s.langItem}>
                  <strong>{l.language}</strong> — {l.fluency}
                </div>
              ))}
            </>
          )}

          {resume.certificates && resume.certificates.length > 0 && (
            <>
              <div style={s.sectionTitle}>Certifications</div>
              {resume.certificates.map((c, i) => (
                <div key={i} style={s.certItem}>
                  <strong>{c.name}</strong> — {c.issuer} ({formatDate(c.date)})
                </div>
              ))}
            </>
          )}

          {resume.awards && resume.awards.length > 0 && (
            <>
              <div style={s.sectionTitle}>Récompenses</div>
              {resume.awards.map((a, i) => (
                <div key={i} style={s.certItem}>
                  <strong>{a.title}</strong> — {a.awarder} ({formatDate(a.date)})
                </div>
              ))}
            </>
          )}

          {resume.interests && resume.interests.length > 0 && (
            <>
              <div style={s.sectionTitle}>Centres d&apos;intérêt</div>
              {resume.interests.map((item, i) => (
                <div key={i} style={{ fontSize: "11px", marginBottom: "2px" }}>
                  <strong>{item.name}</strong>
                  {item.keywords && item.keywords.length > 0 && (
                    <span style={{ color: colors.muted }}> — {item.keywords.join(", ")}</span>
                  )}
                </div>
              ))}
            </>
          )}

          {resume.publications && resume.publications.length > 0 && (
            <>
              <div style={s.sectionTitle}>Publications</div>
              {resume.publications.map((p, i) => (
                <div key={i} style={s.certItem}>
                  <strong>{p.name}</strong> — {p.publisher} ({formatDate(p.releaseDate)})
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
