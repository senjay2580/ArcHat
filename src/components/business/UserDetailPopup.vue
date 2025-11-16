<template>
  <teleport to="body">
    <div v-if="visible" class="user-detail-popup" :style="popupStyle" ref="popupRef">
      <div class="user-detail-content">
        <!-- Mac窗口控制按钮 -->
        <MacWindowControls @close="handleClose" />

        <!-- 用户基本信息 -->
        <div class="user-header">
          <el-image
            :src="user.avatar"
            :preview-src-list="[user.avatar]"
            :initial-index="0"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 50%;"
          />
          <div class="user-info">
            <div class="user-name-level">
              <h3>{{ user.name }}</h3>
              <div class="level-badge" :style="levelStyle">
                Lv.{{ user.level }}
              </div>
            </div>
            <p class="user-status" :class="{ 'online': user.status, 'offline': !user.status }">
              <el-icon class="status-icon"><CircleCheck v-if="user.status" /><CircleClose v-else /></el-icon>
              {{ user.status ? '在线' : '离线' }}
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="user-actions" v-if="!hideAddFriend && !hideStartChat">
          <DangerButton 
            v-if="!user.isFriend && !hideAddFriend" 
            type="primary" 
            @click="handleAddFriend"
            :loading="addingFriend"
            class="action-button"
          >
            <el-icon><Plus /></el-icon>
            添加好友
          </DangerButton>
       
          <DangerButton 
            v-else-if="user.isFriend && !hideStartChat" 
            type="gradient-green" 
            @click="handleStartChat"
            class="action-button"
          >
            <el-icon><ChatDotRound /></el-icon>
            开始聊天
          </DangerButton>
          
        </div>

        <!-- 用户详细信息 -->
        <div class="user-details">
          <div class="detail-item">
            <span class="label">注册时间</span>
            <span class="value">{{ formatDate(user.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Plus, ChatDotRound, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getLevelBadgeStyle } from '@/utils/exp';
import { formatDate } from '@/utils/time';
import MacWindowControls from '@/components/layout/MacWindowControls.vue';
import { addFriend } from '@/api/friend';
import ArcMessage from '@/utils/ArcMessage';
import DangerButton from '@/components/form/DangerButton.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      avatar: '',
      level: '',
      createTime: '',
      hideAddFriend: false,
      isFriend: false
    })
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  hideStartChat: {
    type: Boolean,
    default: false
  },
  hideAddFriend: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'add-friend', 'start-chat', 'friend-request-sent']);

const router = useRouter();
const addingFriend = ref(false);
const popupRef = ref(null);

// 计算弹窗位置
const popupStyle = computed(() => ({
  top: `${props.position.y}px`,
  left: `${props.position.x}px`
}));

// 获取等级样式
const levelStyle = computed(() => getLevelBadgeStyle(props.user.level));

// 添加好友
const handleAddFriend = async () => {
  addingFriend.value = true;
  try {
    const response = await addFriend({
      friendId: props.user.id
    });
    
    if (response.code === 200) {
      ArcMessage.success('好友请求已发送');
      emit('update:visible', false);
      emit('friend-request-sent');
    } else {
      ArcMessage.error(response.message || '添加好友失败');
    }
  } catch (error) {
    console.error('添加好友失败:', error);
    ArcMessage.error('添加好友失败，请稍后重试');
  } finally {
    addingFriend.value = false;
  }
};

// 开始聊天
const handleStartChat = () => {
  emit('start-chat', props.user);
  emit('update:visible', false);
};

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};

// 添加点击外部关闭功能
const handleClickOutside = (event) => {
  if (!props.visible || !popupRef.value) return;
  if (!popupRef.value.contains(event.target)) {
    emit('update:visible', false);
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  emit('')
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
@import '/src/assets/styles/level.css';

.user-detail-popup {
  position: fixed;
  z-index: 19999 !important;
  background: rgb(84, 216, 90);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 320px;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  border: 1px solid var(--light-border);
  transition: all 0.3s ease;
}

.user-detail-content {
  padding: 20px;
  padding-top: 32px;
  background: var(--light-sidebar-bg);
  transition: all 0.3s ease;
}

.user-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.user-info {
  flex: 1;
}

.user-name-level {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user-name-level h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--light-text);
  transition: all 0.3s ease;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  margin: 4px 0;
}

.user-status .status-icon {
  font-size: 16px;
}

.user-status.online {
  color: #67C23A;
}

.user-status.offline {
  color: #F56C6C;
}

.user-actions {
  margin-bottom: 20px;
}

.action-button {
  width: 100%;
  justify-content: center;
  gap: 8px;
}

.action-button:hover {
  background: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
}

.user-details {
  border-top: 1px solid var(--light-border);
  padding-top: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  color: var(--light-secondary-text);
  font-size: 14px;
  transition: all 0.3s ease;
}

.detail-item .value {
  color: var(--light-text);
  font-size: 14px;
  max-width: 200px;
  text-align: right;
  word-break: break-all;
  transition: all 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style> 

