<script setup>
import { ref, watch, onUnmounted } from 'vue'
import api from '@/api'
import PlaylistList from '@/components/playlist/PlaylistList.vue'

const props = defineProps({ keyword: { type: String, required: true } })

const items = ref([])
const offset = ref(0)
const limit = 30
const hasMore = ref(true)
const loading = ref(false)
const loadingMore = ref(false)
const loadMoreRef = ref(null)
let observer = null

const fetchResults = async () => {
  const kw = props.keyword.trim()
  if (!kw || loadingMore.value || !hasMore.value) return
  if (offset.value === 0) loading.value = true
  else loadingMore.value = true

  try {
    const res = await api.get('/search', {
      keywords: kw,
      type: 1000,
      limit,
      offset: offset.value,
      timestamp: Date.now()
    })
    if (res.code === 200 && res.result) {
      const data = res.result
      const newPlaylists = (data.playlists||[]).map((l)=>({
        id: l.id,
        title: l.name,
        cover: l.coverImgUrl,
        desc: l.description,
        trackCount: l.trackCount,
        playCount: l.playCount
      }))
      items.value = [...(items.value || []), ...newPlaylists]
      offset.value += limit
      if ((data.playlists?.length || 0) < limit) hasMore.value = false
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('搜索歌单出错', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

watch(() => props.keyword, (newVal) => {
  if (newVal) {
    items.value = []
    offset.value = 0
    hasMore.value = true
    fetchResults()
  }
}, { immediate: true })

watch(loadMoreRef, (newEl) => {
  if (newEl) {
    if (observer) observer.disconnect()
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loadingMore.value && !loading.value) {
        fetchResults()
      }
    }, { rootMargin: '150px' })
    observer.observe(newEl)
  }
})
onUnmounted(() => { if (observer) observer.disconnect() })
</script>

<template>
  <div class="search-playlist">
    <div v-if="loading && offset === 0" class="status-tip">
      <div class="loading-icon"></div>正在搜索中...
    </div>
    <div v-else-if="items.length > 0">
      <PlaylistList :playlists="items" />
      <div ref="loadMoreRef" class="bottom-tip">
        <span v-if="loadingMore">正在努力加载更多...</span>
        <span v-else-if="!hasMore">—— 已经到底啦 ——</span>
      </div>
    </div>
    <div v-else-if="!loading && items.length === 0" class="status-tip">
      未找到相关的内容，换个关键词试试吧
    </div>
  </div>
</template>

<style scoped>
.status-tip { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: #999; font-size: 14px; }
.loading-icon { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #ec4141; border-radius: 50%; margin-bottom: 12px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.bottom-tip { text-align: center; padding: 30px 0; color: #999; font-size: 14px; }
</style>