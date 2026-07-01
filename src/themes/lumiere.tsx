import { usePdfMode } from "@/lib/pdf-context";
import type { ThemeProps } from "./types";

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
  if (!end) return `Depuis ${s}`;
  return `De ${s} à ${e}`;
}

function getLangPercent(fluency?: string): number {
  if (!fluency) return 60;
  const f = fluency.toLowerCase();
  if (f.includes("natif") || f.includes("native") || f.includes("bilingue") || f.includes("c2")) return 100;
  if (f.includes("c1") || f.includes("courant") || f.includes("professionnel")) return 85;
  if (f.includes("b2") || f.includes("avancé") || f.includes("avance")) return 70;
  if (f.includes("b1") || f.includes("interm")) return 55;
  if (f.includes("a2") || f.includes("élémentaire") || f.includes("elementaire")) return 35;
  if (f.includes("a1") || f.includes("débutant") || f.includes("debutant")) return 20;
  return 60;
}

// Inline SVG icons — PDF-safe (no font dependency)
function IconLocation({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function IconMail({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function IconPhone({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
    </svg>
  );
}
function IconLink({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}
function IconNetwork({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

// LinkedIn square "in" logo — matches brand shape
function IconLinkedIn({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function IconGitHub({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  );
}

function IconTwitter({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, marginTop: "1px" }}>
      <path d="M4 4l16 16M4 20 20 4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function getNetworkIcon(network: string, color: string) {
  const n = network.toLowerCase();
  if (n.includes("linkedin")) return <IconLinkedIn color={color} />;
  if (n.includes("github")) return <IconGitHub color={color} />;
  if (n.includes("twitter") || n.includes("x.com")) return <IconTwitter color={color} />;
  return <IconNetwork color={color} />;
}

const defaultColors = {
  headerBg: "#dde8f2",
  headerBorder: "#b8cfe0",
  primary: "#1d3557",
  accent: "#2563eb",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  sidebarBg: "#eef3f8",
};

const SIDEBAR_W_PDF = "63mm";
const SIDEBAR_W_PX = "240px";

export function LumiereTheme({ resume, colors: colorOverrides = {} }: ThemeProps) {
  const pdfMode = usePdfMode();
  const colors = { ...defaultColors, ...colorOverrides };
  const b = resume.basics;
  const sidebarBg = colors.sidebarBg;
  const sidebarW = pdfMode ? SIDEBAR_W_PDF : SIDEBAR_W_PX;

  const s = {
    page: {
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      fontSize: "12px",
      lineHeight: 1.45,
      color: colors.text,
      backgroundColor: "#ffffff",
      // Gradient simulates sidebar bg in screen mode only; PDF uses running element
      ...(pdfMode
        ? {}
        : {
            background: `linear-gradient(to right, ${sidebarBg} ${SIDEBAR_W_PX}, #ffffff 0)`,
            minHeight: "1120px",
          }),
    } as React.CSSProperties,

    header: {
      backgroundColor: colors.headerBg,
      borderBottom: `2px solid ${colors.headerBorder}`,
      padding: "20px 28px 16px",
      textAlign: "center" as const,
    } as React.CSSProperties,

    headerName: {
      fontSize: "26px",
      fontWeight: 800,
      color: colors.primary,
      letterSpacing: "0.5px",
      lineHeight: 1.1,
      marginBottom: "5px",
    } as React.CSSProperties,

    headerTitle: {
      fontSize: "14px",
      fontWeight: 400,
      color: colors.muted,
    } as React.CSSProperties,

    body: {
      // Flex only in screen mode — in PDF mode the aside is a running element (out of flow)
      ...(pdfMode ? {} : { display: "flex" as const }),
    } as React.CSSProperties,

    sidebar: {
      width: sidebarW,
      minWidth: sidebarW,
      backgroundColor: sidebarBg,
      borderRight: `1px solid ${colors.headerBorder}`,
      padding: "16px 14px",
      boxSizing: "border-box" as const,
      ...(pdfMode ? { minHeight: "297mm" } : {}),
    } as React.CSSProperties,

    main: {
      flex: 1,
      minWidth: 0,
      padding: "16px 20px",
      backgroundColor: "transparent",
      boxSizing: "border-box" as const,
    } as React.CSSProperties,

    // --- Sidebar ---
    contactItem: {
      fontSize: "11px",
      color: colors.text,
      marginBottom: "5px",
      display: "flex" as const,
      alignItems: "flex-start" as const,
      gap: "6px",
    } as React.CSSProperties,

    sidebarSection: {
      marginBottom: "14px",
    } as React.CSSProperties,

    sidebarSectionTitle: {
      fontSize: "12px",
      fontWeight: 700,
      color: colors.primary,
      marginBottom: "8px",
      paddingBottom: "4px",
      borderBottom: `1px solid ${colors.headerBorder}`,
    } as React.CSSProperties,

    skillCategory: {
      fontSize: "11px",
      fontWeight: 700,
      color: colors.text,
      marginBottom: "3px",
      marginTop: "6px",
    } as React.CSSProperties,

    skillKeyword: {
      fontSize: "10.5px",
      color: "#475569",
      marginBottom: "2px",
      marginLeft: "10px",
      listStyleType: "disc" as const,
    } as React.CSSProperties,

    langRow: {
      marginBottom: "8px",
    } as React.CSSProperties,

    langName: {
      fontSize: "11.5px",
      fontWeight: 600,
      color: colors.text,
      marginBottom: "3px",
    } as React.CSSProperties,

    langBarBg: {
      height: "5px",
      backgroundColor: colors.border,
      borderRadius: "2px",
      overflow: "hidden" as const,
    } as React.CSSProperties,

    langFluency: {
      fontSize: "10px",
      color: colors.muted,
      marginTop: "2px",
    } as React.CSSProperties,

    interestName: {
      fontSize: "11.5px",
      fontWeight: 600,
      color: colors.text,
      marginBottom: "1px",
      marginTop: "5px",
    } as React.CSSProperties,

    interestDesc: {
      fontSize: "10.5px",
      color: colors.muted,
    } as React.CSSProperties,

    // --- Main ---
    summary: {
      fontSize: "12px",
      color: "#475569",
      lineHeight: 1.65,
      padding: "10px 12px",
      backgroundColor: "#f8fafc",
      borderLeft: `3px solid ${colors.accent}`,
      marginBottom: "14px",
    } as React.CSSProperties,

    mainSection: {
      marginBottom: "12px",
    } as React.CSSProperties,

    mainSectionTitle: {
      fontSize: "13px",
      fontWeight: 700,
      color: colors.primary,
      marginBottom: "8px",
      paddingBottom: "3px",
      borderBottom: `2px solid ${colors.accent}`,
    } as React.CSSProperties,

    entryRow: {
      display: "flex" as const,
      gap: "8px",
      marginBottom: "10px",
      alignItems: "flex-start" as const,
    } as React.CSSProperties,

    entryDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: colors.accent,
      marginTop: "4px",
      flexShrink: 0,
    } as React.CSSProperties,

    entryContent: {
      flex: 1,
      minWidth: 0,
      wordBreak: "break-word" as const,
    } as React.CSSProperties,

    entryTitle: {
      fontSize: "12.5px",
      fontWeight: 700,
      color: colors.text,
      marginBottom: "2px",
    } as React.CSSProperties,

    entryMeta: {
      fontSize: "11px",
      color: colors.muted,
      marginBottom: "3px",
    } as React.CSSProperties,

    entryCompany: {
      color: colors.accent,
      fontWeight: 600,
    } as React.CSSProperties,

    entryInstitution: {
      fontSize: "11.5px",
      color: colors.text,
      marginBottom: "2px",
    } as React.CSSProperties,

    highlight: {
      fontSize: "11px",
      color: "#475569",
      marginLeft: "14px",
      marginBottom: "2px",
      listStyleType: "disc" as const,
    } as React.CSSProperties,

    tag: {
      display: "inline-block",
      fontSize: "10px",
      backgroundColor: `${colors.accent}15`,
      color: colors.accent,
      padding: "1px 7px",
      borderRadius: "8px",
      marginRight: "4px",
      marginBottom: "3px",
    } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      {pdfMode && <div className="cv-sidebar-bg" />}
      {/* Full-width header */}
      <div style={s.header}>
        {b.name && <div style={s.headerName}>{b.name}</div>}
        {b.label && <div style={s.headerTitle}>{b.label}</div>}
      </div>

      <div style={s.body}>
        {/* Left sidebar */}
        <aside className={pdfMode ? "cv-running-sidebar" : undefined} style={s.sidebar}>

          {/* Contact */}
          {(b.location?.city || b.email || b.phone || b.url) && (
            <div style={s.sidebarSection}>
              {b.location?.city && (
                <div style={s.contactItem}>
                  <IconLocation color={colors.accent} />
                  <span>
                    {b.location.city}
                    {b.location.postalCode ? ` (${b.location.postalCode})` : ""}
                  </span>
                </div>
              )}
              {b.email && (
                <div style={s.contactItem}>
                  <IconMail color={colors.accent} />
                  <span>{b.email}</span>
                </div>
              )}
              {b.phone && (
                <div style={s.contactItem}>
                  <IconPhone color={colors.accent} />
                  <span>{b.phone}</span>
                </div>
              )}
              {b.url && (
                <div style={s.contactItem}>
                  <IconLink color={colors.accent} />
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: colors.accent, textDecoration: "none", wordBreak: "break-all" as const }}
                  >
                    {b.url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social networks */}
          {b.profiles && b.profiles.filter((p) => p.network).length > 0 && (
            <div style={s.sidebarSection}>
              <div style={s.sidebarSectionTitle}>Réseaux sociaux</div>
              {b.profiles.filter((p) => p.network).map((p, i) => {
                const href = p.url || (p.username && p.network?.toLowerCase().includes("linkedin")
                  ? `https://linkedin.com/in/${p.username}`
                  : undefined);
                const label = p.username || p.url || p.network;
                return (
                  <div key={i} style={s.contactItem}>
                    {getNetworkIcon(p.network ?? "", colors.accent)}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: colors.accent, textDecoration: "none", wordBreak: "break-all" as const }}
                      >
                        {label}
                      </a>
                    ) : (
                      <span>{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div style={s.sidebarSection}>
              <div style={s.sidebarSectionTitle}>Compétences</div>
              {resume.skills.map((sk, i) => (
                <div key={i}>
                  <div style={s.skillCategory}>{sk.name}</div>
                  {sk.keywords && sk.keywords.length > 0 ? (
                    <ul style={{ margin: "0 0 4px 0", padding: 0 }}>
                      {sk.keywords.map((kw, j) => (
                        <li key={j} style={s.skillKeyword}>{kw}</li>
                      ))}
                    </ul>
                  ) : (
                    sk.level && (
                      <div style={s.langFluency}>{sk.level}</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {resume.languages && resume.languages.length > 0 && (
            <div style={s.sidebarSection}>
              <div style={s.sidebarSectionTitle}>Langues</div>
              {resume.languages.map((l, i) => (
                <div key={i} style={s.langRow}>
                  <div style={s.langName}>{l.language}</div>
                  <div style={s.langBarBg}>
                    <div
                      style={{
                        height: "100%",
                        width: `${getLangPercent(l.fluency)}%`,
                        backgroundColor: colors.accent,
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  {l.fluency && <div style={s.langFluency}>{l.fluency}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Interests */}
          {resume.interests && resume.interests.length > 0 && (
            <div style={s.sidebarSection}>
              <div style={s.sidebarSectionTitle}>Centres d&apos;intérêt</div>
              {resume.interests.map((item, i) => (
                <div key={i}>
                  <div style={s.interestName}>{item.name}</div>
                  {item.keywords && item.keywords.length > 0 && (
                    <div style={s.interestDesc}>{item.keywords.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Right main */}
        <main style={s.main}>

          {/* Summary */}
          {b.summary && (
            <p style={s.summary}>{b.summary}</p>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>
                Diplômes et Formations
              </div>
              {resume.education.map((e, i) => (
                <div key={i} className="cv-entry" style={s.entryRow}>
                  <div style={s.entryDot} />
                  <div style={s.entryContent}>
                    <div style={s.entryTitle}>
                      {e.studyType}
                      {e.area ? ` (${e.area})` : ""}
                    </div>
                    <div style={s.entryMeta}>{dateRange(e.startDate, e.endDate)}</div>
                    <div style={s.entryInstitution}>{e.institution}</div>
                    {e.score && <div style={s.entryMeta}>{e.score}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Work */}
          {resume.work && resume.work.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>
                Expériences professionnelles
              </div>
              {resume.work.map((w, i) => (
                <div key={i} className="cv-entry" style={s.entryRow}>
                  <div style={s.entryDot} />
                  <div style={s.entryContent}>
                    <div style={s.entryTitle}>{w.position}</div>
                    <div style={s.entryMeta}>
                      {dateRange(w.startDate, w.endDate)}{" "}
                      <span style={s.entryCompany}>{w.name}</span>
                      {w.location ? ` ${w.location}` : ""}
                    </div>
                    {w.summary && (
                      <p style={{ ...s.entryMeta, color: "#475569", marginBottom: "4px" }}>
                        {w.summary}
                      </p>
                    )}
                    {w.highlights && w.highlights.length > 0 && (
                      <ul style={{ margin: "3px 0", padding: 0 }}>
                        {w.highlights.map((h, j) => (
                          <li key={j} style={s.highlight}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>Projets</div>
              {resume.projects.map((p, i) => (
                <div key={i} className="cv-entry" style={s.entryRow}>
                  <div style={s.entryDot} />
                  <div style={s.entryContent}>
                    <div style={s.entryTitle}>{p.name}</div>
                    <div style={s.entryMeta}>{dateRange(p.startDate, p.endDate)}</div>
                    {p.description && (
                      <p style={{ ...s.entryMeta, color: "#475569" }}>{p.description}</p>
                    )}
                    {p.highlights && p.highlights.length > 0 && (
                      <ul style={{ margin: "3px 0", padding: 0 }}>
                        {p.highlights.map((h, j) => (
                          <li key={j} style={s.highlight}>{h}</li>
                        ))}
                      </ul>
                    )}
                    {p.keywords && p.keywords.length > 0 && (
                      <div style={{ marginTop: "4px" }}>
                        {p.keywords.map((kw, j) => (
                          <span key={j} style={s.tag}>{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certificates */}
          {resume.certificates && resume.certificates.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>Certifications</div>
              {resume.certificates.map((c, i) => (
                <div key={i} className="cv-entry" style={s.entryRow}>
                  <div style={s.entryDot} />
                  <div style={s.entryContent}>
                    <div style={s.entryTitle}>{c.name}</div>
                    <div style={s.entryMeta}>
                      {c.issuer}
                      {c.date ? ` · ${formatDate(c.date)}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Awards */}
          {resume.awards && resume.awards.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>Récompenses</div>
              {resume.awards.map((a, i) => (
                <div key={i} className="cv-entry" style={s.entryRow}>
                  <div style={s.entryDot} />
                  <div style={s.entryContent}>
                    <div style={s.entryTitle}>{a.title}</div>
                    <div style={s.entryMeta}>
                      {a.awarder}
                      {a.date ? ` · ${formatDate(a.date)}` : ""}
                    </div>
                    {a.summary && (
                      <p style={{ ...s.entryMeta, color: "#475569" }}>{a.summary}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteer */}
          {resume.volunteer && resume.volunteer.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>Bénévolat</div>
              {resume.volunteer.map((v, i) => (
                <div key={i} className="cv-entry" style={s.entryRow}>
                  <div style={s.entryDot} />
                  <div style={s.entryContent}>
                    <div style={s.entryTitle}>{v.position}</div>
                    <div style={s.entryMeta}>
                      {dateRange(v.startDate, v.endDate)}{" "}
                      <span style={s.entryCompany}>{v.organization}</span>
                    </div>
                    {v.summary && (
                      <p style={{ ...s.entryMeta, color: "#475569" }}>{v.summary}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* References */}
          {resume.references && resume.references.length > 0 && (
            <div style={s.mainSection}>
              <div className="cv-section-title" style={s.mainSectionTitle}>Références</div>
              {resume.references.map((r, i) => (
                <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{r.name}</div>
                  <p style={{ fontSize: "11.5px", color: "#64748b", fontStyle: "italic", margin: "2px 0" }}>
                    &ldquo;{r.reference}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


