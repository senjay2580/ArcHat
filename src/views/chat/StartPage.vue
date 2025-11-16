<template>
  <div class="start-page">
    <div class="start-content">
      <div class="welcome-section">
        <div class="welcome-header">
          <img src="/src/assets/image/peoples.svg" class="welcome-image" alt="people decoration" />
          <h1>欢迎来到 ArcChat<span><img src="/src/assets/image/archat.png" alt="" width="10%"></span></h1>
          <p class="subtitle">开启即时通讯之旅</p> <span style="margin-top: 10px;"></span>
        </div>
      </div>
      
      <div class="guide-and-visitor-container">
        <div class="guide-section">
          <div class="guide-item">
            <el-icon class="guide-icon"><User /></el-icon>
            <div class="guide-text">
              <h3>好友聊天</h3>
              <p>在左侧好友列表中选择好友开始私聊</p>
            </div>
          </div>
          
          <div class="guide-item">
            <el-icon class="guide-icon"><ChatDotRound /></el-icon>
            <div class="guide-text">
              <h3>群组聊天</h3>
              <p>在群聊列表中选择群聊开始聊天</p>
            </div>
          </div>
          
          <div class="guide-item">
            <el-icon class="guide-icon"><Setting /></el-icon>
            <div class="guide-text">
              <h3>个人中心</h3>
              <p>在右下角设置中自定义您的个人信息</p>
            </div>
          </div>
        </div>

       
      </div>

      <div class="features-section">
        <div class="feature-tag" @click="handleManageArchive"> 管理档案</div>
        <div class="feature-tag" @click="handleViewMail">查看邮件</div>
        <div class="feature-tag" @click="handleAIAssistant">AI助手</div>
        <div class="feature-tag update-tag" @click="showUpdateDialog">
          <span class="update-icon"  style="scale: 1.4;">👉</span>
          查看当前版本
        </div>
      </div>
    </div>

    <!-- 版本更新弹窗 -->
    <UpdateNotification
      :visible="showUpdateModal"
      :new-version="updateInfo.newVersion"
      :current-version="updateInfo.currentVersion"
      :update-size="updateInfo.updateSize"
      :estimated-time="updateInfo.estimatedTime"
      :update-date="updateInfo.updateDate"
      :update-features="updateInfo.updateFeatures"
      :future-plans="updateInfo.futurePlans"
      @close="handleCloseUpdate"
      @minimize="handleMinimizeUpdate"
      @maximize="handleMaximizeUpdate"
    />
  </div>
</template>

<script setup>
// ==================== 导入依赖 ====================
// Vue核心
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Element Plus
import { User, ChatDotRound, Setting } from '@element-plus/icons-vue';

// 组件
import UpdateNotification from '@/components/system/UpdateNotification.vue';
import dangerButton from '@/components/form/DangerButton.vue';

// Stores
import { useUserInfoStore } from '@/stores/user';

// #region 路由
const router = useRouter();
// #endregion

// #region Stores
const userStore = useUserInfoStore();
// #endregion

// #region 更新弹窗
const showUpdateModal = ref(false);

// 更新信息
const updateInfo = ref({
  newVersion: '2.1.0',
  currentVersion: '2.0.5',
  updateSize: '45.2 MB',
  estimatedTime: '2-3 分钟',
  updateDate: '2024-11-16',
  updateFeatures: [
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
  ],
  futurePlans: [
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
});

// 显示更新弹窗
const showUpdateDialog = () => {
  showUpdateModal.value = true;
};

// 关闭更新弹窗
const handleCloseUpdate = () => {
  showUpdateModal.value = false;
};


// 最小化更新弹窗
const handleMinimizeUpdate = () => {
  console.log('最小化更新弹窗');
};

// 最大化更新弹窗
const handleMaximizeUpdate = () => {
  console.log('最大化更新弹窗');
};
// #endregion

// #region 导航操作
const handleManageArchive = () => {
  router.push('/archives');
};

const handleViewMail = () => {
  router.push('/mail');
}; 

const handleAIAssistant = () => {
  router.push('/aichat');
};
// #endregion
</script>

<style scoped>
.start-page {
  border-radius: 10px;
  padding: 0;
  height: 110%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);

}

.start-content {
  max-width: 700px;
  width: 100%;
  text-align: center;
  color: var(--text-color);
  transform: translateY(-5%);
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-image {
  width: 520px;
  height: 200px;
  margin-bottom: 16px;
  opacity: 0.8;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

.welcome-image:hover {
  transform: scale(1.05);
  opacity: 1;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  background: linear-gradient(45deg, var(--primary-color), #409EFF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.guide-and-visitor-container {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  margin-bottom: 30px;
}

.guide-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color-secondary);
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.guide-item:hover {
  transform: translateX(8px);
}

.guide-icon {
  font-size: 20px;
  color: var(--primary-color);
  padding: 10px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 10px;
}

.guide-text {
  text-align: left;
}

.guide-text h3 {
  font-size: 16px;
  margin-bottom: 2px;
  color: var(--text-color);
}

.guide-text p {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin: 0;
}

.features-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.feature-tag {
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.feature-tag:hover {
  opacity: 1;
}

/* 版本更新按钮特殊样式 */
.update-tag {
  background: linear-gradient(to right, #16a340, #14da2e) !important;
  position: relative;
  overflow: hidden;

}

.update-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.update-icon {
  display: inline-block;
  margin-right: 4px;
  animation: rocket 2s infinite;
}

@keyframes rocket {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.update-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.update-tag:hover::before {
  left: 100%;
}




</style> 

