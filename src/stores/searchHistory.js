import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // 1. 从本地存储读取初始数据
  const history = ref(JSON.parse(localStorage.getItem('search_history') || '[]'))

  // 2. 添加搜索记录
  const addHistory = (keyword) => {
    if (!keyword) return
    
    // 去重：如果记录中已经有这个词，先把它删掉
    const index = history.value.indexOf(keyword)
    if (index !== -1) {
      history.value.splice(index, 1)
    }

    // 置顶：放到数组最前面
    history.value.unshift(keyword)
    
    // 限制数量：最多保留 10 条
    if (history.value.length > 10) {
      history.value.pop()
    }
    
    // 同步到 LocalStorage
    localStorage.setItem('search_history', JSON.stringify(history.value))
  }

  // 3. 清空历史记录
  const clearHistory = () => {
    history.value = []
    localStorage.removeItem('search_history')
  }

  return { history, addHistory, clearHistory }
})