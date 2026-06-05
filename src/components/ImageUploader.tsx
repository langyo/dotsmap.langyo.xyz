import { defineComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'

export default defineComponent({
  name: 'ImageUploader',
  setup() {
    const store = useAppStore()
    const { handleFileUpload, resetAll } = useImageProcessing()
    const fileInput = ref<HTMLInputElement>()

    const onFileChange = async (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      await handleFileUpload(file)
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      await handleFileUpload(file)
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const triggerUpload = () => {
      fileInput.value?.click()
    }

    return () => (
      <div class="rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50">
        {store.sourceDataURL ? (
          <div class="space-y-3">
            <img
              src={store.sourceDataURL}
              alt="Source"
              class="w-full rounded-lg object-contain max-h-48"
            />
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-colors"
                onClick={triggerUpload}
              >
                更换图片
              </button>
              <button
                class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-colors"
                onClick={resetAll}
              >
                清除
              </button>
            </div>
          </div>
        ) : (
          <div
            class="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer"
            onClick={triggerUpload}
            onDrop={onDrop}
            onDragover={onDragOver}
          >
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-center">
              <p class="text-sm font-medium">拖拽图片到此处或点击上传</p>
              <p class="text-xs text-text-secondary mt-1">支持 JPG, PNG, WebP 等格式</p>
            </div>
          </div>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          class="hidden"
          onChange={onFileChange}
        />
      </div>
    )
  },
})
