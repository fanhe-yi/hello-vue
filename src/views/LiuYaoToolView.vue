<template>
  <div class="liuyao-page">
    <section class="liuyao-hero">
      <div>
        <p class="eyebrow">LIU YAO</p>
        <h1>六爻卜卦</h1>
        <p class="intro">
          一卦只問一件事。依序完成靜心、請神、擲六爻與退神後，系統會產出卦盤與簡易解讀。
        </p>
      </div>
    </section>

    <nav class="step-list" aria-label="流程進度">
      <template v-for="(item, idx) in stepItems" :key="item.key">
        <button
          type="button"
          :class="['step-pill', { active: item.active, done: item.done }]"
          :disabled="!item.accessible"
          @click="goStep(item.key)"
        >
          {{ item.label }}
        </button>
        <span v-if="idx < stepItems.length - 1" class="step-arrow" aria-hidden="true">›</span>
      </template>
    </nav>

    <main class="flow-main">
      <section id="liuyao-step-intro" :class="flowClass('intro')">
        <div class="flow-head">
          <div>
            <span class="step-no">01</span>
            <h2>起卦前準備</h2>
          </div>
          <span class="section-state">{{ stateLabel('intro') }}</span>
        </div>
        <div class="flow-body">
          <p>
            請先確認這次只問一件事。問題越清楚，卦盤越能聚焦；完成退神後，系統會整理卦盤與方向摘要。
          </p>
          <button class="primary-btn" type="button" @click="advanceTo('topic')">
            開始
          </button>
        </div>
      </section>

      <section id="liuyao-step-topic" :class="flowClass('topic')">
        <div class="flow-head">
          <div>
            <span class="step-no">02</span>
            <h2>輸入問題</h2>
          </div>
          <button v-if="isStepDone('topic')" class="text-btn" type="button" @click="goStep('topic')">修改</button>
        </div>
        <p v-if="isStepDone('topic')" class="summary-text">{{ form.topicText }}</p>
        <div v-else class="flow-body">
          <label class="field-label" for="topic">這次只問一件事</label>
          <textarea
            id="topic"
            v-model.trim="form.topicText"
            class="input textarea"
            :disabled="isStepLocked('topic')"
            maxlength="120"
            placeholder="例如：這段關係接下來會怎麼發展？"
          ></textarea>
          <p class="field-hint">{{ form.topicText.length }} / 120</p>
          <div class="actions">
            <button class="ghost-btn" type="button" @click="goStep('intro')">返回</button>
            <button class="primary-btn" type="button" :disabled="!form.topicText" @click="advanceTo('gender')">
              下一步
            </button>
          </div>
        </div>
      </section>

      <section id="liuyao-step-gender" :class="flowClass('gender')">
        <div class="flow-head">
          <div>
            <span class="step-no">03</span>
            <h2>選擇性別</h2>
          </div>
          <button v-if="isStepDone('gender')" class="text-btn" type="button" @click="goStep('gender')">修改</button>
        </div>
        <p v-if="isStepDone('gender')" class="summary-text">{{ genderLabel }}</p>
        <div v-else class="flow-body">
          <div class="segmented">
            <button
              v-for="g in genders"
              :key="g.value"
              type="button"
              :disabled="isStepLocked('gender')"
              :class="{ selected: form.gender === g.value }"
              @click="form.gender = g.value"
            >
              {{ g.label }}
            </button>
          </div>
          <div class="actions">
            <button class="ghost-btn" type="button" @click="goStep('topic')">返回</button>
            <button class="primary-btn" type="button" @click="advanceTo('time')">下一步</button>
          </div>
        </div>
      </section>

      <section id="liuyao-step-time" :class="flowClass('time')">
        <div class="flow-head">
          <div>
            <span class="step-no">04</span>
            <h2>起卦時間</h2>
          </div>
          <button v-if="isStepDone('time')" class="text-btn" type="button" @click="goStep('time')">修改</button>
        </div>
        <p v-if="isStepDone('time')" class="summary-text">{{ timeLabel }}</p>
        <div v-else class="flow-body">
          <div class="segmented">
            <button
              type="button"
              :disabled="isStepLocked('time')"
              :class="{ selected: form.timeMode === 'now' }"
              @click="selectTimeMode('now')"
            >
              現在
            </button>
            <button
              type="button"
              :disabled="isStepLocked('time')"
              :class="{ selected: form.timeMode === 'custom' }"
              @click="selectTimeMode('custom')"
            >
              自訂時間
            </button>
          </div>
          <label v-if="form.timeMode === 'custom'" class="field-label" for="customTime">
            指定起卦時間
          </label>
          <input
            v-if="form.timeMode === 'custom'"
            id="customTime"
            v-model="form.customTime"
            class="input"
            type="datetime-local"
          />
          <p class="field-hint">{{ timeLabel }}</p>
          <div class="actions">
            <button class="ghost-btn" type="button" @click="goStep('gender')">返回</button>
            <button class="primary-btn" type="button" :disabled="form.timeMode === 'custom' && !form.customTime" @click="advanceTo('calm')">
              下一步
            </button>
          </div>
        </div>
      </section>

      <section id="liuyao-step-calm" :class="flowClass('calm')">
        <div class="flow-head">
          <div>
            <span class="step-no">05</span>
            <h2>靜心</h2>
          </div>
          <span class="section-state">{{ stateLabel('calm') }}</span>
        </div>
        <div class="flow-body">
          <p>把問題留在心裡，深呼吸三次。心穩之後，再進入請神文。</p>
          <button class="primary-btn" type="button" :disabled="isStepLocked('calm')" @click="advanceTo('prayer')">
            我已準備好
          </button>
        </div>
      </section>

      <section id="liuyao-step-prayer" :class="flowClass('prayer')">
        <div class="flow-head">
          <div>
            <span class="step-no">06</span>
            <h2>選擇請神文</h2>
          </div>
          <button v-if="isStepDone('prayer')" class="text-btn" type="button" @click="goStep('prayer')">修改</button>
        </div>
        <p v-if="isStepDone('prayer')" class="summary-text">{{ currentPrayer.label }}</p>
        <div v-else class="flow-body">
          <div class="prayer-grid">
            <button
              v-for="p in prayers"
              :key="p.key"
              type="button"
              :disabled="isStepLocked('prayer')"
              :class="['prayer-option', { selected: form.prayerKey === p.key }]"
              @click="form.prayerKey = p.key"
            >
              <span>{{ p.label }}</span>
              <small>{{ p.desc }}</small>
            </button>
          </div>

          <article class="prayer-text">
            <h3>{{ currentPrayer.label }}請神文</h3>
            <p v-for="(line, i) in currentPrayer.lines" :key="i">{{ line }}</p>
          </article>

          <div class="actions">
            <button class="ghost-btn" type="button" @click="goStep('calm')">返回</button>
            <button class="primary-btn" type="button" @click="startRoll">
              我已請神
            </button>
          </div>
        </div>
      </section>

      <section id="liuyao-step-roll" :class="flowClass('roll')">
        <div class="flow-head">
          <div>
            <span class="step-no">07</span>
            <h2>擲爻</h2>
          </div>
          <span class="section-state">{{ form.hexCode.length }} / 6</span>
        </div>

        <div class="yao-track" aria-label="擲爻進度">
          <template v-for="(item, idx) in rollMilestones" :key="item.key">
            <span :class="['yao-stage', { active: item.active, done: item.done }]">
              {{ item.label }}
            </span>
            <span v-if="idx < rollMilestones.length - 1" class="step-arrow" aria-hidden="true">›</span>
          </template>
        </div>

        <div class="roll-layout">
          <div class="yao-stack" aria-label="六爻暫存">
            <div
              v-for="row in yaoPreviewRows"
              :key="row.index"
              :class="['yao-row', { filled: row.filled, current: row.current }]"
            >
              <span>{{ row.label }}</span>
              <strong>{{ row.text }}</strong>
            </div>
          </div>

          <div class="roll-control">
            <template v-if="step === 'roll' && form.hexCode.length < 6">
              <h3>{{ currentYaoLabel }} · 擲幣結果</h3>
              <p>請依照實際擲出的三枚硬幣，選擇「正面」出現的數量。</p>
              <p class="field-hint">正面 = 人頭；另一面 = 反面。</p>
              <div class="coin-grid">
                <button
                  v-for="coin in coinChoices"
                  :key="coin.value"
                  type="button"
                  class="coin-choice"
                  @click="recordYao(coin.value)"
                >
                  <strong>{{ coin.label }}</strong>
                  <span>{{ coin.desc }}</span>
                </button>
              </div>
            </template>

            <template v-else-if="step === 'mid'">
              <h3>中場</h3>
              <p>請默念：「內卦三爻吉凶未判，再求外卦三爻，以成全卦。」</p>
              <button class="primary-btn" type="button" @click="completeMid">
                念完後，進入第四爻
              </button>
            </template>

            <template v-else-if="isStepDone('roll')">
              <h3>六爻已擲完</h3>
              <p class="hex-code">起卦碼：{{ form.hexCode }}</p>
            </template>

            <template v-else>
              <h3>尚未開始擲爻</h3>
              <p>完成前面的問題、時間、靜心與請神後，會從初爻開始。</p>
            </template>
          </div>
        </div>
      </section>

      <section id="liuyao-step-sendoff" :class="flowClass('sendoff')">
        <div class="flow-head">
          <div>
            <span class="step-no">08</span>
            <h2>退神</h2>
          </div>
          <span class="section-state">{{ stateLabel('sendoff') }}</span>
        </div>
        <div class="flow-body">
          <p class="hex-code">起卦碼：{{ form.hexCode }}</p>
          <p>請念退神文：「於今六爻已成，吉凶分判。弟子在此叩謝，十方世界諸佛菩薩。」</p>
          <button class="primary-btn" type="button" :disabled="isStepLocked('sendoff')" @click="submitFreeReading">
            收卦 · 退神
          </button>
        </div>
      </section>

      <section v-if="step === 'loading'" class="flow-panel active calm-panel">
          <h2>卦已立</h2>
          <p>正在整理卦盤與簡易解讀，請稍候。</p>
          <div class="loader" aria-label="載入中"></div>
      </section>

      <section v-if="step === 'limit'" class="flow-panel active calm-panel">
          <h2>今日免費次數已用完</h2>
          <p>今日體驗次數已用完。若這一卦很重要，可以直接預約老師正式解卦。</p>
          <button class="primary-btn" type="button" @click="goBooking">
            預約老師解卦
          </button>
      </section>

      <section v-if="step === 'error'" class="flow-panel active calm-panel">
          <h2>暫時無法完成解讀</h2>
          <p>{{ errorMessage }}</p>
          <button class="primary-btn" type="button" @click="resetFlow">
            重新開始
          </button>
      </section>
    </main>

    <section v-if="result" id="liuyao-step-result" class="result-section">
      <div class="result-head">
        <div>
          <p class="eyebrow">RESULT</p>
          <h2>六爻結果</h2>
        </div>
        <button class="primary-btn" type="button" @click="goBooking">
          預約老師解卦
        </button>
      </div>

      <div class="meta">
        <div class="meta-row"><label>時間</label><span>{{ result.time.desc }}</span></div>
        <div class="meta-row"><label>性別</label><span>{{ result.genderText }}</span></div>
        <div class="meta-row"><label>起卦碼</label><span class="mono">{{ result.hexCode }}</span></div>
        <div class="meta-row"><label>題目</label><span>{{ result.topicText }}</span></div>
      </div>

      <section class="hex-section">
        <div class="hex-topbar">
          <div class="hex-datebox">
            <div class="date-gongli">{{ hexInfo.gongli || "(無日期)" }}</div>
            <div class="date-nongli">{{ hexInfo.nongli || "" }}</div>
          </div>
          <table class="ganzhi-table" v-if="hexInfo.ganzhi.length === 4">
            <thead>
              <tr><th>時</th><th>日</th><th>月</th><th>年</th></tr>
            </thead>
            <tbody>
              <tr>
                <td v-for="(gz, i) in ganzhiRev" :key="i">
                  <div><span :class="'wx-' + wuxingOf(gz[0])">{{ gz[0] }}</span></div>
                  <div><span :class="'wx-' + wuxingOf(gz[1])">{{ gz[1] }}</span></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="xunkong-bar" v-if="hexInfo.xunkong.length === 4">
          <strong>空亡</strong>
          年【{{ hexInfo.xunkong[0] }}】
          月【{{ hexInfo.xunkong[1] }}】
          日【{{ hexInfo.xunkong[2] }}】
          時【{{ hexInfo.xunkong[3] }}】
        </div>

        <div class="hex-chart-wrap" v-if="hexLines.length === 6">
          <table class="hex-chart">
            <thead>
              <tr>
                <th>六獸</th>
                <th>六親</th>
                <th>地支</th>
                <th>本卦</th>
                <th>變卦</th>
                <th>六親</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in hexLines" :key="line.idx" :class="{ changing: line.isChanging }">
                <td><span :class="'ls-' + line.liushen">{{ line.liushen }}</span></td>
                <td><span v-if="line.parsed" :class="'lq-' + line.parsed.liuqin">{{ fullLiuqin(line.parsed.liuqin) }}</span></td>
                <td>
                  <span v-if="line.parsed" :class="'wx-' + wuxingOfDizhi(line.parsed.dizhi)">{{ dzOnly(line.parsed.dizhi) }}</span>
                  <span v-if="line.isKong" class="mini-chip">空</span>
                </td>
                <td>
                  <span v-if="line.parsed?.mark" :class="line.parsed.mark === '世' ? 'mark-shi' : 'mark-ying'">{{ line.parsed.mark }}</span>
                  <span class="yao-symbol">{{ yaoSymbolOf(line.yinyang, line.isChanging) }}</span>
                </td>
                <td>
                  <template v-if="line.isChanging && line.bianParsed">
                    <span :class="'wx-' + wuxingOfDizhi(line.bianParsed.dizhi)">{{ dzOnly(line.bianParsed.dizhi) }}</span>
                    <span v-if="line.bianKong" class="mini-chip">空</span>
                  </template>
                </td>
                <td>
                  <span v-if="line.isChanging && line.bianParsed" :class="'lq-' + line.bianParsed.liuqin">
                    {{ fullLiuqin(line.bianParsed.liuqin) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <pre v-else class="raw-lines">{{ result.sixLinesText }}</pre>

        <div class="phase-bar" v-if="phaseArray.length">
          <span v-for="p in phaseArray" :key="p.wx" :class="['phase-badge', 'wx-' + p.wx]">
            {{ p.wx }} {{ p.state }}
          </span>
        </div>

        <div class="hex-footer">
          <div><span>本卦</span>{{ header.name || "(無)" }} <em>{{ header.palace }}</em> <em>{{ header.qi }}</em></div>
          <div><span>變卦</span>{{ bianguaInfo.name || "（本卦不變）" }} <em>{{ bianguaInfo.palace }}</em> <em>{{ bianguaInfo.qi }}</em></div>
        </div>
      </section>

      <section class="shensha-display">
        <h3>卦身 / 用神 / 神煞</h3>
        <p>此區需由老師正式解卦時補充。免費版先顯示卦盤與簡易 AI 摘要。</p>
      </section>

      <section class="ai-section">
        <h3>AI 解卦摘要</h3>
        <p class="ai-summary">{{ result.ai.summary }}</p>
        <details>
          <summary>查看完整簡易解卦</summary>
          <pre>{{ result.ai.fullText }}</pre>
        </details>
      </section>
    </section>
  </div>
</template>

<script>
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";
const STORAGE_KEY = "fanhe_liuyao_visitor_id";
const BOOKING_CONTEXT_KEY = "liuyao_paid_context";
const FW_SPACE = "　";
const FLOW_ORDER = ["intro", "topic", "gender", "time", "calm", "prayer", "roll", "sendoff", "result"];
const FLOW_LABELS = {
  intro: "介紹",
  topic: "問題",
  gender: "性別",
  time: "時間",
  calm: "靜心",
  prayer: "請神",
  roll: "擲爻",
  sendoff: "退神",
  result: "結果",
};
const YAO_LABELS = ["初爻", "二爻", "三爻", "四爻", "五爻", "六爻"];

const WUXING_MAP = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火",
  戊: "土", 己: "土", 庚: "金", 辛: "金",
  壬: "水", 癸: "水",
  寅: "木", 卯: "木", 巳: "火", 午: "火",
  辰: "土", 未: "土", 戌: "土", 丑: "土",
  申: "金", 酉: "金", 亥: "水", 子: "水",
};

const LIUQIN_FULL = {
  妻: "妻財",
  父: "父母",
  官: "官鬼",
  兄: "兄弟",
  孫: "子孫",
  孙: "子孫",
  子: "子孫",
};

function getVisitorId() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

function normalizeLiuqin(s) {
  return s === "孙" ? "孫" : s;
}

function normalizeMark(s) {
  if (!s) return null;
  return s === "应" ? "應" : s;
}

function parseBenguaLine(s) {
  if (!s || typeof s !== "string") return null;
  const t = s.trim();
  const withFu = /^([兄父官妻孙孫子])(.{2})\s+(━━━|━\s*━)\s+([兄父官妻孙孫子])(.{2})\s*([世應应])?/;
  const m2 = t.match(withFu);
  if (m2) {
    return {
      fuShen: { liuqin: normalizeLiuqin(m2[1]), dizhi: m2[2] },
      yinyang: m2[3].includes("━ ━") || m2[3].includes("　") ? "yin" : "yang",
      liuqin: normalizeLiuqin(m2[4]),
      dizhi: m2[5],
      mark: normalizeMark(m2[6]),
    };
  }
  const plain = /^(━━━|━\s*━)\s+([兄父官妻孙孫子])(.{2})\s*([世應应])?/;
  const m1 = t.match(plain);
  if (m1) {
    return {
      fuShen: null,
      yinyang: m1[1].includes("━ ━") || m1[1].includes("　") ? "yin" : "yang",
      liuqin: normalizeLiuqin(m1[2]),
      dizhi: m1[3],
      mark: normalizeMark(m1[4]),
    };
  }
  return null;
}

function parseBenguaHeader(s) {
  if (!s || typeof s !== "string") return { palace: "", name: "", qi: "" };
  const t = s.trim();
  const m = t.match(/^(.{1,4}[宮宫])\s*[：:]?\s*([^\s(（]+)\s*[（(]?([^)）]+)?[)）]?/);
  if (!m) return { palace: "", name: t, qi: "" };
  return { palace: m[1] || "", name: m[2] || "", qi: m[3] || "" };
}

function parsePhaseText(s) {
  if (!s || typeof s !== "string") return [];
  const result = [];
  for (const wx of ["木", "火", "土", "金", "水"]) {
    const m = s.match(new RegExp(wx + "\\s*([旺相休囚死])"));
    if (m) result.push({ wx, state: m[1] });
  }
  return result;
}

function parseYaoFromLine(line) {
  if (!line || typeof line !== "string") return null;
  if (line.includes("老陽") && line.includes("動化")) return { yinyang: "yang", isChanging: true };
  if (line.includes("老陰") && line.includes("動化")) return { yinyang: "yin", isChanging: true };
  if (line.includes("陽爻")) return { yinyang: "yang", isChanging: false };
  if (line.includes("陰爻")) return { yinyang: "yin", isChanging: false };
  return null;
}

function dzOnly(s) {
  if (!s) return "";
  return s.length >= 2 ? s.slice(-1) : s;
}

function wuxingOf(ch) {
  return WUXING_MAP[ch] || "";
}

function wuxingOfDizhi(s) {
  return wuxingOf(dzOnly(s));
}

function isDizhiKong(dizhi, xunkong) {
  if (!dizhi || !Array.isArray(xunkong) || xunkong.length < 3) return false;
  return String(xunkong[2] || "").includes(dzOnly(dizhi));
}

function yaoSymbolOf(yinyang, isChanging) {
  if (yinyang === "yang") return isChanging ? "━O━" : "━━━";
  return isChanging ? "━×━" : `━${FW_SPACE}━`;
}

function fullLiuqin(s) {
  return LIUQIN_FULL[s] || s || "";
}

function normalizeLiushen(s) {
  const t = String(s || "").trim();
  const map = { 腾蛇: "螣蛇", 勾陈: "勾陳", 青龙: "青龍" };
  return map[t] || t;
}

function flowIndexOf(step) {
  if (step === "mid") return FLOW_ORDER.indexOf("roll");
  if (step === "loading" || step === "limit" || step === "error") return FLOW_ORDER.indexOf("sendoff");
  return FLOW_ORDER.indexOf(step);
}

function yaoChoiceText(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "未擲";
  return `${n} 個正面`;
}

export default {
  name: "LiuYaoToolView",
  data() {
    return {
      step: "intro",
      visitorId: "",
      result: null,
      errorMessage: "",
      form: {
        topicText: "",
        gender: "male",
        timeMode: "now",
        questionTime: new Date().toISOString(),
        customTime: "",
        prayerKey: "daoist",
        hexCode: "",
      },
      genders: [
        { value: "male", label: "男占" },
        { value: "female", label: "女占" },
      ],
      prayers: [
        {
          key: "daoist",
          label: "道教",
          desc: "依台灣六爻傳統請神文",
          lines: [
            "陰陽日月最長生，可惜天理難分明；今有真聖鬼谷子，一出天下定太平。",
            "拜請八卦祖師、伏羲、文王、周公、孔子、五大聖賢、智聖王禪老祖及孫臏真人、諸葛孔明真人、陳摶真人、劉伯溫真人、野鶴真人、九天玄女、觀世音菩薩、混元禪師。",
            "十方世界諸天神聖佛菩薩器眾、飛天過往神聖、本地主司福德正神、排卦童子、成卦童郎，駕臨指示聖卦。",
            "今為此事憂疑難決，請諸神佛依實指示聖卦。先求內卦三爻，再求外卦三爻。",
          ],
        },
        {
          key: "buddhist",
          label: "佛教",
          desc: "以三寶慈悲與正念觀照起卦",
          lines: [
            "南無本師釋迦牟尼佛，南無十方三世一切諸佛菩薩。",
            "弟子今日以清淨心、恭敬心，為此事心中有疑，願藉六爻卦象觀照因緣。",
            "祈願佛菩薩慈悲護念，使弟子遠離妄念與恐懼，如實看見此事的因、緣、果與可行之道。",
            "若此事有應避之處，願得提醒；若有可行之機，願得明示。弟子願以正念承受卦象所示，不執著、不強求。",
          ],
        },
        {
          key: "christian",
          label: "基督教",
          desc: "以謙卑禱告與分辨之心起卦",
          lines: [
            "親愛的天父，我以誠實、謙卑與安靜的心來到祢面前。",
            "今日我為此事心中有疑，願在祢的看顧中尋求智慧、分辨與合宜的方向。",
            "求祢保守我的心不被恐懼、執念與私慾牽引，使我能看見事情真實的光景。",
            "若前方道路需要等待，求祢賜我忍耐；若需要行動，求祢賜我勇氣；若需要放下，求祢賜我平安。",
          ],
        },
        {
          key: "guardian",
          label: "守護神",
          desc: "適合無特定宗教或祈請自身守護力量",
          lines: [
            "敬請守護我的善緣、祖上福德與一路相伴的護持力量臨在。",
            "今日我為此事心中有疑，願以安定、誠實與清明之心起卦求示。",
            "願一切護佑我的正向力量，引導我避開偏執與恐懼，看見此事真正需要面對的重點。",
            "若有風險，願得提醒；若有轉機，願得指引；若需等待，願我心能安住，不急不躁。",
          ],
        },
      ],
      coinChoices: [
        { value: "0", label: "0 個正面", desc: "三枚皆反面" },
        { value: "1", label: "1 個正面", desc: "一正二反" },
        { value: "2", label: "2 個正面", desc: "二正一反" },
        { value: "3", label: "3 個正面", desc: "三枚皆正面" },
      ],
    };
  },
  computed: {
    activeFlowIndex() {
      const idx = flowIndexOf(this.step);
      if (this.result) return FLOW_ORDER.indexOf("result");
      return idx >= 0 ? idx : 0;
    },
    currentYaoIndex() {
      return Math.min(this.form.hexCode.length + 1, 6);
    },
    currentYaoLabel() {
      return YAO_LABELS[this.currentYaoIndex - 1] || "六爻";
    },
    currentPrayer() {
      return this.prayers.find((p) => p.key === this.form.prayerKey) || this.prayers[0];
    },
    genderLabel() {
      return this.genders.find((g) => g.value === this.form.gender)?.label || "";
    },
    timeLabel() {
      if (this.form.timeMode === "custom") {
        return this.form.customTime ? `指定：${this.form.customTime.replace("T", " ")}` : "請選擇起卦時間";
      }
      return "使用目前時間起卦";
    },
    stepItems() {
      return FLOW_ORDER.map((key, idx) => ({
        key,
        label: FLOW_LABELS[key],
        active: this.result ? key === "result" : idx === this.activeFlowIndex,
        done: this.result ? key !== "result" : this.activeFlowIndex > idx,
        accessible: idx <= this.activeFlowIndex || (key === "result" && !!this.result),
      }));
    },
    rollMilestones() {
      const currentKey = this.step === "mid" ? "mid" : `yao-${Math.min(this.form.hexCode.length + 1, 6)}`;
      const items = [
        { key: "yao-1", label: "初爻", index: 0 },
        { key: "yao-2", label: "二爻", index: 1 },
        { key: "yao-3", label: "三爻", index: 2 },
        { key: "mid", label: "中場", index: 3 },
        { key: "yao-4", label: "四爻", index: 4 },
        { key: "yao-5", label: "五爻", index: 5 },
        { key: "yao-6", label: "六爻", index: 6 },
      ];
      return items.map((item) => {
        const done =
          item.key === "mid"
            ? this.form.hexCode.length > 3 || this.activeFlowIndex > FLOW_ORDER.indexOf("roll")
            : this.form.hexCode.length > Number(item.key.replace("yao-", "")) - 1;
        return {
          ...item,
          active: this.step === "roll" || this.step === "mid" ? item.key === currentKey : false,
          done,
        };
      });
    },
    yaoPreviewRows() {
      return YAO_LABELS.map((label, idx) => {
        const value = this.form.hexCode[idx];
        return {
          index: idx,
          label,
          filled: value !== undefined,
          current: this.step === "roll" && idx === this.form.hexCode.length,
          text: value !== undefined ? yaoChoiceText(value) : "待擲",
        };
      }).reverse();
    },
    hexInfo() {
      const h = this.result?.hexData || {};
      return {
        gongli: h.gongli || "",
        nongli: h.nongli || "",
        ganzhi: Array.isArray(h.ganzhi) ? h.ganzhi : [],
        xunkong: Array.isArray(h.xunkong) ? h.xunkong : [],
        benguax: Array.isArray(h.benguax) ? h.benguax : [],
        bianguax: Array.isArray(h.bianguax) ? h.bianguax : [],
        liushen: Array.isArray(h.liushen) ? h.liushen : [],
        bengua: h.bengua || "",
        biangua: h.biangua || "",
      };
    },
    ganzhiRev() {
      const gz = this.hexInfo.ganzhi;
      return gz.length === 4 ? [gz[3], gz[2], gz[1], gz[0]] : [];
    },
    hexLines() {
      const bg = this.hexInfo.benguax;
      if (bg.length !== 6) return [];
      const bian = this.hexInfo.bianguax;
      const shen = this.hexInfo.liushen;
      const xunkong = this.hexInfo.xunkong;
      const textLines = String(this.result?.sixLinesText || "").split("\n").filter((s) => s.trim());

      return bg.map((line, i) => {
        const parsed = parseBenguaLine(line);
        const bianRaw = bian[i] || null;
        const bianParsed = bianRaw ? parseBenguaLine(bianRaw) : null;
        const textYao = parseYaoFromLine(textLines[i] || "");
        const yinyang = textYao?.yinyang ?? parsed?.yinyang ?? "yang";
        const isChanging = textYao?.isChanging !== undefined ? textYao.isChanging : bianRaw !== null;
        return {
          idx: i,
          parsed,
          bianParsed,
          yinyang,
          isChanging,
          isKong: parsed ? isDizhiKong(parsed.dizhi, xunkong) : false,
          bianKong: bianParsed ? isDizhiKong(bianParsed.dizhi, xunkong) : false,
          liushen: normalizeLiushen(shen[i] || ""),
        };
      });
    },
    phaseArray() {
      return parsePhaseText(this.result?.phaseText || "");
    },
    header() {
      return parseBenguaHeader(this.hexInfo.bengua);
    },
    bianguaInfo() {
      return parseBenguaHeader(this.hexInfo.biangua);
    },
  },
  mounted() {
    document.title = "六爻卜卦｜命理工具｜梵和易學";
    this.visitorId = getVisitorId();
  },
  methods: {
    stepIndex(key) {
      return FLOW_ORDER.indexOf(key);
    },
    isStepDone(key) {
      const idx = this.stepIndex(key);
      if (idx < 0) return false;
      return this.result ? key !== "result" : this.activeFlowIndex > idx;
    },
    isStepLocked(key) {
      const idx = this.stepIndex(key);
      if (idx < 0) return false;
      return idx > this.activeFlowIndex && !(key === "result" && this.result);
    },
    flowClass(key) {
      return [
        "flow-panel",
        {
          active: !this.result && this.stepIndex(key) === this.activeFlowIndex,
          done: this.isStepDone(key),
          locked: this.isStepLocked(key),
        },
      ];
    },
    stateLabel(key) {
      if (this.isStepDone(key)) return "已完成";
      if (!this.isStepLocked(key)) return "進行中";
      return "未開始";
    },
    scrollToFlowStep(key) {
      this.$nextTick(() => {
        const id = key === "result" ? "liuyao-step-result" : `liuyao-step-${key}`;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    goStep(key) {
      if (this.isStepLocked(key)) return;
      if (key === "result") {
        if (this.result) this.scrollToFlowStep("result");
        return;
      }
      this.step = key;
      this.scrollToFlowStep(key);
    },
    advanceTo(key) {
      this.step = key;
      this.scrollToFlowStep(key);
    },
    selectTimeMode(mode) {
      this.form.timeMode = mode;
      if (mode === "now") this.form.questionTime = new Date().toISOString();
    },
    startRoll() {
      this.form.hexCode = "";
      this.advanceTo("roll");
    },
    recordYao(value) {
      if (this.form.hexCode.length >= 6) return;
      this.form.hexCode += value;
      if (this.form.hexCode.length === 3) {
        this.step = "mid";
        this.scrollToFlowStep("roll");
        return;
      }
      if (this.form.hexCode.length === 6) {
        this.advanceTo("sendoff");
        return;
      }
      this.scrollToFlowStep("roll");
    },
    completeMid() {
      this.step = "roll";
      this.scrollToFlowStep("roll");
    },
    async submitFreeReading() {
      this.step = "loading";
      this.errorMessage = "";
      this.scrollToFlowStep("sendoff");
      try {
        const payload = {
          visitorId: this.visitorId,
          topicText: this.form.topicText,
          gender: this.form.gender,
          timeMode: this.form.timeMode,
          questionTime: this.form.questionTime,
          customTime: this.form.customTime,
          prayerKey: this.form.prayerKey,
          hexCode: this.form.hexCode,
        };
        const res = await fetch(`${API_BASE_URL}/api/liuyao/free-reading`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) {
          this.step = "limit";
          this.scrollToFlowStep("sendoff");
          return;
        }
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        this.result = data;
        this.step = "result";
        this.scrollToFlowStep("result");
      } catch (err) {
        this.errorMessage = "卦盤或 AI 解讀暫時無法完成，請稍後再試。";
        console.error("[liuyao tool] submit failed", err);
        this.step = "error";
        this.scrollToFlowStep("sendoff");
      }
    },
    goBooking() {
      const context = {
        topicText: this.form.topicText,
        gender: this.form.gender,
        timeMode: this.form.timeMode,
        questionTime: this.form.questionTime,
        customTime: this.form.customTime,
        prayerKey: this.form.prayerKey,
        hexCode: this.form.hexCode,
      };
      sessionStorage.setItem(BOOKING_CONTEXT_KEY, JSON.stringify(context));
      this.$router.push({
        path: "/booking",
        query: { serviceId: "liuyao", source: "liuyao_web_free_cta" },
      });
    },
    resetFlow() {
      this.result = null;
      this.errorMessage = "";
      this.form.hexCode = "";
      this.step = "intro";
      this.scrollToFlowStep("intro");
    },
    wuxingOf,
    wuxingOfDizhi,
    dzOnly,
    fullLiuqin,
    yaoSymbolOf,
  },
};
</script>

<style scoped>
.liuyao-page {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}

.liuyao-hero,
.flow-panel,
.result-section {
  border: 1px solid rgba(92, 69, 42, 0.16);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.94);
  box-shadow: 0 14px 38px rgba(65, 45, 24, 0.08);
}

.liuyao-hero {
  padding: 28px 30px;
}

.step-list {
  position: sticky;
  top: 72px;
  z-index: 3;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 7px;
  margin: 14px 0 18px;
  padding: 12px;
  overflow-x: auto;
  border: 1px solid rgba(92, 69, 42, 0.12);
  border-radius: 8px;
  background: rgba(248, 243, 235, 0.96);
  box-shadow: 0 12px 28px rgba(65, 45, 24, 0.08);
  -webkit-overflow-scrolling: touch;
}

.flow-main {
  display: grid;
  gap: 14px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #8b6f47;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1,
h2,
h3 {
  margin: 0;
  letter-spacing: 0;
}

h1 {
  font-size: 48px;
  line-height: 1.12;
}

h2 {
  font-size: 24px;
  line-height: 1.3;
}

h3 {
  font-size: 17px;
}

.intro,
.flow-panel p,
.shensha-display p {
  color: #5d534b;
  line-height: 1.8;
}

.step-pill {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid rgba(139, 111, 71, 0.22);
  border-radius: 999px;
  color: #6d6258;
  font-size: 12px;
  font: inherit;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.56);
  cursor: pointer;
  white-space: nowrap;
}

.step-pill:disabled {
  cursor: default;
  opacity: 0.55;
}

.step-pill.active {
  color: #fff;
  border-color: #942820;
  background: #942820;
}

.step-pill.done {
  color: #2f6f38;
  border-color: rgba(47, 111, 56, 0.34);
}

.step-arrow {
  color: #9d8566;
  font-size: 17px;
  line-height: 1;
  transform: translateY(-1px);
}

.flow-panel {
  scroll-margin-top: 150px;
  padding: 24px;
  transition: border-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
}

.flow-panel.active {
  border-color: rgba(148, 40, 32, 0.34);
  box-shadow:
    0 0 0 2px rgba(148, 40, 32, 0.06),
    0 16px 38px rgba(65, 45, 24, 0.1);
}

.flow-panel.done {
  background: rgba(255, 252, 247, 0.82);
}

.flow-panel.locked {
  opacity: 0.54;
}

.flow-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.flow-head > div {
  display: flex;
  gap: 12px;
  align-items: center;
}

.step-no,
.section-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.step-no {
  width: 36px;
  color: #8b6f47;
  background: #f1e8d8;
}

.section-state {
  padding: 4px 10px;
  color: #7f6f5c;
  background: rgba(139, 111, 71, 0.1);
}

.flow-panel.active .step-no,
.flow-panel.active .section-state {
  color: #fff;
  background: #942820;
}

.flow-body {
  margin-top: 16px;
}

.summary-text {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 6px;
  color: #3d332b;
  background: #f6f1e8;
  word-break: break-word;
}

.text-btn {
  border: 0;
  background: transparent;
  color: #942820;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.field-label {
  display: block;
  margin: 18px 0 8px;
  color: #5a4632;
  font-weight: 700;
}

.input {
  width: 100%;
  border: 1px solid rgba(92, 69, 42, 0.22);
  border-radius: 6px;
  background: #fffdf9;
  color: #2a1f1a;
  font: inherit;
  padding: 12px 13px;
}

.textarea {
  min-height: 118px;
  resize: vertical;
}

.field-hint {
  margin: 8px 0 0;
  color: #8a8076;
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.primary-btn,
.ghost-btn {
  min-height: 44px;
  border-radius: 6px;
  padding: 10px 16px;
  border: 1px solid #2f7a2f;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  border-color: #8e241e;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, #bd473b 0%, #932821 58%, #6e1b17 100%);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -10px 18px rgba(82, 17, 15, 0.16),
    0 10px 22px rgba(111, 29, 25, 0.2);
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
}

.primary-btn:hover:not(:disabled) {
  filter: saturate(1.04);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    inset 0 -10px 18px rgba(82, 17, 15, 0.18),
    0 12px 24px rgba(111, 29, 25, 0.25);
}

.primary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.ghost-btn {
  background: transparent;
  color: #2f6f38;
}

.ghost-btn:disabled,
.segmented button:disabled,
.prayer-option:disabled {
  cursor: default;
  opacity: 0.6;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.segmented button,
.prayer-option {
  border: 1px solid rgba(92, 69, 42, 0.2);
  border-radius: 6px;
  background: #fffdf9;
  color: #2a1f1a;
  font: inherit;
  cursor: pointer;
}

.segmented button {
  min-height: 52px;
  font-weight: 700;
}

.segmented button.selected,
.prayer-option.selected {
  border-color: #2f6f38;
  background: rgba(47, 111, 56, 0.1);
}

.calm-panel {
  text-align: center;
}

.prayer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0;
}

.prayer-option {
  min-height: 94px;
  padding: 12px;
  text-align: left;
}

.prayer-option span,
.prayer-option small {
  display: block;
}

.prayer-option span {
  font-weight: 800;
}

.prayer-option small {
  margin-top: 6px;
  color: #75695f;
  line-height: 1.5;
}

.prayer-text {
  padding: 16px;
  border-radius: 6px;
  background: #f7f3ed;
  border: 1px solid rgba(139, 111, 71, 0.18);
}

.prayer-text p {
  margin: 10px 0 0;
  color: #2f2924;
}

.yao-track {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin: 18px 0;
}

.yao-stage {
  padding: 5px 10px;
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 999px;
  color: #6d6258;
  font-size: 12px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.66);
}

.yao-stage.active {
  color: #fff;
  border-color: #942820;
  background: #942820;
}

.yao-stage.done {
  color: #2f6f38;
  border-color: rgba(47, 111, 56, 0.34);
  background: rgba(47, 111, 56, 0.08);
}

.roll-layout {
  display: grid;
  grid-template-columns: minmax(200px, 0.78fr) minmax(0, 1.22fr);
  gap: 18px;
  align-items: stretch;
}

.yao-stack {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid rgba(92, 69, 42, 0.14);
  border-radius: 8px;
  background: #f7f3ed;
}

.yao-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px dashed rgba(139, 111, 71, 0.24);
  border-radius: 6px;
  color: #8a8076;
  background: rgba(255, 255, 255, 0.58);
}

.yao-row.filled {
  border-style: solid;
  color: #3d332b;
  background: #fffdf9;
}

.yao-row.current {
  border-color: rgba(148, 40, 32, 0.5);
  color: #942820;
  box-shadow: inset 4px 0 0 #942820;
}

.yao-row span {
  color: inherit;
  font-size: 13px;
  font-weight: 800;
}

.yao-row strong {
  font-size: 14px;
}

.roll-control {
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(92, 69, 42, 0.14);
  border-radius: 8px;
  background: #fffdf9;
}

.coin-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.coin-choice {
  border: 1px solid rgba(92, 69, 42, 0.16);
  border-radius: 8px;
  background: #fffdf9;
  min-height: 88px;
  padding: 14px;
  cursor: pointer;
  font: inherit;
  color: #3a3128;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.coin-choice:hover {
  border-color: rgba(148, 40, 32, 0.4);
  box-shadow: 0 8px 18px rgba(65, 45, 24, 0.08);
  transform: translateY(-1px);
}

.coin-choice strong,
.coin-choice span {
  display: block;
}

.coin-choice strong {
  font-size: 18px;
  color: #2a1f1a;
}

.coin-choice span {
  margin-top: 6px;
  color: #75695f;
  font-size: 13px;
}

.hex-code,
.mono {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}

.loader {
  width: 34px;
  height: 34px;
  margin: 20px auto 0;
  border: 3px solid #d8cfc2;
  border-top-color: #2f7a2f;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-section {
  margin-top: 20px;
  padding: 20px;
}

.result-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.meta {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
}

.meta-row {
  display: flex;
  gap: 12px;
  padding: 4px 0;
}

.meta-row label {
  color: #888;
  width: 60px;
  flex-shrink: 0;
}

.hex-section,
.shensha-display,
.ai-section {
  margin-top: 16px;
  border: 1px solid #d4c8a8;
  border-radius: 8px;
  background: #fdfbf5;
  padding: 12px;
}

.hex-topbar {
  display: flex;
  gap: 12px;
  align-items: stretch;
  background: #eef0f2;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.hex-datebox {
  flex: 1;
  font-size: 12px;
}

.date-gongli {
  font-size: 14px;
  font-weight: 700;
}

.date-nongli {
  margin-top: 3px;
  color: #666;
}

.ganzhi-table,
.hex-chart {
  border-collapse: collapse;
}

.ganzhi-table {
  min-width: 200px;
  text-align: center;
}

.ganzhi-table th {
  background: #b8a888;
  color: #fff;
  padding: 3px 12px;
  border: 1px solid #a89878;
  font-size: 12px;
}

.ganzhi-table td {
  padding: 3px 12px;
  background: #fff;
  border: 1px solid #d4c8a8;
  line-height: 1.4;
  font-weight: 700;
}

.xunkong-bar {
  background: #f5f1e8;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #6b4f2a;
  margin-bottom: 8px;
}

.xunkong-bar strong {
  margin-right: 12px;
}

.hex-chart-wrap {
  overflow-x: auto;
}

.hex-chart {
  width: 100%;
  background: #fff;
  border: 1px solid #d4c8a8;
  font-size: 14px;
}

.hex-chart th,
.hex-chart td {
  border: 1px solid #e5e0d0;
  padding: 8px 5px;
  text-align: center;
  white-space: nowrap;
}

.hex-chart th {
  background: #f5f1e8;
  color: #6b4f2a;
  font-size: 12px;
}

.hex-chart tr.changing {
  background: #fffbe6;
}

.yao-symbol {
  display: inline-block;
  min-width: 3.2em;
  font-family: "PingFang TC", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-weight: 800;
  white-space: pre;
}

.changing .yao-symbol {
  color: #c33a3a;
}

.mark-shi,
.mark-ying,
.mini-chip {
  display: inline-block;
  margin-right: 5px;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 800;
}

.mark-shi {
  background: #ffe082;
  color: #6b4f2a;
}

.mark-ying {
  background: #b3e5fc;
  color: #1e5aa8;
}

.mini-chip {
  margin-left: 5px;
  margin-right: 0;
  background: #e8d9b8;
  color: #8b6f47;
}

.wx-木 { color: #2f7a2f; }
.wx-火 { color: #c33a3a; }
.wx-土 { color: #8b6f47; }
.wx-金 { color: #d4802a; }
.wx-水 { color: #1e5aa8; }
.ls-玄武 { color: #1e5aa8; }
.ls-白虎 { color: #d4802a; }
.ls-螣蛇,
.ls-勾陳 { color: #8b6f47; }
.ls-朱雀 { color: #c33a3a; }
.ls-青龍 { color: #2f7a2f; }
.lq-兄 { color: #555; }
.lq-父 { color: #8b4513; }
.lq-官 { color: #6a1b9a; }
.lq-妻 { color: #8b6f47; }
.lq-孫,
.lq-孙,
.lq-子 { color: #2f7a2f; }

.phase-bar {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 10px;
  background: #f5f1e8;
  border-radius: 6px;
}

.phase-badge {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #d4c8a8;
  border-radius: 4px;
  font-weight: 700;
}

.hex-footer {
  margin-top: 10px;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  font-size: 14px;
}

.hex-footer div {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 3px 0;
}

.hex-footer span {
  width: 40px;
  color: #888;
  flex-shrink: 0;
}

.hex-footer em {
  color: #8b6f47;
  font-size: 12px;
  font-style: normal;
}

.raw-lines,
.ai-section pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.8;
}

.shensha-display {
  background: #f4f1fb;
  border-color: #d6ccea;
}

.ai-section {
  background: #fffdf9;
}

.ai-summary {
  font-size: 17px;
  font-weight: 700;
}

.ai-section details {
  margin-top: 12px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.ai-section summary {
  cursor: pointer;
  color: #2f7a2f;
  font-weight: 800;
}

@media (max-width: 920px) {
  .prayer-grid,
  .coin-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .roll-layout {
    grid-template-columns: 1fr;
  }

  .result-head {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .liuyao-hero,
  .flow-panel,
  .result-section {
    padding: 16px;
  }

  h1 {
    font-size: 34px;
  }

  .step-list {
    top: 64px;
    margin-top: 10px;
  }

  .flow-head,
  .flow-head > div {
    align-items: flex-start;
  }

  .flow-head {
    flex-direction: column;
  }

  .segmented,
  .prayer-grid,
  .coin-grid {
    grid-template-columns: 1fr;
  }

  .hex-topbar,
  .meta-row {
    flex-direction: column;
    gap: 6px;
  }

  .meta-row label {
    width: auto;
  }
}
</style>
