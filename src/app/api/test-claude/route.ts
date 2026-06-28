import { callClaudeCli } from "@/lib/ai/claudeCliClient";

export async function GET() {
  const result = await callClaudeCli("You are a test assistant.", "hello");
  return Response.json({ result });
}
