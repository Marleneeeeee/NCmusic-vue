import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'

// 本地存储的键名
const STORAGE_KEY = 'nc_player'

export const usePlayerStore = defineStore('player', () => {
    // ================= 1. 初始化状态 (尝试从本地恢复) =================
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

    const songId = ref(savedData.songId || null)          // 当前播放歌曲 ID
    const originalList = ref(savedData.originalList || []) // 原始顺序列表 (备份用)
    const playlist = ref(savedData.playlist || [])         // 当前实际播放列表 (可能是乱序的)
    const currentIndex = ref(savedData.currentIndex ?? -1) // 当前索引
    const playMode = ref(savedData.playMode ?? 0)          // 0:顺序播放, 1:单曲循环, 2:随机播放
    
    const isExpanded = ref(false) // 播放器展开状态 (不需要持久化)

    // ================= 2. 核心内部方法 =================
    
    const toggleExpand=()=>isExpanded.value=!isExpanded.value

    // 持久化保存到本地
    const saveToLocal = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            songId: songId.value,
            originalList: originalList.value,
            playlist: playlist.value,
            currentIndex: currentIndex.value,
            playMode: playMode.value
        }))
    }

    // 洗牌算法 (用于随机播放)
    const shuffleArray = (arr) => {
        const res = [...arr]
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]]
        }
        return res
    }

    // ================= 3. 外部操作 Action =================

    // 播放指定歌曲
    const playSong = (id, list = []) => {
        songId.value = id
        
        // 如果提供了新列表，更新播放记录
        if (list.length > 0) {
            originalList.value = [...list]
            // 如果当前是随机模式，存入时就要洗牌
            if (playMode.value === 2) {
                playlist.value = shuffleArray(list)
            } else {
                playlist.value = [...list]
            }
        }
        
        // 更新当前歌曲对应的索引
        currentIndex.value = playlist.value.findIndex(item => item.id === id)
        saveToLocal()
    }

    // 切换播放模式
    const toggleMode = () => {
        playMode.value = (playMode.value + 1) % 3
        
        const currentSongId = songId.value
        if (playMode.value === 2) {
            // 切换到随机：打乱列表
            playlist.value = shuffleArray(originalList.value)
        } else {
            // 切换回顺序或循环：恢复原始列表
            playlist.value = [...originalList.value]
        }
        
        // 模式切换后，必须重新寻找当前歌在列表里的新位置，否则切歌会乱
        currentIndex.value = playlist.value.findIndex(item => item.id === currentSongId)
        saveToLocal()
    }

    // 下一曲
    const playNext = (isAuto = false) => {
        if (playlist.value.length === 0) return

        // 如果是自动播放结束且处于“单曲循环”模式
        if (isAuto && playMode.value === 1) {
            const tempId = songId.value
            songId.value = null // 先置空再赋值，强制触发 GlobalPlayer 的 watch 重新拉取 URL
            nextTick(() => {
                songId.value = tempId
            })
            return
        }

        // 正常计算下一首索引
        let nextIdx = currentIndex.value + 1
        if (nextIdx >= playlist.value.length) {
            nextIdx = 0 // 播完了回到第一首
        }

        const nextSong = playlist.value[nextIdx]
        songId.value = nextSong.id
        currentIndex.value = nextIdx
        saveToLocal()
    }

    // 上一曲
    const playPrev = () => {
        if (playlist.value.length === 0) return

        let prevIdx = currentIndex.value - 1
        if (prevIdx < 0) {
            prevIdx = playlist.value.length - 1 // 跳到最后一首
        }

        const prevSong = playlist.value[prevIdx]
        songId.value = prevSong.id
        currentIndex.value = prevIdx
        saveToLocal()
    }

    // 重置播放器 (用户退出登录时调用)
    const resetPlayer = () => {
        songId.value = null
        originalList.value = []
        playlist.value = []
        currentIndex.value = -1
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        songId,
        playlist,
        originalList,
        currentIndex,
        playMode,
        isExpanded,
        toggleExpand,
        playSong,
        playNext,
        playPrev,
        toggleMode,
        resetPlayer
    }
})