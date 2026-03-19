<script setup>
import { useRouter } from "vue-router"
import { formatDateTime } from "@/utils/formatDateTime";

const router = useRouter()
const { item } = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const handleAlbumClick = (id) =>{
  if (!id) return
  router.push({
    name:"albumsongs",
    query:{id}
  })
}
</script>

<template>
<div 
  :key="item.id"
  class="album-item"
  @click="handleAlbumClick(item.id)"
>
  <div class="cover-box">
    <div class="cover-wrapper">
      <img :src="item.cover" :alt="item.title">
    </div>
  </div>
  <div class="info">
    <p class="title">{{ item.title }}</p>
    <p class="publishTime">
      <span>{{ formatDateTime(item.publishTime) }}</span>
      <span>{{ item.size }}首</span>
    </p>
  </div>
</div>
</template>

<style scoped>
.album-item {
  flex: 1;
  max-width: 220px;
  cursor: pointer;
}

/* 核心改造区域 */
.cover-box {
  position: relative;
  width: 100%;
  padding-right: 15%; /* 给右侧露出的黑胶留出空间 */
}

/* 黑胶唱片效果 */
.cover-box::after {
  content: '';
  position: absolute;
  top: 50%;
  /* 想象成一个房子，正数向内挤，负数向外跑 */
  right: 6%; /* 默认状态下微微露出一小半边 */
  /* 唱片右边缘到cover-box右边缘的距离为cover-box的6% */
  transform: translateY(-50%);
  width: 80%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: #121212; /* 黑胶唱片的黑色 */
  box-shadow: var(--shadow-album);
  z-index: 1;
  transition: right 0.4s ease; /* 添加抽出的动画过渡 */
}

.cover-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px; /* 稍微加一点圆角 */
  overflow: hidden;
  background: var(--bg-surface);
  position: relative;
  z-index: 2; /* 确保封面盖在唱片上面 */
  border: 1px solid rgba(0,0,0,0.05); /* 给专辑封面加个淡淡的边框，增强实体感 */
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 鼠标悬浮时，唱片向右边“滑出”一点，图片就不缩放了，改成这种交互 */
.album-item:hover .cover-box::after {
  right: 0%; 
}

.info {
  margin-top: 8px;
  padding-right: 15%; /* 让文字和图片左边缘对齐，右边留白 */
}

.title {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.publishTime {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>