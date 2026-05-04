/* =========================
  vue.config.js（固定穩定版）
  目的：
  1) npm run build 穩定完成
  2) SEO prerender 改走 node scripts/prerender.js（不走 webpack plugin）
========================== */

const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  /* =========================
    【保留】你原本就有的設定
  ========================== */
  transpileDependencies: true,

  /* =========================
    【關掉多執行緒】避免 terser 壓縮階段卡死
  ========================== */
  parallel: false,

  /* =========================
    【關掉 production sourcemap】避免生成 map 太慢像卡住
  ========================== */
  productionSourceMap: false,
});
