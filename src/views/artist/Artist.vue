<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const artistId = computed(() => route.query.id)

const artistInfo = ref({
  avatar: '',
  name: '',
  desc: ''
})

const loading = ref(false)

const fetchArtistDetail = async (id) => {
  if (!id) return
  loading.value = true
  try {
    const res = await api.get('/artist/detail', { id })
    const info = res.data.artist
    artistInfo.value = {
      avatar: info.cover || info.picUrl, // 兼容不同接口字段
      name: info.name,
      desc: info.briefDesc
    }
  } catch (err) {
    console.error('歌手详情获取失败', err)
  } finally {
    loading.value = false
  }
}

// 监听 ID 变化，重新加载数据
watch(artistId, (newId) => {
  if (newId) fetchArtistDetail(newId)
}, { immediate: true })

const tabs = [
  { name: '单曲', path: '/artist/song' },
  { name: '专辑', path: '/artist/album' },
  { name: 'MV', path: '/artist/mv' }
]

const handleTabClick = (path) => {
  router.replace({ 
    path: path, 
    query: { id: artistId.value } // 切换 Tab 时必须携带 ID
  })
}
</script>

<template>
  <div class="artist-page">
    <div class="artist-inner">
      <div v-if="loading" class="status-tip" style="padding: 60px 0;">
        歌手详情加载中...
      </div>
      <div v-else class="artist-info">
        <div class="artist-left">
          <div class="artist-avatar">
            <img :src="artistInfo.avatar" alt="歌手头像">
          </div>
          <h2 class="artist-name">{{ artistInfo.name }}</h2>
        </div>
        <div class="artist-right">
          <div class="artist-desc">{{ artistInfo.desc }}</div>
        </div>
      </div>

      <nav class="search-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.path"
          class="tab-item"
          :class="{ active: route.path === tab.path }"
          @click="handleTabClick(tab.path)"
        >
          {{ tab.name }}
        </div>
      </nav>

      <div class="search-content">
        <div class="result-list">
          <router-view v-slot="{ Component }">
            <KeepAlive>
              <component :is="Component" :key="route.fullPath" />
            </KeepAlive>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.artist-page {
  min-height: calc(100vh - 90px);
  padding: 24px 32px;
  box-sizing: border-box;
}

.artist-inner {
  max-width: 1000px;
  margin: 0 auto;
}
.title {
  margin-top:25px;
  font-size: 20px;
  font-weight: 600;
}
.tip {
  margin-top: 16px;
  font-size: 14px;
  color: #777;
}
/* 核心：歌手信息容器 - 水平排列 + 垂直居中 */
.artist-info {
  display: flex; /* 开启Flex */
  flex-direction: row; /* 水平排列（左→右） */
  align-items: center; /* 左右两部分垂直居中（关键） */
  gap: 60px; /* 左右部分的间距，避免挤在一起 */
  padding: 20px 20px; /* 上下内边距，提升美观度 */
}

/* 左半部分：头像+名字 - 垂直排列 + 内部居中 */
.artist-left {
  display: flex;
  flex-direction: column; /* 头像→名字垂直排列 */
  align-items: center; /* 内部元素水平居中 */
  flex-shrink: 0; /* 禁止左部分被压缩（关键） */
}

.artist-avatar {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  overflow: hidden;
  background: #eee;
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artist-name {
  margin-top: 14px;
  font-size: 24px;
  margin-bottom: 0; /* 清除默认margin */
}

/* 右半部分：描述 - 合理宽度 + 左对齐 */
.artist-right {
  flex: 1; /* 占满剩余宽度（关键） */
  max-width: 800px; /*限制最大宽度，避免文本过宽*/
}

.artist-desc {
  font-size: 14px;
  color: #777;
  line-height: 1.6; /* 增加行高，提升可读性 */
  margin: 0; /* 清除默认margin */
}
/* Tab 导航样式 */
.search-tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #f2f2f2;
  margin-bottom: 24px;
}

.tab-item {
  padding: 12px 4px;
  cursor: pointer;
  font-size: 15px;
  color: #333;
  position: relative;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: #ec4141;
}

.tab-item.active {
  color: #ec4141;
  font-weight: 600;
}

/* Tab 下方的红色激活横条 */
.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #ec4141;
  border-radius: 2px;
}

.search-content{
  min-height: 400px; /* 确保切换时页面不会突然塌陷 */
}
/* 状态提示（加载、空数据） */
.status-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #999;
  font-size: 14px;
}
.result-list {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>