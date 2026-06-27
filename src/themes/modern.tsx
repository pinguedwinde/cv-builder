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
  if (!end) return `${s} - Présent`;
  return `${s} - ${e}`;
}

const colors = {
  primary: "#2563eb",
  primaryLight: "#dbeafe",
  sidebarBg: "#1e293b",
  sidebarText: "#e2e8f0",
  sidebarMuted: "#94a3b8",
  mainBg: "#ffffff",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  accent: "#3b82f6",
};

// Sidebar width: 280px screen = ~74mm on A4
const SIDEBAR_W_PDF = "74mm";
const SIDEBAR_W_PX = "280px";

const s = {
  page: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    display: "flex",
    minHeight: "1120px",
    fontSize: "13px",
    lineHeight: 1.4,
    color: colors.text,
  } as React.CSSProperties,
  pagePdf: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: "13px",
    lineHeight: 1.4,
    color: colors.text,
  } as React.CSSProperties,
  sidebar: {
    width: SIDEBAR_W_PX,
    minWidth: SIDEBAR_W_PX,
    backgroundColor: colors.sidebarBg,
    color: colors.sidebarText,
    padding: "24px 16px",
  } as React.CSSProperties,
  sidebarPdf: {
    width: SIDEBAR_W_PDF,
    backgroundColor: colors.sidebarBg,
    color: colors.sidebarText,
    padding: "24px 16px",
    boxSizing: "border-box" as const,
    minHeight: "297mm",
  } as React.CSSProperties,
  main: {
    flex: 1,
    padding: "24px 18px",
    backgroundColor: colors.mainBg,
  } as React.CSSProperties,
  mainPdf: {
    padding: "24px 18px",
    backgroundColor: colors.mainBg,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  sidebarName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1.2,
    marginBottom: "4px",
  } as React.CSSProperties,
  sidebarLabel: {
    fontSize: "12px",
    color: colors.accent,
    fontWeight: 500,
    marginBottom: "10px",
  } as React.CSSProperties,
  sidebarSection: {
    marginBottom: "14px",
  } as React.CSSProperties,
  sidebarSectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    color: colors.accent,
    marginBottom: "12px",
    borderBottom: `1px solid ${colors.sidebarMuted}40`,
    paddingBottom: "6px",
  } as React.CSSProperties,
  sidebarItem: {
    fontSize: "12px",
    color: colors.sidebarText,
    marginBottom: "6px",
  } as React.CSSProperties,
  sidebarMutedText: {
    fontSize: "11px",
    color: colors.sidebarMuted,
  } as React.CSSProperties,
  mainSection: {
    marginBottom: "8px",
  } as React.CSSProperties,
  mainSectionTitle: {
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: colors.primary,
    marginBottom: "8px",
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: "4px",
  } as React.CSSProperties,
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "2px",
  } as React.CSSProperties,
  entryTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: colors.text,
  } as React.CSSProperties,
  entryDate: {
    fontSize: "11px",
    color: colors.muted,
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  entrySubtitle: {
    fontSize: "12px",
    color: colors.muted,
    marginBottom: "6px",
  } as React.CSSProperties,
  entrySummary: {
    fontSize: "12px",
    color: "#475569",
    marginBottom: "4px",
  } as React.CSSProperties,
  highlight: {
    fontSize: "12px",
    color: "#475569",
    marginLeft: "14px",
    marginBottom: "2px",
    listStyleType: "disc" as const,
  } as React.CSSProperties,
  skillBar: {
    marginBottom: "8px",
  } as React.CSSProperties,
  skillName: {
    fontSize: "12px",
    fontWeight: 600,
    color: colors.sidebarText,
    marginBottom: "3px",
  } as React.CSSProperties,
  skillBarBg: {
    height: "4px",
    backgroundColor: `${colors.sidebarMuted}40`,
    borderRadius: "2px",
    overflow: "hidden",
  } as React.CSSProperties,
  tag: {
    display: "inline-block",
    fontSize: "10px",
    backgroundColor: `${colors.accent}20`,
    color: colors.accent,
    padding: "2px 8px",
    borderRadius: "10px",
    marginRight: "4px",
    marginBottom: "4px",
  } as React.CSSProperties,
};

function getSkillLevelPercent(level?: string): number {
  if (!level) return 70;
  const l = level.toLowerCase();
  if (l.includes("expert") || l.includes("master")) return 95;
  if (l.includes("avanc") || l.includes("advanced")) return 80;
  if (l.includes("interm")) return 60;
  if (l.includes("déb") || l.includes("beginner")) return 35;
  return 70;
}

export function ModernTheme({ resume }: { resume: Resume }) {
  const pdfMode = usePdfMode();
  const b = resume.basics;

  return (
    <div style={pdfMode ? s.pagePdf : s.page}>
      <aside className={pdfMode ? "cv-running-sidebar" : undefined} style={pdfMode ? s.sidebarPdf : s.sidebar}>
        {b.name && <div style={s.sidebarName}>{b.name}</div>}
        {b.label && <div style={s.sidebarLabel}>{b.label}</div>}

        {(b.email || b.phone || b.url || b.location?.city) && (
          <div style={s.sidebarSection}>
            <div style={s.sidebarSectionTitle}>Contact</div>
            {b.email && <div style={s.sidebarItem}>{b.email}</div>}
            {b.phone && <div style={s.sidebarItem}>{b.phone}</div>}
            {b.url && <div style={s.sidebarItem}>{b.url}</div>}
            {b.location?.city && (
              <div style={s.sidebarItem}>
                {b.location.city}{b.location.countryCode ? `, ${b.location.countryCode}` : ""}
              </div>
            )}
          </div>
        )}

        {b.profiles && b.profiles.length > 0 && (
          <div style={s.sidebarSection}>
            <div style={s.sidebarSectionTitle}>Réseaux</div>
            {b.profiles.filter((p) => p.network).map((p, i) => (
              <div key={i} style={s.sidebarItem}>
                <span style={{ fontWeight: 600 }}>{p.network}</span>
                <div style={s.sidebarMutedText}>{p.username}</div>
              </div>
            ))}
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div style={s.sidebarSection}>
            <div style={s.sidebarSectionTitle}>Compétences</div>
            {resume.skills.map((sk, i) => (
              <div key={i} style={s.skillBar}>
                <div style={s.skillName}>{sk.name}</div>
                <div style={s.skillBarBg}>
                  <div
                    style={{
                      height: "100%",
                      width: `${getSkillLevelPercent(sk.level)}%`,
                      backgroundColor: colors.accent,
                      borderRadius: "2px",
                    }}
                  />
                </div>
                {sk.keywords && sk.keywords.length > 0 && (
                  <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap" }}>
                    {sk.keywords.slice(0, 5).map((kw, j) => (
                      <span key={j} style={{ ...s.tag, backgroundColor: `${colors.accent}15`, color: colors.sidebarMuted }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <div style={s.sidebarSection}>
            <div style={s.sidebarSectionTitle}>Langues</div>
            {resume.languages.map((l, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <div style={{ ...s.sidebarItem, fontWeight: 600 }}>{l.language}</div>
                <div style={s.sidebarMutedText}>{l.fluency}</div>
              </div>
            ))}
          </div>
        )}

        {resume.interests && resume.interests.length > 0 && (
          <div style={s.sidebarSection}>
            <div style={s.sidebarSectionTitle}>Centres d&apos;intérêt</div>
            {resume.interests.map((item, i) => (
              <div key={i} style={{ ...s.sidebarItem, fontWeight: 500 }}>{item.name}</div>
            ))}
          </div>
        )}
      </aside>

      <main style={pdfMode ? s.mainPdf : s.main}>
        {b.summary && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Profil</div>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7 }}>{b.summary}</p>
          </div>
        )}

        {resume.work && resume.work.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Expérience</div>
            {resume.work.map((w, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
                <div style={s.entryHeader}>
                  <div style={s.entryTitle}>{w.position}</div>
                  <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}</div>
                </div>
                <div style={s.entrySubtitle}>
                  {w.name}{w.location ? ` · ${w.location}` : ""}
                </div>
                {w.summary && <p style={s.entrySummary}>{w.summary}</p>}
                {w.highlights && w.highlights.length > 0 && (
                  <ul style={{ margin: "4px 0", padding: 0 }}>
                    {w.highlights.map((h, j) => (
                      <li key={j} style={s.highlight}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.education && resume.education.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Formation</div>
            {resume.education.map((e, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                <div style={s.entryHeader}>
                  <div style={s.entryTitle}>{e.institution}</div>
                  <div style={s.entryDate}>{dateRange(e.startDate, e.endDate)}</div>
                </div>
                <div style={s.entrySubtitle}>
                  {e.studyType} {e.area ? `en ${e.area}` : ""}{e.score ? ` · ${e.score}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Projets</div>
            {resume.projects.map((p, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
                <div style={s.entryHeader}>
                  <div style={s.entryTitle}>{p.name}</div>
                  <div style={s.entryDate}>{dateRange(p.startDate, p.endDate)}</div>
                </div>
                {p.description && <p style={s.entrySummary}>{p.description}</p>}
                {p.keywords && p.keywords.length > 0 && (
                  <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap" }}>
                    {p.keywords.map((kw, j) => (
                      <span key={j} style={s.tag}>{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {resume.certificates && resume.certificates.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Certifications</div>
            {resume.certificates.map((c, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "6px" }}>
                <div style={{ ...s.entryTitle, fontSize: "13px" }}>{c.name}</div>
                <div style={s.entrySubtitle}>{c.issuer} · {formatDate(c.date)}</div>
              </div>
            ))}
          </div>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Récompenses</div>
            {resume.awards.map((a, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                <div style={{ ...s.entryTitle, fontSize: "13px" }}>{a.title}</div>
                <div style={s.entrySubtitle}>{a.awarder} · {formatDate(a.date)}</div>
                {a.summary && <p style={s.entrySummary}>{a.summary}</p>}
              </div>
            ))}
          </div>
        )}

        {resume.volunteer && resume.volunteer.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Bénévolat</div>
            {resume.volunteer.map((v, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
                <div style={s.entryHeader}>
                  <div style={s.entryTitle}>{v.position}</div>
                  <div style={s.entryDate}>{dateRange(v.startDate, v.endDate)}</div>
                </div>
                <div style={s.entrySubtitle}>{v.organization}</div>
                {v.summary && <p style={s.entrySummary}>{v.summary}</p>}
              </div>
            ))}
          </div>
        )}

        {resume.references && resume.references.length > 0 && (
          <div style={s.mainSection}>
            <div className="cv-section-title" style={s.mainSectionTitle}>Références</div>
            {resume.references.map((r, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.name}</div>
                <p style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", margin: "2px 0" }}>
                  &ldquo;{r.reference}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
