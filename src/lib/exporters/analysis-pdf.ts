import { chromium } from "playwright";

export async function generateAnalysisPdf(
  type: "review" | "match",
  resumeId: string,
  baseUrl: string
): Promise<Buffer> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--font-render-hinting=none",
      "--disable-lcd-text",
    ],
  });

  try {
    const page = await browser.newPage();

    // A4 at 96 CSS px/inch: 210mm = 794px, 297mm = 1122px
    await page.setViewportSize({ width: 794, height: 1122 });

    const url = `${baseUrl}/pdf-render/${type}?resumeId=${encodeURIComponent(resumeId)}`;
    await page.goto(url, { waitUntil: "networkidle" });

    await Promise.race([
      page.waitForFunction(() => (window as unknown as Record<string, unknown>).__PDF_READY__ === true),
      page.waitForTimeout(10000),
    ]);

    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
