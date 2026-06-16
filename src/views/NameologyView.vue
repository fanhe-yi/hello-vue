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

      <!-- Excel 風格主表 -->
      <div class="table-wrap">
        <table class="result-table">
          <thead>
            <tr>
              <th class="col-char">字</th>
              <th class="col-stroke">筆劃</th>
              <th class="col-calc">加總</th>
              <th class="col-palace">宮位</th>
              <th class="col-element">五行</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in result.tableRows"
              :key="idx"
              :class="['row-' + row.type, row.palace ? 'has-palace' : 'no-palace']"
            >
              <td class="col-char">{{ row.char }}</td>
              <td class="col-stroke">{{ row.stroke }}</td>
              <td class="col-calc">
                <span v-if="row.calc" class="calc-text">{{ row.calc }}</span>
                <span v-else class="dim">—</span>
              </td>
              <td class="col-palace">
                <span v-if="row.palace" class="palace-tag">
                  {{ row.palace.label }}
                </span>
              </td>
              <td class="col-element">
                <span
                  v-if="row.palace"
                  :class="['element-badge', `element-${row.palace.element}`]"
                >
                  {{ row.palace.element }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="row-destiny">
              <td colspan="2" class="destiny-label">命宮</td>
              <td class="col-calc">
                <span class="calc-text">{{ result.destiny.calc }}</span>
              </td>
              <td class="col-palace">
                <span class="palace-tag palace-destiny">命宮</span>
              </td>
              <td class="col-element">
                <span
                  :class="['element-badge', `element-${result.destiny.element}`]"
                >
                  {{ result.destiny.element }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 五行相生相剋（兩條橫式） -->
      <div class="relation-strip">
        <div
          v-for="relation in result.relations"
          :key="relation.key"
          class="relation-row"
        >
          <span class="relation-label">{{ relation.label }}</span>
          <span class="relation-arrow">
            <span :class="['element-badge', 'element-' + relation.from]">
              {{ relation.from }}
            </span>
            <span class="arrow">→</span>
            <span :class="['element-badge', 'element-' + relation.to]">
              {{ relation.to }}
            </span>
          </span>
          <strong class="relation-text">{{ relation.text }}</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
/* =========================================================
   筆劃查詢策略（v3 加速版）
   ----
   1. localStorage cache：同字立即命中
   2. moedict.tw 主路線（0.3s/字，CORS 允許瀏覽器直打，CDN）：
        姓名學筆劃 = data.n + 部首康熙筆劃
   3. 自家後端 /api/stroke fallback（superiorapis 3-6s/字）
      —— moedict 命中失敗 或 部首不在表中 時自動接手
   ========================================================= */
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";
const STROKE_API_FALLBACK_URL = `${API_BASE_URL}/api/stroke`;
const MOEDICT_URL_PREFIX = "https://www.moedict.tw/a/";
const CACHE_PREFIX = "nameology:stroke:";

/* 康熙 214 部首對應傳統筆劃（姓名學標準） */
const KANGXI_RAD_STROKES = {
  "一":1,"丨":1,"丶":1,"丿":1,"乙":1,"亅":1,
  "二":2,"亠":2,"人":2,"儿":2,"入":2,"八":2,"冂":2,"冖":2,"冫":2,"几":2,"凵":2,"刀":2,"力":2,"勹":2,"匕":2,"匚":2,"匸":2,"十":2,"卜":2,"卩":2,"厂":2,"厶":2,"又":2,
  "口":3,"囗":3,"土":3,"士":3,"夂":3,"夊":3,"夕":3,"大":3,"女":3,"子":3,"宀":3,"寸":3,"小":3,"尢":3,"尸":3,"屮":3,"山":3,"巛":3,"工":3,"己":3,"巾":3,"干":3,"幺":3,"广":3,"廴":3,"廾":3,"弋":3,"弓":3,"彐":3,"彡":3,"彳":3,
  "心":4,"戈":4,"戶":4,"手":4,"支":4,"攴":4,"文":4,"斗":4,"斤":4,"方":4,"无":4,"日":4,"曰":4,"月":4,"木":4,"欠":4,"止":4,"歹":4,"殳":4,"毋":4,"比":4,"毛":4,"氏":4,"气":4,"水":4,"火":4,"爪":4,"父":4,"爻":4,"爿":4,"片":4,"牙":4,"牛":4,"犬":4,
  "玄":5,"玉":5,"瓜":5,"瓦":5,"甘":5,"生":5,"用":5,"田":5,"疋":5,"疒":5,"癶":5,"白":5,"皮":5,"皿":5,"目":5,"矛":5,"矢":5,"石":5,"示":5,"禸":5,"禾":5,"穴":5,"立":5,
  "竹":6,"米":6,"糸":6,"缶":6,"网":6,"羊":6,"羽":6,"老":6,"而":6,"耒":6,"耳":6,"聿":6,"肉":6,"臣":6,"自":6,"至":6,"臼":6,"舌":6,"舛":6,"舟":6,"艮":6,"色":6,"艸":6,"虍":6,"虫":6,"血":6,"行":6,"衣":6,"襾":6,
  "見":7,"角":7,"言":7,"谷":7,"豆":7,"豕":7,"豸":7,"貝":7,"赤":7,"走":7,"足":7,"身":7,"車":7,"辛":7,"辰":7,"辵":7,"邑":7,"酉":7,"釆":7,"里":7,
  "金":8,"長":8,"門":8,"阜":8,"隶":8,"隹":8,"雨":8,"靑":8,"非":8,
  "面":9,"革":9,"韋":9,"韭":9,"音":9,"頁":9,"風":9,"飛":9,"食":9,"首":9,"香":9,
  "馬":10,"骨":10,"高":10,"髟":10,"鬥":10,"鬯":10,"鬲":10,"鬼":10,
  "魚":11,"鳥":11,"鹵":11,"鹿":11,"麥":11,"麻":11,
  "黃":12,"黍":12,"黑":12,"黹":12,
  "黽":13,"鼎":13,"鼓":13,"鼠":13,
  "鼻":14,"齊":14,"齒":15,"龍":16,"龜":16,"龠":17,
};

const HAN_RE = /[一-鿿]/;
function extractRadical(rawR) {
  if (!rawR) return "";
  const m = String(rawR).match(HAN_RE);
  return m ? m[0] : "";
}

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

async function fetchStrokeFromMoedict(char) {
  const res = await fetch(MOEDICT_URL_PREFIX + encodeURIComponent(char) + ".json");
  if (!res.ok) return null;
  const d = await res.json().catch(() => null);
  if (!d) return null;
  const rad = extractRadical(d.r);
  const radK = KANGXI_RAD_STROKES[rad];
  if (typeof d.n !== "number" || typeof radK !== "number") return null;
  return d.n + radK;
}

async function fetchStrokeFromFallback(char) {
  const res = await fetch(STROKE_API_FALLBACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: char }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Number.isInteger(data.stroke)) {
    throw new Error(data.error || "筆劃查詢失敗");
  }
  return data.stroke;
}

async function fetchStroke(char) {
  const cached = readCachedStroke(char);
  if (cached) return cached;

  // 1) 主路：moedict（fast）
  try {
    const stroke = await fetchStrokeFromMoedict(char);
    if (stroke != null) {
      writeCachedStroke(char, stroke);
      return stroke;
    }
  } catch (e) {
    // 網路 / CORS / parse 失敗 → fall through
  }

  // 2) Fallback：自家後端 superiorapis 代理
  const stroke = await fetchStrokeFromFallback(char);
  writeCachedStroke(char, stroke);
  return stroke;
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
  const palaceByKey = Object.fromEntries(
    normalizedPalaces.map((p) => [p.key, p]),
  );
  const parents = palaceByKey.parents;
  const illness = palaceByKey.illness;
  const children = palaceByKey.children;
  const destiny = palaceByKey.destiny;

  /* =========================================================
     【Excel 風格表格】每列：字 + 筆劃 + 加總（公式） + 宮位 + 五行
     ----
     - "·" 虛字 = "+1" 的視覺化（單姓模式起頭跟結尾用）
     - calc 欄位以 "16 + 15 = 31" 文字呈現
     ========================================================= */
  let tableRows = [];

  if (mode === "singleSurnameDoubleName") {
    const surname = byKey.surname;
    const given1 = byKey.given1;
    const given2 = byKey.given2;
    tableRows = [
      { type: "virtual", char: "·", stroke: 1, palace: null },
      {
        type: "char",
        char: surname.char,
        stroke: surname.stroke,
        palace: parents,
        calc: `1 + ${surname.stroke} = ${parents.value}`,
      },
      {
        type: "char",
        char: given1.char,
        stroke: given1.stroke,
        palace: illness,
        calc: `${surname.stroke} + ${given1.stroke} = ${illness.value}`,
      },
      {
        type: "char",
        char: given2.char,
        stroke: given2.stroke,
        palace: children,
        calc: `${given1.stroke} + ${given2.stroke} = ${children.value}`,
      },
      {
        type: "virtual",
        char: "·",
        stroke: 1,
        palace: palaceByKey.migration,
        calc: `${given2.stroke} + 1 = ${palaceByKey.migration.value}`,
      },
    ];
  } else if (mode === "singleSurnameSingleName") {
    const surname = byKey.surname;
    const given1 = byKey.given1;
    tableRows = [
      { type: "virtual", char: "·", stroke: 1, palace: null },
      {
        type: "char",
        char: surname.char,
        stroke: surname.stroke,
        palace: parents,
        calc: `1 + ${surname.stroke} = ${parents.value}`,
      },
      {
        type: "char",
        char: given1.char,
        stroke: given1.stroke,
        palace: illness,
        calc: `${surname.stroke} + ${given1.stroke} = ${illness.value}`,
      },
      {
        type: "virtual",
        char: "·",
        stroke: 1,
        palace: children,
        calc: `${given1.stroke} + 1 = ${children.value}`,
      },
    ];
  } else {
    const surname1 = byKey.surname1;
    const surname2 = byKey.surname2;
    const given1 = byKey.given1;
    const given2 = byKey.given2;
    tableRows = [
      { type: "char", char: surname1.char, stroke: surname1.stroke, palace: null },
      {
        type: "char",
        char: surname2.char,
        stroke: surname2.stroke,
        palace: parents,
        calc: `${surname1.stroke} + ${surname2.stroke} = ${parents.value}`,
      },
      {
        type: "char",
        char: given1.char,
        stroke: given1.stroke,
        palace: illness,
        calc: `${surname1.stroke} + ${surname2.stroke} + ${given1.stroke} = ${illness.value}`,
      },
      {
        type: "char",
        char: given2.char,
        stroke: given2.stroke,
        palace: children,
        calc: `${given1.stroke} + ${given2.stroke} = ${children.value}`,
      },
    ];
  }

  /* 命宮數字公式：例如「16 + 15 + 16 = 47」 */
  const destinyStrokes = entries.map((e) => e.stroke);
  const destinyCalc = `${destinyStrokes.join(" + ")} = ${destiny.value}`;

  return {
    fullName: entries.map((item) => item.char).join(""),
    strokes: entries,
    palaces: normalizedPalaces,
    destiny: { ...destiny, calc: destinyCalc },
    tableRows,
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
        // 並行查所有字（moedict + fallback 都共用快取）
        const entries = await Promise.all(
          this.activeFields.map(async (field) => {
            const char = Array.from(this.chars[field.key].trim())[0];
            const stroke = await fetchStroke(char);
            return { key: field.key, label: field.label, char, stroke };
          })
        );
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

/* ============================================
   Excel 風格主表
   ============================================ */
.table-wrap {
  margin-top: 18px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Noto Serif SC", "LXGW WenKai", serif;
}

.result-table th,
.result-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}

.result-table thead th {
  font-size: 13px;
  font-weight: 600;
  color: var(--gold-deep);
  background: rgba(167, 133, 80, 0.06);
  letter-spacing: 0.08em;
  border-bottom: 2px solid var(--line);
}

/* 字欄：大紅章感 */
.result-table .col-char {
  width: 56px;
  font-family: "Noto Serif SC", serif;
}

.result-table tbody .col-char {
  font-size: 22px;
  font-weight: 600;
  color: var(--seal);
}

/* "·" 虛字 row 字體淡化 */
.result-table .row-virtual .col-char {
  color: var(--ink-mute);
  font-size: 18px;
  opacity: 0.7;
}

.result-table .row-virtual .col-stroke {
  color: var(--ink-mute);
}

/* 筆劃欄 */
.result-table .col-stroke {
  width: 58px;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}

/* 加總公式 */
.result-table .col-calc {
  font-size: 15px;
  color: var(--ink-soft);
  font-feature-settings: "tnum";
  white-space: nowrap;
}

.calc-text {
  font-family: "Noto Serif SC", sans-serif;
  letter-spacing: 0.02em;
}

.dim {
  color: var(--ink-mute);
  opacity: 0.4;
}

/* 宮位標籤 */
.result-table .col-palace {
  width: 88px;
}

.palace-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(185, 58, 50, 0.08);
  border: 1px solid rgba(185, 58, 50, 0.18);
  color: var(--seal);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* 五行欄 */
.result-table .col-element {
  width: 52px;
}

.element-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: "Noto Serif SC", serif;
}

.element-木 { background: #3c8a5f; }
.element-火 { background: #bd4b38; }
.element-土 { background: #a78550; }
.element-金 { background: #8e7f68; }
.element-水 { background: #376f91; }

/* 命宮 (tfoot) 視覺強調 */
.result-table tfoot .row-destiny td {
  padding-top: 16px;
  padding-bottom: 16px;
  background: linear-gradient(
    135deg,
    rgba(185, 58, 50, 0.06),
    rgba(167, 133, 80, 0.04)
  );
  border-top: 2px solid var(--line);
  border-bottom: none;
}

.destiny-label {
  font-family: "Noto Serif SC", serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--seal);
  letter-spacing: 0.06em;
  text-align: center;
}

.palace-destiny {
  background: linear-gradient(135deg, var(--seal), #962820);
  color: #fff;
  border-color: transparent;
}

.row-destiny .col-calc {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.row-destiny .element-badge {
  height: 30px;
  font-size: 15px;
}

/* ============================================
   思想 / 行動功能（兩條橫式）
   ============================================ */
.relation-strip {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relation-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(255, 253, 249, 0.7);
  border: 1px solid var(--line);
  border-radius: 12px;
  flex-wrap: wrap;
}

.relation-label {
  font-family: "Noto Serif SC", serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--gold-deep);
  letter-spacing: 0.08em;
  min-width: 76px;
}

.relation-arrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.relation-arrow .arrow {
  color: var(--ink-mute);
  font-size: 18px;
}

.relation-text {
  margin-left: auto;
  font-family: "Noto Serif SC", serif;
  color: var(--seal);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* ============================================
   RWD (手機)
   ============================================ */
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
  .input-grid {
    grid-template-columns: 1fr;
  }

  .mode-tabs {
    gap: 6px;
  }

  .result-header {
    align-items: start;
    flex-direction: column;
  }

  /* 表格內距縮小，仍維持單一畫面 */
  .result-table th,
  .result-table td {
    padding: 9px 4px;
  }

  .result-table .col-char { width: 42px; }
  .result-table tbody .col-char { font-size: 19px; }
  .result-table .col-stroke {
    width: 44px;
    font-size: 16px;
  }
  .result-table .col-calc {
    font-size: 13px;
  }
  .result-table .col-palace {
    width: 72px;
  }
  .palace-tag {
    padding: 3px 9px;
    font-size: 12px;
  }
  .result-table .col-element {
    width: 44px;
  }
  .element-badge {
    min-width: 28px;
    height: 24px;
    font-size: 13px;
    padding: 0 6px;
  }

  .destiny-label {
    font-size: 14px;
  }

  .relation-row {
    gap: 10px;
    padding: 10px 12px;
  }
  .relation-label {
    min-width: 64px;
    font-size: 13px;
  }
  .relation-text {
    font-size: 16px;
  }
}

@media (max-width: 380px) {
  /* 極窄屏：加總公式換用較短形式 */
  .result-table .col-calc {
    font-size: 12px;
  }
}
</style>
