"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ReviewResult } from "@/lib/ai/review";
import type { Resume } from "@/lib/schemas/resume";

function getGrade(score: number) {
  if (score >= 90) return { grade: "A", label: "Excellent", color: "#10b981" };
  if (score >= 80) return { grade: "B", label: "Très bien", color: "#3b82f6" };
  if (score >= 70) return { grade: "C", label: "Bien", color: "#8b5cf6" };
  if (score >= 60) return { grade: "D", label: "À améliorer", color: "#f59e0b" };
  return { grade: "F", label: "Besoin de travail", color: "#ef4444" };
}

function getBarColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

const categoryLabels: Record<string, string> = {
  completeness: "Complétude",
  impact: "Impact",
  clarity: "Clarté",
  relevance: "Pertinence",
  formatting: "Formatage",
};

function ReviewPdfContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const [review, setReview] = useState<ReviewResult | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [generatedAt] = useState(() => new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }));

  useEffect(() => {
    if (!resumeId) return;
    Promise.all([
      fetch(`/api/resumes/${resumeId}`).then((r) => r.json()),
      fetch(`/api/reviews/${resumeId}`).then((r) => r.json()),
    ]).then(([resumeData, reviewData]) => {
      setResume(resumeData.data as Resume);
      if (reviewData.latest) {
        setReview(reviewData.latest.data as ReviewResult);
      }
    }).catch(console.error);
  }, [resumeId]);

  useEffect(() => {
    if (!review || !resume) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        (window as unknown as Record<string, unknown>).__PDF_READY__ = true;
        window.dispatchEvent(new CustomEvent("pdf-render-ready"));
      });
    });
  }, [review, resume]);

  if (!review || !resume) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#999", fontFamily: "sans-serif" }}>
        Chargement...
      </div>
    );
  }

  const gradeInfo = getGrade(review.overallScore);
  const candidateName = resume.basics?.name || "Candidat";

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
              Revue de CV
            </h1>
            <p style={{ margin: 0, fontSize: "10pt", color: "#64748b" }}>{candidateName}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "20mm",
                height: "20mm",
                borderRadius: "4mm",
                backgroundColor: gradeInfo.color,
                color: "white",
              }}
            >
              <span style={{ fontSize: "20pt", fontWeight: 900, lineHeight: 1 }}>{gradeInfo.grade}</span>
            </div>
            <p style={{ margin: "2mm 0 0 0", fontSize: "8pt", color: "#94a3b8" }}>{generatedAt}</p>
          </div>
        </div>
      </div>

      {/* ── Score global ── */}
      <div
        style={{
          marginBottom: "6mm",
          backgroundColor: "#f8fafc",
          borderRadius: "3mm",
          padding: "5mm 6mm",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5mm", marginBottom: "3mm" }}>
          <span style={{ fontSize: "11pt", fontWeight: 700, color: "#0f172a" }}>Score global</span>
          <span style={{ fontSize: "18pt", fontWeight: 900, color: gradeInfo.color }}>
            {review.overallScore}<span style={{ fontSize: "10pt", color: "#94a3b8", fontWeight: 400 }}>/100</span>
          </span>
          <span
            style={{
              fontSize: "8pt",
              fontWeight: 600,
              color: gradeInfo.color,
              backgroundColor: `${gradeInfo.color}18`,
              padding: "1mm 3mm",
              borderRadius: "10mm",
              border: `1px solid ${gradeInfo.color}40`,
            }}
          >
            {gradeInfo.label}
          </span>
        </div>
        <div style={{ height: "3mm", backgroundColor: "#e2e8f0", borderRadius: "2mm", overflow: "hidden" }}>
          <div
            style={{
              width: `${review.overallScore}%`,
              height: "100%",
              backgroundColor: gradeInfo.color,
              borderRadius: "2mm",
            }}
          />
        </div>
        <p style={{ margin: "3mm 0 0 0", fontSize: "8.5pt", color: "#475569", lineHeight: 1.6 }}>{review.summary}</p>
      </div>

      {/* ── Points forts ── */}
      {review.strengths && review.strengths.length > 0 && (
        <div style={{ marginBottom: "6mm" }}>
          <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#059669" }}>
            ✓ Points forts
          </h2>
          <div style={{ backgroundColor: "#f0fdf4", borderRadius: "2mm", padding: "4mm 5mm", border: "1px solid #a7f3d0" }}>
            {review.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "2mm", marginBottom: i < review.strengths!.length - 1 ? "1.5mm" : 0 }}>
                <span style={{ color: "#10b981", flexShrink: 0 }}>★</span>
                <span style={{ fontSize: "8.5pt", color: "#065f46" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Détail par catégorie ── */}
      <div style={{ marginBottom: "6mm" }}>
        <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#0f172a" }}>
          Détail par catégorie
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3mm" }}>
          {Object.entries(review.categories).map(([key, cat]) => {
            const catTyped = cat as { score: number; details: string };
            const pct = catTyped.score * 5;
            const barColor = getBarColor(pct);
            return (
              <div
                key={key}
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "2mm",
                  padding: "3.5mm 4mm",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5mm" }}>
                  <span style={{ fontSize: "8.5pt", fontWeight: 600, color: "#334155" }}>
                    {categoryLabels[key] ?? key}
                  </span>
                  <span style={{ fontSize: "9pt", fontWeight: 700, color: barColor }}>
                    {catTyped.score}<span style={{ fontSize: "7pt", color: "#94a3b8", fontWeight: 400 }}>/20</span>
                  </span>
                </div>
                <div style={{ height: "2mm", backgroundColor: "#e2e8f0", borderRadius: "1mm", overflow: "hidden", marginBottom: "1.5mm" }}>
                  <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barColor, borderRadius: "1mm" }} />
                </div>
                <p style={{ margin: 0, fontSize: "7.5pt", color: "#64748b", lineHeight: 1.4 }}>{catTyped.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Suggestions ── */}
      {review.suggestions.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 3mm 0", fontSize: "10pt", fontWeight: 700, color: "#0f172a" }}>
            Suggestions ({review.suggestions.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5mm" }}>
            {review.suggestions.map((s, i) => {
              const isC = s.severity === "critical";
              const isW = s.severity === "warning";
              const bgColor = isC ? "#fff1f2" : isW ? "#fffbeb" : "#f0f9ff";
              const borderColor = isC ? "#fecdd3" : isW ? "#fde68a" : "#bae6fd";
              const labelBg = isC ? "#ffe4e6" : isW ? "#fef3c7" : "#e0f2fe";
              const labelColor = isC ? "#be123c" : isW ? "#92400e" : "#0369a1";
              const label = isC ? "Critique" : isW ? "Attention" : "Conseil";
              const icon = isC ? "✗" : isW ? "⚠" : "i";
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "2mm",
                    padding: "3mm 4mm",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ display: "flex", gap: "2mm", alignItems: "flex-start" }}>
                    <span style={{ color: labelColor, fontWeight: 700, flexShrink: 0, fontSize: "9pt" }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "2mm", alignItems: "center", marginBottom: "1mm", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "7pt",
                            fontWeight: 700,
                            padding: "0.5mm 2mm",
                            borderRadius: "5mm",
                            backgroundColor: labelBg,
                            color: labelColor,
                          }}
                        >
                          {label}
                        </span>
                        <span style={{ fontSize: "7.5pt", color: "#64748b", fontWeight: 600 }}>{s.section}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "8pt", color: "#1e293b", lineHeight: 1.5 }}>{s.message}</p>
                      {s.rewrite && (
                        <div style={{ marginTop: "2mm", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm" }}>
                          <div style={{ backgroundColor: "white", borderRadius: "1.5mm", padding: "2mm 3mm", border: "1px solid #fca5a5" }}>
                            <span style={{ fontSize: "7pt", fontWeight: 700, color: "#dc2626", display: "block", marginBottom: "1mm" }}>✗ Avant</span>
                            <p style={{ margin: 0, fontSize: "7pt", color: "#64748b", lineHeight: 1.4 }}>{s.rewrite.original}</p>
                          </div>
                          <div style={{ backgroundColor: "white", borderRadius: "1.5mm", padding: "2mm 3mm", border: "1px solid #86efac" }}>
                            <span style={{ fontSize: "7pt", fontWeight: 700, color: "#16a34a", display: "block", marginBottom: "1mm" }}>✓ Après</span>
                            <p style={{ margin: 0, fontSize: "7pt", color: "#64748b", lineHeight: 1.4 }}>{s.rewrite.improved}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: "8mm", borderTop: "1px solid #e2e8f0", paddingTop: "3mm", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "7pt", color: "#94a3b8" }}>CV Builder — Analyse IA</span>
        <span style={{ fontSize: "7pt", color: "#94a3b8" }}>{generatedAt}</span>
      </div>
    </div>
  );
}

export default function ReviewPdfPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ReviewPdfContent />
    </Suspense>
  );
}
