<template>
  <transition name="notification-slide">
    <div v-if="visible" class="message-notification" @click="handleClick">
      <div class="notification-content">
        <div class="notification-avatar">
          <img 
            :src="sender.avatar" 
            :alt="sender.username"
            @error="handleImageError"
          />
        </div>
        <div class="notification-text-content">
          <div class="notification-title">{{ sender.username }}</div>
          <div class="notification-message">{{ message }}</div>
        </div>
      <div class="notification-close" @click.stop="handleClose">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  sender: {
    type: Object,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
  },
  onClick: {
    type: Function,
    default: () => {}
  }
});

const visible = ref(false);

const handleClick = () => {
  props.onClick();
  visible.value = false;
};

const handleClose = () => {
  visible.value = false;
};

const handleImageError = (event) => {
  // 头像加载失败时显示默认头像
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iOCIgeT0iOCI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+';
};

const show = () => {
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

defineExpose({
  show
});
</script>

<style scoped>
.message-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(10, 25, 47, 0.801); /* 深蓝深海色: Dark Blue Deep Sea Color */
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-radius: 18px;
  padding: 0;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  z-index: 9999;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-width: 360px;
  max-width: 400px;
  overflow: hidden;
}

.message-notification:active {
  transform: translateX(-50%) translateY(-2px) scale(0.98);
  transition: all 0.1s ease;
}


.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px 44px 16px 20px; /* 右侧留出关闭按钮空间 */
  gap: 14px;
  position: relative;
}

.notification-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 2px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 0 0 2px rgba(255, 255, 255, 0.1);
}

.notification-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.notification-text-content {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 3px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.notification-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.notification-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  cursor: pointer;
  z-index: 10;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.notification-close:active {
  transform: scale(0.95);
  transition: all 0.1s ease;
}

/* Apple风格动画效果 */
.notification-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.notification-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px) scale(0.9);
  filter: blur(4px);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.95);
  filter: blur(2px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .message-notification {
    left: 16px;
    right: 16px;
    transform: none;
    min-width: auto;
    max-width: none;
  }
  
  .message-notification:hover {
    transform: translateY(-4px) scale(1.02);
  }
  
  .notification-slide-enter-from {
    transform: translateY(-30px) scale(0.9);
  }
  
  .notification-slide-leave-to {
    transform: translateY(-20px) scale(0.95);
  }
}
</style> 

