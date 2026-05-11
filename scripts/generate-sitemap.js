/* =========================================================
  scripts/generate-sitemap.js

  【目的】
  - 在 build 後產生 dist/sitemap.xml，告訴 Google 有哪些頁面
  - 動態從 live API 抓所有已發佈文章
  - 若 API 失敗則退回讀本機 index.json，不阻斷 build

  【使用方式】
  node scripts/generate-sitemap.js
  或被 npm run build:seo 自動串起

  【設定】
  - SITE_URL：正式網址，可用環境變數覆寫
  - API_URL：文章 API
========================================================= */

const fs = require("fs");
const path = require("path");
const https = require("https");

/* =========================
  設定
========================== */
const SITE_URL = process.env.SITE_URL || "https://chen-yi.tw";
const API_URL =
  process.env.ARTICLES_API_URL || "https://api.chen-yi.tw/api/articles";
const DIST_DIR = path.join(__dirname, "..", "dist");
const FALLBACK_INDEX = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "articles",
  "index.json",
);

/* =========================
  固定頁面（手動維護）
  priority: Google 用的相對權重 0.0-1.0
  changefreq: 預估更新頻率，給 Google 參考
========================== */
const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
  { path: "/booking", priority: 0.9, changefreq: "monthly" },
  { path: "/articles", priority: 0.7, changefreq: "daily" },
];

/* =========================
  fetch articles from API
  - 用 native https，避免額外裝 dependency
========================== */
function fetchArticles() {
  return new Promise((resolve, reject) => {
    const req = https.get(API_URL, { timeout: 8000 }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          resolve(Array.isArray(data.items) ? data.items : []);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("API timeout"));
    });
  });
}

/* =========================
  退回讀本地 index.json
========================== */
function readLocalIndex() {
  try {
    const raw = fs.readFileSync(FALLBACK_INDEX, "utf-8");
    const data = JSON.parse(raw);
    return (data.items || []).filter((a) => a.status === "published");
  } catch (e) {
    return [];
  }
}

/* =========================
  XML 跳脫
========================== */
function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* =========================
  日期格式化 YYYY-MM-DD
========================== */
function formatDate(d) {
  if (!d) return new Date().toISOString().slice(0, 10);
  // 支援 ISO 字串、YYYY-MM-DD、Date 物件
  const date = new Date(d);
  if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/* =========================
  產出 sitemap XML
========================== */
function buildSitemap(articles) {
  const urls = [];

  // 固定頁
  for (const r of STATIC_ROUTES) {
    urls.push({
      loc: `${SITE_URL}${r.path}`,
      lastmod: formatDate(new Date()),
      changefreq: r.changefreq,
      priority: r.priority.toFixed(1),
    });
  }

  // 文章頁
  for (const a of articles) {
    if (!a.slug) continue;
    // 只收 published（API 已過濾但保險起見再檢查）
    if (a.status && a.status !== "published") continue;
    urls.push({
      loc: `${SITE_URL}/articles/${xmlEscape(a.slug)}`,
      lastmod: formatDate(a.updatedAt || a.published_at || a.date),
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

/* =========================
  主流程
========================== */
async function main() {
  console.log("[sitemap] 開始產生 sitemap.xml");
  console.log("[sitemap] SITE_URL =", SITE_URL);

  // 確認 dist 存在
  if (!fs.existsSync(DIST_DIR)) {
    console.error("[sitemap] ❌ dist/ 不存在，請先跑 npm run build");
    process.exit(1);
  }

  // 拿文章列表
  let articles = [];
  try {
    console.log("[sitemap] 嘗試從 API 抓取文章：", API_URL);
    articles = await fetchArticles();
    console.log(`[sitemap] ✅ 從 API 取得 ${articles.length} 篇文章`);
  } catch (err) {
    console.warn("[sitemap] ⚠ API 失敗，改用本機 index.json：", err.message);
    articles = readLocalIndex();
    console.log(`[sitemap] 本機 fallback 取得 ${articles.length} 篇文章`);
  }

  // 產出 XML
  const xml = buildSitemap(articles);
  const outPath = path.join(DIST_DIR, "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf-8");

  console.log(
    `[sitemap] ✅ 已寫入 ${outPath}（共 ${
      STATIC_ROUTES.length + articles.length
    } 個 URL）`,
  );
  console.log(
    `[sitemap] 提交網址：https://search.google.com/search-console → Sitemap → 輸入 sitemap.xml`,
  );
}

main().catch((err) => {
  console.error("[sitemap] 失敗：", err);
  process.exit(1);
});
