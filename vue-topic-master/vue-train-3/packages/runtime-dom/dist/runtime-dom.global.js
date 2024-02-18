var VueRuntimeDOM = (function (exports) {
  'use strict';

  function isObject(value) {
      return typeof value === 'object' && value !== null;
  }
  function isFunction(value) {
      return typeof value === 'function';
  }
  function isString(value) {
      return typeof value === 'string';
  }
  /*
  let r = ShapeFlags.ELEMENT | ShapeFlags.FUNCTIONAL_COMPONENT; // r包含元素和函数式组件
  // 我们像看r 是不是元素
  (r & ShapeFlags.ELEMENT) > 0; // 说明包含元素
  (r & ShapeFlags.FUNCTIONAL_COMPONENT) > 0
  */
  // 二进制  00000100  位移  | & 是做权限必备的一个操作 
  // | 来组合权限 & 来判断是否包含某个权限
  //   001 |  010 => 011  =3    011 & 001 = 001   011 & 010 => 010   011 & 100  -> 000
  // 001
  // 010
  // 100

  function createVNode(type, props, children = null) {
      // 虚拟节点就是 用一个对象来描述信息的  
      // & | 
      const shapeFlag = isObject(type) ?
          6 /* COMPONENT */ :
          isString(type) ?
              1 /* ELEMENT */ :
              0;
      const vnode = {
          __v_isVNode: true,
          type,
          shapeFlag,
          props,
          children,
          key: props && props.key,
          component: null,
          el: null, // 虚拟节点对应的真实节点
      };
      if (children) {
          // 告诉此节点 是什么样的儿子 
          // 稍后渲染虚拟节点的时候 可以判断儿子是数组 就循环渲染
          vnode.shapeFlag = vnode.shapeFlag | (isString(children) ? 8 /* TEXT_CHILDREN */ : 16 /* ARRAY_CHILDREN */);
      }
      // vnode 就可以描述出来 当前他是一个什么样的节点 儿子是什么样的
      return vnode; // createApp(App)
  }

  function createAppAPI(render) {
      return (rootComponent, rootProps) => {
          const app = {
              mount(container) {
                  // 1.创造组件虚拟节点 
                  let vnode = createVNode(rootComponent, rootProps); // h函数
                  // 2.挂载的核心就是根据传入的组件对象 创造一个组件的虚拟节点 ，在将这个虚拟节点渲染到容器中
                  render(vnode, container);
              }
          };
          return app;
      };
  }

  // effect1(()=>{
  //     state.name
  //     effect2(()=>{
  //         state.age;
  //     })
  //     state.address
  // })
  // // effectStack = [effect1] activeEffect = effect1
  // // effect1 -> name
  // // effect2 -> age
  // // effect1 -> address
  let effectStack = []; // 目的就是为了能保证我们effect执行的时候 可以存储正确的关系
  let activeEffect;
  function cleanupEffect(effect) {
      const { deps } = effect;
      for (let dep of deps) {
          // set 删除effect 让属性 删除掉对应的effect   name = []
          dep.delete(effect); // 让属性对应的effect移除掉，这样属性更新的时候 就不会触发这个effect重新执行了
      }
  }
  // 属性变化 触发的是 dep -> effect
  // effect.deps = [] 和属性是没关系的
  class ReactiveEffect {
      constructor(fn, scheduler) {
          this.fn = fn;
          this.scheduler = scheduler;
          this.active = true; // this.active = true;
          this.deps = []; // 让effect 记录他依赖了哪些属性 ， 同时要记录当前属性依赖了哪个effect
      }
      run() {
          if (!this.active) { // 稍后如果非激活状态 调用run方法 默认会执行fn函数
              return this.fn();
          }
          if (!effectStack.includes(this)) { // 屏蔽同一个effect会多次执行
              try {
                  effectStack.push(activeEffect = this);
                  return this.fn(); // 取值  new Proxy 会执行get方法  (依赖收集)
              }
              finally {
                  effectStack.pop(); // 删除最后一个
                  activeEffect = effectStack[effectStack.length - 1];
              }
          }
      }
      stop() {
          if (this.active) {
              cleanupEffect(this);
              this.active = false;
          }
      }
  }
  // obj name :[effect]
  //     age : [effect]
  // {对象：{属性 ： [effect,effect]}  } 
  function isTracking() {
      return activeEffect !== undefined;
  }
  const targetMap = new WeakMap();
  function track(target, key) {
      // 是只要取值我就要收集吗？
      if (!isTracking()) { // 如果这个属性 不依赖于effect直接跳出即可
          return;
      }
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map())); // {对象：map{}}
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set())); // {对象：map{name:set[]}}
      }
      trackEffects(dep);
  }
  function trackEffects(dep) {
      let shouldTrack = !dep.has(activeEffect); // 看一下这个属性有没有存过这个effect
      if (shouldTrack) {
          dep.add(activeEffect); // // {对象：map{name:set[effect,effect]}}
          activeEffect.deps.push(dep); // 稍后用到
      } // { 对象：{name:set,age:set}
  }
  function trigger(target, key) {
      let depsMap = targetMap.get(target);
      if (!depsMap)
          return; // 属性修改的属性 根本没有依赖任何的effect
      let deps = []; // [set ,set ]
      if (key !== undefined) {
          deps.push(depsMap.get(key));
      }
      let effects = [];
      for (const dep of deps) {
          effects.push(...dep);
      }
      triggerEffects(effects);
  }
  function triggerEffects(dep) {
      for (const effect of dep) { // 如果当前effect执行 和 要执行的effect是同一个，不要执行了 防止循环
          if (effect !== activeEffect) {
              if (effect.scheduler) {
                  return effect.scheduler();
              }
              effect.run(); // 执行effect
          }
      }
  }
  function effect(fn) {
      const _effect = new ReactiveEffect(fn);
      _effect.run(); // 会默认让fn执行一次
      let runner = _effect.run.bind(_effect);
      runner.effect = _effect; // 给runner添加一个effect实现 就是 effect实例
      return runner;
  }
  // vue3 的响应式原理  取值时 收集对应的effect， 改值时找到对应的effect执行

  const mutableHandlers = {
      get(target, key, recevier) {
          if (key === "__v_isReactive" /* IS_REACTIVE */) {
              return true;
          }
          track(target, key);
          // 这里取值了， 可以收集他在哪个effect中
          const res = Reflect.get(target, key, recevier); // target[key]
          return res;
      },
      set(target, key, value, recevier) {
          let oldValue = target[key];
          // 如果改变值了， 可以在这里触发effect更新
          const res = Reflect.set(target, key, value, recevier); // target[key] = value
          if (oldValue !== value) { // 值不发生变化 effect不需要重新执行
              trigger(target, key); // 找属性对应的effect让她重新执行
          }
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
  function toReactive(value) {
      return isObject(value) ? reactive(value) : value;
  }
  // readonly shallowReactive shallowReadnly 
  // export function readonly(){
  // }
  // export function shallowReactive(){
  // }
  // export function shallowReadnly(){
  // }

  class ComputedRefImpl {
      constructor(getter, setter) {
          this.setter = setter;
          this._dirty = true; // this._dirty = true;
          this.__v_isRef = true;
          // 这里将计算属性包成一个effect
          // 这里 我给计算属性变成了effect ，那么计算属性中的属性会收集这个effect
          this.effect = new ReactiveEffect(getter, () => {
              // 稍后计算属性依赖的值变化 不要重新执行计算属性的effect，而是调用此函数
              if (!this._dirty) {
                  this._dirty = true;
                  triggerEffects(this.dep);
              }
          });
      }
      get value() {
          if (isTracking()) { // 是否是在effect中取值的
              trackEffects(this.dep || (this.dep = new Set));
          }
          if (this._dirty) {
              // 将结果缓存到this._value 这样就不用每次都run了
              this._value = this.effect.run();
              this._dirty = false;
          }
          return this._value;
      }
      set value(newValue) {
          this.setter(newValue); // 如果修改计算属性的值 就触发你自己的set方法
      }
  }
  function computed(getterOrOptions) {
      const onlyGetter = isFunction(getterOrOptions);
      let getter;
      let setter;
      if (onlyGetter) {
          getter = getterOrOptions;
          setter = () => { };
      }
      else {
          getter = getterOrOptions.get;
          setter = getterOrOptions.set;
      }
      return new ComputedRefImpl(getter, setter);
  }

  class RefImpl {
      constructor(_rawValue) {
          this._rawValue = _rawValue;
          // _rawValue如果用户传进来的值 是一个对象 我需要将对象转化成响应式
          this._value = toReactive(_rawValue);
      }
      // 类的属性访问器 最终会变成deifneProperty
      get value() {
          if (isTracking()) {
              trackEffects(this.dep || (this.dep = new Set()));
              console.log(this.dep);
          }
          return this._value;
      }
      set value(newValue) {
          if (newValue !== this._rawValue) {
              // 先看一下之前之后是否一样
              this._rawValue = newValue;
              this._value = toReactive(newValue);
              triggerEffects(this.dep);
          }
      }
  }
  function createRef(value) {
      return new RefImpl(value);
  }
  function ref(value) {
      return createRef(value);
  }
  // export function shallowRef(value){
  //   return createRef(value,true);
  // }
  // reactive readonly

  // runtime-core  根平台无关的运行时  
  function createRenderer(renderOptions) {
      const mountComponent = (initialVNode, container) => {
          // 根据组件的虚拟节点 创造一个真实节点 ， 渲染到容器中
          console.log(initialVNode, container);
      };
      const processComponent = (n1, n2, container) => {
          if (n1 == null) {
              // 组件的初始化
              mountComponent(n2, container);
          }
      };
      const patch = (n1, n2, container) => {
          if (n1 == n2)
              return;
          const { shapeFlag } = n2; // createApp(组件)
          if (shapeFlag & 6 /* COMPONENT */) {
              processComponent(n1, n2, container);
          }
      };
      const render = (vnode, container) => {
          // 后续还有更新 patch  包含初次渲染 还包含更新
          patch(null, vnode, container); // 后续更新 prevNode nextNode container
      };
      // 
      return {
          createApp: createAppAPI(render),
          render
      };
  }

  const nodeOps = {
      insert: (child, parent, anchor = null) => {
          parent.insertBefore(child, anchor); // parent.appendChild(child)
      },
      remove: child => {
          const parent = child.parentNode;
          if (parent) {
              parent.removeChild(child);
          }
      },
      createElement: tag => document.createElement(tag),
      createText: text => document.createTextNode(text),
      setElementText: (el, text) => el.textContent = text,
      setText: (node, text) => node.nodeValue = text,
      parentNode: node => node.parentNode,
      nextSibling: node => node.nextSibling,
      querySelector: selector => document.querySelector(selector)
  };
  // runtime-dom 提供 节点操作的api -> 传递给 runtime-core

  // 需要比对属性 diff算法    属性比对前后值
  function patchClass(el, value) {
      if (value == null) {
          el.removeAttribute('class');
      }
      else {
          el.className = value;
      }
  }
  function patchStyle(el, prev, next) {
      const style = el.style; // 操作的是样式
      // 最新的肯定要全部加到元素上
      for (let key in next) {
          style[key] = next[key];
      }
      // 新的没有 但是老的有这个属性, 将老的移除掉
      if (prev) {
          for (let key in prev) {
              if (next[key] == null) {
                  style[key] = null;
              }
          }
      }
  }
  function createInvoker(value) {
      const invoker = (e) => {
          invoker.value(e);
      };
      invoker.value = value; // 存储这个变量, 后续想换绑 可以直接更新value值
      return invoker;
  }
  function patchEvent(el, key, nextValue) {
      // vei  vue event invoker  缓存绑定的事件 
      const invokers = el._vei || (el._vei = {}); // 在元素上绑定一个自定义属性 用来记录绑定的事件
      let exisitingInvoker = invokers[key]; // 先看一下有没有绑定过这个事件
      if (exisitingInvoker && nextValue) { // 换绑逻辑
          exisitingInvoker.value = nextValue;
      }
      else {
          const name = key.slice(2).toLowerCase(); // eventName
          if (nextValue) {
              const invoker = invokers[key] = createInvoker(nextValue); // 返回一个引用
              el.addEventListener(name, invoker); // 正规的时间 onClick =(e)=>{}
          }
          else if (exisitingInvoker) {
              // 如果下一个值没有 需要删除
              el.removeEventListener(name, exisitingInvoker);
              invokers[key] = undefined; // 解绑了
          }
          // else{
          //     // 压根没有绑定过 事件就不需要删除了
          // }
      }
  }
  function patchAttr(el, key, value) {
      if (value == null) {
          el.removeAttribute(key);
      }
      else {
          el.setAttribute(key, value);
      }
  }
  const patchProp = (el, key, prevValue, nextValue) => {
      if (key === 'class') { // 类名 
          patchClass(el, nextValue); // 
      }
      else if (key === 'style') { // 样式
          patchStyle(el, prevValue, nextValue);
      }
      else if (/^on[^a-z]/.test(key)) { // onXxx
          // 如果有事件 addEventListener  如果没事件 应该用removeListener
          patchEvent(el, key, nextValue);
          // 绑定一个 换帮了一个  在换绑一个
      }
      else {
          // 其他属性 setAttribute
          patchAttr(el, key, nextValue);
      }
  };

  // 需要涵盖我们的 dom操作的api 属性操作的api  ， 将这些api 传入到 我们的runtime-core中
  Object.assign(nodeOps, { patchProp }); // 包含所需要的所有api
  // 实现将renderOptions 传入到core中
  // runtime-dom  在这层 对我们浏览器的操作做了一些
  const createApp = (component, rootProps = null) => {
      // 需要创建一个渲染器
      const { createApp } = createRenderer(); // runtime-core中的方法
      let app = createApp(component, rootProps);
      let { mount } = app; // 获取core中mount
      app.mount = function (container) {
          container = nodeOps.querySelector(container);
          container.innerHTML = '';
          mount(container); // 处理节点后传入到mount中
      };
      return app;
  };
  const createSSRApp = () => {
  };

  exports.computed = computed;
  exports.createApp = createApp;
  exports.createRenderer = createRenderer;
  exports.createSSRApp = createSSRApp;
  exports.effect = effect;
  exports.reactive = reactive;
  exports.ref = ref;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=runtime-dom.global.js.map
