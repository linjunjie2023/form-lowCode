// 列表区可以显示所有的物料
// key对应的组件映射关系 
import { ElButton, ElInput, ElOption, ElSelect } from 'element-plus'
import Range from '../components/Range'

/**
 * 这段代码创建一个编辑器配置函数，
 * 该函数返回一个包含三个属性的对象：componentList（组件列表）、componentMap（组件映射表）和register（注册组件的方法）。
 * componentList是一个数组，用于存储组件信息。
 * componentMap是一个对象，用于存储组件的键/值对。
 * register是一个函数，用于将组件添加到组件列表和组件映射表中。
 */
function createEditorConfig() {
    const componentList = []; //组件列表，放组件的。左侧的物料区列表
    const componentMap = {} // 组件映射表，中间的内容区列表

    return {
        componentList,
        componentMap,
        register: (component) => {
            componentList.push(component); //下面调用一次方法，就会放入一个组件信息
            componentMap[component.key] = component;
        }
    }
}
export let registerConfig = createEditorConfig();
/** 
 * 这段代码定义了四个函数，
 * 这些函数用于创建编辑器中组件的不同类型属性。
 * 这些函数用于定义可以配置每个组件的属性，例如选择框的标签、类型和选项。
 */
/**
 * 
 createInputProp函数创建输入类型属性，并带有标签。
 createColorProp函数创建颜色类型属性。createSelectProp函数创建选择类型属性，并带有标签和选项。
 createTableProp函数创建表类型属性，并带有标签和表。
 */
const createInputProp = (label) => ({ type: 'input', label });

const createColorProp = (label) => ({ type: 'color', label });
const createSelectProp = (label, options) => ({ type: 'select', label, options })
const createTableProp = (label, table) => ({ type: 'table', label, table })  

/** 一个组件一个这个？
 * 因为：每个组件的属性是有差别的，有的有字数统计属性，有的没有。每个组件的配置不一样
 * 所以，最好是一个一个写。
 */


/** 
 * 使用了JavaScript中的对象字面量语法来定义一个组件的注册信息。该组件的类型为下拉框，它有一个标签、预览组件、渲染组件、键、属性和模型。
 * label是组件的名称，preview是一个函数，它返回一个预览组件的 JSX 元素，
 * render是一个函数，它接受一个对象作为参数，该对象包含属性和模型，并返回一个渲染组件的 JSX 元素，
 * key是组件的键，
 * props是一个对象，它包含组件的属性，
 * model是一个对象，它包含组件的模型，值是组件的默认值。
 */
registerConfig.register({
    label: '下拉框',
    preview: () => <ElSelect modelValue=""></ElSelect>,
    render: ({ props, model }) => {
        return <ElSelect {...model.default}>
            {(props.options || []).map((opt, index) => {
                return <ElOption label={opt.label} value={opt.value} key={index}></ElOption>
            })}
        </ElSelect>
    },
    key: 'select',
    props: { // [{label:'a',value:'1'},{label:'b',value:2}]
        options: createTableProp('下拉选项', {
            options: [
                { label: '显示值', field: 'label' },
                { label: '绑定值', field: 'value' },
            ],
            key: 'label' // 显示给用户的值 是label值
        })
    },
    model: { // {default:'username'}
        default: '绑定字段'
    }
})

registerConfig.register({
    label: '文本',
    preview: () => '预览文本',
    render: ({ props }) => <span style={{ color: props.color, fontSize: props.size }}>{props.text || '渲染文本'}</span>,
    key: 'text',
    props: {
        text: createInputProp('文本内容'), //返回的是对象
        color: createColorProp('字体颜色'),
        size: createSelectProp('字体大小', [
            { label: '14px', value: '14px' },
            { label: '20px', value: '20px' },
            { label: '24px', value: '24px' },
        ])

    }
})
registerConfig.register({
    label: '按钮',
    resize: {
        width: true,
        height: true
    },
    preview: () => <ElButton>预览按钮</ElButton>,
    render: ({ props, size }) => <ElButton style={{ height: size.height + 'px', width: size.width + 'px' }} type={props.type} size={props.size}>{props.text || '渲染按钮'}</ElButton>,
    key: 'button',
    props: {
        text: createInputProp('按钮内容'),
        type: createSelectProp('按钮类型', [
            { label: '基础', value: 'primary' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: '危险', value: 'danger' },
            { label: '文本', value: 'text' },
        ]),
        size: createSelectProp('按钮尺寸', [
            { label: '默认', value: '' },
            { label: '中等', value: 'medium' },
            { label: '小', value: 'small' },
            { label: '极小', value: 'mini' },
        ])
    }
})
registerConfig.register({
    label: '输入框',
    resize: {
        width: true, // 更改输入框的横向大小
    },
    preview: () => <ElInput placeholder="预览输入框"></ElInput>,
    render: ({ model, size }) => <ElInput placeholder="渲染输入框" {...model.default} style={{ width: size.width + 'px' }}></ElInput>,
    key: 'input',
    model: { // {default:'username'}
        default: '绑定字段'
    }
});
registerConfig.register({
    label: '范围选择器',
    preview: () => <Range placeholder="预览输入框"></Range>,
    render: ({ model }) => {
        return <Range {...{
            start: model.start.modelValue, // @update:start
            end: model.end.modelValue,
            'onUpdate:start': model.start['onUpdate:modelValue'],
            'onUpdate:end': model.end['onUpdate:modelValue']
        }}></Range>
    },
    model: {
        start: '开始范围字段',
        end: '结束范围字段'
    },
    key: 'range',
})


// model:{// {start:'start',end:'end'}
//     start:'开始字段',
//     end:'结束字段'
// }