<script setup>
// 1. 引入 Vue 核心
import { ref, watch } from 'vue'
// 2. 引入路由
import { useRouter, useRoute } from 'vue-router'
// 3. 引入网络请求和工具
import api from '@/api'
import { debounce } from '@/utils/debounce'
// 4. 引入全局状态（用于存历史记录）
import { useSearchStore } from '@/stores/searchHistory'

const router = useRouter()
const route = useRoute()
const searchStore = useSearchStore()

const isSearchFocused = ref(false) // 记录输入框是否聚焦
const searchKeyword = ref('')      // 搜索关键字
const suggestArtists=ref([])     // 下拉建议歌曲
const suggestSongs = ref([])        // 下拉建议歌曲
const suggestAlbums = ref([])        // 下拉建议专辑

watch(() => route.path, (newPath) => {
  // 假设你的搜索结果页的路由地址是包含 '/search' 的（比如 /search?keyword=xxx）
  // 如果当前跳转的新路径不包含 '/search'，说明离开了搜索结果页
  if (!newPath.includes('/search')) {
    searchKeyword.value = ''; // 清空输入框文字
  }
})

// 防抖请求函数：延迟 200ms 请求
const fetchSuggestions = debounce(async (kw) => {
  if (!kw) {
    suggestArtists.value = []
    suggestSongs.value = []
    suggestAlbums.value = []
    return
  }
  try {
    const res = await api.get('/search/suggest', {keywords:kw})
    console.log(res.result)
    suggestArtists.value = res.result?.artists || []
    suggestSongs.value = res.result?.songs || []
    suggestAlbums.value = res.result?.albums || []
  } catch (err) {
    console.log('获取搜索建议失败', err)
  }
}, 200)

// 监听关键字变化，触发防抖请求
watch(searchKeyword, (newVal) => {
  fetchSuggestions(newVal.trim())
})

// 执行搜索并跳转
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if(!keyword) return
  
  // 存入全局历史记录
  searchStore.addHistory(keyword)
  
  // 路由跳转
  router.push({
    name: 'search',
    query: { keyword }
  })
  
  // 收起下拉框并失去焦点
  isSearchFocused.value = false
  document.activeElement?.blur()
}

// 点击建议列表项
const handleSuggestionClick = (keyword) => {
  searchKeyword.value = keyword 
  handleSearch()               
}

// 点击历史记录
const handleHistoryClick = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 延迟隐藏下拉框（防止点击历史记录时，失去焦点导致面板瞬间消失而点不到）
const handleBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 200)
}
</script>

<template>
<div class="search-box">
    <input 
        type="text" 
        class="search-input" 
        placeholder="搜索歌曲/歌手/专辑" 
        v-model="searchKeyword" 
        @keyup.enter="handleSearch"
        @focus="isSearchFocused = true"
        @blur="isSearchFocused = false"
    >
    <IconSearch class="search-icon" theme="outline" size="16" fill="#aaa" @click="handleSearch()"/>

    <div 
        class="search-dropdown" 
        v-show="isSearchFocused && (
        (!searchKeyword && searchStore.history.length > 0) || 
        (searchKeyword && (suggestSongs.length > 0 || suggestArtists.length > 0 || suggestAlbums.length > 0))
        )"
    >
        <div v-if="!searchKeyword" class="history-panel">
        <div class="history-header">
            <span class="history-title">搜索历史</span>
            <span class="history-clear" @mousedown.prevent="searchStore.clearHistory()">清空</span>
        </div>
        <div class="history-tags">
            <span 
            class="history-tag" 
            v-for="item in searchStore.history" 
            :key="item"
            @mousedown.prevent="handleHistoryClick(item)"
            >
            {{ item }}
            </span>
        </div>
        </div>

        <div v-else class="suggest-panel">
            <div v-if="suggestArtists.length > 0">
                <div class="suggest-title">歌手</div>
                <ul>
                    <li 
                    v-for="artist in suggestArtists" 
                    :key="artist.id" 
                    class="suggest-item"
                    @mousedown.prevent="handleSuggestionClick(artist.name)"
                    >
                    <span class="suggest-name">{{ artist.name }}</span>
                    </li>
                </ul>
            </div>
            <div v-if="suggestSongs.length > 0">
                <div class="suggest-title">单曲</div>
                <ul>
                    <li 
                        class="suggest-item" 
                        v-for="song in suggestSongs" 
                        :key="song.id"
                        @mousedown.prevent="handleSuggestionClick(song.name)"
                    >
                        <span class="suggest-name">{{ song.name }}</span>
                        <span class="suggest-artist">- {{ (song.artists || []).map(a => a.name).join('/') }}</span>
                    </li>
                </ul>
            </div>
            <div v-if="suggestAlbums.length > 0">
                <div class="suggest-title">专辑</div>
                <ul>
                    <li 
                        class="suggest-item" 
                        v-for="album in suggestAlbums" 
                        :key="album.id"
                        @mousedown.prevent="handleSuggestionClick(album.name)"
                    >
                        <span class="suggest-name">{{ album.name }}</span>
                        <span class="suggest-artist">- {{ (album.artists || []).map(a => a.name).join('/') }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.search-box {
  width: 190px; /* 稍微加宽一点，给内容留呼吸空间 */
  height: 32px;
  background: #fff;
  border-radius: 16px;
  margin-right: 16px;
  display: flex;
  align-items: center; /* 垂直居中 */
  padding: 0 12px;     /* 左右内边距，让图标和文字不贴边 */
  position: relative;
}

.search-input {
  flex: 1;            /* 自动占据除了图标以外的所有空间 */
  height: 20px;       /* 稍微小于容器高度，避免挤压 */
  border: none;
  outline: none;
  font-size: 12px;
  background: transparent;
  line-height: 20px;
}
.search-icon {
  cursor: pointer;
  display: flex;      /* 使用 flex 让 svg 自身也居中 */
  align-items: center;
  margin-left: 4px;   /* 与输入框保持微小间距 */
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* 历史记录下拉面板 */
/* 下拉面板主容器 */
.search-dropdown {
  position: absolute;
  top: 42px;
  left: -20px;
  width: 300px;
  background: var(--bg-surface);
  border-radius: 8px;
  box-shadow: var(--shadow-surface);
  padding: 16px;
  z-index: 100;
}

/* 历史记录相关样式 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.history-title { font-size: 14px; color: var(--text-regular); }
.history-clear { font-size: 12px; color: var(--text-muted); cursor: pointer; }
.history-clear:hover { color: var(--text-primary); }
.history-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.history-tag {
  padding: 4px 12px;
  background: var(--bg-hover);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
}
.history-tag:hover { background: var(--border-color); }

/* 搜索建议列表样式 */
.suggest-panel {
  /* 去掉容器多余的 padding，让长条 item 填满 */
  margin: -8px; 
}
.suggest-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}
.suggest-title{
    color: var(--text-primary);
    font-size: 14px;
    padding-left: 8px;
    font-weight: 400;
}
.suggest-item:hover {
  background: var(--bg-hover);
}
.suggest-name {
  color: var(--text-primary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}
.suggest-artist {
  color: var(--text-muted);
  font-size: 12px;
  margin-left: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
</style>