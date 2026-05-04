<template>
  <div class="page">
    <div class="card">
      <h2>論命預約表單</h2>
      <p class="subtitle">
        請填寫以下資料，我會在確認後主動與您聯絡，安排論命時間。
      </p>

      <form @submit.prevent="submitForm" class="form">
        <!-- 選擇論命項目 -->
        <label class="field">
          論命項目：
          <select v-model="form.serviceId">
            <option disabled value="">請選擇</option>
            <option
              v-for="service in services"
              :key="service.id"
              :value="service.id"
            >
              {{ service.title }}
            </option>
          </select>
          <span v-if="errors.serviceId" class="error">{{
            errors.serviceId
          }}</span>
        </label>

        <!-- 顯示金額 -->
        <p v-if="currentService" class="price">
          金額：{{ currentService.price }} 元
        </p>

        <!-- 姓名 -->
        <label class="field">
          您的姓名：
          <input v-model="form.name" type="text" />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </label>

        <!-- 聯絡方式：Email / 電話 / LINE 擇一或多個 -->
        <div class="form-group">
          <label class="form-label">
            聯絡方式
            <span class="form-label-hint">（至少填一個）</span>
          </label>

          <div class="contact-grid">
            <div class="contact-item">
              <label for="email" class="contact-label">Email（選填）</label>
              <input
                id="email"
                type="email"
                v-model="form.email"
                class="form-input"
                placeholder="例如：you@gmail.com"
              />
            </div>

            <div class="contact-item">
              <label for="phone" class="contact-label">電話（選填）</label>
              <input
                id="phone"
                type="tel"
                v-model="form.phone"
                class="form-input"
                placeholder="例如：0912-345-678"
              />
            </div>

            <div class="contact-item">
              <label for="lineId" class="contact-label">LINE ID（選填）</label>
              <input
                id="lineId"
                type="text"
                v-model="form.lineId"
                class="form-input"
                placeholder="例如：line 帳號名稱"
              />
            </div>
          </div>

          <p v-if="errors.contact" class="error-text">
            {{ errors.contact }}
          </p>
        </div>

        <!-- 日期 -->
        <label class="field">
          預約日期：
          <input v-model="form.date" :min="todayStr" type="date" />
          <span v-if="errors.date" class="error">{{ errors.date }}</span>
        </label>

        <!-- 預約時段（可複選） -->
        <label class="field">
          預約時段（可複選）：

          <div v-if="!form.date">
            <em>請先選擇日期</em>
          </div>

          <div v-else-if="slotsForSelectedDate.length === 0">
            <em>載入時段資料中或此日期無可預約時段</em>
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
              <!-- 真正的 checkbox：藏起來，只用來綁 v-model -->
              <input
                type="checkbox"
                :value="slot.timeSlot"
                v-model="form.timeSlots"
                :disabled="slot.status !== 'open'"
              />

              <div class="slot-main">
                <span class="slot-time">{{ slot.timeSlot }}</span>
                <span v-if="slot.status === 'open'" class="slot-tag open-tag">
                  可預約
                </span>
                <span
                  v-else-if="slot.status === 'booked'"
                  class="slot-tag booked-tag"
                >
                  已預約
                </span>
                <span
                  v-else-if="slot.status === 'blocked'"
                  class="slot-tag blocked-tag"
                >
                  不開放
                </span>
              </div>
            </label>
          </div>

          <span v-if="errors.timeSlots" class="error">{{
            errors.timeSlots
          }}</span>
        </label>

        <!-- 備註 -->
        <label class="field">
          想特別說明的內容：
          <textarea v-model="form.note" rows="3"></textarea>
        </label>

        <button type="submit">送出預約</button>
      </form>
    </div>
  </div>
</template>

<script>
//理境變數
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:4000";

export default {
  name: "BookingForm",
  data() {
    return {
      // 論命項目
      services: [
        { id: "name", title: "改名/取名", price: 2000 },
        { id: "ziwei", title: "紫微斗數", price: 2400 },
        { id: "bazi", title: "四柱八字", price: 2400 },
        { id: "liuyao", title: "六爻占卜", price: 300 },
        { id: "fengshui", title: "風水堪輿", price: 10000 },
        { id: "chat_line", title: "姓名諮詢", price: 600 },
      ],
      // 所有可選時段（固定表）
      allTimeSlots: [
        //"09:00-10:00",
        //"10:30-11:30",
        //"14:00-15:00",
        //"15:30-16:30",
        "19:00-20:00(線上)",
        "20:00-21:00(線上)",
        "21:00-22:00(線上)",
      ],
      // 從 /api/slots 拿回來的這一天所有時段狀態
      slotsForSelectedDate: [],
      // 表單內容
      form: {
        serviceId: "",
        name: "",
        contact: "",
        email: "",
        phone: "",
        lineId: "",
        date: "",
        timeSlot: "",
        note: "",
      },

      // 🔽 今天以前的日期在日曆上直接不能選：
      // 今天（YYYY-MM-DD），給日期 input 當 min 用
      todayStr: new Date().toISOString().slice(0, 10),

      // 驗證錯誤訊息
      errors: {
        serviceId: "",
        name: "",
        contact: "",
        date: "",
        timeSlot: "",
      },
    };
  },
  computed: {
    currentService() {
      return this.services.find((s) => s.id === this.form.serviceId) || null;
    },
    // 根據選到的日期，算出「還可以選的時段」
    availableTimeSlots() {
      // 只取 status = open 的
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
        console.log("取得這一天的時段狀態：", this.slotsForSelectedDate);
      } catch (err) {
        console.error("載入時段狀態失敗：", err);
        this.slotsForSelectedDate = [];
      }
    },
  },
  methods: {
    async fetchBookings() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`);
        this.bookings = await res.json();
        console.log("目前已有預約：", this.bookings);
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

      if (!this.form.serviceId) {
        this.errors.serviceId = "請選擇論命項目";
      }
      if (!this.form.name) {
        this.errors.name = "請填寫姓名";
      }
      // 聯絡方式：email / phone / lineId 至少一個有值
      const hasContact =
        (this.form.email && this.form.email.trim()) ||
        (this.form.phone && this.form.phone.trim()) ||
        (this.form.lineId && this.form.lineId.trim());

      if (!hasContact) {
        this.errors.contact =
          "請至少填一種聯絡方式（Email / 電話 / LINE 其一即可）";
      }

      if (!this.form.date) {
        this.errors.date = "請選擇預約日期";
      }
      if (!this.form.timeSlots || this.form.timeSlots.length === 0) {
        this.errors.timeSlots = "請至少選擇一個時段";
      }

      return !Object.values(this.errors).some((msg) => msg);
    },
    async submitForm() {
      const ok = this.validateForm();
      if (!ok) return;

      // 組一個 contact 摘要給後端（維持相容）
      const contactParts = [];
      if (this.form.phone && this.form.phone.trim()) {
        contactParts.push(`電話：${this.form.phone.trim()}`);
      }
      if (this.form.lineId && this.form.lineId.trim()) {
        contactParts.push(`LINE：${this.form.lineId.trim()}`);
      }
      if (this.form.email && this.form.email.trim()) {
        contactParts.push(`Email：${this.form.email.trim()}`);
      }

      this.form.contact = contactParts.join(" / ");

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });

        const result = await response.json();
        console.log("後端回應：", result);

        if (!result.success) {
          alert(result.message);
          return;
        }

        alert("預約成功！");
        alert("如果填錯，可以直接在 LINE 跟老師說。");
        //const selectedDate = this.form.date;

        this.form = {
          serviceId: "",
          name: "",
          contact: "",
          date: "",
          timeSlots: [],
          note: "",
        };
        this.errors = {
          serviceId: "",
          name: "",
          contact: "",
          date: "",
          timeSlots: "",
        };

        // 若你之後想保留原本選的日期，可以改成 this.form.date = selectedDate 再觸發載入
        // 目前清空就好
        // 如果想馬上重整該日期的 slots（未來可能會用）：
        // if (selectedDate) this.form.date = selectedDate
      } catch (err) {
        console.error("送出預約時發生錯誤：", err);
        alert("送出失敗，請稍後再試。");
      }
    },
  },
  mounted() {
    this.fetchBookings();
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.card {
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.error {
  color: #d32f2f;
  font-size: 12px;
}

h2 {
  font-size: 26px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 6px;
  color: #333;
}

.subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.4;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #333;
}

.price {
  margin: 0;
  font-weight: 500;
  font-size: 14px;
  color: #444;
}

input,
select,
textarea {
  padding: 8px 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #888;
}

button {
  margin-top: 12px;
  padding: 10px 14px;
  font-size: 15px;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  background: #333;
  color: #fff;
}

button:hover {
  opacity: 0.92;
}

.slots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

/* 卡片外觀 */
.slot-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #778096;
  background: #fafafa;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;
}

/* hover 效果 */
.slot-chip.open:hover {
  background: #f0f7ff;
  border-color: #90caf9;
  box-shadow: 0 0 0 2px rgba(144, 202, 249, 0.3);
}

/* 被選中的樣式 */
.slot-chip.selected.open {
  background: #1976d2;
  border-color: #115293;
  color: #fff;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transform: translateY(-1px);
}

/* 已預約 / 不開放：灰掉或紅一點 */
.slot-chip.booked {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

.slot-chip.blocked {
  background: #fff3f3;
  border-color: #ffcdd2;
  color: #c62828;
  cursor: not-allowed;
}

/* 把真正的 checkbox 藏起來，但還是存在（方便 v-model） */
.slot-chip input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* 文字區 */
.slot-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-time {
  white-space: nowrap;
}

/* 小標籤 */
.slot-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  white-space: nowrap;
}

.open-tag {
  background: rgba(25, 118, 210, 0.12);
  color: #1565c0;
}

.booked-tag {
  background: rgba(158, 158, 158, 0.16);
  color: #616161;
}

.blocked-tag {
  background: rgba(198, 40, 40, 0.12);
  color: #b71c1c;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  font-size: 12px;
  color: #7a736a;
  padding-top: 5px;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  color: #9a9187;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #333;
}

.form-label-hint {
  font-size: 12px;
  color: #7a736a;
}

.error-text {
  margin-top: 4px;
  font-size: 12px;
  color: #c0392b;
}

/* 手機版改成一欄 */
@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* 當整天都沒開或都被用完，可用 existing .error 或 em 自己表達 */
</style>
