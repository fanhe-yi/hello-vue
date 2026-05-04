<template>
  <div class="page">
    <div class="card">
      <h2>後台管理</h2>
      <p class="subtitle">
        在這裡可以設定「休息 / 不開放時段」，以及管理所有顧客預約。
      </p>

      <!-- 登入區 -->
      <div v-if="!loggedIn" class="form">
        <label class="field">
          後台密碼（本機預設 dev-secret）：
          <input
            type="password"
            v-model="adminToken"
            placeholder="請輸入後台密碼"
          />
        </label>
        <button @click="login">登入後台</button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </div>

      <!-- 登入後的主畫面：上方分頁，下方依分頁顯示內容 -->
      <div v-else class="form">
        <!-- 分頁切換 -->
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'unavailable' }"
            @click="activeTab = 'unavailable'"
          >
            不開放設定
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'bookings' }"
            @click="activeTab = 'bookings'"
          >
            預約管理
          </button>
        </div>

        <!-- ========== 分頁一：不開放設定 ========== -->
        <div v-if="activeTab === 'unavailable'" class="tab-panel">
          <!-- 選擇日期 -->
          <label class="field">
            要設定的日期：
            <input type="date" v-model="selectedDate" @change="loadDateState" />
          </label>

          <div v-if="!selectedDate">
            <em>請先選擇一個日期。</em>
          </div>

          <template v-else>
            <!-- 整天不開放 -->
            <label class="field">
              <div class="checkbox-row">
                <input
                  type="checkbox"
                  id="fullDay"
                  v-model="blockFullDay"
                  @change="onFullDayToggle"
                />
                <label for="fullDay">此日期整天不開放預約</label>
              </div>
              <small>若勾選，這天所有時段都會顯示為「不開放」。</small>
            </label>

            <!-- 單一時段不開放（在沒勾整天的情況下使用） -->
            <div class="field">
              <span>不開放時段（可複選）：</span>

              <div class="slots-grid">
                <label
                  v-for="slot in allTimeSlots"
                  :key="slot"
                  class="slot-chip"
                  :class="{
                    blocked: blockedSlotsForDate.includes(slot),
                    open: !blockedSlotsForDate.includes(slot),
                  }"
                >
                  <input
                    type="checkbox"
                    :value="slot"
                    v-model="blockedSlotsForDate"
                    :disabled="blockFullDay"
                  />
                  <div class="slot-main">
                    <span class="slot-time">{{ slot }}</span>
                    <span
                      class="slot-tag"
                      :class="
                        blockedSlotsForDate.includes(slot)
                          ? 'blocked-tag'
                          : 'open-tag'
                      "
                    >
                      {{
                        blockedSlotsForDate.includes(slot) ? "不開放" : "可開放"
                      }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button @click="saveCurrentDateSetting">儲存當日設定</button>

            <div class="field">
              <h3>目前不開放設定概要</h3>
              <p class="subtitle small-subtitle">
                這是 unavailable.json 的內容概要，之後可以拆成更完整的後台頁面。
              </p>
              <pre class="json-preview">{{ unavailable }}</pre>
            </div>
          </template>
        </div>

        <!-- ========== 分頁二：預約管理 ========== -->
        <!-- ========== 分頁二：預約管理（含行事曆） ========== -->
        <div v-else class="tab-panel">
          <!-- 行事曆 -->
          <div class="calendar-panel">
            <div class="calendar-header">
              <button @click="prevMonth">‹</button>
              <span>{{ calendarYear }} 年 {{ calendarMonth }} 月</span>
              <button @click="nextMonth">›</button>
            </div>

            <table class="calendar-table">
              <thead>
                <tr>
                  <th>日</th>
                  <th>一</th>
                  <th>二</th>
                  <th>三</th>
                  <th>四</th>
                  <th>五</th>
                  <th>六</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, wIndex) in calendarWeeks" :key="wIndex">
                  <td
                    v-for="(cell, dIndex) in week"
                    :key="dIndex"
                    class="calendar-cell"
                    :class="{
                      'is-today': cell && cell.dateStr === todayStr,
                      'has-bookings': cell && cell.hasBookings,
                      'is-blocked-day': cell && cell.isFullDayBlocked,
                      'is-selected': cell && cell.dateStr === selectedDate,
                    }"
                    @click="selectDateFromCalendar(cell)"
                  >
                    <div v-if="cell" class="cell-inner">
                      <div class="day-number">{{ cell.day }}</div>
                      <div class="cell-tags">
                        <span
                          v-if="cell.isFullDayBlocked"
                          class="tag blocked-tag"
                        >
                          休
                        </span>
                        <span v-else-if="cell.hasBookings" class="tag open-tag">
                          約
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="calendar-legend">
              <span><span class="legend-box legend-open"></span> 有預約</span>
              <span
                ><span class="legend-box legend-blocked"></span>
                整天不開放</span
              >
              <span v-if="selectedDate">
                目前選擇日期：<strong>{{ selectedDate }}</strong>
              </span>
              <span v-else> 點選上方行事曆中的日期，查看當天預約。 </span>
            </div>
          </div>

          <!-- 預約列表 -->
          <div class="toolbar">
            <button @click="fetchBookings">重新載入預約列表</button>
          </div>

          <div v-if="loadingBookings">
            <em>載入中...</em>
          </div>

          <div v-else-if="bookingsForSelectedDate.length === 0">
            <em v-if="selectedDate"> 此日期目前沒有預約。 </em>
            <em v-else> 尚無任何預約，或是尚未選擇日期。 </em>
          </div>

          <div v-else class="table-wrapper">
            <table class="booking-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>時段</th>
                  <th>項目</th>
                  <th>姓名</th>
                  <th>聯絡方式</th>
                  <th>狀態</th>
                  <th>建立時間</th>
                  <th>操作頁</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in bookingsForSelectedDate" :key="b.id">
                  <td>{{ b.date }}</td>
                  <td>
                    <div class="timechips">
                      <span
                        v-for="slot in normalizeSlots(b)"
                        :key="slot"
                        class="chip"
                      >
                        {{ slot }}
                      </span>
                    </div>
                  </td>
                  <td>{{ serviceTitle(b.serviceId) }}</td>
                  <td>{{ b.name }}</td>
                  <td class="contact-cell">{{ b.contact }}</td>
                  <td>
                    <select
                      v-model="b.status"
                      @change="updateStatus(b)"
                      class="status-select"
                    >
                      <option value="pending">待處理</option>
                      <option value="done">已完成</option>
                      <option value="canceled">已取消</option>
                    </select>
                  </td>
                  <td>{{ formatDateTime(b.createdAt) }}</td>
                  <td>
                    <button class="danger-btn" @click="removeBooking(b)">
                      刪除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//環境變數
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";

export default {
  name: "AdminUnavailable",
  data() {
    return {
      // 共用登入狀態
      adminToken: "FanHe-Admin-2025", // 本機測試用，之後可以改成空字串
      loggedIn: false,
      loginError: "",
      activeTab: "unavailable", // 'unavailable' | 'bookings'

      // 不開放設定
      unavailable: {
        fullDay: [],
        slots: [],
      },
      allTimeSlots: [
        //"09:00-10:00",
        //"10:30-11:30",
        //"14:00-15:00",
        //"15:30-16:30",
        "19:00-20:00(線上)",
        "20:00-21:00(線上)",
        "21:00-22:00(線上)",
      ],
      selectedDate: "",
      blockFullDay: false,
      blockedSlotsForDate: [],

      // 預約管理
      bookings: [],
      loadingBookings: false,
      services: [
        { id: "name", title: "姓名學" },
        { id: "ziwei", title: "紫微斗數" },
        { id: "bazi", title: "四柱八字" },
        { id: "liuyao", title: "六爻占卜" },
        { id: "fengshui", title: "風水堪輿" },
      ],

      // 行事曆用
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth() + 1, // 1~12

      todayStr: new Date().toISOString().slice(0, 10),
    };
  },
  //行事曆method
  computed: {
    // 月曆格子：回傳一個「週陣列」，每週裡面是一個 7 格的陣列
    calendarWeeks() {
      const year = this.calendarYear;
      const month = this.calendarMonth; // 1~12

      const firstDay = new Date(year, month - 1, 1);
      const firstWeekday = firstDay.getDay(); // 0(日)~6(六)
      const daysInMonth = new Date(year, month, 0).getDate();

      const weeks = [];
      let week = [];

      // 前面補空白
      for (let i = 0; i < firstWeekday; i++) {
        week.push(null);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
          d
        ).padStart(2, "0")}`;

        const hasBookings = this.bookings.some((b) => b.date === dateStr);
        const isFullDayBlocked =
          Array.isArray(this.unavailable.fullDay) &&
          this.unavailable.fullDay.includes(dateStr);

        week.push({
          day: d,
          dateStr,
          hasBookings,
          isFullDayBlocked,
        });

        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }

      // 最後一週不足 7 格的補 null
      if (week.length > 0) {
        while (week.length < 7) {
          week.push(null);
        }
        weeks.push(week);
      }

      return weeks;
    },

    // 選中日期的預約列表（如果沒選日期，就顯示全部）
    bookingsForSelectedDate() {
      if (!this.selectedDate) return this.bookings;
      return this.bookings.filter((b) => b.date === this.selectedDate);
    },
  },

  methods: {
    // ===== 共用：登入 =====
    async login() {
      this.loginError = "";
      try {
        // 用 unavailable 這支 API 當作「測試 token」用
        const res = await fetch(`${API_BASE_URL}/api/admin/unavailable`, {
          headers: {
            "x-admin-token": this.adminToken,
          },
        });

        if (!res.ok) {
          throw new Error("未授權");
        }

        this.unavailable = await res.json();
        this.loggedIn = true;
        console.log("API_BASE_URL =", API_BASE_URL);
        console.log("adminToken =", this.adminToken);

        // 登入後順便載入預約列表
        this.fetchBookings();
      } catch (err) {
        console.error(err);
        this.loginError = "登入失敗，請確認密碼是否正確。";
      }
    },

    // ===== 不開放設定相關 =====
    loadDateState() {
      if (!this.selectedDate) {
        this.blockFullDay = false;
        this.blockedSlotsForDate = [];
        return;
      }

      // 此日期是否整天不開放
      this.blockFullDay =
        Array.isArray(this.unavailable.fullDay) &&
        this.unavailable.fullDay.includes(this.selectedDate);

      // 此日期有哪些時段不開放
      const entry =
        Array.isArray(this.unavailable.slots) &&
        this.unavailable.slots.find((s) => s.date === this.selectedDate);

      this.blockedSlotsForDate = entry ? [...entry.timeSlots] : [];
    },
    onFullDayToggle() {
      if (this.blockFullDay) {
        // 整天不開放時，清空當日個別 blocked 時段
        this.blockedSlotsForDate = [];
      }
    },
    saveCurrentDateSetting() {
      if (!this.selectedDate) return;

      // 更新 fullDay
      const fullDaySet = new Set(this.unavailable.fullDay || []);
      if (this.blockFullDay) {
        fullDaySet.add(this.selectedDate);
      } else {
        fullDaySet.delete(this.selectedDate);
      }

      // 更新 slots
      let newSlots = Array.isArray(this.unavailable.slots)
        ? [...this.unavailable.slots]
        : [];

      // 先移除這一日期舊的設定
      newSlots = newSlots.filter((s) => s.date !== this.selectedDate);

      if (!this.blockFullDay && this.blockedSlotsForDate.length > 0) {
        newSlots.push({
          date: this.selectedDate,
          timeSlots: [...this.blockedSlotsForDate],
        });
      }

      const updated = {
        fullDay: Array.from(fullDaySet),
        slots: newSlots,
      };

      this.saveUnavailableToServer(updated);
    },
    async saveUnavailableToServer(updated) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/unavailable`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": this.adminToken,
          },
          body: JSON.stringify(updated),
        });

        const result = await res.json();
        if (!res.ok || result.success !== true) {
          throw new Error("儲存失敗");
        }

        this.unavailable = updated;
        alert("已儲存不開放設定");
        this.loadDateState();
      } catch (err) {
        console.error(err);
        alert("儲存時發生錯誤，請稍後再試。");
      }
    },

    // ===== 預約管理相關 =====
    async fetchBookings() {
      this.loadingBookings = true;
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
          headers: {
            "x-admin-token": this.adminToken,
          },
        });

        if (!res.ok) {
          throw new Error("載入 bookings 失敗");
        }

        const data = await res.json();
        this.bookings = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error(err);
        alert("載入預約列表時發生錯誤");
      } finally {
        this.loadingBookings = false;
      }
    },

    // ===== 行事曆相關 =====
    prevMonth() {
      if (this.calendarMonth === 1) {
        this.calendarMonth = 12;
        this.calendarYear -= 1;
      } else {
        this.calendarMonth -= 1;
      }
    },
    nextMonth() {
      if (this.calendarMonth === 12) {
        this.calendarMonth = 1;
        this.calendarYear += 1;
      } else {
        this.calendarMonth += 1;
      }
    },
    selectDateFromCalendar(cell) {
      if (!cell) return;
      this.selectedDate = cell.dateStr;
      // 順便載入這天的不開放設定（不影響只是多資訊）
      this.loadDateState();
    },

    normalizeSlots(booking) {
      if (Array.isArray(booking.timeSlots)) return booking.timeSlots;
      if (booking.timeSlot) return [booking.timeSlot];
      return [];
    },
    serviceTitle(serviceId) {
      const s = this.services.find((s) => s.id === serviceId);
      return s ? s.title : serviceId || "-";
    },
    formatDateTime(iso) {
      if (!iso) return "-";
      try {
        const d = new Date(iso);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
      } catch {
        return iso;
      }
    },
    async updateStatus(booking) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/bookings/${encodeURIComponent(
            booking.id
          )}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-admin-token": this.adminToken,
            },
            body: JSON.stringify({ status: booking.status }),
          }
        );

        if (!res.ok) {
          throw new Error("更新狀態失敗");
        }
      } catch (err) {
        console.error(err);
        alert("更新狀態時發生錯誤");
      }
    },
    async removeBooking(booking) {
      if (!confirm(`確定要刪除 ${booking.name} 的預約嗎？`)) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/bookings/${encodeURIComponent(
            booking.id
          )}`,
          {
            method: "DELETE",
            headers: {
              "x-admin-token": this.adminToken,
            },
          }
        );

        if (!res.ok) {
          throw new Error("刪除失敗");
        }

        this.bookings = this.bookings.filter((b) => b.id !== booking.id);
      } catch (err) {
        console.error(err);
        alert("刪除預約時發生錯誤");
      }
    },
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
  max-width: 1000px;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

h2 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 6px;
  color: #333;
}

.subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.4;
}

.small-subtitle {
  text-align: left;
  margin-bottom: 8px;
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

input {
  padding: 8px 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}

input:focus {
  border-color: #888;
}

button {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  background: #333;
  color: #888;
}

button:hover {
  opacity: 0.92;
}

.error {
  color: #d32f2f;
  font-size: 12px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.tab-btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
}

.tab-btn.active {
  background: #333;
  color: #fff;
}

/* 不開放設定：時段卡片 */
.slots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.slot-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #ddd;
  background: #fafafa;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;
}

.slot-chip.open:hover {
  background: #f0f7ff;
  border-color: #90caf9;
  box-shadow: 0 0 0 2px rgba(144, 202, 249, 0.3);
}

.slot-chip.blocked {
  background: #fff3f3;
  border-color: #ffcdd2;
}

.slot-chip input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.slot-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-time {
  white-space: nowrap;
}

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

.blocked-tag {
  background: rgba(198, 40, 40, 0.12);
  color: #b71c1c;
}

.json-preview {
  max-height: 180px;
  overflow: auto;
  background: #fafafa;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  border: 1px solid #eee;
}

/* 預約管理表格 */
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.table-wrapper {
  overflow-x: auto;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.booking-table th,
.booking-table td {
  border: 1px solid #eee;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.booking-table thead {
  background: #f5f5f5;
}

.timechips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  padding: 2px 6px;
  border-radius: 999px;
  background: #e3f2fd;
  color: #1565c0;
  font-size: 11px;
}

.status-select {
  font-size: 12px;
  padding: 4px 6px;
}

.danger-btn {
  background: #c62828;
  font-size: 12px;
  padding: 6px 10px;
}

.danger-btn:hover {
  background: #b71c1c;
}

.contact-cell {
  max-width: 180px;
  white-space: pre-wrap;
  word-break: break-word;
}
/*=====行事曆樣式======*/
.calendar-panel {
  margin-bottom: 16px;
  border-radius: 8px;
  background: #fafafa;
  padding: 12px;
  border: 1px solid #eee;
}

.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.calendar-header button {
  padding: 4px 8px;
  font-size: 14px;
}

.calendar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: center;
}

.calendar-table th,
.calendar-table td {
  border: 1px solid #eee;
  width: 14.28%;
  height: 52px;
  padding: 0;
}

.calendar-cell {
  cursor: pointer;
}

.calendar-cell .cell-inner {
  width: 100%;
  height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day-number {
  font-size: 13px;
}

.cell-tags {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.tag {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 999px;
}

.calendar-cell.is-selected {
  background: #e3f2fd;
}

.calendar-cell.is-today {
  outline: 1px solid #1976d2;
}

.calendar-cell.has-bookings .day-number {
  font-weight: 600;
}

.calendar-cell.is-blocked-day {
  background: #fff3f3;
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  margin-top: 6px;
  align-items: center;
}

.legend-box {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 4px;
}

.legend-open {
  background: #e3f2fd;
}

.legend-blocked {
  background: #ffcdd2;
}
</style>
