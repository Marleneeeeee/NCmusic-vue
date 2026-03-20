<script setup>
import { useRoute } from 'vue-router';
import {onMounted,computed,ref} from 'vue'
import api from '@/api';
import SongList from '@/components/SongList.vue';
import { formatDateTime } from '@/utils/formatDateTime';

const route=useRoute()
const albumId=computed(()=>route.query.id)
const loading=ref(false)

const albumName=ref('')
const albumCover=ref('')
const albumDescription=ref(0)
const albumSize=ref(0)
const albumArtist=ref('')
const albumPublishTime=ref('')
const albumSongs=ref([])

const fetchAlbumDetail=async()=>{
    const id=albumId.value
    if(!id) return;
    loading.value=true
    try{
        const res=await api.get('/album',{id})
        const album=res.album
        const songs=res.songs
        albumName.value=album.name||''
        albumCover.value=album.picUrl||''
        albumDescription.value=album.description||''
        albumSize.value=album.size||0
        albumArtist.value=(album.ar||album.artists||[]).map((a)=>a.name).join('/')
        albumPublishTime.value=album.publishTime
        albumSongs.value=songs.map((s)=>({
            id:s.id,
            name:s.name, //歌曲名
            artist:(s.ar||s.artists||[]).map((a)=>a.name).join('/')||'未知歌手',
            duration:s.dt||s.duration||0,
            album:(s.al||s.album)?.name||'', //专辑名
            mvid:s.mv||s.mvid||0,
            fee:s.fee
        }))||[]
    }
    catch(err){
        console.log('获取专辑详情失败',err);
    }
    finally{
        loading.value=false
    }
}
onMounted(() => {
    fetchAlbumDetail()
})
</script>


<template>
<div class="albumSongs-page">
    <div class="albumSongs-bg-container">
      <div class="albumSongs-bg-blur" :style="{ backgroundImage: `url(${albumCover})` }"></div>
      <div class="albumSongs-bg-mask"></div>
    </div>
    <div class="albumSongs-inner">
        <div class="album-header">
            <div class="cover-box">
                <div class="cover-wrapper">
                    <img :src="albumCover" :alt="albumName">
                </div>
            </div>
            <div class="album-info">
                <h2 class="title">{{ albumName }}</h2>
                <div class="info-item">歌手：{{ albumArtist }}</div>
                <div class="info-item">发行时间：{{formatDateTime(albumPublishTime)}}</div> 
                <div class="desc">{{ albumDescription }}</div>
            </div>
        </div>
        <div v-if="loading" class="tip">专辑加载中...</div>
        <template v-else-if="albumSongs.length > 0">
          <div class="num-info">
            <span class="albumsize">共 {{ albumSize }} 首</span>
          </div>
          <SongList :songlist="albumSongs"></SongList>
        </template>
        <div v-else class="tip">暂无歌曲...</div>
  </div>
</div>
</template>


<style scoped>
.albumSongs-page {
  min-height: calc(100vh - 90px);
  padding: 40px 32px; /* 增加一点上下内边距 */
  position: relative;
}
.albumSongs-bg-container {
  position: absolute; /* 从 fixed 改为 absolute */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* 撑满整个 playlist-page 的高度 */
  z-index: -1; 
  pointer-events: none;
  overflow: hidden;
}


.albumSongs-bg-blur {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  transform: scale(1.2);
}

.albumSongs-bg-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-hover-transparent1); /* 白天默认白色半透明 */
  transition: background-color 0.3s ease;
}
.albumSongs-inner {
  max-width: 1000px; /* 稍微收窄一点，让排版更紧凑 */
  margin: 0 auto;
}

/* 🌟 头部左右分栏布局 */
.album-header {
  display: flex;
  gap: 48px; /* 封面和文字的间距 */
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 40px;
}

/* 🌟 修正封面盒子：固定宽高，拒绝花里胡哨的百分比 */
.cover-box {
  position: relative;
  /* 假设封面图是 200px 宽，黑胶唱片向右露出去 40px，那总宽度就是 240px */
  width: 240px;  
  height: 200px; 
  flex-shrink: 0; /* 在 Flex 布局中打死不缩小 */
}

/* 🌟 专辑图片封面 */
.cover-wrapper {
  position: absolute;
  left: 0; /* 靠左站 */
  top: 0;
  width: 200px;  /* 固定宽度 */
  height: 200px; /* 固定高度 */
  border-radius: 8px;
  overflow: hidden;
  z-index: 2; /* 确保盖在黑胶上面 */
  /* z-index适用于设置了定位属性（position: relative、absolute、fixed 或 sticky）的元素。*/
  box-shadow: 2px 0 10px rgba(0,0,0,0.15);
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 🌟 黑胶唱片效果 */
.cover-box::after {
  content: '';
  position: absolute;
  right: 0; /* 靠右站，自然就露出来了 */
  top: 0;
  width: 200px;  /* 和封面一模一样的大小！绝对不会比封面大！ */
  height: 200px; /* 和封面一模一样的高度！ */
  border-radius: 50%;
  
  /* 质感光泽渐变 */
  background-image: radial-gradient(circle, #222 10%, #121212 20%, #1a1a1a 80%, #000 100%);
  box-shadow: var(--shadow-album);
  z-index: 1; /* 垫底 */
}

/* 🌟 右侧文字信息区域 */
.album-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  margin: 0 0 8px;
  font-size: 32px; /* 标题放大 */
  font-weight: bold;
  color: var(--text-primary);
}

.info-item {
  font-size: 14px;
  color: var(--text-regular);
}

.desc {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  /* 如果简介太长，限制最多显示 4 行，多余的变成省略号 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4; 
  overflow: hidden;
}

.num-info {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.05); /* 加一条优雅的分割线 */
}

.albumsize {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}
</style>