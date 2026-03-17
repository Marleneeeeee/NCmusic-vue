import {ref,computed} from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import { usePlayerStore } from './player'

// 本地存储的key
const STORAGE_KEY='nc_user'

export const useUserStore=defineStore('user',()=>{
    // 参数1是唯一标识，参数2是Store结构
    const user=ref(null)
    const isVip=ref(false)

    // 判断是否已经登录
    const isLoggedIn=computed(()=>!!user.value) //有没有值=>是否登录

    // 状态管理的存储，不仅要在pinia，也要存储在本地
    const setUser=(payload)=>{
        if(!payload) return
        const normalized={
            id:payload.id,
            nickname:payload.nickname,
            avatar:payload.avatar
        }
        user.value=normalized
        localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized))
        fetchVipInfo(normalized.id)
    }
    const clearUser=()=>{
        user.value=null
        isVip.value=false
        localStorage.removeItem(STORAGE_KEY)
        // 用户下线，播放器记录也清除，否则变成不同账号在一个浏览器上共享了
        const playerStore=usePlayerStore()
        playerStore.resetPlayer()
    }

    // ⭐️ 新增：专门获取 VIP 信息的 Action
    const fetchVipInfo = async (uid) => {
        if (!uid) return
        try {
            const res = await api.get('/vip/info', { 
                params: { 
                    uid: uid,
                } 
            })
            if (res && res.code === 200) {
                const vipData = res.data
                const now = Date.now() // 获取当前时间戳
                
                // 核心判定逻辑更新：
                // 1. 存在黑胶 VIP 等级 (redVipLevel > 0)
                // 2. 并且 associator(普通会员) 或 musicPackage(音乐包) 的过期时间大于当前时间
                const isRedVipValid = vipData.redVipLevel > 0 && vipData.associator?.expireTime > now
                const isMusicPackageValid = vipData.musicPackage?.expireTime > now
                // 只要其中一个在有效期内，就是 VIP
                isVip.value = isRedVipValid || isMusicPackageValid
                console.log('VIP 有效期状态：', isVip.value)
            } else {
                isVip.value = false
            }
        } catch (error) {
            console.error('获取VIP信息失败', error)
            isVip.value = false
        }
    }

    // 从本地存储中初始化用户信息
    const initFromLocal=()=>{
        const raw=localStorage.getItem(STORAGE_KEY)
        if(!raw) return
        const parsed=JSON.parse(raw)
        if(parsed&&parsed.id){
            user.value=parsed
            // ⭐️ 新增：用户刷新页面时，依靠本地存储恢复了用户信息，同时重新拉取一次实时 VIP 状态
            fetchVipInfo(parsed.id)
        }
    }

    initFromLocal()
    return {user,isVip,isLoggedIn,setUser,clearUser}
})