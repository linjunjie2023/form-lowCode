import { defineComponent } from 'vue'
import "./editor.scss"

export default defineComponent({
  props: {
    data:{type:Object}
  },
  setup() {
    // 返回一个渲染函数
    return () => <div class="editor"> editor
      <div class="editor-left">左侧物料区</div>
      <div class="editor-top">菜单栏</div>
      <div class="editor-right">属性控制栏目</div>
      <div className="editor-container">
        {/* 负责产生滚动条 */}
        <div className="editor-container-canvas">
          {/* 产生内容区域 */}
          <div className="editor-container-canvas__content">内容区</div>
        </div>
      </div>
      
    </div>
  },
})
