<template>
  <div class="emoji-picker-container" v-if="show">
    <div class="emoji-picker-header">
      <div class="window-controls">
        <div class="control-dot close" @click="closePicker"></div>
        <div class="control-dot minimize"></div>
        <div class="control-dot expand"></div>
      </div>
      <div class="emoji-picker-spacer"></div>
    </div>
    <div class="emoji-grid">
      <button 
        v-for="emoji in customEmojis" 
        :key="emoji.name" 
        @click="selectEmoji(emoji)"
        class="emoji-button"
        :title="emoji.name"
      >
        <img :src="emoji.src" :alt="emoji.name" class="custom-emoji-img" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { customEmojis } from '@/utils/customEmojis.js';

defineProps({ show: Boolean });
const emit = defineEmits(['select', 'close']);

const selectEmoji = (emoji) => {
  emit('select', emoji);
};

const closePicker = () => {
  emit('close');
};
</script>

<style scoped>
.emoji-picker-container {
  
  z-index: 100;
  width: 320px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.dark .emoji-picker-container {
  background-color: #1f2937;
  border-color: #374151;
}

.emoji-picker-header {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.dark .emoji-picker-header {
  background-color: #374151;
  border-bottom-color: #4b5563;
}

.window-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-dot.close {
  background-color: #ff5f57;
  cursor: pointer;
}

.control-dot.minimize {
  background-color: #ffbd2e;
}

.control-dot.expand {
  background-color: #28c940;
}



.dark .emoji-picker-title {
  color: #d1d5db;
}

.emoji-picker-spacer {
  width: 54px; /* Balance the controls */
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  padding: 12px;
  max-height: 280px;
  overflow-y: auto;
}

.emoji-button {
  background: none;
  border: none;
  border-radius: 8px;
  padding: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-button:hover {
  background-color: #f3f4f6;
}

.dark .emoji-button:hover {
  background-color: #4b5563;
}

.custom-emoji-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
</style>


