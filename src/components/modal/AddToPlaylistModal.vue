<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useUserStore } from '@/stores/user'
import modal from './modal.vue'

const props = defineProps({
  songId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close'])
const userStore = useUserStore()
const myPlaylists = ref([])
const loading = ref(false)

// --- 🌟 自定义轻提示逻辑 ---
const toastMsg = ref('')
const toastType = ref('success') // 'success' 或 'error'

const showToast = (msg, type = 'error') => {
  toastMsg.value = msg
  toastType.value = type
  // 2秒后自动清除提示
  setTimeout(() => {
    toastMsg.value = ''
  }, 2000)
}
// -------------------------

// 1. 获取用户自己创建的歌单
const fetchMyPlaylists = async () => {
  const uid = userStore.user?.id
  if (!uid) return
  try {
    const res = await api.get('/user/playlist/create', { uid, timestamp: Date.now()})
    if (res.code === 200) {
      console.log('111',res);
      myPlaylists.value = res.data.playlist
      // myPlaylists.value = res.playlist.filter(item => item.creator.userId === uid)
    }
  } catch (err) {
    console.error("获取我的歌单失败", err)
  }
}

// 2. 添加歌曲到选中歌单
const handleAddToPlaylist = async (playlistId) => {
  const trackId = props.songId;
  if (!trackId) {
    showToast('未获取到歌曲信息', 'error');
    return;
  }

  loading.value = true
  try {
    const res = await api.post('/playlist/tracks', null,{params:{
        op: 'add',
        pid: playlistId,
        tracks: props.songId,
        timestamp: Date.now()
    }})
    console.log(res);
    
    // ⭐️ 核心修改：网易云API部分接口会把真实数据包在 body 里，我们需要做一层解构或兼容提取
    // 判断真实的业务 code
    if (res.body.code === 200) {
      // 成功时显示提示
      showToast('已成功加入歌单！', 'success')
      setTimeout(() => {
        emit('close')
      }, 1000)
    } else {
      // ⭐️ 捕获到 502 等业务错误，直接展示 body.message（如："歌单内歌曲重复"）
      showToast(res.body.message || res.body.msg || '加入失败', 'error')
    }
  } catch (err) {
    // 这里现在只处理真正的网络断开或服务器 500 崩溃错误
    console.error('加入歌单报错', err);
    showToast('网络请求失败，请稍后再试', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMyPlaylists()
})
</script>

<template>
  <modal @close="emit('close')" width="400px">
    <div class="add-modal-inner">
      
      <transition name="fade">
        <div v-if="toastMsg" :class="['custom-toast', toastType]">
          {{ toastMsg }}
        </div>
      </transition>

      <div class="header">
        <h3>收藏到歌单</h3>
        <span class="close-x" @click="emit('close')">&times;</span>
      </div>

      <div class="playlist-container">
        <ul v-if="myPlaylists.length" class="my-list">
          <li 
            v-for="item in myPlaylists" 
            :key="item.id" 
            class="list-item"
            @click="handleAddToPlaylist(item.id)"
          >
            <img :src="item.coverImgUrl" class="cover" alt="">
            <div class="info">
              <p class="name">{{ item.name }}</p>
              <p class="count">{{ item.trackCount }} 首</p>
            </div>
          </li>
        </ul>
        <div v-else class="empty-tip">
          加载中或暂无创建的歌单...
        </div>
      </div>
      
      <div v-if="loading" class="loading-overlay">添加中...</div>
    </div>
  </modal>
</template>

<style scoped>
.add-modal-inner { position: relative; color: #333; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 18px; font-weight: 600; }
.close-x { font-size: 24px; color: #999; cursor: pointer; }

/* 🌟 自定义 Toast 样式 */
.custom-toast {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #fff;
  z-index: 100;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.custom-toast.success { background-color: #52c41a; }
.custom-toast.error { background-color: #f5222d; }

/* 渐变动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
/* -------------------- */

.playlist-container {
  max-height: 400px;
  overflow-y: auto;
  margin: 0 -20px; /* 让滚动条贴边 */
  padding: 0 20px;
}
.my-list { list-style: none; padding: 0; margin: 0; }
.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.list-item:hover { background: #f2f2f2; }

.cover { width: 50px; height: 50px; border-radius: 4px; object-fit: cover; margin-right: 15px; }
.info { flex: 1; }
.name { margin: 0 0 4px; font-size: 14px; color: #333; }
.count { margin: 0; font-size: 12px; color: #999; }

.empty-tip { text-align: center; color: #999; padding: 30px 0; }
.loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.7); display: flex;
  justify-content: center; align-items: center; font-weight: bold;
}
</style>