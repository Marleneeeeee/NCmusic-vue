<script setup>
import {computed,ref,onMounted} from 'vue'
import api from '@/api';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import CreatePlaylistModal from '@/components/modal/CreatePlaylistModal.vue';

const userStore=useUserStore()
const playlists=ref([])
const albums=ref([])
const router=useRouter()

const showCreateModal = ref(false) // 控制弹窗显示

// 网络请求，获取用户歌单
const fetchUserPlaylists=async()=>{
  try{
    const uid=userStore.user?.id
    if(!uid) return
    const res=await api.get('/user/playlist',{uid})
    playlists.value=res.playlist?.map((item)=>({
        id:item.id,
        name:item.name,
        cover:item.coverImgUrl,
        trackCount:item.trackCount,
        userId:item.userId,
        privacy:item.privacy,
        specialType:item.specialType
    }))||[]
    console.log('我的歌单',playlists.value);
  }
  catch(err){
    console.log("获取用户歌单失败",err);
  }
}
// const fetchUserDigitalAlbums=async()=>{
//   try{
//     const res=await api.get('/digitalAlbum/purchased');
//     albums=res.paidAlbums?.map((item)=>({
//       id:item.id,
//       title:item.name,
//       cover:
//       publishTime:
//       size:
//     }))
//   }
//   catch(err){
//     console.log("获取我的数字专辑失败",err);
//   }
// }

const handleCreateSuccess = () => {
  showCreateModal.value = false // 关闭弹窗
  fetchUserPlaylists() // 刷新列表，看到新歌单
}

onMounted(()=>{
    fetchUserPlaylists();
    // fetchUserDigitalAlbums()
})
const handleGoLogin=()=>{
    userStore.isLoginModalVisible=true
}
const handleOpenPlaylist=(id)=>{
    if(!id) return
    router.push({
        name:'playlist',
        query:{id}
    })
}

</script>

<template>
    <div class="mymusic-page">
        <div class="mymusic-inner">
            <h2 class="title">我的音乐</h2>
            <div v-if="!userStore.isLoggedIn" class="login-hint">
                <div class="hint-text">您还未登录，登录后方可查看个人歌单</div>
                <button class="hint-btn" type="button" @click="handleGoLogin">登录</button>
            </div>
            <div v-else>
                <p class="subtitle">我的歌单</p>
                <div v-if="!playlists.length" class="tip">暂无歌单，快去音乐馆收藏一些音乐吧</div>
                <ul v-else class="playlist-list">
                    <li class="playlist-item create-card" @click="showCreateModal = true">
                      <div class="create-content">
                        <div class="plus-icon">+</div>
                        <p>新建歌单</p>
                      </div>
                    </li>
                    <li v-for="item in playlists" :key="item.id" class="playlist-item" @click="handleOpenPlaylist(item.id)">
                        <div class="cover">
                            <img :src="item.cover" alt="">
                        </div>
                        <div class="info">
                            <p class="name">{{ item.name }}
                            </p>
                            <div class="count">
                              <span>共{{ item.trackCount }}首</span>
                              <!-- 我创建的（隐私歌单） -->
                              <div v-if="item.privacy">
                                <IconPrivacy theme="filled" size="22" :fill="'var(--text-muted)'"/>
                              </div>
                              <!-- 我创建的（非隐私歌单） -->
                              <div v-else-if="userStore.user.id==item.userId&&item.specialType!=5">
                                <IconAvator theme="filled" size="22" :fill="'var(--text-muted)'"/>
                              </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <CreatePlaylistModal 
          v-if="showCreateModal" 
          @close="showCreateModal = false"
          @success="handleCreateSuccess"
        />
    </div>
</template>

<style scoped>
.mymusic-page {
  min-height: calc(100vh - 90px);
  padding: 24px 32px;
}

.mymusic-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.login-hint {
  margin-top: 24px;
  padding: 24px 28px;
  border-radius: 8px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-surface);
}

.hint-text {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-regular);
}

.hint-btn {
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.hint-btn:hover {
  background: var(--color-primary-hover);
}

.subtitle{
  color: var(--text-regular);
  margin-bottom: 10px;
}

.tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}

.playlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* 响应式布局 */
  gap: 20px;
  list-style: none;
  padding: 0;
}

.playlist-item {
  background: var(--bg-surface);
  border-radius: 8px;
  box-shadow: var(--shadow-surface);
  overflow: hidden;
}
.playlist-item :hover{
  cursor: pointer;
}

/* “新建歌单”特殊卡片样式 */
.create-card {
  border: 2px dashed var(--border-color);
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* 保证和有封面的歌单高度接近 */
}
.create-card:hover {
  border-color: var(--text-muted);
  background: var(--border-color);
}
.create-content {
  text-align: center;
  color: var(--text-muted);
}
.create-card:hover .create-content { color: var(--text-regular); }
.plus-icon { font-size: 40px; font-weight: 200; margin-bottom: 8px; }
.create-content p { margin: 0; font-size: 14px; }

.cover {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.cover:hover img {
  transform: scale(1.06);
}
.info {
  padding: 8px 10px 10px;
}

.name {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 22px;
}
</style>