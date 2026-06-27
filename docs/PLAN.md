# CV Builder - Plan d'Exécution

## Vue d'ensemble

10 phases d'implémentation, chacune produisant un livrable fonctionnel et testable.

---

## Phase 1 : Setup du Projet

**Objectif** : Projet Next.js fonctionnel avec toutes les dépendances.

### Étapes

1. Initialiser le projet Next.js 14+ avec App Router et TypeScript
2. Installer et configurer TailwindCSS v4
3. Installer shadcn/ui et configurer les composants de base
4. Installer better-sqlite3 + Drizzle ORM
5. Installer les dépendances utilitaires (js-yaml, zod, pdf-parse, etc.)
6. Configurer ESLint, Prettier
7. Créer la structure de dossiers (app/, components/, lib/, themes/)

### Dépendances à installer

```bash
# Core
next react react-dom typescript @types/react @types/node

# Styling
tailwindcss @tailwindcss/postcss postcss

# UI
@radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
@radix-ui/react-select @radix-ui/react-label @radix-ui/react-slot
class-variance-authority clsx tailwind-merge lucide-react

# Database
better-sqlite3 drizzle-orm @types/better-sqlite3

# Parsing & Validation
js-yaml @types/js-yaml zod pdf-parse

# AI
openai

# PDF Export
@react-pdf/renderer

# Utils
date-fns nanoid
```

### Livrable
- `npm run dev` fonctionne
- Page d'accueil vide accessible sur localhost:3000

---

## Phase 2 : Schéma de Données & Types

**Objectif** : Types TypeScript complets + validation Zod + schéma DB.

### Étapes

1. Créer `lib/schemas/resume.ts` avec les types TypeScript basés sur JSON Resume
2. Créer les schémas Zod pour validation runtime
3. Créer le schéma Drizzle pour SQLite (`lib/db/schema.ts`)
4. Tables : `resumes` (id, title, data JSON, theme, createdAt, updatedAt)
5. Configurer la connexion DB (`lib/db/index.ts`)
6. Créer une migration initiale
7. Créer un fichier de données d'exemple (`data/sample-resume.json`)

### Livrable
- Types TypeScript exportables
- Validation Zod fonctionnelle
- Table SQLite créée
- Exemple de CV valide

---

## Phase 3 : Import/Export

**Objectif** : Parser et exporter des CVs en YAML, JSON, Markdown.

### Étapes

1. Créer `lib/parsers/yaml.ts` : YAML → objet validé
2. Créer `lib/parsers/json.ts` : JSON → objet validé
3. Créer `lib/parsers/index.ts` : détection auto du format
4. Créer `lib/exporters/yaml.ts` : objet → YAML
5. Créer `lib/exporters/json.ts` : objet → JSON formaté
6. Créer `lib/exporters/markdown.ts` : objet → Markdown structuré
7. Créer `lib/exporters/index.ts` : interface commune
8. API route `app/api/import/route.ts` : upload + parse + validate
9. API route `app/api/export/route.ts` : export multi-format

### Livrable
- Upload YAML/JSON fonctionnel avec validation
- Export YAML/JSON/MD fonctionnel
- Messages d'erreur clairs si schéma invalide

---

## Phase 4 : Thèmes de CV

**Objectif** : 5 thèmes visuels distincts et renderables.

### Étapes

1. Créer `themes/types.ts` : interface Theme (couleurs, fonts, layout config)
2. Créer `themes/classic.tsx` : thème Classique
3. Créer `themes/modern.tsx` : thème Moderne
4. Créer `themes/minimal.tsx` : thème Minimaliste
5. Créer `themes/creative.tsx` : thème Créatif
6. Créer `themes/compact.tsx` : thème Compact
7. Créer `themes/index.ts` : registry des thèmes
8. Créer `components/themes/ThemeRenderer.tsx` : composant qui prend un thème + data et rend le CV

### Caractéristiques par thème

**Classique**
- Font : Georgia/serif
- Layout : 1 colonne, header centré
- Couleurs : #1a1a2e (navy), #fff, #333
- Sections séparées par des lignes horizontales

**Moderne**
- Font : Inter/sans-serif
- Layout : 2 colonnes (sidebar 30% + main 70%)
- Couleurs : #2563eb (blue), #f8fafc, #64748b
- Sidebar avec photo, contact, skills. Main avec expérience, formation.

**Minimaliste**
- Font : JetBrains Mono/monospace
- Layout : 1 colonne, max-width 700px
- Couleurs : #000, #fff uniquement
- Typographie comme seul élément de design

**Créatif**
- Font : Poppins/sans-serif
- Layout : Asymétrique avec cards et badges
- Couleurs : Gradient violet→bleu, accents orange
- Tags colorés pour skills, timeline visuelle

**Compact**
- Font : Source Sans Pro
- Layout : 2 colonnes serrées, optimisé multi-pages
- Couleurs : #374151 (gris foncé), #7c2d12 (bordeaux), #f9fafb
- Densité maximale, police réduite

### Livrable
- 5 composants de thème fonctionnels
- ThemeRenderer capable de rendre n'importe quel CV avec n'importe quel thème
- Chaque thème est responsive et imprimable

---

## Phase 5 : Prévisualisation Web & Export PDF

**Objectif** : Preview temps réel + export PDF fidèle.

### Étapes

1. Créer `components/preview/PreviewPanel.tsx` : panneau de prévisualisation
2. Intégrer le ThemeRenderer dans le PreviewPanel
3. Ajouter les contrôles : zoom, plein écran, switch thème
4. Créer `lib/exporters/pdf.tsx` avec @react-pdf/renderer
5. Pour chaque thème, créer une version PDF compatible react-pdf
6. API route `app/api/export/pdf/route.ts` : génère le PDF
7. Bouton de téléchargement PDF dans la preview

### Livrable
- Preview web fonctionnelle avec tous les thèmes
- Export PDF téléchargeable
- Fidélité visuelle web/PDF

---

## Phase 6 : Système de Revue & Scoring

**Objectif** : Analyser et noter le CV avec OpenAI.

### Étapes

1. Créer `lib/ai/client.ts` : wrapper OpenAI
2. Créer `lib/ai/prompts/review.ts` : prompts pour l'analyse de CV
3. Créer `lib/ai/review.ts` :
   - Fonction `reviewResume(resume)` → score + suggestions
   - Score global /100
   - Scores par catégorie (complétude, impact, clarté, pertinence, format)
   - Suggestions d'amélioration par section
   - Propositions de réécriture (avant/après)
4. API route `app/api/review/route.ts`
5. Créer `components/review/ScoreCard.tsx` : affichage du score
6. Créer `components/review/SuggestionsPanel.tsx` : suggestions par section
7. Créer `components/review/RewriteComparison.tsx` : avant/après
8. Gérer le cas où OPENAI_API_KEY n'est pas configurée (fallback règles locales basiques)

### Structure de la réponse IA

```typescript
interface ReviewResult {
  overallScore: number;        // 0-100
  categories: {
    completeness: { score: number; details: string };
    impact: { score: number; details: string };
    clarity: { score: number; details: string };
    relevance: { score: number; details: string };
    formatting: { score: number; details: string };
  };
  suggestions: Array<{
    section: string;           // "work", "education", etc.
    severity: "critical" | "warning" | "info";
    message: string;
    rewrite?: {
      original: string;
      improved: string;
    };
  }>;
  summary: string;             // Résumé global
}
```

### Livrable
- Scoring fonctionnel avec affichage visuel (barres, couleurs)
- Suggestions actionnables
- Comparaison avant/après
- Dégradation gracieuse sans clé API

---

## Phase 7 : Job Matching

**Objectif** : Analyser une offre d'emploi et optimiser le CV en conséquence.

### Étapes

1. Créer `lib/parsers/job-description.ts` :
   - Parser PDF (via pdf-parse)
   - Parser TXT
   - Fetcher URL (via fetch + extraction du contenu principal)
2. Créer `lib/ai/prompts/matching.ts` : prompts pour le matching
3. Créer `lib/ai/matching.ts` :
   - Fonction `extractJobRequirements(text)` → compétences, mots-clés, exigences
   - Fonction `matchResumeToJob(resume, jobRequirements)` → score + gaps + suggestions
   - Fonction `optimizeResumeForJob(resume, jobRequirements)` → CV optimisé
4. API route `app/api/match/route.ts`
5. Créer `components/match/JobUpload.tsx` : upload/saisie offre
6. Créer `components/match/MatchResults.tsx` : résultats du matching
7. Créer `components/match/GapAnalysis.tsx` : compétences manquantes
8. Créer `components/match/OptimizedPreview.tsx` : CV optimisé

### Structure de la réponse matching

```typescript
interface MatchResult {
  matchScore: number;          // 0-100
  jobRequirements: {
    requiredSkills: string[];
    preferredSkills: string[];
    experience: string;
    keywords: string[];
  };
  gaps: Array<{
    type: "skill" | "experience" | "keyword";
    description: string;
    importance: "high" | "medium" | "low";
  }>;
  suggestions: Array<{
    section: string;
    action: string;
    reason: string;
  }>;
  optimizedResume?: Resume;    // Version optimisée du CV
}
```

### Livrable
- Upload/fetch d'offre d'emploi fonctionnel
- Score de correspondance
- Analyse des gaps
- Suggestions d'optimisation
- CV optimisé proposé

---

## Phase 8 : Web UI Complète

**Objectif** : Interface utilisateur complète et intuitive.

### Pages

1. **Page d'accueil** (`app/page.tsx`)
   - Liste des CVs sauvegardés (cards)
   - Bouton "Nouveau CV"
   - Bouton "Importer un CV"
   - Recherche/filtre

2. **Éditeur** (`app/editor/[id]/page.tsx`)
   - Layout split : formulaire à gauche, preview à droite
   - Sections éditables via des tabs (Basics, Work, Education, Skills, etc.)
   - Ajout/suppression/réorganisation d'entrées dans chaque section
   - Sélecteur de thème
   - Boutons : Sauvegarder, Exporter, Revue, Matching

3. **Preview plein écran** (`app/preview/[id]/page.tsx`)
   - CV en plein écran
   - Contrôles flottants : thème, zoom, téléchargement

4. **Revue** (`app/review/[id]/page.tsx`)
   - CV à gauche, résultats à droite
   - Score global en haut
   - Détails par catégorie
   - Suggestions avec actions (appliquer/ignorer)

5. **Matching** (`app/match/[id]/page.tsx`)
   - Upload offre à gauche
   - Résultats au centre
   - CV optimisé à droite

### Composants UI

- Navigation (sidebar ou topbar)
- FileUploader (drag & drop)
- FormFields (input, textarea, date, array fields)
- ThemeSelector (cards avec preview miniature)
- ScoreGauge (cercle de progression)
- SuggestionCard (avec sévérité colorée)
- ConfirmDialog (pour suppressions)
- Toast notifications

### Livrable
- Toutes les pages fonctionnelles
- Navigation fluide
- UX cohérente et responsive

---

## Phase 9 : SQLite Storage & CRUD

**Objectif** : Persistance complète des CVs.

### Étapes

1. Finaliser le schéma DB avec Drizzle
2. Créer `lib/db/queries.ts` :
   - `getAllResumes()` → liste
   - `getResumeById(id)` → un CV
   - `createResume(data)` → nouveau CV
   - `updateResume(id, data)` → mise à jour
   - `deleteResume(id)` → suppression
   - `duplicateResume(id)` → duplication
3. API routes CRUD :
   - `GET /api/resumes` → liste
   - `POST /api/resumes` → créer
   - `GET /api/resumes/[id]` → lire
   - `PUT /api/resumes/[id]` → modifier
   - `DELETE /api/resumes/[id]` → supprimer
   - `POST /api/resumes/[id]/duplicate` → dupliquer
4. Auto-save dans l'éditeur (debounce 2s)

### Livrable
- CRUD complet et testé
- Auto-save fonctionnel
- Données persistées dans data/cv-builder.db

---

## Phase 10 : Préparation Déploiement

**Objectif** : App prête pour le déploiement.

### Étapes

1. Créer `.env.example` avec toutes les variables
2. Créer `Dockerfile` (multi-stage build)
3. Créer `docker-compose.yml`
4. Configurer le build Next.js pour production
5. S'assurer que SQLite fonctionne en mode serverless (ou documenter la limitation)
6. Créer un README.md avec instructions complètes
7. Tester le build de production (`npm run build && npm start`)

### Livrable
- Dockerfile fonctionnel
- docker-compose.yml
- README.md avec instructions
- Build de production testé

---

## Ordre d'Exécution

```
Phase 1 (Setup)
    ↓
Phase 2 (Schéma & Types)
    ↓
Phase 9 (SQLite CRUD)  ← avancé car nécessaire pour l'éditeur
    ↓
Phase 3 (Import/Export)
    ↓
Phase 4 (Thèmes)
    ↓
Phase 5 (Preview & PDF)
    ↓
Phase 8 (Web UI)  ← en parallèle avec les phases 4-5
    ↓
Phase 6 (Revue & Scoring)
    ↓
Phase 7 (Job Matching)
    ↓
Phase 10 (Déploiement)
```

## Estimation

| Phase | Complexité | Fichiers estimés |
|-------|-----------|-----------------|
| 1. Setup | Faible | ~10 |
| 2. Schéma | Faible | ~5 |
| 3. Import/Export | Moyenne | ~8 |
| 4. Thèmes | Haute | ~10 |
| 5. Preview/PDF | Moyenne | ~5 |
| 6. Revue/Scoring | Moyenne | ~8 |
| 7. Job Matching | Moyenne | ~8 |
| 8. Web UI | Haute | ~20 |
| 9. SQLite/CRUD | Faible | ~5 |
| 10. Déploiement | Faible | ~5 |
| **Total** | | **~84 fichiers** |
