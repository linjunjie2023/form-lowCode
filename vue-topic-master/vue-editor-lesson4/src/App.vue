<template>
  <div class="app">
    <Editor v-model="state" :formData="formData"></Editor>
  </div>
</template>

<script>
import { ref, provide } from "vue";
import data from "./data.json"; //data是编辑器的数据
import Editor from "./packages/editor"; //编辑器组件，App组件下就是它
import { registerConfig as config } from "./utils/editor-config"; //目前，里面有组件的配置
import Range from "./components/Range.jsx";
export default {
  components: {
    Editor,
    Range,
  },
  setup() {
    const state = ref(data);
    provide("config", config); // 将组件的配置直接传值，供其他组件使用

    const formData = ref({
      username: "zfjg",
      password: 123,
      start: 0,
      end: 100,
    });

    return {
      state,
      formData,
    };
  },
};
</script>

<style lang="scss">
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
