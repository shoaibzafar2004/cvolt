import "server-only";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// Accepts pre-rendered HTML string — callers handle react-dom/server themselves.
// This keeps pdf.ts free of React rendering imports, avoiding Turbopack RSC bundle issues.
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  // <base href> resolves /fonts/* relative URLs without navigating to the app first.
  // Navigating to the app URL first was causing Next.js's hydration JS to re-render
  // the page back to the home page after setContent was called.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <base href="${appUrl}/" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 794px; background: white; }
  </style>
</head>
<body>${html}</body>
</html>`;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 794, height: 5000 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(buffer);
  } finally {
    await browser.close();
  }
}
