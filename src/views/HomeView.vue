<template>
  <div class="home-page">
    <!-- —— ① HERO 主卡 —— -->
    <div class="home-overlay card hero-card-main">
      <section class="hero-text">
        <p class="hero-eyebrow">梵和易學</p>

        <h1 class="hero-title">
          看懂自己，<br />
          人生就不會一直卡。
        </h1>

        <div class="hero-actions">
          <router-link
            to="/booking"
            class="hero-cta"
            @click="trackBookingClick('home_hero_booking')"
          >
            我要預約
          </router-link>
          <router-link to="/about" class="hero-secondary"> 了解我 </router-link>
        </div>
      </section>
    </div>

    <!-- —— ② 常見主題卡 —— -->
    <!--
    <div class="home-overlay card">
      <section class="common-topics">
        <h2 class="common-title">大家常問的：</h2>

        <ul class="common-list">
          <li>工作一直卡住：換？忍？方向是不是錯了？</li>
          <li>感情裡反覆拉扯：累、焦慮、理不清。</li>
          <li>家庭界線混亂，容易爆掉或內耗。</li>
          <li>想轉職 / 接案 / 創業，但不知道怎麼動。</li>
          <li>人生像停著，明明努力卻沒起色。</li>
        </ul>
      </section>
    </div>
    -->

    <!-- —— ④ 分類題庫（可收放） —— -->
    <div class="home-overlay card">
      <section class="common-topics">
        <h2 class="common-title">你可能會想問：</h2>
        <!--<p class="qb-price-inline">此區命理諮詢一律：NTD 600 / 小時</p>-->

        <!-- ✅ 可收放分類：一類一段 -->
        <div class="qb-accordion">
          <div class="qb-item" v-for="g in questionGroups" :key="g.key">
            <!-- ✅ 分類標題：可點擊 -->
            <button class="qb-head" @click="toggleGroup(g.key)">
              <span class="qb-head-title">{{ g.label }}</span>
              <span class="qb-head-icon" :class="{ open: openKey === g.key }"
                >▾</span
              >
            </button>

            <!-- ✅ 展開內容 -->
            <div class="qb-body" v-show="openKey === g.key">
              <ul class="common-list">
                <li v-for="item in g.items" :key="item.qid">{{ item.full }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="qb-actions">
          <router-link
            to="/booking"
            class="hero-cta"
            @click="trackBookingClick('home_qb_booking')"
          >
            我想預約命理諮詢（NTD600/小時）
          </router-link>
        </div>
      </section>
    </div>

    <!-- —— ③ 理念三卡 —— -->
    <section class="home-grid">
      <div class="home-tile card">
        <h3>命盤是說明書</h3>
        <p>不是判決書。不是把你定型，而是找出你能動的那一格。</p>
      </div>

      <div class="home-tile card">
        <h3>理性拆解，感性陪伴</h3>
        <p>把你的混亂整理成清晰的一條線，能踏出去的那種。</p>
      </div>

      <div class="home-tile card">
        <h3>尊重你的節奏</h3>
        <p>沒有推銷、沒有壓力。我只幫你把前面那盞燈打亮。</p>
      </div>
    </section>
  </div>
</template>

<script>
/* 
==========================================================
✅ 題庫資料（QUESTION_BANK）
目的：
- 首頁展示常見諮詢問題
- 讓訪客快速知道你能處理哪些類型
==========================================================
*/
const QUESTION_BANK = {
  love: [
    { qid: "reconcile", full: "我們會復合嗎？" },
    { qid: "ex_contact", full: "前任會重新聯絡我嗎？" },
    { qid: "amb_next", full: "曖昧關係會往下一步發展嗎？" },
    { qid: "initiative", full: "我該主動表達還是等待？" },
    { qid: "third", full: "是否有潛在第三者需要注意？" },
    { qid: "continue", full: "這段關係該不該繼續走下去？" },
    { qid: "fix", full: "這段感情目前的問題該怎麼調整？" },
    { qid: "marry", full: "我們適合走向婚姻嗎？" },
    { qid: "peach", full: "我今年有沒有桃花？" },
    { qid: "meet", full: "什麼時候會遇到對的人？" },
    { qid: "letgo", full: "我應該如何放下過去的感情？" },
    { qid: "divorce", full: "這段婚姻該不該離？" },
  ],

  career: [
    { qid: "stay", full: "這間公司還待嗎？" },
    { qid: "valued", full: "我在公司會被重視嗎？" },
    { qid: "raise", full: "是否有升遷或加薪的機會？" },
    { qid: "change", full: "該不該換工作？" },
    { qid: "better", full: "換工作會比現在更好嗎？" },
    { qid: "study", full: "出國進修轉換跑道會順利嗎？" },
    { qid: "direction", full: "哪個方向的事業最有潛力？" },
    { qid: "startup", full: "我適合創業嗎？" },
    { qid: "five", full: "適合我的職業五行是什麼？" },
    { qid: "talent", full: "我的天賦與潛能在哪方面？" },
    { qid: "villain", full: "我在職場上容易有小人嗎？" },
  ],

  money: [
    { qid: "fortune", full: "今年的財運如何？" },
    { qid: "loss", full: "有破財風險需要留意嗎？" },
    { qid: "side", full: "是否有偏財運或額外收入？" },
    { qid: "startup_loss", full: "我適合創業嗎？會不會賠錢？" },
  ],

  year: [
    { qid: "overall_2026", full: "我 2026 年的整體運勢如何？" },
    { qid: "traffic_2026", full: "我今年有車關嗎？" },
    { qid: "job_2026", full: "我今年工作運如何？" },
  ],

  family: [
    { qid: "parents", full: "如何化解與父母或伴侶間的矛盾？" },
    { qid: "kid", full: "我的孩子在學業狀況如何？" },
    { qid: "familyhealth", full: "我家人的疾病狀況？" },
  ],

  name: [
    { qid: "name_check", full: "這個名字對我好嗎？" },
    { qid: "kid_name", full: "想幫小孩子取名？" },
    { qid: "shop_name", full: "店名用什麼名字好？" },
  ],

  house: [
    { qid: "buy", full: "這間房子能買嗎？" },
    { qid: "sell", full: "賣掉這間房子好嗎？" },
    { qid: "ghost", full: "這間房子有拍咪仔嗎？" },
  ],
};

/* 
==========================================================
✅ 分類中文標題
==========================================================
*/
const GROUP_LABELS = {
  love: "感情類",
  career: "事業 / 職涯類",
  money: "財運 / 金錢類",
  year: "流年運勢類",
  family: "家庭 / 親子類",
  name: "姓名 / 取名類",
  house: "房產 / 居家類",
};

export default {
  name: "HomeView",

  data() {
    return {
      /* 
      ==========================================================
      ✅ 每個分類在首頁顯示幾題
      - 想顯示更多：把數字改大
      - 想更精簡：改小（例如 4）
      ==========================================================
      */
      showPerGroup: 10,

      /* 
      ==========================================================
      ✅ Accordion：目前展開的分類 key
      - null：全部收起
      - 例如 "love"：預設先展開感情類
      ==========================================================
      */
      openKey: null,
      // openKey: "love",
    };
  },

  computed: {
    /* 
    ==========================================================
    ✅ 整理給 template 用的分類題庫
    回傳格式：
    [
      { key, label, items }
    ]
    ==========================================================
    */
    questionGroups() {
      return Object.keys(QUESTION_BANK).map((key) => {
        return {
          key,
          label: GROUP_LABELS[key] || key,
          items: (QUESTION_BANK[key] || []).slice(0, this.showPerGroup),
        };
      });
    },
  },

  methods: {
    /* 
    ==========================================================
    ✅ 展開/收起分類（一次只開一個）
    - 點同一個分類：收起
    - 點另一個分類：切換展開
    ==========================================================
    */
    toggleGroup(key) {
      this.openKey = this.openKey === key ? null : key;
    },

    /* 
    ==========================================================
    ✅ GA事件：追蹤點擊「去預約」
    目的：
    1) 統計所有「導去 /booking」的點擊量
    2) 用 event_label 區分是從哪顆按鈕點的
    ==========================================================
    */
    trackBookingClick(sourceLabel = "unknown") {
      /* 
    ----------------------------------------------------------
    ✅ 防呆：確保 gtag 存在
    ----------------------------------------------------------
    */
      if (typeof window.gtag !== "function") return;

      /* 
    ----------------------------------------------------------
    ✅ 送出 GA 事件
    - event: click_booking（事件名稱）
    - event_label: 來源（哪顆按鈕）
    ----------------------------------------------------------
    */
      window.gtag("event", "click_booking", {
        event_category: "engagement",
        event_label: sourceLabel,
      });
    },
  },

  /* =========================
    【Prerender 通知】
    目的：告訴 prerender：這頁可以截圖存 HTML 了
  ========================== */
  mounted() {
    this.$nextTick(() => {
      document.dispatchEvent(new Event("x-app-rendered"));
    });
  },
};
</script>

<style scoped>
/* ——— 字體全域 ——— */
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

body {
  font-family: "LXGW WenKai", "Noto Serif SC", serif;
}

.home-page {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 32px 12px 24px;
}

/* 半透明卡片，讓字在水墨背景上仍清楚 */
.home-overlay {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  padding: 40px 40px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 20px;
  backdrop-filter: blur(10px);
}

/* 左邊文字區 */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-eyebrow {
  font-size: 15px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7b5b3a; /* 接近題字墨色＋土金感 */
  margin: 0;
}

.hero-title {
  font-size: 30px;
  line-height: 1.3;
  margin: 0;
  color: #31241f; /* 溫暖的深咖啡色，配合水墨筆劃 */
}

.hero-subtitle {
  font-size: 14px;
  line-height: 1.7;
  color: #5b544d;
  margin: 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.hero-cta {
  text-decoration: none;
  padding: 9px 18px;
  border-radius: 999px;
  background: #b93a32; /* 取印章紅的感覺 */
  color: #fff;
  font-size: 18px;
  border: 1px solid #aa3028;
  transition: background-color 0.15s ease, transform 0.05s ease,
    box-shadow 0.1s ease;
}

.hero-cta:hover {
  background: #a2302a;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(169, 48, 42, 0.4);
}

.hero-secondary {
  text-decoration: none;
  padding: 9px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #4d433d;
  font-size: 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: background-color 0.15s ease, transform 0.05s ease;
}

.hero-secondary:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

/* 下方三欄介紹（半透明小卡） */
.home-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 4px;
}

.home-tile {
  background: rgba(255, 255, 255, 0.86);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  color: #4a433d;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.home-tile h3 {
  margin: 0 0 6px;
  font-size: 15px;
  color: #333;
}

.home-tile p {
  margin: 0;
  line-height: 1.5;
}

/* ——— 卡片統一風格 ——— */
.card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(1px);

  padding: 24px 26px;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);

  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* Hero 主卡更大一些 */
.hero-card-main {
  padding: 14px 14px;
}

/* 主標題用思源宋體（更穩重） */
.hero-title {
  font-family: "Noto Serif SC", serif;
  font-size: 32px;
  line-height: 1.35;
  color: #31241f;
}

/* 副標題淡一點 */
.hero-subtitle {
  font-family: "Noto Serif SC", serif;
  font-size: 15px;
  color: #564f48;
  line-height: 0.8;
}

/* 常見標題 */
.common-title {
  font-family: "Noto Serif SC";
  font-size: 20px;
  margin-bottom: 12px;
}

/* 小卡片 title */
.home-tile h3 {
  font-family: "Noto Serif SC";
  font-size: 28px;
  margin-bottom: 3px;
}

/* ——— 第二張：常見主題卡（精品強化） ——— */

.common-topics {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.common-title {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  font-size: 26px;
  color: #2f251f;

  letter-spacing: 0.8px;
}

/* 列表更精品、更有呼吸感 */
.common-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: "LXGW WenKai";
  font-size: 20px;
  line-height: 1.2;
  color: #4a433d;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 清單項目加上微底線（精品風） */
.common-list li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.16);
}

.common-list li:last-child {
  border-bottom: none;
}

/* RWD：平板以下改成一欄 */
@media (max-width: 900px) {
  .home-overlay {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-card {
    order: -1;
  }
}

@media (max-width: 640px) {
  .home-page {
    padding: 20px 10px 18px;
    border-radius: 0; /* 手機就讓它全滿 */
  }

  .hero-title {
    font-size: 24px;
  }

  .home-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* 題庫卡：價格提示 */
.qb-price-inline {
  margin: -6px 0 10px;
  font-family: "LXGW WenKai";
  font-size: 16px;
  color: #5b544d;
}

/* Accordion 外框 */
.qb-accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 每一個分類 item */
.qb-item {
  border-top: 1px solid rgba(0, 0, 0, 0.14);
  padding-top: 10px;
}

.qb-item:first-child {
  border-top: none;
  padding-top: 0;
}

/* 分類標題按鈕 */
.qb-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: transparent;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  text-align: left;
}

.qb-head-title {
  font-family: "Noto Serif SC", serif;
  font-size: 24px;
  font-weight: bold;
  color: #4d4b60;
  color: #7b5b3a;
  letter-spacing: 0.6px;
}

/* 小箭頭 */
.qb-head-icon {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.55);
  transform: rotate(0deg);
  transition: transform 0.15s ease;
}

.qb-head-icon.open {
  transform: rotate(180deg);
}

/* 展開內容 */
.qb-body {
  padding: 6px 0 2px;
}

/* CTA */
.qb-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-start;
  font-family: "Noto Serif SC", serif;
}
</style>
