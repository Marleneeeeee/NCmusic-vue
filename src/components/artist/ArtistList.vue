<script setup>
import ArtistItem from './ArtistItem.vue';
const props = defineProps(['artists'])

</script>


<template>
<div class="artist-list" v-if="props.artists && props.artists.length > 0">
    <ArtistItem v-for="artist in props.artists" :key="artist.id" :artist="artist"></ArtistItem>
</div>
<div v-else class="artist-list-empty">
    暂无歌手数据
</div>
</template>

<style scoped>
.artist-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 8px;
  background: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
</style>