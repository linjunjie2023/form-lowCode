import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from './editor-block.jsx' 
import deepcopy from "deepcopy"; //深拷贝
import { useMenuDragger } from "./useMenuDragger"; //实现菜单的拖拽功能
import { useFocus } from "./useFocus";  //内部的拖拽
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "../components/Dialog";
import { $dropdown, DropdownItem } from "../components/Dropdown";
import EditorOperator from "./editor-operator";
import { ElButton } from "element-plus";
export default defineComponent({
    props: {
        modelValue: { type: Object },//包含编辑器数据的对象，
        formData: { type: Object }  //formData是包含编辑器中组件的元数据对象。
    },
    /**emits 选项
     * update:modelValue是自定义事件，当data属性的值发生变化时，组件将会触发该事件。父组件可以通过监听该事件来更新data属性的值。
     */
    emits: ['update:modelValue'], // 要触发的时间
    setup(props, ctx) {
        // 预览的时候 内容不能在操作了 ，可以点击 输入内容 方便看效果
        const previewRef = ref(false);
        const editorRef = ref(true);

        const data = computed({
            get() {
                return props.modelValue
            },
            set(newValue) {
                ctx.emit('update:modelValue', deepcopy(newValue)) //派发事件
            }
        });
        const containerStyles = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config'); //接收传过来的数据

        const containerRef = ref(null); //获取ref
        // 1.实现菜单的拖拽功能,封装成了钩子函数
        const { dragstart, dragend } = useMenuDragger(containerRef, data); //渲染好后，会传进去

        // 2.实现获取焦点 选中后可能直接就进行拖拽了
        let { blockMousedown, focusData, containerMousedown, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => {
            // 获取焦点后进行拖拽
            mousedown(e)
        });
        // 2.实现组件拖拽
        let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data);

        //顶部有关的一些功能函数
        const { commands } = useCommand(data, focusData); // []
        //顶部的一些按钮工具
        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
            { label: '重做', icon: 'icon-forward', handler: () => commands.redo() },
            {
                label: '导出', icon: 'icon-export', handler: () => {
                    $dialog({
                        title: '导出json使用',
                        content: JSON.stringify(data.value),
                    })
                }
            },
            {
                label: '导入', icon: 'icon-import', handler: () => {
                    $dialog({
                        title: '导入json使用',
                        content: '',
                        footer: true,
                        onConfirm(text) {
                            //data.value = JSON.parse(text); // 这样去更改无法保留历史记录
                            commands.updateContainer(JSON.parse(text));
                        }
                    })
                }
            },
            { label: '置顶', icon: 'icon-place-top', handler: () => commands.placeTop() },
            { label: '置底', icon: 'icon-place-bottom', handler: () => commands.placeBottom() },
            { label: '删除', icon: 'icon-delete', handler: () => commands.delete() },


            {
                label: () => previewRef.value ? '编辑' : '预览', icon: () => previewRef.value ? 'icon-edit' : 'icon-browse', handler: () => {
                    previewRef.value = !previewRef.value;
                    clearBlockFocus();
                }
            },
            {
                label: '关闭', icon: 'icon-close', handler: () => {
                    editorRef.value = false;
                    clearBlockFocus();
                }
            },
        ];

        const onContextMenuBlock = (e, block) => {
            e.preventDefault();

            $dropdown({
                el: e.target, // 以哪个元素为准产生一个dropdown
                content: () => {
                    return <>
                        <DropdownItem label="删除" icon="icon-delete" onClick={() => commands.delete()}></DropdownItem>
                        <DropdownItem label="置顶" icon="icon-place-top" onClick={() => commands.placeTop()}></DropdownItem>
                        <DropdownItem label="置底" icon="icon-place-bottom" onClick={() => commands.placeBottom()}></DropdownItem>
                        <DropdownItem label="查看" icon="icon-browse" onClick={() => {
                            $dialog({
                                title: '查看节点数据',
                                content: JSON.stringify(block)
                            })
                        }}></DropdownItem>
                        <DropdownItem label="导入" icon="icon-import" onClick={() => {
                            $dialog({
                                title: '导入节点数据',
                                content: '',
                                footer: true,
                                onConfirm(text) {
                                    text = JSON.parse(text);
                                    commands.updateBlock(text, block)
                                }
                            })
                        }}></DropdownItem>
                    </>
                }
            })
        }



        return () => !editorRef.value ? <>
            <div
                class="editor-container-canvas__content"
                style={containerStyles.value}
                style="margin:0"
            >
                {
                    (data.value.blocks.map((block, index) => (
                        <EditorBlock
                            class='editor-block-preview'
                            block={block}
                            formData={props.formData}
                        ></EditorBlock>
                    )))
                }
            </div>
            <div>
                <ElButton type="primary" onClick={() => editorRef.value = true}>继续编辑</ElButton>
                {JSON.stringify(props.formData)}
                </div>



        </> : <div class="editor">
            {/* 左侧物料区 */}
            <div class="editor-left">
                    {/* 根据注册列表 渲染对应的内容  可以实现h5的拖拽*/}
                    {/* 要加个html5自带属性draggable，加了就能拖动 */}
                    {/* 获取componentList,然后渲染每一项 */}
                {config.componentList.map(component => (
                    <div
                        class="editor-left-item"
                        draggable
                        onDragstart={e => dragstart(e, component)}
                        onDragend={dragend}
                    >
                        {/* dragstart 开始拖拽的函数,e 事件源
                            dragend 拖拽结束的函数                        
                        */}
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>
                ))}
                </div>
                {/* 顶部工作区 */}
            <div class="editor-top">
                {buttons.map((btn, index) => {
                    const icon = typeof btn.icon == 'function' ? btn.icon() : btn.icon
                    const label = typeof btn.label == 'function' ? btn.label() : btn.label
                    return <div class="editor-top-button" onClick={btn.handler}>
                        <i class={icon}></i>
                        <span>{label}</span>
                    </div>
                })}
                </div>
                {/* 右侧属性 */}
            <div class="editor-right">
                <EditorOperator
                    block={lastSelectBlock.value}
                    data={data.value}
                    updateContainer={commands.updateContainer}
                    updateBlock={commands.updateBlock}
                ></EditorOperator>
            </div>
            <div class="editor-container">
                {/*  负责产生滚动条 */}
                <div class="editor-container-canvas">
                    {/* 产生内容区域 */}
                    <div
                        class="editor-container-canvas__content"
                        style={containerStyles.value}
                        ref={containerRef}
                        onMousedown={containerMousedown}
  
                        >        
                    {/* ref 获取内容区的dom元素 */}
                        {
                            (data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    class={block.focus ? 'editor-block-focus' : ''}
                                    class={previewRef.value ? 'editor-block-preview' : ''}
                                    block={block}
                                    onMousedown={(e) => blockMousedown(e, block, index)}
                                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                                    formData={props.formData}
                                ></EditorBlock>
                            )))
                        }

                        {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                        {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}

                    </div>

                </div>
            </div>
        </div>
    }
})