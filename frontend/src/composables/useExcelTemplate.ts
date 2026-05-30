import { ref } from 'vue'

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

export const useExcelTemplate = () => {
  const isLoading = ref(false)
  const errorMessage = ref('')

  const downloadTemplate = async () => {
    errorMessage.value = ''
    isLoading.value = true

    try {
      const response = await fetch('/api/excel-template')

      if (!response.ok) {
        throw new Error('模板下载失败，请稍后重试')
      }

      const blob = await response.blob()
      downloadBlob(blob, 'product_template.xlsx')
    } catch (error) {
      errorMessage.value = '模板下载失败，请稍后重试'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    errorMessage,
    downloadTemplate
  }
}
