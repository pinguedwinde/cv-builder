"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Plus, Upload, FileText, Trash2, Copy, Star, Target, TrendingUp } from "lucide-react";
import { themes } from "@/themes";
import { containerVariants, cardVariants } from "@/lib/motion";

interface ResumeRecord {
  id: string;
  title: string;
  theme: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ReviewSummary {
  score: number;
  grade: string;
  version: number;
  createdAt: string;
}

interface MatchSummary {
  matchScore: number;
  jobTitle: string | null;
  version: number;
  createdAt: string;
}

interface HomePageClientProps {
  initialResumes: ResumeRecord[];
  initialReviewsSummary: Record<string, ReviewSummary>;
  initialMatchesSummary: Record<string, MatchSummary>;
}

const themeAccents: Record<string, string> = {
  classic: "border-slate-700",
  modern: "border-blue-500",
  minimal: "border-neutral-900 dark:border-neutral-100",
  creative: "border-purple-500",
  compact: "border-red-700",
  executive: "border-amber-600",
  aurora: "border-indigo-500",
  swiss: "border-red-600",
  neo: "border-green-400",
  elegant: "border-rose-400",
  bold: "border-yellow-400",
};

const gradeStyles: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700 border-emerald-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-violet-100 text-violet-700 border-violet-200",
  D: "bg-amber-100 text-amber-700 border-amber-200",
  F: "bg-rose-100 text-rose-700 border-rose-200",
};

export function HomePageClient({ initialResumes, initialReviewsSummary, initialMatchesSummary }: HomePageClientProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeRecord[]>(initialResumes);
  const [reviewsSummary, setReviewsSummary] = useState<Record<string, ReviewSummary>>(initialReviewsSummary);
  const [matchesSummary] = useState<Record<string, MatchSummary>>(initialMatchesSummary);
  const [showImport, setShowImport] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [importTitle, setImportTitle] = useState("");
  const [importError, setImportError] = useState("");

  async function createNewResume() {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nouveau CV" }),
      });
      const data = await res.json();
      router.push(`/editor/${data.id}`);
    } catch {
      console.error("Failed to create resume");
    }
  }

  async function handleImport() {
    setImportError("");
    try {
      const parseRes = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: importContent }),
      });

      if (!parseRes.ok) {
        const err = await parseRes.json();
        setImportError(err.details?.join(", ") || err.error || "Erreur d'import");
        return;
      }

      const { data } = await parseRes.json();
      const title = importTitle || data?.basics?.name || "CV Importe";

      const createRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, data }),
      });
      const created = await createRes.json();
      router.push(`/editor/${created.id}`);
    } catch {
      setImportError("Erreur lors de l'import");
    }
  }

  async function deleteResume(id: string) {
    if (!confirm("Supprimer ce CV ?")) return;
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      console.error("Failed to delete resume");
    }
  }

  async function duplicateResume(id: string) {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      setResumes((prev) => [...prev, data]);
    } catch {
      console.error("Failed to duplicate resume");
    }
  }

  const navActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Importer</span>
      </Button>
      <Button size="sm" onClick={createNewResume}>
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nouveau CV</span>
      </Button>
    </div>
  );

  const navSubtitle = resumes.length > 0
    ? `${resumes.length} CV${resumes.length > 1 ? "s" : ""}`
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar actions={navActions} subtitle={navSubtitle} />

      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-b bg-muted/30"
          >
            <div className="max-w-2xl mx-auto px-6 py-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Importer un CV (YAML ou JSON)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Titre du CV (optionnel)"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full h-40 rounded-md border p-3 text-sm font-mono bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Collez votre YAML ou JSON ici..."
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                  />
                  {importError && <p className="text-sm text-destructive">{importError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={handleImport} disabled={!importContent.trim()}>
                      Importer
                    </Button>
                    <Button variant="outline" onClick={() => setShowImport(false)}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {resumes.length === 0 ? (
          <motion.div
            className="text-center py-24 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div className="absolute inset-3 rounded-full bg-primary/15 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Aucun CV pour l'instant</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">
              Creez votre premier CV ou importez-en un existant pour commencer.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={createNewResume} size="lg">
                <Plus className="w-4 h-4" /> Creer un CV
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowImport(true)}>
                <Upload className="w-4 h-4" /> Importer
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants()}
            initial="hidden"
            animate="visible"
          >
            {resumes.map((resume) => {
              const theme = themes[resume.theme as keyof typeof themes];
              const basics = resume.data?.basics as { name?: string; label?: string } | undefined;
              const meta = resume.data?.meta as { target?: string } | undefined;
              const accentBorder = themeAccents[resume.theme] ?? "border-primary";
              const reviewSummary = reviewsSummary[resume.id];
              const matchSummary = matchesSummary[resume.id];
              return (
                <motion.div key={resume.id} variants={cardVariants} whileTap={{ scale: 0.98 }} className="h-[380px] flex flex-col">
                  <Card className={`card-hover border-t-4 ${accentBorder} flex flex-col h-full overflow-hidden`}>
                    <CardHeader className="pb-3 shrink-0">
                      <CardTitle className="text-base flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{resume.title}</span>
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                          {theme?.name || resume.theme}
                        </span>
                      </CardTitle>
                      <div className="h-8 flex items-center">
                        {basics?.label ? (
                          <p className="text-xs text-muted-foreground truncate">{basics.label}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground/40 italic truncate">Pas de titre renseigné</p>
                        )}
                      </div>
                      <div className="h-6 flex items-center">
                        {meta?.target && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-orange-500 shrink-0" />
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full truncate dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800">
                              {meta.target}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 flex flex-col flex-1 gap-4 min-h-0">
                      {/* Stats: Review + Match */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Review stat */}
                        <div
                          className={`rounded-xl border p-3 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-muted/50 h-[88px] ${reviewSummary ? (gradeStyles[reviewSummary.grade] ?? gradeStyles.F) : "border-dashed border-muted-foreground/30 text-muted-foreground"}`}
                          onClick={() => router.push(`/review/${resume.id}`)}
                          title={reviewSummary ? `Revue v${reviewSummary.version} — ${reviewSummary.score}/100` : "Pas encore de revue IA"}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
                            <Star className="w-3 h-3" /> Revue IA
                          </div>
                          {reviewSummary ? (
                            <>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black leading-none">{reviewSummary.grade}</span>
                                <span className="text-sm font-semibold">{reviewSummary.score}<span className="text-xs font-normal opacity-60">/100</span></span>
                              </div>
                              <span className="text-xs opacity-60">v{reviewSummary.version}</span>
                            </>
                          ) : (
                            <span className="text-xs mt-1">Analyser →</span>
                          )}
                        </div>

                        {/* Match stat */}
                        <div
                          className={`rounded-xl border p-3 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-muted/50 h-[88px] ${
                            matchSummary
                              ? matchSummary.matchScore >= 75
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : matchSummary.matchScore >= 50
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              : "border-dashed border-muted-foreground/30 text-muted-foreground"
                          }`}
                          onClick={() => router.push(`/match/${resume.id}`)}
                          title={matchSummary ? `Match v${matchSummary.version}${matchSummary.jobTitle ? ` — ${matchSummary.jobTitle}` : ""}` : "Pas encore de match"}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
                            <TrendingUp className="w-3 h-3" /> Match
                          </div>
                          {matchSummary ? (
                            <>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black leading-none">{matchSummary.matchScore}%</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs opacity-60 truncate">
                                  {matchSummary.jobTitle ?? `v${matchSummary.version}`}
                                </span>
                                {matchSummary.matchScore >= 75 && (
                                  <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full leading-none shrink-0">
                                    Prêt ✓
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs mt-1">Analyser →</span>
                          )}
                        </div>
                      </div>

                      {/* Footer info + Actions */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <p className="text-xs text-muted-foreground">
                          Mis à jour le {new Date(resume.updatedAt).toLocaleDateString("fr-FR")}
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => router.push(`/editor/${resume.id}`)}
                        >
                          <FileText className="w-3.5 h-3.5" /> Editer
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/review/${resume.id}`)}
                            className="flex-1 text-xs"
                          >
                            <Star className="w-3 h-3" /> Revue IA
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/match/${resume.id}`)}
                            className="flex-1 text-xs"
                          >
                            <Target className="w-3 h-3" /> Match
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateResume(resume.id)}
                            className="h-9 w-9 shrink-0"
                            title="Dupliquer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteResume(resume.id)}
                            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
