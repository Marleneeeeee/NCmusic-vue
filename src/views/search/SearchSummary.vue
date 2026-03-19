<script setup>
import { ref, watch } from 'vue'
import api from '@/api'
import Summary from '@/components/Summary.vue'

const props = defineProps({ keyword: { type: String, required: true } })
const emit = defineEmits(['change-tab'])

const searchData = ref(null)
const loading = ref(false)

const fetchResults = async () => {
  const kw = props.keyword.trim()
  if (!kw) return
  loading.value = true
  try {
    const res = await api.get('/search', {
      keywords: kw,
      type: 1018,
      limit: 20,
      offset: 0,
      timestamp: Date.now()
    })
    if (res.code === 200 && res.result) {
      searchData.value = res.result
    }
  } catch (err) {
    console.error('搜索综合出错', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.keyword, (newVal) => {
  if (newVal) {
    searchData.value = null
    fetchResults()
  }
}, { immediate: true })
</script>

<template>
  <div class="search-summary-wrap">
    <div v-if="loading && !searchData" class="status-tip">
      <div class="loading-icon"></div>正在搜索中...
    </div>
    <template v-else-if="searchData">
      <Summary :searchData="searchData" @change-tab="(type) => emit('change-tab', type)" />
    </template>
    <div v-else-if="!loading && !searchData" class="status-tip">
      未找到相关的内容，换个关键词试试吧
    </div>
  </div>
</template>

<style scoped>
.search-summary-wrap { padding-top: 10px; }
.status-tip { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: var(--text-muted); font-size: 14px; }
.loading-icon { width: 30px; height: 30px; border: 3px solid var(--border-color); border-top: 3px solid var(--color-primary); border-radius: 50%; margin-bottom: 12px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>