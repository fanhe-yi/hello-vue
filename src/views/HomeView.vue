<template>
  <div class="home-page">
    <!-- —— ① HERO 主卡 —— -->
    <div class="home-overlay card hero-card-main reveal">
      <section class="hero-text">
        <div class="hero-eyebrow-wrap">
          <span class="hero-seal" aria-hidden="true">梵</span>
          <p class="hero-eyebrow">梵和易學 · FAN HE</p>
        </div>

        <h1 class="hero-title">
          看懂自己，<br />
          <span class="hero-title-accent">人生就不會一直卡。</span>
        </h1>

        <p class="hero-subtitle">
          理性拆解命盤 · 感性陪伴你走那一步
        </p>

        <div class="hero-actions">
          <router-link
            to="/booking"
            class="hero-cta"
            @click="trackBookingClick('home_hero_booking')"
          >
            <span>我要預約</span>
            <span class="hero-cta-arrow" aria-hidden="true">→</span>
          </router-link>
          <router-link to="/about" class="hero-secondary">
            了解我
          </router-link>
        </div>
      </section>
    </div>

    <!-- —— ② 預約三步驟流程 —— -->
    <div class="home-overlay card reveal" style="--reveal-delay: 80ms">
      <section class="process-section">
        <div class="section-header">
          <span class="section-bar" aria-hidden="true"></span>
          <h2 class="common-title">預約流程</h2>
        </div>

        <div class="step-grid">
          <div class="step-item">
            <span class="step-num">壹</span>
            <h3 class="step-title">選時段、留聯絡方式</h3>
            <p class="step-text">
              在預約頁挑日期跟時段，留下方便聯絡的方式（LINE / Email / 電話）。
            </p>
          </div>
          <div class="step-arrow" aria-hidden="true">→</div>

          <div class="step-item">
            <span class="step-num">貳</span>
            <h3 class="step-title">老師親自確認</h3>
            <p class="step-text">
              24 小時內親自回覆你，確認時間並發送視訊或 LINE 連結。
            </p>
          </div>
          <div class="step-arrow" aria-hidden="true">→</div>

          <div class="step-item">
            <span class="step-num">叁</span>
            <h3 class="step-title">解盤諮詢</h3>
            <p class="step-text">
              依預約項目進行線上語音諮詢，全程專注於你帶來的議題。
            </p>
          </div>
        </div>

        <div class="qb-actions">
          <router-link
            to="/booking"
            class="hero-cta"
            @click="trackBookingClick('home_process_booking')"
          >
            <span>我想預約命理諮詢（NT$ 600 / 30 分起）</span>
            <span class="hero-cta-arrow" aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>
    </div>

    <!-- —— ③ FAQ —— -->
    <div class="home-overlay card reveal" style="--reveal-delay: 140ms">
      <section class="faq-section">
        <div class="section-header">
          <span class="section-bar" aria-hidden="true"></span>
          <h2 class="common-title">預約前你可能想知道</h2>
        </div>

        <div class="faq-accordion">
          <div
            class="faq-item"
            v-for="(f, i) in faqs"
            :key="i"
            :class="{ 'is-open': openFaq === i }"
          >
            <button
              class="faq-head"
              @click="toggleFaq(i)"
              :aria-expanded="openFaq === i"
            >
              <span class="faq-q-mark" aria-hidden="true">Q</span>
              <span class="faq-q-text">{{ f.q }}</span>
              <span class="faq-icon" :class="{ open: openFaq === i }">+</span>
            </button>
            <transition name="qb-expand">
              <div class="faq-body" v-show="openFaq === i">
                <div class="faq-a">
                  <span class="faq-a-mark" aria-hidden="true">A</span>
                  <p>{{ f.a }}</p>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 主題 chips -->
        <div class="topic-chips-wrap">
          <span class="topic-chips-label">也常聊這些主題</span>
          <div class="topic-chips">
            <span class="topic-chip" v-for="t in topics" :key="t">{{ t }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- —— ④ 最新文章 —— -->
    <div
      v-if="articlesLoading || latestArticles.length"
      class="home-overlay card reveal"
      style="--reveal-delay: 180ms"
    >
      <section class="articles-section">
        <div class="section-header articles-section-header">
          <div class="articles-header-left">
            <span class="section-bar" aria-hidden="true"></span>
            <h2 class="common-title">最新文章</h2>
          </div>
          <router-link to="/articles" class="articles-more">
            看全部 <span aria-hidden="true">→</span>
          </router-link>
        </div>

        <!-- 載入骨架 -->
        <div v-if="articlesLoading" class="latest-grid">
          <div v-for="i in 3" :key="i" class="latest-card skeleton">
            <div class="sk-line sk-title"></div>
            <div class="sk-line"></div>
            <div class="sk-line sk-short"></div>
          </div>
        </div>

        <!-- 文章卡 -->
        <div v-else class="latest-grid">
          <router-link
            v-for="a in latestArticles"
            :key="a.slug"
            :to="`/articles/${a.slug}`"
            class="latest-card"
            @click="trackArticleClick(a.slug)"
          >
            <div class="latest-card-tags" v-if="a.tags && a.tags.length">
              <span class="latest-card-tag" v-for="t in a.tags.slice(0, 2)" :key="t">
                {{ t }}
              </span>
            </div>
            <h3 class="latest-card-title">{{ a.title }}</h3>
            <p v-if="a.excerpt" class="latest-card-excerpt">{{ a.excerpt }}</p>
            <div class="latest-card-foot">
              <span class="latest-card-date">{{ formatDate(a.date) }}</span>
              <span
                v-if="typeof a.viewCount === 'number'"
                class="latest-card-views"
                :title="`${a.viewCount.toLocaleString()} 次瀏覽`"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                </svg>
                {{ formatViewCount(a.viewCount) }}
              </span>
              <span class="latest-card-arrow" aria-hidden="true">→</span>
            </div>
          </router-link>
        </div>
      </section>
    </div>

    <!-- —— ⑤ 理念三卡（梵和易學的解盤態度） —— -->
    <section class="philosophy-section reveal" style="--reveal-delay: 240ms">
      <div class="philosophy-header">
        <span class="philosophy-eyebrow">梵和易學的解盤態度</span>
        <h2 class="philosophy-title">你會遇到的我</h2>
        <span class="philosophy-divider" aria-hidden="true"></span>
      </div>

      <div class="home-grid">
        <div class="home-tile card">
          <span class="tile-num">壹</span>
          <h3>命盤是說明書</h3>
          <p>不是判決書。不是把你定型，而是找出你能動的那一格。</p>
        </div>

        <div class="home-tile card">
          <span class="tile-num">貳</span>
          <h3>理性拆解，感性陪伴</h3>
          <p>把你的混亂整理成清晰的一條線，能踏出去的那種。</p>
        </div>

        <div class="home-tile card">
          <span class="tile-num">叁</span>
          <h3>尊重你的節奏</h3>
          <p>沒有推銷、沒有壓力。我只幫你把前面那盞燈打亮。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",

  data() {
    return {
      // 最新文章
      latestArticles: [],
      articlesLoading: true,

      openFaq: null,
      faqs: [
        {
          q: "第一次預約建議哪個項目？",
          a: "如果有具體要解的議題（換工作、感情狀況、流年運勢等），建議「紫微斗數」或「四柱八字」50 分鐘版本，能聊得深一些。如果只是想針對單一具體問題試試看，「文王卦占卜」一次 600 元也很適合。",
        },
        {
          q: "諮詢前需要準備什麼？",
          a: "資料部分：出生年月日時（盡量精確到分）與出生地點；合婚或關係議題請提供雙方資料，預約後我會在 LINE 再次確認。\n\n環境部分：請確認手機電量充足、網路與收訊狀況良好，並選擇安靜、不易被打擾的空間，讓諮詢過程能專注進行。",
        },
        {
          q: "線上和現場有什麼差別？",
          a: "目前主要採線上 LINE 語音諮詢（不使用視訊）。線上的好處是不用通勤、隱私感更高，效果跟現場一樣；現場目前僅限風水、改名等特殊項目。",
        },
        {
          q: "諮詢結束後可以追問嗎？",
          a: "本次諮詢時間結束即為本次解盤結束，不另外提供延伸追問。若諮詢進行中需要延長時間，超過 15 分鐘會以半小時計算（半小時 500 元）；如果是新議題或需要重新分析，請再預約一次。",
        },
        {
          q: "沒有出生時辰怎麼辦？",
          a: "完全沒有時辰仍可看四柱八字（少時柱會有限制），紫微斗數則需要時辰。如果不知道時辰，可以先預約「文王卦占卜」處理當下具體問題，不需要生辰。",
        },
        {
          q: "可以幫家人或伴侶預約嗎？",
          a: "可以，但建議當事人本人到場（哪怕一起在線上）。命理涉及個人狀態，第三方代問常會缺脈絡，準確度會打折扣。",
        },
      ],
      topics: [
        "感情",
        "事業 / 職涯",
        "財運",
        "流年",
        "家庭 / 親子",
        "姓名",
        "房產 / 居家",
      ],
    };
  },

  methods: {
    toggleFaq(i) {
      this.openFaq = this.openFaq === i ? null : i;
    },
    trackBookingClick(sourceLabel = "unknown") {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "click_booking", {
        event_category: "engagement",
        event_label: sourceLabel,
      });
    },
    trackArticleClick(slug) {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "click_article_from_home", {
        event_category: "engagement",
        event_label: slug,
      });
    },
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
    async fetchLatestArticles() {
      try {
        const res = await fetch("https://api.chen-yi.tw/api/articles");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        // 只取前 3 篇（API 應已按發布日期排序）
        this.latestArticles = (data.items || [])
          .slice(0, 3)
          .map((a) => ({
            slug: a.slug,
            title: a.title,
            date: a.date,
            excerpt: a.description || "",
            tags: a.tags || [],
            viewCount: typeof a.viewCount === "number" ? a.viewCount : undefined,
          }));
      } catch (err) {
        // 失敗就靜默隱藏整個區塊，不打擾首頁
        this.latestArticles = [];
        // eslint-disable-next-line no-console
        console.warn("[home] 載入最新文章失敗：", err);
      } finally {
        this.articlesLoading = false;
      }
    },
  },

  async created() {
    await this.fetchLatestArticles();
  },

  mounted() {
    this.$nextTick(() => {
      document.dispatchEvent(new Event("x-app-rendered"));
    });
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

/* ============================================
   設計系統變數
   ============================================ */
.home-page {
  --ink: #2a1f1a;
  --ink-soft: #4a423b;
  --ink-mute: #6b6157;
  --paper: rgba(255, 252, 247, 0.82);
  --paper-strong: rgba(255, 253, 249, 0.94);
  --gold: #a78550;
  --gold-soft: #c9a96b;
  --seal: #b93a32;
  --seal-deep: #962820;
  --line: rgba(60, 40, 25, 0.14);
  --line-soft: rgba(60, 40, 25, 0.08);
  --shadow-sm: 0 4px 14px rgba(60, 40, 25, 0.06);
  --shadow-md: 0 14px 32px rgba(60, 40, 25, 0.09);
  --shadow-lg: 0 22px 48px rgba(60, 40, 25, 0.12);

  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 32px 12px 32px;
  font-family: "LXGW WenKai", "Noto Serif SC", serif;
}

/* ============================================
   進場動畫
   ============================================ */
.reveal {
  opacity: 0;
  transform: translateY(14px);
  animation: reveal 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  animation-delay: var(--reveal-delay, 0ms);
}
@keyframes reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* ============================================
   卡片基礎
   ============================================ */
.card {
  background: var(--paper);
  backdrop-filter: blur(14px) saturate(1.1);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 22px;
  box-shadow: var(--shadow-md);
  position: relative;
}

.home-overlay {
  padding: 36px 38px;
}

/* ============================================
   ① HERO
   ============================================ */
.hero-card-main {
  padding: 44px 44px 40px;
  overflow: hidden;
}

/* 右上角的水墨點裝飾 */
.hero-card-main::before {
  content: "";
  position: absolute;
  top: -60px;
  right: -60px;
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle at center,
    rgba(185, 58, 50, 0.08),
    transparent 60%
  );
  pointer-events: none;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.hero-eyebrow-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.hero-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--seal);
  color: #fff8f0;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  font-size: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(185, 58, 50, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  transform: rotate(-4deg);
  letter-spacing: 0;
}

.hero-eyebrow {
  font-size: 13px;
  letter-spacing: 0.32em;
  color: var(--gold);
  margin: 0;
  font-weight: 500;
}

.hero-title {
  font-family: "Noto Serif SC", serif;
  font-size: 38px;
  font-weight: 600;
  line-height: 1.4;
  margin: 4px 0 0;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.hero-title-accent {
  background: linear-gradient(
    100deg,
    var(--ink) 0%,
    var(--ink) 40%,
    var(--seal) 60%,
    var(--ink) 80%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 6s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  font-family: "Noto Serif SC", serif;
  font-size: 16px;
  color: var(--ink-mute);
  margin: 0;
  letter-spacing: 0.05em;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

/* 主 CTA */
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--seal) 0%, var(--seal-deep) 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  border: 1px solid var(--seal-deep);
  box-shadow: 0 6px 18px rgba(185, 58, 50, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  position: relative;
  overflow: hidden;
}

.hero-cta::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(185, 58, 50, 0.4);
  filter: brightness(1.05);
}

.hero-cta:hover::after {
  transform: translateX(100%);
}

.hero-cta-arrow {
  transition: transform 0.2s ease;
  font-size: 18px;
}

.hero-cta:hover .hero-cta-arrow {
  transform: translateX(3px);
}

/* 次要按鈕 */
.hero-secondary {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  padding: 12px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--ink-soft);
  font-size: 15px;
  border: 1px solid var(--line);
  transition: all 0.2s ease;
}

.hero-secondary:hover {
  background: #fff;
  border-color: var(--gold);
  color: var(--ink);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* ============================================
   章節標題
   ============================================ */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, var(--seal), var(--gold));
  border-radius: 2px;
}

.common-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 24px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.06em;
}

/* ============================================
   ② 預約三步驟
   ============================================ */
.process-section {
  display: flex;
  flex-direction: column;
}

.step-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
  margin-top: 4px;
}

.step-item {
  position: relative;
  background: var(--paper-strong);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  padding: 22px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.step-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--line);
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, rgba(185, 58, 50, 0.1), rgba(185, 58, 50, 0.02));
  color: var(--seal);
  border: 1px solid rgba(185, 58, 50, 0.18);
  border-radius: 10px;
  font-family: "Noto Serif SC", serif;
  font-size: 19px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.step-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-mute);
}

.step-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--gold);
  font-weight: 300;
  user-select: none;
}

/* qb-actions 保留：CTA 容器 */
.qb-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* qb-expand transition：FAQ 也用同一組 */
.qb-expand-enter-active,
.qb-expand-leave-active {
  transition: max-height 0.35s ease, opacity 0.25s ease;
  overflow: hidden;
}
.qb-expand-enter-from,
.qb-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.qb-expand-enter-to,
.qb-expand-leave-from {
  max-height: 600px;
  opacity: 1;
}

/* ============================================
   ③ FAQ
   ============================================ */
.faq-section {
  display: flex;
  flex-direction: column;
}

.faq-accordion {
  display: flex;
  flex-direction: column;
}

.faq-item {
  border-top: 1px solid var(--line-soft);
  transition: background-color 0.2s ease;
}

.faq-item:first-child {
  border-top: none;
}

.faq-item.is-open {
  background: linear-gradient(180deg, rgba(167, 133, 80, 0.04), transparent);
}

.faq-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: none;
  padding: 16px 4px;
  min-height: 56px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.faq-head:active {
  background: rgba(60, 40, 25, 0.04);
}

.faq-q-mark {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
}

.faq-q-text {
  flex: 1;
  font-family: "Noto Serif SC", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.5;
  letter-spacing: 0.04em;
}

.faq-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--ink-mute);
  font-weight: 300;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease;
}

.faq-icon.open {
  transform: rotate(45deg);
  color: var(--seal);
}

.faq-body {
  padding: 0 4px 18px 48px;
}

.faq-a {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(167, 133, 80, 0.06);
  border-left: 3px solid var(--gold);
  padding: 14px 16px;
  border-radius: 0 12px 12px 0;
}

.faq-a-mark {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  background: rgba(167, 133, 80, 0.18);
  color: var(--gold);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", serif;
  font-size: 13px;
  font-weight: 700;
  margin-top: 2px;
}

.faq-a p {
  margin: 0;
  font-size: 15px;
  line-height: 1.85;
  color: var(--ink-soft);
  white-space: pre-line; /* 支援答案中用 \n\n 分段 */
}

/* ============================================
   主題 chips
   ============================================ */
.topic-chips-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed var(--line-soft);
}

.topic-chips-label {
  font-family: "Noto Serif SC", serif;
  font-size: 13px;
  color: var(--ink-mute);
  letter-spacing: 0.1em;
}

.topic-chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.topic-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(167, 133, 80, 0.08);
  border: 1px solid rgba(167, 133, 80, 0.22);
  color: var(--gold);
  font-size: 13px;
  font-family: "Noto Serif SC", sans-serif;
  letter-spacing: 0.04em;
}

/* ============================================
   ④ 理念三卡 - 解盤態度
   ============================================ */
.philosophy-section {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.philosophy-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.philosophy-eyebrow {
  font-family: "Noto Serif SC", serif;
  font-size: 12px;
  letter-spacing: 0.32em;
  color: var(--gold);
  font-weight: 500;
  padding-left: 0.32em; /* 補償尾端 letter-spacing 視覺偏移 */
}

.philosophy-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 24px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.12em;
  padding-left: 0.12em;
}

.philosophy-divider {
  display: block;
  width: 56px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  margin-top: 4px;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 4px;
}

.home-tile {
  background: var(--paper-strong);
  padding: 32px 26px 28px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.home-tile::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--seal), var(--gold));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.home-tile:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.home-tile:hover::before {
  transform: scaleX(1);
}

/* 數字放大版：成為視覺重點 */
.tile-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 14px;
  font-family: "Noto Serif SC", serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--seal);
  background: linear-gradient(135deg, rgba(185, 58, 50, 0.1), rgba(185, 58, 50, 0.02));
  border: 1px solid rgba(185, 58, 50, 0.2);
  border-radius: 14px;
  line-height: 1;
  letter-spacing: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(185, 58, 50, 0.08);
}

.home-tile:hover .tile-num {
  transform: scale(1.05) rotate(-3deg);
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  border-color: var(--seal-deep);
  box-shadow: 0 6px 16px rgba(185, 58, 50, 0.32);
}

.home-tile h3 {
  margin: 0 0 10px;
  font-family: "Noto Serif SC", serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.home-tile p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-mute);
}

/* ============================================
   RWD
   ============================================ */
@media (max-width: 900px) {
  .home-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .hero-title {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 14px 10px 24px;
    gap: 14px;
  }
  .home-overlay {
    padding: 24px 20px;
    border-radius: 18px;
  }
  .hero-card-main {
    padding: 28px 22px 26px;
  }
  .hero-card-main::before {
    width: 160px;
    height: 160px;
  }
  .hero-eyebrow {
    font-size: 11px;
    letter-spacing: 0.28em;
  }
  .hero-title {
    font-size: 26px;
    line-height: 1.45;
  }
  .hero-subtitle {
    font-size: 14px;
  }
  .hero-actions {
    flex-direction: column;
    gap: 10px;
  }
  .hero-cta,
  .hero-secondary {
    width: 100%;
    justify-content: center;
    padding: 14px 22px;
    font-size: 16px;
    min-height: 48px;
  }
  .home-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .home-tile {
    padding: 24px 22px 22px;
  }
  .home-tile h3 {
    font-size: 19px;
  }
  .tile-num {
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
  .philosophy-eyebrow {
    font-size: 11px;
    letter-spacing: 0.28em;
  }
  .philosophy-title {
    font-size: 20px;
  }
  .common-title {
    font-size: 20px;
  }

  /* 三步驟：手機改為直立 + 隱藏箭頭 */
  .step-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
  .step-arrow {
    display: none;
  }
  .step-item {
    padding: 18px 18px 16px;
  }
  .step-num {
    width: 34px;
    height: 34px;
    font-size: 17px;
  }
  .step-title {
    font-size: 16px;
  }
  .step-text {
    font-size: 13px;
  }

  /* FAQ */
  .faq-head {
    padding: 14px 4px;
    min-height: 60px;
    gap: 10px;
  }
  .faq-q-mark {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
  .faq-q-text {
    font-size: 15px;
  }
  .faq-body {
    padding: 0 4px 16px 38px;
  }
  .faq-a {
    padding: 12px 14px;
  }
  .faq-a p {
    font-size: 14px;
  }

  .topic-chips-wrap {
    margin-top: 18px;
    padding-top: 16px;
  }
  .topic-chip {
    font-size: 12px;
    padding: 4px 10px;
  }

  .qb-actions .hero-cta {
    text-align: center;
  }
}

@media (max-width: 380px) {
  .hero-title {
    font-size: 23px;
  }
}

/* ============================================
   ④ 最新文章區塊
   ============================================ */
.articles-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.articles-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.articles-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.articles-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  font-family: "Noto Serif SC", serif;
  font-size: 13px;
  color: var(--ink-mute);
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.articles-more:hover {
  color: var(--seal);
  border-color: var(--seal);
  background: #fff;
  transform: translateX(2px);
}

/* 文章卡 grid */
.latest-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.latest-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 20px 18px;
  border-radius: 16px;
  background: var(--paper-strong);
  border: 1px solid var(--line-soft);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
  overflow: hidden;
  min-height: 170px;
}

.latest-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--seal), var(--gold));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.latest-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--line);
}

.latest-card:hover::before {
  transform: scaleX(1);
}

.latest-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 2px;
}

.latest-card-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(167, 133, 80, 0.1);
  color: var(--gold);
  border: 1px solid rgba(167, 133, 80, 0.2);
  font-family: "Noto Serif SC", sans-serif;
}

.latest-card-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--ink);
  letter-spacing: 0.04em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.latest-card-excerpt {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--ink-mute);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.latest-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-mute);
  font-family: "Noto Serif SC", sans-serif;
}

.latest-card-arrow {
  font-size: 16px;
  transition: transform 0.25s ease, color 0.25s ease;
}

.latest-card:hover .latest-card-arrow {
  transform: translateX(4px);
  color: var(--seal);
}

/* 瀏覽數徽章 */
.latest-card-views {
  margin-left: auto;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--gold);
  font-family: "Noto Serif SC", sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.25s ease;
}

.latest-card-views svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.latest-card:hover .latest-card-views {
  color: var(--seal);
}

/* 骨架 */
.latest-card.skeleton {
  cursor: default;
  pointer-events: none;
}

.sk-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(60, 40, 25, 0.06) 0%,
    rgba(60, 40, 25, 0.12) 50%,
    rgba(60, 40, 25, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: sk-shimmer 1.4s ease-in-out infinite;
}

.sk-title {
  height: 18px;
  width: 80%;
}

.sk-short {
  width: 60%;
}

@keyframes sk-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (max-width: 900px) {
  .latest-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .latest-card:nth-child(3) {
    display: none;
  }
}

@media (max-width: 640px) {
  .latest-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
  .latest-card {
    padding: 18px 18px 16px;
    min-height: auto;
  }
  .latest-card:nth-child(3) {
    display: flex;
  }
  .latest-card-title {
    font-size: 16px;
  }
}
</style>
