<template>
  <div id="app" class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <!-- 品牌區 -->
        <div class="brand-area">
          <router-link to="/" class="brand-title" @click="closeMenu">
            <span class="brand-mark" aria-hidden="true">梵</span>
            <span class="brand-name">梵和易學</span>
          </router-link>

          <!-- 桌面：社群 icon（SVG 版） -->
          <div class="brand-social">
            <a
              class="social-icon ig"
              href="https://www.instagram.com/chen_yi678/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a
              class="social-icon fb"
              href="https://www.facebook.com/share/1AbFh6oPjv/"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
              </svg>
            </a>
            <a
              class="social-icon th"
              href="https://www.threads.net/@chen_yi678"
              target="_blank"
              rel="noopener"
              aria-label="Threads"
              title="Threads"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.78 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.323.144 1.504.708 2.604 1.78 3.183 3.103.808 1.847.883 4.857-1.56 7.292-1.866 1.86-4.131 2.69-7.295 2.71Zm1.376-8.692c.323 0 .65-.014.985-.043 1.418-.123 2.354-.59 2.7-2.014a8.082 8.082 0 0 0-2.564-.234c-.806.045-1.479.276-1.93.622-.383.293-.578.69-.553 1.114.05.913.886 1.555 2.027 1.555.4 0 .79-.04 1.176-.117l.159-.038Z"/>
              </svg>
            </a>
            <a
              class="social-icon line"
              href="https://line.me/R/ti/p/@415kfyus"
              target="_blank"
              rel="noopener"
              aria-label="官方LINE"
              title="官方LINE"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- 桌面 nav -->
        <nav class="nav-links">
          <router-link to="/" class="nav-link">首頁</router-link>
          <router-link to="/articles" class="nav-link">文章列表</router-link>
          <router-link to="/about" class="nav-link">服務項目</router-link>
          <router-link to="/booking" class="nav-link nav-link-cta">預約論命</router-link>
        </nav>

        <!-- 手機 hamburger -->
        <button
          class="menu-toggle"
          :class="{ open: menuOpen }"
          @click="toggleMenu"
          aria-label="選單"
          :aria-expanded="menuOpen"
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- 手機展開選單 -->
      <transition name="drawer">
        <div v-show="menuOpen" class="mobile-drawer">
          <nav class="mobile-nav" @click="closeMenu">
            <router-link to="/" class="mobile-link">首頁</router-link>
            <router-link to="/articles" class="mobile-link">文章列表</router-link>
            <router-link to="/about" class="mobile-link">服務項目</router-link>
            <router-link to="/booking" class="mobile-link mobile-link-cta">
              預約論命 →
            </router-link>
          </nav>
          <div class="mobile-social">
            <a class="social-icon ig" href="https://www.instagram.com/chen_yi678/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            <a class="social-icon fb" href="https://www.facebook.com/share/1AbFh6oPjv/" target="_blank" rel="noopener" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
            </a>
            <a class="social-icon th" href="https://www.threads.net/@chen_yi678" target="_blank" rel="noopener" aria-label="Threads">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.78 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.323.144 1.504.708 2.604 1.78 3.183 3.103.808 1.847.883 4.857-1.56 7.292-1.866 1.86-4.131 2.69-7.295 2.71Zm1.376-8.692c.323 0 .65-.014.985-.043 1.418-.123 2.354-.59 2.7-2.014a8.082 8.082 0 0 0-2.564-.234c-.806.045-1.479.276-1.93.622-.383.293-.578.69-.553 1.114.05.913.886 1.555 2.027 1.555.4 0 .79-.04 1.176-.117l.159-.038Z"/></svg>
            </a>
            <a class="social-icon line" href="https://line.me/R/ti/p/@415kfyus" target="_blank" rel="noopener" aria-label="LINE">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            </a>
          </div>
        </div>
      </transition>
    </header>

    <!-- 主內容 -->
    <main class="app-main">
      <div class="content-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return { menuOpen: false };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
  },
  watch: {
    $route() {
      this.menuOpen = false;
    },
  },
};
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
}

/* ============================================
   全局背景：純 CSS 宣紙 + 水墨暈染
   - 不用 background-attachment: fixed（iOS/LIFF/Threads 不支援好）
   - 用 fixed positioned ::before 達到視差效果，但相容性好
   ============================================ */
body {
  font-family: "LXGW WenKai", "Noto Serif SC", -apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif;
  color: #2a1f1a;
  background:
    /* 角落水墨暈染 */
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(60, 40, 25, 0.08), transparent 55%),
    radial-gradient(ellipse 70% 55% at 100% 100%, rgba(167, 133, 80, 0.10), transparent 55%),
    radial-gradient(ellipse 60% 50% at 100% 0%, rgba(185, 58, 50, 0.04), transparent 55%),
    /* 米白宣紙底 */
    linear-gradient(180deg, #faf6ee 0%, #f5ede0 100%);
  background-attachment: scroll; /* 不用 fixed，避免 iOS 破圖 */
  min-height: 100vh;
  min-height: 100dvh; /* 支援的瀏覽器用 dvh，避免工具列遮擋 */
}

/* 紙紋細微噪點（純 CSS，無圖檔） */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(rgba(60, 40, 25, 0.025) 1px, transparent 1px);
  background-size: 3px 3px;
  opacity: 0.6;
}

/* ============================================
   App 外框
   ============================================ */
.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  /* 支援 iPhone 瀏海與底部小白條 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ============================================
   Header
   ============================================ */
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(250, 246, 238, 0.85);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  backdrop-filter: blur(14px) saturate(1.2);
  border-bottom: 1px solid rgba(60, 40, 25, 0.08);
  /* iPhone 瀏海安全區 */
  padding-top: env(safe-area-inset-top);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.brand-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #2a1f1a;
  transition: opacity 0.2s ease;
}

.brand-title:hover { opacity: 0.75; }

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #b93a32, #962820);
  color: #fff8f0;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  font-size: 17px;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(185, 58, 50, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  transform: rotate(-3deg);
  flex-shrink: 0;
}

.brand-name {
  font-family: "Noto Serif SC", serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

/* 社群 icon */
.brand-social {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.social-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1px solid rgba(60, 40, 25, 0.16);
  background: rgba(255, 255, 255, 0.7);
  color: #4a423b;
  transition: transform 0.18s ease, background-color 0.18s ease,
    box-shadow 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.social-icon svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  display: block;
  transition: transform 0.2s ease;
}

.social-icon:hover,
.social-icon:active {
  transform: translateY(-2px);
  background: #fff;
  box-shadow: 0 6px 14px rgba(60, 40, 25, 0.12);
}

.social-icon:hover svg {
  transform: scale(1.08);
}

/* IG：彩色漸層 hover（接近官方 IG 漸層） */
.social-icon.ig:hover {
  color: #fff;
  background: linear-gradient(135deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888);
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(220, 39, 67, 0.32);
}

.social-icon.fb:hover {
  color: #fff;
  background: #1877f2;
  border-color: #1877f2;
  box-shadow: 0 6px 14px rgba(24, 119, 242, 0.32);
}

.social-icon.th:hover {
  color: #fff;
  background: #000;
  border-color: #000;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.28);
}

.social-icon.line:hover {
  color: #fff;
  background: #06c755;
  border-color: #06c755;
  box-shadow: 0 6px 14px rgba(6, 199, 85, 0.32);
}

/* 桌面 nav */
.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 999px;
  color: #4a423b;
  font-family: "Noto Serif SC", serif;
  font-weight: 500;
  letter-spacing: 0.04em;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  background: rgba(60, 40, 25, 0.06);
  color: #2a1f1a;
}

.nav-link.router-link-exact-active {
  background: rgba(60, 40, 25, 0.08);
  color: #2a1f1a;
  font-weight: 600;
}

/* 預約論命 = CTA 樣式 */
.nav-link-cta {
  background: linear-gradient(135deg, #b93a32, #962820);
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(185, 58, 50, 0.25);
}
.nav-link-cta:hover {
  background: linear-gradient(135deg, #c4423a, #a32e26);
  box-shadow: 0 6px 16px rgba(185, 58, 50, 0.35);
  transform: translateY(-1px);
}
.nav-link-cta.router-link-exact-active {
  background: linear-gradient(135deg, #962820, #7d1f18);
  color: #fff;
}

/* ============================================
   Hamburger menu
   ============================================ */
.menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid rgba(60, 40, 25, 0.15);
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.menu-toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: #2a1f1a;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.menu-toggle.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.menu-toggle.open span:nth-child(2) {
  opacity: 0;
}
.menu-toggle.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 手機展開抽屜 */
.mobile-drawer {
  border-top: 1px solid rgba(60, 40, 25, 0.08);
  background: rgba(250, 246, 238, 0.96);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  padding: 14px 16px 18px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
}
.drawer-enter-from,
.drawer-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.drawer-enter-to,
.drawer-leave-from {
  max-height: 400px;
  opacity: 1;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  font-family: "Noto Serif SC", serif;
  font-size: 17px;
  color: #2a1f1a;
  padding: 14px 12px;
  border-radius: 10px;
  min-height: 48px; /* 觸控友善 */
  transition: background 0.15s ease;
}

.mobile-link:active,
.mobile-link.router-link-exact-active {
  background: rgba(60, 40, 25, 0.06);
}

.mobile-link-cta {
  margin-top: 6px;
  background: linear-gradient(135deg, #b93a32, #962820);
  color: #fff !important;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(185, 58, 50, 0.25);
}

.mobile-social {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(60, 40, 25, 0.1);
}

.mobile-social .social-icon {
  width: 44px;
  height: 44px;
}

.mobile-social .social-icon svg {
  width: 20px;
  height: 20px;
}

/* ============================================
   主內容
   ============================================ */
.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 24px 16px 48px;
}

.content-container {
  position: relative;
  width: 100%;
  max-width: 1100px;
}

/* ============================================
   RWD - 手機 (含 LIFF / Threads webview)
   ============================================ */
@media (max-width: 768px) {
  .nav-links,
  .brand-social {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }

  .header-inner {
    padding: 10px 14px;
  }

  .brand-mark {
    width: 28px;
    height: 28px;
    font-size: 15px;
  }

  .brand-name {
    font-size: 17px;
  }

  .app-main {
    padding: 16px 10px 32px;
  }
}
</style>
