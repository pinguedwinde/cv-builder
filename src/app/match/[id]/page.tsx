"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeRenderer } from "@/components/themes/ThemeRenderer";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import type { MatchResult } from "@/lib/ai/matching";
import {
  Link, FileText, Target, CheckCircle,
  AlertTriangle, XCircle, Sparkles, History,
  Download, Check, ExternalLink, BookOpen, BarChart2,
  PartyPopper, Flame, Ban, Star, FileEdit,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AIProviderBadge } from "@/components/AIProviderSettings";

interface MatchRecord {
  id: string;
  resumeId: string;
  jobTitle: string | null;
  jobType: string | null;
  jobUrl: string | null;
  jobDescription: string | null;
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
  const [activeRecord, setActiveRecord] = useState<MatchRecord | null>(null);
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "done">("idle");
  const [cvPdfState, setCvPdfState] = useState<"idle" | "loading" | "done">("idle");
  const [activeTab, setActiveTab] = useState<"analyser" | "resultats">("analyser");

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
            setActiveRecord(latest as MatchRecord);
            setActiveTab("resultats");
            // Pre-populate the form from the last match so the user can re-run immediately
            if (latest.jobTitle) setJobTitle(latest.jobTitle);
            if (latest.jobType === "url" && latest.jobUrl) {
              setJobType("url");
              setJobUrl(latest.jobUrl);
            } else if (latest.jobDescription) {
              setJobType("text");
              setJobContent(latest.jobDescription);
            }
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
      if (!res.ok) {
        console.error("Match API error:", data);
        alert(data.details || data.error || "Erreur lors de l'analyse. Vérifiez la console.");
        return;
      }
      setMatchResult(data);
      setActiveTab("resultats");
      if (data.optimizedResume) {
        setOptimizedResume(data.optimizedResume);
      }

      // Reload history
      const matchesRes = await fetch(`/api/matches/${id}`);
      if (matchesRes.ok) {
        const { history } = await matchesRes.json();
        setMatchHistory(history ?? []);
        if (history?.[0]) {
          setActiveVersion(history[0].version);
          setActiveRecord(history[0] as MatchRecord);
        }
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
    setActiveRecord(record);
    setActiveTab("resultats");
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

  async function exportCvPdf() {
    if (cvPdfState !== "idle") return;
    setCvPdfState("loading");
    try {
      const res = await fetch(`/api/export/pdf?id=${id}&format=pdf&theme=${themeId}&colorTheme=default`);
      if (!res.ok) throw new Error("CV PDF export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume?.basics?.name || "cv"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setCvPdfState("done");
      setTimeout(() => setCvPdfState("idle"), 2500);
    } catch (err) {
      console.error("CV PDF export error:", err);
      setCvPdfState("idle");
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

  function getReadiness(score: number) {
    if (score >= 75)
      return {
        label: "CV prêt pour ce poste",
        sublabel: "Votre profil correspond bien à cette offre.",
        icon: <PartyPopper className="w-5 h-5" />,
        className: "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300",
        badgeClass: "bg-emerald-500",
      };
    if (score >= 50)
      return {
        label: "CV à optimiser",
        sublabel: "Quelques ajustements renforceront votre candidature.",
        icon: <Flame className="w-5 h-5" />,
        className: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300",
        badgeClass: "bg-amber-500",
      };
    return {
      label: "CV peu adapté",
      sublabel: "Des écarts importants subsistent avec l'offre.",
      icon: <Ban className="w-5 h-5" />,
      className: "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300",
      badgeClass: "bg-rose-500",
    };
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
        onClick={exportCvPdf}
        disabled={cvPdfState !== "idle"}
        className="gap-1.5"
      >
        {cvPdfState === "loading" ? (
          <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
        ) : cvPdfState === "done" ? (
          <Check className="w-3 h-3" />
        ) : (
          <Download className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">
          {cvPdfState === "loading" ? "Export..." : cvPdfState === "done" ? "OK" : "Exporter le CV"}
        </span>
      </Button>
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
          {pdfState === "loading" ? "Export..." : pdfState === "done" ? "OK" : "Exporter l'analyse"}
        </span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${id}`)}>
        Editer le CV
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar
        breadcrumbs={[
          { label: resume.basics?.name || "CV", href: `/editor/${id}` },
          { label: "Matching" },
        ]}
        navLinks={[
          { label: "Éditeur", href: `/editor/${id}`, icon: <FileEdit className="w-3 h-3" /> },
          { label: "Revue IA", href: `/review/${id}`, icon: <Star className="w-3 h-3" /> },
          { label: "Matching", href: `/match/${id}`, icon: <Target className="w-3 h-3" />, active: true },
        ]}
        actions={navActions}
      />

      <div className="flex flex-1 gap-4 px-4 pb-4 pt-2 min-h-0">
        {/* Left panel: CV preview(s) */}
        <div className="flex gap-4 min-h-0 flex-shrink-0">
          <div className="flex-shrink-0 overflow-auto rounded-lg border bg-card shadow-sm" style={{ width: "210mm" }}>
            <div style={{ minHeight: "297mm" }}>
              <ThemeRenderer resume={resume} themeId={themeId} />
            </div>
          </div>
          {optimizedResume && (
            <div className="flex-shrink-0 overflow-auto rounded-lg border bg-card shadow-sm ring-2 ring-green-200" style={{ width: "210mm" }}>
              <div style={{ minHeight: "297mm" }}>
                <ThemeRenderer resume={optimizedResume} themeId={themeId} />
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Tabs Analyser / Résultats */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "analyser" | "resultats")}
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="analyser" className="gap-2">
                <Target className="w-3.5 h-3.5" />
                Analyser
              </TabsTrigger>
              <TabsTrigger value="resultats" className="gap-2">
                <BarChart2 className="w-3.5 h-3.5" />
                Résultats
                {matchResult && (
                  <span className={`ml-0.5 text-xs font-bold ${getScoreColor(matchResult.matchScore)}`}>
                    {matchResult.matchScore}%
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Tab : Analyser ── */}
            <TabsContent value="analyser" className="flex-1 min-h-0 flex flex-col mt-3">
              <Card className="flex flex-col flex-1 min-h-0">
                <CardContent className="flex flex-col flex-1 gap-4 pt-4 min-h-0">
                  {/* Job type toggle */}
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

                  {/* Job content input */}
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

                  {/* Options + button */}
                  <div className="shrink-0 space-y-3">
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Titre du poste (optionnel, ex: Chef de Projet)"
                      className="text-xs"
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
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
            </TabsContent>

            {/* ── Tab : Résultats ── */}
            <TabsContent value="resultats" className="flex-1 min-h-0 overflow-auto mt-3">
              {!matchResult ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
                  <BarChart2 className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Aucune analyse disponible.</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("analyser")}>
                    <Target className="w-3.5 h-3.5 mr-1.5" /> Lancer une analyse
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {/* History */}
                  {matchHistory.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap px-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
                        <History className="w-3.5 h-3.5" />
                        Historique
                      </div>
                      {[...matchHistory].reverse().map((m) => {
                        const isActive = m.version === activeVersion;
                        const badgeStyle = getScoreBadgeStyle(m.matchScore);
                        const label = m.jobTitle || `Analyse #${m.version}`;
                        const typeIcon = m.jobType === "url" ? "🔗" : m.jobType === "pdf" ? "📄" : "📝";
                        const tooltipLines = [
                          new Date(m.createdAt).toLocaleString("fr-FR"),
                          m.jobTitle ? `Poste : ${m.jobTitle}` : null,
                          m.jobUrl ? `URL : ${m.jobUrl}` : null,
                        ].filter(Boolean).join("\n");
                        return (
                          <button
                            key={m.id}
                            onClick={() => selectVersion(m)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                              isActive
                                ? `${badgeStyle} font-bold ring-2 ring-offset-1 ring-current/30`
                                : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/50"
                            }`}
                            title={tooltipLines}
                          >
                            <span>{typeIcon}</span>
                            <span className="font-bold">{m.matchScore}%</span>
                            <span className="max-w-[80px] truncate opacity-80">{label}</span>
                            <span className="opacity-60">v{m.version}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Readiness banner */}
                  {(() => {
                    const r = getReadiness(matchResult.matchScore);
                    return (
                      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${r.className}`}>
                        <span className="shrink-0">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm leading-tight">{r.label}</p>
                          <p className="text-xs opacity-75 mt-0.5">{r.sublabel}</p>
                        </div>
                        <span className={`shrink-0 text-white text-sm font-black px-2.5 py-1 rounded-lg ${r.badgeClass}`}>
                          {matchResult.matchScore}%
                        </span>
                      </div>
                    );
                  })()}

                  {/* Score */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-base font-semibold">
                          Score :{" "}
                          <span className={`text-2xl font-bold ${getScoreColor(matchResult.matchScore)}`}>
                            {matchResult.matchScore}%
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <AIProviderBadge provider={matchResult.provider} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 gap-1"
                            onClick={() => setActiveTab("analyser")}
                          >
                            <Target className="w-3 h-3" /> Ré-analyser
                          </Button>
                        </div>
                      </div>
                      <Progress value={matchResult.matchScore} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-3">{matchResult.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Source du poste */}
                  {activeRecord && (activeRecord.jobTitle || activeRecord.jobUrl || activeRecord.jobDescription) && (
                    <Card className="border-muted bg-muted/30">
                      <CardContent className="pt-3 space-y-1.5">
                        <p className="text-xs flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          {activeRecord.jobType === "url"
                            ? <Link className="w-3.5 h-3.5" />
                            : activeRecord.jobType === "pdf"
                            ? <FileText className="w-3.5 h-3.5" />
                            : <BookOpen className="w-3.5 h-3.5" />}
                          Source du poste
                        </p>
                        {activeRecord.jobTitle && (
                          <p className="text-sm font-medium text-foreground">{activeRecord.jobTitle}</p>
                        )}
                        {activeRecord.jobUrl && (
                          <a
                            href={activeRecord.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline break-all"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            {activeRecord.jobUrl}
                          </a>
                        )}
                        {activeRecord.jobDescription && !activeRecord.jobUrl && (
                          <details>
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                              Voir le texte de l&apos;offre ({activeRecord.jobDescription.length} car.)
                            </summary>
                            <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-auto bg-background rounded p-2 border">
                              {activeRecord.jobDescription.slice(0, 1500)}{activeRecord.jobDescription.length > 1500 ? "…" : ""}
                            </p>
                          </details>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Analysé le {new Date(activeRecord.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Matched skills */}
                  {matchResult.matchedSkills.length > 0 && (
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" /> Compétences correspondantes
                        </p>
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

                  {/* Gaps */}
                  {matchResult.gaps.length > 0 && (
                    <Card>
                      <CardContent className="pt-4 space-y-2">
                        <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" /> Points manquants
                        </p>
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

                  {/* Suggestions */}
                  {matchResult.suggestions.length > 0 && (
                    <Card>
                      <CardContent className="pt-4 space-y-2">
                        <p className="text-sm font-semibold mb-2">Suggestions d&apos;amélioration</p>
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

                  {/* Optimized summary */}
                  {matchResult.optimizedSummary && (
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm font-semibold mb-2">Résumé optimisé proposé</p>
                        <p className="text-xs text-muted-foreground italic">{matchResult.optimizedSummary}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
