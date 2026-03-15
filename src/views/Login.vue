<script setup>
import {ref,onMounted,onBeforeMount,onUnmounted,watch} from 'vue'
import api from '@/api';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router=useRouter()

// 状态管理
const userStore=useUserStore()

// 二维码图片
const qrImg=ref('')

// 登录key
const loginKey=ref('')

// 轮询定时器(二维码扫描)
const qrCheckTimer=ref(null)

// 点击空白处取消弹出框
const handleOverlayClick=(event)=>{
    if(event.target===event.currentTarget){
        // 1、event.currentTarget：事件绑定的 DOM 元素（@click 绑定在哪个元素上，就是哪个元素）
        // 固定为 .login-overlay
        // 2、event.target：实际被点击的 DOM 元素（用户鼠标真正点到的那个元素）
        // 点遮罩层空白 → .login-overlay
        // 点弹窗内容 → .login-modal/ 二维码 / 文字
        router.push('/')
    }
}

// 获取二维码登陆的key
const fetchLoginKey=async()=>{
    try{
        const res=await api.get('/login/qr/key',{ timestamp: Date.now() })
        console.log(res)
        loginKey.value=res.data?.unikey||''
    }
    catch(err){
        console.log('获取二维码登录key失败',err);
        loginKey.value=''
    }
}

// 根据key获取二维码图片
const fetchQrImage=async(key)=>{
    if(!key) return
    try{
        const res=await api.get('/login/qr/create',{
            key,
            timestamp:Date.now(),
            ua:'pc',
            qrimg:true
        })
        qrImg.value=res.data?.qrimg||''  
    }  
    catch(err){
        console.log('获取二维码图片失败',err);
        qrImg.value=''
    }
}
// 轮询二维码状态（用户是否扫码），成功后保存用户信息
const startQrCheck=(key)=>{
    if(!key) return
    if(qrCheckTimer.value){
        clearInterval(qrCheckTimer.value)
    }
    qrCheckTimer.value=setInterval(async()=>{
        console.log('轮询中...', Date.now())
        try{
            const res=await api.get('/login/qr/check',{
                key,
                timestamp:Date.now(),
                ua:'pc'
            })
            // 常见状态：800二维码过期，801等待扫码，802待确认，803授权登录成功
            if(res.code===800){ // 二维码过期：提示并重新获取
                clearInterval(qrCheckTimer.value)
                qrCheckTimer.value=null
                alert('二维码已过期，请刷新重新获取')
                fetchLoginKey() // 重新获取key，生成新二维码
            } else if(res.code===801 || res.code===802){ // 等待扫码/待确认：不做操作
                console.log(res.code===801 ? '等待扫码...' : '请在APP确认登录...');
                return // 直接返回，不执行后续代码
            } else if(res.code===803){ // 登录成功：保存用户信息 + 跳转首页
                if (res.cookie) {
            }
                clearInterval(qrCheckTimer.value)
                qrCheckTimer.value=null
                // 授权成功之后，再调用登陆状态接口获取用户完整信息
                try{
                    const statusRes=await api.get('/login/status',{
                        timestamp:Date.now(),
                        ua:'pc'
                    })
                    const profile=statusRes.data?.profile||statusRes.profile||statusRes.account
                    if(profile){
                        // 修正：account.id → profile.id（account是未定义的变量）
                        userStore.setUser({
                            id:profile.userId, 
                            nickname:profile.nickname,
                            avatar:profile.avatarUrl
                        })
                    }
                    // 只有登录成功才跳转首页！
                    router.push('/') 
                }
                catch(err){
                    console.log('登录状态获取失败',err);
                }
            }
        }
        catch(err){
            console.log('检查二维码登陆状态失败',err);
            // 异常时清理定时器，避免无限轮询
            clearInterval(qrCheckTimer.value)
            qrCheckTimer.value=null
        }
    },3000)
}


// 监听是否获取到key，如果获取到key，就调用获取二维码的方法
watch(
    ()=>loginKey.value,
    (val)=>{ // val 是 loginKey.value 变化后的新值
        if(val){
            fetchQrImage(val)
        }
    }
)
watch(
    ()=>qrImg.value,
    (val)=>{
        if(val&&loginKey.value){
            startQrCheck(loginKey.value)
        }
    }
)

onMounted(()=>{
    userStore.clearUser()
    fetchLoginKey()
})
onBeforeMount(()=>{
    if(qrCheckTimer.value){
        clearInterval(qrCheckTimer.value)
        qrCheckTimer.value=null
    }
})
onUnmounted(()=>{
    clearInterval(qrCheckTimer.value)
        qrCheckTimer.value=null
})
</script>

<template>
    <div class="login-overlay" @click="handleOverlayClick">
        <div class="login-modal">
            <div class="login-header">
                <h2>扫码登录网易云音乐</h2>
                <p>使用网易云音乐APP扫码登录，更安全快捷</p>
            </div>
            <div class="login-body">
                <div class="qrcode-box">
                    <div class="qrcode-placeholder">
                        <template v-if="qrImg">
                            <img :src="qrImg" alt="登录二维码">
                        </template>
                        <template v-else>
                            <span>二维码加载中</span>
                        </template>
                    </div>
                    <p class="qrcode-tip">打开网易云音乐APP，扫一扫登录</p>
                </div>
                <ul class="login-features">
                    <li>同步收藏的歌单、歌曲和播放记录</li>
                    <li>多端同步，随时随地畅听音乐</li>
                    <li>更安全的扫码登录方式</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  /* inset: 0 等价于 top: 0; right: 0; bottom: 0; left: 0 */
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.login-modal {
  width: 420px;
  padding: 24px 32px 32px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.login-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.login-header p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #666;
}

.login-body {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}

.qrcode-box {
  text-align: center;
}

.qrcode-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.qrcode-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.qrcode-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.login-features {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
  color: #555;
}

.login-features li + li {
  margin-top: 8px;
}
</style>