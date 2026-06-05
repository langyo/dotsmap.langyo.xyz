import { defineComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useImageProcessing } from '@/composables/useImageProcessing'
import { ImagePlus, X } from 'lucide-vue-next'

export default defineComponent({
  name: 'ImageUploader',
  setup() {
    const store = useAppStore()
    const { handleFileUpload, resetAll } = useImageProcessing()
    const fileInput = ref<HTMLInputElement>()
    const isDragging = ref(false)
    const dragCounter = ref(0)

    const onFileChange = async (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      await handleFileUpload(file)
      input.value = ''
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      dragCounter.value = 0
      isDragging.value = false
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      await handleFileUpload(file)
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter.value++
      isDragging.value = true
    }

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter.value--
      if (dragCounter.value <= 0) {
        dragCounter.value = 0
        isDragging.value = false
      }
    }

    return () => (
      <div class="panel">
        <h3 class="panel-title">
          <ImagePlus size={16} />
          原始图片
        </h3>

        {store.sourceDataURL ? (
          <div class="space-y-2">
            <div class="rounded-lg overflow-hidden border border-border bg-checkerboard">
              <img src={store.sourceDataURL} alt="Source" class="w-full object-contain max-h-56" />
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm flex-1" onClick={() => fileInput.value?.click()}>
                更换图片
              </button>
              <button class="btn btn-sm btn-danger flex-1" onClick={resetAll}>
                <X size={14} />
                清除
              </button>
            </div>
          </div>
        ) : (
          <div
            class={`upload-zone ${isDragging.value ? 'dragging' : ''}`}
            onClick={() => fileInput.value?.click()}
            onDrop={onDrop}
            onDragover={onDragOver}
            onDragenter={onDragEnter}
            onDragleave={onDragLeave}
          >
            <ImagePlus size={24} class="text-primary mb-2" />
            <p class="text-sm font-medium">拖拽或点击上传</p>
            <p class="text-xs text-text-secondary mt-0.5">JPG / PNG / WebP</p>
          </div>
        )}

        <input ref={fileInput} type="file" accept="image/*" class="hidden" onChange={onFileChange} />
      </div>
    )
  },
})
