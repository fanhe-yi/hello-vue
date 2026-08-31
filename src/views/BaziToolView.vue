<template>
  <div class="chart-tool-page">
    <section class="tool-hero">
      <p class="eyebrow">BA ZI</p>
      <h1>八字排盤</h1>
      <p>
        選擇出生年月日與時辰，先排出四柱、十神、藏干、五行與大運概要；完整判斷再交由老師正式解讀。
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
          <h2>八字命盤</h2>
        </div>
        <button class="primary-btn" type="button" @click="goBooking">
          預約老師解讀
        </button>
      </div>

      <div class="meta-grid">
        <div><span>生日</span><strong>{{ chart.birth.dateLabel }}</strong></div>
        <div><span>時辰</span><strong>{{ chart.birth.timeLabel }}</strong></div>
        <div><span>性別</span><strong>{{ chart.birth.genderLabel }}</strong></div>
        <div><span>日主</span><strong>{{ chart.dayMaster }}{{ chart.dayMasterElement }}</strong></div>
      </div>

      <div class="pillar-grid">
        <article v-for="pillar in chart.pillars" :key="pillar.key" class="pillar-card">
          <span>{{ pillar.label }}</span>
          <strong>{{ pillar.ganzhi }}</strong>
          <small>{{ pillar.tenGod || " " }}</small>
          <p>{{ pillar.naYin }} · {{ pillar.selfSitting }}</p>
          <div class="hidden-list">
            <em v-for="stem in pillar.hiddenStems" :key="stem.stem">
              {{ stem.stem }}{{ stem.tenGod ? ` ${stem.tenGod}` : "" }}
            </em>
          </div>
        </article>
      </div>

      <section class="chart-block">
        <h3>五行分布</h3>
        <div class="element-bars">
          <div v-for="item in chart.fiveElements" :key="item.name" class="element-row">
            <span>{{ item.name }}</span>
            <div class="bar-track">
              <i :style="{ width: elementWidth(item.value) }"></i>
            </div>
            <strong>{{ formatNumber(item.value) }}</strong>
          </div>
        </div>
      </section>

      <section class="chart-block">
        <h3>大運概要</h3>
        <div class="dayun-list">
          <span v-for="item in chart.dayun" :key="item.index" class="dayun-chip">
            {{ item.startAge }}-{{ item.endAge }} 歲 · {{ item.ganzhi }}
          </span>
        </div>
      </section>

      <p class="notice">
        目前頁面只提供排盤資料，不提供完整命理解讀。若要判斷格局、流年與具體問題，請預約老師正式分析。
      </p>
    </section>
  </div>
</template>

<script>
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";
const STORAGE_KEY = "bazi_booking_context";

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

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default {
  name: "BaziToolView",
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
        { value: "overall", label: "整體命格" },
        { value: "career", label: "工作事業" },
        { value: "love", label: "感情關係" },
        { value: "wealth", label: "財運規劃" },
        { value: "year", label: "流年運勢" },
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
      return this.focusOptions.find((item) => item.value === this.form.focus)?.label || "整體命格";
    },
  },
  watch: {
    "form.year": "clampDay",
    "form.month": "clampDay",
  },
  mounted() {
    document.title = "八字排盤｜命理工具｜梵和易學";
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
        const res = await fetch(`${API_BASE_URL}/api/tools/bazi/chart`, {
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
        this.errorMessage = "目前無法完成八字排盤，請稍後再試。";
      } finally {
        this.loading = false;
      }
    },
    formatNumber(value) {
      return Number(value || 0).toFixed(1).replace(/\.0$/, "");
    },
    elementWidth(value) {
      const max = Math.max(...this.chart.fiveElements.map((item) => Number(item.value || 0)), 1);
      return `${Math.max(6, (Number(value || 0) / max) * 100)}%`;
    },
    goBooking() {
      const context = {
        focus: this.currentFocusLabel,
        birth: this.chart.birth,
        pillars: this.chart.pillars.map((item) => `${item.label}：${item.ganzhi}${item.tenGod ? `（${item.tenGod}）` : ""}`),
        dayMaster: `${this.chart.dayMaster}${this.chart.dayMasterElement}`,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
      this.$router.push({
        path: "/booking",
        query: { serviceId: "bazi", source: "bazi_web_tool_cta" },
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

.meta-grid,
.pillar-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.meta-grid div,
.pillar-card,
.chart-block {
  border: 1px solid rgba(92, 69, 42, 0.14);
  border-radius: 8px;
  background: #fffdf8;
}

.meta-grid div {
  padding: 14px;
}

.meta-grid span,
.pillar-card span {
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

.pillar-grid {
  margin-top: 14px;
}

.pillar-card {
  min-height: 176px;
  padding: 16px;
}

.pillar-card strong {
  display: block;
  margin: 6px 0 2px;
  font-size: 36px;
  letter-spacing: 0;
}

.pillar-card small {
  display: block;
  min-height: 20px;
  color: #2f7a2f;
  font-weight: 700;
}

.pillar-card p {
  margin: 8px 0 0;
  color: #64584e;
  line-height: 1.5;
}

.hidden-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.hidden-list em,
.dayun-chip {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(47, 122, 47, 0.1);
  color: #315d2f;
  font-style: normal;
  font-size: 12px;
}

.chart-block {
  margin-top: 14px;
  padding: 18px;
}

.chart-block h3 {
  margin: 0 0 12px;
  font-size: 20px;
}

.element-row {
  display: grid;
  grid-template-columns: 30px 1fr 42px;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
}

.bar-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(92, 69, 42, 0.1);
  overflow: hidden;
}

.bar-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #b93a32;
}

.dayun-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notice {
  margin: 16px 0 0;
  color: #6a5d53;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .selector-grid,
  .meta-grid,
  .pillar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .pillar-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: stretch;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
