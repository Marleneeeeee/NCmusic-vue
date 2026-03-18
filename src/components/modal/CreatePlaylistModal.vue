<script setup>
import { ref } from 'vue'
import api from '@/api'
import modal from './modal.vue' // 确保路径指向你的通用 Modal
import { Log } from '@icon-park/vue-next'

const emit = defineEmits(['close', 'success'])

const playlistName = ref('')
const isPrivacy = ref(false)
const loading = ref(false)

const handleCreate = async () => {
  const name = playlistName.value.trim()
  
  if (!name) {
    alert('请输入歌单名称')
    return
  }

  loading.value = true
  try {
    // 根据文档：/playlist/create?name=xxx&privacy=10
    const res = await api.post('/playlist/create', {
        name: name,
        privacy: isPrivacy.value ? '10' : undefined,
        timestamp: Date.now() // 防止缓存
    })

    if (res.code === 200) {
      alert('创建成功！')
      emit('success') // 通知父组件刷新列表
    } else {
      alert(res.msg || '创建失败')
      console.log(res)
    }
  } catch (err) {
    console.error('创建歌单出错', err)
    alert('请求失败，请检查网络或登录状态')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <modal @close="emit('close')" width="400px">
    <div class="create-modal-inner">
      <div class="header">
        <h3>新建歌单</h3>
        <span class="close-x" @click="emit('close')">&times;</span>
      </div>

      <div class="body">
        <div class="input-wrap">
          <input 
            v-model="playlistName" 
            type="text" 
            placeholder="请输入新歌单标题" 
            autoFocus
            @keyup.enter="handleCreate"
          />
        </div>
        <div class="privacy-wrap">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isPrivacy">
            <span class="checkbox-text">设置为隐私歌单</span>
          </label>
        </div>
      </div>

      <div class="footer">
        <button class="btn-cancel" @click="emit('close')">取消</button>
        <button 
          class="btn-confirm" 
          :disabled="loading || !playlistName.trim()" 
          @click="handleCreate"
        >
          {{ loading ? '创建中...' : '创建' }}
        </button>
      </div>
    </div>
  </modal>
</template>

<style scoped>
.create-modal-inner { color: #333; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header h3 { margin: 0; font-size: 18px; font-weight: 600; }
.close-x { font-size: 24px; color: #999; cursor: pointer; }

.body { margin-bottom: 24px; }

.input-wrap input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.input-wrap input:focus { border-color: #c20c0c; }

.privacy-wrap { margin-top: 12px; }
.checkbox-label { display: flex; align-items: center; cursor: pointer; }
.checkbox-text { font-size: 13px; color: #666; margin-left: 6px; }

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-cancel, .btn-confirm {
  padding: 7px 18px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  background: #fff;
  transition: all 0.2s;
}
.btn-confirm {
  background: #c20c0c;
  color: #fff;
  border: none;
}
.btn-confirm:hover { background: #a00a0a; }
.btn-confirm:disabled { background: #ef9a9a; cursor: not-allowed; }
.btn-cancel:hover { background: #f5f7fa; }
</style>