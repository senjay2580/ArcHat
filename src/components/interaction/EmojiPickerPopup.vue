<template>
  <transition name="emoji-fade">
    <div v-if="visible" class="emoji-drawer-container">
      <emoji-picker
        @emoji-click="(e) => $emit('emoji-click', e)"
        :native="true"
        :show-preview="true"
        :show-skin-tones="true"
        :show-search="true"
        :show-categories="true"
        :show-recent="true"
        :theme="isDarkMode ? 'dark' : 'light'"
      />
    </div>
  </transition>
</template>

<script setup>
import { useDark } from '@vueuse/core';
import 'emoji-picker-element';

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

defineEmits(['emoji-click']);

const isDarkMode = useDark();
</script>

<style scoped>
.emoji-drawer-container {
  position: absolute;
  bottom: 80px; /* Adjust this value based on your input container height */
  left: 10px;
  z-index: 1000;
  width: 450px;
  height: 500px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 12px;
  box-sizing: border-box;
}

.dark-mode .emoji-drawer-container {
  background: rgba(40, 40, 40, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(emoji-picker) {
    --background: transparent;
    --border-color: transparent;
    --category-background-color: transparent;
    --input-background-color: rgba(255, 255, 255, 0.2);
    --input-font-color: #000;
    --outline-color: transparent;
    --indicator-color: #999;
    --hover-background-color: rgba(255, 255, 255, 0.1);

    height: 100%;
    width: 100%;
}

.dark-mode :deep(emoji-picker) {
    --input-background-color: rgba(0, 0, 0, 0.2);
    --input-font-color: #fff;
    --indicator-color: #666;
    --hover-background-color: rgba(0, 0, 0, 0.1);
}

/* Emoji animation */
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}


</style>


