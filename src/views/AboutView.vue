<template>
  <div class="about-page">
    <!-- ✅ 第一張：LINE 線上服務（收費項目說明） -->
    <div class="profile-container service-only" id="line-services">
      <div class="intro-box">
        <h2 class="section-title">LINE 線上服務說明</h2>

        <p class="service-text">
          以下服務為透過 <b>LINE 平台</b> 提供之線上命理文字解析服務。 使用者於
          LINE 中完成付費並提供必要資訊後，
          系統將依對應命理模型進行文字解析，並將解析結果回傳給使用者。
        </p>

        <!-- 六爻 -->
        <div class="service-block">
          <h3 class="service-title">1）六爻卦象解析（LINE 線上）</h3>
          <ul class="service-list">
            <li>
              依使用者提問內容起卦，解析卦象所呈現之過去狀態、當前情況與可能發展趨勢
            </li>
            <li>回覆方式：文字解析(老師親自解卦)</li>
            <li>費用：每次解析新台幣 <b>600 元</b></li>
          </ul>
        </div>

        <!-- 八字格局 -->
        <div class="service-block">
          <h3 class="service-title">2）八字格局解析（LINE 線上）</h3>
          <ul class="service-list">
            <li>
              依使用者提供之生辰資料，進行八字格局結構與整體命理配置之文字解析
            </li>
            <li>回覆方式：文字解析</li>
            <li>費用：每次解析新台幣 <b>99 元</b></li>
          </ul>
        </div>

        <!-- 八字合婚 -->
        <div class="service-block">
          <h3 class="service-title">3）八字合婚解析（LINE 線上）</h3>
          <ul class="service-list">
            <li>
              依雙方提供之生辰資料，進行命盤結構比對與關係互動層面之文字說明
            </li>
            <li>回覆方式：文字解析</li>
            <li>費用：每次解析新台幣 <b>99 元</b></li>
          </ul>
        </div>

        <!-- 姓名諮詢 -->
        <div class="service-block">
          <h3 class="service-title">4）姓名諮詢（LINE 線上）</h3>
          <ul class="service-list">
            <li>依命主選擇的問題，進行命盤結構諮詢與未來結果分析之文字說明</li>
            <li>回覆方式：文字解析/LINE 語音</li>
            <li>費用：每次解析新台幣 <b>600 元</b></li>
          </ul>
        </div>

        <!-- 收費與退款 -->
        <div class="service-block">
          <h3 class="service-title">收費與退款說明</h3>
          <p class="service-text">
            本頁所列之 LINE 線上服務均採單次付費制。
            使用者完成付款並送出資料後，即開始解析流程。
            因服務屬即時提供之數位文字內容，<b>付款完成後恕不提供取消或退款</b>。
          </p>
        </div>

        <!-- 免責 -->
        <div class="service-block">
          <h3 class="service-title">重要聲明</h3>
          <p class="service-text small">
            本頁所列之命理解析內容，係依命理理論與卦象象意進行文字解讀，
            並透過系統產生文字解析結果，僅供娛樂與參考，
            不構成任何形式之人生、投資、醫療或法律建議。
            所涉及之未來趨勢，為象意層面之可能發展方向，非對實際結果之保證。
          </p>
        </div>
      </div>
    </div>

    <!-- ✅ 第二張：關於我 -->
    <div class="profile-container about-card">
      <!-- 左側：照片 -->
      <div class="photo-box">
        <img src="@/assets/casper-profile.jpg" alt="梵和易學" />
      </div>

      <!-- 右側：文字介紹 -->
      <div class="intro-box">
        <!----<h1 class="name-title">陳逸</h1>
        <p class="subtitle">梵和易學創辦人｜命理解盤師｜關於我 / 服務說明</p>
        -->
        <p class="description">
          我相信，命盤不是用來判斷一個人，而是幫助你理解自己，整理當下的困惑，
          找出最適合你此刻的路。
        </p>

        <p class="description">
          我的解盤方式重視心理狀態與現實條件，不追求制式命理語言，
          也不會用「你就是怎樣的人」把你定義住。
          我們會一起釐清問題、看懂命盤訊息、整合你的資源與限制，
          轉化成可行的方向與選項。
        </p>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">擅長主題</div>
            <div class="info-text">
              人生定位、關係互動、職涯選擇、創業方向、居家佈局
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">使用工具</div>
            <div class="info-text">
              紫微斗數｜四柱八字｜姓名學｜易經卦象｜風水佈局
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">解盤方式</div>
            <div class="info-text">線上視訊｜文字解析｜LINE 線上服務</div>
          </div>
          <div class="service-block contact-block">
            <p class="service-text">聯絡方式：<b>fanhe.chenyi@gmail.com</b></p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA 放最底，兩張卡看完後再引導 -->
    <router-link class="booking-btn" to="/booking">
      想了解自己目前的節奏 👉 預約解盤
    </router-link>
  </div>
</template>

<script>
export default {
  name: "AboutView",

  /* =========================
    【Prerender 通知】
  ========================== */
  mounted() {
    this.$nextTick(() => {
      document.dispatchEvent(new Event("x-app-rendered"));
    });
  },
};
</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 40px 0;
}

/* 卡片 container（共用） */
.profile-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1000px;
  width: 100%;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px);
}

/* 第二張卡：服務說明（不需要照片，保留同樣視覺風格） */
.profile-container.service-only {
  margin-top: 0;
}

/* 照片 */
.photo-box img {
  width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.15);
  object-fit: cover;
}

/* 文字區 */
.intro-box {
  flex: 1;
  min-width: 280px;
}

.name-title {
  font-size: 32px;
  margin: 0;
  color: #2f2b25;
}

.subtitle {
  margin: 4px 0 18px;
  font-size: 19px;
  color: #555;
}

.description {
  font-size: 18px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 22px;
}

/* 資訊條列 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 0;
}

.info-item {
  display: flex;
  font-size: 18px;
}

.info-label {
  min-width: 90px;
  font-weight: 600;
  color: #333;
}

.info-text {
  color: #555;
}

/* ✅ 服務區塊樣式（審核友善：清楚、好讀、不中二） */
.section-title {
  margin: 0 0 10px;
  font-size: 20px;
  color: #2f2b25;
}

.service-block {
  margin-top: 14px;
}

.service-title {
  margin: 0 0 6px;
  font-size: 18px;
  color: #333;
}

.service-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: #444;
}

.service-text.small {
  font-size: 14px;
  color: #555;
}

.service-list {
  margin: 0;
  padding-left: 18px;
  color: #444;
  font-size: 16px;
  line-height: 1.7;
}

.service-list li {
  margin: 4px 0;
}
.contact-block {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* CTA 按鈕 */
.booking-btn {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 999px;
  background: #b93a32;
  color: #fff;
  font-size: 18px;
  text-decoration: none;
  transition: transform 0.05s ease, box-shadow 0.15s ease;
}

.booking-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(185, 58, 50, 0.35);
}

/* RWD：手機排版
   - 第一張卡維持置中（人味）
   - 第二張服務卡維持左對齊（條款好讀）
*/
@media (max-width: 700px) {
  .profile-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-item {
    justify-content: center;
  }

  .profile-container.service-only {
    align-items: stretch;
    text-align: left;
  }
}
/* RWD 補強：關於我卡（about-card） */
@media (max-width: 700px) {
  .profile-container.about-card {
    align-items: stretch;
    text-align: left;
  }

  .profile-container.about-card .photo-box {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .profile-container.about-card .photo-box img {
    width: 180px;
    max-width: 70%;
  }

  .profile-container.about-card .info-item {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
}
</style>
