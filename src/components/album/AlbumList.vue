<script setup>
import AlbumCard from './AlbumCard.vue';
const { albums } = defineProps({ 
    albums: {                    
        type: Array,
        required: true
    }
})
</script>

<template>
<ul class="album-list" v-if="albums&&albums.length>0">
    <AlbumCard 
    v-for="album in albums"
    :key="album.id"
    :item="album"
    v-if="albums&&albums.length>0"
    >
    </AlbumCard>
</ul>
<div v-else>
    暂无专辑数据
</div>
</template>
<style scoped>
.album-list {
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
