"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Plus, Upload, FileText, Trash2, Copy, Star, Target } from "lucide-react";
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

interface HomePageClientProps {
  initialResumes: ResumeRecord[];
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

export function HomePageClient({ initialResumes }: HomePageClientProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeRecord[]>(initialResumes);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar actions={navActions} />

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

      <section className="bg-hero-gradient py-10 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold text-gradient-primary mb-3"
        >
          Vos CVs professionnels
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-base max-w-md mx-auto"
        >
          {resumes.length > 0
            ? `${resumes.length} CV${resumes.length > 1 ? "s" : ""} dans votre espace`
            : "Creez, evaluez et optimisez vos CVs avec l'IA"}
        </motion.p>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-8">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={containerVariants()}
            initial="hidden"
            animate="visible"
          >
            {resumes.map((resume) => {
              const theme = themes[resume.theme as keyof typeof themes];
              const basics = resume.data?.basics as { name?: string; label?: string } | undefined;
              const accentBorder = themeAccents[resume.theme] ?? "border-primary";
              return (
                <motion.div key={resume.id} variants={cardVariants} whileTap={{ scale: 0.98 }}>
                  <Card className={`card-hover border-t-4 ${accentBorder}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between gap-2">
                        <span className="truncate">{resume.title}</span>
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                          {theme?.name || resume.theme}
                        </span>
                      </CardTitle>
                      {basics?.label && (
                        <p className="text-xs text-muted-foreground truncate">{basics.label}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-4">
                        Mis a jour le {new Date(resume.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                      <Button
                        size="sm"
                        className="w-full mb-2"
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
