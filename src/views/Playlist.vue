<script setup>
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, computed, ref, watch } from 'vue' // 移除了 nextTick
import api from '@/api'
import SongList from '@/components/SongList.vue'
import { formatCount } from '@/utils/formatCount'
import { useUserStore } from '@/stores/user';

const userStore = useUserStore()
const route = useRoute()

const playlistId = computed(() => route.query.id)
console.log('歌单id为',playlistId.value);


const playlistName = ref('')
const playlistCover = ref('')
const playlistTrackCount = ref(0)
const playlistPlayCount = ref(0)
const playlistUserId = ref(0)
const playlistSpecialType=ref(0)
const allSongs = ref([])
const coverImgUrl = ref('')
const loading = ref(false)

let liked = ref(false)

// --- 分页与触底加载相关的状态 ---
const limit = 50 // 每次加载 50 首
const offset = ref(0) // 偏移量
const loadingMore = ref(false) // 是否正在加载更多，防止重复触发
const hasMore = ref(true) // 是否还有更多歌曲

// 1. 创建侦察兵的 ref 和 observer 实例
const loadMoreRef = ref(null)
let observer = null

// 修改之前的 isMyPlaylist，或者新建一个更准确的计算属性
const canDeleteSong = computed(() => {
  return Boolean(
    userStore.user?.id && 
    playlistUserId.value === userStore.user.id && 
    playlistSpecialType.value === 0 // 核心：必须是 0（普通歌单）才允许删除单曲
  )
})

const initLikeStatus = async () => {
  if (!playlistId.value) return
  try {
    const res = await api.get('/playlist/detail/dynamic', {
      id: playlistId.value,
      timestamp: Date.now()
    })
    liked.value = res.subscribed
  } catch (err) {
    console.log('获取状态失败', err)
  }
}

// 重置列表状态（处理切换歌单的场景）
const resetListState = () => {
  allSongs.value = []
  offset.value = 0
  hasMore.value = true
  loadingMore.value = false
}

// 在 script 顶部定义一个防抖锁
const isSubmitting = ref(false)

const toggleLikeStatus = async (listid) => {
  // 1. 如果正在请求中，直接抛弃新的点击事件，防止手快连点
  if (isSubmitting.value) return 
  isSubmitting.value = true

  try {
    // 2. 根据当前状态决定 t 的值 (1: 收藏, 2: 取消收藏)
    const t = liked.value ? 2 : 1 
    
    // 3. 发送请求：去掉了 randomCNIP: true，防止触发风控拦截
    const res = await api.get('/playlist/subscribe', { 
      t, 
      id: listid, 
      timestamp: Date.now() 
    })

    // 4. 只有接口明确返回 200 成功，才切换本地红心的显示状态
    if (res?.code === 200) {
      liked.value = !liked.value
    } else {
      console.log('操作失败，网易云返回：', res)
    }
  } catch (err) {
    console.log('收藏/取消收藏失败', err)
  } finally {
    // 5. 不管成功失败，请求结束就解锁
    isSubmitting.value = false
  }
}

const fetchPlayListDetail = async () => {
  const id = playlistId.value
  if (!id) return
  loading.value = true
  try {
    const res = await api.get("/playlist/detail", { id })
    const detail = res.playlist
    if (detail) {
      playlistName.value = detail.name || "歌单"
      playlistCover.value = detail.coverImgUrl || ''
      playlistTrackCount.value = detail.trackCount
      playlistPlayCount.value = detail.playCount
      coverImgUrl.value = detail.coverImgUrl
      playlistUserId.value = detail.userId
      playlistSpecialType.value=detail.specialType
      // specialType: 0：普通歌单（用户自己手动创建的，可以删除）
      // specialType: 5：“我喜欢的音乐”（系统自动生成的，不可删除）
      // specialType: 10 等：其他系统或特殊业务歌单
    }
  } catch (err) {
    console.log("获取歌单详情失败", err)
  } finally {
  }
}

// 分页获取歌曲
const fetchPlaylistSongs = async () => {
  const id = playlistId.value
  // 如果没有 id，或者没有更多数据了，或者正在加载中，则不发请求
  if (!id || !hasMore.value || loadingMore.value) return
  loadingMore.value = true
  try {
    // 增加 limit 和 offset 参数
    const res = await api.get('/playlist/track/all', { 
      id, 
      limit, 
      offset: offset.value,
      timestamp: Date.now() 
    })
    
    const newSongs = res.songs?.map((s) => ({
      id: s.id,
      name: s.name,
      artist: (s.ar || s.artists || []).map((a) => a.name).join('/') || '未知歌手',
      duration: s.dt || s.duration || 0,
      album: (s.al || s.album)?.name || '',
      mvid: s.mv || s.mvid || 0,
      fee:s.fee
    })) || []
    console.log(newSongs);
    
    // 将新数据追加到已有数组后面，而不是覆盖
    allSongs.value = [...allSongs.value, ...newSongs]
    // 更新下一次的 offset
    offset.value += limit
    // 判断是否已经获取完所有歌曲
    if (newSongs.length < limit || allSongs.value.length >= playlistTrackCount.value) {
      hasMore.value = false
    }
  } catch (err) {
    console.log('获取歌单歌曲失败', err)
  } finally {
    loadingMore.value = false
    loading.value = false
  }
}


// 统一监听 playlistId 变化，执行初始化
watch(
  () => playlistId.value, 
  (newVal) => {
    if (newVal) {
      resetListState()       // 1. 重置分页状态
      initLikeStatus()       // 2. 获取收藏状态 (已补回)
      fetchPlayListDetail()  // 3. 获取歌单详情
      fetchPlaylistSongs()   // 4. 获取第一页歌曲
    }
  },
  { immediate: true }
)

// 使用 watch 监听侦察兵 DOM 元素的出现
watch(loadMoreRef, (newEl) => {
  // 如果元素出现了
  if (newEl) {
    // 先断开旧的（以防重复绑定）
    if (observer) observer.disconnect()
    
    // 创建新的观察器
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loadingMore.value) {
        console.log('侦察兵露头了，去拉取新数据！')
        fetchPlaylistSongs() // 触发你的加载函数
      }
    }, { rootMargin: '100px' }) // 距离底部 100px 就提前加载
    
    // 绑定侦察兵
    observer.observe(newEl)
  }
})

// ... 原本的代码 ...

// 新增：处理歌曲删除成功后的本地列表更新
const onSongDeleted = (deletedSongId) => {
  // 直接从本地数组中剔除这首歌，页面会瞬间响应，不需要重新发网络请求
  allSongs.value = allSongs.value.filter(song => song.id !== deletedSongId)
  
  // (可选) 如果你想让左上角的总数量也跟着减 1
  if (playlistTrackCount.value > 0) {
    playlistTrackCount.value--
  }
}

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
<div class="playlist-page" :style="{ 
  background: coverImgUrl 
    ? `linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.9)), url(${coverImgUrl}) no-repeat center center` 
    : 'none',
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed'
}">
  <div class="playlist-inner">
    <h2 class="title">{{ playlistName }}</h2>
    <div v-if="loading && offset === 0" class="tip">歌单加载中...</div>
    <template v-else-if="allSongs.length > 0">
      <div class="num-info">
        <span>{{ playlistTrackCount }} 首</span>
        <div class="playcount">
          <IconHaedphone theme="filled" size="20" fill="#c20c0c" class="headphone-icon"/>
          <span class="playcount-num">{{formatCount(playlistPlayCount)}}次播放</span>
        </div>
      </div>
      
      <div class="listlike" v-if="userStore.user?.id&&playlistUserId !== userStore.user.id">
        <span class="like-text">收藏歌单</span>
        <IconLike 
          v-if="!liked" 
          theme="outline" 
          size="24" 
          fill="#666" 
          class="like-icon" 
          @click="toggleLikeStatus(playlistId)"
        />
        <IconLike 
          v-else 
          theme="filled" 
          size="24" 
          fill="#c20c0c" 
          class="like-icon" 
          @click="toggleLikeStatus(playlistId)"
        />
      </div>
      
      <SongList :songlist="allSongs" :showDelete="canDeleteSong" :id="playlistId" @delete-success="onSongDeleted"></SongList>

      <div class="bottom-tip" ref="loadMoreRef">
        <span v-if="loadingMore">正在加载更多歌曲...</span>
        <span v-else-if="!hasMore">—— 已经到底啦 ——</span>
      </div>

    </template>
    <div v-else class="tip">暂无歌曲...</div>
  </div>
</div>
</template>

<style scoped>
/* 保持原有样式不变 */
.playlist-page {
  min-height: calc(100vh - 90px);
  padding: 24px 32px;
}

.playlist-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}

.num-info{
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.playcount{
  display: flex;
  align-items: center;
  gap: 8px;
}

.headphone-icon{
  display: flex;
}

.listlike{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.like-text{
  font-size: 18px;
  color:var(--text-muted)
}

.like-icon{
  display: flex;
}

.bottom-tip {
  text-align: center;
  padding: 20px 0;
  color: var(--text-muted);
  font-size: 14px;
}
</style>