<script setup>
import {ref} from 'vue'
import { useRouter } from 'vue-router'
import { formatDuration } from '@/utils/formatDuration'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import AddToPlaylistModal from './modal/AddToPlaylistModal.vue'
import DeleteFromPlaylistModal from './modal/DeleteFromPlaylistModal.vue'

const emit = defineEmits(['delete-success'])

const router = useRouter()
const props = defineProps({
  songlist: {
    type: Array,
    default: () => []
  },
  showDelete: {
    type: Boolean,
    default: false // 默认不显示删除按钮
  },
  id:{
    type:String,
    default:'0'
  }
})
const playerStore=usePlayerStore()
const userStore=useUserStore()

// 弹窗控制
const showAddModal=ref(false)
const showDeleteModal=ref(false)
const selectedSongId=ref(null)

const handleOpenAddModal=(songId)=>{
  if(!userStore.isLoggedIn){
    alert('请登陆后再收藏歌曲!')
    return
  }
  selectedSongId.value=songId
  showAddModal.value=true
}

const handleOpenDeleteModal=(songId)=>{
  if(!userStore.isLoggedIn){
    alert('请登陆后再取消收藏歌曲!')
    return
  }
  selectedSongId.value=songId
  showDeleteModal.value=true
}

const handlePlaySong=(songId)=>{
    if(!songId) return
    playerStore.playSong(songId,props.songlist)
    // router.push({
    //     name:'songplayer', //路由的 name 属性是「纯字符串标识」，不能带 / 斜杠
    //     query:{id:songId,idx:index}
    // })
}
const handleClickMv=(mvid)=>{
  if(!mvid) return
    router.push({
        name:'mvplayer', //路由的 name 属性是「纯字符串标识」，不能带 / 斜杠
        query:{id:mvid}
    })
}
const playAll=()=>{
  if(playerStore.playMode===2){
    const songlen=props.songlist.length;
    const randomIndex = Math.floor(Math.random() * songlen);
    handlePlaySong(props.songlist[randomIndex].id,props.songlist)
  }
  else{
    handlePlaySong(props.songlist[0].id,0)
  }
}
const handleDeleteSuccess = () => {
  // 关闭弹窗
  showDeleteModal.value = false
  // 触发自定义事件，把刚刚删除成功的歌曲 ID 传给父组件 Playlist.vue
  emit('delete-success', selectedSongId.value)
}
</script>


<template>
<div class="playAll" @click="playAll()">
  <IconPlay theme="outline" size="22" fill="#c20c0c" class="play-icon"/>
  <span>播放全部</span>
</div>
<ul class="song-list" v-if="props.songlist && props.songlist.length > 0">
  <li class="song-item" v-for="(song,index) in props.songlist" :key="song.id" @click="handlePlaySong(song.id)">
      <span class="song-index">{{ index+1 }}</span>
      <div class="song-main">
          <div class="song-title-row">
              <span class="song-name">{{ song.name }}</span>
              <span class="vipsignal" v-if="song.fee===1">vip</span>
          </div>
          <span class="song-artist">{{ song.artist }}</span>
      </div>
      <div class="song-extra">
          <IconAdd theme="outline" size="20" fill="#999" class="add-btn" title="添加到歌单" @click.stop="handleOpenAddModal(song.id)"/>
          <IconDelete v-if="props.showDelete" theme="outline" size="20" fill="#999" title="从歌单中删除" class="delete-btn" @click.stop="handleOpenDeleteModal(song.id)"/>
          <!-- <span class="add-btn" title="添加到歌单" @click.stop="handleOpenAddModal(song.id)">+</span> -->
          <div class="mv-wrapper">
              <IconPlayMv v-if="song.mvid" theme="filled" size="20" fill="#c20c0c" class="playmv-icon" @click.stop="handleClickMv(song.mvid)"/>
          </div>
          <span class="song-album">{{ song.album }}</span>
          <span class="song-duration">{{ formatDuration(song.duration) }}</span>
      </div>
  </li>
</ul>
<div v-else class="song-list-empty">
    暂无单曲数据
</div>
<AddToPlaylistModal 
  v-if="showAddModal" 
  :song-id="selectedSongId"
  @close="showAddModal = false"
/>
<DeleteFromPlaylistModal 
  v-if="showDeleteModal" 
  :song-id="selectedSongId"
  :playlistId="props.id"
  @close="showDeleteModal = false"
  @success="handleDeleteSuccess"
/>
</template>
<!-- 防御性编程（Defensive Programming）”。
作为组件的开发者，你不能“假设”调用这个组件的人（哪怕是未来的你自己）永远不会犯错。
如果某天你在新页面引入 <songList :songlist="undefined"> 且忘了加外层判断，组件可能会因为 v-for 遍历 undefined 而直接报错白屏。 -->

<style scoped>
/* 前面的 .playAll 和 .song-list 样式保持你原来的不变 */
.playAll{
  margin-bottom: 15px;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.play-icon{
  display: flex;
}
.song-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  font-size: 13px;
}
.song-item:last-of-type { border-bottom: none; }
.song-item:hover { background: rgba(255,255,255,0.9); }

.song-index {
  width: 32px;
  text-align: right;
  margin-right: 15px;
  color: #999;
  flex-shrink: 0;
}

/* --- 左侧主信息 --- */
.song-main {
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据中间所有可用空间 */
  min-width: 0; /* 极其重要：防止长文本把右侧区域挤出屏幕 */
  padding-right: 20px;
}

/* 歌名和 VIP 的同行布局 */
.song-title-row {
  display: flex;
  align-items: center;
  gap: 15px; /* 歌名和 VIP 之间的间距 */
}

.song-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vipsignal {
  padding: 0 3px;
  border-radius: 4px;
  background-color: #c20c0c;
  color: #f2f2f2;
  font-size: 10px;
  flex-shrink: 0; /* 保证 VIP 图标永远不会被挤压变形 */
}

.song-artist {
  margin-top: 2px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- 右侧附加信息 --- */
.song-extra {
  display: flex;
  align-items: center;
  width: 35%; /* 给右侧区域分配一个固定的宽度比例 (可以根据需要微调) */
  flex-shrink: 0;
}
.add-btn{
  /* font-size: 22px; 字号稍微大一点，方便点击 */
  /* font-weight: 450; */
  /* color: #b3b3b3; */
  /* cursor: pointer; */
  line-height: 1;
  /* transition: color 0.2s, transform 0.2s; */
  margin-right: 20px;
}
.delete-btn{
  line-height: 1;
  margin-right: 20px;
}
/* MV 占位盒子 */
/* 修改这里 */
.mv-wrapper {
  width: 30px; /* 固定宽度 */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center; /* ✅ 新增：让图标在 30px 内部也水平居中，视觉更平衡 */
}

/* 新增这段：强制消除 MV SVG 图标的基线问题 */
.playmv-icon {
  display: block; 
}
/* 专辑名 */
.song-album {
  flex: 1; /* 在 song-extra 内部占据剩下的所有空间 */
  min-width: 0; 
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 15px;
}

/* 时长 */
.song-duration {
  width: 45px;
  color: #999;
  flex-shrink: 0;
  text-align: right;
}
</style>