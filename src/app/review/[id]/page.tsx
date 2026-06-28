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
import { RefreshCw, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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

  function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  }

  function getProgressColor(score: number): string {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "critical": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
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
      <Button size="sm" onClick={runReview} disabled={reviewing}>
        <RefreshCw className={`w-4 h-4 ${reviewing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{reviewing ? "Analyse..." : "Lancer la revue"}</span>
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar showBack backHref={`/editor/${id}`} title="Revue du CV" actions={navActions} />

      <div className="flex flex-1 gap-4 px-4 pb-4 pt-2 min-h-0">
        <div className="flex-1 overflow-auto rounded-lg border bg-card shadow-sm">
          <div style={{ width: "210mm", minHeight: "297mm" }}>
            <ThemeRenderer resume={resume} themeId={themeId} />
          </div>
        </div>

        <div className="flex-1 overflow-auto space-y-4">
          {!review ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Prêt pour la revue</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cliquez sur &quot;Lancer la revue&quot; pour analyser votre CV et obtenir un score détaillé.
                </p>
                <Button onClick={runReview} disabled={reviewing}>
                  <RefreshCw className={`w-4 h-4 ${reviewing ? "animate-spin" : ""}`} />
                  Lancer l&apos;analyse
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    Score Global
                    <span className={`text-3xl font-bold ${getScoreColor(review.overallScore)}`}>
                      {review.overallScore}/100
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={review.overallScore} className="h-3" indicatorClassName={getProgressColor(review.overallScore)} />
                  <p className="text-sm text-muted-foreground mt-3">{review.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Détails par catégorie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(review.categories).map(([key, cat]) => {
                    const labels: Record<string, string> = {
                      completeness: "Complétude",
                      impact: "Impact",
                      clarity: "Clarté",
                      relevance: "Pertinence",
                      formatting: "Formatage",
                    };
                    const score = (cat as { score: number; details: string }).score;
                    const details = (cat as { score: number; details: string }).details;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{labels[key] || key}</span>
                          <span className={getScoreColor(score * 5)}>{score}/20</span>
                        </div>
                        <Progress value={score * 5} className="h-2" indicatorClassName={getProgressColor(score * 5)} />
                        <p className="text-xs text-muted-foreground mt-0.5">{details}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {review.suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Suggestions ({review.suggestions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {review.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border-l-4 ${
                          s.severity === "critical"
                            ? "border-red-500 bg-red-50"
                            : s.severity === "warning"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-blue-500 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(s.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase text-muted-foreground bg-card px-1.5 py-0.5 rounded">
                                {s.section}
                              </span>
                            </div>
                            <p className="text-sm">{s.message}</p>
                            {s.rewrite && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs bg-card p-2 rounded border">
                                  <span className="font-semibold text-red-600">Avant: </span>
                                  <span className="text-muted-foreground">{s.rewrite.original}</span>
                                </div>
                                <div className="text-xs bg-card p-2 rounded border">
                                  <span className="font-semibold text-green-600">Après: </span>
                                  <span className="text-muted-foreground">{s.rewrite.improved}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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

