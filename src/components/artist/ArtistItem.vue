<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps(['artist'])

const handleArtistClick=(artistId)=>{
    if(!artistId) return
    router.push({
        name:'artist', 
        query:{id:artistId}
    })
}
</script>


<template>
<div class="artist-item" @click="handleArtistClick(props.artist.id)">
    <div class="avatar-wrap">
        <img class="artist-avatar" :src="props.artist.avatar">
    </div>
    <div class="artist-main">
        <span class="artist-name">{{ props.artist.name }}</span>
    </div>
    <div class="artist-creation">
        <span class="creation-num">{{ props.artist.musicNum }}</span>
        <span class="creation-num">{{ props.artist.albumNum }}</span>
        <span class="creation-num">{{ props.artist.mvNum }}</span>
    </div>
</div>
</template>

<style scoped>
.artist-item {
  display: flex;
  align-items: center;
  padding: 12px 16px; /* 稍微增加一点上下内边距 */
  border-bottom: 1px solid #f9f9f9; /* 线条改淡一点 */
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.artist-item:hover {
  background: #fafafa;
}

/* 1. 头像：圆形、固定大小、防变形 */
.avatar-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
  border: 1px solid #f2f2f2;
}

.artist-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 2. 名字区域 */
.artist-main {
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余空间，把数字挤到最右边 */
  min-width: 0; /* 防止名字过长撑破 Flex 布局 */
}

.artist-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 3. 右侧的作品数量区域 */
.artist-creation {
  display: flex;
  align-items: center;
  gap: 24px; /* 三个数字之间的间距 */
  margin-left: auto;
}

.creation-num {
  color: #888;
  font-size: 13px;
  min-width: 60px; /* 固定最小宽度，保证上下行对齐 */
}

/* 魔法：用 CSS 给数字加上前缀文案，不用改 HTML */
.creation-num:nth-child(1)::before {
  content: "单曲: ";
  color: #b3b3b3;
}
.creation-num:nth-child(2)::before {
  content: "专辑: ";
  color: #b3b3b3;
}
.creation-num:nth-child(3)::before {
  content: "MV: ";
  color: #b3b3b3;
}
</style>