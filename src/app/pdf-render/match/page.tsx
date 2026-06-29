"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { MatchResult } from "@/lib/ai/matching";
import type { Resume } from "@/lib/schemas/resume";

function getScoreColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function MatchPdfContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [generatedAt] = useState(() =>
    new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  );

  useEffect(() => {
    if (!resumeId) return;
    Promise.all([
      fetch(`/api/resumes/${resumeId}`).then((r) => r.json()),
      fetch(`/api/matches/${resumeId}`).then((r) => r.json()),
    ])
      .then(([resumeData, matchData]) => {
        setResume(resumeData.data as Resume);
        if (matchData.latest) {
          setMatchResult(matchData.latest.data as MatchResult);
          setJobTitle(matchData.latest.jobTitle ?? null);
        }
      })
      .catch(console.error);
  }, [resumeId]);

  useEffect(() => {
    if (!matchResult || !resume) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        (window as unknown as Record<string, unknown>).__PDF_READY__ = true;
        window.dispatchEvent(new CustomEvent("pdf-render-ready"));
      });
    });
  }, [matchResult, resume]);

  if (!matchResult || !resume) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#999", fontFamily: "sans-serif" }}>
        Chargement...
      </div>
    );
  }

  const candidateName = resume.basics?.name || "Candidat";
  const scoreColor = getScoreColor(matchResult.matchScore);
  const scoreLabel =
    matchResult.matchScore >= 75
      ? "Excellent"
      : matchResult.matchScore >= 50
      ? "Moyen"
      : "Faible";

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "white",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#1e293b",
        padding: "14mm 16mm",
        boxSizing: "border-box",
        fontSize: "9pt",
        lineHeight: "1.5",
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: "10mm", borderBottom: "2px solid #e2e8f0", paddingBottom: "6mm" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: "0 0 2mm 0", fontSize: "16pt", fontWeight: 700, color: "#0f172a" }}>
              Analyse de Correspondance
            </h1>
            <p style={{ margin: "0 0 1mm 0", fontSize: "10pt", color: "#64748b" }}>{candidateName}</p>
            {jobTitle && (
              <p style={{ margin: 0, fontSize: "9pt", color: "#94a3b8" }}>Poste : {jobTitle}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "22mm",
                height: "16mm",
                borderRadius: "3mm",
                backgroundColor: scoreColor,
                color: "white",
              }}
            >
              <span style={{ fontSize: "18pt", fontWeight: 900, lineHeight: 1 }}>{matchResult.matchScore}%</span>
              <span style={{ fontSize: "7pt", opacity: 0.85 }}>{scoreLabel}</span>
            </div>
            <p style={{ margin: "2mm 0 0 0", fontSize: "8pt", color: "#94a3b8" }}>{generatedAt}</p>
          </div>
        </div>
      </div>

      {/* ── Score + résumé ── */}
      <div
        style={{
          marginBottom: "6mm",
          backgroundColor: "#f8fafc",
          borderRadius: "3mm",
          padding: "5mm 6mm",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "3mm" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5mm" }}>
            <span style={{ fontSize: "9pt", fontWeight: 600, color: "#334155" }}>Score de correspondance</span>
            <span style={{ fontSize: "11pt", fontWeight: 700, color: scoreColor }}>{matchResult.matchScore}%</span>
          </div>
          <div style={{ height: "3mm", backgroundColor: "#e2e8f0", borderRadius: "2mm", overflow: "hidden" }}>
            <div
              style={{
                width: `${matchResult.matchScore}%`,
                height: "100%",
                backgroundColor: scoreColor,
                borderRadius: "2mm",
              }}
            />
          </div>
        </div>
        <p style={{ margin: 0, fontSize: "8.5pt", color: "#475569", lineHeight: 1.6 }}>{matchResult.summary}</p>
      </div>

      {/* ── Compétences correspondantes ── */}
      {matchResult.matchedSkills.length > 0 && (
        <div style={{ marginBottom: "6mm" }}>
          <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#059669" }}>
            ✓ Compétences correspondantes ({matchResult.matchedSkills.length})
          </h2>
          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "2mm",
              padding: "4mm 5mm",
              border: "1px solid #a7f3d0",
              display: "flex",
              flexWrap: "wrap",
              gap: "2mm",
            }}
          >
            {matchResult.matchedSkills.map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: "7.5pt",
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  padding: "1mm 3mm",
                  borderRadius: "5mm",
                  border: "1px solid #86efac",
                  fontWeight: 500,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Points manquants ── */}
      {matchResult.gaps.length > 0 && (
        <div style={{ marginBottom: "6mm" }}>
          <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#dc2626" }}>
            ⚠ Points manquants ({matchResult.gaps.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            {matchResult.gaps.map((g, i) => {
              const isHigh = g.importance === "high";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "2mm",
                    alignItems: "flex-start",
                    backgroundColor: isHigh ? "#fff1f2" : "#fffbeb",
                    borderRadius: "2mm",
                    padding: "2.5mm 3.5mm",
                    border: `1px solid ${isHigh ? "#fecdd3" : "#fde68a"}`,
                  }}
                >
                  <span style={{ color: isHigh ? "#ef4444" : "#f59e0b", fontWeight: 700, flexShrink: 0 }}>
                    {isHigh ? "✗" : "⚠"}
                  </span>
                  <span style={{ fontSize: "8.5pt", color: "#1e293b" }}>{g.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      {matchResult.suggestions.length > 0 && (
        <div style={{ marginBottom: "6mm" }}>
          <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#0f172a" }}>
            Suggestions d&apos;amélioration
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5mm" }}>
            {matchResult.suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#eff6ff",
                  borderRadius: "2mm",
                  padding: "3mm 4mm",
                  border: "1px solid #bfdbfe",
                  pageBreakInside: "avoid",
                }}
              >
                <span
                  style={{
                    fontSize: "7pt",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "1mm",
                  }}
                >
                  {s.section}
                </span>
                <p style={{ margin: "0 0 1mm 0", fontSize: "8.5pt", color: "#1e293b", fontWeight: 500 }}>{s.action}</p>
                <p style={{ margin: 0, fontSize: "8pt", color: "#64748b" }}>{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Résumé optimisé ── */}
      {matchResult.optimizedSummary && (
        <div style={{ marginBottom: "6mm" }}>
          <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#0f172a" }}>
            Résumé optimisé proposé
          </h2>
          <div
            style={{
              backgroundColor: "#f5f3ff",
              borderRadius: "2mm",
              padding: "4mm 5mm",
              border: "1px solid #ddd6fe",
            }}
          >
            <p style={{ margin: 0, fontSize: "8.5pt", color: "#4c1d95", fontStyle: "italic", lineHeight: 1.6 }}>
              {matchResult.optimizedSummary}
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div
        style={{
          marginTop: "8mm",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "3mm",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "7pt", color: "#94a3b8" }}>CV Builder — Analyse IA</span>
        <span style={{ fontSize: "7pt", color: "#94a3b8" }}>{generatedAt}</span>
      </div>
    </div>
  );
}

export default function MatchPdfPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <MatchPdfContent />
    </Suspense>
  );
}
