import { ref } from 'vue'

export interface GenerateTextPayload {
  product_name: string
  product_info: string
  target_platform: string
  tone: string
  language: string
}

export interface GenerateTextResult {
  title: string
  selling_points: string[]
  description: string
  keywords: string[]
  short_video_script: string
}

interface GenerateTextResponse {
  result: GenerateTextResult
  error?: string
}

export const useGenerate = () => {
  const isLoading = ref(false)
  const isError = ref(false)
  const errorMessage = ref('')
  const result = ref<GenerateTextResult | null>(null)

  const generate = async (payload: GenerateTextPayload) => {
    isLoading.value = true
    isError.value = false
    errorMessage.value = ''
    result.value = null

    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = (await response.json()) as GenerateTextResponse

      if (!response.ok) {
        throw new Error(data.error || '生成失败，请稍后重试')
      }

      result.value = data.result
      return data.result
    } catch (error) {
      isError.value = true
      errorMessage.value = error instanceof Error ? error.message : '生成失败，请稍后重试'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    isError,
    errorMessage,
    result,
    generate
  }
}
