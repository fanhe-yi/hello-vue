<template>
  <div class="nameology-page">
    <section class="nameology-hero">
      <div class="hero-copy">
        <span class="hero-kicker">姓名學工具</span>
        <h1>姓名筆劃計算</h1>
        <p>輸入姓名後，依筆劃計算宮位、五行與相生相剋。</p>
      </div>
    </section>

    <section class="tool-shell" aria-label="姓名筆劃計算工具">
      <div class="mode-tabs" role="tablist" aria-label="姓名格式">
        <button
          v-for="option in modeOptions"
          :key="option.value"
          type="button"
          class="mode-tab"
          :class="{ active: mode === option.value }"
          @click="setMode(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <form class="name-form" @submit.prevent="calculate">
        <div class="input-grid">
          <label v-for="field in activeFields" :key="field.key" class="char-field">
            <span>{{ field.label }}</span>
            <input
              v-model.trim="chars[field.key]"
              type="text"
              inputmode="text"
              autocomplete="off"
              :aria-label="field.label"
              @input="clearFieldError(field.key)"
            />
          </label>
        </div>

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <div class="actions">
          <button class="primary-action" type="submit" :disabled="loading">
            {{ loading ? "計算中..." : "開始計算" }}
          </button>
          <button class="ghost-action" type="button" @click="resetForm" :disabled="loading">
            清除
          </button>
        </div>
      </form>
    </section>

    <section v-if="result" class="result-shell" aria-label="姓名學計算結果">
      <div class="result-header">
        <span class="result-label">計算結果</span>
        <strong>{{ result.fullName }}</strong>
      </div>

      <div class="stroke-list">
        <div v-for="item in result.strokes" :key="item.key" class="stroke-item">
          <span class="stroke-char">{{ item.char }}</span>
          <span class="stroke-meta">{{ item.label }}</span>
          <strong>{{ item.stroke }} 畫</strong>
        </div>
      </div>

      <div class="palace-grid">
        <article v-for="palace in result.palaces" :key="palace.key" class="palace-card">
          <span class="palace-name">{{ palace.label }}</span>
          <div class="palace-main">
            <strong>{{ palace.value }}</strong>
            <span :class="['element-badge', `element-${palace.element}`]">
              {{ palace.element }}
            </span>
          </div>
          <small>{{ palace.formula }}</small>
        </article>
      </div>

      <div class="relation-grid">
        <article
          v-for="relation in result.relations"
          :key="relation.key"
          class="relation-card"
        >
          <span>{{ relation.label }}</span>
          <strong>{{ relation.text }}</strong>
          <small>{{ relation.from }} → {{ relation.to }}</small>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
/* =========================================================
   筆劃 API：走自家後端代理 /api/stroke
   - 因第三方 superiorapis CORS Allow-Headers 沒列 `token`，
     瀏覽器直打必被擋；token 改藏在後端 .env
   - 後端 base URL 沿用既有 VUE_APP_API_BASE_URL（dev:
     localhost:3000，prod: https://api.chen-yi.tw/booking）
   ========================================================= */
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";
const STROKE_API_URL = `${API_BASE_URL}/api/stroke`;
const CACHE_PREFIX = "nameology:stroke:";

const MODE_OPTIONS = [
  {
    value: "singleSurnameDoubleName",
    label: "單姓雙名",
    fields: [
      { key: "surname", label: "姓" },
      { key: "given1", label: "名一" },
      { key: "given2", label: "名二" },
    ],
  },
  {
    value: "singleSurnameSingleName",
    label: "單姓單名",
    fields: [
      { key: "surname", label: "姓" },
      { key: "given1", label: "名" },
    ],
  },
  {
    value: "doubleSurnameDoubleName",
    label: "複姓雙名",
    fields: [
      { key: "surname1", label: "姓一" },
      { key: "surname2", label: "姓二" },
      { key: "given1", label: "名一" },
      { key: "given2", label: "名二" },
    ],
  },
];

function isOneHanChar(value) {
  const chars = Array.from(String(value || "").trim());
  return chars.length === 1 && /\p{Script=Han}/u.test(chars[0]);
}

function numberToElement(value) {
  const tail = value % 10;
  if (tail === 1 || tail === 2) return "木";
  if (tail === 3 || tail === 4) return "火";
  if (tail === 5 || tail === 6) return "土";
  if (tail === 7 || tail === 8) return "金";
  return "水";
}

function compareElements(from, to) {
  if (from === to) return `${from}${to}平`;

  const generateMap = {
    木: "火",
    火: "土",
    土: "金",
    金: "水",
    水: "木",
  };
  if (generateMap[from] === to) return `${from}生${to}`;
  if (generateMap[to] === from) return `${to}生${from}`;

  const controlMap = {
    木: "土",
    土: "水",
    水: "火",
    火: "金",
    金: "木",
  };
  if (controlMap[from] === to) return `${from}剋${to}`;
  if (controlMap[to] === from) return `${to}剋${from}`;

  return "";
}

function readCachedStroke(char) {
  try {
    const cached = window.localStorage.getItem(`${CACHE_PREFIX}${char}`);
    const value = Number(cached);
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch (err) {
    return null;
  }
}

function writeCachedStroke(char, stroke) {
  try {
    window.localStorage.setItem(`${CACHE_PREFIX}${char}`, String(stroke));
  } catch (err) {
    // 快取失敗不影響計算。
  }
}

async function fetchStroke(char) {
  const cached = readCachedStroke(char);
  if (cached) return cached;

  const response = await fetch(STROKE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: char }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !Number.isInteger(data.stroke)) {
    throw new Error(data.error || "筆劃查詢失敗");
  }

  writeCachedStroke(char, data.stroke);
  return data.stroke;
}

function withElement(palace) {
  return {
    ...palace,
    element: numberToElement(palace.value),
  };
}

function buildNameologyResult(mode, entries) {
  const byKey = Object.fromEntries(entries.map((item) => [item.key, item]));
  let palaces = [];

  if (mode === "singleSurnameDoubleName") {
    const surname = byKey.surname.stroke;
    const given1 = byKey.given1.stroke;
    const given2 = byKey.given2.stroke;
    palaces = [
      { key: "parents", label: "父母宮", value: surname + 1, formula: "姓 + 1" },
      { key: "illness", label: "疾厄宮", value: surname + given1, formula: "姓 + 名一" },
      { key: "children", label: "子女宮", value: given1 + given2, formula: "名一 + 名二" },
      { key: "migration", label: "遷移宮", value: given2 + 1, formula: "名二 + 1" },
      {
        key: "destiny",
        label: "命宮",
        value: surname + given1 + given2,
        formula: "姓 + 名一 + 名二",
      },
    ];
  } else if (mode === "singleSurnameSingleName") {
    const surname = byKey.surname.stroke;
    const given1 = byKey.given1.stroke;
    palaces = [
      { key: "parents", label: "父母宮", value: surname + 1, formula: "姓 + 1" },
      { key: "illness", label: "疾厄宮", value: surname + given1, formula: "姓 + 名" },
      { key: "children", label: "子女宮", value: given1 + 1, formula: "名 + 1" },
      { key: "destiny", label: "命宮", value: surname + given1, formula: "姓 + 名" },
    ];
  } else {
    const surname1 = byKey.surname1.stroke;
    const surname2 = byKey.surname2.stroke;
    const given1 = byKey.given1.stroke;
    const given2 = byKey.given2.stroke;
    palaces = [
      { key: "parents", label: "父母宮", value: surname1 + surname2, formula: "姓一 + 姓二" },
      {
        key: "illness",
        label: "疾厄宮",
        value: surname1 + surname2 + given1,
        formula: "姓一 + 姓二 + 名一",
      },
      { key: "children", label: "子女宮", value: given1 + given2, formula: "名一 + 名二" },
      {
        key: "destiny",
        label: "命宮",
        value: surname1 + surname2 + given1 + given2,
        formula: "姓一 + 姓二 + 名一 + 名二",
      },
    ];
  }

  const normalizedPalaces = palaces.map(withElement);
  const parents = normalizedPalaces.find((item) => item.key === "parents");
  const illness = normalizedPalaces.find((item) => item.key === "illness");
  const children = normalizedPalaces.find((item) => item.key === "children");

  return {
    fullName: entries.map((item) => item.char).join(""),
    strokes: entries,
    palaces: normalizedPalaces,
    relations: [
      {
        key: "thought",
        label: "思想功能",
        from: parents.element,
        to: illness.element,
        text: compareElements(parents.element, illness.element),
      },
      {
        key: "action",
        label: "行動功能",
        from: illness.element,
        to: children.element,
        text: compareElements(illness.element, children.element),
      },
    ],
  };
}

export default {
  name: "NameologyView",
  data() {
    return {
      mode: "singleSurnameDoubleName",
      chars: {
        surname: "",
        surname1: "",
        surname2: "",
        given1: "",
        given2: "",
      },
      formError: "",
      loading: false,
      result: null,
    };
  },
  computed: {
    modeOptions() {
      return MODE_OPTIONS;
    },
    activeMode() {
      return MODE_OPTIONS.find((item) => item.value === this.mode);
    },
    activeFields() {
      return this.activeMode.fields;
    },
  },
  methods: {
    setMode(mode) {
      if (this.mode === mode) return;
      this.mode = mode;
      this.resetForm();
    },
    resetForm() {
      this.chars = {
        surname: "",
        surname1: "",
        surname2: "",
        given1: "",
        given2: "",
      };
      this.formError = "";
      this.result = null;
    },
    clearFieldError() {
      this.formError = "";
      this.result = null;
    },
    validateFields() {
      const invalid = this.activeFields.find(
        (field) => !isOneHanChar(this.chars[field.key])
      );
      if (invalid) {
        this.formError = `${invalid.label} 請輸入一個中文字`;
        return false;
      }
      return true;
    },
    async calculate() {
      this.formError = "";
      this.result = null;
      if (!this.validateFields()) return;

      this.loading = true;
      try {
        const entries = [];
        for (const field of this.activeFields) {
          const char = Array.from(this.chars[field.key].trim())[0];
          const stroke = await fetchStroke(char);
          entries.push({ key: field.key, label: field.label, char, stroke });
        }
        this.result = buildNameologyResult(this.mode, entries);
      } catch (err) {
        this.formError = "筆劃查詢失敗，請稍後再試";
        // eslint-disable-next-line no-console
        console.warn("[nameology] stroke lookup failed:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

.nameology-page {
  --ink: #2a1f1a;
  --ink-soft: #4a423b;
  --ink-mute: #6b6157;
  --paper: rgba(255, 252, 247, 0.86);
  --paper-strong: rgba(255, 253, 249, 0.96);
  --gold: #a78550;
  --gold-deep: #795b2d;
  --seal: #b93a32;
  --line: rgba(60, 40, 25, 0.14);
  --shadow: 0 16px 38px rgba(60, 40, 25, 0.1);

  max-width: 1080px;
  margin: 0 auto;
  padding: 34px 12px 46px;
  color: var(--ink);
  font-family: "LXGW WenKai", "Noto Serif SC", serif;
}

.nameology-hero {
  padding: 24px 4px 20px;
}

.hero-copy {
  max-width: 680px;
}

.hero-kicker,
.result-label {
  display: inline-flex;
  color: var(--gold-deep);
  font-size: 13px;
  letter-spacing: 0.22em;
}

.hero-copy h1 {
  margin: 10px 0 8px;
  font-family: "Noto Serif SC", serif;
  font-size: clamp(32px, 6vw, 54px);
  font-weight: 600;
  line-height: 1.18;
  letter-spacing: 0;
}

.hero-copy p {
  margin: 0;
  color: var(--ink-mute);
  font-size: 17px;
  line-height: 1.8;
}

.tool-shell,
.result-shell {
  background: var(--paper);
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 28px;
  backdrop-filter: blur(14px) saturate(1.08);
  -webkit-backdrop-filter: blur(14px) saturate(1.08);
}

.result-shell {
  margin-top: 20px;
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 5px;
  background: rgba(60, 40, 25, 0.06);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.mode-tab {
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.mode-tab.active {
  background: var(--paper-strong);
  color: var(--seal);
  box-shadow: 0 5px 16px rgba(60, 40, 25, 0.08);
}

.name-form {
  margin-top: 24px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.char-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.char-field span {
  color: var(--ink-mute);
  font-size: 14px;
}

.char-field input {
  width: 100%;
  height: 58px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 253, 249, 0.72);
  color: var(--ink);
  text-align: center;
  font-family: "Noto Serif SC", serif;
  font-size: 28px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.char-field input:focus {
  border-color: rgba(185, 58, 50, 0.46);
  background: rgba(255, 253, 249, 0.98);
  box-shadow: 0 0 0 3px rgba(185, 58, 50, 0.1);
}

.form-error {
  margin: 16px 0 0;
  color: var(--seal);
  font-weight: 600;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.primary-action,
.ghost-action {
  min-height: 46px;
  border-radius: 999px;
  padding: 0 22px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-action {
  border: 1px solid var(--seal);
  background: var(--seal);
  color: #fff8f0;
  box-shadow: 0 10px 24px rgba(185, 58, 50, 0.22);
}

.ghost-action {
  border: 1px solid var(--line);
  background: rgba(255, 253, 249, 0.62);
  color: var(--ink-soft);
}

.primary-action:disabled,
.ghost-action:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.result-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.result-header strong {
  font-family: "Noto Serif SC", serif;
  font-size: 30px;
  letter-spacing: 0.08em;
}

.stroke-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.stroke-item,
.palace-card,
.relation-card {
  border: 1px solid var(--line);
  background: rgba(255, 253, 249, 0.58);
  border-radius: 14px;
}

.stroke-item {
  min-height: 92px;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    "char meta"
    "char value";
  align-items: center;
  gap: 2px 12px;
  padding: 14px;
}

.stroke-char {
  grid-area: char;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: rgba(185, 58, 50, 0.1);
  color: var(--seal);
  font-family: "Noto Serif SC", serif;
  font-size: 30px;
  font-weight: 600;
}

.stroke-meta {
  grid-area: meta;
  color: var(--ink-mute);
  font-size: 13px;
}

.stroke-item strong {
  grid-area: value;
  font-size: 20px;
}

.palace-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.palace-card {
  min-height: 128px;
  padding: 16px;
}

.palace-name,
.relation-card span {
  display: block;
  color: var(--ink-mute);
  font-size: 14px;
}

.palace-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.palace-main strong {
  font-size: 32px;
  line-height: 1;
}

.element-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 28px;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
}

.element-木 { background: #3c8a5f; }
.element-火 { background: #bd4b38; }
.element-土 { background: #a78550; }
.element-金 { background: #8e7f68; }
.element-水 { background: #376f91; }

.palace-card small,
.relation-card small {
  display: block;
  margin-top: 12px;
  color: var(--ink-mute);
  line-height: 1.5;
}

.relation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.relation-card {
  padding: 18px;
}

.relation-card strong {
  display: block;
  margin-top: 10px;
  color: var(--seal);
  font-size: 24px;
}

@media (max-width: 820px) {
  .nameology-page {
    padding-top: 18px;
  }

  .tool-shell,
  .result-shell {
    padding: 20px;
    border-radius: 18px;
  }

  .mode-tabs,
  .input-grid,
  .stroke-list,
  .palace-grid,
  .relation-grid {
    grid-template-columns: 1fr;
  }

  .mode-tabs {
    gap: 6px;
  }

  .result-header {
    align-items: start;
    flex-direction: column;
  }
}
</style>
