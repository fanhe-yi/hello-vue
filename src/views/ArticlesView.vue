<template>
  <div class="articles-page">
    <!-- =========================
      【區塊】頁面主卡
      目的：維持你 Home/About 的「半透明卡片」視覺一致
    ========================== -->
    <div class="card page-card">
      <!-- 【SEO/可讀性】用 H1 當主標題（之後預渲染會吃到） -->
      <h1 class="title">文章</h1>
      <p class="subtitle">放一些我想寫的內容：命理、生活、工作、碎念。</p>
      <!-- =========================================================
        ✅ Step 3-6.2 / Tag 篩選列
        目的：
        - 讓使用者可以一鍵只看「紫微 / 八字 / 姓名學 / 風水」等文章
        ========================================================= -->
      <div class="tagbar">
        <!-- ✅ 全部 -->
        <button
          class="tagbtn"
          :class="{ active: activeTag === '' }"
          @click="activeTag = ''"
        >
          全部
        </button>

        <!-- ✅ 動態產生：由文章列表自動彙整 tags -->
        <button
          v-for="t in tagOptions"
          :key="t"
          class="tagbtn"
          :class="{ active: activeTag === t }"
          @click="activeTag = t"
        >
          {{ t }}
        </button>
      </div>
      <!-- =========================
        【區塊】文章列表（暫時假資料）
        目的：先把 UI 長相確立；下一步再接「真資料來源」
      ========================== -->
      <div class="list">
        <router-link
          v-for="a in filteredArticles"
          :key="a.slug"
          class="item"
          :to="`/articles/${a.slug}`"
        >
          <div class="item-head">
            <h2 class="item-title">{{ a.title }}</h2>
            <span class="item-date">{{ a.date }}</span>
          </div>
          <p class="item-excerpt">{{ a.excerpt }}</p>

          <!-- 【小UX】用 tag 讓列表更像「內容系統」 -->
          <div class="tags">
            <span v-for="t in a.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArticlesView",
  data() {
    return {
      /* =========================================================
        ✅ Step 3-6.1B / 列表資料（改由 API 取得）
        目的：
        - 前台不需 rebuild 就能看到後台新增的文章
        - 只顯示 published（後端已做安全過濾）
      ========================================================== */
      articles: [],

      /* =========================
        ✅ 狀態（避免畫面空白）
      ========================== */
      loading: false,
      error: "",

      /* =========================================================
        ✅ Step 3-6.2 / 目前選到的 tag
        目的：
        - 點選 tag 後只顯示該類文章（紫微/八字/姓名學/風水...）
      ========================================================== */
      activeTag: "",

      /* =========================================================
        ✅ Step 3-6.2 / Tag 選項（由文章彙整而來）
        目的：
        - 後台新增新 tag，前台會自動出現，不用手動維護
      ========================================================== */
      tagOptions: [],
    };
  },

  /* =========================
    ✅ 進頁面就抓文章列表
  ========================== */
  async created() {
    await this.fetchArticles();
  },

  /* =========================
    ✅ Prerender 通知（列表也需要）
  ========================== */
  mounted() {
    this.$nextTick(() => {
      document.dispatchEvent(new Event("x-app-rendered"));
    });
  },

  computed: {
    /* =========================================================
      ✅ Step 3-6.2 / 篩選後的文章列表
      規則：
      - activeTag 空字串：顯示全部
      - activeTag 有值：只顯示包含該 tag 的文章
      用途：
      - template 的 v-for 要改用 filteredArticles
    ========================================================== */
    filteredArticles() {
      if (!this.activeTag) return this.articles || [];
      return (this.articles || []).filter(
        (a) => Array.isArray(a.tags) && a.tags.includes(this.activeTag),
      );
    },
  },

  methods: {
    /* ==========================================================
      ✅ 抓文章列表（published）
      目的：
      - 將 API 回來的 items 映射成你 UI 用的欄位
      - excerpt 改吃 description（你列表原本用 excerpt）
      - 取回後順便彙整 tagOptions
    ========================================================== */
    async fetchArticles() {
      this.loading = true;
      this.error = "";

      try {
        /* =========================
          ✅ 文章列表 API
        ========================== */
        const res = await fetch("https://api.chen-yi.tw/api/articles");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }

        /* =========================
          ✅ 映射資料
          - excerpt：用 description
        ========================== */
        this.articles = (data.items || []).map((a) => ({
          slug: a.slug,
          title: a.title,
          date: a.date,
          excerpt: a.description || "",
          tags: a.tags || [],
        }));

        /* =========================================================
          ✅ Step 3-6.2 / 彙整 tagOptions
          目的：
          - 後台新增新 tag → 前台自動出現
          - 用 Set 去重
        ========================================================== */
        const set = new Set();
        (this.articles || []).forEach((a) => {
          (a.tags || []).forEach((t) => set.add(t));
        });
        this.tagOptions = Array.from(set);

        /* =========================================================
          ✅ UX：如果目前 activeTag 已經不存在（例如文章刪掉了）
          - 就自動回到「全部」
        ========================================================== */
        if (this.activeTag && !this.tagOptions.includes(this.activeTag)) {
          this.activeTag = "";
        }

        /* =========================
          ✅ 告訴 prerender：列表資料已進 DOM
        ========================== */
        this.$nextTick(() => {
          document.dispatchEvent(new Event("x-app-rendered"));
        });
      } catch (err) {
        this.error = String(err?.message || err || "FETCH_FAILED");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* =========================
  【版面】置中與留白
  目的：延續你 Home/About 的「中央卡片」視覺
========================== */
.articles-page {
  display: flex;
  justify-content: center;
  padding: 32px 12px 24px;
}

/* =========================
  【卡片】半透明 + 圓角 + 陰影
  目的：跟 HomeView 的 card 系統一致（先用相近設定）
========================== */
.card {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  padding: 28px 26px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  width: min(1000px, 100%);
}

.title {
  margin: 0 0 6px;
  font-size: 26px;
  color: #31241f;
}

.subtitle {
  margin: 0 0 18px;
  font-size: 14px;
  line-height: 1.7;
  color: #5b544d;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* =========================
  【列表項目】做成可點擊卡片
  目的：不走 Word；用內容產品的 UI/UX 方式進入文章
========================== */
.item {
  display: block;
  text-decoration: none;
  padding: 14px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.05s ease, box-shadow 0.12s ease;
}

.item:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.item-head {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
}

.item-title {
  margin: 0;
  font-size: 17px;
  color: #333;
}

.item-date {
  font-size: 12px;
  color: #7a736b;
}

.item-excerpt {
  margin: 8px 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #4a433d;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(185, 58, 50, 0.08);
  border: 1px solid rgba(185, 58, 50, 0.18);
  color: #6b2b26;
}

/* =========================================================
  ✅ Step 3-6.2 / Tag 篩選列
========================================================= */
.tagbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 16px;
}

.tagbtn {
  appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  color: #4a433d;
  cursor: pointer;
  transition: transform 0.05s ease, box-shadow 0.12s ease;
}

.tagbtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}

.tagbtn.active {
  border-color: rgba(185, 58, 50, 0.28);
  background: rgba(185, 58, 50, 0.1);
  color: #6b2b26;
}
</style>
