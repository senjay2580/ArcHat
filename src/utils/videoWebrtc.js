/**
 * 独立的视频通话WebRTC管理器
 * 与语音通话WebRTC管理器完全解耦，使用独立的信令类型
 */
import { useUserInfoStore } from "@/stores/user"
import emitter from "@/utils/eventBus"

export class VideoWebRTCManager {
  constructor() {
    // === 媒体流相关 ===
    this.localVideoStream = null    // 本地音视频流（你的摄像头+麦克风）
    this.remoteVideoStream = null   // 远程音视频流（对方的视频+声音）
    this.peerConnection = null      // WebRTC连接对象
    
    // === 视频通话状态相关 ===
    this.isInitiator = false        // 是否是发起方
    this.videoCallId = null         // 视频通话ID（唯一标识）
    this.remoteUserId = null        // 对方用户ID
    this.videoCallStatus = 'idle'   // 视频通话状态
    this.isVideoMuted = false       // 是否静音
    this.isVideoEnabled = true      // 视频是否开启
    this.isCameraOn = true          // 摄像头是否开启
    this.currentCamera = 'user'     // 当前摄像头（'user'前置/'environment'后置）
    
    // === 回调函数 ===
    this.onCallStatusChange = null      // 状态变化时通知其他组件
    this.onLocalVideoStream = null      // 本地视频流准备好时通知
    this.onRemoteVideoStream = null     // 收到对方视频时通知其他组件
    this.onError = null                 // 出错时通知其他组件
    this.onIncomingCall = null          // 收到来电邀请时触发
    
    // === WebRTC配置 ===
    this.pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    }
    
    // 调试标志
    this.DEBUG_VIDEO_WEBRTC = false
  }

  /**
   * 初始化视频WebRTC管理器
   * @param {Object} websocket - WebSocket连接实例
   * @param {Object} userStore - 用户信息store
   */
  init(websocket, userStore) {

    
    this.websocket = websocket
    this.userStore = userStore
    
    // 验证userStore是否有效
    if (!userStore || !userStore.userInfo) {
      // console.error('❌ 视频WebRTC初始化失败: userStore或userInfo无效')
      throw new Error('视频WebRTC初始化失败: 用户信息无效')
    }
    
    // 验证websocket是否有效
    if (!websocket || typeof websocket.send !== 'function') {
      // console.error('❌ 视频WebRTC初始化失败: websocket无效')
      throw new Error('视频WebRTC初始化失败: WebSocket连接无效')
    }
    
    // 监听视频通话信令
    emitter.on('video-webrtc-signal', (data) => {

      this.handleVideoSignalMessage(data)
    })
    
    // console.log('✅ 视频WebRTC管理器初始化成功')
  }

  /**
   * 发起视频通话
   * @param {string} targetUserId - 目标用户ID
   * @param {Object} targetUserInfo - 目标用户信息
   * @param {Object} options - 通话选项
   * @param {boolean} options.cameraEnabled - 是否启用摄像头
   * @param {string} options.selectedDeviceId - 选定的摄像头设备ID
   */
  async startVideoCall(targetUserId, targetUserInfo, options = {}) {

    
    try {
      this.isInitiator = true
      this.remoteUserId = targetUserId
      this.videoCallId = `video_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${targetUserId}`
      

      
      // 获取本地音视频流，传入摄像头设备选项
      await this.getLocalVideoStream(options.cameraEnabled, options.selectedDeviceId)
      
      // 创建WebRTC连接
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localVideoStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localVideoStream)
      })
      
      // 更新通话状态
      this.updateVideoCallStatus('calling')
      
      // 发送视频通话邀请信令（使用独立的信令类型）
      this.sendVideoSignal({
        type: 'video-call-invite',
        callId: this.videoCallId,
        targetUserId: targetUserId,
        callerInfo: {
          id: this.userStore?.userInfo?.uid || 'unknown',
          name: this.userStore?.userInfo?.username || 'Unknown User',
          avatar: this.userStore?.userInfo?.avatar || ''
        }
      })
      
      return true
    } catch (error) {
      // console.error('❌ 发起视频通话失败:', error)
      this.handleVideoError('发起视频通话失败: ' + error.message)
      return false
    }
  }

  /**
   * 接受视频通话
   * @param {string} callId - 通话ID
   */
  async acceptVideoCall(callId) {

    
    try {
      this.videoCallId = callId
      this.isInitiator = false
      
      // 获取本地音视频流
      await this.getLocalVideoStream()
      
      // 创建WebRTC连接
      this.createPeerConnection()
      
      // 添加本地流到PeerConnection
      this.localVideoStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localVideoStream)
      })
      
      // 发送接受信令
      this.sendVideoSignal({
        type: 'video-call-accept',
        callId: callId,
        targetUserId: this.remoteUserId
      })
      
      return true
    } catch (error) {
      // console.error('❌ 接受视频通话失败:', error)
      this.handleVideoError('接受视频通话失败: ' + error.message)
      return false
    }
  }

  /**
   * 拒绝视频通话
   * @param {string} callId - 通话ID
   * @param {string} reason - 拒绝原因
   */
  rejectVideoCall(callId, reason = 'rejected') {

    
    this.sendVideoSignal({
      type: 'video-call-reject',
      callId: callId,
      targetUserId: this.remoteUserId,
      reason: reason
    })
    
    this.cleanup()
  }

  /**
   * 挂断视频通话
   */
  endVideoCall() {

    
    if (this.videoCallId && this.remoteUserId) {
      this.sendVideoSignal({
        type: 'video-call-hangup',
        callId: this.videoCallId,
        targetUserId: this.remoteUserId
      })
    }
    
    this.cleanup()
  }

  /**
   * 切换静音状态
   */
  toggleMute() {
    if (this.localVideoStream) {
      const audioTrack = this.localVideoStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        this.isVideoMuted = !audioTrack.enabled
        

        
        return this.isVideoMuted
      }
    }
    return this.isVideoMuted
  }

  /**
   * 切换视频开关
   */
  toggleVideo() {
    if (this.localVideoStream) {
      const videoTrack = this.localVideoStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        this.isVideoEnabled = videoTrack.enabled
        this.isCameraOn = videoTrack.enabled
        

        
        return this.isVideoEnabled
      }
    }
    return this.isVideoEnabled
  }

  /**
   * 切换摄像头（前置/后置）
   */
  async switchCamera() {
    if (!this.localVideoStream) {
      // console.warn('❌ 无本地视频流，无法切换摄像头')
      return false
    }

    try {
      // 切换摄像头方向
      this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user'
      

      
      // 停止当前视频轨道
      const videoTrack = this.localVideoStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.stop()
      }
      
      // 获取新的视频流
      const videoConstraints = {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: this.currentCamera,
        aspectRatio: 16/9
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
      })
      
      // 更新本地视频流
      const newVideoTrack = newStream.getVideoTracks()[0]
      const audioTrack = this.localVideoStream.getAudioTracks()[0] // 保留音频轨道
      
      // 创建新的流，包含新视频和原音频
      this.localVideoStream = new MediaStream([newVideoTrack, audioTrack])
      
      // 更新PeerConnection中的视频轨道
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        if (sender) {
          await sender.replaceTrack(newVideoTrack)
        }
      }
      
      // 通知组件视频流已更新
      if (this.onLocalVideoStream) {
        this.onLocalVideoStream(this.localVideoStream)
      }
      
      // console.log('✅ 摄像头切换成功:', this.currentCamera === 'user' ? '前置' : '后置')
      return true
    } catch (error) {
      // console.error('❌ 切换摄像头失败:', error)
      return false
    }
  }

  /**
   * 获取最优的视频约束配置（优先OBS虚拟摄像头）
   */
  async getOptimalVideoConstraints() {
    try {
      // console.log('🔍 开始检测视频设备...')
      
      // 先获取一次基本的媒体权限，这样才能看到设备的真实标签
      // console.log('🔑 先获取媒体权限以查看设备标签...')
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        tempStream.getTracks().forEach(track => track.stop()) // 立即停止，只是为了获取权限
        // console.log('✅ 媒体权限获取成功')
      } catch (permError) {
        // console.warn('⚠️ 获取媒体权限失败，可能无法看到设备标签:', permError.message)
      }
      
      // 枚举所有视频输入设备
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      // console.log('🎥 检测到的视频设备数量:', videoDevices.length)
      // console.log('🎥 详细设备信息:', videoDevices.map(d => ({
      //   deviceId: d.deviceId,
      //   label: d.label || '未知设备',
      //   groupId: d.groupId
      // })))
      
      // 检查是否有设备标签权限
      const hasLabels = videoDevices.some(d => d.label && d.label.trim() !== '')
      if (!hasLabels) {
        // console.warn('⚠️ 设备标签为空，可能需要先获取媒体权限')
      }
      
      // 查找OBS虚拟摄像头（多种可能的名称）
      const obsKeywords = [
        'OBS Virtual Camera',
        'OBS Camera', 
        'OBS-Camera',
        'OBS Cam',
        'Virtual Camera',
        'obs',
        'virtual',
        'streamlabs'
      ]
      
      // console.log('🔍 开始查找OBS虚拟摄像头...')
      // console.log('🔍 搜索关键词:', obsKeywords)
      
      let obsDevice = null
      for (const device of videoDevices) {
        const label = (device.label || '').toLowerCase()
        // console.log(`🔍 检查设备: "${device.label}" -> 小写: "${label}"`)
        
        for (const keyword of obsKeywords) {
          if (label.includes(keyword.toLowerCase())) {
            obsDevice = device
            // console.log(`🎯 找到OBS虚拟摄像头! 设备: "${device.label}", 匹配关键词: "${keyword}"`)
            break
          }
        }
        
        if (obsDevice) break
      }
      
      if (!obsDevice) {
        // console.log('❌ 未找到OBS虚拟摄像头')
        // console.log('📝 所有可用设备:')
        videoDevices.forEach((device, index) => {
          // console.log(`  ${index + 1}. "${device.label || '未知设备'}"`)
        })
      }
      
      // 基础视频约束
      const baseConstraints = {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        aspectRatio: 16/10
      }
      
      // 如果找到OBS虚拟摄像头，优先使用
      if (obsDevice && obsDevice.deviceId) {
        // console.log('✅ 使用OBS虚拟摄像头:', obsDevice.label)
        return {
          ...baseConstraints,
          deviceId: { exact: obsDevice.deviceId }
        }
      }
      
      // 如果没有找到OBS虚拟摄像头，使用默认配置
      // console.log('⚠️ 未找到OBS虚拟摄像头，使用默认摄像头配置')
      return {
        ...baseConstraints,
        facingMode: this.currentCamera   // 使用当前摄像头设置
      }
      
    } catch (error) {
      // console.error('❌ 检测视频设备失败:', error)
      // 如果设备枚举失败，回退到基础配置
      return {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: this.currentCamera,
        aspectRatio: 16/9
      }
    }
  }

  /**
   * 获取本地音视频流（视频通话用）
   * @param {boolean} cameraEnabled - 是否启用摄像头
   * @param {string} selectedDeviceId - 选定的摄像头设备ID
   */
  async getLocalVideoStream(cameraEnabled = true, selectedDeviceId = null) {
    try {
      // 高级音频配置
      const audioConstraints = {
        echoCancellation: true,           // 回声消除
        noiseSuppression: true,           // 噪音抑制
        autoGainControl: true,            // 自动增益控制
        sampleRate: 48000,                // 高采样率
        sampleSize: 16,                   // 16位采样
        channelCount: 1,                  // 单声道，减少带宽
        latency: 0.01,                    // 低延迟
        volume: 0.8,                      // 限制音量防止过载
        // 高级噪音抑制设置
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,         // 高通滤波器
        googTypingNoiseDetection: true,   // 键盘噪音检测
        googAudioMirroring: false         // 禁用音频镜像
      }
      
      // 根据参数获取视频约束
      let videoConstraints
      if (!cameraEnabled) {
        // 如果不启用摄像头，设置为false
        videoConstraints = false
        // console.log('📹 摄像头已禁用')
      } else if (selectedDeviceId) {
        // 如果指定了设备ID，使用指定设备
        videoConstraints = {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        }
        // console.log('📹 使用指定摄像头设备:', selectedDeviceId)
      } else {
        // 否则检测并优先使用OBS虚拟摄像头
        videoConstraints = await this.getOptimalVideoConstraints()
        // console.log('📹 使用自动检测的最优摄像头设备')
      }
      
      this.localVideoStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: videoConstraints
      })
      

      
      // 通知组件本地视频流已准备好
      if (this.onLocalVideoStream) {
        this.onLocalVideoStream(this.localVideoStream)
      }
      
      return this.localVideoStream
    } catch (error) {
      // console.error('❌ 获取本地视频流失败:', error)
      
      // 根据错误类型提供更具体的错误信息
      if (error.name === 'NotReadableError' && error.message.includes('Device in use')) {
        throw new Error('摄像头正在被其他应用程序占用，请关闭其他视频应用后重试')
      } else if (error.name === 'NotAllowedError') {
        throw new Error('摄像头和麦克风权限被拒绝，请在浏览器设置中允许访问')
      } else if (error.name === 'NotFoundError') {
        throw new Error('未找到摄像头或麦克风设备，请检查硬件连接')
      } else {
        throw new Error('无法访问摄像头和麦克风，请检查权限设置')
      }
    }
  }

  /**
   * 创建PeerConnection 创建WebRTC连接
   */
  createPeerConnection() {

    
    this.peerConnection = new RTCPeerConnection(this.pcConfig)
    
    // 监听远程流
    this.peerConnection.ontrack = (event) => {

      
      this.remoteVideoStream = event.streams[0]
      if (this.onRemoteVideoStream) {
        this.onRemoteVideoStream(this.remoteVideoStream)
      }
      this.playRemoteVideoStream()
    }
    
    // 监听连接状态变化
    this.peerConnection.onconnectionstatechange = () => {

      
      switch (this.peerConnection.connectionState) {
        case 'connected':
          this.updateVideoCallStatus('connected')
          break
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.updateVideoCallStatus('ended')
          this.cleanup()
          break
      }
    }
    
    // 监听ICE候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendVideoSignal({
          type: 'ice-candidate',
          callId: this.videoCallId,
          targetUserId: this.remoteUserId,
          candidate: event.candidate
        })
      }
    }
  }

  /**
   * 播放远程视频流
   */
  playRemoteVideoStream() {
    if (this.remoteVideoStream) {
      // if (this.DEBUG_VIDEO_WEBRTC) {
      //   console.log('🎥 开始播放远程视频流')
      // }
      
      // 清理之前的视频元素，防止多个播放器同时工作
      const existingVideo = document.querySelector('#webrtc-remote-video')
      if (existingVideo) {
        existingVideo.remove()
      }
      
      // 注意：这里不直接创建 video 元素，而是通过回调通知组件
      // 组件会负责创建和管理 video 元素
      // console.log('🎥 远程视频流已准备好，等待组件处理')
    }
  }

  /**
   * 处理后端发送过来的视频信令消息
   */
  async handleVideoSignalMessage(data) {

    
    try {
      switch (data.type) {
        case 'video-call-invite':
          await this.handleVideoCallInvite(data)
          break
        case 'video-call-accept':
          await this.handleVideoCallAccept(data)
          break
        case 'video-call-reject':
          this.handleVideoCallReject(data)
          break
        case 'video-call-hangup':
          this.handleVideoCallHangup(data)
          break
        case 'offer':
          await this.handleVideoOffer(data)
          break
        case 'answer':
          await this.handleVideoAnswer(data)
          break
        case 'ice-candidate':
          await this.handleVideoIceCandidate(data)
          break
        default:
          // console.warn('🎥 未知的视频信令类型:', data.type)
      }
    } catch (error) {
      // console.error('❌ 处理视频信令消息失败:', error)
      this.handleVideoError('处理视频信令失败: ' + error.message)
    }
  }

  /**
   * 处理视频通话邀请
   */
  async handleVideoCallInvite(data) {

    
    this.videoCallId = data.callId
    this.remoteUserId = data.callerInfo.id
    this.updateVideoCallStatus('ringing')
    
    // 通过回调函数将来电信息传递给上层（videoCall store）
    if (this.onIncomingCall) {
      // console.log('✅ 调用 onIncomingCall 回调函数')
      this.onIncomingCall(data.callerInfo, data.callId)
    } else {
      // console.error('❌ onIncomingCall callback未定义，自动拒绝视频通话')
      // console.error('❌ 调试信息:', {
      //   thisObject: this,
      //   onIncomingCallType: typeof this.onIncomingCall,
      //   allCallbacks: {
      //     onIncomingCall: !!this.onIncomingCall,
      //     onCallStatusChange: !!this.onCallStatusChange,
      //     onLocalVideoStream: !!this.onLocalVideoStream,
      //     onRemoteVideoStream: !!this.onRemoteVideoStream
      //   }
      // })
      this.rejectVideoCall(data.callId, 'error')
    }
  }

  /**
   * 处理视频通话接受
   */
  async handleVideoCallAccept(data) {
    this.updateVideoCallStatus('connected')
    

    
    // 创建并发送offer
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    
    this.sendVideoSignal({
      type: 'offer',
      callId: this.videoCallId,
      targetUserId: this.remoteUserId,
      offer: offer
    })
  }

  /**
   * 处理视频通话拒绝
   */
  handleVideoCallReject(data) {

    
    this.updateVideoCallStatus('ended')
    this.cleanup()
  }

  /**
   * 处理视频通话挂断
   */
  handleVideoCallHangup(data) {

    
    this.updateVideoCallStatus('ended')
    this.cleanup()
  }

  /**
   * 处理视频offer
   */
  async handleVideoOffer(data) {

    
    await this.peerConnection.setRemoteDescription(data.offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    
    this.sendVideoSignal({
      type: 'answer',
      callId: this.videoCallId,
      targetUserId: this.remoteUserId,
      answer: answer
    })
  }

  /**
   * 处理视频answer
   */
  async handleVideoAnswer(data) {

    
    await this.peerConnection.setRemoteDescription(data.answer)
  }

  /**
   * 处理视频ICE候选
   */
  async handleVideoIceCandidate(data) {

    
    await this.peerConnection.addIceCandidate(data.candidate)
  }

  /**
   * 发送视频信令消息
   */
  sendVideoSignal(signalData) {
    if (!this.websocket || !this.websocket.send) {
      // console.error('❌ WebSocket不可用，无法发送视频信令')
      return
    }
    
    const message = {
      type: 6, // 前端发送给后端的WebRTC信令类型
      data: signalData
    }
    

    
    try {
      this.websocket.send(message)
    } catch (error) {
      // console.error('❌ 发送视频信令失败:', error)
      this.handleVideoError('发送视频信令失败: ' + error.message)
    }
  }

  /**
   * 更新视频通话状态
   */
  updateVideoCallStatus(newStatus) {
    const oldStatus = this.videoCallStatus
    this.videoCallStatus = newStatus
    
    if (this.DEBUG_VIDEO_WEBRTC) {
      console.log('🎥 视频通话状态变化:', { from: oldStatus, to: newStatus })
    }
    
    // 通知上层状态变化
    if (this.onCallStatusChange) {
      this.onCallStatusChange(newStatus)
    }
  }

  /**
   * 处理视频通话错误
   */
  handleVideoError(errorMessage) {
    console.error('❌ 视频通话错误:', errorMessage)
    
    if (this.onError) {
      this.onError(errorMessage)
    }
    
    this.cleanup()
  }

  /**
   * 创建WebRTC连接
   */
  createPeerConnection() {
    if (this.DEBUG_VIDEO_WEBRTC) {
      console.log('🎥 创建WebRTC连接')
    }
    
    this.peerConnection = new RTCPeerConnection(this.pcConfig)
    
    // 处理ICE候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        if (this.DEBUG_VIDEO_WEBRTC) {
          console.log('🎥 发送ICE候选')
        }
        this.sendVideoSignal({
          type: 'ice-candidate',
          callId: this.videoCallId,
          targetUserId: this.remoteUserId,
          candidate: event.candidate
        })
      }
    }
    
    // 处理远程流（关键：音频播放）
    this.peerConnection.ontrack = (event) => {
      if (this.DEBUG_VIDEO_WEBRTC) {
        console.log('🎥 收到远程流:', {
          streams: event.streams.length,
          track: event.track.kind
        })
      }
      
      if (event.streams && event.streams[0]) {
        this.remoteVideoStream = event.streams[0]
        
        // 通知组件远程视频流已准备好
        if (this.onRemoteVideoStream) {
          this.onRemoteVideoStream(this.remoteVideoStream)
        }
        
        // 立即播放远程音频（关键修复）
        this.playRemoteVideoStream()
      }
    }
    
    // 处理连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      if (this.DEBUG_VIDEO_WEBRTC) {
        console.log('🎥 WebRTC连接状态:', this.peerConnection.connectionState)
      }
      
      if (this.peerConnection.connectionState === 'connected') {
        this.updateVideoCallStatus('connected')
      } else if (this.peerConnection.connectionState === 'failed' || 
                 this.peerConnection.connectionState === 'disconnected') {
        this.handleVideoError('连接失败或断开')
      }
    }
  }
  
  /**
   * 播放远程视频流（修复版本）
   */
  playRemoteVideoStream() {
    if (this.remoteVideoStream) {
      if (this.DEBUG_VIDEO_WEBRTC) {
        console.log('🎥 开始播放远程视频流，音频轨道:', {
          audioTracks: this.remoteVideoStream.getAudioTracks().length,
          videoTracks: this.remoteVideoStream.getVideoTracks().length
        })
      }
      
      // 清理之前的视频元素，防止多个播放器同时工作
      const existingVideo = document.querySelector('#webrtc-remote-video')
      if (existingVideo) {
        existingVideo.remove()
      }
      
      // 创建新的video元素用于播放远程流
      const videoElement = document.createElement('video')
      videoElement.id = 'webrtc-remote-video'
      videoElement.autoplay = true
      videoElement.playsInline = true
      videoElement.muted = false // 关键：不要静音，这样才能听到声音
      videoElement.style.position = 'absolute'
      videoElement.style.top = '-9999px' // 隐藏在屏幕外，只用于播放音频
      videoElement.srcObject = this.remoteVideoStream
      
      // 添加到DOM中开始播放
      document.body.appendChild(videoElement)
      
      // 确保播放
      videoElement.play().then(() => {
        console.log('✅ 远程视频流播放成功（包含音频）')
      }).catch(error => {
        console.error('❌ 远程视频流播放失败:', error)
      })
      
      console.log('🎥 远程视频流已准备好，等待组件处理')
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.DEBUG_VIDEO_WEBRTC) {
      console.log('🎥 清理视频通话资源')
    }
    
    // 彻底停止本地视频流（释放设备资源）
    if (this.localVideoStream) {
      console.log('📹 停止本地视频流轨道:', {
        audioTracks: this.localVideoStream.getAudioTracks().length,
        videoTracks: this.localVideoStream.getVideoTracks().length
      })
      
      this.localVideoStream.getTracks().forEach(track => {
        console.log(`停止${track.kind}轨道:`, track.label)
        track.stop() // 彻底停止轨道，释放设备
      })
      this.localVideoStream = null
    }
    
    // 清理远程视频流
    if (this.remoteVideoStream) {
      console.log('📹 清理远程视频流')
      this.remoteVideoStream = null
    }
    
    // 清理隐藏的远程视频元素
    const existingVideo = document.querySelector('#webrtc-remote-video')
    if (existingVideo) {
      console.log('📹 移除远程视频元素')
      existingVideo.pause()
      existingVideo.srcObject = null
      existingVideo.remove()
    }
    
    // 关闭PeerConnection
    if (this.peerConnection) {
      console.log('🔌 关闭WebRTC连接')
      
      // 移除所有事件监听器
      this.peerConnection.onicecandidate = null
      this.peerConnection.ontrack = null
      this.peerConnection.onconnectionstatechange = null
      
      // 关闭连接
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    // 重置状态
    this.isInitiator = false
    this.videoCallId = null
    this.remoteUserId = null
    this.videoCallStatus = 'idle'
    this.isVideoMuted = false
    this.isVideoEnabled = true
    this.isCameraOn = true
    this.currentCamera = 'user'
    
    console.log('✅ 视频通话资源清理完成，设备已释放')
  }
}
