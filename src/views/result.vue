<script setup>
import { useRoute} from 'vue-router';
import { computed} from 'vue'
import SongList from '@/components/SongList.vue'
import SearchSummary from '@/components/SearchSummary.vue'
import ArtistList from '@/components/ArtistList.vue'
import PlaylistList from '@/components/PlaylistList.vue'
import MvList from '@/components/MvList.vue'
import AlbumList from '@/components/AlbumList.vue';

const route = useRoute()

const keyword = computed(() => (route.query.keyword || '').toString())

// 1. 定义 Tab 配置
const tabs = [
  { name: '综合', type: 1018 },
  { name: '单曲', type: 1 },
  { name: '专辑', type: 10 },
  { name: '歌手', type: 100 },
  { name: '歌单', type: 1000 },
  { name: 'MV', type: 1004 }
]
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
          v-for="tab in tabs" :key="tab.type"
          class="tab-item" :class="{ active: activeTab === tab.type }"
          @click="activeTab = tab.type"
        >
          {{ tab.name }}
        </div>
      </nav>

      <div class="search-content">
        <div v-if="loading && offset === 0" class="status-tip">
          <div class="loading-icon"></div>
          正在搜索中...
        </div>

        <div v-else-if="keyword" class="result-list">
          <SearchSummary v-if="activeTab === 1018" :searchData="searchResSum" @change-tab="(type) => activeTab = type" />
          <SongList v-else-if="activeTab === 1" :songlist="searchResSongs" />
          <AlbumList v-else-if="activeTab === 10" :albums="searchResAlbums" />
          <ArtistList v-else-if="activeTab === 100" :artists="searchResArtists" />
          <PlaylistList v-else-if="activeTab === 1000" :playlists="searchResPlaylists" />
          <MvList v-else-if="activeTab === 1004" :mvs="searchResMv" />

          <div v-if="isResultEmpty" class="status-tip">
            未找到相关的内容，换个关键词试试吧
          </div>

          <div class="bottom-tip" v-if="activeTab !== 1018 && !isResultEmpty">
            <span v-if="loadingMore">正在努力加载更多...</span>
            <span v-else-if="!hasMore">—— 已经到底啦 ——</span>
          </div>
        </div>

        <div v-else class="status-tip">
          请在顶部搜索框输入内容开始探索
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: calc(100vh - 90px);
  padding: 20px 30px;
  background-color: #fff;
}

.search-inner {
  max-width: 1000px;
  margin: 0 auto;
}

/* 头部样式 */
.search-header {
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.keyword-tip {
  font-size: 13px;
  color: #666;
}

.highlight {
  color: #507af3; /* 或者使用网易红 #ec4141 */
  font-weight: 600;
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

.loading-icon {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ec4141;
  border-radius: 50%;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-list {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.bottom-tip {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 14px;
}
</style>