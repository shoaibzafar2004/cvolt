/**
 * Downloads all fonts used by resume templates into public/fonts/.
 * Run once: node scripts/download-fonts.mjs
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "..", "public", "fonts");

// Each entry: { file, url }
// URLs are the direct woff2 links returned by the Google Fonts CSS2 API
// (User-Agent: Chrome so the API returns woff2 format)
const FONTS = [
  // Inter
  {
    file: "inter-400.woff2",
    url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
  },
  {
    file: "inter-500.woff2",
    url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
  },
  {
    file: "inter-600.woff2",
    url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
  },
  {
    file: "inter-700.woff2",
    url: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
  },
  // Libre Franklin
  {
    file: "libre-franklin-300.woff2",
    url: "https://fonts.gstatic.com/s/librefranklin/v14/jizOREVItHgc8qDIbSTKq371KapNLUEalg.woff2",
  },
  {
    file: "libre-franklin-400.woff2",
    url: "https://fonts.gstatic.com/s/librefranklin/v14/jizDREVItHgc8qDIbSTKq371KapNLQ.woff2",
  },
  {
    file: "libre-franklin-600.woff2",
    url: "https://fonts.gstatic.com/s/librefranklin/v14/jizOREVItHgc8qDIbSTKq371KapNLUEKlg.woff2",
  },
  {
    file: "libre-franklin-700.woff2",
    url: "https://fonts.gstatic.com/s/librefranklin/v14/jizOREVItHgc8qDIbSTKq371KapNLUFulg.woff2",
  },
  // Lora
  {
    file: "lora-400.woff2",
    url: "https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOxE7fSWef6.woff2",
  },
  {
    file: "lora-600.woff2",
    url: "https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOxE7fSbOf6.woff2",
  },
  {
    file: "lora-700.woff2",
    url: "https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOxE7fSc-f6.woff2",
  },
  {
    file: "lora-400-italic.woff2",
    url: "https://fonts.gstatic.com/s/lora/v35/0QI8MX1D_JOxE7fSUiT4.woff2",
  },
  // Source Sans 3
  {
    file: "source-sans-300.woff2",
    url: "https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R3woAa8opPOrG97lwqDlO9C4Ym4fB3Ts.woff2",
  },
  {
    file: "source-sans-400.woff2",
    url: "https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R3woAa8opPOrG97lwqDlO9C4Ym4fB3Ts.woff2",
  },
  {
    file: "source-sans-600.woff2",
    url: "https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R3woAa8opPOrG97lwqDlO9C4Ym4fB3Ts.woff2",
  },
];

await mkdir(OUT, { recursive: true });

let ok = 0;
let fail = 0;

for (const { file, url } of FONTS) {
  const dest = join(OUT, file);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`✓  ${file}`);
    ok++;
  } catch (e) {
    console.error(`✗  ${file} — ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
