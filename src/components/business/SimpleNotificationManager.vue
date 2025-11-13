<template>
  <MessageNotification 
    v-if="isVisible && currentSender"
    ref="messageNotificationRef"
    :message="currentMessage"
    :sender="currentSender"
    :duration="4000"
    :onClick="handleNotificationClick"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useContactStore } from '@/stores/contact';
import MessageNotification from '@/components/feedback/MessageNotification.vue';
import { 
  isNotificationVisible, 
  currentMessage, 
  currentSender,
  registerNotificationCallback,
  handleNotificationClick as handleClick
} from '@/utils/notificationManager';

const router = useRouter();
const contactStore = useContactStore();
const messageNotificationRef = ref(null);
const isVisible = ref(false);

// 处理通知点击
const handleNotificationClick = () => {
  const result = handleClick();
  if (result && result.action === 'navigate') {
    contactStore.setCurrentChat(result.sender.id);
    router.push(result.path);
  }
  isVisible.value = false;
};

// 注册通知回调
let unregisterCallback = null;

onMounted(() => {
  console.log('🚀 SimpleNotificationManager 挂载');
  
  unregisterCallback = registerNotificationCallback((notificationData) => {
    console.log('📢 收到通知回调:', notificationData);
    isVisible.value = true;
    
    // 显示通知
    if (messageNotificationRef.value) {
      messageNotificationRef.value.show();
    }
  });
});

onUnmounted(() => {
  console.log('🔄 SimpleNotificationManager 卸载');
  if (unregisterCallback) {
    unregisterCallback();
  }
});
</script>
