<script setup>
import MvCard from './MvCard.vue';
defineProps(['mvs'])
</script>

<template>
  <div class="mv-grid" v-if="mvs&&mvs.length>0">
    <MvCard 
    v-for="mv in mvs" 
    :key="mv.id" 
    :item="mv"
    />
  </div>
  <div v-else>暂无mv数据</div>
</template>

<style scoped>
.mv-grid {
  display: grid;
  /* 响应式网格：每行最少3个，最多5个 */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* auto-fill: 自动填充，容器有多宽就放多少个 */
  /* minmax(250px, 1fr): 每个格子最小 250px，最大平分剩余空间 */
  row-gap: 10px;
  column-gap: 25px;
}
</style>