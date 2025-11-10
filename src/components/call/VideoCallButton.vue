<template>
  <button
    class="video-call-btn"
    :class="{ 'disabled': !canStartVideoCall }"
    :disabled="!canStartVideoCall"
    @click="handleVideoCallClick"
    :title="getButtonTooltip()"
  >
    <!-- 视频通话图标 -->
    <svg class="video-call-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
    
    <!-- 按钮文本 -->
    <span class="btn-text">视频通话</span>
    
    <!-- 加载状态 -->
    <div v-if="isStartingVideoCall" class="loading-spinner">
      <svg class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="15.71 15.71">
          <animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVideoCallStore } from '@/stores/videoCall.js'
import { ElMessage } from 'element-plus'

// 定义props
const props = defineProps({
  targetUser: {
    type: Object,
    required: true,
    validator: (user) => {
      return user && (user.id || user.uid) && (user.name || user.username)
    }
  }
})

// 使用视频通话store
const videoCallStore = useVideoCallStore()

// 组件状态
const isStartingVideoCall = ref(false)

// 计算属性
const canStartVideoCall = computed(() => {
  const { canStart } = videoCallStore.canStartVideoCall()
  return canStart && !isStartingVideoCall.value
})

/**
 * 获取按钮提示文本
 */
const getButtonTooltip = () => {
  if (isStartingVideoCall.value) {
    return '正在发起视频通话...'
  }
  
  const { canStart, reason } = videoCallStore.canStartVideoCall()
  
  if (!canStart) {
    switch (reason) {
      case 'websocket_disconnected':
        return '网络连接已断开，请检查网络后重试'
      case 'call_in_progress':
        return '当前有通话正在进行，请稍后再试'
      default:
        return '暂时无法发起视频通话'
    }
  }
  
  return `与 ${props.targetUser.name || props.targetUser.username} 进行视频通话`
}

/**
 * 处理视频通话按钮点击
 */
const handleVideoCallClick = async () => {
  if (!canStartVideoCall.value) {
    return
  }
  
  // 检查目标用户信息
  if (!props.targetUser || (!props.targetUser.id && !props.targetUser.uid)) {
    ElMessage.error('目标用户信息无效')
    return
  }
  
  // 避免自己给自己打电话
  const currentUserId = videoCallStore.checkWebSocketConnection() ? 
    videoCallStore.$state.userStore?.userInfo?.uid : null
  const targetUserId = props.targetUser.id || props.targetUser.uid
  
  if (currentUserId && currentUserId.toString() === targetUserId.toString()) {
    ElMessage.warning('不能给自己发起视频通话')
    return
  }
  
  try {
    isStartingVideoCall.value = true
    
    console.log('🎥 用户点击视频通话按钮:', {
      targetUser: props.targetUser,
      currentUserId,
      targetUserId
    })
    
    // 显示发起提示
    ElMessage.info(`正在向 ${props.targetUser.name || props.targetUser.username} 发起视频通话...`)
    
    // 标准化目标用户信息
    const normalizedTargetUser = {
      id: targetUserId,
      name: props.targetUser.name || props.targetUser.username,
      username: props.targetUser.username || props.targetUser.name,
      avatar: props.targetUser.avatar || ''
    }
    
    // 发起视频通话
    const result = await videoCallStore.startVideoCall(normalizedTargetUser)
    
    if (result.success) {
      console.log('✅ 视频通话发起成功')
      ElMessage.success('视频通话已发起，等待对方接听...')
    } else {
      console.error('❌ 视频通话发起失败:', result.reason)
      
      // 根据失败原因显示不同的错误信息
      switch (result.reason) {
        case 'websocket_disconnected':
          ElMessage.error('网络连接已断开，请检查网络后重试')
          break
        case 'call_in_progress':
          ElMessage.warning('当前有通话正在进行，请稍后再试')
          break
        case 'start_call_failed':
          ElMessage.error('视频通话发起失败，请重试')
          break
        case 'exception':
          ElMessage.error(`视频通话发起异常: ${result.error || '未知错误'}`)
          break
        default:
          ElMessage.error('视频通话发起失败，请重试')
      }
    }
  } catch (error) {
    console.error('❌ 视频通话按钮处理异常:', error)
    ElMessage.error('视频通话发起异常，请重试')
  } finally {
    isStartingVideoCall.value = false
  }
}
</script>

<style scoped>
.video-call-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.video-call-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.video-call-btn:active:not(.disabled) {
  transform: translateY(0);
}

.video-call-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.video-call-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-text {
  flex: 1;
  white-space: nowrap;
}

.loading-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.spinner {
  width: 16px;
  height: 16px;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-call-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .video-call-icon {
    width: 16px;
    height: 16px;
  }
  
  .btn-text {
    display: none; /* 在小屏幕上只显示图标 */
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .video-call-btn.disabled {
    background: #4b5563;
    color: #9ca3af;
  }
}

/* 焦点状态 */
.video-call-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.video-call-btn:hover:not(.disabled) .video-call-icon {
  animation: pulse 1.5s infinite;
}
</style>


