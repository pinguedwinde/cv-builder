import { chromium } from "playwright";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";

export async function generatePdf(resume: Resume, themeId: ThemeId | string, baseUrl: string): Promise<Buffer> {
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

    const url = `${baseUrl}/pdf-render?theme=${encodeURIComponent(themeId)}`;
    await page.goto(url, { waitUntil: "networkidle" });

    await page.evaluate((data) => {
      (window as unknown as Record<string, unknown>).__RESUME_DATA__ = { resume: data.resume, themeId: data.themeId };
      window.dispatchEvent(new CustomEvent("resume-data-ready"));
    }, { resume, themeId });

    // Wait for the theme to finish rendering (React double-rAF signal)
    await Promise.race([
      page.waitForFunction(() => (window as unknown as Record<string, unknown>).__PDF_READY__ === true),
      page.waitForTimeout(8000),
    ]);

    // Ensure all web fonts are loaded before capturing
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
