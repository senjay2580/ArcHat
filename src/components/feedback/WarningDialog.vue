<template>
  <Transition name="warning-slide" appear>
    <div 
      v-if="visible" 
      class="warning-dialog"
      :class="{ 'dark-mode': isDark }"
    >
      <div class="warning-content">
        <div class="warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="warning-message">
          <div class="warning-title">{{ title }}</div>
          <div v-if="message" class="warning-text">{{ message }}</div>
        </div>
        <button 
          class="warning-close" 
          @click="handleClose"
          aria-label="关闭"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'update:visible'])

const isDark = useDark()

const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}
</script>

<style scoped>
.warning-dialog {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: auto;
}

.warning-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(251, 191, 36, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(251, 191, 36, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 320px;
  max-width: 500px;
  color: #92400e;
  position: relative;
  overflow: hidden;
}

.warning-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
  animation: warning-shimmer 2s ease-in-out infinite;
}

.warning-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #d97706;
  margin-top: 2px;
}

.warning-message {
  flex: 1;
  min-width: 0;
}

.warning-title {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.4;
  color: #92400e;
  margin-bottom: 2px;
}

.warning-text {
  font-size: 14px;
  line-height: 1.5;
  color: #a16207;
  opacity: 0.9;
}

.warning-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(217, 119, 6, 0.1);
  border-radius: 6px;
  color: #d97706;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: -2px;
}

.warning-close:hover {
  background: rgba(217, 119, 6, 0.2);
  transform: scale(1.05);
}

.warning-close:active {
  transform: scale(0.95);
}

/* 暗色模式 */
.dark-mode .warning-content {
  background: rgba(120, 53, 15, 0.95);
  border-color: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.dark-mode .warning-title {
  color: #fbbf24;
}

.dark-mode .warning-text {
  color: #fcd34d;
}

.dark-mode .warning-icon {
  color: #fbbf24;
}

.dark-mode .warning-close {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.dark-mode .warning-close:hover {
  background: rgba(251, 191, 36, 0.2);
}

/* 动画效果 */
.warning-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.warning-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.warning-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100px) scale(0.8);
}

.warning-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-50px) scale(0.9);
}

@keyframes warning-shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .warning-dialog {
    left: 10px;
    right: 10px;
    transform: none;
  }
  
  .warning-content {
    min-width: auto;
    max-width: none;
  }
}
</style>
