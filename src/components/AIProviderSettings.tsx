"use client";

import { useState, useEffect, useRef } from "react";
import { Settings2, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

type AIProvider = "openai" | "claude-cli" | "opencode";

const PROVIDER_META: Record<AIProvider, { label: string; icon: string; color: string }> = {
  openai:       { label: "OpenAI (API)",  icon: "✦", color: "text-emerald-500" },
  "claude-cli": { label: "Claude CLI",   icon: "◆", color: "text-amber-500"   },
  opencode:     { label: "OpenCode",     icon: "◎", color: "text-indigo-500"  },
};

const HEURISTIC_LABEL = "Heuristique";

export function AIProviderBadge({ provider }: { provider: AIProvider | "heuristic" | undefined }) {
  if (!provider) return null;
  if (provider === "heuristic") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-muted-foreground/20 bg-muted text-muted-foreground font-medium">
        ⚙ {HEURISTIC_LABEL}
      </span>
    );
  }
  const meta = PROVIDER_META[provider];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-current/20 bg-current/5 font-medium ${meta.color}`}>
      {meta.icon} {meta.label}
    </span>
  );
}

export function AIProviderSettings() {
  const [currentProvider, setCurrentProvider] = useState<AIProvider | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setCurrentProvider(d.provider as AIProvider))
      .catch(() => {});
  }, []);

  // Fermer en cliquant à l'extérieur.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function selectProvider(p: AIProvider) {
    if (p === currentProvider) { setOpen(false); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: p }),
      });
      if (res.ok) setCurrentProvider(p);
    } catch {
      console.error("Impossible de changer de provider");
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  const meta = currentProvider ? PROVIDER_META[currentProvider] : null;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 h-8 px-2.5"
        title="Changer de provider IA"
      >
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Settings2 className="w-3.5 h-3.5" />
        )}
        {meta && (
          <span className={`text-xs font-semibold hidden sm:inline ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border bg-popover shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Provider IA
            </p>
          </div>
          <div className="py-1">
            {(Object.keys(PROVIDER_META) as AIProvider[]).map((p) => {
              const m = PROVIDER_META[p];
              const isActive = p === currentProvider;
              return (
                <button
                  key={p}
                  onClick={() => selectProvider(p)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/70 ${
                    isActive ? "bg-muted/50" : ""
                  }`}
                >
                  <span className={`flex items-center gap-2 font-medium ${m.color}`}>
                    <span className="text-base leading-none">{m.icon}</span>
                    {m.label}
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-current opacity-70" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

