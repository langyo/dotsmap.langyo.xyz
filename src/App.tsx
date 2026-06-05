import { defineComponent } from 'vue'
import DotsMapApp from './components/DotsMapApp'

export default defineComponent({
  name: 'App',
  setup() {
    return () => <DotsMapApp />
  },
})
