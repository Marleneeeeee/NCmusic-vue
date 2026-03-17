<script setup>
import { useRouter } from 'vue-router'
import { formatDuration } from '@/utils/formatDuration'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const props = defineProps(['songlist'])
const playerStore=usePlayerStore()

const handlePlaySong=(songId,index)=>{
    if(!songId) return
    playerStore.playSong(songId,index,props.songlist)
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
  handlePlaySong(props.songlist[0].id,0)
}
</script>


<template>
<div class="playAll" @click="playAll()">
  <IconPlay theme="outline" size="22" fill="#c20c0c" class="play-icon"/>
  <span>播放全部</span>
</div>
<ul class="song-list" v-if="props.songlist && props.songlist.length > 0">
    <li class="song-item" v-for="(song,index) in props.songlist" :key="song.id" @click="handlePlaySong(song.id,index)">
        <span class="song-index">{{ index+1 }}</span>
        <div class="song-main">
            <span class="song-name">{{ song.name }}</span>
            <span class="song-artist">{{ song.artist }}</span>
        </div>
        <div class="song-extra">
            <IconPlayMv v-if="song.mvid" theme="outline" size="20" fill="#c20c0c" class="playmv-icon" @click.stop="handleClickMv(song.mvid)"/>
            <span class="song-album">{{ song.album }}</span>
            <span class="song-duration">{{ formatDuration(song.duration) }}</span>
        </div>
    </li>
</ul>
<div v-else class="song-list-empty">
    暂无单曲数据
</div>
<!-- 防御性编程（Defensive Programming）”。
作为组件的开发者，你不能“假设”调用这个组件的人（哪怕是未来的你自己）永远不会犯错。
如果某天你在新页面引入 <songList :songlist="undefined"> 且忘了加外层判断，组件可能会因为 v-for 遍历 undefined 而直接报错白屏。 -->
</template>

<style scoped>
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

.song-item:last-of-type {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255,255,255,0.9);
}

.song-index {
  width: 32px;
  text-align: right;
  margin-right: 12px;
  color: #999;
  flex-shrink: 0;
}

.song-main {
  display: flex;
  flex-direction: column;
  max-width: 50%;
}

.song-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin-top: 2px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-extra {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  max-width: 40%;
}
.playmv-icon{
  display: flex;
  margin-right: 22px;
}
.song-album {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  color: #999;
  flex-shrink: 0;
}
</style>