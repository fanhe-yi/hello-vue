<template>
  <div class="about-page">
    <!-- ============================================
         ① 關於我（先放這張，建立信任）
         ============================================ -->
    <section class="card about-card reveal">
      <div class="about-grid">
        <!-- 照片 -->
        <div class="photo-box">
          <div class="photo-frame">
            <img src="@/assets/casper-profile.jpg" alt="梵和易學 · 陳逸" />
            <div class="photo-seal" aria-hidden="true">梵</div>
          </div>
        </div>

        <!-- 文字 -->
        <div class="intro-box">
          <p class="eyebrow">ABOUT · 關於我</p>
          <h1 class="hero-title">
            命盤不是判決書，<br />
            是幫你看見<span class="accent">當下的路</span>
          </h1>

          <p class="description">
            我相信，命盤不是用來判斷一個人，而是幫助你理解自己、整理當下的困惑，
            找出最適合你此刻的路。
          </p>
          <p class="description">
            我的解盤方式重視心理狀態與現實條件，不追求制式命理語言，
            也不會用「你就是怎樣的人」把你定義住。
            我們會一起釐清問題、看懂命盤訊息、整合你的資源與限制，
            轉化成可行的方向與選項。
          </p>

          <!-- 三個資訊區塊（圖示 + 內容） -->
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon" aria-hidden="true">✦</div>
              <div class="info-body">
                <div class="info-label">擅長主題</div>
                <div class="info-text">
                  人生定位｜關係互動｜職涯選擇｜創業方向｜居家佈局
                </div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" aria-hidden="true">☯</div>
              <div class="info-body">
                <div class="info-label">使用工具</div>
                <div class="info-text">
                  紫微斗數｜四柱八字｜姓名學｜易經卦象｜風水佈局
                </div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" aria-hidden="true">◈</div>
              <div class="info-body">
                <div class="info-label">解盤方式</div>
                <div class="info-text">
                  線上視訊｜文字解析｜LINE 線上服務
                </div>
              </div>
            </div>
          </div>

          <div class="contact-pill">
            <span class="contact-icon" aria-hidden="true">✉</span>
            <span class="contact-label">聯絡</span>
            <a
              href="mailto:fanhe.chenyi@gmail.com"
              class="contact-email"
            >fanhe.chenyi@gmail.com</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         ② LINE 線上服務說明
         ============================================ -->
    <section class="card services-card reveal" id="line-services" style="--reveal-delay: 100ms">
      <header class="services-header">
        <p class="eyebrow">LINE · 線上服務</p>
        <h2 class="services-title">LINE 線上服務說明</h2>
        <p class="services-intro">
          以下服務透過 <strong>LINE 平台</strong> 提供線上命理文字解析。
          完成付費並提供必要資訊後，將依命理模型解析並回傳結果。
        </p>
      </header>

      <!-- 四個服務卡 -->
      <div class="service-grid">
        <article class="service-card" v-for="s in services" :key="s.id">
          <div class="service-card-head">
            <span class="service-num" aria-hidden="true">{{ s.num }}</span>
            <h3 class="service-card-title">{{ s.title }}</h3>
          </div>
          <p class="service-card-desc">{{ s.desc }}</p>
          <div class="service-card-meta">
            <span class="service-card-method">
              <span class="meta-dot" aria-hidden="true"></span>
              {{ s.method }}
            </span>
            <span class="service-card-price">
              NT$ {{ s.price.toLocaleString() }}
              <span class="price-unit">/ {{ s.unit || '次' }}</span>
            </span>
          </div>
        </article>
      </div>

      <!-- 收費 / 退款 / 聲明 -->
      <div class="notice-stack">
        <div class="notice-block">
          <div class="notice-title">
            <span class="notice-bar" aria-hidden="true"></span>
            收費與退款說明
          </div>
          <p class="notice-text">
            本頁所列之 LINE 線上服務均採單次付費制。
            使用者完成付款並送出資料後，即開始解析流程。
            因服務屬即時提供之數位文字內容，<strong>付款完成後恕不提供取消或退款</strong>。
          </p>
        </div>

        <div class="notice-block">
          <div class="notice-title">
            <span class="notice-bar" aria-hidden="true"></span>
            重要聲明
          </div>
          <p class="notice-text small">
            本頁所列之命理解析內容，係依命理理論與卦象象意進行文字解讀，
            並透過系統產生文字解析結果，僅供娛樂與參考，
            不構成任何形式之人生、投資、醫療或法律建議。
            所涉及之未來趨勢，為象意層面之可能發展方向，非對實際結果之保證。
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================
         ③ CTA
         ============================================ -->
    <div class="cta-wrap reveal" style="--reveal-delay: 180ms">
      <p class="cta-eyebrow">準備好了嗎？</p>
      <router-link class="booking-btn" to="/booking">
        <span>想了解自己目前的節奏 · 預約解盤</span>
        <span class="cta-arrow" aria-hidden="true">→</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutView",
  data() {
    return {
      services: [
        {
          id: "liuyao",
          num: "壹",
          title: "六爻卦象解析",
          desc: "依使用者提問內容起卦，解析卦象所呈現之過去狀態、當前情況與可能發展趨勢。",
          method: "文字解析（老師親自解卦）",
          price: 600,
        },
        {
          id: "bazi",
          num: "貳",
          title: "八字格局解析",
          desc: "依使用者提供之生辰資料，進行八字格局結構與整體命理配置之文字解析。",
          method: "文字解析",
          price: 99,
        },
        {
          id: "marry",
          num: "叁",
          title: "八字合婚解析",
          desc: "依雙方提供之生辰資料，進行命盤結構比對與關係互動層面之文字說明。",
          method: "文字解析",
          price: 99,
        },
        {
          id: "name",
          num: "肆",
          title: "姓名鑑定",
          desc: "依命主選擇的問題，進行命盤結構諮詢與未來結果分析之文字說明。",
          method: "文字解析 / LINE 語音",
          price: 800,
          unit: "30 分",
        },
      ],
    };
  },
  mounted() {
    this.$nextTick(() => {
      document.dispatchEvent(new Event("x-app-rendered"));
    });
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

.about-page {
  --ink: #2a1f1a;
  --ink-soft: #4a423b;
  --ink-mute: #6b6157;
  --paper: rgba(255, 252, 247, 0.92);
  --paper-strong: #fffdf9;
  --gold: #a78550;
  --gold-soft: #c9a96b;
  --seal: #b93a32;
  --seal-deep: #962820;
  --line: rgba(60, 40, 25, 0.14);
  --line-soft: rgba(60, 40, 25, 0.08);
  --shadow-sm: 0 4px 14px rgba(60, 40, 25, 0.06);
  --shadow-md: 0 14px 32px rgba(60, 40, 25, 0.09);
  --shadow-lg: 0 22px 48px rgba(60, 40, 25, 0.12);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 8px 12px 32px;
  font-family: "LXGW WenKai", "Noto Serif SC", -apple-system, sans-serif;
  color: var(--ink);
}

.reveal {
  animation: reveal 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: var(--reveal-delay, 0ms);
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   卡片基礎
   ============================================ */
.card {
  width: min(960px, 100%);
  background: var(--paper);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(167, 133, 80, 0.06), transparent 60%);
  pointer-events: none;
}

/* ============================================
   ① 關於我
   ============================================ */
.about-card {
  padding: 40px 38px;
}

.about-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}

/* 照片框 */
.photo-box {
  position: sticky;
  top: 80px;
}

.photo-frame {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: #fff;
  padding: 8px;
}

.photo-frame::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, rgba(167, 133, 80, 0.4), transparent 50%, rgba(185, 58, 50, 0.3));
  border-radius: 20px;
  z-index: -1;
}

.photo-frame img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 4 / 5;
}

.photo-seal {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff8f0;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  font-size: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(185, 58, 50, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  transform: rotate(-4deg);
}

/* 文字區 */
.intro-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.32em;
  color: var(--gold);
  margin: 0;
  font-weight: 500;
}

.hero-title {
  font-family: "Noto Serif SC", serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.45;
  margin: 0;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.hero-title .accent {
  background: linear-gradient(120deg, var(--seal) 0%, var(--gold) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  margin: 0;
  font-size: 16px;
  line-height: 1.95;
  color: var(--ink-soft);
}

/* 資訊三項 */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  padding-top: 18px;
  border-top: 1px solid var(--line-soft);
}

.info-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 10px 0;
}

.info-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(167, 133, 80, 0.12), rgba(167, 133, 80, 0.04));
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 1px solid rgba(167, 133, 80, 0.2);
}

.info-body {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-family: "Noto Serif SC", serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 3px;
  letter-spacing: 0.06em;
}

.info-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-mute);
}

/* 聯絡 */
.contact-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: linear-gradient(135deg, rgba(167, 133, 80, 0.08), rgba(167, 133, 80, 0.02));
  border: 1px solid rgba(167, 133, 80, 0.22);
  border-radius: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
  align-self: flex-start;
}

.contact-icon {
  color: var(--gold);
  font-size: 16px;
}

.contact-label {
  font-family: "Noto Serif SC", serif;
  font-size: 13px;
  color: var(--ink-mute);
  letter-spacing: 0.1em;
}

.contact-email {
  color: var(--seal);
  font-family: "Noto Serif SC", sans-serif;
  font-size: 14px;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dashed rgba(185, 58, 50, 0.4);
  padding-bottom: 1px;
  word-break: break-all;
  transition: color 0.2s ease;
}

.contact-email:hover {
  color: var(--seal-deep);
}

/* ============================================
   ② 服務說明
   ============================================ */
.services-card {
  padding: 38px 38px 36px;
}

.services-header {
  text-align: center;
  margin-bottom: 28px;
}

.services-title {
  font-family: "Noto Serif SC", serif;
  font-size: 26px;
  font-weight: 600;
  margin: 8px 0 12px;
  color: var(--ink);
  letter-spacing: 0.06em;
}

.services-intro {
  margin: 0 auto;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink-mute);
  max-width: 540px;
}

.services-intro strong {
  color: var(--seal);
  font-weight: 600;
}

/* 服務卡 grid */
.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.service-card {
  position: relative;
  background: var(--paper-strong);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  padding: 22px 22px 20px;
  transition: all 0.25s ease;
  overflow: hidden;
}

.service-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--seal), var(--gold));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.service-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--line);
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.service-num {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(185, 58, 50, 0.1), rgba(185, 58, 50, 0.02));
  color: var(--seal);
  border: 1px solid rgba(185, 58, 50, 0.18);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", serif;
  font-size: 18px;
  font-weight: 600;
}

.service-card-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.04em;
  flex: 1;
}

.service-card-desc {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-mute);
}

.service-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px dashed var(--line-soft);
}

.service-card-method {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-mute);
  font-family: "Noto Serif SC", sans-serif;
}

.meta-dot {
  width: 6px;
  height: 6px;
  background: var(--gold);
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(167, 133, 80, 0.18);
}

.service-card-price {
  font-family: "Noto Serif SC", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--seal);
  letter-spacing: 0.02em;
}

.price-unit {
  font-size: 12px;
  font-weight: 400;
  color: var(--ink-mute);
  margin-left: 2px;
}

/* ============================================
   收費/聲明
   ============================================ */
.notice-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px;
  background: rgba(60, 40, 25, 0.03);
  border: 1px solid var(--line-soft);
  border-radius: 14px;
}

.notice-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Noto Serif SC", serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.06em;
}

.notice-bar {
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, var(--seal), var(--gold));
  border-radius: 2px;
}

.notice-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.85;
  color: var(--ink-mute);
}

.notice-text.small {
  font-size: 13px;
}

.notice-text strong {
  color: var(--seal);
  font-weight: 600;
}

/* ============================================
   ③ CTA
   ============================================ */
.cta-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  text-align: center;
}

.cta-eyebrow {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 14px;
  letter-spacing: 0.32em;
  color: var(--gold);
}

.booking-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  font-family: "Noto Serif SC", serif;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-decoration: none;
  border: 1px solid var(--seal-deep);
  box-shadow: 0 8px 22px rgba(185, 58, 50, 0.32);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  min-height: 52px;
}

.booking-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.booking-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(185, 58, 50, 0.42);
  filter: brightness(1.05);
}

.booking-btn:hover::after {
  transform: translateX(100%);
}

.cta-arrow {
  font-size: 20px;
  transition: transform 0.25s ease;
}

.booking-btn:hover .cta-arrow {
  transform: translateX(4px);
}

/* ============================================
   RWD
   ============================================ */
@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 28px;
  }
  .photo-box {
    position: static;
  }
}

@media (max-width: 768px) {
  .about-page {
    gap: 18px;
    padding: 4px 10px 32px;
  }

  .card {
    border-radius: 18px;
  }

  .about-card,
  .services-card {
    padding: 28px 22px;
  }

  .about-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }

  .photo-box {
    max-width: 240px;
    margin: 0 auto;
    width: 100%;
  }

  .photo-seal {
    width: 38px;
    height: 38px;
    font-size: 19px;
  }

  .hero-title {
    font-size: 24px;
    text-align: center;
  }

  .description {
    font-size: 15px;
    line-height: 1.85;
  }

  .eyebrow {
    text-align: center;
  }

  .info-grid {
    padding-top: 14px;
  }

  .info-item {
    padding: 8px 0;
  }

  .info-text {
    font-size: 13px;
  }

  .contact-pill {
    width: 100%;
    justify-content: center;
  }

  .services-title {
    font-size: 22px;
  }

  .services-intro {
    font-size: 13px;
  }

  .service-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .service-card {
    padding: 18px 18px 16px;
  }

  .service-card-title {
    font-size: 16px;
  }

  .service-card-desc {
    font-size: 13px;
  }

  .notice-stack {
    padding: 18px 18px;
  }

  .booking-btn {
    width: 100%;
    max-width: 360px;
    justify-content: center;
    padding: 16px 22px;
    font-size: 15px;
  }
}

@media (max-width: 380px) {
  .about-card,
  .services-card {
    padding: 22px 16px;
  }
  .hero-title {
    font-size: 22px;
  }
}
</style>
