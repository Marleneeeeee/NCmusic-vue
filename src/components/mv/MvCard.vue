<script setup>
import { formatDuration } from '@/utils/formatDuration' // 假设你有这个工具函数
import { useRouter } from 'vue-router';

const router=useRouter()

defineProps({
  item: {
    type: Object,
    required: true
  }
})
const handleClickMv=(id)=>{
  router.push({
    name:'mvplayer',
    query:{id}
  })
}
</script>

<template>
  <div class="mv-card" @click="handleClickMv(item.id)">
    <div class="cover-wrap">
      <img :src="item.cover" class="cover" />
      <div class="play-mask">
        <IconPlayMv theme="filled" size="34" fill="#c20c0c" class="play-icon"/>
      </div>
      <span class="duration">{{ formatDuration(item.duration) }}</span>
    </div>
    <div class="info">
      <div class="name">{{ item.name }}</div>
      <div class="artist">{{ item.artist }}</div>
    </div>
  </div>
</template>

<style scoped>
.mv-card {
  width: 100%;
  cursor: pointer;
}
.cover-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9; /* 🌟 强制 16:9 比例 */
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 悬浮时封面变暗，显示播放图标 */
.mv-card:hover .play-mask {
  opacity: 1;
}
.play-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.play-icon {
  opacity: 0.8;
}
/* 底部信息容器 */
.info {
  padding: 8px 0;
}
.name {
  margin-top: 4px;
  font-size: 14px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 超过两行省略号 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.artist {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 时长标签：放在封面右下角 */
.duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
  z-index: 2;
}
</style>