<template></template>

<script>
import data from "./data.json"
import { ref } from "vue"
import Editor from "./packages/editor.jsx"
export default {
  components: {

  },
  setup () {
    const data = ref(data)
  }
}


</script>

<style lang="scss">
</style>
