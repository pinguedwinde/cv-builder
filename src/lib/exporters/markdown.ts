import type { Resume } from "@/lib/schemas/resume";

function formatDate(date?: string): string {
  if (!date) return "Présent";
  const parts = date.split("-");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
      "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
    ];
    return `${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  }
  return date;
}

function dateRange(start?: string, end?: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!start && !end) return "";
  if (!end) return `Depuis ${s}`;
  return `${s} - ${e}`;
}

export function exportToMarkdown(resume: Resume): string {
  const lines: string[] = [];
  const b = resume.basics;

  if (b.name) lines.push(`# ${b.name}`);
  if (b.label) lines.push(`**${b.label}**`);
  lines.push("");

  const contact: string[] = [];
  if (b.email) contact.push(b.email);
  if (b.phone) contact.push(b.phone);
  if (b.url) contact.push(b.url);
  if (b.location?.city) {
    const loc = [b.location.city, b.location.countryCode].filter(Boolean).join(", ");
    contact.push(loc);
  }
  if (contact.length > 0) lines.push(contact.join(" | "));

  if (b.profiles && b.profiles.length > 0) {
    const profiles = b.profiles
      .filter((p) => p.url)
      .map((p) => `[${p.network}](${p.url})`)
      .join(" | ");
    if (profiles) lines.push(profiles);
  }
  lines.push("");

  if (b.summary) {
    lines.push("## Résumé");
    lines.push("");
    lines.push(b.summary);
    lines.push("");
  }

  if (resume.work && resume.work.length > 0) {
    lines.push("## Expérience Professionnelle");
    lines.push("");
    for (const w of resume.work) {
      const range = dateRange(w.startDate, w.endDate);
      lines.push(`### ${w.position || "Poste"} — ${w.name || "Entreprise"}`);
      if (range || w.location) {
        const meta = [range, w.location].filter(Boolean).join(" | ");
        lines.push(`*${meta}*`);
      }
      lines.push("");
      if (w.summary) lines.push(w.summary);
      if (w.highlights && w.highlights.length > 0) {
        lines.push("");
        for (const h of w.highlights) {
          lines.push(`- ${h}`);
        }
      }
      lines.push("");
    }
  }

  if (resume.education && resume.education.length > 0) {
    lines.push("## Formation");
    lines.push("");
    for (const e of resume.education) {
      const range = dateRange(e.startDate, e.endDate);
      lines.push(`### ${e.studyType || "Formation"} en ${e.area || "Domaine"} — ${e.institution || "Établissement"}`);
      if (range) lines.push(`*${range}*`);
      if (e.score) lines.push(`Note: ${e.score}`);
      if (e.courses && e.courses.length > 0) {
        lines.push("");
        lines.push("**Cours:** " + e.courses.join(", "));
      }
      lines.push("");
    }
  }

  if (resume.skills && resume.skills.length > 0) {
    lines.push("## Compétences");
    lines.push("");
    for (const s of resume.skills) {
      const kw = s.keywords && s.keywords.length > 0 ? s.keywords.join(", ") : "";
      lines.push(`- **${s.name}**${s.level ? ` (${s.level})` : ""}${kw ? `: ${kw}` : ""}`);
    }
    lines.push("");
  }

  if (resume.projects && resume.projects.length > 0) {
    lines.push("## Projets");
    lines.push("");
    for (const p of resume.projects) {
      const range = dateRange(p.startDate, p.endDate);
      const title = p.url ? `[${p.name}](${p.url})` : p.name;
      lines.push(`### ${title}`);
      if (range) lines.push(`*${range}*`);
      if (p.description) lines.push(p.description);
      if (p.highlights && p.highlights.length > 0) {
        lines.push("");
        for (const h of p.highlights) lines.push(`- ${h}`);
      }
      if (p.keywords && p.keywords.length > 0) {
        lines.push("");
        lines.push("**Technologies:** " + p.keywords.join(", "));
      }
      lines.push("");
    }
  }

  if (resume.languages && resume.languages.length > 0) {
    lines.push("## Langues");
    lines.push("");
    for (const l of resume.languages) {
      lines.push(`- **${l.language}**: ${l.fluency}`);
    }
    lines.push("");
  }

  if (resume.volunteer && resume.volunteer.length > 0) {
    lines.push("## Bénévolat");
    lines.push("");
    for (const v of resume.volunteer) {
      const range = dateRange(v.startDate, v.endDate);
      lines.push(`### ${v.position || "Rôle"} — ${v.organization || "Organisation"}`);
      if (range) lines.push(`*${range}*`);
      if (v.summary) lines.push(v.summary);
      if (v.highlights && v.highlights.length > 0) {
        lines.push("");
        for (const h of v.highlights) lines.push(`- ${h}`);
      }
      lines.push("");
    }
  }

  if (resume.certificates && resume.certificates.length > 0) {
    lines.push("## Certifications");
    lines.push("");
    for (const c of resume.certificates) {
      const date = formatDate(c.date);
      const name = c.url ? `[${c.name}](${c.url})` : c.name;
      lines.push(`- **${name}** — ${c.issuer || ""} (${date})`);
    }
    lines.push("");
  }

  if (resume.awards && resume.awards.length > 0) {
    lines.push("## Récompenses");
    lines.push("");
    for (const a of resume.awards) {
      const date = formatDate(a.date);
      lines.push(`- **${a.title}** — ${a.awarder || ""} (${date})`);
      if (a.summary) lines.push(`  ${a.summary}`);
    }
    lines.push("");
  }

  if (resume.interests && resume.interests.length > 0) {
    lines.push("## Centres d'intérêt");
    lines.push("");
    for (const i of resume.interests) {
      const kw = i.keywords && i.keywords.length > 0 ? i.keywords.join(", ") : "";
      lines.push(`- **${i.name}**${kw ? `: ${kw}` : ""}`);
    }
    lines.push("");
  }

  if (resume.references && resume.references.length > 0) {
    lines.push("## Références");
    lines.push("");
    for (const r of resume.references) {
      lines.push(`**${r.name}**`);
      lines.push(`> ${r.reference}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
