<template>
  <div v-if="visible" class="call-options-overlay" @click="close">
    <div class="call-options-popup" @click.stop>
      <div class="option-item" @click="startVoiceCall">
        <div class="option-icon voice-icon">
          <Phone :size="24" />
        </div>
        <span class="option-text">语音通话</span>
      </div>
      
      <div class="option-item" @click="startVideoCall">
        <div class="option-icon video-icon">
          <Video :size="24" />
        </div>
        <span class="option-text">视频通话</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Phone, Video } from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'voice-call', 'video-call'])

const close = () => {
  emit('close')
}

const startVoiceCall = () => {
  console.log('CallOptionsPopup: 语音通话按钮被点击');
  emit('voice-call')
  console.log('CallOptionsPopup: 已发送 voice-call 事件');
  close()
}

const startVideoCall = () => {
  console.log('CallOptionsPopup: 视频通话按钮被点击');
  emit('video-call')
  console.log('CallOptionsPopup: 已发送 video-call 事件');
  close()
}

</script>

<style scoped>
.call-options-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.call-options-popup {
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  animation: slideUp 0.2s ease-out;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  gap: 12px;
}

.option-item:hover {
  background: #f5f5f5;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.voice-icon {
  background: #52c41a;
}

.video-icon {
  background: #1890ff;
}

.option-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 暗色模式 */
.dark .call-options-popup {
  background: #2d2d2d;
}

.dark .option-item:hover {
  background: #3d3d3d;
}

.dark .option-text {
  color: #fff;
}
</style>


