<script setup>
import { computed } from 'vue'
import SongList from './SongList.vue'
import ArtistList from './artist/ArtistList.vue'
import PlaylistList from './playlist/PlaylistList.vue'

// 1. 接收父组件传来的整个数据包
const props = defineProps({
  searchData: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
const emit = defineEmits(['change-tab']);
const handleViewMore = (targetType) => {
  // 告诉父组件：用户想看某种类型的全部内容
  emit('change-tab', targetType);
};

// 2. 定义白名单，只展示你想展示的模块
const allowedModules = ['song', 'artist', 'playList']
// 🌟 2. 格式化单曲数据：解决 dt 字段问题
const formattedSongs = computed(() => {
  const songs = props.searchData.song?.songs || []
  console.log(songs.map((s)=>s.mv));
  return songs.map(s => ({
    id: s.id,
    name: s.name,
    artist: (s.ar || s.artists || []).map(a => a.name).join(' / '),
    duration: s.dt || s.duration || 0, 
    album: s.al?.name || s.album?.name || '未知专辑',
    mvid: s.mv||s.mvid||0,
    fee:s.fee
  }))  
})

// 🌟 3. 格式化歌单数据：确保封面图字段正确
const formattedPlaylists = computed(() => {
  const lists = props.searchData.playList?.playLists || []
  return lists.map(p => ({
    id: p.id,
    title: p.name,
    cover: p.coverImgUrl || p.cover,
    desc:p.description,
    trackCount: p.trackCount,
    playCount: p.playCount,
    // creator: p.creator?.nickname
  }))
})

// 🌟 4. 格式化歌手数据
const formattedArtists = computed(() => {
  const artists = props.searchData.artist?.artists || []
  return artists.map(a => ({
    id: a.id,
    name: a.name,
    avatar: a.img1v1Url||a.picUrl,
    alias: a.alias?.join(' / ') || '',
    musicNum:a.musicSize,
    albumNum:a.albumSize,
    mvNum:a.mvSize
  }))
})
</script>

<template>
    <!-- 可能的"order": [
      "song",
      "new_mlog",
      "playList",
      "artist",
      "album",
      "sim_query",
      "user"
    ] -->
  <div class="search-summary">
    <template v-for="moduleType in searchData.order" :key="moduleType">
      <div v-if="allowedModules.includes(moduleType)" class="module-block">

        <template v-if="moduleType === 'song' && formattedSongs.length">
          <div class="module-header">
            <h3 class="module-title">单曲</h3>
            <span class="more-text" @click="handleViewMore(1)">{{ searchData.song?.moreText|| '更多' }} ></span>
          </div>
          <SongList :songlist="formattedSongs" />
        </template>

        <template v-if="moduleType === 'artist' && formattedArtists.length">
          <div class="module-header">
            <h3 class="module-title">歌手</h3>
            <span class="more-text" @click="handleViewMore(100)">{{ searchData.artist?.moreText || '更多'}} ></span>
          </div>
          <ArtistList :artists="formattedArtists" />
        </template>

        <template v-if="moduleType === 'playList' && formattedPlaylists.length">
          <div class="module-header">
            <h3 class="module-title">歌单</h3>
            <span class="more-text" @click="handleViewMore(1000)">{{ searchData.playList?.moreText || '更多' }} ></span>
          </div>
          <PlaylistList :playlists="formattedPlaylists" />
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.search-summary {
  padding-bottom: 40px;
}

.module-block {
  margin-bottom: 32px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.module-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
}

.more-text {
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  transition: background 0.2s;
}

.more-text:hover {
  background: var(--bg-hover);
}
</style>