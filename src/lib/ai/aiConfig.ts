import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export type AIProvider = "openai" | "claude-cli" | "opencode";

export const AVAILABLE_PROVIDERS: AIProvider[] = ["openai", "claude-cli", "opencode"];

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai:      "OpenAI (API)",
  "claude-cli": "Claude CLI",
  opencode:    "opencode",
};

// Fichier de persistance runtime (override sans redémarrer le serveur).
const CONFIG_FILE = join(process.cwd(), "data", "ai-config.json");

interface AIConfig {
  provider: AIProvider;
}

function readConfig(): AIConfig | null {
  try {
    if (!existsSync(CONFIG_FILE)) return null;
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) as AIConfig;
  } catch {
    return null;
  }
}

/**
 * Retourne le provider actif.
 * Ordre de priorité : data/ai-config.json > env AI_PROVIDER > "claude-cli"
 */
export function getActiveProvider(): AIProvider {
  const config = readConfig();
  if (config?.provider && AVAILABLE_PROVIDERS.includes(config.provider)) {
    return config.provider;
  }

  const envProvider = process.env.AI_PROVIDER as AIProvider | undefined;
  if (envProvider && AVAILABLE_PROVIDERS.includes(envProvider)) {
    return envProvider;
  }

  return "claude-cli";
}

/**
 * Persiste le provider dans data/ai-config.json.
 * Effet immédiat — pas besoin de redémarrer le serveur Next.js.
 */
export function setActiveProvider(provider: AIProvider): void {
  writeFileSync(CONFIG_FILE, JSON.stringify({ provider }, null, 2), "utf-8");
  console.log(`[ai-config] Provider mis à jour : ${provider}`);
}

