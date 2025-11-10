<script setup>
import {RouterLink, RouterView} from 'vue-router'
import { useUserInfoStore } from '@/stores/user';
import { useCallStore } from '@/stores/call.js';
import { useVideoCallStore } from '@/stores/videoCall.js';
import { onMounted } from 'vue';
import { callAddVisitorOncePerDay } from '@/api/uv';
import GlobalCallBubble from '@/components/call/GlobalCallBubble.vue';
import IncomingCallNotification from '@/components/business/IncomingCallNotification.vue';
import VideoCallBubble from '@/components/call/VideoCallBubble.vue';
import IncomingVideoCallNotification from '@/components/business/IncomingVideoCallNotification.vue';

const userInfoStore = useUserInfoStore();
const callStore = useCallStore();
const videoCallStore = useVideoCallStore();

// 页面加载时检查并建立连接
onMounted(() => {
  if (userInfoStore.userInfo?.token) {
    userInfoStore.connectWebSocket();
    
    // 初始化通话管理器
    setTimeout(async () => {
      if (userInfoStore.chatWS && userInfoStore.userInfo) {
      
        // 初始化语音通话管理器
        const success = callStore.initCallManager(userInfoStore.chatWS, userInfoStore);
        
        // 如果初始化成功，检查是否需要恢复持久化的通话状态
        if (success) {
          // 给一点时间让Pinia持久化状态完全加载
          setTimeout(async () => {
            await callStore.resumeCall();
          }, 100);
        }
        
        // 初始化视频通话管理器（独立初始化）
        try {
          await videoCallStore.initVideoWebRTCManager();
        } catch (error) {
          console.error('视频通话管理器初始化失败:', error);
        }
      } else {
        console.warn('通话管理器初始化失败: WebSocket或用户信息不可用');
      }
    }, 2000); // 增加等待时间确保完全初始化
  }
});
</script>

<template>
  <RouterView/>
  <!-- 全局语音通话气泡 -->
  <GlobalCallBubble />
  <!-- 语音通话来电通知 -->
  <IncomingCallNotification />
  
  <!-- 全局视频通话气泡（独立组件） -->
  <VideoCallBubble />
  <!-- 视频通话来电通知（独立组件） -->
  <IncomingVideoCallNotification />
</template>

<style scoped>

</style>


