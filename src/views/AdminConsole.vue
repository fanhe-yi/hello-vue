<template>
  <div class="admin-page">
    <div class="admin-card">
      <h2>梵和易學｜後台管理</h2>
      <p class="subtitle">這裡只有你看得到，用來管理預約與不開放時段。</p>

      <!-- 未登入：顯示登入區 -->
      <div v-if="!loggedIn" class="login-section">
        <label class="field">
          後台密碼（Admin Token）：
          <input
            v-model="adminTokenInput"
            type="password"
            placeholder="請輸入後台密碼"
          />
        </label>
        <button @click="login" :disabled="loginLoading">
          {{ loginLoading ? "登入中..." : "登入後台" }}
        </button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </div>

      <!-- 已登入：顯示後台內容 -->
      <div v-else class="console-section">
        <div class="console-header">
          <span class="welcome">已登入後台</span>
          <button class="outline" @click="logout">登出</button>
        </div>

        <section class="panel">
          <h3>不開放日期 / 時段設定（unavailable.json）</h3>
          <p class="hint">
            目前先簡單顯示 raw JSON，有需要我們之後可以做成 UI 勾選版。
          </p>

          <div class="json-block">
            <pre>{{ formattedUnavailable }}</pre>
          </div>

          <label class="field">
            直接編輯 JSON 後儲存：
            <textarea
              v-model="unavailableJsonText"
              rows="8"
              placeholder='例如：{"fullDay":["2025-12-31"],"slots":[...]}'
            ></textarea>
          </label>

          <button @click="saveUnavailable" :disabled="saveUnavailableLoading">
            {{ saveUnavailableLoading ? "儲存中..." : "儲存不開放設定" }}
          </button>
          <p v-if="saveUnavailableError" class="error">
            {{ saveUnavailableError }}
          </p>
          <p v-if="saveUnavailableSuccess" class="success">
            不開放設定已儲存 ✅
          </p>
        </section>

        <section class="panel">
          <h3>預約列表（bookings.json）</h3>
          <p class="hint">目前顯示所有預約，依日期排序。</p>

          <div v-if="bookingsLoading">載入中...</div>
          <div v-else-if="bookings.length === 0" class="empty">
            目前尚無任何預約。
          </div>
          <div v-else class="bookings-list">
            <div v-for="b in bookings" :key="b.id" class="booking-item">
              <div class="booking-main">
                <div class="booking-row">
                  <span class="badge">{{ b.status || "pending" }}</span>
                  <span class="date">{{ b.date }}</span>
                  <span class="time">
                    {{
                      Array.isArray(b.timeSlots)
                        ? b.timeSlots.join("、")
                        : b.timeSlot
                    }}
                  </span>
                </div>
                <div class="booking-row">
                  <strong>{{ b.name }}</strong>
                  <span class="contact">{{ b.contact }}</span>
                </div>
                <div class="booking-row" v-if="b.serviceId">
                  <span class="tag">項目：{{ b.serviceId }}</span>
                </div>
                <div class="booking-row" v-if="b.note">
                  <span class="note-label">備註：</span>
                  <span class="note-text">{{ b.note }}</span>
                </div>
              </div>
              <div class="booking-actions">
                <select v-model="b._pendingStatus">
                  <option value="pending">待處理</option>
                  <option value="done">已完成</option>
                  <option value="canceled">已取消</option>
                </select>
                <button @click="updateBookingStatus(b)">更新狀態</button>
                <button class="danger" @click="deleteBooking(b)">刪除</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
const API_BASE_URL =
  process.env.VUE_APP_API_BASE_URL || "http://localhost:3000";

export default {
  name: "AdminConsole",
  data() {
    return {
      loggedIn: false,
      adminTokenInput: "",
      loginError: "",
      loginLoading: false,

      unavailable: null,
      unavailableJsonText: "",
      saveUnavailableLoading: false,
      saveUnavailableError: "",
      saveUnavailableSuccess: false,

      bookings: [],
      bookingsLoading: false,
    };
  },
  computed: {
    formattedUnavailable() {
      if (!this.unavailable) return "(尚未載入)";
      try {
        return JSON.stringify(this.unavailable, null, 2);
      } catch {
        return String(this.unavailable);
      }
    },
  },
  methods: {
    // 讀 localStorage 既有 token（頁面 reload 後可沿用）
    getStoredToken() {
      return localStorage.getItem("adminToken") || "";
    },

    storeToken(token) {
      localStorage.setItem("adminToken", token);
    },

    clearToken() {
      localStorage.removeItem("adminToken");
    },

    // ====== 登入流程 ======
    async login() {
      this.loginError = "";
      this.loginLoading = true;
      this.saveUnavailableSuccess = false;

      const token = this.adminTokenInput.trim();
      if (!token) {
        this.loginError = "請輸入後台密碼。";
        this.loginLoading = false;
        return;
      }

      try {
        // 用 unavailable 這支 API 驗證 token
        const res = await fetch(`${API_BASE_URL}/api/admin/unavailable`, {
          headers: {
            "x-admin-token": token,
          },
        });

        if (!res.ok) {
          throw new Error("未授權");
        }

        const data = await res.json();
        this.unavailable = data;
        this.unavailableJsonText = JSON.stringify(data, null, 2);

        this.storeToken(token);
        this.loggedIn = true;

        // 登入成功後順便載入預約列表
        this.fetchBookings();
      } catch (err) {
        console.error(err);
        this.loginError = "登入失敗，請確認密碼是否正確。";
        this.clearToken();
        this.loggedIn = false;
      } finally {
        this.loginLoading = false;
      }
    },

    async autoLoginIfTokenExists() {
      const token = this.getStoredToken();
      if (!token) return;

      // 靜默嘗試一次
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/unavailable`, {
          headers: {
            "x-admin-token": token,
          },
        });
        if (!res.ok) {
          throw new Error("未授權");
        }
        const data = await res.json();
        this.unavailable = data;
        this.unavailableJsonText = JSON.stringify(data, null, 2);
        this.loggedIn = true;
        this.fetchBookings();
      } catch (err) {
        console.warn("既有 token 已失效，請重新登入");
        this.clearToken();
        this.loggedIn = false;
      }
    },

    logout() {
      this.clearToken();
      this.loggedIn = false;
      this.adminTokenInput = "";
      this.unavailable = null;
      this.unavailableJsonText = "";
      this.bookings = [];
    },

    // ====== 不開放設定 ======
    async saveUnavailable() {
      this.saveUnavailableError = "";
      this.saveUnavailableSuccess = false;
      this.saveUnavailableLoading = true;

      const token = this.getStoredToken();
      if (!token) {
        this.saveUnavailableError = "尚未登入，請先登入後再儲存。";
        this.saveUnavailableLoading = false;
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(this.unavailableJsonText);
      } catch (err) {
        this.saveUnavailableError = "JSON 格式有誤，請確認再試。";
        this.saveUnavailableLoading = false;
        return;
      }

      const body = {
        fullDay: Array.isArray(parsed.fullDay) ? parsed.fullDay : [],
        slots: Array.isArray(parsed.slots) ? parsed.slots : [],
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/unavailable`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error("儲存失敗");
        }

        this.unavailable = body;
        this.saveUnavailableSuccess = true;
      } catch (err) {
        console.error(err);
        this.saveUnavailableError = "儲存失敗，請稍後再試。";
      } finally {
        this.saveUnavailableLoading = false;
      }
    },

    // ====== 預約列表 ======
    async fetchBookings() {
      this.bookingsLoading = true;
      const token = this.getStoredToken();
      if (!token) {
        this.bookingsLoading = false;
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
          headers: {
            "x-admin-token": token,
          },
        });

        if (!res.ok) throw new Error("讀取預約失敗");

        const list = await res.json();
        // 幫每筆預設一個 _pendingStatus（UI 用）
        list.forEach((b) => {
          b._pendingStatus = b.status || "pending";
        });
        this.bookings = list;
      } catch (err) {
        console.error(err);
      } finally {
        this.bookingsLoading = false;
      }
    },

    async updateBookingStatus(b) {
      const token = this.getStoredToken();
      if (!token) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/bookings/${b.id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-admin-token": token,
            },
            body: JSON.stringify({ status: b._pendingStatus }),
          }
        );

        if (!res.ok) throw new Error("更新失敗");

        const result = await res.json();
        b.status = result.booking.status;
        alert("狀態已更新");
      } catch (err) {
        console.error(err);
        alert("更新失敗，請稍後再試");
      }
    },

    async deleteBooking(b) {
      const token = this.getStoredToken();
      if (!token) return;

      if (!confirm(`確定要刪除「${b.name} - ${b.date}」這筆預約嗎？`)) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${b.id}`, {
          method: "DELETE",
          headers: {
            "x-admin-token": token,
          },
        });

        if (!res.ok) throw new Error("刪除失敗");

        this.bookings = this.bookings.filter((x) => x.id !== b.id);
        alert("已刪除該筆預約");
      } catch (err) {
        console.error(err);
        alert("刪除失敗，請稍後再試");
      }
    },
  },
  mounted() {
    // 進入頁面時，如果 localStorage 已有 adminToken，嘗試自動登入
    this.autoLoginIfTokenExists();
  },
};
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.admin-card {
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 24px 32px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.login-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #333;
}

input,
textarea,
select {
  padding: 8px 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #888;
}

button {
  margin-top: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  border: none;
  background: #333;
  color: #fff;
}

button:hover {
  opacity: 0.92;
}

button.outline {
  background: transparent;
  color: #333;
  border: 1px solid #ccc;
}

button.outline:hover {
  background: #f5f5f5;
}

button.danger {
  background: #c62828;
  color: #fff;
}

.error {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 6px;
}

.success {
  color: #2e7d32;
  font-size: 13px;
  margin-top: 6px;
}

.console-section {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome {
  font-size: 14px;
  color: #444;
}

.panel {
  padding: 16px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
}

.panel h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.hint {
  font-size: 13px;
  color: #777;
  margin-bottom: 10px;
}

.json-block {
  background: #111827;
  color: #e5e7eb;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
  margin-bottom: 10px;
}

.json-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
}

.booking-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.booking-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #eee;
  text-transform: uppercase;
}

.date {
  font-weight: 500;
}

.time {
  color: #555;
}

.contact {
  color: #555;
}

.tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #e3f2fd;
  color: #1565c0;
}

.note-label {
  color: #777;
}

.note-text {
  color: #444;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.empty {
  font-size: 13px;
  color: #777;
}
</style>
