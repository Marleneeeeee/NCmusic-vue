<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import MvList from '@/components/mv/MvList.vue'

const route = useRoute()
const artistId = computed(() => route.query.id)
const mvs = ref([])
const loading = ref(false)

const fetchMvs = async () => {
    loading.value = true
    try {
        const res=await api.get('/artist/mv',{id:artistId.value})
            mvs.value = (res.mvs || []).map((mv)=> ({
            id:mv.id,
            cover:mv.imgurl,
            name:mv.name,
            duration:mv.dt||mv.duration||0,
            artist:(mv.ar||mv.artists||[]).map((a)=>a.name).join('/'),
        }))
    }
    catch (err) {
        console.error('获取歌手MV失败', err)
    }
    finally{
        loading.value=false
    }
}
onMounted(fetchMvs)

</script>


<template>
    <div v-if="loading" class="tip">
        正在加载中...
    </div>
    <MvList v-else :mvs="mvs" />
</template>


<style scoped>
.tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}
</style>