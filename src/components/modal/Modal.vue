<script setup>
const props = defineProps({
  theme: {
    type: String,
    default: 'light' // 默认是亮色（白底）
  }
})

const emit = defineEmits(['close'])

const handleOverlayClick = () => {
  emit('close')
}
</script>

<template>
  <transition name="fade">
    <div class="overlay" @click="handleOverlayClick">
      <div 
        class="modal-card" 
        :class="theme === 'dark' ? 'theme-dark' : 'theme-light'"
        @click.stop
      >
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 遮罩层 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-card {
  width: 420px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  animation: popIn 0.3s ease-out;
}

/* 3. 提前写好两套皮肤的颜色 */
.theme-light {
  background: #ffffff;
  color: #333333;
}

.theme-dark {
  background: #2a2b2d;
  color: #ffffff;
}
/* 统一定义动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>