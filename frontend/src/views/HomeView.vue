<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useGenerate, type GenerateTextPayload } from '@/composables/useGenerate'

const form = reactive<GenerateTextPayload>({
  product_name: '',
  product_info: '',
  target_platform: '淘宝',
  tone: '简洁、有购买欲',
  language: '中文'
})

const validationError = ref('')
const { generate, result, isLoading, errorMessage } = useGenerate()

const canSubmit = computed(() => form.product_name.trim().length > 0 && !isLoading.value)
const displayError = computed(() => validationError.value || errorMessage.value)

const submitForm = async () => {
  validationError.value = ''

  if (!form.product_name.trim()) {
    validationError.value = '请先输入商品名称'
    return
  }

  try {
    await generate({
      product_name: form.product_name.trim(),
      product_info: form.product_info.trim(),
      target_platform: form.target_platform.trim() || '淘宝',
      tone: form.tone.trim() || '简洁、有购买欲',
      language: form.language.trim() || '中文'
    })
  } catch {
    // 错误信息由 useGenerate 统一维护，页面只负责展示。
  }
}
</script>

<template>
  <main class="page-shell">
    <section class="intro-section">
      <p class="eyebrow">Product Copy Generator</p>
      <h1>电商 AI 商品文案生成器</h1>
      <p class="intro-text">
        输入商品名称和商品信息，自动生成商品标题、卖点、详情页文案、搜索关键词和短视频口播文案。
      </p>
    </section>

    <section class="workspace-grid">
      <form class="card form-card" @submit.prevent="submitForm">
        <div class="field-group">
          <label for="product-name">商品名称 <span>必填</span></label>
          <input
            id="product-name"
            v-model="form.product_name"
            type="text"
            placeholder="例如：不锈钢保温杯"
            autocomplete="off"
          />
        </div>

        <div class="field-group">
          <label for="product-info">商品信息</label>
          <textarea
            id="product-info"
            v-model="form.product_info"
            rows="6"
            placeholder="例如：500ml，316不锈钢，适合学生和上班族，保温12小时"
          />
        </div>

        <div class="field-row">
          <div class="field-group">
            <label for="target-platform">目标平台</label>
            <input id="target-platform" v-model="form.target_platform" type="text" />
          </div>

          <div class="field-group">
            <label for="language">输出语言</label>
            <input id="language" v-model="form.language" type="text" />
          </div>
        </div>

        <div class="field-group">
          <label for="tone">文案语气</label>
          <input id="tone" v-model="form.tone" type="text" />
        </div>

        <button class="submit-button" type="submit" :disabled="!canSubmit">
          {{ isLoading ? '生成中...' : '生成商品文案' }}
        </button>

        <p v-if="displayError" class="error-message">{{ displayError }}</p>
      </form>

      <section class="card result-card" aria-live="polite">
        <div v-if="isLoading" class="empty-state">
          <div class="loading-dot" />
          <p>正在生成商品文案，请稍候...</p>
        </div>

        <div v-else-if="result" class="result-content">
          <div class="result-block">
            <h2>商品标题</h2>
            <p class="title-output">{{ result.title }}</p>
          </div>

          <div class="result-block">
            <h2>卖点列表</h2>
            <ul>
              <li v-for="point in result.selling_points" :key="point">{{ point }}</li>
            </ul>
          </div>

          <div class="result-block">
            <h2>详情页文案</h2>
            <p>{{ result.description }}</p>
          </div>

          <div class="result-block">
            <h2>搜索关键词</h2>
            <div class="keyword-list">
              <span v-for="keyword in result.keywords" :key="keyword">{{ keyword }}</span>
            </div>
          </div>

          <div class="result-block">
            <h2>短视频口播文案</h2>
            <p>{{ result.short_video_script }}</p>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>生成结果会显示在这里。</p>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  width: 100%;
  padding: 40px 0 56px;
}

.intro-section {
  margin-bottom: 28px;
}

.eyebrow {
  color: #b45309;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 8px;
  text-transform: uppercase;
}

h1 {
  color: #1f2937;
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 12px;
}

.intro-text {
  color: #4b5563;
  font-size: 16px;
  line-height: 1.8;
  max-width: 760px;
}

.workspace-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
}

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.form-card,
.result-card {
  padding: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.field-row {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  color: #374151;
  font-size: 14px;
  font-weight: 700;
}

label span {
  color: #b45309;
  font-size: 12px;
  margin-left: 4px;
}

input,
textarea {
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #111827;
  font-size: 15px;
  line-height: 1.6;
  outline: none;
  padding: 11px 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

.submit-button {
  align-items: center;
  background: #111827;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  font-weight: 700;
  justify-content: center;
  min-height: 44px;
  padding: 0 22px;
  transition: background-color 0.2s ease, transform 0.2s ease;
  width: 100%;
}

.submit-button:hover:not(:disabled) {
  background: #92400e;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #b91c1c;
  font-size: 14px;
  margin-top: 14px;
  padding: 10px 12px;
}

.result-card {
  min-height: 560px;
}

.empty-state {
  align-items: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  justify-content: center;
  min-height: 360px;
  text-align: center;
}

.loading-dot {
  animation: pulse 1s infinite ease-in-out;
  background: #d97706;
  border-radius: 999px;
  height: 14px;
  width: 14px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-block {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 18px;
}

.result-block:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.result-block h2 {
  color: #92400e;
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 10px;
}

.result-block p,
.result-block li {
  color: #1f2937;
  font-size: 15px;
  line-height: 1.8;
}

.title-output {
  font-size: 20px;
  font-weight: 800;
}

ul {
  margin: 0;
  padding-left: 20px;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-list span {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 999px;
  color: #78350f;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 900px) {
  .workspace-grid,
  .field-row {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 30px;
  }
}
</style>
