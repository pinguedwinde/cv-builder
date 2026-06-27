import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
