import { computed, defineComponent, inject, onMounted, ref } from "vue";
import BlockResize from './block-resize'
export default defineComponent({
    props: {
        block: { type: Object },
        formData: { type: Object }
    },
    setup(props) {
        //这样blockStyles也是会动态更新的
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: `${props.block.zIndex}`
        }));
        const config = inject('config');  //获取。vue3的这个是响应式的。

    /** 
     * ref函数用于创建一个引用，该引用可以用来访问组件实例关联的DOM元素。
     * 在本例中，我们将引用存储在一个名为blockRef的变量中，该变量将在稍后用于修改块在编辑器中的位置或大小。
     */
    const blockRef = ref(null)  
        onMounted(() => {
            let { offsetWidth, offsetHeight } = blockRef.value;
            if (props.block.alignCenter) { // 说明是拖拽松手的时候才渲染的，其他的默认渲染到页面上的内容不需要居中
                props.block.left = props.block.left - offsetWidth / 2;
                props.block.top = props.block.top - offsetHeight / 2; // 原则上重新派发事件
                props.block.alignCenter = false; //居中完置为false，下次的不会居中。让渲染后的结果才能去居中
            }
            props.block.width = offsetWidth;
            props.block.height = offsetHeight;
        })

        return () => {
            // 通过block的key属性直接获取对应的组件 
            const component = config.componentMap[props.block.key];
            // 获取render函数
            const RenderComponent = component.render({
                size: props.block.hasResize ? { width: props.block.width, height: props.block.height } : {},
                props: props.block.props,
                // model: props.block.model  => {default:'username'}  => {modelValue: FormData.username,"onUpdate:modelValue":v=> FormData.username = v}

                model: Object.keys(component.model || {}).reduce((prev, modelName) => {
                    let propName = props.block.model[modelName]; // 'username'
                    prev[modelName] = {
                        modelValue: props.formData[propName], // zfjg
                        "onUpdate:modelValue": v => props.formData[propName] = v
                    }
                    return prev;
                }, {})
            });
            const { width, height } = component.resize || {}
            return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
                {RenderComponent}
                {/* 传递block的目的是为了修改当前block的宽高， component中存放了是修改高度还是宽度 */}
                {props.block.focus && (width || height) && <BlockResize
                    block={props.block}
                    component={component}
                ></BlockResize>}
            </div>
        }
    }
})