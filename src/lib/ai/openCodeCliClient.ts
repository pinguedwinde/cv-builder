import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";

// Résoudre le binaire via env (override) ou depuis le PATH système.
const OPENCODE_BIN = process.env.OPENCODE_BIN || "opencode";

// Même répertoire que le runner claude CLI : CLAUDE.md interdit les outils.
const RUNNER_DIR = join(process.cwd(), "src/lib/ai/runner");
// Sous-dossier tmp isolé pour les fichiers par-appel (évite les race conditions).
const TMP_DIR = join(RUNNER_DIR, "tmp");

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

/**
 * Appelle opencode en mode non-interactif (`opencode run "..."`) et récupère le
 * résultat JSON depuis un fichier temporaire qu'opencode est chargé d'écrire.
 *
 * Stratégie fichier plutôt que stdout : opencode insère des headers et des
 * fences markdown dans stdout, rendant le parsing fragile. En lui demandant
 * explicitement d'écrire dans un fichier on obtient du JSON propre.
 */
export async function callOpenCodeCli(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 300_000
): Promise<string | null> {
  // Fichier unique par appel dans tmp/ pour permettre les connexions parallèles
  // sans race condition sur un fichier partagé.
  await mkdir(TMP_DIR, { recursive: true });
  const tmpFile = join(TMP_DIR, `opencode-result-${randomUUID()}.json`);

  // Prompt fusionné : system instructions + tâche + instruction fichier.
  const combinedPrompt = [
    "[SYSTEM INSTRUCTIONS]",
    systemPrompt,
    "",
    "[TASK]",
    userPrompt,
    "",
    `Write the raw JSON result (and nothing else) to the file: ${tmpFile}`,
    "Do not create any other files. Do not write anything to stdout.",
  ].join("\n");

  console.log("[opencode-cli] tmpFile :", tmpFile);
  console.log("[opencode-cli] cwd     :", RUNNER_DIR);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    // Idem claudeCliClient : supprimer NODE_OPTIONS pour ne pas planter le runtime.
    const { NODE_OPTIONS: _, ...cleanEnv } = process.env;

    const child = spawn(OPENCODE_BIN, ["run", combinedPrompt], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: RUNNER_DIR,
      env: cleanEnv,
    });

    let stderr = "";
    // On draine stdout sans le stocker (on lit le fichier à la place).
    child.stdout.on("data", () => {});
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    child.on("close", async (code, signal) => {
      console.log(`[opencode-cli] Processus terminé — code=${code} signal=${signal}`);
      if (stderr) console.warn("[opencode-cli] stderr :", stderr.slice(0, 500));

      if (code !== 0) {
        console.error(`[opencode-cli] Échec — code de sortie ${code}`);
        settle(null);
        return;
      }

      try {
        const raw = await readFile(tmpFile, "utf-8");
        const result = stripMarkdownFences(raw.trim());
        console.log("[opencode-cli] Résultat extrait :", result.slice(0, 200));
        // Nettoyage du fichier tmp après lecture.
        unlink(tmpFile).catch(() => {});
        settle(result);
      } catch (err) {
        console.error(
          "[opencode-cli] Impossible de lire le fichier temp :",
          err instanceof Error ? err.message : err
        );
        settle(null);
      }
    });

    child.on("error", (err) => {
      console.error("[opencode-cli] Erreur spawn :", err.message);
      settle(null);
    });

    const timer = setTimeout(() => {
      console.error(`[opencode-cli] Timeout atteint (${timeoutMs / 1000}s) — process tué`);
      child.kill("SIGTERM");
      settle(null);
    }, timeoutMs);
  });
}

