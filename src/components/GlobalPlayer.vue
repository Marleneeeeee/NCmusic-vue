<script setup>
import {ref,onMounted,computed, watch, nextTick} from 'vue' // 1. 导入watch
import api from '@/api';
import { formatDuration } from '@/utils/formatDuration';
import { parseLyric } from '@/utils/parseLyric';
import { usePlayerStore } from '@/stores/player';
import defaultLogo from '@/assets/imgs/logo.png'
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import BuyAlbumModal from './modal/BuyAlbumModal.vue';

const router=useRouter()

const playerStore=usePlayerStore()
const songId=computed(()=>playerStore.songId)
const showPaymentModal=ref(false)
const likeStatus=ref(false)

const userStore=useUserStore()

// 获取audio标签
const audioRef=ref(null)

// 歌曲信息
const songTitle=ref('网易云音乐 听你想听')
const songArtist=ref('')
const songCover=ref(defaultLogo)
const songFee=ref(0)
const songAlbumId=ref(0)

const feeInfo = computed(() => {
  switch (songFee.value) {
    case 0:
      return '免费或无版权'
    case 1:
      return 'VIP 尊享单曲'
    case 4:
      return '数字专辑（需购买）'
    case 8:
      return 'VIP 尊享高音质'
    default:
      return '未知音源' // 防御性编程，处理意外的值
  }
})

// 歌词
const lyrics=ref([])

// 歌词容器的引用，用于操作滚动条
const lyricListRef = ref(null)

// 音乐播放地址
const audioUrl=ref('')
const currentTime=ref(0)
const duration=ref(0)
const isPlaying=ref(false)
const playErrorTip=ref('') // 新增：自动播放失败提示


// ================= 1. 获取数据的核心逻辑 =================
// 获取歌曲详情
const fetchSongDetail=async(id)=>{
  // fee: enum,
  // 0: 免费或无版权
  // 1: VIP 歌曲
  // 4: 购买专辑
  // 8: 非会员可免费播放低音质，会员可播放高音质及下载
  // fee 为 1 或 8 的歌曲均可单独购买 2 元单曲
    if(!id) return
    try{
        const res=await api.get('/song/detail',{ids:id})
        if(res.songs && res.songs.length > 0){
          const song=res.songs[0];
          songTitle.value=song.name||'未知歌曲';
          songArtist.value=(song.ar||song.artists||[]).map((a)=>a.name).join('/');
          songCover.value=(song.al||song.album)?.picUrl||defaultLogo;
          songFee.value=song.fee||0;
          songAlbumId.value=song.al.id||0
        }
    }
    catch(err){
        console.log('获取歌曲详情失败',err);
        songCover.value = defaultLogo
    }
}

// 获取歌词
const fetchLyric=async(id)=>{
    if(!id) return
    try{
      const res=await api.get('/lyric',{id})
      if (res.lrc && res.lrc.lyric) {
        lyrics.value = parseLyric(res.lrc.lyric)
      } else {
        lyrics.value = [{ time: 0, text: '纯音乐，请欣赏' }]
      }          
    }
    catch(err){
        console.log("获取歌词失败",err);   
    }
}

// 获取播放地址
const fetchSongUrl=async(id)=>{
    if(!id) return
    playErrorTip.value = ''
    try{
        const res=await api.get('/song/url',{id})
        // 未登录状态或者非会员返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
        if(res.data && res.data.length > 0 && res.data[0].url){
          audioUrl.value=res.data[0].url||''
        }
        else{
          audioUrl.value=''
          isPlaying.value=false
          playErrorTip.value='此歌曲需要VIP或无版权，暂无法播放'
        }      
    }
    catch(err){
        console.log('获取歌曲播放地址失败',err);
    }
}
const initSongLike=async()=>{
  // 1. 确保拿到的是 ID 的数值
  const id = songId.value 
  if (!id) return

  // 2. 将数组 [id] 转换成字符串 "[id]"
  try {
    const res = await api.get('/song/like/check', { 
      ids: JSON.stringify([id]) 
    })
    console.log('喜爱状态检查结果:', res)
    // 3. 逻辑判定：
    // 该接口返回的是一个数组，包含了传入 ID 中被标记为喜爱的 ID
    // 如果返回的数组里包含当前的 id，说明是“喜爱”状态
    if (res.ids) {
      likeStatus.value = res.ids.includes(id)
      console.log(likeStatus.value);
    }
  } catch (err) {
    console.error('检查喜爱状态失败', err)
  }
}
// 监听全局 songId 变化，触发拉取
watch(songId, (newId) => {
  if (newId) {
    currentTime.value = 0
    isPlaying.value = false
    fetchSongDetail(newId)
    fetchSongUrl(newId)
    fetchLyric(newId)
    initSongLike(newId)
  }
  else {  // ⭐️ 核心修复：当 songId 变为 null（退出登录触发重置）时执行
    // 1. 让音频立刻停止
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value.src = '' // 清空音源
    }
    // 2. 重置播放器的本地状态
    isPlaying.value = false
    audioUrl.value = ''
    currentTime.value = 0
    duration.value = 0
    // 3. 恢复初始文案和封面
    songTitle.value = '网易云音乐 听你想听'
    songArtist.value = ''
    songCover.value = defaultLogo // 恢复成默认 logo
    lyrics.value = []
    console.log('检测到播放器已重置，已停止当前音频播放')
  }
}, { immediate: true })

// 监听到 URL 准备好后，自动开始播放
watch(audioUrl, (newUrl) => {
  if (newUrl && audioRef.value) {
    nextTick(() => {
      audioRef.value.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.error('自动播放失败(浏览器限制):', err)
        isPlaying.value = false
      })
    })
  }
})


// ================= 2. 播放器控制逻辑 =================
// 播放音乐
const handleTogglePlay=()=>{
  if (!audioUrl.value || !audioRef.value) return
  if(isPlaying.value){
    audioRef.value.pause()
  }
  else {
    // 处理之前提到的重播 Bug
    if (audioRef.value.ended) {
      audioRef.value.currentTime = 0
    }
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// ================= 3. 进度与事件逻辑 =================
const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  
  // 歌词滚动逻辑
  const activeIndex = lyrics.value.findIndex((line, index) => {
    const nextLine = lyrics.value[index + 1]
    return currentTime.value >= line.time && (!nextLine || currentTime.value < nextLine.time)
  })
  if (activeIndex !== -1 && lyricListRef.value) {
    const activeElement = lyricListRef.value.children[activeIndex]
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}
  
//加载歌曲元数据
const onLoadedMetadata=()=>{
  // loadedmetadata 是 HTML5 <audio>/<video> 标签的原生事件，当音频的「元数据（metadata）」加载完成时触发。
    // 元数据：音频的基础信息，包括时长（duration）、码率、音频轨道、采样率等（但不包含音频的实际内容数据）
    if(!audioRef.value) return
    duration.value=audioRef.value.duration
} 

const handleProgressChange = (e) => {
  if (!audioRef.value || !duration.value) return
  const newTime = (e.target.value / 100) * duration.value
  audioRef.value.currentTime = newTime
  currentTime.value = newTime
}

// 歌曲播放结束：自动下一曲！
const handleSongEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  if (audioRef.value) audioRef.value.currentTime = 0
  // 自动切到下一曲
  playerStore.playNext(true)
}
const handleBuyAlbum=()=>{
  showPaymentModal.value=true
}
const toggleSongLike=async()=>{
//   id: 歌曲 id uid: 用户 id like: 喜欢状态, true 表示喜欢, false 表示取消喜欢
// 接口地址 : /song/like
// 调用例子 : /song/like?id=2058263032&uid=32953014&like=true
  try{
    const res=await api.get('/like',{id:songId.value,like:!likeStatus.value})
    if(res?.code===200){
      likeStatus.value=!likeStatus.value
    }
  }
  catch(err){
    console.log('收藏/取消收藏歌曲出错',err)
  }
}
</script>

<template>
  <div class="global-player-root">
    <div class="mini-player" @click="playerStore.toggleExpand">
      <img :src="songCover||url('@/assets/imgs/logo.png')" class="mini-cover" :class="{ 'rotating': isPlaying}" />
      <div class="mini-info">
        <div class="mini-name">
          <span class="songname">{{ songTitle }}</span>
          <span v-if="songFee===1" class="vipsignal-small">vip</span>
        </div>
        <div class="mini-artist">{{ songArtist }}</div>
      </div>
      <div class="mini-controls" @click.stop> 
        <IconLike v-if="likeStatus" theme="filled" size="24" fill="#c20c0c" class="control-icon" @click="toggleSongLike()"/>
        <IconLike v-else theme="outline" size="24" fill="#333" class="control-icon" @click="toggleSongLike()"/>
        <IconPreSong @click="playerStore.playPrev()" theme="outline" size="24" fill="#333" class="control-icon" v-if="songId"/>
        <IconPreSong @click="playerStore.playPrev()" theme="outline" size="24" fill="#999" class="control-icon" v-else/>
        <IconPause v-if="isPlaying&&songId" @click="handleTogglePlay()" theme="outline" size="30" fill="#c20c0c" class="control-icon play-btn"/>
        <IconPause v-else-if="isPlaying" @click="handleTogglePlay()" theme="outline" size="30" fill="##999" class="control-icon play-btn" />
        <IconPlay v-else-if="!isPlaying&&songId" @click="handleTogglePlay()" theme="filled" size="30" fill="#c20c0c" class="control-icon play-btn" />
        <IconPlay v-else @click="handleTogglePlay()" theme="filled" size="30" fill="#999" class="control-icon play-btn" />
        <IconNextSong @click="playerStore.playNext()" theme="outline" size="24" fill="#333" class="control-icon" v-if="songId"/>
        <IconNextSong @click="playerStore.playNext()" theme="outline" size="24" fill="#999" class="control-icon" v-else/>
      </div>
    </div>

    <transition name="slide-up">
      <div class="full-screen-player" v-show="playerStore.isExpanded">
        <div class="bg-blur" :style="{ backgroundImage: `url(${songCover})` }"></div>
        <div class="bg-mask"></div>

        <div class="header-bar">
          <IconDown @click="playerStore.toggleExpand()" theme="outline" size="32" fill="#fff" class="collapse-btn"/>
          <div class="header-info">
            <div class="title">
              <span class="songtitle">{{ songTitle }}</span>
              <span v-if="songFee===1" class="vipsignal-big">vip</span>
            </div>
            <div class="artist">{{ songArtist }}</div>
          </div>
        </div>

        <div class="player-container">
          <div class="record-section">
            <div class="record-wrapper" :class="{ 'playing': isPlaying }">
              <img class="record-bg" src="@/assets/imgs/disc.png" alt="record-bg">
              <img class="record-cover" :src="songCover" alt="cover">
            </div>
            <div class="record-extra-info">
              {{ feeInfo }}
              <span 
                v-if="(songFee === 1 || songFee === 8)&&!userStore.isVip" 
              >
                请前往客户端开通黑胶VIP
              </span>
              <span
                class="action-link" 
                v-if="songFee === 4" 
                @click="handleBuyAlbum(songAlbumId)"
                
              >
                点此购买 >
              </span>
            </div>
          </div>

          <div class="lyric-section">
            <div class="lyrics-wrapper">
              <div v-if="playErrorTip" class="error-tip">{{ playErrorTip }}</div>
              <div class="lyrics-content" ref="lyricListRef" v-else-if="lyrics.length > 0">
                <p 
                  v-for="(line, index) in lyrics" 
                  :key="index"
                  class="lyrics-line"
                  :class="{ 'lyrics-line--highlight': currentTime >= line.time && (!lyrics[index + 1] || currentTime < lyrics[index + 1].time) }"
                >
                  {{ line.text }}
                </p>
              </div>
              <div v-else class="lyrics-loading">歌词加载中...</div>
            </div>
            
            <div class="player-controls">
              <div class="progress-wrap">
                <span class="time">{{ formatDuration(currentTime * 1000) }}</span>
                <input 
                  type="range" 
                  class="progress-bar" 
                  min="0" 
                  max="100" 
                  :value="(currentTime / duration) * 100 || 0"
                  @input="handleProgressChange"
                  :style="{ 
                    background: `linear-gradient(to right, #c20c0c ${ (currentTime / duration) * 100 || 0 }%, rgba(255, 255, 255, 0.2) 0)` 
                  }"
                >
                <span class="time">{{ formatDuration(duration * 1000) }}</span>
              </div>
              <div class="controls-main">
                <!-- 0:顺序播放, 1:单曲循环, 2:随机播放 -->
<!-- 当你在 HTML 中使用 @click="func" 而不加括号时，浏览器会自动将 PointerEvent (点击事件对象) 作为第一个参数传给该函数。
在 playNext(isAuto = false) 中，参数 isAuto 接收到了这个事件对象。
在 JavaScript 中，对象（Object）永远是 Truthy（真值）。 -->
                <IconLike v-if="likeStatus" theme="filled" size="32" fill="#c20c0c" class="control-btn" @click="toggleSongLike()"/>
                <IconLike v-else theme="outline" size="32" fill="#fff" class="control-btn" @click="toggleSongLike()"/>
                <IconPreSong @click="playerStore.playPrev()" theme="outline" size="32" fill="#fff" class="control-btn" />
                <IconPause v-if="isPlaying" @click="handleTogglePlay()" theme="outline" size="48" fill="#fff" class="control-btn play-btn" />
                <IconPlay v-else @click="handleTogglePlay()" theme="outline" size="48" fill="#fff" class="control-btn play-btn" />
                <IconNextSong @click="playerStore.playNext()" theme="outline" size="32" fill="#fff" class="control-btn" />
                <!-- <IconInfo theme="outline" size="32" fill="#fff" class="control-btn"/> -->
                <IconSeq v-if="playerStore.playMode===0" @click="playerStore.toggleMode()" theme="outline" size="32" fill="#fff" class="control-btn"/>
                <IconLoop v-else-if="playerStore.playMode===1" @click="playerStore.toggleMode()" theme="outline" size="32" fill="#fff" class="control-btn"/>
                <IconRandom v-else @click="playerStore.toggleMode()" theme="outline" size="32" fill="#fff" class="control-btn"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <BuyAlbumModal 
      v-if="showPaymentModal" 
      :album-id="songAlbumId" 
      @close="showPaymentModal = false" 
    />

    <audio 
      ref="audioRef" 
      :src="audioUrl" 
      class="audio-hidden" 
      @timeupdate="onTimeUpdate" 
      @loadedmetadata="onLoadedMetadata"
      @ended="handleSongEnded"
    ></audio>
  </div>
</template>

<style scoped>
/* ==================== 整体布局 ==================== */
.global-player-root {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2000;
}

.audio-hidden {
  display: none;
}

/* ==================== 底部 Mini 播放器 ==================== */
.mini-player {
  height: 72px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 24px;
  cursor: pointer;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.mini-cover {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
}

.mini-cover.rotating {
  animation-play-state: running;
}

.mini-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mini-name{
  display: flex;
  gap: 10px;
  align-items: center;
}

.songname{
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}

.vipsignal-small {
  padding: 0 3px;
  border-radius: 4px;
  background-color: #c20c0c;
  color: #f2f2f2;
  font-size: 10px;
  flex-shrink: 0; /* 保证 VIP 图标永远不会被挤压变形 */
}

.mini-artist {
  font-size: 12px;
  color: #888;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-icon {
  cursor: pointer;
  transition: opacity 0.2s;
}

.control-icon:hover {
  opacity: 0.8;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==================== 全屏播放器 ==================== */
.full-screen-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2001; /* 盖住底栏和其他所有东西 */
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
  background-color: #222325; /* 一种很有质感的深黑灰色，也可以用纯黑 #000 */
}

/* 背景虚化层 */
.bg-blur {
  position: absolute;
  top: 0; left: 0; width: 120%; height: 120%;
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  z-index: -2;
  /* 当一个元素被设置为 position: absolute; 时，它就脱离了文档流（像灵魂出窍一样悬浮起来了）。此时，它的宽度和高度完全由它里面的内容撑开。 */
  /* 没有内容，所以要设置宽高撑开 */
}
.bg-mask {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: -1;
}

/* 顶部收起栏 */
.header-bar {
  display: flex;
  align-items: center;
  padding: 20px 30px;
  height: 80px;
}

.collapse-btn {
  cursor: pointer;
  margin-right: 20px;
  transition: transform 0.2s;
}

.collapse-btn:hover {
  transform: translateY(2px);
}

.header-info .title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-info .title .songtitle{
  font-size: 20px;
  font-weight: 600;
}

.vipsignal-big{
  padding: 0 5px;
  border-radius: 5px;
  background-color: #c20c0c;
  color: #f2f2f2;
  font-size: 12px;
  flex-shrink: 0; /* 保证 VIP 图标永远不会被挤压变形 */
  margin-left: 10px;
}

.header-info .artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* ==================== 中间播放容器 (复用你的样式) ==================== */
.player-container {
  display: flex;
  flex: 1;
  padding: 20px 10vw;
  gap: 100px;
  align-items: center;
  overflow: hidden;
}

.record-section {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}
/* 👇 新增：下方文字的专属样式 */
.record-extra-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6); /* 半透明白色，和右侧文字色调保持一致 */
  text-align: center;
  max-width: 80%; /* 防止文字过长换行时撑满屏幕 */
  line-height: 1.5;
}
.action-link {
  color: rgba(255, 255, 255, 0.9); ; /* 常用 UI 蓝色，你也可以直接写 blue */
  cursor: pointer; /* 鼠标悬浮时变成小手 */
}

/* 可选：鼠标悬浮时加个下划线或者稍微变深一点，增加交互感 */
.action-link:hover {
  text-decoration: underline;
  color: #306df9; /* 更深一点的蓝色 */
}
.record-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
}
.record-wrapper.playing {
  animation-play-state: running;
}

.record-bg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.record-cover {
  position: absolute;
  top: 53%;
  left: 48.5%;
  transform: translate(-50%, -50%);
  width: 210px;
  height: 210px;
  border-radius: 50%;
  object-fit: cover;
}

.lyric-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 500px;
}

.lyrics-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%);
}

.lyrics-content {
  height: 100%;
  overflow-y: auto;
  padding: 50% 0; /* 让上下有滚动空间 */
}

.lyrics-content::-webkit-scrollbar {
  display: none;
}

.lyrics-line {
  margin: 16px 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  transition: all 0.3s;
}

.lyrics-line--highlight {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  transform: scale(1.05);
}

.error-tip, .lyrics-loading {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 50%;
}

/* ==================== 进度与控制栏 ==================== */
.player-controls {
  margin-top: 30px;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.time {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  -webkit-appearance: none; /* 必须去掉原生外观 */
  /* 不要在这里写背景颜色，或者确保它被上面的内联样式覆盖 */
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

/* 轨道样式：确保它是透明的，好让内联样式的渐变色露出来 */
.progress-bar::-webkit-slider-runnable-track {
  height: 4px;
  background: transparent; 
}

/* 滑块圆点样式 */
.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  margin-top: -4px; /* 使圆点在轨道中心 */
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
}

.controls-main {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.control-btn {
  cursor: pointer;
  transition: transform 0.2s;
}

.control-btn:hover {
  transform: scale(1.1);
}

/* 滑动动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>