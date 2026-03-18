<script setup>
import { onMounted, ref, watch } from 'vue'
import api from '@/api'
import QRCode from 'qrcode' 
import modal from './modal.vue'

const props = defineProps({
  albumId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close'])

const albumTitle = ref('加载中...')
const albumNum = ref(1) // 购买数量
const paymentMethod = ref(3) // 3 为微信，0 为支付宝
const qrCodeUrl = ref('')

// 减少数量
const decreaseNum = () => {
  if (albumNum.value > 1) {
    albumNum.value--
  }
}

// 增加数量
const increaseNum = () => {
  albumNum.value++
}

// 获取专辑基本信息（为了在弹窗上显示名字）
const fetchAlbumInfo = async () => {
  try {
    const res = await api.get('/album', { id: props.albumId })
    if (res.album) {
      albumTitle.value = res.album.name
    }
  } catch(err) {
    console.log('获取专辑详情失败', err)
  }
}

// 获取购买链接并生成二维码
const getBuyAlbumQrCode = async () => {
  try {
    // ======== 真实的接口请求 ========
    const res = await api.get('/digitalAlbum/ordering', { 
      id: props.albumId, 
      payment: paymentMethod.value,
      quantity: albumNum.value  // 将选择的数量传给接口
    })
    const paymentUrl = res.payUrl
    // 把链接转成 base64 二维码图片
    qrCodeUrl.value = await QRCode.toDataURL(paymentUrl, {
      width: 150,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch(err) {
    console.log('生成二维码失败', err)
  }
}

// 监听数量或支付方式变化，重新生成二维码
// 因为有这个 watch，所以点击加减号时，二维码会自动刷新
watch([albumNum, paymentMethod], () => {
  getBuyAlbumQrCode()
})

onMounted(() => {
  fetchAlbumInfo()
  getBuyAlbumQrCode()
})

const closeBox = () => {
  emit('close')
}
</script>

<template>
  <modal theme="dark" @close="closeBox">
      <div class="modal-header">
        <h3>购买数字专辑</h3>
        <span class="close-icon" @click="closeBox">&times;</span>
      </div>
      
      <div class="modal-body">
        <p class="album-name">《{{ albumTitle }}》</p>
        
        <div class="quantity-control">
          <span class="qty-label">购买数量：</span>
          <button class="qty-btn" @click="decreaseNum" :disabled="albumNum <= 1">-</button>
          <span class="qty-num">{{ albumNum }}</span>
          <button class="qty-btn" @click="increaseNum">+</button>
        </div>
        
        <div class="pay-methods">
          <button :class="{ active: paymentMethod === 3 }" @click="paymentMethod = 3">微信支付</button>
          <button :class="{ active: paymentMethod === 0 }" @click="paymentMethod = 0">支付宝</button>
        </div>
        
        <div class="qr-container">
          <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="支付二维码">
          <div v-else class="qr-placeholder">二维码加载中...</div>
        </div>
        <p class="scan-tip">请使用手机扫码支付</p>
      </div>
    </modal>
</template>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-icon {
  font-size: 28px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}
.close-icon:hover { color: #fff; }

.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.album-name {
  font-size: 16px;
  margin-bottom: 16px;
  color: #ccc;
  text-align: center;
}

/* ================== 新增：数量控制器样式 ================== */
.quantity-control {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.qty-label {
  font-size: 14px;
  color: #aaa;
  margin-right: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #333;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #444;
  border-color: #666;
}

.qty-btn:disabled {
  color: #555;
  border-color: #333;
  background: transparent;
  cursor: not-allowed;
}

.qty-num {
  min-width: 36px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}
/* ========================================================== */

.pay-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.pay-methods button {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #444;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-methods button.active {
  background: #1890ff; 
  border-color: #1890ff;
  color: #fff;
}

.qr-container {
  width: 160px;
  height: 160px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.qr-container img { width: 150px; height: 150px; }

.qr-placeholder { color: #333; font-size: 14px; }
.scan-tip { font-size: 12px; color: #888; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>