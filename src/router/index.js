/* =========================
  【路由】Vue Router 設定檔
  目的：集中管理前台頁面路由，並保留既有架構不亂動
========================== */

import { createRouter, createWebHistory } from "vue-router";

/* =========================
  【既有頁面】你原本就有的頁面/元件
========================== */
import BookingForm from "../components/BookingForm.vue";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import NameologyView from "../views/NameologyView.vue";
import AdminUnavailable from "@/views/AdminUnavailable.vue";
import LiffBookingView from "@/views/LiffBookingView.vue";

/* =========================
  【新增頁面】文章：列表 + 內頁
  目的：提供 SEO 友善的公開文章路徑
========================== */
import ArticlesView from "../views/ArticlesView.vue";
import ArticleView from "../views/ArticleView.vue";

const routes = [
  /* =========================
    【首頁】
  ========================== */
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },

  /* =========================
    【預約頁】
  ========================== */
  {
    path: "/booking",
    name: "Booking",
    component: BookingForm,
  },

  /* =========================
    【關於頁】
  ========================== */
  {
    path: "/about",
    name: "About",
    component: AboutView,
  },

  /* =========================
    【姓名學工具】
  ========================== */
  {
    path: "/nameology",
    name: "Nameology",
    component: NameologyView,
  },

  /* =========================
    【文章頁】（新增）
    目的：先把公開文章路由跑通
    - /articles：文章列表
    - /articles/:slug：文章內頁
  ========================== */
  {
    path: "/articles",
    name: "Articles",
    component: ArticlesView,
  },
  {
    path: "/articles/:slug",
    name: "Article",
    component: ArticleView,
  },

  /* =========================
    【LIFF 預約】
  ========================== */
  {
    path: "/liff/booking",
    name: "LiffBooking",
    component: LiffBookingView,
  },

  /* =========================
    【隱藏後台】
  ========================== */
  {
    // ✅ 新後台路徑：只有你知道
    path: "/console-yi-2025",
    name: "AdminUnavailable",
    component: AdminUnavailable,
    meta: { requiresAdmin: true }, // 需要管理員 token
  },

  /* =========================
    【404】（選用）
    目的：未知路徑一律導回首頁，避免 SEO/使用者走到空頁
  ========================== */
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  /* =========================
    【history】
    目的：使用乾淨網址（無 #），配合你的部署設定
  ========================== */
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

/* 
==========================================================
✅ 【GA4：SPA 換頁追蹤】router.afterEach
目的：
- Vue 是 SPA（單頁應用），換頁不會真的重新載入 HTML
- GA4 只放 gtag 可能只記到第一次進站的 page_view
- 所以每次路由切換後，我們手動送一次 page_view
==========================================================
*/
router.afterEach((to) => {
  /* 
  ----------------------------------------------------------
  ✅ 目的：確保在瀏覽器環境（避免未來 prerender / SSR 時報錯）
  ----------------------------------------------------------
  */
  if (typeof window === "undefined") return;

  /* 
  ----------------------------------------------------------
  ✅ 目的：確認 gtag 已經存在
  - index.html 已加 GA4 後，window.gtag 會是 function
  - 若尚未載入完成，先跳過避免噴錯
  ----------------------------------------------------------
  */
  if (typeof window.gtag !== "function") return;

  /* 
  ----------------------------------------------------------
  ✅ 目的：組出「目前頁面路徑」（含 query）
  - 例如：/articles/abc?ref=ig
  ----------------------------------------------------------
  */
  const pagePath = to.fullPath;

  /* 
  ----------------------------------------------------------
  ✅ 目的：送出 page_view
  - GA4 會把它當作一次「新的頁面瀏覽」
  ----------------------------------------------------------
  */
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: document.title,
  });
});

export default router;
