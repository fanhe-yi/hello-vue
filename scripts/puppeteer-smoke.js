/* =========================
  puppeteer-smoke.js

  【目的】
  - 確認「本機 Chrome 能不能被 puppeteer 正常啟動」
  - 如果這步都卡/爆，prerender 一定也會卡/爆
========================== */

const puppeteer = require("puppeteer");

(async () => {
  /* =========================
    【設定】Chrome 路徑
    - 你已安裝 Chrome，macOS 預設路徑如下
  ========================== */
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

  console.log("[smoke] executablePath =", executablePath);

  /* =========================
    【啟動】嘗試開啟 headless Chrome
    - timeout: 0 避免 30 秒限制
    - args：mac 常用穩定參數（不放 --no-sandbox）
  ========================== */
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    timeout: 0,
    args: [
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });

  console.log("[smoke] launched");

  /* =========================
    【開頁】跑一個最簡單的頁面
  ========================== */
  const page = await browser.newPage();
  await page.goto("about:blank", { waitUntil: "domcontentloaded", timeout: 0 });

  console.log("[smoke] page ok");

  /* =========================
    【關閉】
  ========================== */
  await browser.close();
  console.log("[smoke] done");
})().catch((err) => {
  console.error("[smoke] FAILED:", err);
  process.exit(1);
});
