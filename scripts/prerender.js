/* =========================
  scripts/prerender.js

  【目的】
  - 不走 webpack plugin（避免卡死）
  - 先用本機 Chrome 開啟 dist 的 SPA
  - 逐條路由截取完整 HTML
  - 寫回 dist/<route>/index.html
  - 全程有 log：你會知道卡在哪一條

  【使用方式】
  1) npm run build
  2) node scripts/prerender.js
========================== */

const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

/* =========================
  【設定】dist 目錄與 Chrome 路徑
  - executablePath 若你要改，用環境變數覆蓋即可
========================== */
const DIST_DIR = path.join(__dirname, "..", "dist");
const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/* =========================
  【文章索引】用來產生 prerender 路由
  注意：這裡直接讀檔，避免 require cache / path 差異
========================== */
const INDEX_PATH = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "articles",
  "index.json",
);

/* =========================
  【工具】安全讀 JSON
========================== */
function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/* =========================
  【sleep】取代 page.waitForTimeout（某些 puppeteer 版本沒有它）
========================== */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* =========================
  【工具】判斷是否為檔案請求
  目的：像 /js/app.xxx.js /css/app.xxx.css 這種就直接回傳檔案
========================== */
function looksLikeFileRequest(urlPath) {
  return /\.[a-zA-Z0-9]{2,5}($|\?)/.test(urlPath);
}

/* =========================
  【工具】讀檔（簡單版）
========================== */
function readFileSafe(absPath) {
  try {
    return fs.readFileSync(absPath);
  } catch (e) {
    return null;
  }
}

/* =========================
  【工具】簡單 Content-Type
========================== */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".woff") return "font/woff";
  if (ext === ".woff2") return "font/woff2";
  return "application/octet-stream";
}

/* =========================
  【Server】用 Node 起一個靜態 server 服務 dist
  目的：
  - 讓 puppeteer 用 http://localhost:PORT 讀取頁面
  - SPA 路由（/articles/xxx）回 dist/index.html
========================== */
function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, "http://localhost");
      let reqPath = decodeURIComponent(url.pathname);

      /* =========================
        【安全】避免 .. path traversal
      ========================== */
      reqPath = reqPath.replace(/\.\./g, "");

      /* =========================
        【檔案請求】優先回 dist 對應資源
      ========================== */
      if (looksLikeFileRequest(reqPath)) {
        const abs = path.join(DIST_DIR, reqPath);
        const buf = readFileSafe(abs);
        if (!buf) {
          res.statusCode = 404;
          res.end("Not Found");
          return;
        }
        res.setHeader("Content-Type", getContentType(abs));
        res.statusCode = 200;
        res.end(buf);
        return;
      }

      /* =========================
        【SPA 路由】一律回 dist/index.html
        目的：讓前端 router 接管 /articles /articles/:slug
      ========================== */
      const indexAbs = path.join(DIST_DIR, "index.html");
      const indexBuf = readFileSafe(indexAbs);
      if (!indexBuf) {
        res.statusCode = 500;
        res.end("dist/index.html not found. Did you run npm run build?");
        return;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.statusCode = 200;
      res.end(indexBuf);
    });

    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });

    server.on("error", reject);
  });
}

/* =========================
  【工具】把 route 對應寫到 dist/<route>/index.html
========================== */
function routeToOutputPath(route) {
  if (route === "/") return path.join(DIST_DIR, "index.html");

  const clean = route.replace(/^\//, ""); // remove leading '/'
  return path.join(DIST_DIR, clean, "index.html");
}

/* =========================
  【工具】確保資料夾存在
========================== */
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

/* =========================
  【主程式】
========================== */
(async () => {
  /* =========================
    【前置】確認 dist 存在
  ========================== */
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error("dist/ not found. Please run: npm run build");
  }

  /* =========================
    【產 routes】固定頁 + 已發佈文章
  ========================== */
  const idx = readJson(INDEX_PATH);
  const published = (idx.items || []).filter((a) => a.status === "published");

  const routes = [
    /* =========================
      固定頁
    ========================== */
    "/",
    "/about",
    "/articles",

    /* =========================
      文章頁
    ========================== */
    ...published.map((a) => `/articles/${a.slug}`),
  ];

  console.log("[prerender] routes =", routes);

  /* =========================
    【起 server】
  ========================== */
  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log("[prerender] server =", baseUrl);

  /* =========================
    【啟動 Chrome】
  ========================== */
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
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

  try {
    /* =========================
      【逐條 prerender】
      - 每條 route 都會 log：開始/完成
      - waitUntil 用 domcontentloaded（不等 network idle，避免外部資源卡）
      - 再額外等一下讓你 async import(JSON) 跑完
    ========================== */
    for (const r of routes) {
      const url = baseUrl + r;

      console.log(`[prerender] start  ${r}`);
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

      /* =========================
        【等待】避免內容還在「載入中…」
        目的：你的 ArticleView 會 async import JSON
        - 最多等 10 秒
      ========================== */
      await page
        .waitForFunction(
          () => {
            const t = document.title || "";
            return t && !t.includes("載入中");
          },
          { timeout: 10000 },
        )
        .catch(() => {
          /* =========================
          保險：如果 title 沒更新，也至少等固定時間
        ========================== */
        });

      await sleep(600);

      const html = await page.content();

      const outPath = routeToOutputPath(r);
      ensureDir(outPath);
      fs.writeFileSync(outPath, html, "utf-8");

      await page.close();
      console.log(
        `[prerender] done   ${r} -> ${path.relative(process.cwd(), outPath)}`,
      );
    }

    console.log("[prerender] ALL DONE");
  } finally {
    /* =========================
      【收尾】關 browser + server
    ========================== */
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error("[prerender] FAILED:", err);
  process.exit(1);
});
