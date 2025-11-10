<template>
  <div class="floating-container" :style="containerStyle">
    <img :src="imageUrl" alt="Love" class="love-image" :style="imageStyle" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    default: '/src/assets/image/emojiSets/贴吧表情/爱.png',
  },
  minSize: {
    type: Number,
    default: 50,
  },
  maxSize: {
    type: Number,
    default: 200,
  },
  duration: {
    type: Number,
    default: 5, // in seconds
  },
});



const containerStyle = computed(() => ({
  '--min-scale': props.minSize / props.maxSize,
  '--max-scale': 1,
  '--duration': `${props.duration}s`,
}));

const imageStyle = computed(() => ({
  width: `${props.maxSize}px`,
  height: `${props.maxSize}px`,
}));

</script>

<style scoped>
.floating-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  pointer-events: none;
  overflow: hidden;
}

.love-image {
  animation: pulse-and-zoom var(--duration) ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes pulse-and-zoom {
  0% {
    transform: scale(var(--min-scale));
    opacity: 0.7;
  }
  50% {
    transform: scale(var(--max-scale));
    opacity: 1;
  }
  100% {
    transform: scale(var(--min-scale));
    opacity: 0.7;
  }
}


</style>


