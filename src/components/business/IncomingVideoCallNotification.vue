<template>
  <!-- 全局拖动圆球 - 独立于overlay之外 -->
  <div 
    v-if="showIncomingVideoCallNotification && isMinimized" 
    class="global-minimized-ball"
    :style="ballStyle"
    @mousedown="startDrag"
    @click="handleBallClick"
  >
    <div class="ball-avatar">
      <img 
        :src="incomingVideoCallInfo?.avatar || '/default-avatar.png'" 
        :alt="incomingVideoCallInfo?.name"
        class="ball-avatar-img"
      />
    </div>
    <div class="ball-pulse"></div>
    <div class="ball-pulse"></div>
    <div class="ball-pulse"></div>

    
    <!-- 快速操作按钮 -->
    <div class="ball-quick-actions">
      <button class="ball-action-btn accept-quick" @click.stop="acceptVideoCall" title="接受">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      </button>
      <button class="ball-action-btn reject-quick" @click.stop="rejectVideoCall" title="拒绝">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- 完整窗口模态框 -->
  <div
    v-if="showIncomingVideoCallNotification && !isMinimized"
    class="incoming-video-call-overlay"
  >
    <div class="incoming-video-call-modal">
      <!-- 来电头部 -->
      <div class="call-header">
        <div class="caller-info">
          <img 
            :src="incomingVideoCallInfo?.avatar || '/default-avatar.png'" 
            :alt="incomingVideoCallInfo?.name"
            class="caller-avatar"
          />
          <div class="caller-details">
            <h3 class="caller-name">{{ incomingVideoCallInfo?.name || '未知用户' }}</h3>
            <p class="call-type">视频通话邀请</p>
          </div>
        </div>
        
        <!-- 右侧操作区域 -->
        <div class="header-actions">
          <!-- 最小化按钮 -->
          <button class="minimize-btn" @click="toggleMinimize" title="最小化">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          
          <!-- 视频通话图标动画 -->
          <div class="video-call-icon">
            <svg class="pulsing-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 来电提示文本 -->
      <div class="call-message">
        <p>想要与您进行视频通话</p>
        <p class="call-hint">接受后将开启摄像头和麦克风</p>
      </div>

      <!-- 操作按钮 -->
      <div class="call-actions">
        <!-- 拒绝按钮 -->
        <button 
          class="action-btn reject-btn"
          @click="rejectVideoCall"
          title="拒绝视频通话"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
          </svg>
          <span>拒绝</span>
        </button>

        <!-- 接受按钮 -->
        <button 
          class="action-btn accept-btn"
          @click="acceptVideoCall"
          title="接受视频通话"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <span>接受</span>
        </button>
      </div>

      <!-- WebSocket连接状态检查提示 -->
      <div v-if="!isWebSocketConnected" class="connection-warning">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <span>网络连接异常，请检查网络后重试</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useVideoCallStore } from '@/stores/videoCall.js'
import { useUserInfoStore } from '@/stores/user.js'
import { onUnmounted } from 'vue'
// 使用视频通话store和用户信息store
const videoCallStore = useVideoCallStore()
const userInfoStore = useUserInfoStore()

// 最小化状态
const isMinimized = ref(false)

// 拖动相关状态
const isDragging = ref(false)
const ballPosition = ref({ x: window.innerWidth - 130, y: window.innerHeight - 130 }) // 默认右下角
const dragOffset = ref({ x: 0, y: 0 })
const dragStartPosition = ref({ x: 0, y: 0 }) // 记录拖动开始位置
const hasDragged = ref(false) // 是否已经拖动过

// 从store获取状态
const showIncomingVideoCallNotification = computed(() => videoCallStore.showIncomingVideoCallNotification)
const incomingVideoCallInfo = computed(() => videoCallStore.incomingVideoCallInfo)

// 检查WebSocket连接状态（修复响应式依赖问题）
const isWebSocketConnected = computed(() => {
  // 直接从 chatWS 实例的响应式属性获取状态
  const isConnected = userInfoStore.chatWS?.connectionStatus === 'connected';

  if (import.meta.env.DEV) {
    console.log('🔌 computed属性WebSocket连接检查:', {
      // 注意：直接访问 chatWS 实例内部的 ref
      storeConnectionStatus: userInfoStore.chatWS?.connectionStatus,
      isConnected
    });
  }

  return isConnected;
});

// 圆球样式计算（高性能版）
const ballStyle = computed(() => ({
  position: 'fixed',
  left: `${ballPosition.value.x}px`,
  top: `${ballPosition.value.y}px`,
  zIndex: 999999,
  cursor: 'grab',
  userSelect: 'none',
  pointerEvents: 'auto',
  willChange: 'transform, left, top',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  transition: 'none !important'
}))

/**
 * 接受视频通话
 */
const acceptVideoCall = async () => {
  // 详细的WebSocket连接状态调试
  console.log('🔍 开始接受视频通话 - WebSocket连接状态检查:')
  
  // 直接调用检查方法获取详细信息
  const connectionResult = videoCallStore.checkWebSocketConnection()
  console.log('🔌 WebSocket连接检查结果:', connectionResult)
  console.log('🔌 computed属性结果:', isWebSocketConnected.value)
  
  // 检查WebSocket连接
  if (!isWebSocketConnected.value) {
    console.warn('❌ WebSocket连接已断开，无法接受视频通话')
    // 可以在这里显示连接错误提示
    return
  }
  
  console.log('🎥 用户接受视频通话')
  const success = await videoCallStore.acceptVideoCall()
  
  if (!success) {
    console.error('❌ 接受视频通话失败')
    // 可以在这里显示错误提示
  }
}

/**
 * 拒绝视频通话
 */
const rejectVideoCall = () => {
  console.log('🎥 用户拒绝视频通话')
  videoCallStore.rejectVideoCall()
}

/**
 * 切换最小化状态
 */
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  console.log('🔄 切换视频通话确认框状态:', isMinimized.value ? '最小化' : '展开')
}

/**
 * 开始拖动（高性能版 - 参考通话气泡）
 */
const startDrag = (e) => {
  // 防止事件冒泡到点击事件
  e.preventDefault()
  e.stopPropagation()
  
  isDragging.value = true
  hasDragged.value = false // 重置拖动状态
  
  // 记录拖动开始位置
  dragStartPosition.value = {
    x: e.clientX,
    y: e.clientY
  }
  
  // 记录鼠标相对于圆球的偏移量
  dragOffset.value = {
    x: e.clientX - ballPosition.value.x,
    y: e.clientY - ballPosition.value.y
  }
  
  // 添加全局事件监听
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag, { passive: false })
  
  console.log('🐭 开始拖动圆球')
}

/**
 * 拖动中（高性能版 - 参考通话气泡）
 */
const onDrag = (e) => {
  if (!isDragging.value) return
  
  e.preventDefault()
  
  // 计算拖动距离，判断是否真正在拖动
  const dragDistance = Math.sqrt(
    Math.pow(e.clientX - dragStartPosition.value.x, 2) + 
    Math.pow(e.clientY - dragStartPosition.value.y, 2)
  )
  
  // 超过5像素才认为是真正的拖动
  if (dragDistance > 5) {
    hasDragged.value = true
  }
  
  // 直接计算新位置
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  // 边界限制（保证圆球不会超出屏幕）
  const ballSize = 80
  const maxX = window.innerWidth - ballSize
  const maxY = window.innerHeight - ballSize
  
  // 直接更新位置
  ballPosition.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
}

/**
 * 停止拖动（简化版）
 */
const stopDrag = () => {
  isDragging.value = false
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  console.log('🐭 停止拖动圆球')
}

/**
 * 处理圆球点击事件（高性能版 - 参考通话气泡）
 */
const handleBallClick = (e) => {
  // 如果刚刚拖动过，不触发点击事件
  if (hasDragged.value) {

    return
  }
  
  e.preventDefault()
  e.stopPropagation()
  
  // 点击圆球展开为完整窗口
  toggleMinimize()
}

// 组件卸载时清理事件监听器（简化版）
onUnmounted(() => {
  // 清理拖动相关的事件监听器
  if (isDragging.value) {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
  
  console.log('🧽 组件卸载：清理拖动资源')
})
</script>

<style scoped>
.incoming-video-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

/* 全局最小化圆球样式 */
.global-minimized-ball {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(145deg, #3b82f6, #1d4ed8);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ball-pulse 2s infinite;
  overflow: visible;
}

.global-minimized-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.6);
}

.global-minimized-ball:active {
  transform: scale(0.95);
}

/* 最小化圆球样式 */
.minimized-ball {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, #3b82f6, #1d4ed8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(59, 130, 246, 0.4),
    0 0 0 0 rgba(59, 130, 246, 0.7);
  animation: ball-pulse 2s infinite;
  transition: all 0.3s ease;
  overflow: hidden;
}

.minimized-ball:hover {
  transform: scale(1.1);
  box-shadow: 
    0 12px 48px rgba(59, 130, 246, 0.6),
    0 0 0 0 rgba(59, 130, 246, 0.9);
}

/* 圆球内的头像 */
.ball-avatar {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.ball-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 圆球脉冲效果 */
.ball-pulse {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  animation: ball-ripple 2s infinite ease-out;
}

.ball-pulse:nth-child(3) {
  animation-delay: 0.5s;
}

.ball-pulse:nth-child(4) {
  animation-delay: 1s;
}



.ball-video-icon svg {
  width: 12px;
  height: 12px;
  color: white;
}

/* 快速操作按钮 */
.ball-quick-actions {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 4;
}

.global-minimized-ball:hover .ball-quick-actions {
  opacity: 1;
  top: -20px;
}

.ball-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ball-action-btn svg {
  width: 16px;
  height: 16px;
  color: white;
}

.accept-quick {
  background: linear-gradient(145deg, #10b981, #059669);
}

.accept-quick:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.reject-quick {
  background: linear-gradient(145deg, #ef4444, #dc2626);
}

.reject-quick:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.incoming-video-call-modal {
  background: rgb(247, 247, 247);
  border-radius: 24px;
  padding: 32px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
  text-align: center;
}

.call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.caller-info {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.caller-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.caller-details {
  flex: 1;
}

.caller-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.call-type {
  font-size: 14px;
  color: #3b82f6;
  margin: 0;
  font-weight: 500;
}

/* 头部操作区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 最小化按钮 */
.minimize-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.minimize-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: scale(1.1);
}

.minimize-btn svg {
  width: 16px;
  height: 16px;
}

.video-call-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulsing-icon {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  animation: pulse 2s infinite;
}

.call-message {
  margin-bottom: 32px;
}

.call-message p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #374151;
}

.call-hint {
  font-size: 14px !important;
  color: #6b7280 !important;
}

.call-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 100px;
}

.action-btn svg {
  width: 24px;
  height: 24px;
}

.reject-btn {
  background: #ef4444;
  color: white 
}
span {
  color: rgb(255, 255, 255);
  font-weight: 800;
  font-size: 16px;
 }
.reject-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.accept-btn {
  background: #10b981;
  color: white;
}

.accept-btn:hover {
  background: #059669;
  transform: translateY(-2px);
}

.connection-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
}

.connection-warning svg {
  width: 16px;
  height: 16px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 圆球脉冲动画 */
@keyframes ball-pulse {
  0% {
    transform: scale(1);
    box-shadow: 
      0 8px 32px rgba(59, 130, 246, 0.4),
      0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 
      0 12px 48px rgba(59, 130, 246, 0.6),
      0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 
      0 8px 32px rgba(59, 130, 246, 0.4),
      0 0 0 0 rgba(59, 130, 246, 0.7);
  }
}



/* 响应式设计 */
@media (max-width: 768px) {
  .incoming-video-call-modal {
    min-width: 320px;
    max-width: 90vw;
    padding: 24px;
  }
  
  .caller-avatar {
    width: 56px;
    height: 56px;
  }
  
  .caller-name {
    font-size: 18px;
  }
  
  .call-actions {
    gap: 16px;
  }
  
  .action-btn {
    min-width: 80px;
    padding: 12px 16px;
  }
}
</style>


