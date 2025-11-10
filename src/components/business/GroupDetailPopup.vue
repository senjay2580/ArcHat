<template>
  <teleport to="body">
    <div v-if="visible" class="user-detail-popup" :style="popupStyle" ref="popupRef">
      <!-- Mac窗口控制按钮移到最顶部 -->
      <mac-window-controls @close="handleClose" class="window-controls" />
      
      <div class="user-detail-content">
        <!-- 群聊头部信息 -->
        <div class="user-header">
          <el-avatar :size="60" :src="group.avatar" />
          <div class="user-info">
            <div class="user-name-level">
              <h3>{{ group.name }}</h3>
            </div>
            <p class="user-status">{{ group.memberCount || "…" }} 位成员</p>
          </div>
        </div>

        <!-- 群聊操作按钮 -->
        <div class="user-actions">
          <el-button type="primary" @click="handleStartChat" v-if="!hideStartGroup">
            <el-icon><ChatDotRound /></el-icon>
            发起群聊
          </el-button>
        </div>

        <!-- 群聊详细信息 -->
        <div class="user-details">
          <div class="detail-item">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDate(group.createTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">群主</span>
            <span class="value">{{ group.owner || "senjay" }}</span>
          </div>
          <div class="detail-item">
            <span class="label">群公告</span>
            <span class="value group-desc-ellipsis">{{ (group.groupDesc && group.groupDesc.length > 50) ? group.groupDesc.slice(0, 50) + '…' : (group.groupDesc || '暂无公告…') }}</span>
          </div>
        </div>

        <!-- 群成员列表 -->
        <div class="group-members">
          <h4 v-if="props.group.members">群成员 ({{ group.memberCount }})</h4>
          <div class="members-list">
            <div v-for="member in displayedMembers" :key="member.id" class="member-item">
              <el-avatar :size="32" :src="member.avatar" />
              <span class="member-name">{{ member.name }}</span>
              <span v-if="member.role === 1" class="member-role owner"><el-icon><StarFilled /></el-icon>群主</span>
              <span v-else-if="member.role === 2" class="member-role admin"><el-icon><Medal /></el-icon>管理员</span>
              <span v-else class="member-role normal"><el-icon><UserFilled /></el-icon>成员</span>
            </div>
            <div v-if="hasMoreMembers" class="more-members">...</div>
          </div>
        </div>
        <div class="popup-footer">
          <danger-button type="gradient-purple" @click="handleGroupMoreClick(group, $event)">
            <el-icon><More /></el-icon>
            关于群聊
          </danger-button>
        </div>  
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { ChatDotRound, StarFilled, Medal, UserFilled, More } from '@element-plus/icons-vue';
import MacWindowControls from '@/components/layout/MacWindowControls.vue';
import { formatDate } from '@/utils/time';
import DangerButton from '@/components/form/DangerButton.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  group: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  hideStartGroup : {
    type: Boolean,
    default:true
  }
});

const emit = defineEmits(['update:visible', 'start-chat', 'group-more']);

const popupRef = ref(null);

const popupStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}));

const handleStartChat = () => {
  emit('start-chat', props.group);
  emit('update:visible', false);
};

const handleGroupMoreClick = (group, event) => {
  emit('group-more', group);
  emit('update:visible', false);
};

const handleClose = () => {
  emit('update:visible', false);
};

// 计算显示的成员
const displayedMembers = computed(() => {
  if(props.group.members !=null)
  return props.group.members.slice(0, 3);
  return null;
});

// 判断是否有更多成员
const hasMoreMembers = computed(() => {
  if(props.group.members !=null)
  return props.group.members.length > 3;
  return null;
});

// 新增：点击弹窗外部关闭
const handleClickOutside = (event) => {
  if (!props.visible || !popupRef.value) return;
  if (!popupRef.value.contains(event.target)) {
    emit('update:visible', false);
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
.user-detail-popup {
  position: fixed;
  z-index: 9999;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 280px;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  border: 1px solid var(--light-border);
  transition: all 0.3s ease;
   /* 为窗口控制按钮留出空间 */
}

:deep(.dark-mode .user-detail-popup) {
  background: black;
  border: 1px solid var(--dark-border);
}


.window-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 8px;
  background: var(--light-sidebar-bg);
  z-index: 10000;
}

.user-detail-content {
  position: relative;
  padding: 16px;
  background: var(--light-sidebar-bg);
  transition: all 0.3s ease;
}

.user-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.user-info {
  flex: 1;
}

.user-name-level h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--light-text);
  transition: all 0.3s ease;
}

.user-status {
  margin: 0;
  font-size: 12px;
  color: var(--light-secondary-text);
  transition: all 0.3s ease;
}

.user-actions {
  margin-bottom: 16px;
}

.user-actions .el-button {
  width: 100%;
  justify-content: center;
  gap: 8px;
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.user-actions .el-button:hover {
  background: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
}

.user-details {
  border-top: 1px solid var(--light-border);
  padding-top: 12px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  color: var(--light-secondary-text);
  font-size: 12px;
  transition: all 0.3s ease;
}

.detail-item .value {
  color: var(--light-text);
  font-size: 12px;
  max-width: 200px;
  text-align: right;
  word-break: break-all;
  transition: all 0.3s ease;
}

.group-members {
  border-top: 1px solid var(--light-border);
  padding-top: 12px;
}

.group-members h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: var(--light-secondary-text);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.more-members {
  text-align: center;
  color: var(--light-secondary-text);
  font-size: 12px;
  margin-top: 2px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.member-item:hover {
  background: var(--light-hover);
}

.member-name {
  flex: 1;
  font-size: 12px;
  color: var(--light-text);
  transition: all 0.3s ease;
}

.member-role {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.member-role.owner {
  background-color: var(--danger-color-light);
  color: var(--danger-color);
}

.member-role.admin {
  background-color: var(--success-color-light);
  color: var(--success-color);
}

.member-role.normal {
  background-color: #f4f4f4;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 2px;
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

/* 暗色模式适配 */


/* 调整头像大小 */
:deep(.el-avatar) {
  --el-avatar-size: 48px !important;
}

:deep(.member-item .el-avatar) {
  --el-avatar-size: 24px !important;
}

.online-count {
  font-size: 11px;
  color: #999;
  margin: 0;
  padding: 0;
  line-height: 1.2;
}
.online-count span {
  font-size: 11px;
  color: #999;
}
.popup-footer {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.group-desc-ellipsis {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

/* 当在管理群聊页面中使用时的特殊样式 */
:deep(.manage-group-detail-popup) .user-detail-popup {
  position: absolute;
  transform-origin: left center;
  animation: slideInFromSide 0.3s ease;
  z-index: 3000 !important;
}

/* 确保MacWindowControls在最上层 */
:deep(.mac-window-controls) {
  z-index: 3002 !important;
  position: relative;
}
</style> 

