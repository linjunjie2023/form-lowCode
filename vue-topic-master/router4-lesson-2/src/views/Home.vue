<template>
  <div class="home">
    首页
    <hr />

    <router-link to="/a">a页面</router-link>
    <router-link to="/b">b页面</router-link>
    <hr />
    <router-view></router-view>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  beforeRouteEnter(to, from, next) {
    console.log('beforeRouterEnter', to)
  },
  beforeRouteUpdate(to, from, next) {
    console.log('beforeRouteUpdate', to)
  },
  beforeRouteLeave(to, from, next) {
    console.log('beforeRouteLeave', to)

    
  },
  mounted() {
    console.log(this.$router);
    console.log(this.$route);
  },
}
// a leave  
// b beforeEach
// b beforeEnter
// b beforeRouterEnter
// b resolve
// afterEach
</script>
