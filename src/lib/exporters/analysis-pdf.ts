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
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.5;
    color: #1e293b;
    background: white;
    padding: 14mm 16mm;
    width: 210mm;
  }
  h1 { font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 2mm; }
  h2 { font-size: 10pt; font-weight: 700; color: #0f172a; margin-bottom: 3mm; }
  p { margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10mm; border-bottom: 2px solid #e2e8f0; padding-bottom: 6mm; }
  .badge { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 3mm; color: white; text-align: center; }
  .score-bar-track { height: 3mm; background: #e2e8f0; border-radius: 2mm; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 2mm; }
  .section { margin-bottom: 6mm; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3mm; padding: 5mm 6mm; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
  .tag { display: inline-block; font-size: 7.5pt; padding: 1mm 3mm; border-radius: 5mm; font-weight: 500; }
  .footer { margin-top: 8mm; border-top: 1px solid #e2e8f0; padding-top: 3mm; display: flex; justify-content: space-between; font-size: 7pt; color: #94a3b8; }
  .page-break-inside-avoid { page-break-inside: avoid; }
`;

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

function renderSuggestion(s: ReviewSuggestion, i: number): string {
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
    <div style="background:${bg};border:1px solid ${border};border-radius:2mm;padding:3mm 4mm;margin-bottom:2.5mm;" class="page-break-inside-avoid">
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

  const strengths = review.strengths && review.strengths.length > 0
    ? `<div class="section">
        <h2 style="color:#059669;">✓ Points forts</h2>
        <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:2mm;padding:4mm 5mm;">
          ${review.strengths.map(s => `<div style="display:flex;gap:2mm;margin-bottom:1.5mm;"><span style="color:#10b981;flex-shrink:0;">★</span><span style="font-size:8.5pt;color:#065f46;">${esc(s)}</span></div>`).join("")}
        </div>
      </div>`
    : "";

  const categories = Object.entries(review.categories).map(([key, cat]) => {
    const c = cat as { score: number; details: string };
    const pct = c.score * 5;
    const bc = barColor(pct);
    return `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:2mm;padding:3.5mm 4mm;">
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

  const suggestions = review.suggestions.length > 0
    ? `<div class="section">
        <h2>Suggestions (${review.suggestions.length})</h2>
        ${review.suggestions.map((s, i) => renderSuggestion(s, i)).join("")}
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

  <div class="section card">
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

  ${strengths}

  <div class="section">
    <h2>Détail par catégorie</h2>
    <div class="grid-2">${categories}</div>
  </div>

  ${suggestions}

  <div class="footer">
    <span>CV Builder — Analyse IA</span>
    <span>${generatedAt}</span>
  </div>
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
    <div style="display:flex;gap:2mm;align-items:flex-start;background:${bg};border:1px solid ${border};border-radius:2mm;padding:2.5mm 3.5mm;margin-bottom:2mm;">
      <span style="color:${color};font-weight:700;flex-shrink:0;">${icon}</span>
      <span style="font-size:8.5pt;color:#1e293b;">${esc(g.description)}</span>
    </div>`;
}

function renderMatchSuggestion(s: MatchSuggestion): string {
  return `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:2mm;padding:3mm 4mm;margin-bottom:2.5mm;" class="page-break-inside-avoid">
      <span style="font-size:7pt;font-weight:700;color:#1d4ed8;text-transform:uppercase;display:block;margin-bottom:1mm;">${esc(s.section)}</span>
      <p style="font-size:8.5pt;color:#1e293b;font-weight:500;margin-bottom:1mm;">${esc(s.action)}</p>
      <p style="font-size:8pt;color:#64748b;">${esc(s.reason)}</p>
    </div>`;
}

export function buildMatchHtml(
  match: MatchResult,
  candidateName: string,
  jobTitle: string | null,
  generatedAt: string
): string {
  const sc = scoreColor(match.matchScore);
  const scoreLabel = match.matchScore >= 75 ? "Excellent" : match.matchScore >= 50 ? "Moyen" : "Faible";

  const skills = match.matchedSkills.length > 0
    ? `<div class="section">
        <h2 style="color:#059669;">✓ Compétences correspondantes (${match.matchedSkills.length})</h2>
        <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:2mm;padding:4mm 5mm;display:flex;flex-wrap:wrap;gap:2mm;">
          ${match.matchedSkills.map(s => `<span class="tag" style="background:#dcfce7;color:#166534;border:1px solid #86efac;">${esc(s)}</span>`).join("")}
        </div>
      </div>`
    : "";

  const gaps = match.gaps.length > 0
    ? `<div class="section">
        <h2 style="color:#dc2626;">⚠ Points manquants (${match.gaps.length})</h2>
        ${match.gaps.map(g => renderGap(g)).join("")}
      </div>`
    : "";

  const suggestions = match.suggestions.length > 0
    ? `<div class="section">
        <h2>Suggestions d'amélioration</h2>
        ${match.suggestions.map(s => renderMatchSuggestion(s)).join("")}
      </div>`
    : "";

  const optimized = match.optimizedSummary
    ? `<div class="section">
        <h2>Résumé optimisé proposé</h2>
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:2mm;padding:4mm 5mm;">
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

  <div class="section card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5mm;">
      <span style="font-size:9pt;font-weight:600;color:#334155;">Score de correspondance</span>
      <span style="font-size:11pt;font-weight:700;color:${sc};">${match.matchScore}%</span>
    </div>
    <div class="score-bar-track" style="margin-bottom:3mm;">
      <div class="score-bar-fill" style="width:${match.matchScore}%;background:${sc};"></div>
    </div>
    <p style="font-size:8.5pt;color:#475569;line-height:1.6;">${esc(match.summary)}</p>
  </div>

  ${skills}
  ${gaps}
  ${suggestions}
  ${optimized}

  <div class="footer">
    <span>CV Builder — Analyse IA</span>
    <span>${generatedAt}</span>
  </div>
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
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
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
): Promise<Buffer> {
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const html = buildMatchHtml(match, candidateName, jobTitle, generatedAt);
  return renderHtmlToPdf(html);
}
