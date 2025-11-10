<template>
  <div v-show="isInVideoCall" ref="videoBubbleRef" class="video-call-bubble"
    :class="{ 'minimized': isVideoCallMinimized, 'fullscreen': isFullscreen }" :style="bubbleStyle"
    @mousedown="startDrag"
    @mousemove="isFullscreen ? handleFullscreenMouseMove($event) : null">
    <!-- 最小化状态 -->
    <div v-if="isVideoCallMinimized" class="minimized-content" @click="expandVideoCall">
      <!-- 视频通话图标和状态指示器 -->
      <div class="mini-icon-container">
        <svg class="video-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
        <!-- 最小化状态指示器 -->
        <div class="mini-status-indicator" :class="getStatusClass()">
          <div class="mini-status-dot"></div>
          <!-- 最小化状态悬浮文字 -->
          <div class="mini-status-tooltip">{{ getStatusText() }}</div>
        </div>
      </div>

      <!-- 紧凑时长显示 -->
      <span class="compact-duration">{{ formatDuration(videoCallDuration) }}</span>

      <!-- 展开按钮 -->
      <button class="expand-btn" @click.stop="expandVideoCall" title="展开视频通话">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
      </button>
    </div>

    <!-- 展开状态 -->
    <div v-else class="expanded-content">

      
      <!-- 视频通话头部 -->
      <div 
        class="video-call-header" 
        :class="{ 'fullscreen-hidden': isFullscreen && !isFullscreenHovered }"
      >
        <div class="user-info">
          <!-- 头像容器和状态指示器 -->
          <div class="avatar-container">
            <img :src="remoteVideoUser.avatar || '/default-avatar.png'" :alt="remoteVideoUser.name" class="user-avatar" />
            <!-- 状态指示器定位在头像上方 -->
            <div class="status-indicator-wrapper" :class="getStatusClass()">
              <div class="status-dot"></div>
              <!-- 悬浮状态文字 -->
              <div class="status-tooltip">{{ getStatusText() }}</div>
            </div>
          </div>
          
          <div class="user-details">
            <span class="user-name">{{ remoteVideoUser.name }}</span>
            <div class="call-info">
        
              <span class="video-call-duration">{{ formatDuration(videoCallDuration) }}</span>
            </div>
          </div>
        </div>



        <div class="header-controls">
          <!-- 最小化按钮（全屏时隐藏） -->
          <button v-if="!isFullscreen" class="control-btn minimize-btn" @click.stop="minimizeVideoCall" title="最小化">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
              viewBox="0 0 16 16"><!-- Icon from OpenSearch UI by OpenSearch Contributors - https://github.com/opensearch-project/oui/blob/main/LICENSE.txt -->
              <path fill="currentColor"
                d="m1.146 14.146l4-4a.5.5 0 0 1 .765.638l-.057.07l-4 4a.5.5 0 0 1-.765-.638zl4-4zM6.5 8A1.5 1.5 0 0 1 8 9.5v3a.5.5 0 1 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1 0-1zm2-5a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 1 1 0 1h-3A1.5 1.5 0 0 1 8 6.5v-3a.5.5 0 0 1 .5-.5m1.651 2.146l4-4a.5.5 0 0 1 .765.638l-.057.07l-4 4a.5.5 0 0 1-.765-.638zl4-4z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 视频显示区域 -->
      <div class="video-display-area">
        <!-- 主视频显示区域 -->
        <div class="main-video-container">
          <!-- 远程视频作为主画面 -->
          <div v-if="!isLocalVideoMain" class="main-video-content">
            <video ref="remoteVideoRef" class="main-video" autoplay playsinline muted="false"></video>

            <!-- 远程视频占位符 -->
            <div v-if="!remoteVideoStream" class="video-placeholder">
              <div class="placeholder-content">
                <svg class="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                <span class="placeholder-text">等待对方视频...</span>
              </div>
            </div>
          </div>

          <!-- 本地视频作为主画面 -->
          <div v-else class="main-video-content">
            <video ref="localVideoMainRef" class="main-video" autoplay playsinline muted="true"></video>

            <!-- 本地视频占位符 -->
            <div v-if="!localVideoStream" class="video-placeholder">
              <div class="placeholder-content">
                <svg class="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span class="placeholder-text">本地视频</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 小窗口视频显示区域 -->
        <div 
          v-if="!isVideoCallMinimized" 
          class="small-video-container" 
          @click.stop="switchVideoLayout"
          title="点击切换视频布局"
        >
          <!-- 本地视频作为小窗口 -->
          <div v-if="!isLocalVideoMain" class="small-video-content">
            <video ref="localVideoRef" class="small-video" autoplay playsinline muted="true"></video>

            <!-- 本地视频占位符 -->
            <div v-if="!localVideoStream" class="small-video-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>

          <!-- 远程视频作为小窗口 -->
          <div v-else class="small-video-content">
            <video ref="remoteVideoSmallRef" class="small-video" autoplay playsinline muted="false"></video>

            <!-- 远程视频占位符 -->
            <div v-if="!remoteVideoStream" class="small-video-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>



      <!-- 视频通话控制按钮 -->
      <div 
        class="video-call-controls" 
        :class="{ 'fullscreen-hidden': isFullscreen && !isFullscreenHovered }"
      >
        <!-- 静音按钮 -->
        <button class="control-btn mute-btn" :class="{ 'muted': isVideoMuted }" @click.stop="toggleVideoMute"
          :title="isVideoMuted ? '取消静音' : '静音'">
          <svg v-if="!isVideoMuted" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c-.08 0-.15.04-.2.1-.05.06-.08.13-.08.2v1.5c0 3-2.5 5.1-5.5 5.1S6 12.8 6 9.8V8.3c0-.07-.03-.14-.08-.2-.05-.06-.12-.1-.2-.1-.08 0-.15.04-.2.1-.05.06-.08.13-.08.2v1.5c0 3.5 2.6 6.2 6 6.7v2.7h-2.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5H13v-2.7c3.4-.5 6-3.2 6-6.7V8.3c0-.07-.03-.14-.08-.2-.05-.06-.12-.1-.2-.1z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V4c0-1.66-1.34-3-3-3S9 2.34 9 4v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
          </svg>
        </button>

        <!-- 视频开关按钮 -->
        <button class="control-btn video-btn" :class="{ 'video-off': !isVideoEnabled }" @click.stop="toggleVideo"
          :title="isVideoEnabled ? '关闭视频' : '开启视频'">
          <svg v-if="isVideoEnabled" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82l-3.28-3.28c.46-.17.96-.22 1.46-.22h8c.55 0 1 .45 1 1v3.5l4-4v11zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2z" />
          </svg>
        </button>

        <!-- 切换摄像头按钮 -->
        <button class="control-btn camera-switch-btn" @click.stop="switchCamera" title="切换摄像头">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5L18.5 12 15 15.5z" />
          </svg>
        </button>

        <!-- 挂断按钮 -->
        <button class="control-btn hangup-btn" @click.stop="hangupVideoCall" title="挂断">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
        </button>
        <button class="control-btn fullscreen-btn" @click.stop="toggleFullscreen"
          :title="isFullscreen ? '退出全屏' : '全屏显示'">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
          </svg>
        </button>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVideoCallStore } from '@/stores/videoCall.js'

// 使用视频通话store
const videoCallStore = useVideoCallStore()

// 组件引用
const videoBubbleRef = ref(null)
const remoteVideoRef = ref(null)
const localVideoRef = ref(null)

// 拖拽相关状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const bubblePosition = ref({ x: window.innerWidth - 370, y: 100 }) // 默认位置在右侧

// 视频布局状态
const isLocalVideoMain = ref(false) // false: 远程视频为主画面, true: 本地视频为主画面
const localVideoMainRef = ref(null)
const remoteVideoSmallRef = ref(null)

// 全屏状态
const isFullscreen = ref(false)
const originalPosition = ref({ x: 0, y: 0 })
const originalSize = ref({ width: 350, height: 450 })

// B站风格全屏悬浮控制
const isFullscreenHovered = ref(false)
const fullscreenAutoHideTimer = ref(null) 
const lastMousePosition = ref({ x: 0, y: 0 }) // 记录最后鼠标位置

// 计算样式
const bubbleStyle = computed(() => {
  if (isFullscreen.value) {
    // 全屏模式下的样式
    return {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      transform: 'translate3d(0, 0, 0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '0px'
    }
  } else {
    // 普通模式下的样式 - 修正位置计算
    return {
      position: 'fixed',
      left: `${bubblePosition.value.x}px`,
      top: `${bubblePosition.value.y}px`,
      width: '350px',
      height: isVideoCallMinimized.value ? '80px' : '500px',
      zIndex: 9999,
      transform: 'translate3d(0, 0, 0)',
      transition: isDragging.value ? 'none' : 'all 0.3s ease',
      willChange: isDragging.value ? 'transform' : 'auto' // 拖拽时启用GPU加速
    }
  }
})

// 从store获取状态
const isInVideoCall = computed(() => videoCallStore.isInVideoCall)
const videoCallStatus = computed(() => videoCallStore.videoCallStatus)
const videoCallDuration = computed(() => videoCallStore.videoCallDuration)
const isVideoMuted = computed(() => videoCallStore.isVideoMuted)
const isVideoEnabled = computed(() => videoCallStore.isVideoEnabled)
const isVideoCallMinimized = computed(() => videoCallStore.isVideoCallMinimized)
const remoteVideoUser = computed(() => videoCallStore.remoteVideoUser)
const localVideoStream = computed(() => videoCallStore.localVideoStream)
const remoteVideoStream = computed(() => videoCallStore.remoteVideoStream)

/**
 * 格式化通话时长
 */
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}



/**
 * 获取状态指示器样式类
 */
const getStatusClass = () => {
  switch (videoCallStatus.value) {
    case 'calling': return 'status-calling'
    case 'ringing': return 'status-ringing'
    case 'connected': return 'status-connected'
    case 'ended': return 'status-ended'
    default: return 'status-idle'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = () => {
  switch (videoCallStatus.value) {
    case 'calling': return '拨打中...'
    case 'ringing': return '来电中...'
    case 'connected': return '通话中'
    case 'ended': return '已结束'
    default: return '空闲'
  }
}

/**
 * 判断通话是否活跃（用于显示动画）
 */
const isCallActive = () => {
  return ['calling', 'ringing', 'connected'].includes(videoCallStatus.value)
}

/**
 * 高性能Windows风格拖拽 - 直接DOM操作（采用语音通话方案）
 */
const startDrag = (e) => {
  // 全屏模式下禁用拖拽
  if (isFullscreen.value) return

  // 点击按钮时不触发拖拽
  if (e.target.closest('.control-btn, .expand-btn, button')) return

  isDragging.value = true
  const rect = videoBubbleRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  // 设置拖拽样式和优化
  if (videoBubbleRef.value) {
    videoBubbleRef.value.style.cursor = 'grabbing'
    videoBubbleRef.value.style.userSelect = 'none'
    videoBubbleRef.value.style.pointerEvents = 'none' // 防止子元素干扰
    videoBubbleRef.value.style.zIndex = '99999' // 确保在最顶层
  }

  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag, { passive: false })
  e.preventDefault()
  e.stopPropagation()
}

const onDrag = (e) => {
  if (!isDragging.value || !videoBubbleRef.value) return

  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y

  // 边界检查
  const bubbleWidth = isVideoCallMinimized.value ? 120 : 350
  const bubbleHeight = isVideoCallMinimized.value ? 80 : 500
  const maxX = window.innerWidth - bubbleWidth
  const maxY = window.innerHeight - bubbleHeight

  const boundedX = Math.max(0, Math.min(newX, maxX))
  const boundedY = Math.max(0, Math.min(newY, maxY))

  // 直接操作DOM，绕过Vue响应式系统
  videoBubbleRef.value.style.left = `${boundedX}px`
  videoBubbleRef.value.style.top = `${boundedY}px`

  // 更新内部位置状态（但不触发重新渲染）
  bubblePosition.value.x = boundedX
  bubblePosition.value.y = boundedY

  e.preventDefault()
  e.stopPropagation()
}

const stopDrag = () => {
  isDragging.value = false

  // 恢复样式
  if (videoBubbleRef.value) {
    videoBubbleRef.value.style.cursor = 'grab'
    videoBubbleRef.value.style.userSelect = ''
    videoBubbleRef.value.style.pointerEvents = '' // 恢复子元素事件
    videoBubbleRef.value.style.zIndex = '9999'
  }

  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

/**
 * 视频通话控制方法
 */
const minimizeVideoCall = () => {
  videoCallStore.toggleVideoCallMinimize()
}

const expandVideoCall = () => {
  if (isVideoCallMinimized.value) {
    videoCallStore.toggleVideoCallMinimize()
  }
}

const toggleVideoMute = () => {
  videoCallStore.toggleVideoMute()
}

const toggleVideo = () => {
  videoCallStore.toggleVideo()
}

const switchCamera = async () => {
  await videoCallStore.switchCamera()
}

const hangupVideoCall = () => {
  videoCallStore.endVideoCall()
}

/**
 * 监听视频流变化，更新video元素
 */
watch(localVideoStream, (newStream) => {
  console.log('📹 本地视频流变化:', !!newStream)
  nextTick(() => {
    updateVideoStreams()
  })
}, { immediate: true })

watch(remoteVideoStream, (newStream) => {
  console.log('📹 远程视频流变化:', !!newStream)
  nextTick(() => {
    updateVideoStreams()
  })
}, { immediate: true })

// 监听布局状态变化，重新更新视频流
watch(isLocalVideoMain, () => {
  console.log('🔄 布局状态变化:', isLocalVideoMain.value ? '本地为主' : '远程为主')
  nextTick(() => {
    updateVideoStreams()
  })
})

/**
 * 切换视频布局（主画面和小窗口互换）
 */
const switchVideoLayout = () => {
  console.log('🔄 切换视频布局:', {
    当前状态: isLocalVideoMain.value ? '本地为主' : '远程为主',
    将切换为: !isLocalVideoMain.value ? '本地为主' : '远程为主'
  })

  // 切换布局状态
  isLocalVideoMain.value = !isLocalVideoMain.value

  // 等待DOM更新后重新设置视频流
  nextTick(() => {
    updateVideoStreams()
  })
}

/**
 * 更新视频流到对应的video元素
 */
const updateVideoStreams = () => {
  console.log('📹 更新视频流到对应元素', {
    '布局状态': isLocalVideoMain.value ? '本地为主' : '远程为主',
    '本地流': !!localVideoStream.value,
    '远程流': !!remoteVideoStream.value,
    'refs': {
      localVideoRef: !!localVideoRef.value,
      remoteVideoRef: !!remoteVideoRef.value,
      localVideoMainRef: !!localVideoMainRef.value,
      remoteVideoSmallRef: !!remoteVideoSmallRef.value
    }
  })

  // 先清理所有video元素
  const allVideoRefs = [localVideoRef, remoteVideoRef, localVideoMainRef, remoteVideoSmallRef]
  allVideoRefs.forEach(ref => {
    if (ref.value) {
      ref.value.srcObject = null
    }
  })

  // 根据布局状态设置视频流
  if (isLocalVideoMain.value) {
    // 本地视频为主画面，远程视频为小窗口
    if (localVideoStream.value && localVideoMainRef.value) {
      console.log('✅ 设置本地视频为主画面')
      localVideoMainRef.value.srcObject = localVideoStream.value
    }
    if (remoteVideoStream.value && remoteVideoSmallRef.value) {
      console.log('✅ 设置远程视频为小窗口')
      remoteVideoSmallRef.value.srcObject = remoteVideoStream.value
    }
  } else {
    // 远程视频为主画面，本地视频为小窗口
    if (remoteVideoStream.value && remoteVideoRef.value) {
      console.log('✅ 设置远程视频为主画面')
      remoteVideoRef.value.srcObject = remoteVideoStream.value
    }
    if (localVideoStream.value && localVideoRef.value) {
      console.log('✅ 设置本地视频为小窗口')
      localVideoRef.value.srcObject = localVideoStream.value
    }
  }
}

/**
 * 切换全屏模式
 */
const toggleFullscreen = () => {
  try {
    if (!isFullscreen.value) {
      // 进入全屏模式
      console.log('🔍 进入全屏模式')

      // 保存当前位置和尺寸
      originalPosition.value = {
        x: bubblePosition.value.x,
        y: bubblePosition.value.y
      }

      if (videoBubbleRef.value) {
        originalSize.value = {
          width: videoBubbleRef.value.offsetWidth,
          height: videoBubbleRef.value.offsetHeight
        }
      }

      // 设置全屏状态
      isFullscreen.value = true

      // 禁用拖拽（全屏时不允许拖拽）
      if (videoBubbleRef.value) {
        videoBubbleRef.value.style.cursor = 'default'
      }

    } else {
      // 退出全屏模式
      console.log('🔍 退出全屏模式')

      // 恢复原始位置
      bubblePosition.value = {
        x: originalPosition.value.x,
        y: originalPosition.value.y
      }

      // 设置非全屏状态
      isFullscreen.value = false

      // 恢复拖拽功能
      if (videoBubbleRef.value) {
        videoBubbleRef.value.style.cursor = 'grab'
      }

      // 确保位置在屏幕范围内
      nextTick(() => {
        handleResize()
      })
    }

    console.log('✅ 全屏状态切换成功:', isFullscreen.value ? '全屏' : '窗口')

  } catch (error) {
    console.error('❌ 全屏切换失败:', error)
  }
}

/**
 * 窗口大小变化时调整位置
 */
const handleResize = () => {
  // 全屏模式下不需要调整位置
  if (isFullscreen.value) return

  const maxX = window.innerWidth - (videoBubbleRef.value?.offsetWidth || 350)
  const maxY = window.innerHeight - (videoBubbleRef.value?.offsetHeight || 400)

  bubblePosition.value = {
    x: Math.max(0, Math.min(bubblePosition.value.x, maxX)),
    y: Math.max(0, Math.min(bubblePosition.value.y, maxY))
  }
}

/**
 * B站风格全屏悬浮控制 - 鼠标移动检测
 */
const handleFullscreenMouseMove = (e) => {
  if (!isFullscreen.value) return
  
  const currentX = e.clientX
  const currentY = e.clientY
  
  // 检查鼠标是否移动了
  if (Math.abs(currentX - lastMousePosition.value.x) > 5 || 
      Math.abs(currentY - lastMousePosition.value.y) > 5) {
    
    // 更新鼠标位置
    lastMousePosition.value = { x: currentX, y: currentY }
    
    // 显示功能栏
    if (!isFullscreenHovered.value) {
      isFullscreenHovered.value = true
      console.log('🎬 鼠标移动，显示全屏控制')
    }
    
    // 重新启动自动隐藏定时器
    startAutoHideTimer()
    
    console.log('🐭 鼠标移动，重置5秒自动隐藏定时器')
  }
}

/**
 * 启动5秒自动隐藏定时器
 */
const startAutoHideTimer = () => {
  // 清除之前的定时器
  if (fullscreenAutoHideTimer.value) {
    clearTimeout(fullscreenAutoHideTimer.value)
  }
  
  // 启动新的定时器
  fullscreenAutoHideTimer.value = setTimeout(() => {
    if (isFullscreen.value && isFullscreenHovered.value) {
      isFullscreenHovered.value = false
  
    }
  }, 2000) // 2秒后自动隐藏
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 清理拖拽事件监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  // 清理全屏自动隐藏定时器
  if (fullscreenAutoHideTimer.value) {
    clearTimeout(fullscreenAutoHideTimer.value)
  }
})
</script>

<style scoped>
.video-call-bubble {
  position: fixed;
  background: rgba(230, 229, 229, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  /* 轻量级拖拽优化 */
  transition: none !important;
  /* 移除transition避免拖拽延迟 */
  width: 350px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s ease;
}

.video-call-bubble:active {
  cursor: grabbing;
}

/* 毛玻璃效果 */
.video-call-bubble.minimized {
  width: 120px;
  height: 60px;
  background: rgba(230, 229, 229, 0.1);
  color: rgba(7, 17, 105, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.minimized-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 100%;
  position: relative;
}

/* 最小化状态图标容器 */
.mini-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 最小化状态指示器 */
.mini-status-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 10;
}

.mini-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 最小化状态指示器颜色和动画 */
.status-calling .mini-status-dot {
  background: #f59e0b;
  animation: mini-blink-orange 1.5s infinite;
}

.status-ringing .mini-status-dot {
  background: #3b82f6;
  animation: mini-blink-blue 1s infinite;
}

.status-connected .mini-status-dot {
  background: #10b981;
  animation: mini-blink-green 2s infinite;
}

.status-ended .mini-status-dot {
  background: #ef4444;
  animation: mini-blink-red 0.8s infinite;
}

.status-idle .mini-status-dot {
  background: #6b7280;
}

/* 最小化状态指示器闪烁动画 */
@keyframes mini-blink-orange {
  0%, 50% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.3; transform: scale(0.7); }
  75% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes mini-blink-blue {
  0%, 50% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.2; transform: scale(0.6); }
  75% { opacity: 1; transform: scale(1.3); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes mini-blink-green {
  0%, 60% { opacity: 1; transform: scale(1); }
  30% { opacity: 0.4; transform: scale(0.8); }
  90% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes mini-blink-red {
  0%, 40% { opacity: 1; transform: scale(1); }
  20% { opacity: 0.1; transform: scale(0.5); }
  60% { opacity: 1; transform: scale(1.4); }
  100% { opacity: 1; transform: scale(1); }
}

/* 最小化状态悬浮文字 */
.mini-status-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 20;
  margin-bottom: 3px;
}

.mini-status-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 3px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

/* 最小化状态悬浮显示 */
.mini-status-indicator:hover .mini-status-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-2px);
}

.compact-duration {
  font-size: 24px;
  color: #fff;
  font-weight: 500;
  flex: 1;
  margin-left: 10%;
}

.expand-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #b11818;
  border: 2px solid white;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.expand-btn:hover {
  background: #21c521;
  transform: scale(1.1);
}

.expand-btn svg {
  width: 12px;
  height: 12px;
}

/* 展开状态 */
.expanded-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.video-call-header {
  display: flex;
  
  align-items: center;
  justify-content: space-between;
  padding: 16px;

}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 头像容器和状态指示器 */
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* 状态指示器定位在头像上方 */
.status-indicator-wrapper {
  position: absolute;
  top: -8px;
  right: -2px;
  z-index: 10;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 不同状态的指示器颜色和动画 */
.status-calling .status-dot {
  background: #f59e0b;
  animation: status-blink-orange 1.5s infinite;
}

.status-ringing .status-dot {
  background: #3b82f6;
  animation: status-blink-blue 1s infinite;
}

.status-connected .status-dot {
  background: #10b981;
  animation: status-blink-green 2s infinite;
}

.status-ended .status-dot {
  background: #ef4444;
  animation: status-blink-red 0.8s infinite;
}

.status-idle .status-dot {
  background: #6b7280;
}

/* 状态指示器闪烁动画 */
@keyframes status-blink-orange {
  0%, 50% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.3; transform: scale(0.8); }
  75% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes status-blink-blue {
  0%, 50% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.2; transform: scale(0.7); }
  75% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes status-blink-green {
  0%, 60% { opacity: 1; transform: scale(1); }
  30% { opacity: 0.4; transform: scale(0.9); }
  90% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes status-blink-red {
  0%, 40% { opacity: 1; transform: scale(1); }
  20% { opacity: 0.1; transform: scale(0.6); }
  60% { opacity: 1; transform: scale(1.3); }
  100% { opacity: 1; transform: scale(1); }
}

/* 悬浮状态文字 */
.status-tooltip {
  position: absolute;

  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}


/* 悬浮显示状态文字 */
.user-info:hover .status-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-2px);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.call-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}


.header-controls {
  display: flex;
  gap: 8px;
}

/* 视频显示区域 */
.video-display-area {
  flex: 1;
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 16px;
}

/* 主视频容器 */
.main-video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 主视频内容 */
.main-video-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.main-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 小视频容器 */
.small-video-container {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  pointer-events: auto;
  user-select: none;
  background: rgba(0, 0, 0, 0.1);
}

.small-video-container:hover {
  transform: scale(1.08);
  border-color: #3b82f6;
}

.small-video-container::after {
  content: '点击切换';
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
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.small-video-container:hover::after {
  opacity: 1;
}

/* 小视频内容 */
.small-video-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.small-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 小视频占位符 */
.small-video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.small-video-placeholder svg {
  width: 24px;
  height: 24px;
  opacity: 0.7;
}

/* 切换提示 */
.switch-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

/* 远程视频容器（兼容性保留） */
.remote-video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  color: #9ca3af;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
}

.placeholder-text {
  font-size: 14px;
}

/* 本地视频小窗口 */
.local-video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0;
  /* 矩形样式，去除圆角 */
  overflow: hidden;
  border: none;
  /* 去除边框 */
  background: #374151;
}

.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  /* 镜像显示本地视频 */
}

.local-video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.local-video-placeholder svg {
  width: 24px;
  height: 24px;
}

/* 毛玻璃 */
.video-call-duration {
  font-size: 10px;
  font-weight: 500;
  color: #f86767;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 控制按钮区域 */
.video-call-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;

}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: white;
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.minimize-btn {

  background: #6b7280;
}

.minimize-btn:hover {
  background: #4b5563;
}

.mute-btn {
  background: #10b981;
}

.mute-btn:hover {
  background: #059669;
}

.mute-btn.muted {
  background: #ef4444;
}

.mute-btn.muted:hover {
  background: #dc2626;
}

.video-btn {
  background: #3b82f6;
}

.video-btn:hover {
  background: #2563eb;
}

.video-btn.video-off {
  background: #ef4444;
}

.video-btn.video-off:hover {
  background: #dc2626;
}

.camera-switch-btn {
  background: #8b5cf6;
}

.camera-switch-btn:hover {
  background: #7c3aed;
}

.hangup-btn {
  background: #ef4444;
}

.hangup-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* 全屏控制区域 */
.fullscreen-controls {
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 0 0 16px 16px;

}

.fullscreen-btn {
  background: #3b82f6;
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.fullscreen-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.fullscreen-btn:active {
  transform: scale(0.95);
}

.fullscreen-btn svg {
  width: 20px;
  height: 20px;
}



/* 全屏模式下的样式调整 */
.video-call-bubble.fullscreen {
  border-radius: 0 !important;
  display: flex;
  flex-direction: column;
  margin-bottom: 200px;
}

.video-call-bubble.fullscreen .video-call-header {
  border-radius: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 12;


  background-color: rgba(255, 255, 255, 0.15); 


  

}

/* 全屏模式隐藏状态 */
.video-call-bubble.fullscreen .video-call-header.fullscreen-hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;

}

.video-call-bubble.fullscreen .call-header {
  border-radius: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  justify-content: flex-end;
  /* 信息按钮靠右显示 */
  padding: 16px 24px;
}

.video-call-bubble.fullscreen .call-header .new-tab-btn {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.video-call-bubble.fullscreen .call-header .user-info {
  color: white;
}

.video-call-bubble.fullscreen .call-header .user-name {
  color: white;
}

.video-call-bubble.fullscreen .call-header .call-status {
  color: rgba(255, 255, 255, 0.8);
}

.video-call-bubble.fullscreen .video-display-area {
  border-radius: 0;
  margin: 0;
  flex: 1;
  height: calc(100vh - 14000px);
  /* 给底部按钮区域预留空间 */
}

.video-call-bubble.fullscreen .video-call-duration {
  font-size: 15px;
}

/* B站风格全屏底部控制按钮 */
.video-call-bubble.fullscreen .video-call-controls {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  
  background-color: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(2px);                 
  border-radius: 50px;
  padding: 16px 24px;
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}

/* 全屏模式控制按钮隐藏状态 */
.video-call-bubble.fullscreen .video-call-controls.fullscreen-hidden {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
  pointer-events: none;
}

.video-call-bubble.fullscreen .fullscreen-controls {
  border-radius: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}


/* 响应式设计 */
@media (max-width: 768px) {
  .video-call-bubble {
    width: 300px;
  }

  .expanded-content {
    height: 400px;
  }

  .local-video-container {
    width: 100px;
    height: 75px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
  }

  .control-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>


