import { chromium } from "playwright";
import type { Resume } from "@/lib/schemas/resume";
import type { ThemeId } from "@/themes";

export async function generatePdf(resume: Resume, themeId: ThemeId | string, baseUrl: string): Promise<Buffer> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const url = `${baseUrl}/pdf-render?theme=${encodeURIComponent(themeId)}`;

    await page.goto(url, { waitUntil: "networkidle" });

    await page.evaluate((data) => {
      (window as unknown as Record<string, unknown>).__RESUME_DATA__ = { resume: data.resume, themeId: data.themeId };
      window.dispatchEvent(new CustomEvent("resume-data-ready"));
    }, { resume, themeId });

    await page.waitForTimeout(1000);

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
