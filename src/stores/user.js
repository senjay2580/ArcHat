import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import ChatWebSocket from "@/api/chat.js";
import emitter from '@/utils/eventBus';

export const useUserInfoStore = defineStore('userInfo', () => {
  const userInfo = ref('');
  const chatWS = ref(null);



  const setUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo;
  };

  const removeUserInfo = () => {
    try {
      if (chatWS.value && typeof chatWS.value.close === 'function') {
        chatWS.value.close();
      }
    } catch (error) {
      console.error('关闭 WebSocket 连接时出错:', error);
    } finally {
      userInfo.value = '';
      chatWS.value = null;
    }
  };

  const clearWebSocket = () => {
    try {
      if (chatWS.value && typeof chatWS.value.close === 'function') {
        chatWS.value.close();
      }
    } catch (error) {
      console.error('清理 WebSocket 连接时出错:', error);
    }
    chatWS.value = null;
  };

  const connectWebSocket = (token) => {
    
    // 如果已经有连接且状态正常，不重复连接
    if (chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected()) {
      return;
    }

    clearWebSocket(); // 确保清理旧的连接

    const wsToken = token || userInfo.value?.token;
    if (!wsToken) {
      console.error('没有有效的 token，无法建立 WebSocket 连接');
      return;
    }

    try {
      // 根据环境变量动态构建 WebSocket URL
      let wsUrl;
      // npm run dev 时 import.meta.env.DEV 为 true
      if (import.meta.env.DEV) {
        // 开发环境：使用本地地址
        wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8090';
      } else {
        // 生产环境：动态构建 URL
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        wsUrl = import.meta.env.VITE_WEBSOCKET_URL || `${protocol}://${location.host}/ws/`;
      }
      
      console.log('WebSocket URL:', wsUrl);
      
      chatWS.value = new ChatWebSocket({
        url: wsUrl,
        token: wsToken,
        onMessage: (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // 根据消息类型分发到不同的组件
            switch (data.type) {
              case 1000: // 聊天消息
                emitter.emit('chat-message', data.data);
                emitter.emit('refresh-contact-list');
                break;
              case 1001: // 好友申请消息
                emitter.emit('friend-apply', data.data);
                break;
              case 2: // 心跳包
                // console.log('收到心跳包');
                break;
              case 4: // 群消息
                emitter.emit('group-message', data.data);
                console.log('收到群消息:', data.data);
                emitter.emit('refresh-group-contact-list', data.data);
                break;
                // 其他用户上下线通知
              case 5:
                emitter.emit('user-status', data.data);
                console.log('收到用户上下线通知:', data.data);
                break;
              case 9: // 撤回消息
                console.log('收到撤回消息:', data.data);
                emitter.emit('message-recall', data.data);
                break;
              case 12: // WebRTC信令消息（语音和视频通话共用）
                console.log('收到WebRTC信令消息:', data.data);
                
                // 根据信令类型和callId区分语音和视频通话
                const signalType = data.data?.type;
                const callId = data.data?.callId;
                
                // 视频通话信令判断逻辑（更完整）
                const isVideoCallSignal = signalType && (
                  // 明确的视频通话信令类型
                  signalType.startsWith('video-') || 
                  signalType === 'video-call-invite' ||
                  signalType === 'video-call-accept' ||
                  signalType === 'video-call-reject' ||
                  signalType === 'video-call-hangup' ||
                  // 通过callId判断：视频通话的callId包含'video_call'
                  (callId && callId.includes('video_call'))
                );
                
                if (isVideoCallSignal) {
                  console.log('🎥 路由到视频通话信令处理:', signalType, '| callId:', callId);
                  emitter.emit('video-webrtc-signal', data.data);
                } else {
                  console.log('📞 路由到语音通话信令处理:', signalType, '| callId:', callId);
                  emitter.emit('webrtc-signal', data.data);
                }
                break;
              default:
                console.log('未知消息类型:', data.type, data.data);
            }
          } catch (error) {
            console.error('处理 WebSocket 消息失败:', error);
          }
        },
        onOpen: () => {
          console.log('WebSocket 连接已建立');
        },
        onClose: () => {
          console.log('WebSocket 连接已关闭');
        },
        onError: (err) => {
          console.error('WebSocket 错误', err);
          // 如果连接失败，清理实例
          if (chatWS.value) {
            chatWS.value = null;
          }
        }
      });
      
      // 验证实例是否正确创建
      if (!chatWS.value || typeof chatWS.value.close !== 'function') {
        console.error('ChatWebSocket 实例创建失败或方法缺失');
        chatWS.value = null;
      }
    } catch (error) {
      console.error('创建 ChatWebSocket 实例失败:', error);
      chatWS.value = null;
    }
  };


  return { 
    userInfo, 
    setUserInfo, 
    removeUserInfo, 
    chatWS, 
    connectWebSocket,

    // 直接暴露 chatWS 实例的方法，避免重复
    manualReconnect: () => {
      if (chatWS.value && typeof chatWS.value.manualReconnect === 'function') {
        chatWS.value.manualReconnect();
      } else {
        connectWebSocket();
      }
    }
  };
}, { persist: { paths: ['userInfo'] } });