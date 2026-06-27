import { usePdfMode } from "@/lib/pdf-context";
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

const BLACK = "#111111";
const RED = "#D62828";
const WHITE = "#FFFFFF";
const MUTED = "#888888";

// Sidebar width: 200px screen = ~53mm on A4
const SIDEBAR_W_PDF = "53mm";
const SIDEBAR_W_PX = "200px";

const s = {
  page: {
    fontFamily: "'Barlow', 'Arial', sans-serif",
    color: BLACK,
    display: "flex" as const,
    maxWidth: "210mm",
    minHeight: "297mm",
    fontSize: "12px",
    lineHeight: 1.4,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  pagePdf: {
    fontFamily: "'Barlow', 'Arial', sans-serif",
    color: BLACK,
    maxWidth: "210mm",
    fontSize: "12px",
    lineHeight: 1.4,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  sidebar: {
    width: SIDEBAR_W_PX,
    minWidth: SIDEBAR_W_PX,
    backgroundColor: BLACK,
    padding: "24px 14px",
    color: WHITE,
    flexShrink: 0,
  } as React.CSSProperties,
  sidebarPdf: {
    width: SIDEBAR_W_PDF,
    backgroundColor: BLACK,
    padding: "24px 12px",
    color: WHITE,
    boxSizing: "border-box" as const,
    minHeight: "297mm",
  } as React.CSSProperties,
  main: {
    flex: 1,
    padding: "24px 18px",
    backgroundColor: WHITE,
  } as React.CSSProperties,
  mainPdf: {
    padding: "24px 18px",
    backgroundColor: WHITE,
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  name: {
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    fontSize: "28px",
    fontWeight: 800,
    textTransform: "uppercase" as const,
    color: WHITE,
    lineHeight: 1.0,
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  } as React.CSSProperties,
  sideLabel: {
    fontSize: "11px",
    color: "#AAAAAA",
    marginBottom: "14px",
    lineHeight: 1.4,
  } as React.CSSProperties,
  sideSectionTitle: {
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    color: RED,
    marginBottom: "8px",
    marginTop: "24px",
  } as React.CSSProperties,
  sideContactItem: {
    fontSize: "11px",
    color: "#CCCCCC",
    marginBottom: "4px",
    wordBreak: "break-all" as const,
  } as React.CSSProperties,
  sideDivider: {
    height: "1px",
    backgroundColor: "#333333",
    margin: "16px 0",
  } as React.CSSProperties,
  sideSkillName: {
    fontSize: "12px",
    fontWeight: 700,
    color: WHITE,
    marginBottom: "2px",
  } as React.CSSProperties,
  sideSkillKw: {
    fontSize: "10px",
    color: "#AAAAAA",
    marginBottom: "8px",
  } as React.CSSProperties,
  sideLang: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: WHITE,
    marginBottom: "4px",
  } as React.CSSProperties,
  sideLangLevel: {
    color: RED,
    fontWeight: 600,
  } as React.CSSProperties,
  sectionBand: {
    backgroundColor: RED,
    color: WHITE,
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "3px",
    padding: "4px 0 4px 12px",
    marginBottom: "10px",
    marginTop: "10px",
  } as React.CSSProperties,
  entryTitle: {
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    fontSize: "15px",
    fontWeight: 700,
    color: BLACK,
    textTransform: "uppercase" as const,
    marginBottom: "1px",
  } as React.CSSProperties,
  entryDate: {
    fontSize: "11px",
    color: RED,
    fontWeight: 700,
    marginBottom: "2px",
  } as React.CSSProperties,
  entryMeta: {
    fontSize: "11px",
    color: MUTED,
    marginBottom: "6px",
    borderLeft: `3px solid ${RED}`,
    paddingLeft: "8px",
  } as React.CSSProperties,
  text: {
    fontSize: "12px",
    color: "#333333",
    marginBottom: "4px",
  } as React.CSSProperties,
  bullet: {
    fontSize: "12px",
    color: "#333333",
    paddingLeft: "14px",
    marginBottom: "2px",
    position: "relative" as const,
  } as React.CSSProperties,
  summary: {
    fontSize: "12px",
    color: "#333333",
    lineHeight: 1.7,
    borderLeft: `4px solid ${BLACK}`,
    paddingLeft: "12px",
    marginBottom: "4px",
    fontStyle: "italic" as const,
  } as React.CSSProperties,
};

export function SwissTheme({ resume }: { resume: Resume }) {
  const pdfMode = usePdfMode();
  const b = resume.basics;
  const contactItems = [b.email, b.phone, b.url].filter(Boolean) as string[];

  return (
    <div style={pdfMode ? s.pagePdf : s.page}>
      <div className={pdfMode ? "cv-running-sidebar" : undefined} style={pdfMode ? s.sidebarPdf : s.sidebar}>
        {b.name && (
          <div style={s.name}>
            {b.name.split(" ").map((word, i) => <div key={i}>{word}</div>)}
          </div>
        )}
        {b.label && <div style={s.sideLabel}>{b.label}</div>}

        {b.location?.city && (
          <>
            <div style={s.sideDivider} />
            <div style={s.sideContactItem}>{b.location.city}{b.location.countryCode ? `, ${b.location.countryCode}` : ""}</div>
          </>
        )}
        {contactItems.length > 0 && (
          <>
            <div style={s.sideSectionTitle}>Contact</div>
            {contactItems.map((item, i) => <div key={i} style={s.sideContactItem}>{item}</div>)}
          </>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <>
            <div style={s.sideSectionTitle}>Competences</div>
            {resume.skills.map((sk, i) => (
              <div key={i}>
                <div style={s.sideSkillName}>{sk.name}</div>
                {sk.keywords && sk.keywords.length > 0 && (
                  <div style={s.sideSkillKw}>{sk.keywords.join(" / ")}</div>
                )}
              </div>
            ))}
          </>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <>
            <div style={s.sideSectionTitle}>Langues</div>
            {resume.languages.map((l, i) => (
              <div key={i} style={s.sideLang}>
                <span>{l.language}</span>
                <span style={s.sideLangLevel}>{l.fluency}</span>
              </div>
            ))}
          </>
        )}

        {resume.interests && resume.interests.length > 0 && (
          <>
            <div style={s.sideSectionTitle}>Interets</div>
            {resume.interests.map((item, i) => (
              <div key={i} style={s.sideContactItem}>{item.name}</div>
            ))}
          </>
        )}
      </div>

      <div style={pdfMode ? s.mainPdf : s.main}>
        {b.summary && <p style={s.summary}>{b.summary}</p>}

        {resume.work && resume.work.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Experience</div>
            {resume.work.map((w, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "18px" }}>
                <div style={s.entryTitle}>{w.position}</div>
                <div style={s.entryDate}>{dateRange(w.startDate, w.endDate)}</div>
                <div style={s.entryMeta}>{w.name}{w.location ? ` - ${w.location}` : ""}</div>
                {w.summary && <p style={s.text}>{w.summary}</p>}
                {w.highlights && w.highlights.map((h, j) => (
                  <div key={j} style={s.bullet}>
                    <span style={{ position: "absolute", left: 0, color: RED, fontWeight: 700 }}>/</span> {h}
                  </div>
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
                <div style={s.entryTitle}>{e.studyType}{e.area ? ` - ${e.area}` : ""}</div>
                <div style={s.entryDate}>{dateRange(e.startDate, e.endDate)}</div>
                <div style={s.entryMeta}>{e.institution}{e.score ? ` - ${e.score}` : ""}</div>
              </div>
            ))}
          </>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Projets</div>
            {resume.projects.map((p, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
                <div style={s.entryTitle}>{p.name}</div>
                <div style={s.entryDate}>{dateRange(p.startDate, p.endDate)}</div>
                {p.description && <p style={s.text}>{p.description}</p>}
                {p.keywords && p.keywords.length > 0 && (
                  <div style={{ ...s.text, color: MUTED }}>{p.keywords.join(" / ")}</div>
                )}
              </div>
            ))}
          </>
        )}

        {resume.certificates && resume.certificates.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Certifications</div>
            {resume.certificates.map((c, i) => (
              <div key={i} className="cv-entry" style={{ ...s.text, marginBottom: "6px" }}>
                <strong>{c.name}</strong> / {c.issuer} / {formatDate(c.date)}
              </div>
            ))}
          </>
        )}

        {resume.awards && resume.awards.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Recompenses</div>
            {resume.awards.map((a, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "8px" }}>
                <div style={s.entryTitle}>{a.title}</div>
                <div style={s.entryDate}>{formatDate(a.date)}</div>
                <div style={s.entryMeta}>{a.awarder}</div>
              </div>
            ))}
          </>
        )}

        {resume.volunteer && resume.volunteer.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Benevolat</div>
            {resume.volunteer.map((v, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: "14px" }}>
                <div style={s.entryTitle}>{v.position}</div>
                <div style={s.entryDate}>{dateRange(v.startDate, v.endDate)}</div>
                <div style={s.entryMeta}>{v.organization}</div>
                {v.summary && <p style={s.text}>{v.summary}</p>}
              </div>
            ))}
          </>
        )}

        {resume.publications && resume.publications.length > 0 && (
          <>
            <div className="cv-section-title" style={s.sectionBand}>Publications</div>
            {resume.publications.map((p, i) => (
              <div key={i} className="cv-entry" style={{ ...s.text, marginBottom: "6px" }}>
                <strong>{p.name}</strong>
                {p.publisher ? ` / ${p.publisher}` : ""}
                {p.releaseDate ? ` / ${formatDate(p.releaseDate)}` : ""}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
