<template>
  <div class="app">
    <Editor v-model="state"></Editor>
  </div>
</template>

<script>
import data from "./data.json"
import { ref } from "vue"
import Editor from "./packages/editor.jsx"
export default {
  components: {
    Editor,
  },
  setup () {
    const state = ref(data)

    return {
      state
    }
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
