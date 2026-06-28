import { dump } from "js-yaml";
import { REVIEW_CRITERIA, GRADE_SCALE } from "@/lib/ai/criteria/review";
import type { Resume } from "@/lib/schemas/resume";

// ─── Prompt système ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const criteriaBlock = REVIEW_CRITERIA.map((c) => {
    const subs = c.subcriteria
      .map((s) => `    - ${s.label} (${s.points} pts) : ${s.rule}`)
      .join("\n");
    return `## ${c.label} — ${c.maxScore} pts\n${c.description}\nSous-critères :\n${subs}`;
  }).join("\n\n");

  const gradeBlock = Object.entries(GRADE_SCALE)
    .sort((a, b) => b[1].min - a[1].min)
    .map(([g, { min, label }]) => `  ${g} : >= ${min} pts — ${label}`)
    .join("\n");

  return `Tu es un expert en recrutement et en rédaction de CV avec 15 ans d'expérience.
Tu analyses des CV de façon rigoureuse, constructive et actionnable.

# Critères d'évaluation (total : 100 pts)

${criteriaBlock}

# Barème des notes

${gradeBlock}

# Règles
- Évalue chaque sous-critère indépendamment et attribue les points correspondants.
- Les suggestions doivent être concrètes : si tu proposes une réécriture, fournis l'original et la version améliorée.
- Les "strengths" doivent mettre en valeur ce que le candidat fait déjà bien.
- Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour.`;
}

// ─── Prompt utilisateur ───────────────────────────────────────────────────────

const RETURN_FORMAT = `{
  "overallScore": <number 0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "categories": {
    "completeness": {
      "score": <number 0-20>,
      "maxScore": 20,
      "label": "Complétude",
      "details": "<string : explication du score en 1-2 phrases>",
      "checklist": [
        { "label": "<string>", "passed": <boolean> }
      ]
    },
    "impact": {
      "score": <number 0-20>,
      "maxScore": 20,
      "label": "Impact",
      "details": "<string>",
      "checklist": [{ "label": "<string>", "passed": <boolean> }]
    },
    "clarity": {
      "score": <number 0-20>,
      "maxScore": 20,
      "label": "Clarté",
      "details": "<string>",
      "checklist": [{ "label": "<string>", "passed": <boolean> }]
    },
    "relevance": {
      "score": <number 0-20>,
      "maxScore": 20,
      "label": "Pertinence",
      "details": "<string>",
      "checklist": [{ "label": "<string>", "passed": <boolean> }]
    },
    "formatting": {
      "score": <number 0-20>,
      "maxScore": 20,
      "label": "Formatage",
      "details": "<string>",
      "checklist": [{ "label": "<string>", "passed": <boolean> }]
    }
  },
  "strengths": ["<string>"],
  "suggestions": [
    {
      "section": "<string : basics|work|education|skills|projects|certificates|languages>",
      "criterion": "<string : completeness|impact|clarity|relevance|formatting>",
      "severity": "<string : critical|warning|info>",
      "message": "<string>",
      "rewrite": {
        "original": "<string>",
        "improved": "<string>"
      }
    }
  ],
  "summary": "<string : synthèse globale en 2-3 phrases>"
}`;

function buildUserPrompt(resume: Resume): string {
  const cvYaml = dump(resume, { indent: 2, lineWidth: 120, skipInvalid: true });

  return `Analyse ce CV et retourne une évaluation complète.

## CV du candidat (format YAML)

\`\`\`yaml
${cvYaml}
\`\`\`

## Format de retour attendu (JSON strict)

Retourne UNIQUEMENT ce JSON, sans aucun texte avant ou après :

${RETURN_FORMAT}

Notes :
- Le champ "rewrite" dans suggestions est optionnel : inclus-le uniquement quand tu proposes une réécriture concrète.
- La checklist de chaque catégorie doit reprendre les sous-critères définis, avec passed=true si le critère est rempli.
- overallScore = somme des scores des 5 catégories.`;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const REVIEW_SYSTEM_PROMPT = buildSystemPrompt();

export function buildReviewUserPrompt(resume: Resume): string {
  return buildUserPrompt(resume);
}
