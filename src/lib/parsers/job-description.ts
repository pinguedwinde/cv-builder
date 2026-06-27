import { PDFParse } from "pdf-parse";

export async function parseJobFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse(new Uint8Array(buffer));
  const result = await parser.getText();
  parser.destroy();
  return result.text || "";
}

export function parseJobFromText(text: string): string {
  return text.trim();
}

export async function fetchJobFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CVBuilder/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

export async function parseJobDescription(input: {
  type: "pdf" | "text" | "url";
  content: string | Buffer;
}): Promise<string> {
  switch (input.type) {
    case "pdf":
      return parseJobFromPdf(input.content as Buffer);
    case "text":
      return parseJobFromText(input.content as string);
    case "url":
      return fetchJobFromUrl(input.content as string);
    default:
      throw new Error(`Unsupported input type: ${input.type}`);
  }
}
