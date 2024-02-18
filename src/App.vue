<template>
  <div class="app">
    <Editor :data="state"></Editor>
  </div>
</template>

<script>
import data from "./data.json";
import { ref } from "vue";
import Editor from "./packages/editor.jsx";
export default {
  components: {
    Editor,
  },
  setup() {
    const state = ref(data);
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
