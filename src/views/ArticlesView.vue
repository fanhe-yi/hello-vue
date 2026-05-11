<template>
  <div class="articles-page">
    <div class="articles-card reveal">
      <!-- Header -->
      <div class="page-header">
        <div class="seal-mark" aria-hidden="true">梵</div>
        <p class="eyebrow">JOURNAL · 文章</p>
        <h1 class="title">命理 · 生活 · 碎念</h1>
        <p class="subtitle">
          一些我想寫的內容：紫微、八字、姓名學、風水，還有一點生活與工作。
        </p>
      </div>

      <!-- Tag 篩選列 -->
      <div v-if="!loading && tagOptions.length" class="tagbar-wrap">
        <div class="tagbar">
          <button
            class="tagbtn"
            :class="{ active: activeTag === '' }"
            @click="activeTag = ''"
          >
            全部
            <span class="tag-count">{{ articles.length }}</span>
          </button>
          <button
            v-for="t in tagOptions"
            :key="t"
            class="tagbtn"
            :class="{ active: activeTag === t }"
            @click="activeTag = t"
          >
            {{ t }}
            <span class="tag-count">{{ tagCount(t) }}</span>
          </button>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="list">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
          <div class="skeleton-tags">
            <div class="skeleton-pill"></div>
            <div class="skeleton-pill"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-card error">
        <div class="state-icon">!</div>
        <strong>載入文章失敗</strong>
        <p>{{ error }}</p>
        <button class="state-btn" @click="fetchArticles">重新載入</button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="filteredArticles.length === 0"
        class="state-card empty"
      >
        <div class="state-icon dim" aria-hidden="true">∅</div>
        <strong>{{ activeTag ? `「${activeTag}」目前沒有文章` : '還沒有文章' }}</strong>
        <p v-if="activeTag">看看其他分類，或回到全部文章</p>
        <button v-if="activeTag" class="state-btn" @click="activeTag = ''">
          看全部文章
        </button>
      </div>

      <!-- 文章列表 -->
      <div v-else class="list">
        <router-link
          v-for="(a, idx) in filteredArticles"
          :key="a.slug"
          class="item reveal-item"
          :style="{ '--i': idx }"
          :to="`/articles/${a.slug}`"
        >
          <div class="item-content">
            <div class="item-head">
              <h2 class="item-title">{{ a.title }}</h2>
              <span class="item-arrow" aria-hidden="true">→</span>
            </div>
            <p v-if="a.excerpt" class="item-excerpt">{{ a.excerpt }}</p>
            <div class="item-foot">
              <span class="item-date">{{ formatDate(a.date) }}</span>
              <span v-if="a.tags && a.tags.length" class="item-dot">·</span>
              <div v-if="a.tags && a.tags.length" class="tags">
                <span v-for="t in a.tags" :key="t" class="tag">{{ t }}</span>
              </div>

              <!-- 瀏覽數徽章（後端未實作 viewCount 時自動隱藏） -->
              <span
                v-if="typeof a.viewCount === 'number'"
                class="item-views"
                :title="`${a.viewCount.toLocaleString()} 次瀏覽`"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                </svg>
                {{ formatViewCount(a.viewCount) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArticlesView",
  data() {
    return {
      articles: [],
      loading: false,
      error: "",
      activeTag: "",
      tagOptions: [],
    };
  },
  async created() {
    await this.fetchArticles();
  },
  mounted() {
    this.$nextTick(() => {
      document.dispatchEvent(new Event("x-app-rendered"));
    });
  },
  computed: {
    filteredArticles() {
      if (!this.activeTag) return this.articles || [];
      return (this.articles || []).filter(
        (a) => Array.isArray(a.tags) && a.tags.includes(this.activeTag),
      );
    },
  },
  methods: {
    tagCount(t) {
      return (this.articles || []).filter(
        (a) => Array.isArray(a.tags) && a.tags.includes(t),
      ).length;
    },
    formatDate(d) {
      if (!d) return "";
      // 支援 "2025-01-15" 或 ISO 字串，輸出 "2025.01.15"
      const m = String(d).match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (m) {
        return `${m[1]}.${m[2].padStart(2, "0")}.${m[3].padStart(2, "0")}`;
      }
      return d;
    },
    /* ============================================
       瀏覽數格式化：999 → "999"，1234 → "1.2k"，12345 → "12k"
       ============================================ */
    formatViewCount(n) {
      if (typeof n !== "number" || isNaN(n) || n < 0) return "0";
      if (n < 1000) return String(n);
      if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      return Math.round(n / 1000) + "k";
    },
    async fetchArticles() {
      this.loading = true;
      this.error = "";
      try {
        const res = await fetch("https://api.chen-yi.tw/api/articles");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }
        this.articles = (data.items || []).map((a) => ({
          slug: a.slug,
          title: a.title,
          date: a.date,
          excerpt: a.description || "",
          tags: a.tags || [],
          viewCount: typeof a.viewCount === "number" ? a.viewCount : undefined,
        }));
        const set = new Set();
        (this.articles || []).forEach((a) => {
          (a.tags || []).forEach((t) => set.add(t));
        });
        this.tagOptions = Array.from(set);
        if (this.activeTag && !this.tagOptions.includes(this.activeTag)) {
          this.activeTag = "";
        }
        this.$nextTick(() => {
          document.dispatchEvent(new Event("x-app-rendered"));
        });
      } catch (err) {
        this.error = String(err?.message || err || "FETCH_FAILED");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

.articles-page {
  --ink: #2a1f1a;
  --ink-soft: #4a423b;
  --ink-mute: #6b6157;
  --paper: rgba(255, 252, 247, 0.92);
  --gold: #a78550;
  --seal: #b93a32;
  --seal-deep: #962820;
  --line: rgba(60, 40, 25, 0.14);
  --line-soft: rgba(60, 40, 25, 0.08);
  --shadow-sm: 0 4px 14px rgba(60, 40, 25, 0.06);
  --shadow-md: 0 14px 32px rgba(60, 40, 25, 0.09);

  display: flex;
  justify-content: center;
  padding: 8px 0 32px;
  font-family: "LXGW WenKai", "Noto Serif SC", -apple-system, sans-serif;
  color: var(--ink);
}

.reveal {
  animation: reveal 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.reveal-item {
  animation: reveal 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: calc(var(--i, 0) * 60ms);
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.articles-card {
  width: min(900px, 100%);
  background: var(--paper);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 24px;
  padding: 40px 36px 36px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.articles-card::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(167, 133, 80, 0.08), transparent 60%);
  pointer-events: none;
}

/* ============================================
   Header
   ============================================ */
.page-header {
  text-align: center;
  margin-bottom: 28px;
  position: relative;
}

.seal-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff8f0;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  font-size: 22px;
  border-radius: 7px;
  box-shadow: 0 4px 14px rgba(185, 58, 50, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  transform: rotate(-4deg);
  margin-bottom: 12px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.32em;
  color: var(--gold);
  margin: 0 0 6px;
  font-weight: 500;
}

.title {
  font-family: "Noto Serif SC", serif;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px;
  letter-spacing: 0.06em;
  color: var(--ink);
}

.subtitle {
  font-size: 14px;
  color: var(--ink-mute);
  margin: 0 auto;
  line-height: 1.7;
  max-width: 480px;
}

/* ============================================
   Tag bar
   ============================================ */
.tagbar-wrap {
  margin: 0 -8px 22px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tagbar-wrap::-webkit-scrollbar { display: none; }

.tagbar {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 0 8px 4px;
  white-space: nowrap;
}

.tagbtn {
  appearance: none;
  border: 1.5px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-family: "Noto Serif SC", inherit;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.tagbtn:hover {
  border-color: var(--gold);
  background: #fff;
  color: var(--ink);
}

.tagbtn.active {
  border-color: var(--seal);
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  box-shadow: 0 4px 12px rgba(185, 58, 50, 0.25);
}

.tag-count {
  font-size: 11px;
  background: rgba(60, 40, 25, 0.08);
  color: var(--ink-mute);
  padding: 1px 7px;
  border-radius: 999px;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

.tagbtn.active .tag-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* ============================================
   List
   ============================================ */
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 22px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--line-soft);
  transition: all 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
  overflow: hidden;
}

.item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--seal), var(--gold));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.item:hover {
  background: #fff;
  border-color: var(--line);
  transform: translateX(2px);
  box-shadow: var(--shadow-sm);
}

.item:hover::before {
  transform: scaleY(1);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.item-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: 0.04em;
  flex: 1;
}

.item-arrow {
  font-size: 18px;
  color: var(--ink-mute);
  transition: transform 0.25s ease, color 0.25s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.item:hover .item-arrow {
  transform: translateX(4px);
  color: var(--seal);
}

.item-excerpt {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-mute);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-mute);
}

.item-date {
  font-family: "Noto Serif SC", sans-serif;
  letter-spacing: 0.04em;
}

.item-dot {
  opacity: 0.5;
}

.tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* 瀏覽數徽章（推到 item-foot 最右側） */
.item-views {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ink-mute);
  font-family: "Noto Serif SC", sans-serif;
  background: rgba(60, 40, 25, 0.05);
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  transition: color 0.2s ease, background 0.2s ease;
}

.item:hover .item-views {
  color: var(--gold);
  background: rgba(167, 133, 80, 0.14);
}

.item-views svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(167, 133, 80, 0.1);
  color: var(--gold);
  border: 1px solid rgba(167, 133, 80, 0.2);
  font-family: "Noto Serif SC", sans-serif;
}

/* ============================================
   Skeleton loading
   ============================================ */
.skeleton-item {
  padding: 22px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.skeleton-title {
  height: 22px;
  width: 60%;
}

.skeleton-text { width: 100%; }
.skeleton-text.short { width: 75%; }

.skeleton-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.skeleton-pill {
  width: 56px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(60, 40, 25, 0.06) 0%,
    rgba(60, 40, 25, 0.12) 50%,
    rgba(60, 40, 25, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ============================================
   Empty / Error 狀態
   ============================================ */
.state-card {
  text-align: center;
  padding: 44px 24px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px dashed var(--line);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.state-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", serif;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 6px;
}

.state-card.error .state-icon {
  background: rgba(185, 58, 50, 0.12);
  color: var(--seal);
}

.state-card.empty .state-icon,
.state-icon.dim {
  background: rgba(60, 40, 25, 0.08);
  color: var(--ink-mute);
}

.state-card strong {
  font-family: "Noto Serif SC", serif;
  font-size: 17px;
  color: var(--ink);
}

.state-card p {
  margin: 0;
  font-size: 13px;
  color: var(--ink-mute);
}

.state-btn {
  margin-top: 12px;
  padding: 10px 20px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--seal-deep);
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(185, 58, 50, 0.25);
  transition: all 0.2s ease;
}

.state-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(185, 58, 50, 0.35);
}

/* ============================================
   RWD
   ============================================ */
@media (max-width: 768px) {
  .articles-card {
    border-radius: 18px;
    padding: 28px 18px 24px;
  }

  .page-header {
    margin-bottom: 22px;
  }

  .seal-mark {
    width: 38px;
    height: 38px;
    font-size: 19px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .tagbar-wrap {
    margin: 0 -18px 18px;
  }
  .tagbar {
    padding: 0 18px 4px;
  }

  .item {
    padding: 18px 18px;
  }

  .item-title {
    font-size: 17px;
  }

  .item-excerpt {
    font-size: 13px;
  }

  .item-views {
    font-size: 11px;
    padding: 2px 8px;
  }
  .item-views svg {
    width: 11px;
    height: 11px;
  }
}
</style>
