import axios from "axios";

/**
 * 全站唯一 API Client（Vite）
 * - 只在這裡讀環境變數
 * - 其他地方一律用 api.get/post/... + 相對路徑
 *
 * 你的 .env.production 請放：
 *   VITE_API_BASE_URL=https://api.chen-yi.tw/booking
 */
const baseURL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${baseURL}/`,
  timeout: 15000,
});

// （可選）token 統一處理
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
