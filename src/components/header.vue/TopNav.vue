<script setup>
import { RouterLink} from 'vue-router'
import { useUserStore } from '@/stores/user'
import SearchBox from './SearchBox.vue'
import userInfo from './userInfo.vue'
import LoginModal from '../modal/LoginModal.vue'

const userStore = useUserStore()

</script>


<template>
<header class="top-nav">
    <div class="top-nav-inner">
        <div class="logo">
          <div class="imgwrapper">
            <img src="@/assets/imgs/logo.png" alt="">
          </div>
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
  position: fixed;
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  box-shadow: var(--shadow-header);
  z-index: 2000;
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
  /* width: 176px;  建议去掉固定宽度，让内容撑开或者给个 max-width */
  height: 69px;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 2. 图片包装层：去掉 height: 50% 和 overflow: hidden */
.imgwrapper {
  height: 40px; /* 这里决定 logo 图标显示的大小 */
  display: flex;
  align-items: center;
  border-radius: 14px;
  overflow: hidden;
}

/* 3. 图片本身：高度 100% 随包装层，宽度自动保持比例 */
.logo img {
  height: 100%; 
  width: auto;   /* 关键：宽度根据比例自适应，不拉伸 */
  display: block;
  object-fit: cover; 
}

/* 4. 文字部分：垂直居中修正 */
.logo a {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 500;
  text-decoration: none; /*去掉下划线*/
  line-height: 1;       /* 保证文字和图标对齐更精准 */
  white-space: nowrap;  /* 防止文字换行 */
}

.nav-links {
  display: flex;
  gap: 18px;
  margin-left: 45px;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 18px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-inverse-primary);
  background: var(--color-primary);
}

.nav-link.router-link-active {
  /* <router-link> 会自动检测当前浏览器的 URL 路径，给 “匹配当前路由” 的链接标签添加 router-link-active 类名 */
  color: var(--text-inverse-primary);
  background: var(--color-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
  /* 在普通文档流中，margin-left: auto 几乎没效果，但在 display: flex 的容器里，auto 边距会触发「自动吸收剩余空间」的特性： */
/* margin-left: auto → 元素左侧的所有 “可用空白空间” 会被这个 margin 自动填满； */
/* 最终效果：元素会被 “推到” 容器的最右侧（因为左边的空间全被占满了）。 */
  gap: 20px;
}

.login-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.login-btn:hover {
  background: var(--color-primary);
  color: var(--text-inverse-primary);
}
</style>


