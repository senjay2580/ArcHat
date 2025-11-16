<template>
  <div class="system-layout">
    <!-- 系统顶栏 -->
    <SystemTopBar
      :is-logged-in="isLoggedIn"
      :username="username"
      :user-avatar="userAvatar"
      @close-window="handleCloseWindow"
      @minimize-window="handleMinimizeWindow"
      @maximize-window="handleMaximizeWindow"
      @show-login="handleShowLogin"
      @logout="handleLogout"
      @open-profile="handleOpenProfile"
      @open-settings="handleOpenSettings"
    />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <slot></slot>
    </div>

    <!-- 版本更新弹窗 -->
    <UpdateNotification
      :visible="showUpdateModal"
      :new-version="updateInfo.newVersion"
      :current-version="updateInfo.currentVersion"
      :update-size="updateInfo.updateSize"
      :estimated-time="updateInfo.estimatedTime"
      :features="updateInfo.features"
      @close="handleCloseUpdate"
      @update="handleStartUpdate"
      @remind-later="handleRemindLater"
      @minimize="handleMinimizeUpdate"
      @maximize="handleMaximizeUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import SystemTopBar from './SystemTopBar.vue'
import UpdateNotification from './UpdateNotification.vue'

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    default: ''
  },
  userAvatar: {
    type: String,
    default: ''
  },
  autoCheckUpdate: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'window-close',
  'window-minimize',
  'window-maximize',
  'show-login',
  'logout',
  'open-profile',
  'open-settings',
  'start-update',
  'remind-later'
])

const showUpdateModal = ref(false)

// 更新信息
const updateInfo = ref({
  newVersion: '2.1.0',
  currentVersion: '2.0.5',
  updateSize: '45.2 MB',
  estimatedTime: '2-3 分钟',
  features: [
    {
      id: 1,
      icon: '🤖',
      title: 'AI 智能助手升级',
      description: '更快的响应速度，更准确的回答'
    },
    {
      id: 2,
      icon: '🎨',
      title: '全新界面设计',
      description: '更现代化的UI设计，提升用户体验'
    },
    {
      id: 3,
      icon: '🔒',
      title: '安全性增强',
      description: '加强数据加密，保护用户隐私'
    },
    {
      id: 4,
      icon: '⚡',
      title: '性能优化',
      description: '启动速度提升40%，内存占用减少30%'
    }
  ]
})

// 窗口控制事件
const handleCloseWindow = () => {
  emit('window-close')
}

const handleMinimizeWindow = () => {
  emit('window-minimize')
}

const handleMaximizeWindow = () => {
  emit('window-maximize')
}

// 用户相关事件
const handleShowLogin = () => {
  emit('show-login')
}

const handleLogout = () => {
  emit('logout')
}

const handleOpenProfile = () => {
  emit('open-profile')
}

const handleOpenSettings = () => {
  emit('open-settings')
}

// 更新相关事件
const handleCloseUpdate = () => {
  showUpdateModal.value = false
}

const handleStartUpdate = () => {
  showUpdateModal.value = false
  emit('start-update', updateInfo.value)
}

const handleRemindLater = () => {
  showUpdateModal.value = false
  emit('remind-later')
}

const handleMinimizeUpdate = () => {
  // 最小化更新弹窗（可以实现为缩小到系统托盘等）
  console.log('最小化更新弹窗')
}

const handleMaximizeUpdate = () => {
  // 最大化更新弹窗
  console.log('最大化更新弹窗')
}

// 检查更新
const checkForUpdates = () => {
  // 模拟检查更新
  setTimeout(() => {
    // 假设有新版本
    const hasUpdate = Math.random() > 0.7 // 30% 概率有更新
    if (hasUpdate) {
      showUpdateModal.value = true
    }
  }, 2000)
}

// 手动显示更新弹窗（用于测试）
const showUpdateDialog = () => {
  showUpdateModal.value = true
}

onMounted(() => {
  if (props.autoCheckUpdate) {
    checkForUpdates()
  }
})

// 暴露方法给父组件
defineExpose({
  showUpdateDialog,
  checkForUpdates
})
</script>

<style scoped>
.system-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>
