<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import modal from './modal.vue'

const props = defineProps({
  songId: {
    type: [Number, String],
    required: true
  },
  playlistId:{
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close','success'])
const loading = ref(false)

// --- 🌟 自定义轻提示逻辑 ---
const toastMsg = ref('')
const toastType = ref('success') // 'success' 或 'error'

const showToast = (msg, type = 'error') => {
  toastMsg.value = msg
  toastType.value = type
  // 2秒后自动清除提示
  setTimeout(() => {
    toastMsg.value = ''
  }, 2000)
}
// 2. 添加歌曲到选中歌单
const handleDelete = async () => {
  if (!props.songId || !props.playlistId) {
    showToast('缺少必要参数', 'error')
    return
  }

  loading.value = true
  try {
    const res = await api.post('/playlist/tracks', null, {
      params: {
        op: 'del', // 核心修改：操作类型改为删除 (del)
        pid: props.playlistId,
        tracks: props.songId,
        timestamp: Date.now()
      }
    })
    
    // 兼容取值：部分拦截器会把数据放在 res.body 里，有的直接是 res
    const resData = res.body || res 
    
    if (resData.code === 200) {
      showToast('已成功从歌单移除！', 'success')
      // 延迟 1 秒后关闭弹窗，并通知父组件更新
      setTimeout(() => {
        emit('success') // 通知父组件去重新获取歌单列表
        emit('close')
      }, 1000)
    } else {
      showToast(resData.message || resData.msg || '移除失败', 'error')
    }
  } catch (err) {
    console.error('移除歌曲报错', err)
    showToast('网络请求失败，请稍后再试', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <modal @close="emit('close')" width="360px">
    <div class="delete-modal-inner">
      
      <transition name="fade">
        <div v-if="toastMsg" :class="['custom-toast', toastType]">
          {{ toastMsg }}
        </div>
      </transition>

      <div class="header">
        <h3>删除歌曲</h3>
        <span class="close-x" @click="emit('close')">&times;</span>
      </div>

      <div class="confirm-content">
        <p class="warning-text">确定要将该歌曲从歌单中删除吗？</p>
      </div>

      <div class="footer-actions">
        <button class="btn btn-cancel" @click="emit('close')" :disabled="loading">取消</button>
        <button class="btn btn-confirm" @click="handleDelete" :disabled="loading">确定</button>
      </div>
      
      <div v-if="loading" class="loading-overlay">删除中...</div>
    </div>
  </modal>
</template>

<style scoped>
.delete-modal-inner { position: relative; color: #333; padding-bottom: 10px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.close-x { font-size: 24px; color: #999; cursor: pointer; line-height: 1;}
.close-x:hover { color: #333; }

/* 🌟 自定义 Toast 样式 */
.custom-toast {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #fff;
  z-index: 100;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.custom-toast.success { background-color: #52c41a; }
.custom-toast.error { background-color: #f5222d; }

/* 渐变动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -10px); }

/* 内容区 */
.confirm-content {
  text-align: center;
  padding: 20px 0 30px;
}
.warning-text {
  margin: 0;
  font-size: 15px;
  color: #333;
}

/* 底部按钮 */
.footer-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.btn {
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s;
}
.btn-cancel {
  background-color: #f2f2f2;
  color: #333;
}
.btn-cancel:hover { background-color: #e5e5e5; }

.btn-confirm {
  background-color: #c20c0c;
  color: #fff;
}
.btn-confirm:hover { background-color: #a80a0a; }

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute; top: 0; left: -20px; right: -20px; bottom: -20px;
  background: rgba(255,255,255,0.7); display: flex;
  justify-content: center; align-items: center; font-weight: bold;
  border-radius: 8px; z-index: 10;
}
</style>