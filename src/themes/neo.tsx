import type { Resume } from "@/lib/schemas/resume";

function formatDate(date?: string): string {
  if (!date) return "present";
  const parts = date.split("-");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]}-${parts[1].padStart(2, "0")}`;
  return date.substring(0, 7);
}

function dateRange(start?: string, end?: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!start && !end) return "";
  if (!end) return `[${s} .. present]`;
  return `[${s} .. ${e}]`;
}

const BG = "#0D1117";
const SURFACE = "#161B22";
const BORDER_COLOR = "#30363D";
const TEXT = "#C9D1D9";
const NEON = "#39D353";
const CYAN = "#58A6FF";
const MUTED_COLOR = "#8B949E";

const s = {
  page: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace",
    color: TEXT,
    backgroundColor: BG,
    padding: "24px",
    maxWidth: "210mm",
    // minHeight removed for multi-page PDF support
    lineHeight: 1.65,
    fontSize: "12px",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  terminal: {
    backgroundColor: SURFACE,
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "6px",
    overflow: "hidden" as const,
    marginBottom: "16px",
  } as React.CSSProperties,
  titleBar: {
    height: "28px",
    backgroundColor: "#21262D",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    gap: "6px",
  } as React.CSSProperties,
  dot: (color: string) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: color,
    display: "inline-block",
  } as React.CSSProperties),
  terminalBody: {
    padding: "16px 20px",
  } as React.CSSProperties,
  prompt: {
    color: MUTED_COLOR,
    fontSize: "11px",
    marginBottom: "2px",
  } as React.CSSProperties,
  name: {
    color: NEON,
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "4px",
  } as React.CSSProperties,
  label: {
    color: CYAN,
    fontSize: "12px",
    marginBottom: "12px",
  } as React.CSSProperties,
  contactLine: {
    color: MUTED_COLOR,
    fontSize: "11px",
    marginBottom: "2px",
  } as React.CSSProperties,
  divider: {
    color: BORDER_COLOR,
    letterSpacing: "2px",
    fontSize: "12px",
    margin: "16px 0",
    overflow: "hidden" as const,
  } as React.CSSProperties,
  sectionTitle: {
    color: CYAN,
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
    marginTop: "20px",
  } as React.CSSProperties,
  commentPrefix: {
    color: MUTED_COLOR,
  } as React.CSSProperties,
  entry: {
    marginBottom: "20px",
    paddingLeft: "8px",
    borderLeft: `2px solid ${BORDER_COLOR}`,
  } as React.CSSProperties,
  entryCompany: {
    color: NEON,
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "1px",
  } as React.CSSProperties,
  entryPosition: {
    color: TEXT,
    fontSize: "12px",
    marginBottom: "2px",
  } as React.CSSProperties,
  entryDate: {
    color: MUTED_COLOR,
    fontSize: "11px",
    marginBottom: "6px",
  } as React.CSSProperties,
  text: {
    color: "#A0A8B4",
    fontSize: "12px",
    marginBottom: "3px",
  } as React.CSSProperties,
  bullet: {
    color: "#A0A8B4",
    fontSize: "12px",
    paddingLeft: "20px",
    marginBottom: "2px",
    position: "relative" as const,
  } as React.CSSProperties,
  bulletMark: {
    position: "absolute" as const,
    left: 0,
    color: NEON,
  } as React.CSSProperties,
  skillKey: {
    color: CYAN,
    marginRight: "2px",
  } as React.CSSProperties,
  skillValue: {
    color: NEON,
  } as React.CSSProperties,
  skillMuted: {
    color: MUTED_COLOR,
  } as React.CSSProperties,
  tag: {
    display: "inline-block",
    backgroundColor: "#1F2937",
    color: NEON,
    border: `1px solid ${BORDER_COLOR}`,
    padding: "1px 8px",
    borderRadius: "3px",
    fontSize: "11px",
    marginRight: "4px",
    marginBottom: "4px",
  } as React.CSSProperties,
};

const DASHES = "─".repeat(56);

export function NeoTheme({ resume }: { resume: Resume }) {
  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url, b.location?.city].filter(Boolean) as string[];

  return (
    <div style={s.page}>
      <div style={s.terminal}>
        <div style={s.titleBar}>
          <span style={s.dot("#FF5F56")} />
          <span style={s.dot("#FFBD2E")} />
          <span style={s.dot("#27C93F")} />
        </div>
        <div style={s.terminalBody}>
          <div style={s.prompt}>$ whoami</div>
          {b.name && <div style={s.name}>{b.name}</div>}
          {b.label && <div style={s.label}># {b.label}</div>}
          <div style={{ color: BORDER_COLOR, margin: "8px 0" }}>{DASHES}</div>
          {contactItems.map((item, i) => (
            <div key={i} style={s.contactLine}>
              <span style={{ color: MUTED_COLOR }}>$ echo </span>
              <span style={{ color: TEXT }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {b.summary && (
        <>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>PROFIL
          </div>
          <div style={{ ...s.entry, fontStyle: "italic" as const, color: "#A0A8B4" }}>
            {b.summary}<span style={{ color: NEON }}>|</span>
          </div>
        </>
      )}

      {resume.work && resume.work.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>EXPERIENCE
          </div>
          {resume.work.map((w, i) => (
            <div key={i} className="cv-entry" style={s.entry}>
              <div style={s.entryCompany}>&gt; {w.name}</div>
              <div style={s.entryPosition}>{w.position}</div>
              <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}{w.location ? ` - ${w.location}` : ""}</div>
              {w.summary && <p style={s.text}>{w.summary}</p>}
              {w.highlights && w.highlights.map((h, j) => (
                <div key={j} style={s.bullet}>
                  <span style={s.bulletMark}>&gt;_</span> {h}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {resume.education && resume.education.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>FORMATION
          </div>
          {resume.education.map((e, i) => (
            <div key={i} className="cv-entry" style={s.entry}>
              <div style={s.entryCompany}>&gt; {e.institution}</div>
              <div style={s.entryPosition}>{e.studyType}{e.area ? ` - ${e.area}` : ""}</div>
              <div style={s.entryDate}>{dateRange(e.startDate, e.endDate)}{e.score ? ` - ${e.score}` : ""}</div>
            </div>
          ))}
        </>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>COMPETENCES
          </div>
          <div style={{ ...s.entry }}>
            <div style={{ color: MUTED_COLOR, marginBottom: "8px" }}>{`{`}</div>
            {resume.skills.map((sk, i) => (
              <div key={i} style={{ paddingLeft: "16px", marginBottom: "4px", fontSize: "12px" }}>
                <span style={s.skillKey}>&quot;{sk.name}&quot;</span>
                <span style={{ color: TEXT }}>: </span>
                {sk.level && <span style={s.skillValue}>&quot;{sk.level}&quot;</span>}
                {sk.keywords && sk.keywords.length > 0 && (
                  <span style={s.skillMuted}>  // {sk.keywords.join(", ")}</span>
                )}
              </div>
            ))}
            <div style={{ color: MUTED_COLOR }}>{`}`}</div>
          </div>
        </>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>PROJETS
          </div>
          {resume.projects.map((p, i) => (
            <div key={i} className="cv-entry" style={s.entry}>
              <div style={s.entryCompany}>&gt; {p.name}</div>
              <div style={s.entryDate}>{dateRange(p.startDate, p.endDate)}</div>
              {p.description && <p style={s.text}>{p.description}</p>}
              {p.keywords && p.keywords.length > 0 && (
                <div style={{ marginTop: "4px" }}>
                  {p.keywords.map((kw, j) => <span key={j} style={s.tag}>{kw}</span>)}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {resume.languages && resume.languages.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>LANGUES
          </div>
          <div style={s.entry}>
            {resume.languages.map((l, i) => (
              <div key={i} style={{ fontSize: "12px", marginBottom: "3px" }}>
                <span style={s.skillKey}>{l.language}</span>
                <span style={{ color: TEXT }}>: </span>
                <span style={s.skillValue}>{l.fluency}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {resume.certificates && resume.certificates.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>CERTIFICATIONS
          </div>
          {resume.certificates.map((c, i) => (
            <div key={i} style={{ ...s.text, marginBottom: "4px" }}>
              <span style={{ color: NEON }}>&gt;</span> {c.name} - {c.issuer} ({formatDate(c.date)})
            </div>
          ))}
        </>
      )}

      {resume.volunteer && resume.volunteer.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>BENEVOLAT
          </div>
          {resume.volunteer.map((v, i) => (
            <div key={i} className="cv-entry" style={s.entry}>
              <div style={s.entryCompany}>&gt; {v.organization}</div>
              <div style={s.entryPosition}>{v.position}</div>
              <div style={s.entryDate}>{dateRange(v.startDate, v.endDate)}</div>
              {v.summary && <p style={s.text}>{v.summary}</p>}
            </div>
          ))}
        </>
      )}

      {resume.interests && resume.interests.length > 0 && (
        <>
          <div style={s.divider}>{DASHES}</div>
          <div className="cv-section-title" style={s.sectionTitle}>
            <span style={s.commentPrefix}>## </span>INTERETS
          </div>
          <div style={s.entry}>
            {resume.interests.map((item, i) => (
              <span key={i} style={s.tag}>{item.name}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
