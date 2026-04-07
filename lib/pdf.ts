import 'server-only'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

// Accepts pre-rendered HTML string — callers handle react-dom/server themselves.
// This keeps pdf.ts free of React rendering imports, avoiding Turbopack RSC bundle issues.
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 794px; background: white; }
  </style>
</head>
<body>${html}</body>
</html>`

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath: await chromium.executablePath(),
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    return Buffer.from(buffer)
  } finally {
    await browser.close()
  }
}
