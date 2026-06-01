<template>
  <div class="booking-page">
    <div class="booking-card reveal">
      <!-- Header -->
      <div class="booking-header">
        <div class="seal-mark" aria-hidden="true">梵</div>
        <p class="eyebrow">PREDESTINED CONSULTATION</p>
        <h1 class="title">論命預約</h1>
        <p class="subtitle">
          填寫以下資料後，老師會親自確認並與您聯絡安排時間
        </p>
      </div>

      <!-- 成功狀態 -->
      <transition name="fade">
        <div v-if="submitSuccess" class="success-banner">
          <div class="success-icon">✓</div>
          <div>
            <strong>預約已送出</strong>
            <p>老師會盡快與您確認，若資料填錯可直接在 LINE 告知。</p>
          </div>
        </div>
      </transition>

      <form @submit.prevent="submitForm" class="form">
        <!-- ① 論命項目（卡片式選擇） -->
        <fieldset class="field-block">
          <legend class="field-legend">
            <span class="field-num">①</span> 選擇論命項目
          </legend>
          <div class="service-grid">
            <label
              v-for="s in services"
              :key="s.id"
              class="service-card"
              :class="{ selected: form.serviceId === s.id }"
            >
              <input
                type="radio"
                :value="s.id"
                v-model="form.serviceId"
                class="visually-hidden"
              />
              <div class="service-title">{{ s.title }}</div>
              <div class="service-price">
                NT$ {{ s.price.toLocaleString() }}
                <span v-if="s.unit" class="service-unit">/ {{ s.unit }}</span>
              </div>
              <div v-if="form.serviceId === s.id" class="service-check">✓</div>
            </label>
          </div>
          <span v-if="errors.serviceId" class="error-msg">{{ errors.serviceId }}</span>
        </fieldset>

        <!-- ② 姓名 -->
        <fieldset class="field-block">
          <legend class="field-legend">
            <span class="field-num">②</span> 您的姓名
          </legend>
          <input
            v-model="form.name"
            type="text"
            class="input"
            placeholder="請填寫真實姓名"
            autocomplete="name"
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </fieldset>

        <!-- ③ 聯絡方式 -->
        <fieldset class="field-block">
          <legend class="field-legend">
            <span class="field-num">③</span> 聯絡方式
            <span class="hint">至少填一項</span>
          </legend>
          <div class="contact-stack">
            <div class="input-with-icon">
              <span class="input-icon" aria-hidden="true">✉</span>
              <input
                id="email"
                type="email"
                v-model="form.email"
                class="input"
                placeholder="Email（例如：you@gmail.com）"
                autocomplete="email"
                inputmode="email"
              />
            </div>
            <div class="input-with-icon">
              <span class="input-icon" aria-hidden="true">☏</span>
              <input
                id="phone"
                type="tel"
                v-model="form.phone"
                class="input"
                placeholder="電話（例如：0912-345-678）"
                autocomplete="tel"
                inputmode="tel"
              />
            </div>
            <div class="input-with-icon">
              <span class="input-icon line-icon" aria-hidden="true">L</span>
              <input
                id="lineId"
                type="text"
                v-model="form.lineId"
                class="input"
                placeholder="LINE ID"
              />
            </div>
          </div>
          <span v-if="errors.contact" class="error-msg">{{ errors.contact }}</span>
        </fieldset>

        <!-- ④ 預約日期 -->
        <fieldset class="field-block">
          <legend class="field-legend">
            <span class="field-num">④</span> 預約日期
          </legend>
          <input
            v-model="form.date"
            :min="todayStr"
            type="date"
            class="input input-date"
          />
          <span v-if="errors.date" class="error-msg">{{ errors.date }}</span>
        </fieldset>

        <!-- ⑤ 時段 -->
        <fieldset class="field-block">
          <legend class="field-legend">
            <span class="field-num">⑤</span> 預約時段
            <span class="hint">可複選</span>
          </legend>

          <div v-if="!form.date" class="slot-empty">
            <span aria-hidden="true">↑</span> 請先選擇日期
          </div>

          <div v-else-if="slotsForSelectedDate.length === 0" class="slot-empty">
            載入中或此日期無可預約時段
          </div>

          <div v-else class="slots-grid">
            <label
              v-for="slot in slotsForSelectedDate"
              :key="slot.timeSlot"
              class="slot-chip"
              :class="[
                slot.status,
                { selected: form.timeSlots.includes(slot.timeSlot) },
              ]"
            >
              <input
                type="checkbox"
                :value="slot.timeSlot"
                v-model="form.timeSlots"
                :disabled="slot.status !== 'open'"
                class="visually-hidden"
              />
              <span class="slot-time">{{ slot.timeSlot }}</span>
              <span class="slot-tag" :class="slot.status + '-tag'">
                {{ slotStatusLabel(slot.status) }}
              </span>
            </label>
          </div>
          <span v-if="errors.timeSlots" class="error-msg">{{ errors.timeSlots }}</span>
        </fieldset>

        <!-- ⑥ 備註 -->
        <fieldset class="field-block">
          <legend class="field-legend">
            <span class="field-num">⑥</span> 想特別說明的內容
            <span class="hint">選填</span>
          </legend>
          <textarea
            v-model="form.note"
            rows="3"
            class="input textarea"
            placeholder="例如：希望聚焦感情線、轉職方向、流年運勢等"
          ></textarea>
        </fieldset>

        <!-- 預約摘要 + 送出 -->
        <div class="submit-bar">
          <div class="submit-summary">
            <div v-if="currentService" class="summary-line">
              <span class="summary-label">{{ currentService.title }}</span>
              <span class="summary-price">
                NT$ {{ currentService.price.toLocaleString() }}
              </span>
            </div>
            <div v-else class="summary-line muted">尚未選擇項目</div>
            <div v-if="form.timeSlots && form.timeSlots.length" class="summary-meta">
              {{ form.date }} · 共 {{ form.timeSlots.length }} 個時段
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">送出預約 →</span>
            <span v-else>送出中…</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:4000";

export default {
  name: "BookingForm",
  data() {
    return {
      services: [
        { id: "name", title: "改名 / 取名", price: 3000, unit: "50 分" },
        { id: "ziwei", title: "紫微斗數", price: 1200, unit: "50 分" },
        { id: "bazi", title: "四柱八字", price: 1200, unit: "50 分" },
        { id: "liuyao", title: "文王卦占卜", price: 600, unit: "1 小時" },
        { id: "fengshui", title: "風水堪輿", price: 10000, unit: "次" },
        { id: "chat_line", title: "姓名鑑定", price: 800, unit: "30 分" },
      ],
      allTimeSlots: [
        "19:00-20:00(線上)",
        "20:00-21:00(線上)",
        "21:00-22:00(線上)",
      ],
      slotsForSelectedDate: [],
      form: {
        serviceId: "",
        name: "",
        contact: "",
        email: "",
        phone: "",
        lineId: "",
        date: "",
        timeSlots: [],
        note: "",
      },
      todayStr: new Date().toISOString().slice(0, 10),
      errors: {
        serviceId: "",
        name: "",
        contact: "",
        date: "",
        timeSlots: "",
      },
      loading: false,
      submitSuccess: false,
    };
  },
  computed: {
    currentService() {
      return this.services.find((s) => s.id === this.form.serviceId) || null;
    },
    availableTimeSlots() {
      return this.slotsForSelectedDate
        .filter((s) => s.status === "open")
        .map((s) => s.timeSlot);
    },
  },
  watch: {
    async "form.date"(newDate) {
      this.form.timeSlots = [];
      if (!newDate) {
        this.slotsForSelectedDate = [];
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/slots?date=${encodeURIComponent(newDate)}`,
        );
        this.slotsForSelectedDate = await res.json();
      } catch (err) {
        console.error("載入時段狀態失敗：", err);
        this.slotsForSelectedDate = [];
      }
    },
  },
  methods: {
    slotStatusLabel(s) {
      return { open: "可預約", booked: "已預約", blocked: "不開放" }[s] || s;
    },
    async fetchBookings() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`);
        this.bookings = await res.json();
      } catch (err) {
        console.error("載入預約資料失敗：", err);
      }
    },
    validateForm() {
      this.errors = {
        serviceId: "",
        name: "",
        contact: "",
        date: "",
        timeSlots: "",
      };
      if (!this.form.serviceId) this.errors.serviceId = "請選擇論命項目";
      if (!this.form.name) this.errors.name = "請填寫姓名";
      const hasContact =
        (this.form.email && this.form.email.trim()) ||
        (this.form.phone && this.form.phone.trim()) ||
        (this.form.lineId && this.form.lineId.trim());
      if (!hasContact)
        this.errors.contact =
          "請至少填一種聯絡方式（Email / 電話 / LINE 其一即可）";
      if (!this.form.date) this.errors.date = "請選擇預約日期";
      if (!this.form.timeSlots || this.form.timeSlots.length === 0)
        this.errors.timeSlots = "請至少選擇一個時段";
      return !Object.values(this.errors).some((msg) => msg);
    },
    async submitForm() {
      const ok = this.validateForm();
      if (!ok) {
        // 滾到第一個錯誤
        this.$nextTick(() => {
          const el = this.$el.querySelector(".error-msg");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }

      const contactParts = [];
      if (this.form.phone?.trim()) contactParts.push(`電話：${this.form.phone.trim()}`);
      if (this.form.lineId?.trim()) contactParts.push(`LINE：${this.form.lineId.trim()}`);
      if (this.form.email?.trim()) contactParts.push(`Email：${this.form.email.trim()}`);
      this.form.contact = contactParts.join(" / ");

      this.loading = true;
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const result = await response.json();
        if (!result.success) {
          alert(result.message);
          return;
        }
        this.submitSuccess = true;
        this.form = {
          serviceId: "",
          name: "",
          contact: "",
          email: "",
          phone: "",
          lineId: "",
          date: "",
          timeSlots: [],
          note: "",
        };
        this.errors = { serviceId: "", name: "", contact: "", date: "", timeSlots: "" };
        // 滾到頂端讓使用者看到成功 banner
        window.scrollTo({ top: 0, behavior: "smooth" });
        // 8 秒後自動隱藏
        setTimeout(() => (this.submitSuccess = false), 8000);
      } catch (err) {
        console.error("送出預約時發生錯誤：", err);
        alert("送出失敗，請稍後再試。");
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchBookings();
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont/style.css");

/* ============================================
   設計系統
   ============================================ */
.booking-page {
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
  --bg-input: #fffdf8;
  --shadow-sm: 0 4px 14px rgba(60, 40, 25, 0.06);
  --shadow-md: 0 14px 32px rgba(60, 40, 25, 0.09);
  --shadow-lg: 0 22px 48px rgba(60, 40, 25, 0.12);

  display: flex;
  justify-content: center;
  padding: 8px 0 80px; /* 底部給 sticky CTA 空間 */
  font-family: "LXGW WenKai", "Noto Serif SC", -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--ink);
}

.reveal {
  animation: reveal 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.booking-card {
  width: 100%;
  max-width: 640px;
  background: var(--paper);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 24px;
  padding: 40px 36px 32px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.booking-card::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(185,58,50,.06), transparent 60%);
  pointer-events: none;
}

/* ============================================
   Header
   ============================================ */
.booking-header {
  text-align: center;
  margin-bottom: 36px;
  position: relative;
}

.seal-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff8f0;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  font-size: 26px;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(185, 58, 50, 0.32),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  transform: rotate(-4deg);
  margin-bottom: 14px;
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
  font-size: 30px;
  font-weight: 600;
  margin: 0 0 10px;
  letter-spacing: 0.08em;
  color: var(--ink);
}

.subtitle {
  font-size: 14px;
  color: var(--ink-mute);
  margin: 0;
  line-height: 1.6;
}

/* ============================================
   成功 banner
   ============================================ */
.success-banner {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 18px;
  background: linear-gradient(135deg, #f0f7ed, #e8f3e3);
  border: 1px solid #b8d8a8;
  border-radius: 14px;
  margin-bottom: 24px;
}

.success-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #5b8a3a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.success-banner strong {
  display: block;
  font-size: 16px;
  color: #2d4a1d;
  margin-bottom: 2px;
}

.success-banner p {
  margin: 0;
  font-size: 13px;
  color: #4a5a3a;
  line-height: 1.5;
}

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }

/* ============================================
   Form
   ============================================ */
.form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.field-block {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-legend {
  font-family: "Noto Serif SC", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.04em;
  padding: 0;
  margin-bottom: 4px;
}

.field-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--seal);
  font-weight: 600;
}

.hint {
  font-size: 12px;
  color: var(--ink-mute);
  font-weight: 400;
  background: rgba(60, 40, 25, 0.06);
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 4px;
}

/* ============================================
   Inputs
   ============================================ */
.input {
  width: 100%;
  padding: 13px 14px;
  font-size: 16px; /* 16px 防止 iOS focus 自動放大 */
  font-family: inherit;
  color: var(--ink);
  background: var(--bg-input);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
  min-height: 48px;
}

.input::placeholder {
  color: rgba(60, 40, 25, 0.35);
}

.input:focus {
  border-color: var(--gold);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(167, 133, 80, 0.16);
}

.textarea {
  resize: vertical;
  line-height: 1.6;
  min-height: 96px;
}

.input-date {
  font-family: inherit;
}

/* ============================================
   ① 服務項目卡片
   ============================================ */
.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.service-card {
  position: relative;
  background: var(--bg-input);
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
  -webkit-tap-highlight-color: transparent;
  min-height: 76px;
}

.service-card:hover {
  border-color: var(--gold);
  background: #fffefa;
}

.service-card.selected {
  border-color: var(--seal);
  background: linear-gradient(135deg, #fff7f5, #fff);
  box-shadow: 0 6px 18px rgba(185, 58, 50, 0.12);
}

.service-title {
  font-family: "Noto Serif SC", serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.service-price {
  font-size: 13px;
  color: var(--ink-mute);
}

.service-unit {
  color: var(--ink-mute);
  margin-left: 2px;
}

.service-card.selected .service-price {
  color: var(--seal);
  font-weight: 600;
}

.service-check {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 22px;
  height: 22px;
  background: var(--seal);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(185, 58, 50, 0.3);
}

/* ============================================
   ③ 聯絡方式 input + icon
   ============================================ */
.contact-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-with-icon {
  position: relative;
}

.input-with-icon .input {
  padding-left: 44px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: var(--gold);
  pointer-events: none;
  font-weight: 600;
}

.line-icon {
  background: #06c755;
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

/* ============================================
   ⑤ 時段
   ============================================ */
.slot-empty {
  padding: 16px;
  background: rgba(60, 40, 25, 0.04);
  border: 1px dashed var(--line);
  border-radius: 12px;
  color: var(--ink-mute);
  font-size: 14px;
  text-align: center;
}

.slots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slot-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  border: 1.5px solid var(--line);
  background: var(--bg-input);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  min-height: 42px;
}

.slot-chip.open:hover {
  border-color: var(--gold);
  background: #fffefa;
}

.slot-chip.selected.open {
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  border-color: var(--seal-deep);
  color: #fff;
  box-shadow: 0 6px 14px rgba(185, 58, 50, 0.3);
  transform: translateY(-1px);
}

.slot-chip.booked,
.slot-chip.blocked {
  opacity: 0.55;
  cursor: not-allowed;
  background: rgba(60, 40, 25, 0.04);
}

.slot-time {
  font-family: "Noto Serif SC", sans-serif;
  font-weight: 500;
}

.slot-tag {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(60, 40, 25, 0.08);
  color: var(--ink-mute);
}

.slot-chip.selected .slot-tag {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.open-tag {
  background: rgba(167, 133, 80, 0.16);
  color: var(--gold);
}

.blocked-tag {
  background: rgba(185, 58, 50, 0.12);
  color: var(--seal);
}

/* ============================================
   工具
   ============================================ */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.error-msg {
  font-size: 13px;
  color: var(--seal);
  display: flex;
  align-items: center;
  gap: 4px;
}
.error-msg::before {
  content: "✕";
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: var(--seal);
  color: #fff;
  border-radius: 50%;
}

/* ============================================
   送出 bar
   ============================================ */
.submit-bar {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fff8f0, #fff);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
}

.submit-summary {
  flex: 1;
  min-width: 0;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-family: "Noto Serif SC", serif;
}

.summary-line.muted {
  color: var(--ink-mute);
  font-size: 14px;
}

.summary-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
}

.summary-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--seal);
}

.summary-meta {
  font-size: 12px;
  color: var(--ink-mute);
  margin-top: 4px;
}

.submit-btn {
  flex-shrink: 0;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid var(--seal-deep);
  background: linear-gradient(135deg, var(--seal), var(--seal-deep));
  color: #fff;
  box-shadow: 0 6px 18px rgba(185, 58, 50, 0.3);
  transition: all 0.2s ease;
  min-height: 48px;
  -webkit-tap-highlight-color: transparent;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(185, 58, 50, 0.4);
  filter: brightness(1.05);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================
   RWD - 手機 (含 LIFF / Threads)
   ============================================ */
@media (max-width: 768px) {
  .booking-page {
    padding: 0 0 96px; /* 給 sticky CTA */
  }

  .booking-card {
    border-radius: 18px;
    padding: 28px 20px 24px;
  }

  .booking-header {
    margin-bottom: 26px;
  }

  .seal-mark {
    width: 42px;
    height: 42px;
    font-size: 22px;
  }

  .title {
    font-size: 24px;
  }

  .form {
    gap: 22px;
  }

  .service-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  /* 送出 bar 在手機改為 sticky 底部 */
  .submit-bar {
    position: sticky;
    bottom: 0;
    margin: 8px -20px -24px;
    border-radius: 18px 18px 0 0;
    border-bottom: none;
    border-left: none;
    border-right: none;
    padding: 14px 18px;
    background: rgba(255, 248, 240, 0.96);
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    box-shadow: 0 -8px 24px rgba(60, 40, 25, 0.08);
    /* 支援 iPhone home indicator 安全區 */
    padding-bottom: max(14px, env(safe-area-inset-bottom));
    z-index: 10;
  }

  .submit-btn {
    padding: 14px 22px;
    font-size: 15px;
  }

  .summary-price {
    font-size: 16px;
  }
}

@media (max-width: 380px) {
  .booking-card {
    padding: 24px 16px 20px;
  }
  .title {
    font-size: 22px;
  }
  .submit-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .submit-btn {
    width: 100%;
  }
}
</style>
