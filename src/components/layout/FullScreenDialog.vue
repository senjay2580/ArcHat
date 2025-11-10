<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
        <div 
          class="dialog-content" 
          :class="{ 'maximized': isMaximized }"
          @click.stop
        >
          <div class="dialog-header">
            <div class="mac-window-controls">
              <button class="mac-btn close" @click="handleClose" data-tooltip="关闭">
                <el-icon><Close /></el-icon>
              </button>
              <button class="mac-btn maximize" @click="handleMaximize" :class="{ active: isMaximized }" data-tooltip="全屏">
                <el-icon><FullScreen /></el-icon>
              </button>
            </div>
            <h2 class="dialog-title">{{ title }}</h2>
            <div class="header-right"></div>
          </div>
          <div class="dialog-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Close, FullScreen } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible'])

const isMaximized = ref(false)

const handleClose = () => {
  emit('update:visible', false)
}

const handleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// 新增：每次弹窗打开时重置为非全屏
watch(
  () => props.visible,
  (val) => {
    if (val) {
      isMaximized.value = false
    }
  }
)
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8vh;
  z-index: 2000;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dialog-overlay .dialog-content {
  margin: 0;
  padding-top: 0;
}

.dialog-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform-origin: center;
  animation: dialog-enter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity;
}

.dialog-content.maximized {
  width: 95%;
  height: 95vh;
  max-width: 95%;
  max-height: 95vh;
  border-radius: 16px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 1;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  text-align: center;
}

.header-right {
  width: 100px;
}

/* Mac 窗口控制按钮样式 */
.mac-window-controls {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: transparent;
  width: 100px;
}

.mac-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  padding: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 1px 2px rgba(255, 255, 255, 0.3),
    0 -1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mac-btn .el-icon {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mac-btn:hover {
  transform: scale(1.1);
  box-shadow: 
    0 2px 4px rgba(255, 255, 255, 0.4),
    0 -1px 2px rgba(0, 0, 0, 0.2);
}

.mac-btn:hover .el-icon {
  opacity: 1;
}

.mac-btn:active {
  transform: scale(0.95);
}

.mac-btn.close {
  background: #ff5f57;
}

.mac-btn.maximize {
  background: #28c840;
  cursor: pointer;
}

.mac-btn.active {
  opacity: 0.7;
}

.mac-btn.active:hover {
  opacity: 1;
}

/* 暗色模式适配 */
:deep(.dark-mode) .dialog-content {
  background: rgba(26, 29, 45, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

:deep(.dark-mode) .dialog-title {
  color: #E5EAF3;
}

:deep(.dark-mode) .dialog-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark-mode) .mac-btn {
  box-shadow: 
    0 1px 2px rgba(255, 255, 255, 0.2),
    0 -1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.dark-mode) .mac-btn:hover {
  box-shadow: 
    0 2px 4px rgba(255, 255, 255, 0.3),
    0 -1px 2px rgba(0, 0, 0, 0.3);
}

:deep(.dark-mode) .mac-btn .el-icon {
  color: rgba(255, 255, 255, 0.5);
}

/* 工具提示样式 */
.mac-btn {
  position: relative;
}

.mac-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mac-btn:hover::after {
  opacity: 1;
  visibility: visible;
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-content,
.dialog-fade-leave-to .dialog-content {
  transform: scale(0.96) translateY(-10px);
}

@keyframes dialog-enter {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 暗色模式适配 */
:deep(.dark-mode) .dialog-content.maximized {
  background: rgba(26, 29, 45, 0.98);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

/* 优化滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.3s ease;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

:deep(.dark-mode) .dialog-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

:deep(.dark-mode) .dialog-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.sign-calendar-root {
  width: 100%;
  max-width: 360px;
  background: rgba(255,255,255,0.85);
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10);
  margin: 0 auto;
  padding: 24px 0 32px 0; /* 底部多留点空间给按钮 */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}
.sign-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 0;
}

/* 伪代码，实际类名请根据你的弹窗实现调整 */
.search-dialog-content, .fullscreen-dialog-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0;
  background: transparent;
}
</style> 

