"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Upload, FileText, Trash2, Copy, Star, Target } from "lucide-react";
import { themes } from "@/themes";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CV Builder</h1>
            <p className="text-sm text-muted-foreground">Creez, evaluez et optimisez vos CVs</p>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button variant="outline" onClick={() => setShowImport(!showImport)}>
              <Upload className="w-4 h-4" />
              Importer
            </Button>
            <Button onClick={createNewResume}>
              <Plus className="w-4 h-4" />
              Nouveau CV
            </Button>
          </div>
        </div>
      </header>

      {showImport && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Importer un CV (YAML ou JSON)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Titre du CV (optionnel)"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
              />
              <textarea
                className="w-full h-48 rounded-md border p-3 text-sm font-mono"
                placeholder="Collez votre YAML ou JSON ici..."
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
              />
              {importError && <p className="text-sm text-red-600">{importError}</p>}
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
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun CV</h2>
            <p className="text-muted-foreground mb-6">Creez votre premier CV ou importez-en un existant</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={createNewResume}>
                <Plus className="w-4 h-4" />
                Creer un CV
              </Button>
              <Button variant="outline" onClick={() => setShowImport(true)}>
                <Upload className="w-4 h-4" />
                Importer
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => {
              const theme = themes[resume.theme as keyof typeof themes];
              const basics = resume.data?.basics as { name?: string; label?: string } | undefined;
              return (
                <Card key={resume.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="truncate">{resume.title}</span>
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {theme?.name || resume.theme}
                      </span>
                    </CardTitle>
                    {basics?.label && (
                      <p className="text-xs text-muted-foreground">{basics.label}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      Mis a jour le {new Date(resume.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/editor/${resume.id}`)}
                        className="text-xs"
                      >
                        <FileText className="w-3 h-3" /> Editer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/review/${resume.id}`)}
                        className="text-xs"
                      >
                        <Star className="w-3 h-3" /> Revue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/match/${resume.id}`)}
                        className="text-xs"
                      >
                        <Target className="w-3 h-3" /> Match
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateResume(resume.id)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResume(resume.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
