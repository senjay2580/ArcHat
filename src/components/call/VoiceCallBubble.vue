<template>
  <div 
    v-if="visible" 
    class="voice-call-bubble"
    :style="bubbleStyle"
    @mousedown="startDrag"
    ref="bubbleRef"
  >
    <!-- 通话状态显示 -->
    <div class="call-header">
      <div class="user-info">
        <el-avatar :size="40" :src="userAvatar" />
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="call-status">{{ callStatusText }}</div>
        </div>
      </div>
      
      <!-- 收缩按钮 -->
      <button class="control-btn minimize-btn" @click="minimize" v-if="!isMinimized">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 12h12"/>
        </svg>
      </button>
    </div>

    <!-- 通话时长显示 -->
    <div class="call-duration" v-if="callStatus === 'connected' && !isMinimized">
      {{ formatDuration(callDuration) }}
    </div>

    <!-- 控制按钮区域 -->
    <div class="call-controls" v-if="!isMinimized">
      <!-- 静音按钮 -->
      <button 
        class="control-btn mute-btn" 
        :class="{ active: isMuted }"
        @click="toggleMute"
      >
        <svg v-if="!isMuted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="2" y1="2" x2="22" y2="22"/>
          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-1"/>
          <path d="M15.54 8.46A3 3 0 0 0 12 5a3 3 0 0 0-3 3v6a3 3 0 0 0 .54 1.54"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
        </svg>
      </button>

      <!-- 挂断按钮 -->
      <button class="control-btn hangup-btn" @click="hangup">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
      </button>
    </div>

    <!-- 最小化状态显示 -->
    <div class="minimized-content" v-if="isMinimized">
      <div class="minimized-info" @click="restore"  v-if="!isMinimized">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span class="duration-mini">{{ formatDuration(callDuration) }}</span>
      </div>
      
      <!-- 右上角展开按钮 -->
      <button class="control-btn expand-btn" @click="restore">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l3 3 7-7"/>
          <path d="M21 21H3a18 18 0 0 1 18-18v18z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
// 导入音频文件（正确的生产环境方式）
import targetRingUrl from '@/assets/sounds/targetRing.mp3'
import ringUrl from '@/assets/sounds/ring.mp3'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: ''
  },
  userAvatar: {
    type: String,
    default: ''
  },
  callStatus: {
    type: String,
    default: 'calling', // calling, ringing, connected, ended
    validator: (value) => ['calling', 'ringing', 'connected', 'ended'].includes(value)
  },
  callDuration: {
    type: Number,
    default: 0
  },
  isMuted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['minimize', 'restore', 'mute', 'hangup', 'drag'])

// 拖拽相关 - 高性能Windows风格拖拽
const bubbleRef = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: window.innerWidth - 320, y: 100 }) // 默认右上角
const isMinimized = ref(false)

// 振铃音频相关 - 统一管理发起人和接收方振铃
const currentAudio = ref(null)
const isRingPlaying = ref(false)
const currentRingType = ref('') // 'caller' | 'receiver'

// 计算样式 - 只用于初始定位，拖拽时直接操作DOM
const bubbleStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  width: isMinimized.value ? '120px' : '280px',
  height: isMinimized.value ? '60px' : 'auto',
  position: 'fixed'
}))

// 通话状态文本
const callStatusText = computed(() => {
  switch (props.callStatus) {
    case 'calling':
      return '正在呼叫...'
    case 'ringing':
      return '对方振铃中...'
    case 'connected':
      return '通话中'
    case 'ended':
      return '通话结束'
    default:
      return '未知状态'
  }
})

// 格式化通话时长
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 高性能Windows风格拖拽 - 直接DOM操作
const startDrag = (e) => {
  if (e.target.closest('.control-btn')) return // 点击按钮时不触发拖拽
  
  isDragging.value = true
  const rect = bubbleRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  // 设置拖拽样式和优化
  if (bubbleRef.value) {
    bubbleRef.value.style.cursor = 'grabbing'
    bubbleRef.value.style.userSelect = 'none'
    bubbleRef.value.style.pointerEvents = 'none' // 防止子元素干扰
    bubbleRef.value.style.zIndex = '99999' // 确保在最顶层
  }
  
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag, { passive: false })
  e.preventDefault()
  e.stopPropagation()
}

const onDrag = (e) => {
  if (!isDragging.value || !bubbleRef.value) return
  
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  // 边界检查
  const bubbleWidth = isMinimized.value ? 120 : 280
  const bubbleHeight = isMinimized.value ? 60 : 200
  const maxX = window.innerWidth - bubbleWidth
  const maxY = window.innerHeight - bubbleHeight
  
  const boundedX = Math.max(0, Math.min(newX, maxX))
  const boundedY = Math.max(0, Math.min(newY, maxY))
  
  // 直接操作DOM，绕过Vue响应式系统
  bubbleRef.value.style.left = `${boundedX}px`
  bubbleRef.value.style.top = `${boundedY}px`
  bubbleRef.value.style.transform = 'translate3d(0, 0, 0)' // 启用硬件加速
  
  // 更新内部位置状态（但不触发重新渲染）
  position.value.x = boundedX
  position.value.y = boundedY
  
  e.preventDefault()
  e.stopPropagation()
}

const stopDrag = () => {
  isDragging.value = false
  
  // 恢复样式
  if (bubbleRef.value) {
    bubbleRef.value.style.cursor = 'grab'
    bubbleRef.value.style.userSelect = 'auto'
    bubbleRef.value.style.pointerEvents = 'auto'
    bubbleRef.value.style.zIndex = '10000'
  }
  
  // 清理事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 通知父组件最终位置
  emit('drag', position.value)
}

// 控制功能
const minimize = () => {
  isMinimized.value = true
  emit('minimize')
}

const restore = () => {
  isMinimized.value = false
  emit('restore')
}

const toggleMute = () => {
  emit('mute', !props.isMuted)
}

const hangup = () => {
  stopRingAudio() // 挂断时停止铃声
  emit('hangup')
}

// 🎵 高性能音频管理系统
// 预加载音频池，避免每次创建新实例造成的延迟
const audioPool = ref({
  caller: null,
  receiver: null
})

// 🎛️ 高级音频系统状态管理
const audioContextUnlocked = ref(false)
const webAudioContext = ref(null)
const audioBufferCache = ref(new Map()) // 音频缓冲区缓存
const audioPreheated = ref(false) // 音频预热状态


// 🔓 智能音频上下文解锁系统
const unlockAudioContext = async () => {
  if (audioContextUnlocked.value) {
    return
  }
  
  const startTime = performance.now()
  
  try {

    
    // 方法1: 使用Web Audio API解锁（最佳性能）
    if (!webAudioContext.value && (window.AudioContext || window.webkitAudioContext)) {

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      webAudioContext.value = new AudioContextClass()
      

      
      // 创建静音缓冲区并播放以解锁
      const buffer = webAudioContext.value.createBuffer(1, 1, 22050)
      const source = webAudioContext.value.createBufferSource()
      source.buffer = buffer
      source.connect(webAudioContext.value.destination)
      source.start(0)
      
      if (webAudioContext.value.state === 'suspended') {

        await webAudioContext.value.resume()

      }
      

    }
    
    // 方法2: 传统HTML5 Audio解锁（兼容性）

    try {
      const tempAudio = new Audio()
      tempAudio.volume = 0
      tempAudio.muted = true
      
      const playPromise = tempAudio.play()
      if (playPromise && typeof playPromise.then === 'function') {
        // 设置超时保护，防止无限等待
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {

            resolve()
          }, 200) // 1秒超时
        })
        
        await Promise.race([playPromise, timeoutPromise])

      } else {

      }
      
      // 安全清理资源
      try {
        tempAudio.pause()
        tempAudio.remove()

      } catch (cleanupError) {

      }
    } catch (audioError) {

      // 继续执行，不阻断状态更新
    }
    

    
    // 关键修复：确保状态更新
    audioContextUnlocked.value = true

    
    // 立即验证状态
    if (audioContextUnlocked.value === true) {

    } else {

    }
    
    const unlockTime = performance.now() - startTime

    
    // 验证状态持久化
    setTimeout(() => {

      if (audioContextUnlocked.value !== true) {

        audioContextUnlocked.value = true
      }
    }, 100)
    
  } catch (error) {

    // 即使解锁失败，也标记为已尝试，避免无限重试
    audioContextUnlocked.value = true

  }
}

// 🚀 企业级音频预加载系统
const initializeAudioPool = () => {
  const initStartTime = performance.now()

  
  let callerAudio = null
  let receiverAudio = null
  
  try {
    // 创建发起人铃声
    callerAudio = new Audio(targetRingUrl)
    callerAudio.preload = 'auto'  // 预加载音频数据
    callerAudio.volume = 0.8      // 设置音量
    callerAudio.loop = true       // 循环播放

  } catch (error) {

  }
  
  try {
    // 创建接收方铃声
    receiverAudio = new Audio(ringUrl)
    receiverAudio.preload = 'auto'
    receiverAudio.volume = 0.8
    receiverAudio.loop = true

  } catch (error) {

  }
  
  // 🎯 极致低延迟优化配置（只处理成功创建的音频）
  const audioList = [
    { audio: callerAudio, name: 'caller' },
    { audio: receiverAudio, name: 'receiver' }
  ].filter(item => item.audio !== null) // 过滤掉创建失败的音频
  
  if (audioList.length === 0) {

    return
  }
  
  audioList.forEach(({ audio, name }) => {
    const audioName = name // 定义audioName变量

    
    // 额外的安全检查
    if (!audio || typeof audio.setAttribute !== 'function') {

      return
    }
    
    // 基础播放优化
    audio.setAttribute('playsinline', 'true')
    audio.setAttribute('webkit-playsinline', 'true')
    audio.setAttribute('x-webkit-airplay', 'deny')
    
    // 高级音频优化
    if ('fastSeek' in audio) {
      audio.fastSeek = true
    }
    if ('webkitPreservesPitch' in audio) {
      audio.webkitPreservesPitch = false
    }
    if ('mozPreservesPitch' in audio) {
      audio.mozPreservesPitch = false
    }
    
    // 缓冲策略优化
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    

    
    // 智能错误处理和重试
    audio.addEventListener('error', (e) => {


      
      // 自动重试加载
      setTimeout(() => {

        audio.load()
      }, 1000)
    })
    

    
    // 强制开始加载
    audio.load()
  })
  
  // 只保存成功创建的音频实例
  audioPool.value = {
    caller: callerAudio,
    receiver: receiverAudio
  }
  
  // 检查音频池状态
  const availableAudios = Object.entries(audioPool.value).filter(([key, audio]) => audio !== null)

  
  if (availableAudios.length === 0) {

    return
  }
  
  const initTime = performance.now() - initStartTime

  
  // 预热音频上下文
  unlockAudioContext()
  
  // 🔥 立即启动音频预热系统（极致优化）
  preheatAudioSystem()
}

// 🔥 音频系统预热机制
const preheatAudioSystem = async () => {
  if (audioPreheated.value) return
  

  const preheatStart = performance.now()
  
  try {
    // 预热所有音频文件
    const audioFiles = [audioPool.value.caller, audioPool.value.receiver]
    
    for (const audio of audioFiles) {
      if (audio && audio.readyState >= 2) {
        // 静音预播放（预热解码器）
        const originalVolume = audio.volume
        audio.volume = 0
        audio.muted = true
        
        try {
          await audio.play()
          audio.pause()
          audio.currentTime = 0

        } catch (e) {

        } finally {
          audio.volume = originalVolume
          audio.muted = false
        }
      }
    }
    
    // Web Audio API缓冲区预热
    if (webAudioContext.value) {
      await preheatWebAudioBuffers()
    }
    
    audioPreheated.value = true
    const preheatTime = performance.now() - preheatStart

    
  } catch (error) {

  }
}

// 🎛️ Web Audio API缓冲区预热
const preheatWebAudioBuffers = async () => {
  if (!webAudioContext.value) return
  
  const audioFiles = [
    { key: 'caller', url: targetRingUrl },
    { key: 'receiver', url: ringUrl }
  ]
  
  for (const { key, url } of audioFiles) {
    try {
      if (!audioBufferCache.value.has(key)) {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await webAudioContext.value.decodeAudioData(arrayBuffer)
        
        audioBufferCache.value.set(key, audioBuffer)

      }
    } catch (error) {

    }
  }
}

// 🎯 智能音频播放器（Web Audio API）
const playWithWebAudio = async (ringType) => {
  if (!webAudioContext.value) {
    return false // 降级到传统播放
  }
  
  // 如果缓冲区不存在，尝试实时创建
  if (!audioBufferCache.value.has(ringType)) {

    try {
      const url = ringType === 'caller' ? targetRingUrl : ringUrl
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await webAudioContext.value.decodeAudioData(arrayBuffer)
      
      audioBufferCache.value.set(ringType, audioBuffer)

    } catch (error) {

      return false // 降级到传统播放
    }
  }
  
  // 检查是否已经有Web Audio在播放（且未被停止）
  if (currentAudio.value && currentAudio.value.webAudioSource && !currentAudio.value.webAudioSource._stopped) {

    return true // 已经在播放，不需要重新创建
  }
  
  // 如果有已停止的Web Audio源，清理它
  if (currentAudio.value && currentAudio.value.webAudioSource && currentAudio.value.webAudioSource._stopped) {

    currentAudio.value = null
  }
  
  try {
    const buffer = audioBufferCache.value.get(ringType)
    const source = webAudioContext.value.createBufferSource()
    const gainNode = webAudioContext.value.createGain()
    
    source.buffer = buffer
    source.loop = true
    gainNode.gain.value = 0.8
    
    source.connect(gainNode)
    gainNode.connect(webAudioContext.value.destination)
    
    // 监听播放结束事件
    source.onended = () => {

      source._stopped = true // 标记为已停止
      if (currentAudio.value && currentAudio.value.webAudioSource === source) {
        currentAudio.value = null
        isRingPlaying.value = false
        currentRingType.value = ''
      }
    }
    
    source.start(0)

    
    // 保存引用以便停止
    currentAudio.value = { 
      pause: () => {
        try {
          source.stop()
          source._stopped = true // 标记为已停止

        } catch (e) {

          source._stopped = true // 即使停止失败也标记为已停止
        }
      },
      currentTime: 0,
      webAudioSource: source
    }
    


    return true
    
  } catch (error) {

    return false
  }
}

// 🎯 零延迟音频播放引擎
const playRingAudio = async (ringType) => {

  
  const playStartTime = performance.now()

  const ringTypeName = ringType === 'caller' ? '发起人' : '接收方'
  

  
  // 如果当前有其他音频在播放，先停止
  if (isRingPlaying.value) {

    stopRingAudio()
  }
  
  // 确保音频上下文已解锁

  if (!audioContextUnlocked.value) {

    await unlockAudioContext()
    
    // 解锁后再次检查状态

    
    // 强制状态更新机制（如果解锁函数没有正确更新状态）
    if (!audioContextUnlocked.value) {
      audioContextUnlocked.value = true
    }
  }
  
  // 最终状态确认

  
  // 从音频池获取预加载的音频实例（增加安全检查）

  const audio = audioPool.value?.[ringType]
  if (!audio) {

    return
  }
  

  
  // 额外的音频实例有效性检查
  if (typeof audio.play !== 'function') {

    return
  }
  

  

  currentAudio.value = audio
  currentRingType.value = ringType
  
  // 快速重置播放位置（无需重新解码）

  try {
    audio.currentTime = 0

  } catch (e) {
    // 某些浏览器可能不允许立即设置currentTime

  }
  
  // 播放错误处理
  const handleError = (e) => {

    isRingPlaying.value = false
    currentRingType.value = ''
  }
  
  // 移除之前的事件监听器（避免重复绑定）

  audio.removeEventListener('error', handleError)
  audio.addEventListener('error', handleError, { once: true })
  
  // 🚀 零延迟播放执行

  if (!isRingPlaying.value) {
    try {
      // 预检查音频状态

      if (audio.readyState < 2) {

      } else {

      }
      
      // 优先尝试Web Audio API播放（最低延迟）

      // 优化：即使预热未完成也尝试Web Audio API，提升第一次播放速度
      if (webAudioContext.value && webAudioContext.value.state === 'running') {

        const webAudioSuccess = await playWithWebAudio(ringType)
        if (webAudioSuccess) {
          const playLatency = performance.now() - playStartTime

          isRingPlaying.value = true
          currentRingType.value = ringType
          

          return // 成功则直接返回
        } else {

        }
      } else {

      }
      
      // 执行传统播放

      const playPromise = audio.play()

      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          const playLatency = performance.now() - playStartTime

          isRingPlaying.value = true
          

          
          // 性能优化提示

          
        }).catch(async (error) => {

    
          
          // 智能错误恢复策略
          if (error.name === 'NotAllowedError') {

            await unlockAudioContext()
            
            // 智能重试机制
            const maxRetries = 3
            for (let i = 0; i < maxRetries; i++) {
              try {
                await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))) // 递增延迟
                await audio.play()
                isRingPlaying.value = true

                break
              } catch (retryError) {

                if (i === maxRetries - 1) {

                  isRingPlaying.value = false
                  currentRingType.value = ''
                }
              }
            }
          } else if (error.name === 'AbortError') {

          } else {

            isRingPlaying.value = false
            currentRingType.value = ''
          }
        })
      } else {
        // 老旧浏览器兼容模式
        isRingPlaying.value = true
        const playLatency = performance.now() - playStartTime

      }
      
    } catch (syncError) {


      
      // 降级到基础播放模式
      try {
        audio.currentTime = 0
        audio.play()
        isRingPlaying.value = true

      } catch (fallbackError) {

        isRingPlaying.value = false
        currentRingType.value = ''
      }
    }
  }
}

const stopRingAudio = () => {
  if (currentAudio.value && isRingPlaying.value) {
    const ringTypeName = currentRingType.value === 'caller' ? '发起人' : '接收方'
    
    try {
      // 检查是否为Web Audio源
      if (currentAudio.value.webAudioSource) {
        currentAudio.value.webAudioSource.stop()

      } else {
        // 传统音频停止
        currentAudio.value.pause()
        if (currentAudio.value.currentTime !== undefined) {
          currentAudio.value.currentTime = 0
        }

      }
    } catch (error) {

    } finally {
      isRingPlaying.value = false
      currentRingType.value = ''
      currentAudio.value = null
    }
  }
}

// 窗口大小变化时调整位置
const handleResize = () => {
  const maxX = window.innerWidth - (isMinimized.value ? 120 : 280)
  const maxY = window.innerHeight - (isMinimized.value ? 60 : 200)
  
  position.value = {
    x: Math.min(position.value.x, maxX),
    y: Math.min(position.value.y, maxY)
  }
}

// 监听通话状态变化，控制振铃音频
watch(() => props.callStatus, (newStatus, oldStatus) => {
  
  if (newStatus === 'calling') {
    // 发起人振铃状态，播放发起人铃声
    playRingAudio('caller')
  } else if (newStatus === 'ringing') {
    // 接收方振铃状态，播放接收方铃声

    playRingAudio('receiver')
  } else {
    // 其他状态（接通、挂断、结束），停止播放铃声

    stopRingAudio()
  }
}, { immediate: true })



onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 立即初始化Web Audio Context（优化第一次播放速度）
  if (!webAudioContext.value && (window.AudioContext || window.webkitAudioContext)) {
    try {
      webAudioContext.value = new (window.AudioContext || window.webkitAudioContext)()

    } catch (error) {

    }
  }
  
  // 启动企业级音频系统

  initializeAudioPool()
  
  // 🔓 智能用户交互检测系统
  const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click']
  const handleUserInteraction = async (event) => {

    
    // 强制解锁音频上下文
    await unlockAudioContext()
    
    // 多次验证解锁状态

    
    // 延迟验证确保状态持久化
    setTimeout(() => {

      
      if (audioContextUnlocked.value) {

        // 移除事件监听器（只需要解锁一次）
        unlockEvents.forEach(eventType => {
          document.removeEventListener(eventType, handleUserInteraction)
        })

      } else {

      }
    }, 200)
  }
  
  // 注册多种用户交互事件
  unlockEvents.forEach(event => {
    document.addEventListener(event, handleUserInteraction, { 
      once: false, // 改为false，允许多次触发直到解锁成功
      passive: true,
      capture: true // 捕获阶段监听，更早触发
    })
  })
  

  

})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  stopRingAudio() // 组件销毁时停止音频
  
  // 🗑️ 清理音频资源
  try {
    if (webAudioContext.value) {
      webAudioContext.value.close()

    }
    
    // 清理缓存
    audioBufferCache.value.clear()
    

  } catch (error) {

  }
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // 清理音频资源
  stopRingAudio()
  if (currentAudio.value) {
    currentAudio.value.removeEventListener('ended', () => {})
    currentAudio.value.removeEventListener('error', () => {})
    currentAudio.value = null
  }
  currentRingType.value = ''
})
</script>

<style scoped>
.voice-call-bubble {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10000;
  cursor: grab;
  user-select: none;
  padding: 16px;
  
  /* 高性能拖拽优化 */
  will-change: transform, left, top;
  transform: translate3d(0, 0, 0); /* 强制硬件加速 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  /* 移除所有transition，确保拖拽时无延迟 */
  transition: none !important;
  
  /* 优化渲染性能 */
  contain: layout style paint;
  isolation: isolate;
}

.call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.call-status {
  font-size: 12px;
  color: #666;
}

.call-duration {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.call-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.minimize-btn {
  background: #666;
  width: 24px;
  height: 24px;
}

.minimize-btn:hover {
  background: #555;
}

.mute-btn {
  background: #666;
}

.mute-btn:hover {
  background: #555;
}

.mute-btn.active {
  background: #ff4757;
}

.hangup-btn {
  background: #ff4757;
}

.hangup-btn:hover {
  background: #ff3838;
}

.minimized-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
}

.minimized-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  font-size: 12px;
  font-weight: 600;
  flex: 1;
}

.expand-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.expand-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.expand-btn svg {
  width: 12px;
  height: 12px;
}

.duration-mini {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* 暗色模式 */
.dark .voice-call-bubble {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .user-name {
  color: #fff;
}

.dark .call-status {
  color: #ccc;
}

.dark .call-duration {
  color: #fff;
}

.dark .minimized-info {
  color: #fff;
}

.dark .expand-btn {
  background: rgba(99, 102, 241, 0.9);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.dark .expand-btn:hover {
  background: rgba(99, 102, 241, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>


