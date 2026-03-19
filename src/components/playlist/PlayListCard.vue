<script setup>
import { useRouter } from "vue-router"
import { formatCount } from "@/utils/formatCount";

const router = useRouter()
const { item } = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
console.log(item.trackCount)

// 点击歌单跳转到详情页，并且携带ID过去
const handlePlaylistCardClick = (id) =>{
  if (!id) return
  router.push({
    name:"playlist",
    query:{id}
  })
}

</script>

<template>
<div 
    :key="item.id"
    class="playlist-item"
    @click="handlePlaylistCardClick(item.id)"
>
    <div class="cover-wrapper">
      <img :src="item.cover" :alt="item.title">
      <span class="playCount">{{ formatCount(item.playCount) }}次播放</span>
      <span class="trackCount">{{ item.trackCount }} 首</span>
    </div>
    <div class="info">
      <p class="title">{{ item.title }}</p>
      <p class="desc">{{ item.desc }}</p>
    </div>
</div>
</template>
<style scoped>
.playlist-item {
  flex: 1;
  max-width: 220px;
  cursor: pointer;
}
.cover-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  overflow: hidden;
  background: #eee;
  cursor: pointer;
  position: relative;
}
.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.cover-wrapper:hover img {
  transform: scale(1.06);
}
.playCount{
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 6px;
  background: rgba(50,50,50,0.5);
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
  z-index: 2;
}
.trackCount{
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 6px;
  background: rgba(50,50,50,0.5);
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
  z-index: 2;
}
.info {
  margin-top: 8px;
}
.title {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
