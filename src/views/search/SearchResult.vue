<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 始终从 url 提取关键词
const keyword = computed(() => (route.query.keyword || '').toString())

// 1. 放弃 type，改用你 index.js 里配置好的真实路径 (path)
const tabs = [
  { name: '综合', path: '/search/summary' },
  { name: '单曲', path: '/search/song' },
  { name: '专辑', path: '/search/album' },
  { name: '歌手', path: '/search/artist' },
  { name: '歌单', path: '/search/playlist' },
  { name: 'MV', path: '/search/mv' }
]

// 2. 切换 Tab 的逻辑改为：直接跳转对应的子路由，并带上现有的 keyword
const handleTabClick = (path) => {
  router.replace({ 
    path: path, 
    query: { keyword: keyword.value } 
  })
}

// 3. 兼容“综合页”点击“查看全部单曲”的跳转逻辑
const handleSummaryChangeTab = (type) => {
  const typeToPath = {
    1: '/search/song',
    10: '/search/album',
    100: '/search/artist',
    1000: '/search/playlist',
    1004: '/search/mv'
  }
  if (typeToPath[type]) {
    handleTabClick(typeToPath[type])
  }
}
</script>

<template>
  <div class="search-page">
    <div class="search-inner">
      <div class="search-header">
        <h2 class="title">搜索结果</h2>
        <p class="keyword-tip" v-if="keyword">
          找到与 <span class="highlight">“{{ keyword }}”</span> 相关的结果
        </p>
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
        <div v-if="keyword" class="result-list">
          <router-view v-slot="{ Component }">
            <KeepAlive>
              <component 
                :is="Component" 
                :key="route.path + keyword" 
                :keyword="keyword" 
                @change-tab="handleSummaryChangeTab" 
              />
            </KeepAlive>
          </router-view>
        </div>
        <div v-else class="status-tip">
          请在顶部搜索框输入内容开始探索
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 样式保持原样完全不变即可 */
.search-page { min-height: calc(100vh - 90px); padding: 20px 30px;}
.search-inner { max-width: 1000px; margin: 0 auto; }
.search-header { margin-bottom: 20px; }
.title { font-size: 22px; font-weight: bold; color: var(--text-primary); margin-bottom: 8px; }
.keyword-tip { font-size: 13px; color: var(--text-regular); }
.highlight { color: #507af3; font-weight: 600; }
.search-tabs { display: flex; gap: 32px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
.tab-item { padding: 12px 4px; cursor: pointer; font-size: 15px; color: var(--text-primary); position: relative; transition: all 0.3s ease; }
.tab-item:hover { color: var(--color-primary); }
.tab-item.active { color: var(--color-primary); font-weight: 600; }
.tab-item.active::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background-color: var(--color-primary); border-radius: 2px; }
.search-content{ min-height: 400px; }
.result-list { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.status-tip { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: var(--text-muted); font-size: 14px; }
</style>