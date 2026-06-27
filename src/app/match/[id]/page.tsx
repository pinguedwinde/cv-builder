"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import type { MatchResult } from "@/lib/ai/matching";
import {
  Link, FileText, Target, CheckCircle,
  AlertTriangle, XCircle, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [themeId, setThemeId] = useState<ThemeId>("modern");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [jobType, setJobType] = useState<"text" | "url">("text");
  const [jobContent, setJobContent] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [optimize, setOptimize] = useState(false);

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

  async function runMatch() {
    setMatching(true);
    setMatchResult(null);
    setOptimizedResume(null);
    try {
      const content = jobType === "url" ? jobUrl : jobContent;
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: id,
          jobType,
          jobContent: content,
          optimize,
        }),
      });
      const data = await res.json();
      setMatchResult(data);
      if (data.optimizedResume) {
        setOptimizedResume(data.optimizedResume);
      }
    } catch {
      console.error("Match failed");
    } finally {
      setMatching(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!resume) {
    return <div className="flex items-center justify-center h-screen">CV non trouvé</div>;
  }

  const navActions = (
    <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${id}`)}>
      Editer le CV
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar showBack backHref={`/editor/${id}`} title="Matching CV / Poste" actions={navActions} />

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <div className="w-1/3 space-y-4 overflow-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" /> Offre d&apos;emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={jobType === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setJobType("text")}
                  className="flex-1"
                >
                  <FileText className="w-3 h-3" /> Texte
                </Button>
                <Button
                  variant={jobType === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setJobType("url")}
                  className="flex-1"
                >
                  <Link className="w-3 h-3" /> URL
                </Button>
              </div>

              {jobType === "text" ? (
                <Textarea
                  value={jobContent}
                  onChange={(e) => setJobContent(e.target.value)}
                  rows={12}
                  placeholder="Collez le texte de l'offre d'emploi ici..."
                  className="text-xs"
                />
              ) : (
                <Input
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                />
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={optimize}
                  onChange={(e) => setOptimize(e.target.checked)}
                  className="rounded"
                />
                <Sparkles className="w-3 h-3" />
                Optimiser le CV (IA)
              </label>

              <Button
                onClick={runMatch}
                disabled={matching || (jobType === "text" ? !jobContent.trim() : !jobUrl.trim())}
                className="w-full"
              >
                {matching ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" /> Analyser la correspondance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {matchResult && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Score: <span className={`text-2xl ${getScoreColor(matchResult.matchScore)}`}>{matchResult.matchScore}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={matchResult.matchScore} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-3">{matchResult.summary}</p>
                </CardContent>
              </Card>

              {matchResult.matchedSkills.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" /> Compétences correspondantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.matchedSkills.map((s, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {matchResult.gaps.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" /> Points manquants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {matchResult.gaps.map((g, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {g.importance === "high" ? (
                          <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                        )}
                        <span>{g.description}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {matchResult.suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Suggestions d&apos;amélioration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {matchResult.suggestions.map((s, i) => (
                      <div key={i} className="p-2 bg-blue-50 rounded text-xs">
                        <span className="font-semibold uppercase text-blue-600">{s.section}</span>
                        <p className="mt-0.5">{s.action}</p>
                        <p className="text-muted-foreground mt-0.5">{s.reason}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {matchResult.optimizedSummary && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Résumé optimisé proposé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground italic">{matchResult.optimizedSummary}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="w-2/3 flex gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2 text-center text-muted-foreground">CV actuel</h3>
            <div className="bg-card rounded-lg shadow-sm border overflow-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
              <div style={{ width: "210mm", minHeight: "297mm" }}>
                <ThemeRenderer resume={resume} themeId={themeId} />
              </div>
            </div>
          </div>

          {optimizedResume && (
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-2 text-center text-green-600">CV optimisé</h3>
              <div className="bg-card rounded-lg shadow-sm border overflow-auto ring-2 ring-green-200" style={{ maxHeight: "calc(100vh - 160px)" }}>
                <div style={{ width: "210mm", minHeight: "297mm" }}>
                  <ThemeRenderer resume={optimizedResume} themeId={themeId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
