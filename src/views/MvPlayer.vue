<script setup>
import {computed,onMounted,ref} from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api';

const route=useRoute()
const mvid=computed(()=>route.query.id)
// computed 返回的是一个 Ref 响应式对象（类似于 { value: "5436712" }），而不是直接的值

// mv名字,歌手,发布时间,mv 视频地址
const Mvname=ref('')
const artistName=ref('')
const MvDesc=ref('')
const MvReleaseTime=ref('')
const MvDuration=ref('')

// 播放地址
const mvUrl = ref('')

const fetchMvData = async () => {
    const id = mvid.value
    if (!id) return;
    try {
        // 🌟 使用 Promise.all 并发请求，大大提升加载速度！
        // 注意看参数名：一个是 mvid，一个是 id
        console.log(id);
        
        const [detailRes, urlRes] = await Promise.all([
            api.get('/mv/detail', { mvid: id }),
            api.get('/mv/url', { id: id })
        ])
        
        // 1. 处理 MV 详情数据
        const detailData = detailRes.data
        if (detailData) {
            Mvname.value = detailData.name||''
            artistName.value = (detailData.artists||[]).map((a)=>a.name).join('/')
            MvDesc.value = detailData.desc||''
            MvReleaseTime.value = detailData.publishTime||''
            MvDuration.value = detailData.duration 
        }
        // 2. 处理 MV 播放地址
        if (urlRes.data && urlRes.data.url) {
            mvUrl.value = urlRes.data.url
        }
    } catch (err) {
        console.log('MV数据获取失败', err);
    }
}
onMounted(() => {
    fetchMvData()
})
</script>

<template>
  <div class="mv-player-page">
    <div class="video-container">
      <video 
        v-if="mvUrl"
        class="my-video"
        :src="mvUrl" 
        controls 
        autoplay
      ></video>
      <div v-else class="loading-tip">视频加载中...</div>
    </div>

    <div class="mv-info">
      <h2 class="title">{{ Mvname }}</h2>
      <p class="artist">{{ artistName }}</p>
      <p class="time">发布时间: {{ MvReleaseTime }}</p>
      <p class="desc">{{ MvDesc }}</p>
    </div>
  </div>
</template>

<style scoped>
.mv-player-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}
.video-container {
  width: 100%;
  background-color: var(--bg-body);
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9; /* 保持16:9的视频比例 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.my-video {
  width: 100%;
  height: 100%;
  outline: none;
}
.loading-tip {
  color: var(--text-muted);
  font-size: 16px;
}
.mv-info {
  margin-top: 20px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-primary);
}
.artist {
  color: var(--text-regular);
  margin-bottom: 12px;
}
.time{
  color: var(--text-regular);
  margin-bottom: 20px;
}
.desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>