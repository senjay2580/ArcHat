<template>
  <transition name="notification-fade">
    <div v-if="visible" class="message-notification" :class="{ 'dark-mode': isDarkMode }" @click="handleClick">
      <div class="notification-content">
        <el-icon class="notification-icon"><Bell /></el-icon>
        <span class="notification-text">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import { useDark } from '@vueuse/core';

const props = defineProps({
  message: {
    type: String,
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
const router = useRouter();
const isDarkMode = useDark();

const handleClick = () => {
  props.onClick();
  visible.value = false;
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
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s ease;
  border: 1px solid rgba(64, 158, 255, 0.2);
  display: flex;
  align-items: center;
  min-width: 300px;
}

.message-notification:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  border-color: rgba(64, 158, 255, 0.4);
}

.dark-mode.message-notification {
  background: rgba(30, 30, 30, 0.98);
  border-color: rgba(64, 158, 255, 0.3);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  color: #409EFF;
}

.notification-text {
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
}

.dark-mode .notification-text {
  color: #409EFF;
}

/* 动画效果 */
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style> 

