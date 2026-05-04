<template>
  <div id="app" class="app-shell">
    <header class="app-header">
      <!-- 
  ==========================================================
  ✅ Step 1：品牌標題旁加社群 icon
  目的：
  - 梵和易學標題維持 router-link（回首頁）
  - 右側加一排小 icon（FB / IG / Threads / LINE）
  - icon 用「純 CSS 圓形字母」先頂著（不需要先找圖片檔）
  ==========================================================
  -->
      <div class="brand-area">
        <router-link to="/" class="brand-title"> 梵和易學 </router-link>

        <!-- ✅ 社群 icon（先用字母版，之後你要換成圖檔也很容易） -->
        <div class="brand-social">
          <a
            class="social-icon ig"
            href="https://www.instagram.com/chen_yi678/"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
            title="Instagram"
          >
            IG
          </a>

          <a
            class="social-icon fb"
            href="https://www.facebook.com/share/1AbFh6oPjv/"
            target="_blank"
            rel="noopener"
            aria-label="Facebook"
            title="Facebook"
          >
            FB
          </a>

          <a
            class="social-icon th"
            href="https://www.threads.net/@chen_yi678"
            target="_blank"
            rel="noopener"
            aria-label="Threads"
            title="Threads"
          >
            @
          </a>

          <a
            class="social-icon line"
            href="https://line.me/R/ti/p/@415kfyus"
            target="_blank"
            rel="noopener"
            aria-label="官方LINE"
            title="官方LINE"
          >
            Line
          </a>
        </div>
      </div>

      <!-- 右側導覽列（你原本的 nav-links 不動） -->
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首頁</router-link>
        <router-link to="/articles" class="nav-link">文章列表</router-link>
        <router-link to="/about" class="nav-link">服務項目</router-link>
        <router-link to="/booking" class="nav-link">預約論命</router-link>
        <!--<router-link to="/admin" class="nav-link">後台</router-link>-->
      </nav>
    </header>

    <!-- 主內容 + 背景層 -->
    <main class="app-main">
      <div class="bg-layer"></div>
      <div class="content-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* 全局背景（有一點封面感） */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  background-image: url("@/assets/home-chenyi-bg.jpg");
  background-size: cover; /* 適應螢幕鋪滿 */
  background-position: center; /* 水墨圖置中 */
  background-repeat: no-repeat; /* 不重複 */
  background-attachment: fixed; /* 捲動時背景固定不動（視差） */
}

/* App 外框 */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 頂部導覽列 */
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-area {
  display: flex;
  align-items: center; /* 垂直置中 */
  gap: 10px; /* 標題和 icon 的距離 */
}

.brand-title {
  font-size: 20px;
  font-weight: 600;
  color: rgb(52, 49, 49);
}

/* 
==========================================================
✅ Step 1：品牌旁社群 icon 排版
目的：
- 標題與 icon 同一排
- icon 小顆、不搶戲，但可點
==========================================================
*/
.brand-area {
  display: flex;
  align-items: center;
  gap: 10px; /* 標題跟 icon 的距離 */
}

.brand-social {
  display: inline-flex;
  align-items: center;
  gap: 8px; /* icon 間距 */
}

/* 
==========================================================
✅ icon 基本外觀（先用字母版）
目的：
- 圓形小顆、可 hover
- 不用先找圖檔
==========================================================
*/
.social-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;

  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.75);
  color: #333;

  transition: transform 0.08s ease, background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.social-icon:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

/* 
==========================================================
✅ 微微做出平台差異（很淡就好）
目的：一眼看得出誰是誰，但不花
==========================================================
*/
.social-icon.ig {
  border-color: rgba(225, 48, 108, 0.35);
}
.social-icon.fb {
  border-color: rgba(24, 119, 242, 0.35);
}
.social-icon.th {
  border-color: rgba(0, 0, 0, 0.22);
}
.social-icon.line {
  border-color: rgba(0, 195, 0, 0.35);
}

.brand-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  color: #444;
  transition: background-color 0.15s ease, color 0.15s ease,
    transform 0.05s ease;
}

/* 目前所在頁面 */
.nav-link.router-link-exact-active,
.nav-link.router-link-active {
  background: #333;
  color: #fff;
}

.nav-link:hover {
  background: rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

/* 主內容區 + 柔和背景層 */
.app-main {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 32px 16px 40px;
}

.bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
      circle at top left,
      rgba(255, 255, 255, 0.9),
      transparent 55%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(255, 255, 255, 0.9),
      transparent 55%
    );
  opacity: 0.95;
}

.content-container {
  position: relative;
  width: 100%;
  max-width: 1100px;
}

/* 手機排版 */
@media (max-width: 640px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;
  }

  .nav-link {
    padding: 4px 10px;
    font-size: 13px;
  }
}
</style>
