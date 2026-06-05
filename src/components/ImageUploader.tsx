import { defineComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'

export default defineComponent({
  name: 'ImageUploader',
  setup() {
    const store = useAppStore()
    const { handleFileUpload, resetAll } = useImageProcessing()
    const fileInput = ref<HTMLInputElement>()
    const isDragging = ref(false)

    const onFileChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      await handleFileUpload(file)
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      isDragging.value = false
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      await handleFileUpload(file)
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      isDragging.value = true
    }

    const onDragLeave = () => {
      isDragging.value = false
    }

    const triggerUpload = () => {
      fileInput.value?.click()
    }

    return () => (
      <div class="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
        <h3 class="text-sm font-semibold flex items-center gap-2">
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          原始图片
        </h3>

        {store.sourceDataURL ? (
          <div class="space-y-2">
            <div class="rounded-lg overflow-hidden border border-border bg-checkerboard">
              <img
                src={store.sourceDataURL}
                alt="Source"
                class="w-full object-contain max-h-56"
              />
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface border border-border hover:bg-primary/10 transition-all duration-150 active:scale-95"
                onClick={triggerUpload}
              >
                更换图片
              </button>
              <button
                class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-all duration-150 active:scale-95"
                onClick={resetAll}
              >
                清除
              </button>
            </div>
          </div>
        ) : (
          <div
            class={`flex flex-col items-center justify-center gap-3 py-10 cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200 ${
              isDragging.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-surface'
            }`}
            onClick={triggerUpload}
            onDrop={onDrop}
            onDragover={onDragOver}
            onDragleave={onDragLeave}
          >
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div class="text-center">
              <p class="text-sm font-medium">拖拽或点击上传图片</p>
              <p class="text-xs text-text-secondary mt-0.5">JPG / PNG / WebP</p>
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
