<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useGenerate, type GenerateTextPayload } from '@/composables/useGenerate'
import { useExcelGenerate } from '@/composables/useExcelGenerate'
import { useExcelTemplate } from '@/composables/useExcelTemplate'

const form = reactive<GenerateTextPayload>({
  product_name: '',
  product_info: '',
  target_platform: '淘宝',
  tone: '简洁、有购买欲',
  language: '中文'
})

const validationError = ref('')
const { generate, result, isLoading, errorMessage } = useGenerate()
const selectedExcelFile = ref<File | null>(null)
const {
  generateExcel,
  isLoading: isExcelLoading,
  errorMessage: excelErrorMessage,
  successMessage: excelSuccessMessage
} = useExcelGenerate()
const {
  downloadTemplate,
  isLoading: isTemplateLoading,
  errorMessage: templateErrorMessage
} = useExcelTemplate()

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

const handleExcelFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedExcelFile.value = input.files?.[0] ?? null
}

const submitExcelForm = async () => {
  try {
    await generateExcel(selectedExcelFile.value)
  } catch {
    // 错误信息由 useExcelGenerate 统一维护，页面只负责展示。
  }
}

const handleTemplateDownload = async () => {
  try {
    await downloadTemplate()
  } catch {
    // 错误信息由 useExcelTemplate 统一维护，页面只负责展示。
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

    <section class="card excel-card">
      <div class="excel-layout">
        <div class="excel-content">
          <p class="section-label">批量生成</p>
          <h2>Excel 批量生成</h2>
          <p class="excel-description">
            上传商品表格后，系统会批量生成商品标题、卖点、详情页文案、搜索关键词和短视频口播文案，并自动下载结果表格。
          </p>

          <div class="template-note" aria-label="Excel 模板字段说明">
            <div>
              <h3>必填</h3>
              <p><span>商品名称</span></p>
            </div>
            <div>
              <h3>可选</h3>
              <p>
                <span>商品信息</span>
                <span>目标平台</span>
                <span>文案语气</span>
                <span>输出语言</span>
              </p>
            </div>
            <div>
              <h3>默认值</h3>
              <p>
                <span>目标平台：淘宝</span>
                <span>文案语气：简洁、有购买欲</span>
                <span>输出语言：中文</span>
              </p>
            </div>
          </div>
        </div>

        <form class="excel-upload-form" @submit.prevent="submitExcelForm">
          <div class="field-group">
            <label for="excel-file">选择 Excel 文件</label>
            <input
              id="excel-file"
              type="file"
              accept=".xlsx"
              :disabled="isExcelLoading"
              @change="handleExcelFileChange"
            />
            <p v-if="selectedExcelFile" class="file-name">
              已选择：{{ selectedExcelFile.name }}
            </p>
            <p class="upload-hint">
              仅支持 .xlsx 文件，建议一次不超过 20 条商品，避免接口费用过高。
            </p>
          </div>

          <div class="upload-actions">
            <button class="template-button" type="button" :disabled="isTemplateLoading" @click="handleTemplateDownload">
              {{ isTemplateLoading ? '下载中...' : '下载 Excel 模板' }}
            </button>

            <button class="submit-button" type="submit" :disabled="isExcelLoading">
              {{ isExcelLoading ? '生成中，请稍等...' : '上传并生成结果表格' }}
            </button>
          </div>

          <p v-if="templateErrorMessage" class="error-message">{{ templateErrorMessage }}</p>
          <p v-if="excelErrorMessage" class="error-message">{{ excelErrorMessage }}</p>
          <p v-if="excelSuccessMessage" class="success-message">{{ excelSuccessMessage }}</p>
        </form>
      </div>
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

.excel-card {
  margin-top: 24px;
  padding: 28px;
}

.excel-layout {
  align-items: start;
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
}

.section-label {
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.excel-card h2 {
  color: #111827;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  margin: 0 0 10px;
}

.excel-description {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 20px;
  max-width: 780px;
}

.template-note {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 18px;
}

.template-note h3 {
  color: #374151;
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
}

.template-note p {
  color: #4b5563;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 6px;
  line-height: 1.6;
}

code {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #111827;
  display: inline-flex;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
  padding: 3px 7px;
  width: fit-content;
}

.excel-upload-form {
  align-self: start;
  padding-top: 32px;
}

.upload-actions {
  display: grid;
  gap: 10px;
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

input[type='file'] {
  cursor: pointer;
}

input[type='file']::file-selector-button {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #111827;
  cursor: pointer;
  font-weight: 700;
  margin-right: 12px;
  padding: 8px 12px;
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

.template-button {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #111827;
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  font-weight: 700;
  justify-content: center;
  min-height: 44px;
  padding: 0 22px;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  width: 100%;
}

.submit-button:hover:not(:disabled) {
  background: #92400e;
  transform: translateY(-1px);
}

.template-button:hover:not(:disabled) {
  border-color: #92400e;
  color: #92400e;
  transform: translateY(-1px);
}

.submit-button:disabled,
.template-button:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  color: #ffffff;
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

.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  color: #166534;
  font-size: 14px;
  margin-top: 14px;
  padding: 10px 12px;
}

.file-name {
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.upload-hint {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
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
  .excel-layout,
  .template-note,
  .field-row {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 30px;
  }
}
</style>
