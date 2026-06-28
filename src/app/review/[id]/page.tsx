"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import type { ReviewResult } from "@/lib/ai/review";
import {
  RefreshCw,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Sparkles,
  ClipboardList,
  Zap,
  Eye,
  Target,
  LayoutTemplate,
  ThumbsUp,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

function getGrade(score: number) {
  if (score >= 90) return { grade: "A", label: "Excellent !", gradient: "from-emerald-500 to-teal-400" };
  if (score >= 80) return { grade: "B", label: "Très bien !", gradient: "from-blue-500 to-cyan-400" };
  if (score >= 70) return { grade: "C", label: "Bien !", gradient: "from-violet-500 to-purple-400" };
  if (score >= 60) return { grade: "D", label: "À améliorer", gradient: "from-amber-500 to-orange-400" };
  return { grade: "F", label: "Besoin de travail", gradient: "from-rose-500 to-red-400" };
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-500";
  return "text-rose-600";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-rose-500";
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
    default:
      return <Lightbulb className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />;
  }
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  completeness: { label: "Complétude", icon: <ClipboardList className="w-4 h-4" />, color: "text-indigo-500" },
  impact: { label: "Impact", icon: <Zap className="w-4 h-4" />, color: "text-amber-500" },
  clarity: { label: "Clarté", icon: <Eye className="w-4 h-4" />, color: "text-cyan-500" },
  relevance: { label: "Pertinence", icon: <Target className="w-4 h-4" />, color: "text-rose-500" },
  formatting: { label: "Formatage", icon: <LayoutTemplate className="w-4 h-4" />, color: "text-purple-500" },
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [themeId, setThemeId] = useState<ThemeId>("modern");
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setResume(data.data as Resume);
        setThemeId((data.theme as ThemeId) || "modern");
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  async function runReview() {
    setReviewing(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });
      const data = await res.json();
      setReview(data);
    } catch {
      console.error("Review failed");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!resume) {
    return <div className="flex items-center justify-center h-screen">CV non trouvé</div>;
  }

  const navActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${id}`)}>
        Editer
      </Button>
      <Button size="sm" onClick={runReview} disabled={reviewing} className="gap-1.5">
        <RefreshCw className={`w-4 h-4 ${reviewing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{reviewing ? "Analyse en cours..." : "Relancer"}</span>
      </Button>
    </div>
  );

  const grade = review ? getGrade(review.overallScore) : null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar showBack backHref={`/editor/${id}`} title="Revue du CV" actions={navActions} />

      <div className="flex flex-1 gap-4 px-4 pb-4 pt-2 min-h-0">
        <div className="flex-shrink-0 overflow-auto rounded-lg border bg-card shadow-sm" style={{ width: "210mm" }}>
          <div style={{ minHeight: "297mm" }}>
            <ThemeRenderer resume={resume} themeId={themeId} />
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-3">
          {!review ? (
            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Analyse IA de votre CV</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
                  Obtenez un score détaillé, identifiez vos points forts et recevez des suggestions personnalisées.
                </p>
                <Button
                  onClick={runReview}
                  disabled={reviewing}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white border-0 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyser mon CV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Score global */}
              <div className={`rounded-2xl bg-gradient-to-br ${grade!.gradient} p-5 text-white shadow-lg`}>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center shadow-inner">
                    <span className="text-4xl font-black leading-none">{grade!.grade}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/80 text-sm font-semibold">{grade!.label}</p>
                      <span className="text-2xl font-bold tabular-nums">{review.overallScore}<span className="text-base font-normal opacity-70">/100</span></span>
                    </div>
                    <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-700"
                        style={{ width: `${review.overallScore}%` }}
                      />
                    </div>
                    <p className="text-white/75 text-xs mt-2.5 leading-snug line-clamp-3">{review.summary}</p>
                  </div>
                </div>
              </div>

              {/* Points forts */}
              {review.strengths && review.strengths.length > 0 && (
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                      <ThumbsUp className="w-4 h-4 fill-emerald-200" />
                      Points forts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-4 pb-4">
                    {review.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-emerald-800 leading-snug">{s}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Catégories */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Détail par catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  {Object.entries(review.categories).map(([key, cat]) => {
                    const cfg = categoryConfig[key];
                    const score = (cat as { score: number; details: string }).score;
                    const details = (cat as { score: number; details: string }).details;
                    const pct = score * 5;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`flex items-center gap-1.5 text-sm font-semibold ${cfg?.color ?? "text-foreground"}`}>
                            {cfg?.icon}
                            <span>{cfg?.label ?? key}</span>
                          </div>
                          <span className={`text-sm font-bold tabular-nums ${getScoreTextColor(pct)}`}>{score}<span className="font-normal opacity-60">/20</span></span>
                        </div>
                        <Progress value={pct} className="h-2" indicatorClassName={getBarColor(pct)} />
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">{details}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Suggestions */}
              {review.suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-100" />
                      Suggestions
                      <span className="ml-auto text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
                        {review.suggestions.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {review.suggestions.map((s, i) => {
                      const isC = s.severity === "critical";
                      const isW = s.severity === "warning";
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border ${
                            isC
                              ? "bg-rose-50 border-rose-200"
                              : isW
                                ? "bg-amber-50 border-amber-200"
                                : "bg-sky-50 border-sky-200"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {getSeverityIcon(s.severity)}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    isC
                                      ? "bg-rose-100 text-rose-700"
                                      : isW
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-sky-100 text-sky-700"
                                  }`}
                                >
                                  {isC ? "Critique" : isW ? "Attention" : "Conseil"}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">{s.section}</span>
                              </div>
                              <p className="text-sm leading-snug">{s.message}</p>
                              {s.rewrite && (
                                <div className="mt-2.5 space-y-1.5">
                                  <div className="text-xs bg-white/80 p-2.5 rounded-lg border border-rose-200">
                                    <span className="font-bold text-rose-600 block mb-1">✗ Avant</span>
                                    <span className="text-muted-foreground leading-snug">{s.rewrite.original}</span>
                                  </div>
                                  <div className="text-xs bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                                    <span className="font-bold text-emerald-600 block mb-1">✓ Après</span>
                                    <span className="text-muted-foreground leading-snug">{s.rewrite.improved}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
