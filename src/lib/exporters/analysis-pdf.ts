import { chromium } from "playwright";
import type { ReviewResult, ReviewSuggestion } from "@/lib/ai/review";
import type { MatchResult, MatchGap, MatchSuggestion } from "@/lib/ai/matching";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function barColor(pct: number): string {
  if (pct >= 80) return "#10b981";
  if (pct >= 60) return "#f59e0b";
  if (pct >= 40) return "#f97316";
  return "#ef4444";
}

const BASE_CSS = `
  @page {
    size: A4 portrait;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0; padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.5;
    color: #1e293b;
    background: white;
    /* horizontal padding only — top/bottom handled by Playwright margin */
    padding: 4mm 16mm;
    width: 210mm;
  }

  h1 {
    font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 2mm;
    break-after: avoid; page-break-after: avoid;
  }
  h2 {
    font-size: 10pt; font-weight: 700; color: #0f172a; margin-bottom: 3mm;
    break-after: avoid; page-break-after: avoid;
  }
  p { margin: 0; orphans: 3; widows: 3; }

  /* ── Layout atoms ── */
  .header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 10mm; border-bottom: 2px solid #e2e8f0; padding-bottom: 6mm;
    break-inside: avoid; page-break-inside: avoid;
    break-after: avoid;  page-break-after: avoid;
  }

  /* A section = h2 + its content. We group the heading with the first block
     so the heading is never left alone at the bottom of a page.            */
  .section { margin-bottom: 6mm; }
  .section-head {
    break-inside: avoid; page-break-inside: avoid;
  }
  .section-body { /* remaining items after the first */ }

  /* Cards and list items never break in the middle */
  .card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3mm; padding: 5mm 6mm;
    break-inside: avoid; page-break-inside: avoid;
  }
  .item {
    break-inside: avoid; page-break-inside: avoid;
    margin-bottom: 2.5mm;
  }
  .item:last-child { margin-bottom: 0; }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
  .grid-cell { break-inside: avoid; page-break-inside: avoid; }

  /* Misc */
  .badge {
    display: inline-flex; flex-direction: column; align-items: center;
    justify-content: center; border-radius: 3mm; color: white; text-align: center;
  }
  .score-bar-track { height: 3mm; background: #e2e8f0; border-radius: 2mm; overflow: hidden; }
  .score-bar-fill  { height: 100%; border-radius: 2mm; }
  .tag { display: inline-block; font-size: 7.5pt; padding: 1mm 3mm; border-radius: 5mm; font-weight: 500; }

  /* Strength / skill rows */
  .strength-row { display: flex; gap: 2mm; margin-bottom: 1.5mm; }
  .strength-row:last-child { margin-bottom: 0; }
`;

const FOOTER_TEMPLATE = `
  <div style="font-size:8px;color:#94a3b8;font-family:Helvetica,Arial,sans-serif;
              width:100%;padding:0 16mm;display:flex;justify-content:space-between;
              align-items:center;box-sizing:border-box;">
    <span>CV Builder — Analyse IA</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

// ─── Review HTML ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  completeness: "Complétude",
  impact: "Impact",
  clarity: "Clarté",
  relevance: "Pertinence",
  formatting: "Formatage",
};

function gradeInfo(score: number) {
  if (score >= 90) return { grade: "A", label: "Excellent", color: "#10b981" };
  if (score >= 80) return { grade: "B", label: "Très bien", color: "#3b82f6" };
  if (score >= 70) return { grade: "C", label: "Bien", color: "#8b5cf6" };
  if (score >= 60) return { grade: "D", label: "À améliorer", color: "#f59e0b" };
  return { grade: "F", label: "Besoin de travail", color: "#ef4444" };
}

function renderSuggestion(s: ReviewSuggestion): string {
  const isC = s.severity === "critical";
  const isW = s.severity === "warning";
  const bg = isC ? "#fff1f2" : isW ? "#fffbeb" : "#f0f9ff";
  const border = isC ? "#fecdd3" : isW ? "#fde68a" : "#bae6fd";
  const labelBg = isC ? "#ffe4e6" : isW ? "#fef3c7" : "#e0f2fe";
  const labelColor = isC ? "#be123c" : isW ? "#92400e" : "#0369a1";
  const label = isC ? "Critique" : isW ? "Attention" : "Conseil";
  const icon = isC ? "✗" : isW ? "⚠" : "i";

  const rewrite = s.rewrite
    ? `<div style="margin-top:2mm;display:grid;grid-template-columns:1fr 1fr;gap:2mm;">
        <div style="background:white;border-radius:1.5mm;padding:2mm 3mm;border:1px solid #fca5a5;">
          <span style="font-size:7pt;font-weight:700;color:#dc2626;display:block;margin-bottom:1mm;">✗ Avant</span>
          <p style="font-size:7pt;color:#64748b;line-height:1.4;">${esc(s.rewrite.original)}</p>
        </div>
        <div style="background:white;border-radius:1.5mm;padding:2mm 3mm;border:1px solid #86efac;">
          <span style="font-size:7pt;font-weight:700;color:#16a34a;display:block;margin-bottom:1mm;">✓ Après</span>
          <p style="font-size:7pt;color:#64748b;line-height:1.4;">${esc(s.rewrite.improved)}</p>
        </div>
      </div>`
    : "";

  return `
    <div class="item" style="background:${bg};border:1px solid ${border};border-radius:2mm;padding:3mm 4mm;">
      <div style="display:flex;gap:2mm;align-items:flex-start;">
        <span style="color:${labelColor};font-weight:700;flex-shrink:0;font-size:9pt;">${icon}</span>
        <div style="flex:1;">
          <div style="display:flex;gap:2mm;align-items:center;margin-bottom:1mm;flex-wrap:wrap;">
            <span style="font-size:7pt;font-weight:700;padding:0.5mm 2mm;border-radius:5mm;background:${labelBg};color:${labelColor};">${label}</span>
            <span style="font-size:7.5pt;color:#64748b;font-weight:600;">${esc(s.section)}</span>
          </div>
          <p style="font-size:8pt;color:#1e293b;line-height:1.5;">${esc(s.message)}</p>
          ${rewrite}
        </div>
      </div>
    </div>`;
}

export function buildReviewHtml(
  review: ReviewResult,
  candidateName: string,
  generatedAt: string
): string {
  const g = gradeInfo(review.overallScore);

  // Strengths: heading grouped with the first strength
  const strengthItems = review.strengths ?? [];
  const strengthsHtml = strengthItems.length > 0
    ? `<div class="section">
        <div class="section-head" style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:2mm;padding:4mm 5mm;">
          <h2 style="color:#059669;margin-bottom:2mm;">✓ Points forts</h2>
          ${strengthItems.map(s => `<div class="strength-row"><span style="color:#10b981;flex-shrink:0;">★</span><span style="font-size:8.5pt;color:#065f46;">${esc(s)}</span></div>`).join("")}
        </div>
      </div>`
    : "";

  // Categories grid — all cells avoid breaking, grid rows may break between rows
  const categoryItems = Object.entries(review.categories);
  const categoryCells = categoryItems.map(([key, cat]) => {
    const c = cat as { score: number; details: string };
    const pct = c.score * 5;
    const bc = barColor(pct);
    return `
      <div class="grid-cell" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:2mm;padding:3.5mm 4mm;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5mm;">
          <span style="font-size:8.5pt;font-weight:600;color:#334155;">${CATEGORY_LABELS[key] ?? key}</span>
          <span style="font-size:9pt;font-weight:700;color:${bc};">${c.score}<span style="font-size:7pt;color:#94a3b8;font-weight:400;">/20</span></span>
        </div>
        <div class="score-bar-track" style="margin-bottom:1.5mm;">
          <div class="score-bar-fill" style="width:${pct}%;background:${bc};"></div>
        </div>
        <p style="font-size:7.5pt;color:#64748b;line-height:1.4;">${esc(c.details)}</p>
      </div>`;
  }).join("");

  const categoriesHtml = `<div class="section">
    <div class="section-head">
      <h2>Détail par catégorie</h2>
      <div class="grid-2">${categoryCells}</div>
    </div>
  </div>`;

  // Suggestions: heading + first item grouped, rest in section-body
  const suggItems = review.suggestions;
  const suggestionsHtml = suggItems.length > 0
    ? `<div class="section">
        <div class="section-head">
          <h2>Suggestions (${suggItems.length})</h2>
          ${renderSuggestion(suggItems[0])}
        </div>
        ${suggItems.length > 1
          ? `<div class="section-body" style="margin-top:0;">${suggItems.slice(1).map(s => renderSuggestion(s)).join("")}</div>`
          : ""}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>${BASE_CSS}</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Revue de CV</h1>
      <p style="font-size:10pt;color:#64748b;">${esc(candidateName)}</p>
    </div>
    <div style="text-align:right;">
      <div class="badge" style="width:20mm;height:20mm;background:${g.color};">
        <span style="font-size:20pt;font-weight:900;line-height:1;">${g.grade}</span>
      </div>
      <p style="font-size:8pt;color:#94a3b8;margin-top:2mm;">${generatedAt}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-head card">
      <div style="display:flex;align-items:center;gap:5mm;margin-bottom:3mm;">
        <span style="font-size:11pt;font-weight:700;color:#0f172a;">Score global</span>
        <span style="font-size:18pt;font-weight:900;color:${g.color};">${review.overallScore}<span style="font-size:10pt;color:#94a3b8;font-weight:400;">/100</span></span>
        <span class="tag" style="background:${g.color}18;color:${g.color};border:1px solid ${g.color}40;">${g.label}</span>
      </div>
      <div class="score-bar-track" style="margin-bottom:3mm;">
        <div class="score-bar-fill" style="width:${review.overallScore}%;background:${g.color};"></div>
      </div>
      <p style="font-size:8.5pt;color:#475569;line-height:1.6;">${esc(review.summary)}</p>
    </div>
  </div>

  ${strengthsHtml}
  ${categoriesHtml}
  ${suggestionsHtml}
</body>
</html>`;
}

// ─── Match HTML ───────────────────────────────────────────────────────────────

function renderGap(g: MatchGap): string {
  const isHigh = g.importance === "high";
  const bg = isHigh ? "#fff1f2" : "#fffbeb";
  const border = isHigh ? "#fecdd3" : "#fde68a";
  const icon = isHigh ? "✗" : "⚠";
  const color = isHigh ? "#ef4444" : "#f59e0b";
  return `
    <div class="item" style="display:flex;gap:2mm;align-items:flex-start;background:${bg};border:1px solid ${border};border-radius:2mm;padding:2.5mm 3.5mm;">
      <span style="color:${color};font-weight:700;flex-shrink:0;">${icon}</span>
      <span style="font-size:8.5pt;color:#1e293b;">${esc(g.description)}</span>
    </div>`;
}

function renderMatchSuggestion(s: MatchSuggestion): string {
  return `
    <div class="item" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:2mm;padding:3mm 4mm;">
      <span style="font-size:7pt;font-weight:700;color:#1d4ed8;text-transform:uppercase;display:block;margin-bottom:1mm;">${esc(s.section)}</span>
      <p style="font-size:8.5pt;color:#1e293b;font-weight:500;margin-bottom:1mm;">${esc(s.action)}</p>
      <p style="font-size:8pt;color:#64748b;">${esc(s.reason)}</p>
    </div>`;
}

export function buildMatchHtml(
  match: MatchResult,
  candidateName: string,
  jobTitle: string | null,
  generatedAt: string,
  jobMeta?: { jobType?: string | null; jobUrl?: string | null; jobDescription?: string | null }
): string {
  const sc = scoreColor(match.matchScore);
  const scoreLabel = match.matchScore >= 75 ? "Excellent" : match.matchScore >= 50 ? "Moyen" : "Faible";

  // ── Source du poste block ──
  const jobSourceHtml = (() => {
    const hasSource = jobTitle || jobMeta?.jobUrl || jobMeta?.jobDescription;
    if (!hasSource) return "";
    const typeLabel = jobMeta?.jobType === "url" ? "🔗 URL" : jobMeta?.jobType === "pdf" ? "📄 PDF" : "📝 Texte";
    const urlPart = jobMeta?.jobUrl
      ? `<p style="font-size:8pt;color:#2563eb;margin-top:1mm;">${esc(jobMeta.jobUrl)}</p>`
      : "";
    const descPreview = !jobMeta?.jobUrl && jobMeta?.jobDescription
      ? `<p style="font-size:7.5pt;color:#64748b;margin-top:1.5mm;line-height:1.5;font-style:italic;">${esc(jobMeta.jobDescription.slice(0, 400))}${jobMeta.jobDescription.length > 400 ? "…" : ""}</p>`
      : "";
    return `<div class="section">
      <div class="section-head" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:2mm;padding:3.5mm 4.5mm;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5mm;">
          <h2 style="margin-bottom:0;">Source du poste</h2>
          <span style="font-size:7.5pt;color:#94a3b8;">${typeLabel}</span>
        </div>
        ${jobTitle ? `<p style="font-size:9pt;font-weight:600;color:#0f172a;">${esc(jobTitle)}</p>` : ""}
        ${urlPart}
        ${descPreview}
        <p style="font-size:7pt;color:#94a3b8;margin-top:1.5mm;">Analysé le ${generatedAt}</p>
      </div>
    </div>`;
  })();

  // Skills block — all tags in one card, no breaks needed inside
  const skillsHtml = match.matchedSkills.length > 0
    ? `<div class="section">
        <div class="section-head" style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:2mm;padding:4mm 5mm;">
          <h2 style="color:#059669;margin-bottom:3mm;">✓ Compétences correspondantes (${match.matchedSkills.length})</h2>
          <div style="display:flex;flex-wrap:wrap;gap:2mm;">
            ${match.matchedSkills.map(s => `<span class="tag" style="background:#dcfce7;color:#166534;border:1px solid #86efac;">${esc(s)}</span>`).join("")}
          </div>
        </div>
      </div>`
    : "";

  // Gaps: heading + first gap grouped
  const gapItems = match.gaps;
  const gapsHtml = gapItems.length > 0
    ? `<div class="section">
        <div class="section-head">
          <h2 style="color:#dc2626;">⚠ Points manquants (${gapItems.length})</h2>
          ${renderGap(gapItems[0])}
        </div>
        ${gapItems.length > 1
          ? `<div class="section-body">${gapItems.slice(1).map(g => renderGap(g)).join("")}</div>`
          : ""}
      </div>`
    : "";

  // Suggestions: heading + first suggestion grouped
  const suggItems = match.suggestions;
  const suggestionsHtml = suggItems.length > 0
    ? `<div class="section">
        <div class="section-head">
          <h2>Suggestions d'amélioration</h2>
          ${renderMatchSuggestion(suggItems[0])}
        </div>
        ${suggItems.length > 1
          ? `<div class="section-body">${suggItems.slice(1).map(s => renderMatchSuggestion(s)).join("")}</div>`
          : ""}
      </div>`
    : "";

  const optimizedHtml = match.optimizedSummary
    ? `<div class="section">
        <div class="section-head" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:2mm;padding:4mm 5mm;">
          <h2 style="margin-bottom:2mm;">Résumé optimisé proposé</h2>
          <p style="font-size:8.5pt;color:#4c1d95;font-style:italic;line-height:1.6;">${esc(match.optimizedSummary)}</p>
        </div>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>${BASE_CSS}</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Analyse de Correspondance</h1>
      <p style="font-size:10pt;color:#64748b;margin-bottom:1mm;">${esc(candidateName)}</p>
      ${jobTitle ? `<p style="font-size:9pt;color:#94a3b8;">Poste : ${esc(jobTitle)}</p>` : ""}
    </div>
    <div style="text-align:right;">
      <div class="badge" style="width:22mm;height:16mm;background:${sc};">
        <span style="font-size:18pt;font-weight:900;line-height:1;">${match.matchScore}%</span>
        <span style="font-size:7pt;opacity:0.85;">${scoreLabel}</span>
      </div>
      <p style="font-size:8pt;color:#94a3b8;margin-top:2mm;">${generatedAt}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-head card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5mm;">
        <span style="font-size:9pt;font-weight:600;color:#334155;">Score de correspondance</span>
        <span style="font-size:11pt;font-weight:700;color:${sc};">${match.matchScore}%</span>
      </div>
      <div class="score-bar-track" style="margin-bottom:3mm;">
        <div class="score-bar-fill" style="width:${match.matchScore}%;background:${sc};"></div>
      </div>
      <p style="font-size:8.5pt;color:#475569;line-height:1.6;">${esc(match.summary)}</p>
    </div>
  </div>

  ${jobSourceHtml}
  ${skillsHtml}
  ${gapsHtml}
  ${suggestionsHtml}
  ${optimizedHtml}
</body>
</html>`;
}

// ─── Playwright runner ────────────────────────────────────────────────────────

async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 794, height: 1122 });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      // Empty header — we only need a footer
      headerTemplate: "<span></span>",
      footerTemplate: FOOTER_TEMPLATE,
      // Top/bottom margins create space for the header/footer bands
      margin: { top: "14mm", right: "0", bottom: "14mm", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function generateReviewPdf(
  review: ReviewResult,
  candidateName: string,
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const html = buildReviewHtml(review, candidateName, generatedAt);
  return renderHtmlToPdf(html);
}

export async function generateMatchPdf(
  match: MatchResult,
  candidateName: string,
  jobTitle: string | null,
  jobMeta?: { jobType?: string | null; jobUrl?: string | null; jobDescription?: string | null }
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const html = buildMatchHtml(match, candidateName, jobTitle, generatedAt, jobMeta);
  return renderHtmlToPdf(html);
}
