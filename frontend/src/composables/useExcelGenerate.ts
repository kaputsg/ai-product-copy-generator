import { ref } from 'vue'

interface ErrorResponse {
  error?: string
  message?: string
  detail?: string
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const readErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as ErrorResponse
    return data.error || '生成失败，请稍后重试'
  } catch {
    return '生成失败，请稍后重试'
  }
}

export const useExcelGenerate = () => {
  const isLoading = ref(false)
  const isError = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const generateExcel = async (file: File | null) => {
    errorMessage.value = ''
    successMessage.value = ''
    isError.value = false

    if (!file) {
      errorMessage.value = '请先选择 Excel 文件'
      isError.value = true
      throw new Error(errorMessage.value)
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      errorMessage.value = '只支持 .xlsx 文件'
      isError.value = true
      throw new Error(errorMessage.value)
    }

    isLoading.value = true

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/generate-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const blob = await response.blob()
      downloadBlob(blob, 'generated_products.xlsx')
      successMessage.value = '已生成结果表格，并开始下载。'
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
    successMessage,
    generateExcel
  }
}
