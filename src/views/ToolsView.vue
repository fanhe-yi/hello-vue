<template>
  <div class="tools-page">
    <section class="tools-hero">
      <p class="eyebrow">MING LI TOOLS</p>
      <h1>命理工具</h1>
      <p>
        先用簡易工具整理問題與命盤資料；需要完整判斷時，再預約老師正式解讀。
      </p>
    </section>

    <section class="tools-grid" aria-label="命理工具列表">
      <router-link class="tool-card active" to="/tools/liuyao">
        <div>
          <span class="tool-kicker">已開放</span>
          <h2>六爻卜卦</h2>
          <p>依照起卦流程擲六爻，取得卦盤與簡易 AI 解讀。</p>
        </div>
        <span class="tool-action">開始使用</span>
      </router-link>

      <router-link class="tool-card active" to="/tools/bazi">
        <div>
          <span class="tool-kicker">已開放</span>
          <h2>八字算命</h2>
          <p>選擇出生年月日與時辰，排出四柱、十神、藏干與大運概要。</p>
        </div>
        <span class="tool-action">開始排盤</span>
      </router-link>

      <router-link class="tool-card active" to="/tools/ziwei">
        <div>
          <span class="tool-kicker">已開放</span>
          <h2>紫微算命</h2>
          <p>選擇出生年月日與時辰，排出十二宮、主星、四化與大限概要。</p>
        </div>
        <span class="tool-action">開始排盤</span>
      </router-link>
    </section>
  </div>
</template>

<script>
export default {
  name: "ToolsView",
  mounted() {
    document.title = "命理工具｜梵和易學";
  },
};
</script>

<style scoped>
.tools-page {
  width: 100%;
}

.tools-hero {
  padding: 34px 4px 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #8b6f47;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.tools-hero h1 {
  margin: 0;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 1.1;
  letter-spacing: 0;
}

.tools-hero p {
  max-width: 680px;
  margin: 14px 0 0;
  color: #5d534b;
  font-size: 17px;
  line-height: 1.8;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.tool-card {
  min-height: 230px;
  padding: 20px;
  border: 1px solid rgba(92, 69, 42, 0.16);
  border-radius: 8px;
  background: rgba(255, 252, 247, 0.86);
  color: inherit;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 14px 38px rgba(65, 45, 24, 0.08);
}

.tool-card.active {
  background:
    linear-gradient(140deg, rgba(47, 122, 47, 0.12), transparent 45%),
    rgba(255, 252, 247, 0.96);
}

.tool-card.disabled {
  opacity: 0.62;
}

.tool-kicker {
  color: #8b6f47;
  font-size: 12px;
  font-weight: 700;
}

.tool-card h2 {
  margin: 10px 0 8px;
  font-size: 24px;
  letter-spacing: 0;
}

.tool-card p {
  margin: 0;
  color: #685c52;
  line-height: 1.7;
}

.tool-action {
  margin-top: 18px;
  font-weight: 700;
  color: #2f7a2f;
}

.disabled .tool-action {
  color: #8f877e;
}

@media (max-width: 860px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }

  .tool-card {
    min-height: 180px;
  }
}
</style>
