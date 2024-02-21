import {events} from './events';
export function useMenuDragger(containerRef, data) {
    // currentComponent 用于drop时，知道是什么组件
    let currentComponent = null;
    /**
     * @function dragenter 进入
     * @param {*} e 
     */
    const dragenter = (e) => {
        //拖动类型
        e.dataTransfer.dropEffect = 'move'; // h5拖动的图标 move
    }
        /**
     * @function dragover 进入
     * @param {*} e 
     */
    const dragover = (e) => {
        e.preventDefault();
    }
     /**
     * @function dragleave 离开
     * @param {*} e 
     */
    const dragleave = (e) => {
        e.dataTransfer.dropEffect = 'none';
    }
         /**
     * @function drop 松手
     * @param {*} e 
     */
    const drop = (e) => {
        // 先留在这
        let blocks =  data.value.blocks; // 内部已经渲染的组件
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
        ]}
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