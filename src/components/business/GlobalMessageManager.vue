<template>
  <div>
    <!-- 调试信息 -->
    <div v-if="false" style="position: fixed; top: 0; left: 0; background: red; color: white; padding: 5px; z-index: 99999;">
      GlobalMessageManager Loaded
    </div>
    
    <MessageNotification 
      ref="messageNotificationRef"
      :message="currentMessage"
      :duration="4000"
      :onClick="handleNotificationClick"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useContactStore } from '@/stores/contact';
import MessageNotification from '@/components/feedback/MessageNotification.vue';
import emitter from '@/utils/eventBus';
import clickSound from '@/assets/sounds/click.m4a';

// 立即执行的日志，确保脚本被加载
console.log('🔧 GlobalMessageManager 脚本已加载');

const router = useRouter();
const route = useRoute();
const contactStore = useContactStore();

const messageNotificationRef = ref(null);
const currentMessage = ref('');
const currentSender = ref(null);

// 全局标志，跟踪组件是否已挂载
let isComponentMounted = false;

// 音频相关
let messageSound = null;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/**
 * 初始化消息提示音
 */
const initAudio = async () => {
  try {
    await audioContext.resume();
    messageSound = new Audio();
    messageSound.src = clickSound;
    messageSound.volume = 1.0;
    messageSound.preload = 'auto';
    await new Promise((resolve, reject) => {
      messageSound.addEventListener('canplaythrough', resolve, { once: true });
      messageSound.addEventListener('error', (e) => {
        console.error('音频加载错误:', e);
        console.error('音频URL:', messageSound.src);
        reject(e);
      }, { once: true });
      messageSound.load();
    });
  } catch (error) {
    console.error('音频初始化失败:', error);
  }
};

/**
 * 播放消息提示音
 */
const playMessageSound = async () => {
  try {
    if (!messageSound) {
      await initAudio();
    }
    await audioContext.resume();
    messageSound.volume = 1.0;
    messageSound.currentTime = 0;
    await messageSound.play();
  } catch (error) {
    console.error('播放提示音失败:', error);
    messageSound = null;
  }
};

/**
 * 处理通知点击事件
 */
const handleNotificationClick = () => {
  if (currentSender.value) {
    contactStore.setCurrentChat(currentSender.value.id);
    router.push(`/chat/${currentSender.value.id}`);
    emitter.emit('refresh-mail-data');
  }
};

/**
 * 显示全局消息通知
 */
const showGlobalNotification = async (messageData) => {
  console.log('🔔 开始处理通知:', messageData);
  console.log('📍 当前路由:', route.path);
  console.log('🎯 目标路径:', `/chat/${messageData.fromUid}`);
  
  // 判断是否需要显示通知
  const shouldShow = () => {
    // 如果在当前聊天页面，不显示
    if (route.path === `/chat/${messageData.fromUid}`) {
      console.log('❌ 在聊天页面，不显示通知');
      return false;
    }
    console.log('✅ 不在聊天页面，可以显示');
    return true;
  };

  if (!shouldShow()) {
    return;
  }

  // 检查组件是否还存在
  console.log('🔍 检查组件状态:', { isComponentMounted, hasRef: !!messageNotificationRef.value });
  if (!isComponentMounted || !messageNotificationRef.value) {
    console.log('❌ 组件未挂载或引用失效');
    return;
  }

  const sender = contactStore.getContactById(messageData.fromUid);
  console.log('👤 查找发送者:', sender);
  
  if (sender) {
    console.log('✅ 准备显示通知:', sender.username);
    currentSender.value = sender;
    currentMessage.value = `${sender.username} 给您发送了一条消息`;
    
    // 播放提示音
    try {
      await playMessageSound();
      console.log('🔊 提示音播放成功');
    } catch (error) {
      console.error('❌ 播放提示音失败:', error);
    }
    
    // 显示通知
    messageNotificationRef.value.show();
    console.log('📢 通知已显示');
  } else {
    console.log('❌ 找不到发送者');
  }
};

/**
 * 初始化音频（用户交互后）
 */
const handleUserInteraction = async () => {
  await initAudio();
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('touchstart', handleUserInteraction);
};

// 全局事件处理函数 - 在组件外定义，避免被清理
const globalChatMessageHandler = (messageData) => {
  console.log('📨 GlobalMessageManager 收到事件:', messageData);
  showGlobalNotification(messageData);
};

onMounted(() => {
  isComponentMounted = true;
  console.log('🚀 GlobalMessageManager 组件挂载');
  
  // 先清理可能存在的重复监听器
  emitter.off('chat-message', globalChatMessageHandler);
  
  // 重新注册事件监听器
  emitter.on('chat-message', globalChatMessageHandler);
  console.log('✅ 已注册 chat-message 事件监听器');
  console.log('🔍 当前监听器数量:', emitter.all.get('chat-message')?.length || 0);
  
  // 也保留对global-message-notification的监听（兼容性）
  emitter.on('global-message-notification', showGlobalNotification);
  
  // 初始化音频（需要用户交互）
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);
});

onUnmounted(() => {
  isComponentMounted = false;
  console.log('🔄 GlobalMessageManager 组件卸载');
  console.log('🔍 卸载前监听器数量:', emitter.all.get('chat-message')?.length || 0);
  
  // 完全不清理chat-message监听器，让它持续工作
  // emitter.off('chat-message', globalChatMessageHandler);
  emitter.off('global-message-notification', showGlobalNotification);
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('touchstart', handleUserInteraction);
  
  console.log('🔍 卸载后监听器数量:', emitter.all.get('chat-message')?.length || 0);
});
</script>

<style scoped>
/* 这里可以添加额外的样式，如果需要的话 */
</style>
