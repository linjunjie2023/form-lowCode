var VueReactivity = (function (exports) {
    'use strict';

    function effect() {
    }

    function isObject(value) {
        return typeof value === 'object' && value !== null;
    }

    const mutableHandlers = {
        get(target, key, recevier) {
            if (key === "__v_isReactive" /* IS_REACTIVE */) {
                return true;
            }
            // 这里取值了， 可以收集他在哪个effect中
            const res = Reflect.get(target, key, recevier); // target[key]
            return res;
        },
        set(target, key, value, recevier) {
            // 如果改变值了， 可以在这里触发effect更新
            const res = Reflect.set(target, key, value, recevier); // target[key] = value
            return res;
        }
    };
    // map和weakMap的区别
    const reactiveMap = new WeakMap(); // weakmap 弱引用   key必须是对象，如果key没有被引用可以被自动销毁
    function createReactiveObject(target) {
        // 先默认认为这个target已经是代理过的属性了
        if (target["__v_isReactive" /* IS_REACTIVE */]) {
            return target;
        }
        // reactiveApi 只针对对象才可以 
        if (!isObject(target)) {
            return target;
        }
        const exisitingProxy = reactiveMap.get(target); // 如果缓存中有 直接使用上次代理的结果
        if (exisitingProxy) {
            return exisitingProxy;
        }
        const proxy = new Proxy(target, mutableHandlers); // 当用户获取属性 或者更改属性的时候 我能劫持到
        reactiveMap.set(target, proxy); // 将原对象和生成的代理对象 做一个映射表
        return proxy; // 返回代理
    }
    function reactive(target) {
        return createReactiveObject(target);
    }
    // readonly shallowReactive shallowReadnly 
    // export function readonly(){
    // }
    // export function shallowReactive(){
    // }
    // export function shallowReadnly(){
    // }

    exports.effect = effect;
    exports.reactive = reactive;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
