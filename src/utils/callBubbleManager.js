/**
 * 全局通话气泡管理器
 * 负责在应用级别管理通话气泡的显示和隐藏
 */

import { createApp } from 'vue'
import VoiceCallBubble from '@/components/call/VoiceCallBubble.vue'
import { useCallStore } from '@/stores/call.js'

class CallBubbleManager {
  constructor() {
    this.bubbleApp = null
    this.bubbleContainer = null
    this.callStore = null
    this.isInitialized = false
  }

  /**
   * 初始化通话气泡管理器
   */
  init() {
    if (this.isInitialized) return

    // 创建气泡容器
    this.bubbleContainer = document.createElement('div')
    this.bubbleContainer.id = 'voice-call-bubble-container'
    this.bubbleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10000;
    `
    document.body.appendChild(this.bubbleContainer)

    // 获取通话store
    this.callStore = useCallStore()

    // 创建Vue应用实例
    this.bubbleApp = createApp(VoiceCallBubble, {
      visible: this.callStore.isCallActive,
      userName: this.callStore.remoteUser.name,
      userAvatar: this.callStore.remoteUser.avatar,
      callStatus: this.callStore.callStatus,
      callDuration: this.callStore.callDuration,
      isMuted: this.callStore.isMuted,
      onMinimize: () => {
        this.callStore.minimizeCall()
      },
      onRestore: () => {
        this.callStore.restoreCall()
      },
      onMute: (muted) => {
        this.callStore.toggleMute()
      },
      onHangup: () => {
        this.callStore.hangupCall()
      },
      onDrag: (position) => {
        // 可以保存位置到localStorage
        localStorage.setItem('callBubblePosition', JSON.stringify(position))
      }
    })

    // 挂载到容器
    this.bubbleApp.mount(this.bubbleContainer)
    this.isInitialized = true

    // 监听通话状态变化
    this.watchCallState()
  }

  /**
   * 监听通话状态变化
   */
  watchCallState() {
    if (!this.callStore) return

    // 这里应该使用Vue的响应式系统来监听状态变化
    // 由于我们在非Vue组件中，需要手动处理
    const updateBubble = () => {
      if (this.bubbleApp && this.bubbleApp._instance) {
        const props = this.bubbleApp._instance.props
        props.visible = this.callStore.isCallActive
        props.userName = this.callStore.remoteUser.name
        props.userAvatar = this.callStore.remoteUser.avatar
        props.callStatus = this.callStore.callStatus
        props.callDuration = this.callStore.callDuration
        props.isMuted = this.callStore.isMuted
      }
    }

    // 定期更新（简单实现，实际应该使用响应式监听）
    this.updateInterval = setInterval(updateBubble, 1000)
  }

  /**
   * 显示通话气泡
   * @param {Object} callInfo - 通话信息
   */
  showBubble(callInfo) {
    if (!this.isInitialized) {
      this.init()
    }

    if (this.bubbleContainer) {
      this.bubbleContainer.style.pointerEvents = 'auto'
    }
  }

  /**
   * 隐藏通话气泡
   */
  hideBubble() {
    if (this.bubbleContainer) {
      this.bubbleContainer.style.pointerEvents = 'none'
    }
  }

  /**
   * 销毁通话气泡
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    if (this.bubbleApp) {
      this.bubbleApp.unmount()
      this.bubbleApp = null
    }

    if (this.bubbleContainer && this.bubbleContainer.parentNode) {
      this.bubbleContainer.parentNode.removeChild(this.bubbleContainer)
      this.bubbleContainer = null
    }

    this.isInitialized = false
  }
}

// 创建全局实例
export const callBubbleManager = new CallBubbleManager()
export default CallBubbleManager
