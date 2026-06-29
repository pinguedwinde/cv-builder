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
  AlertTriangle, XCircle, Sparkles, History,
  Download, Check,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AIProviderBadge } from "@/components/AIProviderSettings";

interface MatchRecord {
  id: string;
  resumeId: string;
  jobTitle: string | null;
  matchScore: number;
  version: number;
  data: MatchResult;
  createdAt: string;
}

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
  const [jobTitle, setJobTitle] = useState("");
  const [optimize, setOptimize] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [activeVersion, setActiveVersion] = useState<number | null>(null);
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    async function load() {
      try {
        const [resumeRes, matchesRes] = await Promise.all([
          fetch(`/api/resumes/${id}`),
          fetch(`/api/matches/${id}`),
        ]);
        if (!resumeRes.ok) throw new Error("Not found");
        const data = await resumeRes.json();
        setResume(data.data as Resume);
        setThemeId((data.theme as ThemeId) || "modern");

        if (matchesRes.ok) {
          const { latest, history } = await matchesRes.json();
          if (latest) {
            setMatchResult(latest.data as MatchResult);
            setActiveVersion(latest.version);
          }
          setMatchHistory(history ?? []);
        }
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
          jobTitle: jobTitle.trim() || null,
          optimize,
        }),
      });
      const data = await res.json();
      setMatchResult(data);
      if (data.optimizedResume) {
        setOptimizedResume(data.optimizedResume);
      }

      // Reload history
      const matchesRes = await fetch(`/api/matches/${id}`);
      if (matchesRes.ok) {
        const { history } = await matchesRes.json();
        setMatchHistory(history ?? []);
        if (history?.[0]) setActiveVersion(history[0].version);
      }
    } catch {
      console.error("Match failed");
    } finally {
      setMatching(false);
    }
  }

  function selectVersion(record: MatchRecord) {
    setMatchResult(record.data as MatchResult);
    setActiveVersion(record.version);
  }

  async function exportPdf() {
    if (pdfState !== "idle") return;
    setPdfState("loading");
    try {
      const res = await fetch(`/api/export/match-pdf?resumeId=${id}`);
      if (!res.ok) throw new Error("PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matching-${resume?.basics?.name || "cv"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 2500);
    } catch (err) {
      console.error("PDF export error:", err);
      setPdfState("idle");
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreBadgeStyle(score: number): string {
    if (score >= 75) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!resume) {
    return <div className="flex items-center justify-center h-screen">CV non trouvé</div>;
  }

  const navActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportPdf}
        disabled={pdfState !== "idle" || !matchResult}
        className="gap-1.5"
      >
        {pdfState === "loading" ? (
          <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
        ) : pdfState === "done" ? (
          <Check className="w-3 h-3" />
        ) : (
          <Download className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">
          {pdfState === "loading" ? "Export..." : pdfState === "done" ? "OK" : "Exporter PDF"}
        </span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${id}`)}>
        Editer le CV
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar showBack backHref={`/editor/${id}`} title="Matching CV / Poste" actions={navActions} />

      <div className="flex flex-1 gap-4 px-4 pb-4 pt-2 min-h-0">
        <div className="w-1/2 flex flex-col gap-4 min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" /> Offre d&apos;emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-3 min-h-0 overflow-hidden">
              <div className="flex gap-2 shrink-0">
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
                  placeholder="Collez le texte de l'offre d'emploi ici..."
                  className="flex-1 resize-none text-xs min-h-0"
                />
              ) : (
                <Input
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="shrink-0"
                />
              )}

              <div className="shrink-0 space-y-3">
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Titre du poste (optionnel, ex: Chef de Projet)"
                  className="text-xs"
                />

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
              </div>
            </CardContent>
          </Card>

          <div className="overflow-auto space-y-4 shrink-0">

          {matchHistory.length > 0 && (
            <Card className="border-muted">
              <CardContent className="py-2.5 px-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
                    <History className="w-3.5 h-3.5" />
                    Historique
                  </div>
                  {[...matchHistory].reverse().map((m) => {
                    const isActive = m.version === activeVersion;
                    const badgeStyle = getScoreBadgeStyle(m.matchScore);
                    const label = m.jobTitle || `Analyse #${m.version}`;
                    return (
                      <button
                        key={m.id}
                        onClick={() => selectVersion(m)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                          isActive
                            ? `${badgeStyle} font-bold ring-2 ring-offset-1 ring-current/30`
                            : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/50"
                        }`}
                        title={`${new Date(m.createdAt).toLocaleString("fr-FR")}${m.jobTitle ? ` — ${m.jobTitle}` : ""}`}
                      >
                        <span className="font-bold">{m.matchScore}%</span>
                        <span className="max-w-[80px] truncate opacity-80">{label}</span>
                        <span className="opacity-60">v{m.version}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {matchResult && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span>Score: <span className={`text-2xl ${getScoreColor(matchResult.matchScore)}`}>{matchResult.matchScore}%</span></span>
                    <AIProviderBadge provider={matchResult.provider} />
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
        </div>

        <div className="w-1/2 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-2 text-center text-muted-foreground shrink-0">CV actuel</h3>
            <div className="flex-1 bg-card rounded-lg shadow-sm border overflow-auto">
              <div style={{ width: "210mm", minHeight: "297mm" }}>
                <ThemeRenderer resume={resume} themeId={themeId} />
              </div>
            </div>
          </div>

          {optimizedResume && (
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-semibold mb-2 text-center text-green-600 shrink-0">CV optimisé</h3>
              <div className="flex-1 bg-card rounded-lg shadow-sm border overflow-auto ring-2 ring-green-200">
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
