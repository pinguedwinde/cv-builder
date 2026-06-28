// ─── Sous-critère ────────────────────────────────────────────────────────────

export interface Subcriterion {
  label: string;
  points: number;
  rule: string;
}

// ─── Critère principal ────────────────────────────────────────────────────────

export interface Criterion {
  key: string;
  label: string;
  maxScore: number;
  description: string;
  subcriteria: Subcriterion[];
}

// ─── Critères d'évaluation ────────────────────────────────────────────────────

export const REVIEW_CRITERIA: Criterion[] = [
  {
    key: "completeness",
    label: "Complétude",
    maxScore: 20,
    description: "Toutes les sections essentielles sont renseignées et non vides.",
    subcriteria: [
      { label: "Nom complet",                      points: 3, rule: "basics.name présent et non vide" },
      { label: "Email professionnel",               points: 3, rule: "basics.email valide" },
      { label: "Téléphone",                         points: 2, rule: "basics.phone présent" },
      { label: "Titre / poste actuel",              points: 2, rule: "basics.label présent et non vide" },
      { label: "Résumé/Profil (50+ caractères)",    points: 4, rule: "basics.summary longueur > 50" },
      { label: "Au moins une expérience",           points: 2, rule: "work.length >= 1" },
      { label: "Formation",                         points: 2, rule: "education.length >= 1" },
      { label: "Compétences",                       points: 2, rule: "skills.length >= 1" },
    ],
  },
  {
    key: "impact",
    label: "Impact",
    maxScore: 20,
    description: "Les descriptions utilisent des verbes d'action forts et des résultats quantifiés.",
    subcriteria: [
      { label: "Verbes d'action au début des highlights",   points: 8, rule: "Exemples : Led, Built, Developed, Reduced, Increased, Optimized, Delivered, Launched, Designed" },
      { label: "Résultats chiffrés (%, chiffres, volumes)", points: 8, rule: "Au moins un chiffre ou pourcentage par expérience" },
      { label: "Highlights renseignés sur chaque poste",    points: 4, rule: "work[i].highlights.length >= 2 pour chaque poste" },
    ],
  },
  {
    key: "clarity",
    label: "Clarté",
    maxScore: 20,
    description: "Le texte est concis, bien structuré et sans jargon non expliqué.",
    subcriteria: [
      { label: "Résumé concis (< 500 caractères)",          points: 5, rule: "basics.summary.length < 500" },
      { label: "Descriptions d'expérience concises",        points: 5, rule: "work[i].summary.length < 300 si présent" },
      { label: "Cohérence des temps verbaux",               points: 5, rule: "passé composé/imparfait pour postes terminés, présent pour poste en cours" },
      { label: "Absence de fautes visibles",                points: 5, rule: "orthographe et grammaire correctes" },
    ],
  },
  {
    key: "relevance",
    label: "Pertinence",
    maxScore: 20,
    description: "Les compétences et mots-clés sont à jour et adaptés au marché actuel.",
    subcriteria: [
      { label: "Compétences techniques récentes",           points: 8, rule: "Technologies et outils pertinents en 2024-2025" },
      { label: "Mots-clés sectoriels",                      points: 7, rule: "Vocabulaire propre au domaine professionnel ciblé" },
      { label: "Liens professionnels (LinkedIn, GitHub…)",  points: 5, rule: "basics.profiles ou basics.url renseigné" },
    ],
  },
  {
    key: "formatting",
    label: "Formatage",
    maxScore: 20,
    description: "La structure est cohérente, les dates uniformes et l'organisation logique.",
    subcriteria: [
      { label: "Format de dates cohérent",                  points: 6, rule: "YYYY-MM ou YYYY partout, pas de mélange" },
      { label: "Ordre chronologique inverse",               points: 7, rule: "Expériences et formations les plus récentes en premier" },
      { label: "Équilibre des sections",                    points: 4, rule: "Pas de section sur-développée au détriment des autres" },
      { label: "Localisation/contact complet",              points: 3, rule: "basics.location.city ou basics.location.region présent" },
    ],
  },
];

// ─── Format de retour attendu ─────────────────────────────────────────────────
// Ce type définit exactement ce que l'UI consomme.

export interface ReviewChecklist {
  label: string;
  passed: boolean;
}

export interface ReviewCategoryResult {
  score: number;
  maxScore: number;
  label: string;
  details: string;
  checklist: ReviewChecklist[];
}

export interface ReviewSuggestion {
  section: string;
  criterion: string;
  severity: "critical" | "warning" | "info";
  message: string;
  rewrite?: {
    original: string;
    improved: string;
  };
}

export interface ReviewResponse {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  categories: {
    completeness: ReviewCategoryResult;
    impact: ReviewCategoryResult;
    clarity: ReviewCategoryResult;
    relevance: ReviewCategoryResult;
    formatting: ReviewCategoryResult;
  };
  strengths: string[];
  suggestions: ReviewSuggestion[];
  summary: string;
}

// ─── Barème des notes ─────────────────────────────────────────────────────────

export const GRADE_SCALE: Record<ReviewResponse["grade"], { min: number; label: string }> = {
  A: { min: 90, label: "Excellent" },
  B: { min: 75, label: "Très bien" },
  C: { min: 60, label: "Bien" },
  D: { min: 45, label: "Passable" },
  F: { min: 0,  label: "À refaire" },
};

export function scoreToGrade(score: number): ReviewResponse["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}
