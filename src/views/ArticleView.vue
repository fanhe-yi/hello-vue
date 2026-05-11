<template>
  <div class="article-page">
    <!-- 閱讀進度條（黏在頂端） -->
    <div class="read-progress" :style="{ width: progress + '%' }"></div>

    <article class="article-card reveal">
      <!-- Article header -->
      <header class="article-head">
        <router-link to="/articles" class="back-link" aria-label="回文章列表">
          <span class="back-arrow">←</span>
          <span>回文章列表</span>
        </router-link>

        <p class="eyebrow">梵和易學 · JOURNAL</p>

        <h1 class="title">{{ article.title }}</h1>

        <div class="meta">
          <span v-if="article.date" class="meta-date">
            {{ formatDate(article.date) }}
          </span>
          <span v-if="article.date && article.tags && article.tags.length" class="meta-dot">·</span>
          <div v-if="article.tags && article.tags.length" class="tags">
            <span v-for="t in article.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </header>

      <!-- Loading skeleton -->
      <div v-if="loadingState === 'loading'" class="skeleton-content">
        <div class="skeleton-line skeleton-h2"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line skeleton-h3"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>

      <!-- Article content -->
      <div
        v-else
        class="content"
        v-html="article.content_html"
      ></div>

      <!-- 相關文章推薦 -->
      <section
        v-if="loadingState !== 'loading' && relatedArticles.length"
        class="related-section"
      >
        <div class="related-header">
          <span class="related-bar" aria-hidden="true"></span>
          <h2 class="related-title">你可能也想看</h2>
        </div>
        <div class="related-grid">
          <router-link
            v-for="a in relatedArticles"
            :key="a.slug"
            :to="`/articles/${a.slug}`"
            class="related-card"
          >
            <div class="related-card-tags" v-if="a.tags && a.tags.length">
              <span class="related-card-tag" v-for="t in a.tags.slice(0, 2)" :key="t">
                {{ t }}
              </span>
            </div>
            <h3 class="related-card-title">{{ a.title }}</h3>
            <p v-if="a.excerpt" class="related-card-excerpt">{{ a.excerpt }}</p>
            <div class="related-card-foot">
              <span class="related-card-date">{{ formatDate(a.date) }}</span>
              <span
                v-if="typeof a.viewCount === 'number'"
                class="related-card-views"
                :title="`${a.viewCount.toLocaleString()} 次瀏覽`"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                </svg>
                {{ formatViewCount(a.viewCount) }}
              </span>
              <span class="related-card-arrow" aria-hidden="true">→</span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Footer：分享 + 回列表 -->
      <footer v-if="loadingState !== 'loading'" class="article-foot">
        <div class="share-row">
          <span class="share-label">分享這篇</span>
          <div class="share-btns">
            <a
              class="share-btn line"
              :href="shareLineUrl"
              target="_blank"
              rel="noopener"
              aria-label="分享到 LINE"
              title="LINE"
            >Line</a>
            <a
              class="share-btn fb"
              :href="shareFbUrl"
              target="_blank"
              rel="noopener"
              aria-label="分享到 Facebook"
              title="Facebook"
            >FB</a>
            <a
              class="share-btn th"
              :href="shareThreadsUrl"
              target="_blank"
              rel="noopener"
              aria-label="分享到 Threads"
              title="Threads"
            >@</a>
            <button
              class="share-btn copy"
              type="button"
              @click="copyLink"
              :aria-label="copied ? '已複製' : '複製連結'"
              :title="copied ? '已複製' : '複製連結'"
            >
              {{ copied ? '✓' : '⧉' }}
            </button>
          </div>
        </div>

        <div class="foot-actions">
          <router-link to="/articles" class="foot-btn secondary">
            ← 看更多文章
          </router-link>
          <router-link
            to="/booking"
            class="foot-btn primary"
            @click="trackBookingClick"
          >
            預約論命 →
          </router-link>
        </div>
      </footer>
    </article>
  </div>
</template>

<script>
export default {
  name: "ArticleView",
  data() {
    return {
      article: {
        title: "載入中…",
        date: "",
        tags: [],
        content_html: "",
      },
      loadingState: "loading", // loading | ok | notfound
      progress: 0,
      copied: false,
      relatedArticles: [],
    };
  },
  async created() {
    await this.loadArticle();
  },
  mounted() {
    window.addEventListener("scroll", this.updateProgress, { passive: true });
    window.addEventListener("resize", this.updateProgress);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.updateProgress);
    window.removeEventListener("resize", this.updateProgress);
  },
  watch: {
    "$route.params.slug": {
      immediate: false,
      handler() {
        this.loadingState = "loading";
        this.loadArticle();
        window.scrollTo({ top: 0 });
      },
    },
  },
  computed: {
    shareUrl() {
      if (typeof window === "undefined") return "";
      return window.location.href;
    },
    shareTitle() {
      return `${this.article.title || "文章"} ｜梵和易學`;
    },
    shareLineUrl() {
      return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(this.shareUrl)}`;
    },
    shareFbUrl() {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`;
    },
    shareThreadsUrl() {
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(this.shareTitle + " " + this.shareUrl)}`;
    },
  },
  methods: {
    formatDate(d) {
      if (!d) return "";
      const m = String(d).match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (m) return `${m[1]}.${m[2].padStart(2, "0")}.${m[3].padStart(2, "0")}`;
      return d;
    },
    /* 瀏覽數格式化：999 → "999"，1234 → "1.2k"，12345 → "12k" */
    formatViewCount(n) {
      if (typeof n !== "number" || isNaN(n) || n < 0) return "0";
      if (n < 1000) return String(n);
      if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      return Math.round(n / 1000) + "k";
    },
    updateProgress() {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) {
        this.progress = 0;
        return;
      }
      const pct = (h.scrollTop / total) * 100;
      this.progress = Math.max(0, Math.min(100, pct));
    },
    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = this.shareUrl;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {} // eslint-disable-line no-empty, no-unused-vars
        document.body.removeChild(ta);
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      }
    },
    trackBookingClick() {
      if (typeof window.gtag === "function") {
        window.gtag("event", "click_booking", {
          event_category: "engagement",
          event_label: "article_footer",
        });
      }
    },

    /* ============================================
       【瀏覽數計數】recordView
       三層過濾：
       1. 跳過 SSR / prerender / headless 瀏覽器
       2. 跳過 dev 環境（避免測試把數字搞亂）
       3. localStorage 同一 slug 30 分鐘內只算一次
       發送失敗靜默吞掉，不影響閱讀體驗
       ============================================ */
    async recordView(slug) {
      // 1. 環境檢查
      if (typeof window === "undefined") return;
      if (typeof navigator !== "undefined" && navigator.webdriver) return;
      if (
        typeof navigator !== "undefined" &&
        /HeadlessChrome|Puppeteer/i.test(navigator.userAgent || "")
      ) {
        return;
      }

      // 2. 跳過 dev 環境
      if (process.env.NODE_ENV !== "production") return;

      // 3. localStorage 30 分鐘 dedup
      try {
        const key = `view:${slug}`;
        const last = Number(localStorage.getItem(key) || 0);
        const now = Date.now();
        if (now - last < 30 * 60 * 1000) return;
        localStorage.setItem(key, String(now));
      } catch (e) {
        // localStorage 不可用（隱私模式 / 容量滿）：直接放行，不擋計數
      }

      // 4. 送出（失敗靜默）
      try {
        await fetch(
          `https://api.chen-yi.tw/api/articles/${encodeURIComponent(slug)}/view`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // 不需要等回應，也不處理錯誤
          },
        );
      } catch (e) {
        // 故意忽略：瀏覽數不該干擾使用者
      }
    },
    async loadArticle() {
      const slug = this.$route.params.slug;
      try {
        const res = await fetch(`https://api.chen-yi.tw/api/articles/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        this.article = {
          title: data?.meta?.title || "（無標題）",
          date: data?.meta?.date || "",
          tags: data?.meta?.tags || [],
          description: data?.meta?.description || "",
          coverImage: data?.meta?.coverImage || "",
          content_html: data?.content_html || "<p></p>",
        };
        this.loadingState = "ok";
        this.applySeoMeta();
        this.$nextTick(() => {
          document.dispatchEvent(new Event("x-app-rendered"));
          this.updateProgress();
        });
        /* ============================================
           瀏覽數計數：成功載入後觸發（內部會自動過濾 prerender / dev / 30分dedup）
           ============================================ */
        this.recordView(slug);

        /* 並行抓相關文章（不擋主流程） */
        this.fetchRelatedArticles();
      } catch (e) {
        this.article = {
          title: "找不到這篇文章",
          date: "",
          tags: [],
          description: "",
          coverImage: "",
          content_html: "<p>這篇文章可能還沒發佈，或網址連結有誤。</p>",
        };
        this.loadingState = "notfound";
        this.applySeoMeta();
        this.$nextTick(() => {
          document.dispatchEvent(new Event("x-app-rendered"));
        });
      }
    },

    /* ============================================
       相關文章：抓全列表 → 過濾共同 tag → 排除自己 → 取前 3 篇
       ============================================ */
    async fetchRelatedArticles() {
      try {
        const res = await fetch("https://api.chen-yi.tw/api/articles");
        const data = await res.json();
        if (!res.ok) return;

        const currentSlug = this.$route.params.slug;
        const currentTags = new Set(this.article?.tags || []);
        const all = (data.items || []).filter((a) => a.slug !== currentSlug);

        // 計算每篇文章與當前文章的 tag 交集數
        const scored = all.map((a) => {
          const tags = a.tags || [];
          const overlap = tags.filter((t) => currentTags.has(t)).length;
          return { a, overlap };
        });

        // 有交集的優先，按交集多寡排；沒交集的當補位（按日期新到舊）
        scored.sort((x, y) => {
          if (y.overlap !== x.overlap) return y.overlap - x.overlap;
          return new Date(y.a.date) - new Date(x.a.date);
        });

        this.relatedArticles = scored.slice(0, 3).map(({ a }) => ({
          slug: a.slug,
          title: a.title,
          date: a.date,
          excerpt: a.description || "",
          tags: a.tags || [],
          viewCount: typeof a.viewCount === "number" ? a.viewCount : undefined,
        }));
      } catch (err) {
        this.relatedArticles = [];
        // eslint-disable-next-line no-console
        console.warn("[article] 載入相關文章失敗：", err);
      }
    },

    /* ============================================
       SEO 主函式：補齊 description / OG / Twitter / canonical / JSON-LD
       ============================================ */
    applySeoMeta() {
      const a = this.article || {};
      const SITE = "梵和易學";
      const AUTHOR = "陳逸";

      // 標題：文章名｜站名
      const fullTitle = a.title ? `${a.title}｜${SITE}` : `${SITE}｜文章`;
      document.title = fullTitle;

      // 描述：優先用後台的 description，沒填才從 content_html 抽前 120 字
      let desc = (a.description || "").trim();
      if (!desc) {
        const raw = (a.content_html || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        desc = raw.slice(0, 120);
      }
      desc = desc || `${SITE}｜文章內容`;

      // 當前頁面網址（canonical / og:url）
      const url = typeof window !== "undefined" ? window.location.href : "";
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      // 封面圖：後台有填用後台的，否則用站台預設 og 圖
      const image = a.coverImage
        ? (a.coverImage.startsWith("http") ? a.coverImage : origin + a.coverImage)
        : origin + "/og-default.jpg"; // 你之後可放一張預設封面在 public/og-default.jpg

      // === 基本 ===
      this.upsertMeta("name", "description", desc);
      if (a.tags && a.tags.length) {
        this.upsertMeta("name", "keywords", a.tags.join(","));
      }
      this.upsertMeta("name", "author", AUTHOR);

      // === Open Graph (LINE / FB / Threads 分享預覽) ===
      this.upsertMeta("property", "og:type", "article");
      this.upsertMeta("property", "og:title", fullTitle);
      this.upsertMeta("property", "og:description", desc);
      this.upsertMeta("property", "og:url", url);
      this.upsertMeta("property", "og:site_name", SITE);
      this.upsertMeta("property", "og:locale", "zh_TW");
      if (image) this.upsertMeta("property", "og:image", image);
      if (a.date) this.upsertMeta("property", "article:published_time", a.date);
      this.upsertMeta("property", "article:author", AUTHOR);

      // article:tag 可以多筆 → 先清空再重塞
      document.head
        .querySelectorAll('meta[property="article:tag"]')
        .forEach((el) => el.remove());
      (a.tags || []).forEach((t) => {
        const el = document.createElement("meta");
        el.setAttribute("property", "article:tag");
        el.setAttribute("content", t);
        document.head.appendChild(el);
      });

      // === Twitter Card ===
      this.upsertMeta(
        "name",
        "twitter:card",
        image ? "summary_large_image" : "summary",
      );
      this.upsertMeta("name", "twitter:title", fullTitle);
      this.upsertMeta("name", "twitter:description", desc);
      if (image) this.upsertMeta("name", "twitter:image", image);

      // === canonical ===
      if (url) this.upsertCanonical(url);

      // === JSON-LD (Google 結構化資料) ===
      this.upsertJsonLd({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title || SITE,
        description: desc,
        ...(image ? { image: [image] } : {}),
        ...(a.date ? { datePublished: a.date, dateModified: a.date } : {}),
        author: {
          "@type": "Person",
          name: AUTHOR,
          url: origin + "/about",
        },
        publisher: {
          "@type": "Organization",
          name: SITE,
          logo: {
            "@type": "ImageObject",
            url: origin + "/og-default.jpg",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        ...(a.tags && a.tags.length ? { keywords: a.tags.join(", ") } : {}),
      });
    },

    /* ============================================
       工具：upsert meta / canonical / JSON-LD
       ============================================ */
    upsertMeta(attr, key, value) {
      if (value === undefined || value === null || value === "") return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", String(value));
    },

    upsertCanonical(href) {
      let el = document.head.querySelector('link[rel="canonical"]');
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    },

    upsertJsonLd(obj) {
      let el = document.head.querySelector(
        'script[type="application/ld+json"][data-article]',
      );
      if (!el) {
        el = document.createElement("script");
        el.setAttribute("type", "application/ld+json");
        el.setAttribute("data-article", "");
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(obj);
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

.article-page {
  --ink: #2a1f1a;
  --ink-soft: #4a423b;
  --ink-mute: #6b6157;
  --paper: rgba(255, 252, 247, 0.94);
  --gold: #a78550;
  --seal: #b93a32;
  --seal-deep: #962820;
  --line: rgba(60, 40, 25, 0.14);
  --line-soft: rgba(60, 40, 25, 0.08);
  --shadow-md: 0 14px 32px rgba(60, 40, 25, 0.09);

  display: flex;
  justify-content: center;
  padding: 8px 0 32px;
  font-family: "LXGW WenKai", "Noto Serif SC", -apple-system, sans-serif;
  color: var(--ink);
}

/* 閱讀進度條 */
.read-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--seal), var(--gold));
  z-index: 50;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px rgba(185, 58, 50, 0.4);
}

.reveal {
  animation: reveal 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.article-card {
  width: min(740px, 100%);
  background: var(--paper);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 24px;
  padding: 36px 44px 32px;
  box-shadow: var(--shadow-md);
}

/* ============================================
   Header
   ============================================ */
.article-head {
  border-bottom: 1px solid var(--line-soft);
  padding-bottom: 24px;
  margin-bottom: 28px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--ink-mute);
  font-size: 13px;
  margin-bottom: 18px;
  padding: 6px 10px 6px 4px;
  border-radius: 999px;
  transition: color 0.2s ease, background 0.2s ease;
}

.back-link:hover {
  color: var(--seal);
  background: rgba(185, 58, 50, 0.06);
}

.back-arrow {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.back-link:hover .back-arrow {
  transform: translateX(-3px);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 11px;
  letter-spacing: 0.32em;
  color: var(--gold);
  font-weight: 500;
}

.title {
  margin: 0 0 16px;
  font-family: "Noto Serif SC", serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-mute);
}

.meta-date {
  font-family: "Noto Serif SC", sans-serif;
  letter-spacing: 0.04em;
}

.meta-dot {
  opacity: 0.5;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(167, 133, 80, 0.1);
  color: var(--gold);
  border: 1px solid rgba(167, 133, 80, 0.22);
  font-family: "Noto Serif SC", sans-serif;
}

/* ============================================
   Content (給 v-html 用)
   ============================================ */
.content {
  font-family: "LXGW WenKai", "Noto Serif SC", serif;
  font-size: 16px;
  line-height: 1.95;
  color: var(--ink-soft);
}

.content :deep(p) {
  margin: 0 0 18px;
  font-size: 16px;
  line-height: 1.95;
  color: var(--ink-soft);
}

.content :deep(h2) {
  margin: 36px 0 14px;
  padding-left: 14px;
  border-left: 4px solid var(--seal);
  font-family: "Noto Serif SC", serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.content :deep(h3) {
  margin: 28px 0 12px;
  font-family: "Noto Serif SC", serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.content :deep(h4) {
  margin: 22px 0 10px;
  font-family: "Noto Serif SC", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.content :deep(ul),
.content :deep(ol) {
  margin: 0 0 18px;
  padding-left: 22px;
  line-height: 1.95;
  color: var(--ink-soft);
}

.content :deep(li) {
  margin: 4px 0;
}

.content :deep(li::marker) {
  color: var(--gold);
}

.content :deep(blockquote) {
  margin: 22px 0;
  padding: 16px 20px;
  border-left: 4px solid var(--gold);
  background: linear-gradient(135deg, rgba(167, 133, 80, 0.06), rgba(167, 133, 80, 0.02));
  border-radius: 0 12px 12px 0;
  color: var(--ink-soft);
  font-style: italic;
  position: relative;
}

.content :deep(blockquote::before) {
  content: "「";
  position: absolute;
  top: 4px;
  left: 12px;
  font-size: 28px;
  color: var(--gold);
  opacity: 0.5;
  font-family: "Noto Serif SC", serif;
  font-style: normal;
}

.content :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  margin: 22px auto;
  box-shadow: 0 14px 32px rgba(60, 40, 25, 0.12);
}

.content :deep(a) {
  color: var(--seal);
  text-decoration: none;
  border-bottom: 1px solid rgba(185, 58, 50, 0.4);
  padding-bottom: 1px;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.content :deep(a:hover) {
  color: var(--seal-deep);
  border-bottom-color: var(--seal-deep);
}

.content :deep(strong) {
  color: var(--ink);
  font-weight: 700;
}

.content :deep(em) {
  color: var(--seal);
  font-style: normal;
  background: linear-gradient(transparent 60%, rgba(185, 58, 50, 0.12) 60%);
  padding: 0 2px;
}

.content :deep(code) {
  background: rgba(60, 40, 25, 0.06);
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 0.9em;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  color: var(--seal);
}

.content :deep(hr) {
  border: none;
  border-top: 1px dashed var(--line);
  margin: 36px 0;
  position: relative;
  text-align: center;
}

.content :deep(hr::after) {
  content: "❖";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--paper);
  padding: 0 12px;
  color: var(--gold);
  font-size: 14px;
}

.content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 22px 0;
  font-size: 14px;
}

.content :deep(th),
.content :deep(td) {
  padding: 10px 14px;
  border: 1px solid var(--line);
  text-align: left;
}

.content :deep(th) {
  background: rgba(167, 133, 80, 0.08);
  font-weight: 600;
  color: var(--ink);
}

/* ============================================
   Skeleton
   ============================================ */
.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(60, 40, 25, 0.06) 0%,
    rgba(60, 40, 25, 0.12) 50%,
    rgba(60, 40, 25, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-h2 { height: 24px; width: 50%; margin-top: 8px; }
.skeleton-h3 { height: 18px; width: 40%; margin-top: 14px; }
.skeleton-line.short { width: 70%; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ============================================
   Footer (分享 + 動作)
   ============================================ */
.article-foot {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid var(--line-soft);
}

.share-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.share-label {
  font-family: "Noto Serif SC", serif;
  font-size: 14px;
  color: var(--ink-mute);
  letter-spacing: 0.06em;
}

.share-btns {
  display: inline-flex;
  gap: 8px;
}

.share-btn {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
  background: rgba(255, 255, 255, 0.7);
  border: 1.5px solid var(--line);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

.share-btn:hover {
  transform: translateY(-2px);
  background: #fff;
  box-shadow: 0 6px 14px rgba(60, 40, 25, 0.1);
}

.share-btn.line:hover { color: #06c755; border-color: #06c755; }
.share-btn.fb:hover { color: #1877f2; border-color: #1877f2; }
.share-btn.th:hover { color: #000; border-color: #000; }
.share-btn.copy:hover { color: var(--seal); border-color: var(--seal); }

.foot-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.foot-btn {
  flex: 1;
  min-width: 160px;
  text-align: center;
  text-decoration: none;
  padding: 14px 22px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  font-family: "Noto Serif SC", serif;
  letter-spacing: 0.06em;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.foot-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink-soft);
  border-color: var(--line);
}

.foot-btn.secondary:hover {
  background: #fff;
  border-color: var(--gold);
  color: var(--ink);
  transform: translateY(-2px);
}

.foot-btn.primary {
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  border-color: var(--seal-deep);
  box-shadow: 0 6px 16px rgba(185, 58, 50, 0.28);
  font-weight: 600;
}

.foot-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(185, 58, 50, 0.4);
  filter: brightness(1.05);
}

/* ============================================
   RWD
   ============================================ */
@media (max-width: 768px) {
  .article-card {
    border-radius: 18px;
    padding: 24px 22px 24px;
  }

  .title {
    font-size: 24px;
  }

  .article-head {
    padding-bottom: 20px;
    margin-bottom: 22px;
  }

  .content {
    font-size: 16px;
    line-height: 1.9;
  }

  .content :deep(p) {
    font-size: 16px;
  }

  .content :deep(h2) {
    font-size: 20px;
    margin-top: 30px;
  }

  .content :deep(h3) {
    font-size: 17px;
  }

  .article-foot {
    margin-top: 32px;
    padding-top: 22px;
  }

  .share-row {
    justify-content: space-between;
  }

  .foot-actions {
    flex-direction: column;
  }

  .foot-btn {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .article-card {
    padding: 20px 16px 20px;
  }
  .title {
    font-size: 22px;
  }
}

/* ============================================
   相關文章區塊
   ============================================ */
.related-section {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid var(--line-soft);
}

.related-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.related-bar {
  width: 4px;
  height: 22px;
  background: linear-gradient(180deg, var(--seal), var(--gold));
  border-radius: 2px;
}

.related-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.06em;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.related-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 16px 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
  overflow: hidden;
  min-height: 140px;
}

.related-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--seal), var(--gold));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.related-card:hover {
  transform: translateY(-2px);
  background: #fff;
  border-color: var(--line);
}

.related-card:hover::before {
  transform: scaleX(1);
}

.related-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.related-card-tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(167, 133, 80, 0.1);
  color: var(--gold);
  border: 1px solid rgba(167, 133, 80, 0.2);
  font-family: "Noto Serif SC", sans-serif;
}

.related-card-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: 0.04em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-card-excerpt {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-mute);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.related-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 11px;
  color: var(--ink-mute);
  font-family: "Noto Serif SC", sans-serif;
}

.related-card-arrow {
  font-size: 14px;
  transition: transform 0.25s ease, color 0.25s ease;
}

.related-card:hover .related-card-arrow {
  transform: translateX(3px);
  color: var(--seal);
}

/* 瀏覽數徽章 */
.related-card-views {
  margin-left: auto;
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--gold);
  font-family: "Noto Serif SC", sans-serif;
  font-weight: 500;
  transition: color 0.25s ease;
}

.related-card-views svg {
  width: 11px;
  height: 11px;
  fill: currentColor;
}

.related-card:hover .related-card-views {
  color: var(--seal);
}

@media (max-width: 768px) {
  .related-section {
    margin-top: 32px;
    padding-top: 22px;
  }
  .related-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
  .related-card {
    min-height: auto;
    padding: 14px 16px 13px;
  }
}
</style>
