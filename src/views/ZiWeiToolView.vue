<template>
  <div class="chart-tool-page">
    <section class="tool-hero">
      <p class="eyebrow">ZI WEI</p>
      <h1>紫微斗數排盤</h1>
      <p>
        選擇出生年月日與時辰，排出命宮、身宮、五行局、十二宮星曜與大限概要；完整判斷再預約老師解讀。
      </p>
    </section>

    <section class="tool-panel">
      <div class="panel-head">
        <div>
          <span class="step-no">01</span>
          <h2>選擇生辰資料</h2>
        </div>
        <span class="panel-state">陽曆生日</span>
      </div>

      <div class="selector-grid">
        <label>
          <span>性別</span>
          <select v-model="form.gender" class="select-input">
            <option value="male">男命</option>
            <option value="female">女命</option>
          </select>
        </label>
        <label>
          <span>出生年</span>
          <select v-model.number="form.year" class="select-input">
            <option v-for="year in yearOptions" :key="year" :value="year">{{ year }} 年</option>
          </select>
        </label>
        <label>
          <span>出生月</span>
          <select v-model.number="form.month" class="select-input">
            <option v-for="month in monthOptions" :key="month" :value="month">{{ month }} 月</option>
          </select>
        </label>
        <label>
          <span>出生日</span>
          <select v-model.number="form.day" class="select-input">
            <option v-for="day in dayOptions" :key="day" :value="day">{{ day }} 日</option>
          </select>
        </label>
        <label>
          <span>出生時辰</span>
          <select v-model="form.shichen" class="select-input">
            <option v-for="item in shichenOptions" :key="item.key" :value="item.key">
              {{ item.label }}（{{ item.range }}）
            </option>
          </select>
        </label>
        <label>
          <span>想問方向</span>
          <select v-model="form.focus" class="select-input">
            <option v-for="item in focusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="actions">
        <button class="primary-btn" type="button" :disabled="loading" @click="loadChart">
          {{ loading ? "排盤中..." : "開始排盤" }}
        </button>
      </div>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </section>

    <section v-if="chart" class="result-section">
      <div class="result-head">
        <div>
          <p class="eyebrow">CHART</p>
          <h2>紫微命盤</h2>
        </div>
        <button class="primary-btn" type="button" @click="goBooking">
          預約老師解讀
        </button>
      </div>

      <div class="meta-grid">
        <div><span>生日</span><strong>{{ chart.birth.dateLabel }}</strong></div>
        <div><span>時辰</span><strong>{{ chart.birth.timeLabel }}</strong></div>
        <div><span>命宮</span><strong>{{ soulPalaceLabel }}</strong></div>
        <div><span>身宮</span><strong>{{ bodyPalaceLabel }}</strong></div>
      </div>

      <section class="ziwei-board" aria-label="紫微命盤 4x4 地支盤">
        <article
          v-for="cell in gridCells"
          :key="cell.branch"
          class="ziwei-cell"
          :class="{ soul: cell.palace && cell.palace.isSoulPalace, body: cell.palace && cell.palace.isBodyPalace }"
          :style="{ gridArea: cell.area }"
        >
          <div class="cell-head">
            <span>{{ cell.branch }}</span>
            <strong>{{ cell.palace ? cell.palace.name : "空宮" }}</strong>
          </div>
          <div v-if="cell.palace" class="cell-badges">
            <em v-if="cell.palace.isSoulPalace">命</em>
            <em v-if="cell.palace.isBodyPalace">身</em>
            <small>{{ cell.palace.heavenlyStem }}{{ cell.palace.earthlyBranch }}</small>
          </div>
          <p>{{ cell.palace ? starText(cell.palace.majorStars, "空宮") : "未載入" }}</p>
          <small v-if="cell.palace && cell.palace.decadal && cell.palace.decadal.range.length" class="decadal-text">
            {{ cell.palace.decadal.range[0] }}-{{ cell.palace.decadal.range[1] }} 歲
          </small>
        </article>

        <div class="chart-center" aria-label="基本資料">
          <strong>{{ chart.birth.genderLabel }}｜{{ chart.birth.dateLabel }}</strong>
          <span>{{ chart.birth.timeLabel }}</span>
          <span>農曆：{{ chart.lunarDate }}</span>
          <span>四柱：{{ chart.chineseDate }}</span>
          <span>五行局：{{ chart.fiveElementsClass }}</span>
          <span>命主 {{ chart.soul || "未載入" }} · 身主 {{ chart.body || "未載入" }}</span>
        </div>
      </section>

      <section v-if="chart.guide && chart.guide.length" class="chart-block">
        <h3>基礎導讀</h3>
        <div class="guide-grid">
          <article v-for="item in chart.guide" :key="item.title" class="guide-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </section>

      <section class="chart-block" v-if="chart.sihua && chart.sihua.length">
        <h3>生年四化</h3>
        <div class="sihua-list">
          <span v-for="item in chart.sihua" :key="`${item.palace}-${item.star}-${item.hua}`">
            {{ item.palace }} · {{ item.star }}{{ item.hua }}
          </span>
        </div>
      </section>

      <section class="chart-block">
        <h3>十二宮詳表</h3>
        <div class="palace-grid" aria-label="紫微十二宮詳表">
        <article v-for="palace in orderedPalaces" :key="palace.index" class="palace-card">
          <div class="palace-head">
            <div>
              <strong>{{ palace.name }}</strong>
              <span>{{ palace.heavenlyStem }}{{ palace.earthlyBranch }}</span>
            </div>
            <em v-if="palace.isSoulPalace">命</em>
            <em v-if="palace.isBodyPalace">身</em>
          </div>

          <div class="star-section">
            <span class="star-label">主星</span>
            <p>{{ starText(palace.majorStars, "空宮") }}</p>
          </div>
          <div class="star-section">
            <span class="star-label">輔星</span>
            <p>{{ starText(palace.minorStars, "無") }}</p>
          </div>
          <div class="palace-foot">
            <span v-if="palace.decadal && palace.decadal.range.length">
              {{ palace.decadal.range[0] }}-{{ palace.decadal.range[1] }} 歲
            </span>
            <span>{{ palace.changsheng12 }} · {{ palace.boshi12 }}</span>
          </div>
        </article>
        </div>
      </section>

      <details v-if="chart.chartText" class="chart-text">
        <summary>文字盤摘要</summary>
        <pre>{{ chart.chartText }}</pre>
      </details>

      <p class="notice">
        目前頁面只提供排盤資料，不提供完整命理解讀。十二宮互動、四化與大限流年仍需由老師綜合判斷。
      </p>
    </section>
  </div>
</template>

<script>
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";
const STORAGE_KEY = "ziwei_booking_context";

const FALLBACK_SHICHEN = [
  { key: "zi_early", label: "子時", range: "00:00-00:59" },
  { key: "chou", label: "丑時", range: "01:00-02:59" },
  { key: "yin", label: "寅時", range: "03:00-04:59" },
  { key: "mao", label: "卯時", range: "05:00-06:59" },
  { key: "chen", label: "辰時", range: "07:00-08:59" },
  { key: "si", label: "巳時", range: "09:00-10:59" },
  { key: "wu", label: "午時", range: "11:00-12:59" },
  { key: "wei", label: "未時", range: "13:00-14:59" },
  { key: "shen", label: "申時", range: "15:00-16:59" },
  { key: "you", label: "酉時", range: "17:00-18:59" },
  { key: "xu", label: "戌時", range: "19:00-20:59" },
  { key: "hai", label: "亥時", range: "21:00-22:59" },
  { key: "zi_late", label: "晚子時", range: "23:00-23:59" },
];

const PALACE_ORDER = ["命宮", "兄弟", "夫妻", "子女", "財帛", "疾厄", "遷移", "交友", "官祿", "田宅", "福德", "父母"];
const BRANCH_AREAS = {
  巳: "si",
  午: "wu",
  未: "wei",
  申: "shen",
  辰: "chen",
  酉: "you",
  卯: "mao",
  戌: "xu",
  寅: "yin",
  丑: "chou",
  子: "zi",
  亥: "hai",
};

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default {
  name: "ZiWeiToolView",
  data() {
    const currentYear = new Date().getFullYear();
    return {
      form: {
        gender: "male",
        year: 1990,
        month: 1,
        day: 1,
        shichen: "wu",
        focus: "overall",
      },
      currentYear,
      shichenOptions: FALLBACK_SHICHEN,
      focusOptions: [
        { value: "overall", label: "整體命盤" },
        { value: "career", label: "工作事業" },
        { value: "love", label: "感情婚姻" },
        { value: "wealth", label: "財帛田宅" },
        { value: "year", label: "大限流年" },
      ],
      chart: null,
      loading: false,
      errorMessage: "",
    };
  },
  computed: {
    yearOptions() {
      const years = [];
      for (let y = this.currentYear; y >= 1900; y -= 1) years.push(y);
      return years;
    },
    monthOptions() {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    },
    dayOptions() {
      const max = daysInMonth(this.form.year, this.form.month);
      return Array.from({ length: max }, (_, i) => i + 1);
    },
    currentFocusLabel() {
      return this.focusOptions.find((item) => item.value === this.form.focus)?.label || "整體命盤";
    },
    gridCells() {
      if (!Array.isArray(this.chart?.grid)) return [];
      return this.chart.grid
        .flat()
        .filter((cell) => cell && cell.branch)
        .map((cell) => ({
          ...cell,
          area: BRANCH_AREAS[cell.branch] || "auto",
        }));
    },
    orderedPalaces() {
      if (!this.chart?.palaces) return [];
      return [...this.chart.palaces].sort((a, b) => {
        const ai = PALACE_ORDER.indexOf(a.name);
        const bi = PALACE_ORDER.indexOf(b.name);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    },
    soulPalaceLabel() {
      const p = this.chart?.palaces?.find((item) => item.isSoulPalace);
      return p ? `${p.name} ${p.heavenlyStem}${p.earthlyBranch}` : "未載入";
    },
    bodyPalaceLabel() {
      const p = this.chart?.palaces?.find((item) => item.isBodyPalace);
      return p ? `${p.name} ${p.heavenlyStem}${p.earthlyBranch}` : "未載入";
    },
  },
  watch: {
    "form.year": "clampDay",
    "form.month": "clampDay",
  },
  mounted() {
    document.title = "紫微斗數排盤｜命理工具｜梵和易學";
    this.fetchTimeOptions();
  },
  methods: {
    clampDay() {
      const max = daysInMonth(this.form.year, this.form.month);
      if (this.form.day > max) this.form.day = max;
    },
    async fetchTimeOptions() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tools/time-options`);
        const data = await res.json();
        if (Array.isArray(data.shichenOptions)) this.shichenOptions = data.shichenOptions;
      } catch (err) {
        this.shichenOptions = FALLBACK_SHICHEN;
      }
    },
    async loadChart() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const res = await fetch(`${API_BASE_URL}/api/tools/ziwei/chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
        this.chart = data;
        this.$nextTick(() => {
          const el = this.$el.querySelector(".result-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } catch (err) {
        this.errorMessage = "目前無法完成紫微排盤，請稍後再試。";
      } finally {
        this.loading = false;
      }
    },
    starText(stars, fallback) {
      if (!Array.isArray(stars) || stars.length === 0) return fallback;
      return stars.map((item) => item.label || item.name).join("、");
    },
    goBooking() {
      const mainPalaces = ["命宮", "身宮", "夫妻", "官祿", "財帛"].map((name) => {
        if (name === "身宮") {
          const body = this.chart.palaces.find((item) => item.isBodyPalace);
          return body ? `身宮：${body.name} ${body.heavenlyStem}${body.earthlyBranch}` : "身宮：未載入";
        }
        const p = this.chart.palaces.find((item) => item.name === name);
        return p ? `${name}：${p.heavenlyStem}${p.earthlyBranch} ${this.starText(p.majorStars, "空宮")}` : `${name}：未載入`;
      });
      const context = {
        focus: this.currentFocusLabel,
        birth: this.chart.birth,
        fiveElementsClass: this.chart.fiveElementsClass,
        chineseDate: this.chart.chineseDate,
        palaces: mainPalaces,
        sihua: (this.chart.sihua || []).map((item) => `${item.palace} ${item.star}${item.hua}`),
        guide: (this.chart.guide || []).map((item) => `${item.title}：${item.body}`),
        chartText: this.chart.chartText || "",
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
      this.$router.push({
        path: "/booking",
        query: { serviceId: "ziwei", source: "ziwei_web_tool_cta" },
      });
    },
  },
};
</script>

<style scoped>
.chart-tool-page {
  width: 100%;
}

.tool-hero {
  padding: 34px 4px 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #8b6f47;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.tool-hero h1 {
  margin: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 1.1;
  letter-spacing: 0;
}

.tool-hero p {
  max-width: 720px;
  margin: 14px 0 0;
  color: #5d534b;
  font-size: 17px;
  line-height: 1.8;
}

.tool-panel,
.result-section {
  margin-top: 16px;
  padding: 24px;
  border: 1px solid rgba(92, 69, 42, 0.16);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.92);
  box-shadow: 0 14px 38px rgba(65, 45, 24, 0.08);
}

.panel-head,
.result-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head h2,
.result-head h2 {
  margin: 4px 0 0;
  font-size: 26px;
  letter-spacing: 0;
}

.step-no,
.panel-state {
  color: #8b6f47;
  font-size: 12px;
  font-weight: 700;
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.selector-grid label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #4f463e;
  font-weight: 700;
}

.select-input {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid rgba(92, 69, 42, 0.18);
  border-radius: 8px;
  background: #fffdf8;
  color: #2a1f1a;
  font: inherit;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.primary-btn {
  min-height: 46px;
  padding: 12px 22px;
  border: 1px solid #2f7a2f;
  border-radius: 999px;
  background: #2f7a2f;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.error-text {
  margin: 12px 0 0;
  color: #9d3028;
  font-weight: 700;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.meta-grid div,
.chart-block,
.palace-card {
  border: 1px solid rgba(92, 69, 42, 0.14);
  border-radius: 8px;
  background: #fffdf8;
}

.meta-grid div,
.chart-block {
  padding: 16px;
}

.meta-grid span {
  display: block;
  color: #7a6c60;
  font-size: 13px;
  font-weight: 700;
}

.meta-grid strong {
  display: block;
  margin-top: 4px;
  font-size: 18px;
}

.chart-block {
  margin-top: 14px;
}

.chart-block h3 {
  margin: 0 0 12px;
  font-size: 20px;
}

.basic-list,
.sihua-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.basic-list span,
.sihua-list span,
.palace-foot span {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(47, 122, 47, 0.1);
  color: #315d2f;
  font-size: 13px;
}

.ziwei-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(132px, 1fr));
  grid-template-areas:
    "si wu wei shen"
    "chen center center you"
    "mao center center xu"
    "yin chou zi hai";
  gap: 10px;
  margin-top: 14px;
}

.ziwei-cell,
.chart-center {
  border: 1px solid rgba(92, 69, 42, 0.14);
  border-radius: 8px;
  background: #fffdf8;
}

.ziwei-cell {
  min-height: 160px;
  padding: 12px;
}

.ziwei-cell.soul {
  border-color: rgba(185, 58, 50, 0.42);
  box-shadow: inset 0 0 0 1px rgba(185, 58, 50, 0.08);
}

.ziwei-cell.body {
  border-color: rgba(47, 122, 47, 0.38);
}

.cell-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.cell-head span {
  color: #8b6f47;
  font-size: 18px;
  font-weight: 800;
}

.cell-head strong {
  min-width: 0;
  color: #2a1f1a;
  font-size: 16px;
}

.cell-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
}

.cell-badges em {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #b93a32;
  color: #fff;
  font-style: normal;
  font-size: 13px;
  font-weight: 700;
}

.cell-badges small,
.decadal-text {
  color: #7a6c60;
  font-size: 12px;
  font-weight: 700;
}

.ziwei-cell p {
  margin: 10px 0 0;
  color: #40362f;
  font-size: 14px;
  line-height: 1.55;
}

.decadal-text {
  display: block;
  margin-top: 8px;
}

.chart-center {
  grid-area: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 18px;
  text-align: center;
}

.chart-center strong {
  color: #2a1f1a;
  font-size: 17px;
}

.chart-center span {
  color: #5d534b;
  font-size: 14px;
  line-height: 1.45;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.guide-card {
  padding: 12px;
  border: 1px solid rgba(92, 69, 42, 0.12);
  border-radius: 8px;
  background: rgba(250, 246, 238, 0.82);
}

.guide-card strong {
  display: block;
  color: #8b3a32;
  font-size: 15px;
}

.guide-card p {
  margin: 6px 0 0;
  color: #4f463e;
  font-size: 14px;
  line-height: 1.65;
}

.palace-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.palace-card {
  min-height: 230px;
  padding: 14px;
}

.palace-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
}

.palace-head strong {
  display: block;
  font-size: 19px;
}

.palace-head span {
  display: block;
  color: #7a6c60;
  font-size: 13px;
}

.palace-head em {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #b93a32;
  color: #fff;
  font-style: normal;
  font-weight: 700;
}

.star-section {
  margin-top: 10px;
}

.star-label {
  color: #8b6f47;
  font-size: 12px;
  font-weight: 700;
}

.star-section p {
  margin: 4px 0 0;
  color: #40362f;
  line-height: 1.55;
}

.palace-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.chart-text {
  margin-top: 14px;
  padding: 16px;
  border: 1px solid rgba(92, 69, 42, 0.14);
  border-radius: 8px;
  background: #fffdf8;
}

.chart-text summary {
  cursor: pointer;
  color: #8b6f47;
  font-weight: 700;
}

.chart-text pre {
  overflow: auto;
  margin: 12px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #40362f;
  font: inherit;
  line-height: 1.65;
}

.notice {
  margin: 16px 0 0;
  color: #6a5d53;
  line-height: 1.7;
}

@media (max-width: 980px) {
  .selector-grid,
  .meta-grid,
  .guide-grid,
  .palace-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ziwei-board {
    grid-template-columns: repeat(4, minmax(116px, 1fr));
    overflow-x: auto;
    padding-bottom: 4px;
  }
}

@media (max-width: 620px) {
  .tool-panel,
  .result-section {
    padding: 18px;
  }

  .panel-head,
  .result-head {
    flex-direction: column;
  }

  .selector-grid,
  .meta-grid,
  .guide-grid,
  .palace-grid {
    grid-template-columns: 1fr;
  }

  .ziwei-board {
    grid-template-columns: 1fr;
    grid-template-areas: none;
    overflow-x: visible;
  }

  .ziwei-cell,
  .chart-center {
    grid-area: auto !important;
  }

  .actions {
    justify-content: stretch;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
