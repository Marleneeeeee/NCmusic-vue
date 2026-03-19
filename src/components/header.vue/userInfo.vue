<script setup>
import { ref ,onMounted,watch} from "vue" // 注意：保留 ref 给 darkTheme 用
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
console.log(userStore.user.id);

const darkTheme = ref(false)
// 组件挂载时，读取本地存储的主题偏好
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    darkTheme.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
// 监听开关变化，动态修改 HTML 属性
watch(darkTheme, (newVal) => {
  if (newVal) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
})
const handleLogout = () => {
  userStore.clearUser()
}
</script>


<template>
<div class="user-menu">
    <button class="user-wrap" type="button" @click="handleAvatarClick">
        <img :src="userStore.user?.avatar" alt="用户头像">
        <div class="userinfo-row">
            <span class="user-name">{{ userStore.user?.nickname||'我的账号' }}</span>
            <span class="vipsignal" v-if="userStore.isVip">vip</span>
        </div>
    </button>
    <div class="user-dropdown">
        <button class="user-dropdown-item" type="">
        <span>夜间模式</span>
        <label class="toggle-switch">
            <input type="checkbox" v-model="darkTheme">
            <span class="toggle-slider"></span>
        </label>
        </button>
        <button class="user-dropdown-item" type="button" @click="handleLogout">退出登录</button>
    </div>
</div>
</template>


<style scoped>
.user-menu {
  position: relative;
}

.user-wrap {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  gap: 5px;
}

.user-wrap img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.userinfo-row{
  display: flex;
  align-items: center;
  gap: 5px;
}
.user-name {
  font-size: 14px;
  color: var(--text-inverse-regular);
}

.vipsignal {
  /* 魔法在这里：上1px，左右4px，下2px。故意给下方多留1px给'p'的尾巴 */
  padding: 1px 4px 2px 4px; 
  border-radius: 4px;
  background-color: var(--color-primary);
  color: var(--text-inverse-primary);
  font-size: 10px;
  flex-shrink: 0; 
  /* 确保盒子被当做一个完整的块来渲染，防止被外层容器强行压缩高度 */
  display: inline-block; 
  line-height: 1.1; /* 给文字一点点原生的呼吸空间 */
}

.user-dropdown {
  position: absolute;
  top: 38px;
  right: 0;
  min-width: 120px;
  padding: 8px 0;
  border-radius: 8px;
  background: var(--bg-hover-dark);
  box-shadow: var(--shadow-surface);
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.user-dropdown::before {
  content: "";
  position: absolute;
  top: -10px;    /* 向上延伸 10px */
  left: 0;
  right: 0;
  height: 10px;  /* 覆盖空隙 */
  background: transparent;
}
.user-dropdown-item {
  width: 100%;
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #f5f5f5;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
/* 夜间模式开关样式（超小版） */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 30px;  /* 原36px → 缩小到30px */
  height: 16px; /* 原20px → 缩小到16px */
  cursor: pointer;
  margin-left: 8px; 
}

/* 隐藏原生复选框 */
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* 开关滑动背景 */
.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #666;
  border-radius: 16px; /* 和高度一致，保持圆形边角 */
  transition: 0.3s;
}

/* 开关小圆点（同步缩小） */
.toggle-slider::before {
  position: absolute;
  content: "";
  height: 12px;  /* 原14px → 缩小到12px */
  width: 12px;   /* 原14px → 缩小到12px */
  left: 2px;     /* 原3px → 缩小到2px */
  bottom: 2px;   /* 原3px → 缩小到2px */
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

/* 开启状态：背景色（网易云红） */
.toggle-switch input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

/* 开启状态：小圆点右移（重新计算位移：30-12-2-2=14） */
.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(14px); 
}

.user-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
</style>