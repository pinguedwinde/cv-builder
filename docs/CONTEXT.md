# CV Builder - Contexte du Projet

## Vision

Application web permettant de créer, formater, évaluer et optimiser des CVs à partir de fichiers YAML/JSON. L'app propose des thèmes visuels, un scoring intelligent par IA, et un système de matching avec des offres d'emploi.

## Stack Technique

| Technologie | Choix | Justification |
|-------------|-------|---------------|
| Framework | Next.js 14+ (App Router) | SSR, API routes, écosystème riche |
| Langage | TypeScript | Type safety, DX |
| Styling | TailwindCSS | Utility-first, rapide, thèmes faciles |
| Base de données | SQLite (via better-sqlite3) | Léger, local, pas de serveur DB |
| ORM | Drizzle ORM | Type-safe, léger, compatible SQLite |
| PDF | @react-pdf/renderer | Rendu PDF côté client |
| Parsing YAML | js-yaml | Standard, fiable |
| Parsing PDF (job) | pdf-parse | Extraction texte des PDFs |
| IA | OpenAI API (GPT-4o) | Scoring, suggestions, matching |
| UI Components | shadcn/ui | Composants accessibles, customisables |
| Validation | Zod | Runtime validation, compatible TS |

## Schéma de Données

Basé sur le standard **JSON Resume** (https://jsonresume.org/schema/).

### Structure complète

```typescript
interface Resume {
  basics: {
    name: string;
    label: string;        // ex: "Full Stack Developer"
    image: string;        // URL photo
    email: string;
    phone: string;
    url: string;          // site web personnel
    summary: string;      // 2-3 phrases de bio
    location: {
      address: string;
      postalCode: string;
      city: string;
      countryCode: string; // ISO-3166-1 ALPHA-2
      region: string;
    };
    profiles: Array<{     // réseaux sociaux
      network: string;    // "LinkedIn", "GitHub", etc.
      username: string;
      url: string;
    }>;
  };

  work: Array<{
    name: string;         // entreprise
    location: string;
    description: string;
    position: string;
    url: string;
    startDate: string;    // ISO8601: "2023-01" ou "2023-01-15"
    endDate: string;
    summary: string;
    highlights: string[];
  }>;

  volunteer: Array<{
    organization: string;
    position: string;
    url: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
  }>;

  education: Array<{
    institution: string;
    url: string;
    area: string;         // domaine: "Computer Science"
    studyType: string;    // "Bachelor", "Master", etc.
    startDate: string;
    endDate: string;
    score: string;        // GPA
    courses: string[];
  }>;

  awards: Array<{
    title: string;
    date: string;
    awarder: string;
    summary: string;
  }>;

  certificates: Array<{
    name: string;
    date: string;
    url: string;
    issuer: string;
  }>;

  publications: Array<{
    name: string;
    publisher: string;
    releaseDate: string;
    url: string;
    summary: string;
  }>;

  skills: Array<{
    name: string;
    level: string;        // "Master", "Advanced", "Intermediate"
    keywords: string[];
  }>;

  languages: Array<{
    language: string;
    fluency: string;      // "Native", "Fluent", "Intermediate"
  }>;

  interests: Array<{
    name: string;
    keywords: string[];
  }>;

  references: Array<{
    name: string;
    reference: string;
  }>;

  projects: Array<{
    name: string;
    description: string;
    highlights: string[];
    keywords: string[];
    startDate: string;
    endDate: string;
    url: string;
    roles: string[];
    entity: string;
    type: string;         // "application", "open-source", etc.
  }>;

  meta: {
    canonical: string;
    version: string;
    lastModified: string;
  };
}
```

## Thèmes (5 au démarrage)

| Thème | Style | Couleurs | Layout |
|-------|-------|----------|--------|
| **Classique** | Traditionnel, serif | Noir/blanc/bleu marine | 1 colonne, sections empilées |
| **Moderne** | Sans-serif, aéré | Bleu/gris/accent coloré | 2 colonnes (sidebar + main) |
| **Minimaliste** | Ultra-épuré, mono | Noir/blanc uniquement | 1 colonne, beaucoup d'espace |
| **Créatif** | Design audacieux | Gradient/vif/contraste | Asymétrique, cards, badges |
| **Compact** | Dense, professionnel | Gris foncé/bordeaux | 2 colonnes serrées, multi-pages optimisé |

## Fonctionnalités

### 1. Import/Export
- **Import** : YAML, JSON (upload fichier ou paste)
- **Export** : YAML, JSON, Markdown, PDF
- Validation du schéma à l'import avec messages d'erreur clairs

### 2. Prévisualisation
- Preview temps réel du CV avec le thème sélectionné
- Switch instantané entre thèmes
- Zoom in/out
- Mode plein écran

### 3. Système de Revue & Scoring (OpenAI)
- **Score global** sur 100
- **Critères évalués** :
  - Complétude (sections remplies)
  - Impact (verbes d'action, métriques, résultats quantifiés)
  - Clarté (longueur des phrases, jargon)
  - Pertinence (mots-clés industry-standard)
  - Formatage (cohérence des dates, structure)
- **Suggestions d'amélioration** par section
- **Avant/Après** : propositions de réécriture

### 4. Job Matching
- **Sources acceptées** :
  - Upload PDF (offre d'emploi)
  - Upload TXT
  - URL (scraping du contenu)
- **Analyse** :
  - Extraction des compétences requises
  - Extraction des mots-clés
  - Identification des exigences clés
- **Matching** :
  - Score de correspondance CV/poste (%)
  - Compétences manquantes identifiées
  - Suggestions d'ajouts/modifications
  - Réécriture optimisée de sections

### 5. Stockage SQLite
- Sauvegarde locale des CVs
- CRUD complet (créer, lire, modifier, supprimer)
- Historique des versions (optionnel)
- Tags/catégories

## Architecture

```
cv-builder/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout global
│   ├── page.tsx                  # Page d'accueil (liste des CVs)
│   ├── editor/
│   │   └── [id]/
│   │       └── page.tsx          # Éditeur de CV
│   ├── preview/
│   │   └── [id]/
│   │       └── page.tsx          # Prévisualisation plein écran
│   ├── review/
│   │   └── [id]/
│   │       └── page.tsx          # Revue & scoring
│   ├── match/
│   │   └── [id]/
│   │       └── page.tsx          # Job matching
│   └── api/
│       ├── resumes/              # CRUD REST
│       ├── review/               # Endpoint scoring
│       ├── match/                # Endpoint job matching
│       └── export/               # Endpoint export PDF/YAML/MD
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── editor/                   # Formulaires d'édition
│   ├── themes/                   # Composants de thèmes
│   ├── review/                   # Composants de revue
│   └── match/                    # Composants de matching
├── lib/
│   ├── db/                       # SQLite + Drizzle
│   ├── schemas/                  # Zod schemas + types
│   ├── parsers/                  # YAML/JSON/PDF parsers
│   ├── exporters/                # YAML/JSON/MD/PDF exporters
│   ├── ai/                       # OpenAI integration
│   └── utils/                    # Helpers
├── themes/                       # Définitions des thèmes
├── public/                       # Assets statiques
└── docs/                         # Documentation
```

## Variables d'Environnement

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o              # Modèle par défaut

# Base de données
DATABASE_URL=file:./data/cv-builder.db

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Contraintes

- Pas d'authentification (app locale/personnelle)
- Pas de limite de taille de fichier (raisonnable)
- Le PDF d'offre d'emploi doit être en texte lisible (pas de scan/image)
- OpenAI API key requise pour les fonctionnalités IA (dégradation gracieuse si absente)
