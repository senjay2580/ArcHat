import { ref } from 'vue';
import { useContactStore } from '@/stores/contact';
import clickSound from '@/assets/sounds/click.m4a';

// 全局通知状态
const isNotificationVisible = ref(false);
const currentMessage = ref('');
const currentSender = ref(null);
const notificationCallbacks = ref([]);

// 音频相关
let messageSound = null;
let audioContext = null;

/**
 * 初始化音频
 */
const initAudio = async () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    await audioContext.resume();
    
    if (!messageSound) {
      messageSound = new Audio();
      messageSound.src = clickSound;
      messageSound.volume = 1.0;
      messageSound.preload = 'auto';
    }
  } catch (error) {
    console.error('音频初始化失败:', error);
  }
};

/**
 * 播放提示音
 */
const playMessageSound = async () => {
  try {
    if (!messageSound) {
      await initAudio();
    }
    if (messageSound) {
      messageSound.currentTime = 0;
      await messageSound.play();
    }
  } catch (error) {
    console.error('播放提示音失败:', error);
  }
};

/**
 * 显示消息通知
 */
const showNotification = async (messageData, currentRoute) => {
  console.log('🔔 显示通知:', messageData, '当前路由:', currentRoute);
  
  // 如果在对应的聊天页面，不显示通知
  if (currentRoute === `/chat/${messageData.fromUid}`) {
    console.log('❌ 在对应的聊天页面，不显示通知');
    return;
  }
  
  // 如果在群聊页面，也不显示私聊通知（可选逻辑）
  if (currentRoute.startsWith('/groupchat/')) {
    console.log('✅ 在群聊页面，显示私聊通知');
    // 群聊页面可以显示私聊通知
  }
  
  const contactStore = useContactStore();
  const sender = contactStore.getContactById(messageData.fromUid);
  
  if (sender) {
    console.log('✅ 显示通知:', sender.username);
    currentSender.value = sender;
    currentMessage.value = messageData.content || '发送了一条消息';
    isNotificationVisible.value = true;
    
    // 播放提示音
    await playMessageSound();
    
    // 通知所有注册的回调
    notificationCallbacks.value.forEach(callback => {
      try {
        callback({
          sender,
          message: currentMessage.value,
          show: () => {
            // 这里可以触发UI显示
          }
        });
      } catch (error) {
        console.error('通知回调执行失败:', error);
      }
    });
    
    // 3秒后自动隐藏
    setTimeout(() => {
      isNotificationVisible.value = false;
    }, 3000);
  }
};

/**
 * 注册通知回调
 */
const registerNotificationCallback = (callback) => {
  notificationCallbacks.value.push(callback);
  
  // 返回取消注册的函数
  return () => {
    const index = notificationCallbacks.value.indexOf(callback);
    if (index > -1) {
      notificationCallbacks.value.splice(index, 1);
    }
  };
};

/**
 * 处理通知点击
 */
const handleNotificationClick = () => {
  if (currentSender.value) {
    // 这里可以触发路由跳转，但需要在组件中处理
    return {
      action: 'navigate',
      path: `/chat/${currentSender.value.id}`,
      sender: currentSender.value
    };
  }
  return null;
};

// 初始化音频（需要用户交互）
let audioInitialized = false;
const initAudioOnUserInteraction = () => {
  if (!audioInitialized) {
    initAudio();
    audioInitialized = true;
    document.removeEventListener('click', initAudioOnUserInteraction);
    document.removeEventListener('touchstart', initAudioOnUserInteraction);
  }
};

// 添加用户交互监听器
document.addEventListener('click', initAudioOnUserInteraction);
document.addEventListener('touchstart', initAudioOnUserInteraction);

export {
  isNotificationVisible,
  currentMessage,
  currentSender,
  showNotification,
  registerNotificationCallback,
  handleNotificationClick
};
