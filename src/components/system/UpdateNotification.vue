<template>
  <div v-if="visible" class="update-overlay" @click="handleOverlayClick">
    <div class="update-modal" @click.stop>
      <!-- Mac风格窗口控制按钮 -->
      <div class="window-controls">
        <div class="control-button close" @click="closeModal"></div>
        <div class="control-button minimize" @click="minimizeModal"></div>
        <div class="control-button maximize" @click="maximizeModal"></div>
      </div>

      <!-- 更新内容 -->
      <div class="update-content">
        <div class="content-header">
          <h2 class="update-title">通知</h2>
        </div>
        
        <div class="scrollable-content">
          <div class="notification-content">
            <div class="content-columns">
              <!-- 更新内容列 -->
              <div class="column update-column">
                <h3 class="column-title">更新内容</h3>
                <ul class="feature-list">
                  <li v-for="feature in updateFeatures" :key="feature.id" class="feature-item">
                    <div class="feature-text">
                      <strong class="feature-title">{{ feature.title }}</strong>
                      <p class="feature-desc">{{ feature.description }}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- 未来计划列 -->
              <div class="column future-column">
                <h3 class="column-title">未来计划</h3>
                <ul class="feature-list">
                  <li v-for="plan in futurePlans" :key="plan.id" class="feature-item">
                    <div class="feature-text">
                      <strong class="feature-title">{{ plan.title }}</strong>
                      <p class="feature-desc">{{ plan.description }}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定在底部的footer -->
      <div class="update-footer">
        <div class="version-info">
          <p class="current-version">当前版本: v{{ currentVersion }}</p>
          <p class="update-date">发布日期: {{ updateDate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentVersion: {
    type: String,
    default: '2.0.5'
  },
  updateSize: {
    type: String,
    default: '45.2 MB'
  },
  estimatedTime: {
    type: String,
    default: '2-3 分钟'
  },
  updateDate: {
    type: String,
    default: '2024-11-16'
  },
  updateFeatures: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: 'AI 智能助手升级',
        description: '更快的响应速度，更准确的回答'
      },
      {
        id: 2,
        title: '全新界面设计',
        description: '更现代化的UI设计，提升用户体验'
      },
      {
        id: 3,
        title: '安全性增强',
        description: '加强数据加密，保护用户隐私'
      }
    ]
  },
  futurePlans: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: '多语言支持',
        description: '支持英语、日语等多种语言界面'
      },
      {
        id: 2,
        title: '插件系统',
        description: '开放插件API，支持第三方扩展'
      },
      {
        id: 3,
        title: '云端同步',
        description: '聊天记录云端备份与多设备同步'
      }
    ]
  }
})

const emit = defineEmits(['close', 'minimize', 'maximize'])

const closeModal = () => {
  emit('close')
}

const minimizeModal = () => {
  emit('minimize')
}

const maximizeModal = () => {
  emit('maximize')
}

const handleOverlayClick = () => {
  // 点击遮罩层关闭弹窗
  emit('close')
}
</script>

<style scoped>
.update-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.update-modal {
  background: #ffffff;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 16px;
  width: 75%;
  height: 89%;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s ease;
  position: relative;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.window-controls {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.update-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 50px 24px 0;
  text-align: center;
  color: #000000;
  flex-shrink: 0;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}


.update-icon {
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.update-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #000000;
}



/* 两列布局 */
.notification-content {
  padding: 24px 0;
}

.content-columns {
  display: flex;
  gap: 24px;
  text-align: left;
}

.column {
  flex: 1;
}

.column-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 20px;
  text-align: left;
  padding-bottom: 8px;
  border-bottom: 2px solid;
}

.update-column .column-title {
  color: #1e40af;
  border-bottom-color: #1e40af;
}

.future-column .column-title {
  color: #059669;
  border-bottom-color: #059669;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  padding: 8px 0;
  border-bottom: 1px solid #e1e4e8;
  transition: all 0.2s ease;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item:hover {
  background: rgba(30, 64, 175, 0.05);
  padding-left: 8px;
  margin-left: -8px;
  border-radius: 4px;
}

.feature-text {
  flex: 1;
}

.feature-title {
  display: block;
  font-size: 15px;
  margin-bottom: 2px;
  font-weight: 600;
  line-height: 1.3;
}

.update-column .feature-title {
  color: #1e40af;
}

.future-column .feature-title {
  color: #059669;
}

.feature-desc {
  margin: 0;
  font-size: 13px;
  color: #586069;
  line-height: 1.3;
}


.update-footer {
  display: flex;
  justify-content: center;
  font-size: 14px;
  color: #000000;
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
  background: #ffffff;
  flex-shrink: 0;
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.update-footer p {
  margin: 0;
  font-weight: 500;
}

.current-version {
  color: #1e40af;
  font-weight: 600;
}

.update-date {
  color: #000000;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 650px) {
  .update-modal {
    width: 95vw;
    height: 80vh;
    margin: 20px;
  }
  
  .content-header {
    padding: 40px 20px 0;
  }
  
  .scrollable-content {
    padding: 0 20px;
  }
  
  .update-title {
    font-size: 24px;
  }
  
  .content-columns {
    flex-direction: column;
    gap: 24px;
  }
  
  .column-title {
    font-size: 20px;
  }
  
  .update-footer {
    padding: 16px 20px;
  }
}
</style>
