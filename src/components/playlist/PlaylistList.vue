<script setup>
import PlayListCard from './PlayListCard.vue';
const { playlists } = defineProps({ 
    playlists: {                    
        type: Array,
        required: true
    }
})
</script>

<template>
<ul class="playlist-list" v-if="playlists&&playlists.length>0">
    <PlayListCard 
        v-for="playlist in playlists"
        :key="playlist.id"
        :item="playlist"
    >
    </PlayListCard>
</ul>
<div v-else>暂无歌单数据</div>
</template>
<style scoped>
.playlist-list {
/* 1. 开启网格布局 */
  display: grid;
  /* 2. 魔法代码：自动计算列数。每个卡片最小 180px，剩下的空间平分 (1fr) */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
