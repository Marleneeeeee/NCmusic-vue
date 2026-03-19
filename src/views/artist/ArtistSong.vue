<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import SongList from '@/components/SongList.vue'

const route = useRoute()
const artistId = computed(() => route.query.id)
const songs = ref([])
const loading = ref(false)

const fetchSongs = async () => {
  loading.value = true
  try {
        const res=await api.get('/artists',{id:artistId.value})
        songs.value = (res.hotSongs || []).map((t)=> ({
            id: t.id,
            name: t.name,
            artist:(t.ar||t.artists||[]).map((a)=>a.name).join('/'),
            duration:t.dt||t.duration||0,
            album:(t.al||t.album)?.name||'',
            mvid:t.mv || t.mvid || 0,
            fee:t.fee
        }))
    }
    catch (err) {
        console.error('获取歌手单曲失败', err)
    }
    finally {
        loading.value = false
    }
}
onMounted(fetchSongs)
</script>


<template>
    <div v-if="loading" class="tip">
        正在加载中...
    </div>
    <SongList v-else :songlist="songs" />
</template>

<style scoped>
.tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}
</style>