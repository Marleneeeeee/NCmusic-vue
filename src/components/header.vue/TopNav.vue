<script setup>
import { RouterLink} from 'vue-router'
import { useUserStore } from '@/stores/user'
import SearchBox from './SearchBox.vue'
import userInfo from './userInfo.vue'
import LoginModal from '../modal/LoginModal.vue'
import {ref} from 'vue'

const userStore = useUserStore()

</script>


<template>
<header class="top-nav">
    <div class="top-nav-inner">
        <div class="logo">
            <a href="#">网易云音乐</a>
        </div>
        <nav class="nav-links">
            <router-link to="/" class="nav-link">音乐馆</router-link>
            <router-link to="/mymusic" class="nav-link">我的音乐</router-link>
        </nav>
        <div class="nav-actions">
            <searchBox></searchBox>
            <span 
              v-if="!userStore.isLoggedIn" 
              class="login-btn" 
              @click="userStore.isLoginModalVisible = true"
            >
              登录
            </span>
            <userInfo v-else></userInfo>
        </div>
    </div>
</header>
<LoginModal 
    v-if="userStore.isLoginModalVisible" 
    @close="userStore.isLoginModalVisible = false" 
  />
      
</template>


<style scoped>

.top-nav {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #242424;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.top-nav-inner {
  /* width: 100% 是 “保底”（小屏幕下占满），max-width: 1200px 是 “封顶”（大屏幕下不超宽） */
  width: 100%;
  max-width: 1200px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.logo {
  background: url(@/assets/imgs/topbar.png) no-repeat;
  width: 176px;
  height: 69px;
  background-position: 0 0;
}

.logo a{
  /* logo 里的 <a> 标签：承载 “网易云音乐” 文字，满足 SEO / 可访问性 / 图片失效兼容，同时作为首页链接； */
/* text-indent: -9999px：视觉上隐藏文字，只显示背景图，但保留文字的语义价值； */
  width: 157px;
  height: 100%;
  display: block;
  padding-right: 20px;
  text-indent: -9999px;
}

.nav-links {
  display: flex;
  gap: 24px;
  margin-left: 24px;
}

.nav-link {
  color: #e5e5e5;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 18px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #fff;
  background: #c20c0c;
}

.nav-link.router-link-active {
  /* <router-link> 会自动检测当前浏览器的 URL 路径，给 “匹配当前路由” 的链接标签添加 router-link-active 类名 */
  color: #fff;
  background: #c20c0c;
}

.nav-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  /* 在普通文档流中，margin-left: auto 几乎没效果，但在 display: flex 的容器里，auto 边距会触发「自动吸收剩余空间」的特性： */
/* margin-left: auto → 元素左侧的所有 “可用空白空间” 会被这个 margin 自动填满； */
/* 最终效果：元素会被 “推到” 容器的最右侧（因为左边的空间全被占满了）。 */
}

.login-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #c20c0c;
  color: #c20c0c;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #c20c0c;
  color: #ffffff;
}
</style>


