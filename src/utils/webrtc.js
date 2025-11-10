/**
 * WebRTC 语音通话管理器
 * 基于现有的WebSocket连接实现信令交换
 */
import { useUserInfoStore } from "@/stores/user"
import emitter from "@/utils/eventBus"
class WebRTCManager {
  constructor() {
    // === 媒体流相关 ===
    this.localStream = null      // 本地音频流（你的麦克风）
    this.remoteStream = null     // 远程音频流（对方的声音）
    this.peerConnection = null   // WebRTC连接对象
    
    // === 通话状态相关 ===
    this.isInitiator = false     // 是否是发起方
    this.callId = null           // 通话ID（唯一标识）
    this.remoteUserId = null     // 对方用户ID
    this.callStatus = 'idle'     // 通话状态
    this.isMuted = false         // 是否静音
    
    // === 回调函数 ===
    this.onCallStatusChange = null  // 状态变化时通知其他组件
    this.onRemoteStream = null      // 收到对方声音时通知其他组件
    this.onError = null             // 出错时通知其他组件
    this.onIncomingCall = null      // 收到来电邀请时触发
    
    // === WebRTC配置 ===
    this.pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    }
    
    // === HTTP环境兼容性配置 ===
    this.isHttpsContext = location.protocol === 'https:'
    this.mediaConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // HTTP环境下降低音频质量要求
        sampleRate: this.isHttpsContext ? 48000 : 16000,
        channelCount: this.isHttpsContext ? 2 : 1
      },
      video: false // 语音通话不需要视频
    }
  }

  /**
   * 初始化WebRTC管理器
   * @param {Object} websocket - WebSocket连接实例
   * @param {Object} userStore - 用户信息store
   */
  init(websocket, userStore) {
    this.websocket = websocket
    this.userStore = userStore
    
    // 验证userStore是否有效
    if (!userStore || !userStore.userInfo) {
      console.warn('WebRTC初始化失败: userStore或userInfo无效')
      return false
    }
    
    // 检查WebRTC支持
    if (!this.checkWebRTCSupport()) {
      console.error('当前浏览器不支持WebRTC')
      return false
    }
    
    // 检查媒体设备访问权限
    this.checkMediaPermissions()
    
    this.setupWebSocketListeners()
    return true
  }
  
  /**
   * 检查WebRTC支持
   */
  checkWebRTCSupport() {
    return !!(window.RTCPeerConnection && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
  
  /**
   * 检查媒体设备访问权限
   */
  async checkMediaPermissions() {
    try {
      if (!this.isHttpsContext) {
        console.warn('⚠️ HTTP环境下WebRTC功能受限，建议使用HTTPS')
        console.warn('💡 解决方案：使用 cpolar http 80 --scheme=https 创建HTTPS隧道')
      }
      
      // 检查媒体设备权限
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter(device => device.kind === 'audioinput')
      
      if (audioDevices.length === 0) {
        console.warn('未检测到音频输入设备')
      } else {
        console.log(`检测到 ${audioDevices.length} 个音频输入设备`)
      }
      
    } catch (error) {
      console.error('媒体设备检查失败:', error)
      if (error.name === 'NotAllowedError') {
        console.error('❌ 媒体设备访问被拒绝，请检查浏览器权限设置')
      }
    }
  }

  /**
   * 恢复通话连接（页面刷新后调用）
   * @param {Object} persistedState - 持久化的通话状态
   */
  async restoreCall(persistedState) {

    
    try {
      // 设置基本信息
      this.remoteUserId = persistedState.remoteUser?.id
      // 优先从localStorage的callId获取，其次从pendingCallId
      this.callId = persistedState.callId || persistedState.pendingCallId
      this.isMuted = persistedState.isMuted || false
      

      
      // 获取本地音频流
      await this.getLocalStream()

      
      // 创建新的PeerConnection
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 发送恢复连接信令
      const restoreSignal = {
        type: 'call-restore',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        currentUserId: this.userStore?.userInfo?.uid, // 直接在顶层添加
        restoreInfo: {
          userId: this.userStore?.userInfo?.uid,
          timestamp: Date.now(),
          isMuted: this.isMuted
        }
      }
      

      this.sendSignal(restoreSignal)
      
      // 更新状态
      this.updateCallStatus('connecting')

      
      return true
    } catch (error) {
      this.handleError('恢复通话连接失败: ' + error.message)
      return false
    }
  }

  /**
   * 设置WebSocket监听器处理信令消息
   * 使用事件总线监听WebRTC信令消息（type: 6）
   */
  setupWebSocketListeners() {
    // 通过事件总线监听WebRTC信令消息
    emitter.on('webrtc-signal', this.handleSignalMessage.bind(this))

  }

  /**
   * 发起语音通话
   * @param {string} targetUserId - 目标用户ID
   * @param {Object} targetUserInfo - 目标用户信息
   */
  async startCall(targetUserId, targetUserInfo) {

    
    try {
      this.isInitiator = true
      this.remoteUserId = targetUserId
      this.callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` + targetUserId

      
      // 获取本地音频流
      await this.getLocalStream()
      
      // 创建PeerConnection 创建WebRTC连接
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 更新通话状态
      this.updateCallStatus('calling')
      
      // 发送通话邀请信令
      this.sendSignal({
        type: 'call-invite',
        callId: this.callId,
        targetUserId: targetUserId,
        callerInfo: {
          id: this.userStore?.userInfo?.uid || 'unknown',
          name: this.userStore?.userInfo?.username || 'Unknown User',
          avatar: this.userStore?.userInfo?.avatar || ''
        }
      })
      return true
    } catch (error) {
      this.handleError('发起通话失败: ' + error.message)
      return false
    }
  }

  /**
   * 接受通话
   * @param {string} callId - 通话ID
   */
  async acceptCall(callId) {
    try {
      this.callId = callId
      this.isInitiator = false
      
      // 获取本地音频流
      await this.getLocalStream()
      
      // 创建PeerConnection
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      
      // 更新通话状态
      this.updateCallStatus('connected')
      
      // 发送接受通话信令
      this.sendSignal({
        type: 'call-accept',
        callId: this.callId,
        targetUserId: this.remoteUserId
      })
      
      return true
    } catch (error) {
      this.handleError('接受通话失败: ' + error.message)
      return false
    }
  }

  /**
   * 拒绝通话
   * @param {string} callId - 通话ID
   */
  rejectCall(callId) {
    this.sendSignal({
      type: 'call-reject',
      callId: callId,
      targetUserId: this.remoteUserId
    })
    this.endCall()
  }

  /**
   * 挂断通话
   */
  hangupCall() {
    if (this.callId) {
      this.sendSignal({
        type: 'call-hangup',
        callId: this.callId,
        targetUserId: this.remoteUserId
      })
    }
    this.endCall()
  }

  /**
   * 切换静音状态
   */
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.isMuted = !audioTrack.enabled
        return this.isMuted
      }
    }
    return false
  }

  /**
   * 获取本地音频流（兼容HTTP环境）
   */
  async getLocalStream() {
    try {
      console.log(`🎤 获取音频流 - 环境: ${this.isHttpsContext ? 'HTTPS' : 'HTTP'}`)
      
      // 使用兼容性配置
      this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints)
      
      console.log('✅ 音频流获取成功:', {
        tracks: this.localStream.getAudioTracks().length,
        settings: this.localStream.getAudioTracks()[0]?.getSettings()
      })
      
      return this.localStream
    } catch (error) {
      console.error('❌ 音频流获取失败:', error)
      
      // 根据错误类型提供具体的解决建议
      if (error.name === 'NotAllowedError') {
        if (!this.isHttpsContext) {
          throw new Error('HTTP环境下无法访问麦克风。解决方案：\n1. 使用 cpolar http 80 --scheme=https 创建HTTPS隧道\n2. 或在浏览器中允许不安全内容的麦克风访问')
        } else {
          throw new Error('麦克风访问被拒绝，请在浏览器设置中允许麦克风权限')
        }
      } else if (error.name === 'NotFoundError') {
        throw new Error('未找到音频输入设备，请检查麦克风是否正确连接')
      } else if (error.name === 'NotReadableError') {
        throw new Error('麦克风被其他应用占用，请关闭其他使用麦克风的程序')
      } else {
        throw new Error(`音频设备访问失败: ${error.message}`)
      }
    }
  }

  /**
   * 创建PeerConnection 创建WebRTC连接
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.pcConfig)
    
    // 监听ICE候选 触发时机：
    //  调用createOffer()或createAnswer()后
    //  WebRTC开始自动扫描本地网络环境
    //  每发现一个可用的网络路径，就触发一次这个事件
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          callId: this.callId,
          targetUserId: this.remoteUserId,
          candidate: event.candidate
        })
      }
    }
    
    // 监听远程流
    this.peerConnection.ontrack = (event) => {

      this.remoteStream = event.streams[0]
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream)
      }
      this.playRemoteStream()
    }
    
    // 监听连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection.connectionState === 'connected') {
        this.updateCallStatus('connected')
      } else if (this.peerConnection.connectionState === 'disconnected' || 
                 this.peerConnection.connectionState === 'failed') {
        this.endCall()
      }
    }
  }

  /**
   * 播放远程音频流
   */
  playRemoteStream() {
    if (this.remoteStream) {
      // 清理之前的音频元素，防止多个播放器同时工作
      const existingAudio = document.querySelector('#webrtc-remote-audio')
      if (existingAudio) {
        existingAudio.remove()
      }
      
      const audioElement = document.createElement('audio')
      audioElement.id = 'webrtc-remote-audio'
      audioElement.srcObject = this.remoteStream
      audioElement.autoplay = true
      audioElement.style.display = 'none'
      
      // 优化音频播放设置
      audioElement.volume = 0.8              // 限制音量防止回声
      audioElement.muted = false             // 确保不静音
      audioElement.controls = false          // 隐藏控制按钮
      audioElement.preload = 'auto'          // 预加载
      
      // 防止回声的关键设置
      audioElement.setAttribute('playsinline', 'true')  // 移动设备内联播放
      
      // 监听音频事件
      audioElement.onloadedmetadata = () => {

      }
      
      audioElement.onplay = () => {

      }
      
      audioElement.onerror = (error) => {
        this.handleError('远程音频播放错误: ' + error.message)
      }
      
      document.body.appendChild(audioElement)
      
      // 存储引用以便后续清理
      this.remoteAudioElement = audioElement
    }
  }

  /**
   * 处理后端发送过来的信令消息
   */
  async handleSignalMessage(data) {
    try {
      
      switch (data.type) {
        case 'call-invite':
          await this.handleCallInvite(data)
          break
        case 'call-accept':
          await this.handleCallAccept(data)
          break
        case 'call-reject':
          this.handleCallReject(data)
          break
        case 'call-hangup':
          this.handleCallHangup(data)
          break
        case 'call-restore':
          await this.handleCallRestore(data)
          break
        case 'call-restore-response':
          this.handleCallRestoreResponse(data)
          break
        case 'offer':
          await this.handleOffer(data)
          break
        case 'answer':
          await this.handleAnswer(data)
          break
        case 'ice-candidate':
          await this.handleIceCandidate(data)
          break
      }
    } catch (error) {
      this.handleError('信令处理失败: ' + error.message)
    }
  }

  /**
   * 处理通话邀请
   */
  async handleCallInvite(data) {
    this.callId = data.callId
    this.remoteUserId = data.callerInfo.id
    this.updateCallStatus('ringing')
    
    // 通过回调函数将来电信息传递给上层（call store）
    if (this.onIncomingCall) {
      this.onIncomingCall(data.callerInfo, data.callId)
    } else {
      this.rejectCall(data.callId, 'error')
    }
  }

  /**
   * 处理通话接受
   */
  async handleCallAccept(data) {
    this.updateCallStatus('connected')
    
    // 创建并发送offer
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    
    this.sendSignal({
      type: 'offer',
      callId: this.callId,
      targetUserId: this.remoteUserId,
      offer: offer
    })
  }

  /**
   * 处理通话拒绝
   */
  handleCallReject(data) {
    // 检查是否是当前通话的拒绝
    if (data.callId === this.callId) {
      this.updateCallStatus('rejected')
      this.endCall()
    } else {
    }
  }

  /**
   * 处理通话挂断
   */
  handleCallHangup(data) {

    this.updateCallStatus('ended')
    this.endCall()
  }

  /**
   * 处理通话恢复请求（对方发起的恢复）- 使用ICE重启策略
   */
  async handleCallRestore(data) {

    
    // 检查当前状态是否适合恢复
    try {
      // 设置基本信息
      this.remoteUserId = data.restoreInfo?.userId || data.currentUserId || this.remoteUserId
      this.callId = data.callId
      this.isInitiator = false
      
      // 🏆 专业方案：使用ICE重启而不是重新创建连接
      const hasExistingConnection = this.peerConnection && 
        (this.peerConnection.connectionState === 'connected' || 
         this.peerConnection.connectionState === 'connecting')
      
      if (hasExistingConnection && this.localStream) {

        await this.performIceRestart()
      } else {

        await this.establishFreshConnection()
      }
      
      // 发送恢复响应
      const restoreResponse = {
        type: 'call-restore-response',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        success: true,
        restoreInfo: {
          userId: this.userStore?.userInfo?.uid,
          timestamp: Date.now()
        }
      }
      
      this.sendSignal(restoreResponse)
      
      // 更新状态
      this.updateCallStatus('connecting')

      
    } catch (error) {
      
      // 发送失败响应
      this.sendSignal({
        type: 'call-restore-response',
        callId: data.callId,
        targetUserId: data.restoreInfo?.userId,
        success: false,
        error: error.message
      })
    }
  }

  /**
   * 处理通话恢复响应
   */
  async handleCallRestoreResponse(data) {

    // 检查success字段，如果不存在或为undefined，默认为true（因为能收到响应就说明对方同意）
    // 修复逻辑：只有明确的false才认为失败，其他情况都认为成功
    const isSuccess = data.success !== false
    
    if (isSuccess) {

      this.updateCallStatus('connecting')
      
      // 🏆 专业方案：使用ICE重启策略恢复连接
      if (this.isInitiator) {

        
        // 检查是否有现有连接可以重启
        if (this.peerConnection && this.localStream) {

          await this.performIceRestart()
        } else {

          await this.establishFreshConnection()
          this.startWebRTCHandshake()
        }
      } else {

        // 接收方等待对方的ICE重启offer
      }
    } else {
      this.handleError('通话恢复被拒绝: ' + (data.error || '未知原因'))
    }
  }

  /**
   * 🚀 ICE重启策略 - 专业WebRTC应用的标准做法
   */
  async performIceRestart() {
    try {

      
      // 1. 设置ICE重启标志
      const offerOptions = {
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      }
      
      // 2. 创建新的offer（带ICE重启）
      const offer = await this.peerConnection.createOffer(offerOptions)
      await this.peerConnection.setLocalDescription(offer)
      
      // 3. 发送ICE重启offer
      this.sendSignal({
        type: 'offer',
        callId: this.callId,
        targetUserId: this.remoteUserId,
        offer: offer,
        iceRestart: true  // 标记这是ICE重启
      })
      
    } catch (error) {
      // 如果ICE重启失败，回退到完整重建
      await this.establishFreshConnection()
    }
  }
  
  /**
   * 🔄 建立全新连接 - 当ICE重启不可用时的回退方案
   */
  async establishFreshConnection() {
    try {

      
      // 1. 获取本地音频流
      await this.getLocalStream()
      
      // 2. 创建新的PeerConnection
      this.createPeerConnection()
      
      // 3. 添加本地流到PeerConnection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
      

      
    } catch (error) {
      throw error
    }
  }

  /**
   * 开始WebRTC握手流程
   */
  async startWebRTCHandshake() {
    try {
      if (this.isInitiator) {
        // 发起方创建offer
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        
        this.sendSignal({
          type: 'offer',
          callId: this.callId,
          targetUserId: this.remoteUserId,
          offer: offer
        })
        
      }
      // 接收方等待offer，然后在handleOffer中创建answer
    } catch (error) {
      this.handleError('WebRTC握手失败: ' + error.message)
    }
  }

  /**
   * 处理offer
   */
  async handleOffer(data) {
    if (!this.peerConnection) {
      return
    }
    
    await this.peerConnection.setRemoteDescription(data.offer)
    
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    
    this.sendSignal({
      type: 'answer',
      callId: this.callId,
      targetUserId: this.remoteUserId,
      answer: answer
    })
    
  }

  /**
   * 处理answer
   */
  async handleAnswer(data) {
    if (!this.peerConnection) {
      return
    }
    
    await this.peerConnection.setRemoteDescription(data.answer)

    
    // WebRTC握手完成，更新状态为已连接
    this.updateCallStatus('connected')
  }

  /**
   * 处理ICE候选
   */
  async handleIceCandidate(data) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(data.candidate)
    }
  }

  /**
   * 处理通话拒绝
   */
  handleCallReject(data) {
    this.updateCallStatus('ended')
    this.endCall()
  }

  /**
   * 处理通话挂断
   */
  handleCallHangup(data) {
    this.endCall()
  }

  /**
   * 发送信令消息
   */
  sendSignal(data) {
    if (!this.websocket) {
      return false
    }
    
    const message = {
      type: 6, // WebRTC信令消息类型
      data: data
    }
    
    // 使用ChatWebSocket的send方法，它会自动处理连接状态检查
    this.websocket.send(message)
    return true
  }

  /**
   * 更新通话状态
   */
  updateCallStatus(status) {
    this.callStatus = status
    if (this.onCallStatusChange) {
      this.onCallStatusChange(status)
    }
  }

  /**
   * 结束通话
   */
  endCall() {
    // 停止本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    // 关闭PeerConnection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    // 清理远程流
    this.remoteStream = null
    
    // 清理远程音频元素，防止回声
    if (this.remoteAudioElement) {
      this.remoteAudioElement.pause()
      this.remoteAudioElement.srcObject = null
      this.remoteAudioElement.remove()
      this.remoteAudioElement = null
    }
    
    // 清理所有WebRTC相关的音频元素
    const allWebRTCAudio = document.querySelectorAll('#webrtc-remote-audio')
    allWebRTCAudio.forEach(audio => {
      audio.pause()
      audio.srcObject = null
      audio.remove()
    })
    
    // 重置状态
    this.callId = null
    this.remoteUserId = null
    this.isInitiator = false
    this.isMuted = false
    this.updateCallStatus('ended')
    

  }

  /**
   * 处理错误
   */
  handleError(message) {
    console.error('WebRTC错误:', message)
    if (this.onError) {
      this.onError(message)
    }
    this.endCall()
  }

  /**
   * 清理资源
   */
  destroy() {
    this.endCall()
    // 移除事件总线监听器
    emitter.off('webrtc-signal', this.handleSignalMessage)

  }
}

// 创建全局实例
export const webrtcManager = new WebRTCManager()
export default WebRTCManager
