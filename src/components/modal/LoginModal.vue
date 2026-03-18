<script setup>
import {ref,onMounted,onBeforeMount,onUnmounted,watch} from 'vue'
import api from '@/api';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import modal from './modal.vue';

const router=useRouter()
const emit=defineEmits(['close'])
// 状态管理
const userStore=useUserStore()

// --- Tab 状态管理 ---
const currentTab = ref('qr') // 默认扫码登录
const tabs = [
    { key: 'qr', label: '扫码登录' },
    { key: 'mobile', label: '手机登录' },
    { key: 'email', label: '邮箱登录' }
]

// 二维码图片
const qrImg=ref('')

// 登录key
const loginKey=ref('')

// 轮询定时器(二维码扫描)
const qrCheckTimer=ref(null)

// 点击空白处取消弹出框
const closeLoginModal=(event)=>{
    // if(event.target===event.currentTarget){
        // 1、event.currentTarget：事件绑定的 DOM 元素（@click 绑定在哪个元素上，就是哪个元素）
        // 固定为 .login-overlay
        // 2、event.target：实际被点击的 DOM 元素（用户鼠标真正点到的那个元素）
        // 点遮罩层空白 → .login-overlay
        // 点弹窗内容 → .login-modal/ 二维码 / 文字
    // }
    emit('close')
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
                    // 登陆成功关闭弹窗
                    emit('close')
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
    <modal @close="closeLoginModal" theme="light" width="560px">
        <div class="login-container">
            <div class="login-header">
                <h2>登录</h2>
                <span class="close-icon" @click="closeLoginModal">&times;</span>
            </div>

            <div class="login-tabs">
                <div 
                    v-for="tab in tabs" 
                    :key="tab.key"
                    class="tab-item"
                    :class="{ active: currentTab === tab.key }"
                    @click="currentTab = tab.key"
                >
                    {{ tab.label }}
                </div>
            </div>

            <div class="login-content">
                <div v-if="currentTab === 'qr'" class="tab-pane qr-pane">
                    <div class="qr-left">
                        <div class="qr-img-box">
                            <img v-if="qrImg" :src="qrImg" alt="二维码">
                            <div v-else class="loading-text">加载中...</div>
                        </div>
                        <p class="qr-tips">使用 <span class="highlight">网易云音乐APP</span> 扫码</p>
                    </div>
                    <div class="qr-right">
                        <ul class="feature-list">
                            <li>同步收藏歌单、歌曲</li>
                            <li>多端同步，随时畅听</li>
                            <li>更安全的扫码方式</li>
                        </ul>
                    </div>
                </div>

                <div v-else-if="currentTab === 'mobile'" class="tab-pane placeholder-pane">
                    <div class="placeholder-content">
                        <div class="icon">📱</div>
                        <p>手机号账号功能正在开发中...</p>
                        <button class="mock-btn" disabled>获取验证码</button>
                    </div>
                </div>

                <div v-else-if="currentTab === 'email'" class="tab-pane placeholder-pane">
                    <div class="placeholder-content">
                        <div class="icon">✉️</div>
                        <p>邮箱登录功能正在开发中...</p>
                        <input type="text" class="mock-input" placeholder="请输入邮箱账号" disabled>
                    </div>
                </div>
            </div>

            <div class="login-footer">
                登录即代表同意《服务协议》和《隐私政策》
            </div>
        </div>
    </modal>
</template>

<style scoped>
.login-container {
    position: relative;
    color: #333;
}

/* 头部 */
.login-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.login-header h2 {
    font-size: 20px;
    margin: 0;
    font-weight: 600;
}
.close-icon {
    font-size: 30px;
    color: #ccc;
    cursor: pointer;
    line-height: 1;
}
.close-icon:hover { color: #666; }

/* Tab 切换栏 - 解决空白的关键 */
.login-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 30px;
}
.tab-item {
    padding: 10px 20px;
    cursor: pointer;
    font-size: 15px;
    color: #666;
    position: relative;
    transition: all 0.2s;
}
.tab-item:hover { color: #c20c0c; }
.tab-item.active {
    color: #c20c0c;
    font-weight: bold;
}
.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #c20c0c;
}

/* 内容面板布局 */
.login-content {
    min-height: 200px;
}

/* 扫码页左右布局 */
.qr-pane {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.qr-left {
    text-align: center;
}
.qr-img-box {
    width: 150px;
    height: 150px;
    border: 1px solid #f0f0f0;
    padding: 8px;
    background: #fff;
    border-radius: 4px;
    margin: 0 auto 15px;
}
.qr-img-box img { width: 100%; height: 100%; }
.qr-tips { font-size: 13px; color: #666; }
.highlight { color: #c20c0c; font-weight: bold; }

.qr-right .feature-list {
    list-style: none;
    padding: 0;
}
.qr-right .feature-list li {
    margin-bottom: 15px;
    font-size: 14px;
    color: #555;
    display: flex;
    align-items: center;
}
.qr-right .feature-list li::before {
    content: '●';
    color: #c20c0c;
    margin-right: 10px;
    font-size: 12px;
}

/* 占位页样式 */
.placeholder-pane {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}
.placeholder-content {
    text-align: center;
    color: #999;
}
.placeholder-content .icon { font-size: 40px; margin-bottom: 10px; }
.mock-btn, .mock-input {
    margin-top: 15px;
    padding: 8px 20px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #f9f9f9;
}

/* 底部 */
.login-footer {
    margin-top: 20px;
    text-align: center;
    font-size: 12px;
    color: #bbb;
}
</style>