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

const colors = {
  gradientStart: "#7c3aed",
  gradientEnd: "#2563eb",
  accent: "#f97316",
  accentLight: "#fff7ed",
  cardBg: "#f8fafc",
  text: "#1e1b4b",
  muted: "#6b7280",
  white: "#ffffff",
  badgeBg: "#ede9fe",
  badgeText: "#6d28d9",
};

const s = {
  page: {
    fontFamily: "'Poppins', 'Nunito', system-ui, sans-serif",
    color: colors.text,
    padding: "0",
    fontSize: "13px",
    lineHeight: 1.5,
    backgroundColor: colors.white,
  } as React.CSSProperties,
  header: {
    background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
    color: colors.white,
    padding: "40px 48px",
    position: "relative" as const,
    overflow: "hidden",
  } as React.CSSProperties,
  headerDecor: {
    position: "absolute" as const,
    top: "-40px",
    right: "-40px",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
  } as React.CSSProperties,
  headerDecor2: {
    position: "absolute" as const,
    bottom: "-30px",
    right: "80px",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.05)",
  } as React.CSSProperties,
  name: {
    fontSize: "34px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    marginBottom: "4px",
    position: "relative" as const,
    zIndex: 1,
  } as React.CSSProperties,
  label: {
    fontSize: "16px",
    fontWeight: 400,
    opacity: 0.9,
    marginBottom: "16px",
    position: "relative" as const,
    zIndex: 1,
  } as React.CSSProperties,
  contactRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "16px",
    fontSize: "12px",
    opacity: 0.9,
    position: "relative" as const,
    zIndex: 1,
  } as React.CSSProperties,
  body: {
    padding: "32px 48px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: colors.gradientStart,
    marginBottom: "16px",
    marginTop: "28px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  sectionDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
    display: "inline-block",
  } as React.CSSProperties,
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "12px",
    borderLeft: `4px solid ${colors.gradientStart}`,
  } as React.CSSProperties,
  cardTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: colors.text,
    marginBottom: "2px",
  } as React.CSSProperties,
  cardMeta: {
    fontSize: "11px",
    color: colors.muted,
    marginBottom: "6px",
  } as React.CSSProperties,
  cardText: {
    fontSize: "12px",
    color: "#475569",
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 600,
    backgroundColor: colors.badgeBg,
    color: colors.badgeText,
    padding: "3px 10px",
    borderRadius: "20px",
    marginRight: "6px",
    marginBottom: "4px",
  } as React.CSSProperties,
  timelineItem: {
    display: "flex",
    alignItems: "stretch",
    marginBottom: "16px",
  } as React.CSSProperties,
  timelineAxis: {
    width: "24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flexShrink: 0,
  } as React.CSSProperties,
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
    border: `2px solid ${colors.white}`,
    flexShrink: 0,
  } as React.CSSProperties,
  timelineLine: {
    flex: 1,
    width: "2px",
    backgroundColor: colors.badgeBg,
    marginTop: "4px",
  } as React.CSSProperties,
  highlight: {
    fontSize: "12px",
    color: "#475569",
    marginLeft: "14px",
    marginBottom: "2px",
    listStyleType: "disc" as const,
  } as React.CSSProperties,
  summary: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: 1.8,
    padding: "16px 20px",
    backgroundColor: colors.cardBg,
    borderRadius: "12px",
    borderLeft: `4px solid ${colors.accent}`,
  } as React.CSSProperties,
};

export function CreativeTheme({ resume }: { resume: Resume }) {
  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city && `${b.location.city}`].filter(Boolean);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerDecor} />
        <div style={s.headerDecor2} />
        {b.name && <h1 style={s.name}>{b.name}</h1>}
        {b.label && <div style={s.label}>{b.label}</div>}
        <div style={s.contactRow}>
          {contactItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
          {b.profiles && b.profiles.filter((p) => p.network).map((p, i) => (
            <span key={`p-${i}`}>{p.network}: {p.username}</span>
          ))}
        </div>
      </header>

      <div style={s.body}>
        {b.summary && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> À propos
            </div>
            <p style={s.summary}>{b.summary}</p>
          </>
        )}

        {resume.work && resume.work.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Expérience
            </div>
            <div>
              {resume.work.map((w, i) => (
                <div key={i} style={s.timelineItem}>
                  <div style={s.timelineAxis}>
                    <div style={s.timelineDot} />
                    {i < resume.work!.length - 1 && <div style={s.timelineLine} />}
                  </div>
                  <div style={{ flex: 1, paddingLeft: "12px" }}>
                    <div style={s.card}>
                      <div style={s.cardTitle}>{w.position}</div>
                      <div style={s.cardMeta}>
                        {w.name}{w.location ? ` · ${w.location}` : ""} — {dateRange(w.startDate, w.endDate)}
                      </div>
                      {w.summary && <p style={s.cardText}>{w.summary}</p>}
                      {w.highlights && w.highlights.length > 0 && (
                        <ul style={{ margin: "6px 0 0", padding: 0 }}>
                          {w.highlights.map((h, j) => (
                            <li key={j} style={s.highlight}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Compétences
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {resume.skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>{sk.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {sk.keywords && sk.keywords.map((kw, j) => (
                      <span key={j} style={s.badge}>{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {resume.education && resume.education.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Formation
            </div>
            {resume.education.map((e, i) => (
              <div key={i} style={s.card}>
                <div style={s.cardTitle}>{e.institution}</div>
                <div style={s.cardMeta}>
                  {e.studyType} {e.area ? `en ${e.area}` : ""} — {dateRange(e.startDate, e.endDate)}
                </div>
              </div>
            ))}
          </>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Projets
            </div>
            {resume.projects.map((p, i) => (
              <div key={i} style={s.card}>
                <div style={s.cardTitle}>{p.name}</div>
                <div style={s.cardMeta}>{dateRange(p.startDate, p.endDate)}</div>
                {p.description && <p style={s.cardText}>{p.description}</p>}
                {p.keywords && p.keywords.length > 0 && (
                  <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap" }}>
                    {p.keywords.map((kw, j) => (
                      <span key={j} style={s.badge}>{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Langues
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {resume.languages.map((l, i) => (
                <span key={i} style={s.badge}>{l.language}: {l.fluency}</span>
              ))}
            </div>
          </>
        )}

        {resume.certificates && resume.certificates.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Certifications
            </div>
            {resume.certificates.map((c, i) => (
              <div key={i} style={{ ...s.card, borderLeftColor: colors.accent }}>
                <div style={s.cardTitle}>{c.name}</div>
                <div style={s.cardMeta}>{c.issuer} · {formatDate(c.date)}</div>
              </div>
            ))}
          </>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Récompenses
            </div>
            {resume.awards.map((a, i) => (
              <div key={i} style={s.card}>
                <div style={s.cardTitle}>{a.title}</div>
                <div style={s.cardMeta}>{a.awarder} · {formatDate(a.date)}</div>
                {a.summary && <p style={s.cardText}>{a.summary}</p>}
              </div>
            ))}
          </>
        )}

        {resume.volunteer && resume.volunteer.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Bénévolat
            </div>
            {resume.volunteer.map((v, i) => (
              <div key={i} style={s.card}>
                <div style={s.cardTitle}>{v.position} — {v.organization}</div>
                <div style={s.cardMeta}>{dateRange(v.startDate, v.endDate)}</div>
                {v.summary && <p style={s.cardText}>{v.summary}</p>}
              </div>
            ))}
          </>
        )}

        {resume.publications && resume.publications.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Publications
            </div>
            {resume.publications.map((p, i) => (
              <div key={i} style={{ ...s.card, borderLeftColor: colors.accent }}>
                <div style={s.cardTitle}>{p.name}</div>
                <div style={s.cardMeta}>
                  {p.publisher ? `${p.publisher} · ` : ""}{formatDate(p.releaseDate)}
                </div>
                {p.summary && <p style={s.cardText}>{p.summary}</p>}
              </div>
            ))}
          </>
        )}

        {resume.interests && resume.interests.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Centres d&apos;intérêt
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {resume.interests.map((item, i) => (
                <span key={i} style={s.badge}>{item.name}</span>
              ))}
            </div>
          </>
        )}

        {resume.references && resume.references.length > 0 && (
          <>
            <div style={s.sectionTitle}>
              <span style={s.sectionDot} /> Références
            </div>
            {resume.references.map((r, i) => (
              <div key={i} style={s.card}>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{r.name}</div>
                <p style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic", margin: "4px 0 0" }}>
                  &ldquo;{r.reference}&rdquo;
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
