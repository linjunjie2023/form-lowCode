import { defineComponent } from 'vue'
import "./editor.scss"
import EditorBlock from './editor-block.jsx'
export default defineComponent({
  props: {
    modelValue:{type:Object}
  },
  setup(props) {
    const data = computed({
      get() {
        return props.modelValue
      }
    })
    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height:data.value.container.height+ "px"
    }))
    // 返回一个渲染函数
    return () => <div class="editor"> editor
      <div class="editor-left">左侧物料区</div>
      <div class="editor-top">菜单栏</div>
      <div class="editor-right">属性控制栏目</div>
      <div className="editor-container">
        {/* 负责产生滚动条 */}
        <div className="editor-container-canvas">
          {/* 产生内容区域 */}
          <div className="editor-container-canvas__content" style={containerStyles.value}>内容区
            <EditorBlock block={block}> </EditorBlock>
          </div>
        </div>
      </div>
      
    </div>
  },
})
