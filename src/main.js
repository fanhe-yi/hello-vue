import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

/* =========================
  【建立 App】
  目的：先把 app 存成變數，後面才能在 mount 前做額外設定
========================== */
const app = createApp(App);

/* =========================
  【註冊 Router】
========================== */
app.use(router);

/* =========================
  【Prerender 保險】全域 dispatch x-app-rendered
  目的：
  - 避免某個 View 忘了 dispatch 導致 prerender 卡死
  - 每次路由切換完成後，通知 prerender：可以存 HTML 了
  備註：
  - Promise.resolve() 讓事件在 microtask 後發出（接近 nextTick 效果）
  - setTimeout 再補一刀，防止極少數狀況沒觸發到
========================== */
router.afterEach(() => {
  Promise.resolve().then(() => {
    document.dispatchEvent(new Event("x-app-rendered"));
  });

  setTimeout(() => {
    document.dispatchEvent(new Event("x-app-rendered"));
  }, 300);
});

/* =========================
  【掛載】
========================== */
app.mount("#app");
