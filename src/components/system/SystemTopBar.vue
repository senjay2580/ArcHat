<template>
  <div class="system-topbar">
    <!-- Mac风格窗口控制按钮 -->
    <div class="window-controls">
      <div class="control-button close" @click="closeWindow" title="关闭"></div>
      <div class="control-button minimize" @click="minimizeWindow" title="最小化"></div>
      <div class="control-button maximize" @click="maximizeWindow" title="最大化"></div>
    </div>

    <!-- 应用标题 -->
    <div class="app-title">
      <img src="@/assets/image/archat.png" alt="ArcChat" class="app-icon">
      <span class="title-text">ArcChat</span>
    </div>

    <!-- 登录状态提示 -->
    <div class="login-status">
      <div v-if="!isLoggedIn" class="login-prompt">
        <div class="prompt-icon">⚠️</div>
        <span class="prompt-text">未登录</span>
        <button class="login-btn" @click="showLogin">
          登录
        </button>
      </div>
      <div v-else class="user-info">
        <div class="user-avatar">
          <img v-if="userAvatar" :src="userAvatar" alt="用户头像">
          <span v-else class="avatar-text">{{ userInitial }}</span>
        </div>
        <span class="username">{{ username }}</span>
        <div class="user-menu" @click="toggleUserMenu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 用户菜单下拉 -->
    <div v-if="showUserMenu && isLoggedIn" class="user-dropdown" @click.stop>
      <div class="dropdown-item" @click="openProfile">
        <span class="item-icon">👤</span>
        个人资料
      </div>
      <div class="dropdown-item" @click="openSettings">
        <span class="item-icon">⚙️</span>
        设置
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-item logout" @click="logout">
        <span class="item-icon">🚪</span>
        退出登录
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'

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
  }
})

const emit = defineEmits([
  'close-window',
  'minimize-window', 
  'maximize-window',
  'show-login',
  'logout',
  'open-profile',
  'open-settings'
])

const showUserMenu = ref(false)

const userInitial = computed(() => {
  return props.username ? props.username.charAt(0).toUpperCase() : 'U'
})

// 窗口控制
const closeWindow = () => {
  emit('close-window')
}

const minimizeWindow = () => {
  emit('minimize-window')
}

const maximizeWindow = () => {
  emit('maximize-window')
}

// 登录相关
const showLogin = () => {
  emit('show-login')
}

const logout = () => {
  showUserMenu.value = false
  emit('logout')
}

// 用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const openProfile = () => {
  showUserMenu.value = false
  emit('open-profile')
}

const openSettings = () => {
  showUserMenu.value = false
  emit('open-settings')
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-info') && !event.target.closest('.user-dropdown')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.system-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 16px;
  -webkit-app-region: drag;
  user-select: none;
  position: relative;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Mac风格窗口控制按钮 */
.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.control-button.close {
  background: #ff5f57;
}

.control-button.minimize {
  background: #ffbd2e;
}

.control-button.maximize {
  background: #28ca42;
}

.control-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 悬浮时显示图标 */
.control-button:hover::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
}

.control-button.close:hover::after {
  content: '×';
  font-size: 8px;
  font-weight: bold;
  color: #4a0e0e;
  width: auto;
  height: auto;
}

.control-button.minimize:hover::after {
  background: #8b6914;
  height: 1px;
  width: 6px;
}

.control-button.maximize:hover::after {
  border: 1px solid #0f5132;
  background: transparent;
  width: 4px;
  height: 4px;
}

/* 应用标题 */
.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.app-icon {
  width: 20px;
  height: 16px;
  object-fit: contain;
}

.title-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 登录状态区域 */
.login-status {
  -webkit-app-region: no-drag;
  position: relative;
}

/* 未登录提示 */
.login-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prompt-icon {
  font-size: 14px;
}

.prompt-text {
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.login-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #4f46e5;
  border: none;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 已登录用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 8px 4px 4px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.username {
  color: white;
  font-size: 12px;
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu {
  color: white;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.user-info:hover .user-menu {
  opacity: 1;
}

/* 用户下拉菜单 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 160px;
  animation: dropdownSlide 0.2s ease;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

.item-icon {
  font-size: 16px;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-topbar {
    padding: 0 12px;
  }
  
  .app-title {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .prompt-text {
    display: none;
  }
}
</style>
