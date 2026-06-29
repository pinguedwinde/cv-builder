"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Navbar } from "@/components/Navbar";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";
import {
  Save, Download, Plus, Trash2, Star, Target, ChevronDown,
  User, Briefcase, GraduationCap, Wrench, Globe, FolderOpen,
  Award, FileCheck, Heart, MessageSquare, Users, Loader2,
  Code2, AlertCircle, CheckCircle2, GripVertical,
} from "lucide-react";
import { nanoid } from "nanoid";
import { exportToJson } from "@/lib/exporters/json";
import { exportToYaml } from "@/lib/exporters/yaml";
import { exportToMarkdown } from "@/lib/exporters/markdown";
import { parseJson } from "@/lib/parsers/json";
import { parseYaml } from "@/lib/parsers/yaml";

type AnyItem = Record<string, unknown>;

/** Add a stable _id to each item in an array section (client-side only). */
function withIds(arr: unknown[] | undefined | null): AnyItem[] {
  return (arr || []).map((item) => ({ _id: nanoid(), ...(item as AnyItem) }));
}

/** Remove _id before persisting. */
function stripIds(arr: unknown[] | undefined | null): AnyItem[] {
  return (arr || []).map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = item as AnyItem;
    return rest;
  });
}

/** Get stable React key from an item. */
const itemKey = (item: unknown) => (item as AnyItem)._id as string;

function DraggableCard({
  value,
  label,
  onDelete,
  children,
}: {
  value: unknown;
  label: string;
  onDelete: () => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={value}
      dragListener={false}
      dragControls={controls}
      className="border border-l-4 border-l-primary/40 rounded-lg bg-card p-3 space-y-2 shadow-sm"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <GripVertical
            className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
            onPointerDown={(e) => controls.start(e)}
          />
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 h-6 w-6 p-0">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      {children}
    </Reorder.Item>
  );
}

function DraggableRow({
  value,
  onDelete,
  children,
}: {
  value: unknown;
  onDelete: () => void;
  children: ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={value}
      dragListener={false}
      dragControls={controls}
      className="flex gap-2 items-end"
    >
      <GripVertical
        className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 self-center mb-1"
        onPointerDown={(e) => controls.start(e)}
      />
      {children}
      <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 h-8 w-8 p-0 shrink-0">
        <Trash2 className="w-3 h-3" />
      </Button>
    </Reorder.Item>
  );
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [title, setTitle] = useState("");
  const [themeId, setThemeId] = useState<ThemeId>("modern");
  const [colorThemeId, setColorThemeId] = useState("default");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [currentTab, setCurrentTab] = useState("basics");
  const [rawFormat, setRawFormat] = useState<"json" | "yaml" | "markdown">("json");
  const [rawContent, setRawContent] = useState("");
  const [rawError, setRawError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        const raw = data.data as Resume;
        // Attach stable client-side _id to all array items for drag-and-drop key tracking.
        setResume({
          ...raw,
          work:         withIds(raw.work)         as Resume["work"],
          education:    withIds(raw.education)    as Resume["education"],
          skills:       withIds(raw.skills)       as Resume["skills"],
          projects:     withIds(raw.projects)     as Resume["projects"],
          languages:    withIds(raw.languages)    as Resume["languages"],
          certificates: withIds(raw.certificates) as Resume["certificates"],
          awards:       withIds(raw.awards)       as Resume["awards"],
          volunteer:    withIds(raw.volunteer)    as Resume["volunteer"],
          interests:    withIds(raw.interests)    as Resume["interests"],
          references:   withIds(raw.references)   as Resume["references"],
        });
        setTitle(data.title);
        setThemeId((data.theme as ThemeId) || "modern");
        setColorThemeId(data.colorTheme || "default");
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const save = useCallback(async () => {
    if (!resume) return;
    setSaving(true);
    // Strip _id before persisting — it's only used for drag-and-drop key stability.
    const clean = {
      ...resume,
      work:         stripIds(resume.work)         as Resume["work"],
      education:    stripIds(resume.education)    as Resume["education"],
      skills:       stripIds(resume.skills)       as Resume["skills"],
      projects:     stripIds(resume.projects)     as Resume["projects"],
      languages:    stripIds(resume.languages)    as Resume["languages"],
      certificates: stripIds(resume.certificates) as Resume["certificates"],
      awards:       stripIds(resume.awards)       as Resume["awards"],
      volunteer:    stripIds(resume.volunteer)    as Resume["volunteer"],
      interests:    stripIds(resume.interests)    as Resume["interests"],
      references:   stripIds(resume.references)   as Resume["references"],
    };
    try {
      await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, data: clean, theme: themeId, colorTheme: colorThemeId }),
      });
    } catch {
      console.error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [id, resume, title, themeId, colorThemeId]);

  useEffect(() => {
    if (!resume) return;
    const timer = setTimeout(save, 2000);
    return () => clearTimeout(timer);
  }, [resume, title, themeId, colorThemeId, save]);

  function updateBasics(field: string, value: string) {
    if (!resume) return;
    setResume({
      ...resume,
      basics: { ...resume.basics, [field]: value },
    });
  }

  function updateLocation(field: string, value: string) {
    if (!resume) return;
    setResume({
      ...resume,
      basics: {
        ...resume.basics,
        location: { ...resume.basics?.location, [field]: value },
      },
    });
  }

  function updateArrayItem(section: keyof Resume, index: number, field: string, value: string | string[]) {
    if (!resume) return;
    const items = [...(resume[section] as AnyItem[])];
    items[index] = { ...items[index], [field]: value };
    setResume({ ...resume, [section]: items });
  }

  function addArrayItem(section: keyof Resume, template: AnyItem) {
    if (!resume) return;
    const items = [...((resume[section] as AnyItem[]) || []), { _id: nanoid(), ...template }];
    setResume({ ...resume, [section]: items });
  }

  function removeArrayItem(section: keyof Resume, index: number) {
    if (!resume) return;
    const items = [...(resume[section] as AnyItem[])];
    items.splice(index, 1);
    setResume({ ...resume, [section]: items });
  }

  function reorderSection(section: keyof Resume, newOrder: unknown[]) {
    if (!resume) return;
    setResume({ ...resume, [section]: newOrder });
  }

  function updateHighlight(workIndex: number, highlightIndex: number, value: string) {
    if (!resume?.work) return;
    const work = [...resume.work] as AnyItem[];
    const highlights = [...((work[workIndex].highlights as string[]) || [])];
    highlights[highlightIndex] = value;
    work[workIndex] = { ...work[workIndex], highlights };
    setResume({ ...resume, work: work as Resume["work"] });
  }

  function addHighlight(workIndex: number) {
    if (!resume?.work) return;
    const work = [...resume.work] as AnyItem[];
    work[workIndex] = { ...work[workIndex], highlights: [...((work[workIndex].highlights as string[]) || []), ""] };
    setResume({ ...resume, work: work as Resume["work"] });
  }

  function removeHighlight(workIndex: number, highlightIndex: number) {
    if (!resume?.work) return;
    const work = [...resume.work] as AnyItem[];
    const highlights = [...((work[workIndex].highlights as string[]) || [])];
    highlights.splice(highlightIndex, 1);
    work[workIndex] = { ...work[workIndex], highlights };
    setResume({ ...resume, work: work as Resume["work"] });
  }

  function updateSkillKeywords(skillIndex: number, keywords: string) {
    if (!resume?.skills) return;
    const skills = [...resume.skills] as AnyItem[];
    skills[skillIndex] = { ...skills[skillIndex], keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean) };
    setResume({ ...resume, skills: skills as Resume["skills"] });
  }

  function initRawContent(r: Resume, fmt: "json" | "yaml" | "markdown") {
    if (fmt === "json") setRawContent(exportToJson(r));
    else if (fmt === "yaml") setRawContent(exportToYaml(r));
    else setRawContent(exportToMarkdown(r));
    setRawError(null);
  }

  function handleTabChange(tab: string) {
    setCurrentTab(tab);
    if (tab === "raw" && resume) initRawContent(resume, rawFormat);
  }

  function handleFormatChange(fmt: "json" | "yaml" | "markdown") {
    setRawFormat(fmt);
    if (resume) initRawContent(resume, fmt);
  }

  function handleRawChange(value: string) {
    setRawContent(value);
    if (rawFormat === "markdown") return;
    const result = rawFormat === "json" ? parseJson(value) : parseYaml(value);
    if (result.success && result.data) {
      setRawError(null);
      setResume(result.data);
    } else {
      setRawError(result.errors?.join("\n") || "Erreur de parsing");
    }
  }

  async function handleExport(format: string) {
    if (format === "pdf" && exportingPdf) return;
    if (format === "pdf") setExportingPdf(true);
    try {
      const res = await fetch(`/api/export/pdf?id=${id}&format=${format}&theme=${themeId}&colorTheme=${colorThemeId}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "cv"}.${format === "markdown" ? "md" : format === "yaml" ? "yml" : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error("Export failed");
    } finally {
      if (format === "pdf") setExportingPdf(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="flex flex-col items-center gap-3 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Chargement...</span>
        </motion.div>
      </div>
    );
  }

  if (!resume) {
    return <div className="flex items-center justify-center h-screen">CV non trouve</div>;
  }

  const navActions = (
    <div className="flex items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 w-48 text-sm font-medium hidden md:flex"
        placeholder="Titre du CV"
      />
      <Button variant="outline" size="sm" onClick={() => router.push(`/review/${id}`)}>
        <Star className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Revue</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`/match/${id}`)}>
        <Target className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Match</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={exportingPdf}>
            {exportingPdf
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />
            }
            <span className="hidden sm:inline">{exportingPdf ? "PDF..." : "Exporter"}</span>
            {!exportingPdf && <ChevronDown className="w-3 h-3" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("json")}>
            <Download className="w-3.5 h-3.5" /> JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("yaml")}>
            <Download className="w-3.5 h-3.5" /> YAML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("markdown")}>
            <Download className="w-3.5 h-3.5" /> Markdown
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={exportingPdf}>
            {exportingPdf
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />
            }
            PDF {exportingPdf && "(génération...)"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="sm" onClick={save} disabled={saving}>
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{saving ? "..." : "Sauvegarder"}</span>
      </Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        breadcrumbs={[{ label: title || "Éditeur" }]}
        navLinks={[
          { label: "Revue IA", href: `/review/${id}`, icon: <Star className="w-3 h-3" /> },
          { label: "Matching", href: `/match/${id}`, icon: <Target className="w-3 h-3" /> },
        ]}
        actions={navActions}
      />

      <AnimatePresence>
        {saving && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm"
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Save className="w-3.5 h-3.5 animate-pulse" />
            Sauvegarde...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r bg-background p-4">
          <Tabs value={currentTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0 w-full">
            <TabsList className="w-full flex flex-wrap h-auto bg-muted/60">
              <TabsTrigger value="basics" className="text-xs gap-1"><User className="w-3 h-3" /> Profil</TabsTrigger>
              <TabsTrigger value="work" className="text-xs gap-1"><Briefcase className="w-3 h-3" /> Expérience</TabsTrigger>
              <TabsTrigger value="education" className="text-xs gap-1"><GraduationCap className="w-3 h-3" /> Formation</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs gap-1"><Wrench className="w-3 h-3" /> Compétences</TabsTrigger>
              <TabsTrigger value="projects" className="text-xs gap-1"><FolderOpen className="w-3 h-3" /> Projets</TabsTrigger>
              <TabsTrigger value="languages" className="text-xs gap-1"><Globe className="w-3 h-3" /> Langues</TabsTrigger>
              <TabsTrigger value="certificates" className="text-xs gap-1"><FileCheck className="w-3 h-3" /> Certifs</TabsTrigger>
              <TabsTrigger value="awards" className="text-xs gap-1"><Award className="w-3 h-3" /> Prix</TabsTrigger>
              <TabsTrigger value="volunteer" className="text-xs gap-1"><Heart className="w-3 h-3" /> Bénévolat</TabsTrigger>
              <TabsTrigger value="interests" className="text-xs gap-1"><Users className="w-3 h-3" /> Intérêts</TabsTrigger>
              <TabsTrigger value="references" className="text-xs gap-1"><MessageSquare className="w-3 h-3" /> Références</TabsTrigger>
              <TabsTrigger value="raw" className="text-xs gap-1"><Code2 className="w-3 h-3" /> Brut</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-4 mt-4 flex-1 min-h-0 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nom complet</Label>
                  <Input value={resume.basics?.name || ""} onChange={(e) => updateBasics("name", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Titre professionnel</Label>
                  <Input value={resume.basics?.label || ""} onChange={(e) => updateBasics("label", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={resume.basics?.email || ""} onChange={(e) => updateBasics("email", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Téléphone</Label>
                  <Input value={resume.basics?.phone || ""} onChange={(e) => updateBasics("phone", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Site web</Label>
                  <Input value={resume.basics?.url || ""} onChange={(e) => updateBasics("url", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Photo URL</Label>
                  <Input value={resume.basics?.image || ""} onChange={(e) => updateBasics("image", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Résumé / Profil</Label>
                <Textarea
                  value={resume.basics?.summary || ""}
                  onChange={(e) => updateBasics("summary", e.target.value)}
                  rows={4}
                  placeholder="2-3 phrases décrivant votre profil..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Ville</Label>
                  <Input value={resume.basics?.location?.city || ""} onChange={(e) => updateLocation("city", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Code postal</Label>
                  <Input value={resume.basics?.location?.postalCode || ""} onChange={(e) => updateLocation("postalCode", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Pays (code)</Label>
                  <Input value={resume.basics?.location?.countryCode || ""} onChange={(e) => updateLocation("countryCode", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="work" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.work || []}
                onReorder={(v) => reorderSection("work", v)}
                className="flex flex-col gap-4"
              >
                {resume.work?.map((w, i) => (
                  <DraggableCard
                    key={itemKey(w)}
                    value={w}
                    label={`Expérience #${i + 1}`}
                    onDelete={() => removeArrayItem("work", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Poste</Label>
                        <Input value={(w as AnyItem).position as string || ""} onChange={(e) => updateArrayItem("work", i, "position", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Entreprise</Label>
                        <Input value={(w as AnyItem).name as string || ""} onChange={(e) => updateArrayItem("work", i, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Début</Label>
                        <Input value={(w as AnyItem).startDate as string || ""} onChange={(e) => updateArrayItem("work", i, "startDate", e.target.value)} placeholder="2023-01" />
                      </div>
                      <div>
                        <Label className="text-xs">Fin</Label>
                        <Input value={(w as AnyItem).endDate as string || ""} onChange={(e) => updateArrayItem("work", i, "endDate", e.target.value)} placeholder="2024-01 ou vide" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Lieu</Label>
                      <Input value={(w as AnyItem).location as string || ""} onChange={(e) => updateArrayItem("work", i, "location", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea value={(w as AnyItem).summary as string || ""} onChange={(e) => updateArrayItem("work", i, "summary", e.target.value)} rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Points clés</Label>
                      {((w as AnyItem).highlights as string[] || []).map((h, j) => (
                        <div key={j} className="flex gap-1 mb-1">
                          <Input value={h} onChange={(e) => updateHighlight(i, j, e.target.value)} className="text-xs" />
                          <Button variant="ghost" size="sm" onClick={() => removeHighlight(i, j)} className="h-6 w-6 p-0 text-red-400 shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addHighlight(i)} className="text-xs mt-1">
                        <Plus className="w-3 h-3" /> Point clé
                      </Button>
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("work", { name: "", position: "", startDate: "", endDate: "", summary: "", highlights: [], location: "" })}
              >
                <Plus className="w-3 h-3" /> Ajouter une expérience
              </Button>
            </TabsContent>

            <TabsContent value="education" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.education || []}
                onReorder={(v) => reorderSection("education", v)}
                className="flex flex-col gap-4"
              >
                {resume.education?.map((e, i) => (
                  <DraggableCard
                    key={itemKey(e)}
                    value={e}
                    label={`Formation #${i + 1}`}
                    onDelete={() => removeArrayItem("education", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Établissement</Label>
                        <Input value={(e as AnyItem).institution as string || ""} onChange={(ev) => updateArrayItem("education", i, "institution", ev.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Domaine</Label>
                        <Input value={(e as AnyItem).area as string || ""} onChange={(ev) => updateArrayItem("education", i, "area", ev.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Input value={(e as AnyItem).studyType as string || ""} onChange={(ev) => updateArrayItem("education", i, "studyType", ev.target.value)} placeholder="Master, Licence..." />
                      </div>
                      <div>
                        <Label className="text-xs">Note/Mention</Label>
                        <Input value={(e as AnyItem).score as string || ""} onChange={(ev) => updateArrayItem("education", i, "score", ev.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Début</Label>
                        <Input value={(e as AnyItem).startDate as string || ""} onChange={(ev) => updateArrayItem("education", i, "startDate", ev.target.value)} placeholder="2020-09" />
                      </div>
                      <div>
                        <Label className="text-xs">Fin</Label>
                        <Input value={(e as AnyItem).endDate as string || ""} onChange={(ev) => updateArrayItem("education", i, "endDate", ev.target.value)} placeholder="2023-06" />
                      </div>
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("education", { institution: "", area: "", studyType: "", startDate: "", endDate: "", score: "", courses: [] })}
              >
                <Plus className="w-3 h-3" /> Ajouter une formation
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.skills || []}
                onReorder={(v) => reorderSection("skills", v)}
                className="flex flex-col gap-4"
              >
                {resume.skills?.map((sk, i) => (
                  <DraggableCard
                    key={itemKey(sk)}
                    value={sk}
                    label={`Groupe #${i + 1}`}
                    onDelete={() => removeArrayItem("skills", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Nom</Label>
                        <Input value={(sk as AnyItem).name as string || ""} onChange={(e) => updateArrayItem("skills", i, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Niveau</Label>
                        <Input value={(sk as AnyItem).level as string || ""} onChange={(e) => updateArrayItem("skills", i, "level", e.target.value)} placeholder="Expert, Avancé..." />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Mots-clés (séparés par virgule)</Label>
                      <Input
                        value={((sk as AnyItem).keywords as string[] || []).join(", ")}
                        onChange={(e) => updateSkillKeywords(i, e.target.value)}
                        placeholder="React, TypeScript, Node.js..."
                      />
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("skills", { name: "", level: "", keywords: [] })}
              >
                <Plus className="w-3 h-3" /> Ajouter un groupe
              </Button>
            </TabsContent>

            <TabsContent value="projects" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.projects || []}
                onReorder={(v) => reorderSection("projects", v)}
                className="flex flex-col gap-4"
              >
                {resume.projects?.map((p, i) => (
                  <DraggableCard
                    key={itemKey(p)}
                    value={p}
                    label={`Projet #${i + 1}`}
                    onDelete={() => removeArrayItem("projects", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Nom</Label>
                        <Input value={(p as AnyItem).name as string || ""} onChange={(e) => updateArrayItem("projects", i, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">URL</Label>
                        <Input value={(p as AnyItem).url as string || ""} onChange={(e) => updateArrayItem("projects", i, "url", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Début</Label>
                        <Input value={(p as AnyItem).startDate as string || ""} onChange={(e) => updateArrayItem("projects", i, "startDate", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Fin</Label>
                        <Input value={(p as AnyItem).endDate as string || ""} onChange={(e) => updateArrayItem("projects", i, "endDate", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea value={(p as AnyItem).description as string || ""} onChange={(e) => updateArrayItem("projects", i, "description", e.target.value)} rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Technologies (virgule)</Label>
                      <Input
                        value={((p as AnyItem).keywords as string[] || []).join(", ")}
                        onChange={(e) => {
                          if (!resume) return;
                          const projects = [...(resume.projects as AnyItem[])];
                          projects[i] = { ...projects[i], keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) };
                          setResume({ ...resume, projects: projects as Resume["projects"] });
                        }}
                      />
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("projects", { name: "", description: "", startDate: "", endDate: "", url: "", keywords: [], highlights: [], roles: [], entity: "", type: "" })}
              >
                <Plus className="w-3 h-3" /> Ajouter un projet
              </Button>
            </TabsContent>

            <TabsContent value="languages" className="flex flex-col gap-2 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.languages || []}
                onReorder={(v) => reorderSection("languages", v)}
                className="flex flex-col gap-2"
              >
                {resume.languages?.map((l, i) => (
                  <DraggableRow
                    key={itemKey(l)}
                    value={l}
                    onDelete={() => removeArrayItem("languages", i)}
                  >
                    <div className="flex-1">
                      <Label className="text-xs">Langue</Label>
                      <Input value={(l as AnyItem).language as string || ""} onChange={(e) => updateArrayItem("languages", i, "language", e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Niveau</Label>
                      <Input value={(l as AnyItem).fluency as string || ""} onChange={(e) => updateArrayItem("languages", i, "fluency", e.target.value)} />
                    </div>
                  </DraggableRow>
                ))}
              </Reorder.Group>
              <Button variant="outline" size="sm" onClick={() => addArrayItem("languages", { language: "", fluency: "" })}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </TabsContent>

            <TabsContent value="certificates" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.certificates || []}
                onReorder={(v) => reorderSection("certificates", v)}
                className="flex flex-col gap-4"
              >
                {resume.certificates?.map((c, i) => (
                  <DraggableCard
                    key={itemKey(c)}
                    value={c}
                    label={`Certification #${i + 1}`}
                    onDelete={() => removeArrayItem("certificates", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Nom</Label>
                        <Input value={(c as AnyItem).name as string || ""} onChange={(e) => updateArrayItem("certificates", i, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Émetteur</Label>
                        <Input value={(c as AnyItem).issuer as string || ""} onChange={(e) => updateArrayItem("certificates", i, "issuer", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input value={(c as AnyItem).date as string || ""} onChange={(e) => updateArrayItem("certificates", i, "date", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">URL</Label>
                        <Input value={(c as AnyItem).url as string || ""} onChange={(e) => updateArrayItem("certificates", i, "url", e.target.value)} />
                      </div>
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button variant="outline" size="sm" onClick={() => addArrayItem("certificates", { name: "", date: "", issuer: "", url: "" })}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </TabsContent>

            <TabsContent value="awards" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.awards || []}
                onReorder={(v) => reorderSection("awards", v)}
                className="flex flex-col gap-4"
              >
                {resume.awards?.map((a, i) => (
                  <DraggableCard
                    key={itemKey(a)}
                    value={a}
                    label={`Prix #${i + 1}`}
                    onDelete={() => removeArrayItem("awards", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Titre</Label>
                        <Input value={(a as AnyItem).title as string || ""} onChange={(e) => updateArrayItem("awards", i, "title", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Décerné par</Label>
                        <Input value={(a as AnyItem).awarder as string || ""} onChange={(e) => updateArrayItem("awards", i, "awarder", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input value={(a as AnyItem).date as string || ""} onChange={(e) => updateArrayItem("awards", i, "date", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea value={(a as AnyItem).summary as string || ""} onChange={(e) => updateArrayItem("awards", i, "summary", e.target.value)} rows={2} />
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button variant="outline" size="sm" onClick={() => addArrayItem("awards", { title: "", date: "", awarder: "", summary: "" })}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </TabsContent>

            <TabsContent value="volunteer" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.volunteer || []}
                onReorder={(v) => reorderSection("volunteer", v)}
                className="flex flex-col gap-4"
              >
                {resume.volunteer?.map((v, i) => (
                  <DraggableCard
                    key={itemKey(v)}
                    value={v}
                    label={`Bénévolat #${i + 1}`}
                    onDelete={() => removeArrayItem("volunteer", i)}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Rôle</Label>
                        <Input value={(v as AnyItem).position as string || ""} onChange={(e) => updateArrayItem("volunteer", i, "position", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Organisation</Label>
                        <Input value={(v as AnyItem).organization as string || ""} onChange={(e) => updateArrayItem("volunteer", i, "organization", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Début</Label>
                        <Input value={(v as AnyItem).startDate as string || ""} onChange={(e) => updateArrayItem("volunteer", i, "startDate", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Fin</Label>
                        <Input value={(v as AnyItem).endDate as string || ""} onChange={(e) => updateArrayItem("volunteer", i, "endDate", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea value={(v as AnyItem).summary as string || ""} onChange={(e) => updateArrayItem("volunteer", i, "summary", e.target.value)} rows={2} />
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button variant="outline" size="sm" onClick={() => addArrayItem("volunteer", { organization: "", position: "", startDate: "", endDate: "", summary: "", highlights: [] })}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </TabsContent>

            <TabsContent value="interests" className="flex flex-col gap-2 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.interests || []}
                onReorder={(v) => reorderSection("interests", v)}
                className="flex flex-col gap-2"
              >
                {resume.interests?.map((item, i) => (
                  <DraggableRow
                    key={itemKey(item)}
                    value={item}
                    onDelete={() => removeArrayItem("interests", i)}
                  >
                    <div className="flex-1">
                      <Label className="text-xs">Nom</Label>
                      <Input value={(item as AnyItem).name as string || ""} onChange={(e) => updateArrayItem("interests", i, "name", e.target.value)} />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Mots-clés (virgule)</Label>
                      <Input
                        value={((item as AnyItem).keywords as string[] || []).join(", ")}
                        onChange={(e) => {
                          if (!resume) return;
                          const interests = [...(resume.interests as AnyItem[])];
                          interests[i] = { ...interests[i], keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) };
                          setResume({ ...resume, interests: interests as Resume["interests"] });
                        }}
                      />
                    </div>
                  </DraggableRow>
                ))}
              </Reorder.Group>
              <Button variant="outline" size="sm" onClick={() => addArrayItem("interests", { name: "", keywords: [] })}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </TabsContent>

            <TabsContent value="references" className="flex flex-col gap-4 mt-4 flex-1 min-h-0 overflow-auto">
              <Reorder.Group
                as="div"
                axis="y"
                values={resume.references || []}
                onReorder={(v) => reorderSection("references", v)}
                className="flex flex-col gap-4"
              >
                {resume.references?.map((r, i) => (
                  <DraggableCard
                    key={itemKey(r)}
                    value={r}
                    label={`Référence #${i + 1}`}
                    onDelete={() => removeArrayItem("references", i)}
                  >
                    <div>
                      <Label className="text-xs">Nom</Label>
                      <Input value={(r as AnyItem).name as string || ""} onChange={(e) => updateArrayItem("references", i, "name", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Référence</Label>
                      <Textarea value={(r as AnyItem).reference as string || ""} onChange={(e) => updateArrayItem("references", i, "reference", e.target.value)} rows={3} />
                    </div>
                  </DraggableCard>
                ))}
              </Reorder.Group>
              <Button variant="outline" size="sm" onClick={() => addArrayItem("references", { name: "", reference: "" })}>
                <Plus className="w-3 h-3" /> Ajouter
              </Button>
            </TabsContent>

            <TabsContent value="raw" className="flex flex-col flex-1 min-h-0 mt-4">
              <div className="flex flex-col flex-1 min-h-0 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {(["json", "yaml", "markdown"] as const).map((fmt) => (
                      <Button
                        key={fmt}
                        variant={rawFormat === fmt ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFormatChange(fmt)}
                        className="text-xs"
                      >
                        {fmt === "markdown" ? "MD" : fmt.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  {rawFormat === "markdown" ? (
                    <span className="text-xs text-muted-foreground">Lecture seule</span>
                  ) : rawError ? (
                    <span className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" /> Erreur de syntaxe
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valide
                    </span>
                  )}
                </div>

                {rawError && (
                  <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-2">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-red-600 dark:text-red-400">{rawError}</pre>
                  </div>
                )}

                <textarea
                  value={rawContent}
                  onChange={(e) => handleRawChange(e.target.value)}
                  readOnly={rawFormat === "markdown"}
                  spellCheck={false}
                  className={[
                    "w-full rounded-md border bg-muted/30 p-3 font-mono text-xs resize-none",
                    "focus:outline-none focus:ring-1 focus:ring-ring",
                    rawError ? "border-red-300 dark:border-red-800" : "",
                    rawFormat === "markdown" ? "cursor-default opacity-75" : "",
                  "flex-1 min-h-0",
                  ].join(" ")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-shrink-0 overflow-hidden" style={{ width: "210mm" }}>
          <PreviewPanel
            resume={resume}
            themeId={themeId}
            onThemeChange={setThemeId}
            colorThemeId={colorThemeId}
            onColorThemeChange={setColorThemeId}
            resumeId={id}
          />
        </div>
      </div>
    </div>
  );
}
