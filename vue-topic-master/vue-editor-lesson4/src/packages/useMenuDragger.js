import {events} from './events';
export function useMenuDragger(containerRef, data) {
    // currentComponent 用于drop时，知道是什么组件
    let currentComponent = null;

    /**
     * 
     * 所选代码拖放事件的函数的一部分。
     * 它将拖动效果设置为“移动”，这是HTML5拖放的默认拖动效果。
     * 这意味着当用户将元素拖到拖放目标上时，将出现一个图标，指示可以将元素拖放到目标中。
     */
    const dragenter = (e) => {
        //拖动类型
        e.dataTransfer.dropEffect = 'move'; //dropEffect  h5拖动的图标 move
    }

    /*
    当一个元素被拖到另一个元素上时触发拖移事件。在这种情况下，它用于防止默认行为，
    如果没有preventDefault调用，元素将被阻止放到目标元素上
     */
    const dragover = (e) => {
        e.preventDefault();
    }

    /**
     * 离开的时候，图标改变，改为禁用标识
     */
    const dragleave = (e) => {
        e.dataTransfer.dropEffect = 'none';
    }
        /**
     * 松手的时候，根据拖拽的组件，添加一个组件
     */
const drop = (e) => {
        // 先留在这
        let blocks =  data.value.blocks; // 内部原有已经渲染的组件
        data.value = {...data.value,blocks:[
            ...blocks,
            {
                top:e.offsetY,
                left:e.offsetX,
                zIndex:1,
                key:currentComponent.key,
                alignCenter:true, // 希望松手的时候你可以居中
                props:{},
                model:{}
            }
    ]
    }
    /** 
     * 这是新增的组件信息
     * {
                top:e.offsetY,
                left:e.offsetX,
                zIndex:1,
                key:currentComponent.key,
                alignCenter:true, // 希望松手的时候你可以居中
                props:{},
                model:{}
            } */
        currentComponent = null;
    }
    const dragstart = (e, component) => {
        // dragenter进入元素中 添加一个移动的标识
        // dragover 在目标元素经过 必须要阻止默认行为 否则不能触发drop
        // dragleave 离开元素的时候 需要增加一个禁用标识
        // drop 松手的时候 根据拖拽的组件 添加一个组件
        containerRef.value.addEventListener('dragenter', dragenter)
        containerRef.value.addEventListener('dragover', dragover)
        containerRef.value.addEventListener('dragleave', dragleave)
        containerRef.value.addEventListener('drop', drop)
        currentComponent = component  //开始的时候，赋值了为操作的那个组件，component
        events.emit('start'); // 发布start
    }
    
    /**
    离开后移除事件
     */
    const dragend = (e)=>{
        containerRef.value.removeEventListener('dragenter', dragenter)
        containerRef.value.removeEventListener('dragover', dragover)
        containerRef.value.removeEventListener('dragleave', dragleave)
        containerRef.value.removeEventListener('drop', drop)
        events.emit('end'); // 发布end
    }
    return {
        dragstart,
        dragend
    }
}