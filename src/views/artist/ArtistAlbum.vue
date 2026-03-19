<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import AlbumList from '@/components/album/AlbumList.vue'

const route = useRoute()
const artistId = computed(() => route.query.id)
const albums = ref([])
const loading = ref(false)

const fetchAlbums = async () => {
  loading.value = true
  try {
        const res=await api.get('/artist/album',{id:artistId.value})
        albums.value = (res.hotAlbums||[]).map((a)=>({
          id:a.id,
          title:a.name,
          size:a.size,
          cover:a.picUrl,
          desc:a.description,
          artist:(a.ar||a.artists||[]).map((a)=>a.name).join('/'),
          publishTime:a.publishTime
        }))
    }
    catch (err) {
        console.error('获取歌手专辑失败', err)
    }
    finally {
        loading.value = false
    }
}
onMounted(fetchAlbums)
</script>


<template>
    <div v-if="loading" class="tip">
        正在加载中...
    </div>
    <AlbumList v-else :albums="albums" />
</template>


<style scoped>
.tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}
</style>