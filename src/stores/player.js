import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义存入本地的键名
const STORAGE_KEY = 'nc_player'

export const usePlayerStore = defineStore('player', () => {
  // 1. 初始化时，先尝试从 LocalStorage 读取“前世的记忆”
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

  // 如果本地有值，就用本地的值；如果没有，就用默认值（null, [], -1）
  const songId = ref(savedData.songId || null)          // 当前播放的歌曲 ID
  const playlist = ref(savedData.playlist || [])        // 当前播放列表
  const currentIndex = ref(savedData.currentIndex !== undefined ? savedData.currentIndex : -1)  // 当前播放索引
  
  // 展开状态不需要存入本地（通常刷新网页后，默认让播放器收起在底部体验更好）
  const isExpanded = ref(false)     

  // 2. 封装一个同步数据到 LocalStorage 的方法
  const saveToLocal = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      songId: songId.value,
      playlist: playlist.value,
      currentIndex: currentIndex.value
    }))
  }

  // 3. 播放指定歌曲
  const playSong = (id, index = -1, list = []) => {
    songId.value = id
    if (list.length > 0) {
      playlist.value = list
    }
    if (index !== -1) {
      currentIndex.value = index
    }
    
    // 💡 重点：内存里的数据更新后，立刻“备份”一份到硬盘里
    saveToLocal()
  }

  // 切换全屏/收起状态
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
  }

  return { 
    songId, playlist, currentIndex, isExpanded, 
    playSong, toggleExpand 
  }
})