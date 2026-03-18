import { createRouter, createWebHistory } from 'vue-router'
import MusicHall from '../views/MusicHall.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MusicHall,
    },{
      path:'/mymusic',
      name:"mymusic",
      component:()=>import("../views/MyMusic.vue")
    },
    {
      path:'/login',
      name:'login',
      component:()=>import("../views/Login.vue")
    },
    {
      path:'/mvplayer',
      name:'mvplayer',
      component:()=>import("../views/MvPlayer.vue")
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/search/SearchResult.vue'),
      redirect: '/search/summary', // 默认跳到综合页
      children: [
        { path: 'summary', component: () => import('@/views/search/SearchSummary.vue') },
        { path: 'song', component: () => import('@/views/search/SearchSong.vue') },
        { path: 'album', component: () => import('@/views/search/SearchAlbum.vue') },
        { path: 'artist', component: () => import('@/views/search/SearchArtist.vue') },
        { path: 'playlist', component: () => import('@/views/search/SearchPlaylist.vue') },
        { path: 'mv', component: () => import('@/views/search/SearchMv.vue') }
      ]
    },
    {
      path:'/musiclist',
      name:'musiclist',
      component:()=>import("../views/Playlist.vue")
    },
    {
      path: '/artist',
      name: 'artist', // 必须加上这个 name
      component: () => import('@/views/artist/Artist.vue'),
      redirect: (to) => ({ path: '/artist/song', query: to.query }), 
      children: [
        { path: 'song', component: () => import('@/views/artist/ArtistSong.vue') },
        { path: 'album', component: () => import('@/views/artist/ArtistAlbum.vue') },
        { path: 'mv', component: () => import('@/views/artist/ArtistMv.vue') }
      ]
    },
    {
      path:'/albumsongs',
      name:'albumsongs',
      component:()=>import("../views/AlbumSongs.vue")
    },
  ],
})
router.afterEach((to, from) => {
  // 1. 提取一级路径，比如 /search/song -> search, /artist -> artist
  const toBase = to.path.split('/')[1];
  const fromBase = from.path.split('/')[1];

  // 2. 只有当一级路径不同时，才认为是一次“跨页面跳转”，执行重置
  if (toBase !== fromBase) {
    // 获取你在 App.vue 里的那个滚动容器
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }
  // 如果 toBase 和 fromBase 一样（比如都在 search 内部切 Tab）
  // 就什么都不做，滚动条会停留在原处（配合你的 KeepAlive 完美使用）
});
export default router
