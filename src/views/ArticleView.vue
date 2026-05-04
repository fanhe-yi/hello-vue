<template>
  <div class="article-page">
    <div class="card">
      <!-- =========================
        【區塊】文章頭
        目的：SEO/可讀性：H1 + 日期 + tag
      ========================== -->
      <div class="head">
        <p class="eyebrow">梵和易學｜文章</p>
        <h1 class="title">{{ article.title }}</h1>
        <div class="meta">
          <span class="date">{{ article.date }}</span>
          <span class="dot">·</span>
          <span class="tags">
            <span v-for="t in article.tags" :key="t" class="tag">{{ t }}</span>
          </span>
        </div>
      </div>

      <!-- =========================
  【內容渲染】用 HTML
  目的：前台直接渲染文章內容；之後 prerender 會輸出完整 HTML
========================== -->
      <div class="content" v-html="article.content_html"></div>

      <!-- =========================
        【區塊】返回列表
        目的：UX：閱讀完可以回到文章列表
      ========================== -->
      <router-link class="back" to="/articles">← 回文章列表</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArticleView",
  data() {
    return {
      /* =========================
        【文章資料】
        目的：透過 slug 載入 JSON 後放進來
      ========================== */
      article: {
        title: "載入中…",
        date: "",
        tags: [],
        content_html: "<p>載入中…</p>",
      },
    };
  },

  /* =========================
    【生命週期】進頁面就載入
    目的：支援 /articles/:slug
  ========================== */
  async created() {
    await this.loadArticle();
  },

  /* =========================
    【監聽】同一頁面切換不同 slug 時也要更新
    目的：使用者在文章間跳轉不會殘留舊內容
  ========================== */
  watch: {
    "$route.params.slug": {
      immediate: false,
      handler() {
        this.loadArticle();
      },
    },
  },

  methods: {
    /* =========================
    【方法】載入文章（改用 API）
    目的：
    1) 前台直接讀後台已發布文章
    2) 不需 rebuild 就能看到新文章
    3) 成功後套用 SEO + 通知 prerender
    ========================== */
    async loadArticle() {
      const slug = this.$route.params.slug;

      try {
        /* =========================
      ✅ 單篇文章 API
    ========================== */
        const res = await fetch(`https://api.chen-yi.tw/api/articles/${slug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }

        /* =========================
      ✅ 組合成你 template 需要的 article 結構
      - title/date/tags/content_html
    ========================== */
        this.article = {
          title: data?.meta?.title || "（無標題）",
          date: data?.meta?.date || "",
          tags: data?.meta?.tags || [],
          content_html: data?.content_html || "<p></p>",
          /* ✅ 你原本 applySeoMeta() 會用 content_html 抽描述 */
        };

        /* =========================
      ✅ SEO / Prerender 通知
    ========================== */
        this.applySeoMeta();
        this.$nextTick(() => {
          document.dispatchEvent(new Event("x-app-rendered"));
        });
      } catch (e) {
        this.article = {
          title: "找不到這篇文章",
          date: "",
          tags: [],
          content_html: "<p>這篇文章可能還沒發佈，或 slug 不存在。</p>",
        };

        this.applySeoMeta();
        this.$nextTick(() => {
          document.dispatchEvent(new Event("x-app-rendered"));
        });
      }
    },
    /* =========================
    【SEO】更新 title 與 description
    目的：即使在 SPA，也先把基本 meta 補上
    注意：真正 SEO 主要靠 prerender，但這是必要的基本功
    ========================== */
    applySeoMeta() {
      const title = this.article?.title
        ? `${this.article.title}｜梵和易學`
        : "梵和易學｜文章";
      document.title = title;

      /* =========================
    【description】優先用文章摘要（若未來你加 excerpt 欄位）
    目前先從 content_html 粗略抽文字前 120 字當描述
  ========================== */
      const raw = (this.article?.content_html || "")
        .replace(/<[^>]+>/g, " ") // 移除 HTML tag
        .replace(/\s+/g, " ")
        .trim();

      const desc = raw.slice(0, 120) || "梵和易學｜文章內容";

      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", desc);
    },
  },
};
</script>

<style scoped>
.article-page {
  display: flex;
  justify-content: center;
  padding: 32px 12px 24px;
}

.card {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  padding: 28px 26px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  width: min(1000px, 100%);
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 13px;
  letter-spacing: 0.18em;
  color: #7b5b3a;
}

.title {
  margin: 0 0 8px;
  font-size: 26px;
  line-height: 1.3;
  color: #31241f;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7a736b;
  font-size: 12px;
  margin-bottom: 18px;
}

.dot {
  opacity: 0.7;
}

.tags {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(185, 58, 50, 0.08);
  border: 1px solid rgba(185, 58, 50, 0.18);
  color: #6b2b26;
}

.content .p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.8;
  color: #4a433d;
}

.back {
  display: inline-block;
  margin-top: 16px;
  text-decoration: none;
  color: #4d433d;
  font-size: 14px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.25);
  padding-bottom: 2px;
}

/* =========================
  【文章內容排版】給 v-html 產生的 HTML 用
  目的：讓文章內文有一致的閱讀體驗（像 Medium/Notion）
  備註：:deep(...) 用於 scoped style 套到內部 HTML
========================== */
.content :deep(p) {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 1.9;
  color: #4a433d;
}

.content :deep(h2) {
  margin: 22px 0 10px;
  font-size: 20px;
  line-height: 1.4;
  color: #31241f;
}

.content :deep(h3) {
  margin: 18px 0 8px;
  font-size: 17px;
  line-height: 1.5;
  color: #31241f;
}

.content :deep(ul),
.content :deep(ol) {
  margin: 0 0 14px 18px;
  padding: 0;
  line-height: 1.9;
  color: #4a433d;
}

.content :deep(li) {
  margin: 6px 0;
}

.content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 14px;
  border-left: 4px solid rgba(185, 58, 50, 0.35);
  background: rgba(185, 58, 50, 0.06);
  border-radius: 10px;
  color: #4a433d;
}

.content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  margin: 14px 0;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
}

.content :deep(a) {
  color: #6b2b26;
  text-decoration: none;
  border-bottom: 1px dashed rgba(107, 43, 38, 0.35);
  padding-bottom: 1px;
}
</style>
