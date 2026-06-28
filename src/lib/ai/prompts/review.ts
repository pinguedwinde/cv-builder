import { dump } from "js-yaml";
import { REVIEW_CRITERIA, GRADE_SCALE } from "@/lib/ai/criteria/review";
import type { Resume } from "@/lib/schemas/resume";

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const criteriaBlock = REVIEW_CRITERIA.map((c) => {
    const subs = c.subcriteria
      .map((s) => `  - ${s.label} (${s.points} pts) : ${s.rule}`)
      .join("\n");
    return `### ${c.label} — max ${c.maxScore} pts\n${c.description}\nSous-critères :\n${subs}`;
  }).join("\n\n");

  const gradeBlock = Object.entries(GRADE_SCALE)
    .sort((a, b) => b[1].min - a[1].min)
    .map(([g, { min, label }]) => `  ${g} : >= ${min} pts — ${label}`)
    .join("\n");

  return `OUTPUT : JSON brut uniquement. Aucun markdown, aucun backtick, aucun texte avant ou après l'accolade ouvrante.

Tu es un évaluateur de CV. Tu appliques une grille de notation stricte et tu retournes un objet JSON structuré.

## Règles d'évaluation

1. Applique chaque sous-critère selon sa règle exacte, sans interprétation libre.
2. Scoring partiel pour les critères gradués (voir ci-dessous) ; binaire pour les critères booléens.
3. En cas de doute, attribue le score le plus bas justifiable par les éléments visibles.
4. overallScore = somme exacte des 5 scores de catégorie. Ne calcule jamais autrement.
5. La checklist de chaque catégorie reprend TOUS ses sous-critères, dans le même ordre qu'ici.

## Scoring gradué (critères non binaires)

**Impact — Verbes d'action (8 pts)**
Calcule le pourcentage de highlights qui commencent par un verbe d'action fort.
- 0 % : 0 pt
- 1–25 % : 2 pts
- 26–50 % : 4 pts
- 51–75 % : 6 pts
- 76–100 % : 8 pts

**Impact — Résultats chiffrés (8 pts)**
Présence de chiffres, %, volumes dans les highlights.
- Aucun chiffre dans aucun highlight : 0 pt
- Au moins un chiffre quelque part : 3 pts
- Au moins un chiffre par poste : 6 pts
- Plusieurs chiffres par poste : 8 pts

**Pertinence — Compétences techniques récentes (8 pts)**
Pertinence des technologies et outils listés par rapport au marché actuel (2024-2025).
- Aucune compétence technique : 0 pt
- Technologies obsolètes uniquement : 2 pts
- Mix obsolète/récent : 5 pts
- Compétences récentes et pertinentes : 8 pts

**Pertinence — Mots-clés sectoriels (7 pts)**
Vocabulaire propre au domaine professionnel du candidat.
- Absent : 0 pt
- Peu présent : 3 pts
- Bien présent : 7 pts

## Critères complets

${criteriaBlock}

## Barème

${gradeBlock}`;
}

// ─── Checklist template ───────────────────────────────────────────────────────

function buildChecklistTemplate(): string {
  return REVIEW_CRITERIA.map((c) => {
    const items = c.subcriteria
      .map((s) => `        { "label": "${s.label}", "passed": <true|false> }`)
      .join(",\n");
    return `    "${c.key}": {\n      "score": <0-${c.maxScore}>,\n      "maxScore": ${c.maxScore},\n      "label": "${c.label}",\n      "details": "<1-2 phrases expliquant le score>",\n      "checklist": [\n${items}\n      ]\n    }`;
  }).join(",\n");
}

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildUserPrompt(resume: Resume): string {
  const cvYaml = dump(resume, { indent: 2, lineWidth: 120, skipInvalid: true });

  return `Évalue ce CV selon la grille définie et retourne le JSON ci-dessous, complété.

<cv>
${cvYaml}
</cv>

Retourne UNIQUEMENT ce JSON complété, sans aucun texte avant ou après :

{
  "overallScore": <somme des 5 scores, entier 0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F" selon le barème>,
  "categories": {
${buildChecklistTemplate()}
  },
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "suggestions": [
    {
      "section": <"basics"|"work"|"education"|"skills"|"projects"|"certificates"|"languages">,
      "criterion": <"completeness"|"impact"|"clarity"|"relevance"|"formatting">,
      "severity": <"critical"|"warning"|"info">,
      "message": "<action concrète à effectuer>",
      "rewrite": { "original": "<texte actuel>", "improved": "<texte amélioré>" }
    }
  ],
  "summary": "<synthèse en 2-3 phrases>"
}

Rappels :
- Le champ "rewrite" est optionnel dans chaque suggestion : inclus-le uniquement si tu proposes une reformulation concrète.
- overallScore doit être la somme arithmétique exacte des 5 scores de catégorie.
- Tous les sous-critères de chaque checklist doivent apparaître, dans le même ordre que la grille.`;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const REVIEW_SYSTEM_PROMPT = buildSystemPrompt();

export function buildReviewUserPrompt(resume: Resume): string {
  return buildUserPrompt(resume);
}
