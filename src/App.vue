<script setup>
import { RouterView } from 'vue-router';
import GlobalPlayer from './components/GlobalPlayer.vue'
import TopNav from './components/header.vue/TopNav.vue'

</script>

<template>
  <div class="app">
    <TopNav></TopNav>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <GlobalPlayer></GlobalPlayer>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  /* 设置了 height: 100vh 和 overflow: hidden。这意味着整个网页窗口（window）不再滚动了。
  真正的滚动发生在 .main-content 这个 div 容器内部 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* background: #f5f7fb; */
  background: var(--bg-body);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, 'Noto Sans', sans-serif;
}
.main-content {
  flex: 1;
  margin-top: 90px;
  margin-bottom: 72px;
  /* 👇 新增这两行，创建一个独立的层叠上下文“结界” */
  overflow-y: auto;
  z-index: 0;
}
* {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}
</style>
