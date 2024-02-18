//列表区可以显示 所有的物料
//key 对应的组件映射关系

function createEditorConfig() {
    const componentList = []
    const conponentMap = {}
    return {
        register: () => {
            
        }
    }
}

let registerConfig = createEditorConfig()
registerConfig.register({
    label: "文本",
    preview: () => "预览文本",
    render:()=>"渲染文本"
})