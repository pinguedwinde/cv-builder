import { spawn } from "child_process";
import { join } from "path";

const CLAUDE_BIN = "/opt/homebrew/bin/claude";

// Répertoire dédié avec son propre CLAUDE.md qui override les instructions du projet.
// process.cwd() = racine du projet (stable en dev et en prod Next.js, contrairement à __dirname).
const RUNNER_DIR = join(process.cwd(), "src/lib/ai/runner");

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

interface ClaudeCliOutput {
  type: string;
  subtype: string;
  is_error: boolean;
  result: string;
}

// Entoure une valeur de guillemets simples POSIX (gère les ' internes).
function sq(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

export async function callClaudeCli(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 300_000
): Promise<string | null> {
  const args = [
    "-p",
    "--output-format", "json",
    "--dangerously-skip-permissions",
    `--system-prompt`, systemPrompt,
    userPrompt,
  ];

  const exactCmd = `${CLAUDE_BIN} -p --output-format json --dangerously-skip-permissions --system-prompt ${sq(systemPrompt)} ${sq(userPrompt)}`;
  console.log("[claude-cli] Commande :", exactCmd);
  console.log("[claude-cli] cwd :", RUNNER_DIR);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    // NODE_OPTIONS est hérité de Next.js (--max-old-space-size, --enable-source-maps…)
    // et plante le runtime Node.js de claude CLI.
    const { NODE_OPTIONS: _, ...cleanEnv } = process.env;
    const child = spawn(CLAUDE_BIN, args, {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: RUNNER_DIR,
      env: cleanEnv,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    child.on("close", (code, signal) => {
      console.log(`[claude-cli] Processus terminé — code=${code} signal=${signal}`);
      if (stderr) console.warn("[claude-cli] stderr :", stderr.slice(0, 500));
      console.log("[claude-cli] stdout brut :", stdout.slice(0, 300));

      if (code !== 0) {
        console.error(`[claude-cli] Échec — code de sortie ${code}`);
        settle(null);
        return;
      }

      if (!stdout.trim()) {
        console.error("[claude-cli] stdout vide");
        settle(null);
        return;
      }

      try {
        const parsed: ClaudeCliOutput = JSON.parse(stdout);
        console.log("[claude-cli] Envelope JSON — type:", parsed.type, "is_error:", parsed.is_error, "result length:", parsed.result?.length ?? 0);

        if (parsed.is_error) {
          console.error("[claude-cli] is_error=true dans la réponse");
          settle(null);
          return;
        }
        if (!parsed.result) {
          console.error("[claude-cli] Champ result vide");
          settle(null);
          return;
        }

        const result = stripMarkdownFences(parsed.result);
        console.log("[claude-cli] Résultat extrait :", result.slice(0, 200));
        settle(result);
      } catch (err) {
        console.error("[claude-cli] Échec JSON.parse stdout :", err instanceof Error ? err.message : err);
        console.error("[claude-cli] stdout complet :", stdout.slice(0, 1000));
        settle(null);
      }
    });

    child.on("error", (err) => {
      console.error("[claude-cli] Erreur spawn :", err.message);
      settle(null);
    });

    const timer = setTimeout(() => {
      console.error(`[claude-cli] Timeout atteint (${timeoutMs / 1000}s) — process tué`);
      child.kill("SIGTERM");
      settle(null);
    }, timeoutMs);
  });
}
