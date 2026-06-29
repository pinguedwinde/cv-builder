import { NextRequest, NextResponse } from "next/server";
import {
  getActiveProvider,
  setActiveProvider,
  AVAILABLE_PROVIDERS,
  PROVIDER_LABELS,
} from "@/lib/ai/aiConfig";
import type { AIProvider } from "@/lib/ai/aiConfig";

export async function GET() {
  return NextResponse.json({
    provider: getActiveProvider(),
    available: AVAILABLE_PROVIDERS,
    labels: PROVIDER_LABELS,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!AVAILABLE_PROVIDERS.includes(provider as AIProvider)) {
      return NextResponse.json(
        { error: `Provider invalide. Valeurs acceptées : ${AVAILABLE_PROVIDERS.join(", ")}` },
        { status: 400 }
      );
    }

    setActiveProvider(provider as AIProvider);
    return NextResponse.json({ provider });
  } catch {
    return NextResponse.json({ error: "Impossible de mettre à jour les paramètres" }, { status: 500 });
  }
}

