import { defineComponent, computed } from 'vue'

export default defineComponent({
  props: {
    block: {
      type: Object,
    },
  },
  setup(props) {
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}px`,
    }))
    return () => {
      return <div style={blockStyles.value}> 这是一个代码块</div>
    }
  },
})
