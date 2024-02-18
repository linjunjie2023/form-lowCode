import { ShapeFlags } from '@vue/shared'
import { createAppAPI } from './apiCreateApp'

export * from '@vue/reactivity'


// runtime-core  根平台无关的运行时  



export function createRenderer(renderOptions) { // runtime-core   renderOptionsDOMAPI -> rootComponent -> rootProps -> container
    const mountComponent = (initialVNode,container) =>{ // 组件的挂载流程
        // 根据组件的虚拟节点 创造一个真实节点 ， 渲染到容器中
        console.log(initialVNode,container)
    }
    const processComponent = (n1,n2,container) =>{
        if(n1 == null){
            // 组件的初始化
            mountComponent(n2,container);
        }else{
            // 组件的更新
        }
    }
    const patch = (n1, n2, container) => {
        if(n1 == n2) return ;
        const {shapeFlag} = n2; // createApp(组件)
        if(shapeFlag & ShapeFlags.COMPONENT){
            processComponent(n1, n2, container);
        }

    }   

    const render = (vnode, container) => { // 将虚拟节点 转化成真实节点渲染到容器中
        // 后续还有更新 patch  包含初次渲染 还包含更新
        patch(null, vnode, container);// 后续更新 prevNode nextNode container
    }
    // 
    return {
        createApp: createAppAPI(render), // 创建一个api createApp
        render
    }
}