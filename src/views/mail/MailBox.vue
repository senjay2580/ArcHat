<template>
  <div class="mailbox-container">
    <div class="mailbox-header">
      <h2 style="display: flex; align-items: center; gap: 8px;"><span style="color: wheat;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Gridicons by Automattic - https://github.com/Automattic/gridicons/blob/trunk/LICENSE.md --><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m1 15h-2v-2h2zm0-4h-2l-.5-6h3z"/></svg></span>通知中心</h2>
    </div>
    
    <div class="mailbox-content">
      <!-- 发送的申请 -->
      <div class="mail-section">
        <div class="section-header">
          <div class="section-title">
            <h3>我发送的申请</h3>
          </div>
          <el-tabs v-model="sentActiveTab" class="mail-tabs">
            <el-tab-pane label="好友申请" name="friend">
              <div class="mail-list">
                <template v-if="sentFriendRequests.length > 0">
                  <div v-for="item in sentFriendRequests" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showUserDetail(item)"
                        @mouseleave="hideUserDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-status" :class="getStatusFromCode(item.status)">
                          {{ getStatusText(getStatusFromCode(item.status)) }}
                        </div>
                        <div class="mail-time">{{ formatDate(item.createTime) }}</div>
                      </div>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无发送的好友申请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="sentFriendCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="sentFriendTotal"
                    :pager-count="7"
                    :hide-on-single-page="false"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSentFriendSizeChange"
                    @current-change="handleSentFriendCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="群聊申请" name="group">
              <div class="mail-list">
                <template v-if="sentGroupRequests.length > 0">
                  <div v-for="item in sentGroupRequests" :key="item.id" class="mail-item" @click="() => { if(item.status === 0) handleEditGroupMsg(item) }">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showGroupDetail(item)"
                        @mouseleave="hideGroupDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-status" :class="getStatusFromCode(item.status)">
                          {{ getStatusText(getStatusFromCode(item.status)) }}
                        </div>
                        <div class="mail-time">{{ formatDate(item.time) }}</div>
                      </div>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无发送的群聊申请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="sentGroupCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="sentGroupTotal"
                    :pager-count="7"
                    :hide-on-single-page="false"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSentGroupSizeChange"
                    @current-change="handleSentGroupCurrentChange"
                  />
                </div>
              </div>
              <FullScreenDialog v-model:visible="showEditMsgDialog" title="修改群聊申请留言">
                <div style="padding: 24px;">
                  <div style="margin-bottom: 16px; font-weight: bold;">当前留言：</div>
                  <el-input v-model="editingMsg" type="textarea" :rows="4" placeholder="请输入申请留言..." />
                  <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                    <DangerButton @click="handleCancelEditMsg">取消</DangerButton>
                    <DangerButton type="success" @click="handleSaveGroupMsg">保存并发送</DangerButton>
                  </div>
                </div>
              </FullScreenDialog>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 收到的申请 -->
      <div class="mail-section">
        <div class="section-header">
          <div class="section-title">
            <h3>收到的申请</h3>
          </div>
          <el-tabs v-model="receivedActiveTab" class="mail-tabs">
            <el-tab-pane label="好友申请" name="friend">
              <div class="mail-list">
                <template v-if="receivedFriendRequests.length > 0">
                  <div v-for="item in receivedFriendRequests" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showUserDetail(item)"
                        @mouseleave="hideUserDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-status" :class="getStatusFromCode(item.status)">
                          {{ getStatusText(getStatusFromCode(item.status)) }}
                        </div>
                        <div class="mail-time">{{ formatDate(item.createTime) }}</div>
                      </div>
                    </div>
                    <div class="mail-actions" v-if="getStatusFromCode(item.status) === 'pending'">
                      <DangerButton type="primary" @click="handleRequest(item, 'accept')">
                        接受
                      </DangerButton>
                      <DangerButton type="danger" @click="handleRequest(item, 'reject')">
                        拒绝
                      </DangerButton>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无收到的好友申请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="receivedFriendCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="receivedFriendTotal"
                    :pager-count="7"
                    :hide-on-single-page="false"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleReceivedFriendSizeChange"
                    @current-change="handleReceivedFriendCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="群聊邀请" name="group">
              <div class="mail-list">
                <template v-if="receivedGroupRequests.length > 0">
                  <div v-for="item in currentReceivedGroupPage" :key="item.id" class="mail-item">
                    <div class="mail-item-content">
                      <el-avatar 
                        :size="40" 
                        :src="item.avatar"
                        @mouseenter="showGroupDetail(item)"
                        @mouseleave="hideGroupDetail"
                      />
                      <div class="mail-info">
                        <div class="mail-header">
                          <span class="mail-name">{{ item.name }}</span>
                        </div>
                        <div class="mail-message">{{ item.message }}</div>
                        <div class="mail-time">{{ item.time }}</div>
                      </div>
                    </div>
                    <div class="mail-actions">
                      <DangerButton type="primary" @click="handleRequest(item, 'accept')">
                        接受
                      </DangerButton>
                      <DangerButton type="danger" @click="handleRequest(item, 'reject')">
                        拒绝
                      </DangerButton>
                    </div>
                  </div>
                </template>
                <el-empty v-else description="暂无收到的群聊邀请" />
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="receivedGroupCurrentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]"
                    :total="receivedGroupTotal"
                    :pager-count="7"
                    :hide-on-single-page="false"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleReceivedGroupSizeChange"
                    @current-change="handleReceivedGroupCurrentChange"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <user-detail-popup
      v-model:visible="showUserPop"
      :user="currentUser"
      :position="popupPosition"
      :hide-start-chat="true"
      :hide-add-friend="true"
      @friend-request-sent="handleFriendRequestSent"
    />

    <group-detail-popup
      :visible="showGroupPop"
      :group="currentGroup"
      :position="popupPosition"
      :hide-start-group="true"
      :hide-join-group="true"
    />

    
  </div>
</template>

<script setup>
// #region 导入依赖
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import ArcMessage from '@/utils/ArcMessage';
import { Delete } from '@element-plus/icons-vue';
import UserDetailPopup from '@/components/business/UserDetailPopup.vue';
import GroupDetailPopup from '@/components/business/GroupDetailPopup.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import FullScreenDialog from '@/components/layout/FullScreenDialog.vue';
import { useRouter } from 'vue-router';
import { getMyFriendApplyList, getMyFriendReceiveList, handleFriendApply } from '@/api/friend';
import { getMyGroupApplyList, updateGroupApplyMsg } from '@/api/room';
import { calculateLevel } from '@/utils/exp';
import { useUserInfoStore } from '@/stores/user';
import { formatDate } from '@/utils/time';
import emitter from '@/utils/eventBus';
// #endregion

// #region 基础状态
const router = useRouter();
const sentActiveTab = ref('friend'); // 我发送的Tab选项: friend/group
const receivedActiveTab = ref('friend'); // 我收到的Tab选项: friend/group
// #endregion

// #region 数据存储
// 申请列表数据
const sentFriendRequests = ref([]); // 我发送的好友申请列表
const sentGroupRequests = ref([]); // 我发送的群聊申请列表
const receivedFriendRequests = ref([]); // 我收到的好友申请列表
const receivedGroupRequests = ref([]); // 我收到的群聊申请列表

// 弹窗相关
const showUserPop = ref(false); // 用户详情弹窗显示状态
const showGroupPop = ref(false); // 群聊详情弹窗显示状态
const currentUser = ref(null); // 当前查看的用户信息
const currentGroup = ref(null); // 当前查看的群聊信息
const popupPosition = ref({ x: 0, y: 0 }); // 弹窗位置

// 分页相关
const pageSize = ref(5); // 每页显示数量
const sentFriendCurrentPage = ref(1); // 发送好友申请当前页
const sentGroupCurrentPage = ref(1); // 发送群聊申请当前页
const receivedFriendCurrentPage = ref(1); // 接收好友申请当前页
const receivedGroupCurrentPage = ref(1); // 接收群聊申请当前页

// 总数
const sentFriendTotal = ref(0); // 发送好友申请总数
const sentGroupTotal = ref(0); // 发送群聊申请总数
const receivedFriendTotal = ref(0); // 接收好友申请总数
const receivedGroupTotal = ref(0); // 接收群聊申请总数

// 编辑对话框
const showEditMsgDialog = ref(false); // 编辑消息对话框显示状态
const editingGroupItem = ref(null); // 正在编辑的群聊申请项
const editingMsg = ref(''); // 编辑的消息内容

// 申请处理模型
const applyModel = ref({ // 好友申请处理参数
  friendId: '',
  status: ''
});
// #endregion

// #region 计算属性
const popupStyle = computed(() => ({
  position: 'fixed',
  left: `${popupPosition.value.x}px`,
  top: `${popupPosition.value.y}px`,
  zIndex: 1000
}));
// #endregion

// #region 工具函数
const getStatusText = (status) => {
  const statusMap = {
    pending: '等待处理',
    accepted: '已接受',
    rejected: '已拒绝'
  };
  return statusMap[status] || status;
};

const getStatusFromCode = (code) => {
  const statusMap = {
    0: 'pending',
    1: 'accepted',
    2: 'rejected'
  };
  return statusMap[code] || 'pending';
};
// #endregion


// #region 好友申请处理
const handleRequest = async (item, action) => {
  try {
    if (!item.friendId) {
      ArcMessage.warning('申请人ID不存在');
      return;
    }
    
    applyModel.value.friendId = item.friendId;
    applyModel.value.status = action === 'accept' ? 1 : 2;

    const res = await handleFriendApply(applyModel.value);
    if (res.code === 200) {
      ArcMessage.success(action === 'accept' ? '已接受申请' : '已拒绝申请');
      fetchReceivedFriendRequests();
      emitter.emit('refresh-friend-list');
    } else {
      ArcMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    console.error('处理好友申请失败:', error);
    ArcMessage.error('处理好友申请失败');
  }
};
// #endregion


// #region 弹窗控制
const showUserDetail = (user) => {
  currentUser.value = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    level: user.level, 
    status: user.userStatus,
    createTime: user.createTime
  };
  
  const event = window.event;
  popupPosition.value = {
    x: event.clientX - 350,
    y: event.clientY - 190
  };
  
  showUserPop.value = true;
};

const hideUserDetail = () => {
  showUserPop.value = false;
  currentUser.value = null;
};

const showGroupDetail = (group) => {
  currentGroup.value = {
    name: group.name,
    avatar: group.avatar,
    createTime: group.time
  };
  
  const event = window.event;
  popupPosition.value = {
    x: event.clientX + 10,
    y: event.clientY + 10
  };
  
  showGroupPop.value = true;
};

const hideGroupDetail = () => {
  showGroupPop.value = false;
  currentGroup.value = null;
};
// #endregion


// #region 数据获取
const fetchSentFriendRequests = async () => {
  try {
    const res = await getMyFriendApplyList({
      uid: useUserInfoStore().userInfo.uid,
      page: sentFriendCurrentPage.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      sentFriendRequests.value = res.data.records.map(item => ({
        id: item.id,
        name: item.username,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=U',
        createTime: item.createTime,
        status: item.applyStatus,
        userStatus: item.userStatus,
        level: calculateLevel(item.exep || 0)
      }));
      sentFriendTotal.value = res.data.total;
    }
  } catch (error) {
    console.error('获取好友申请列表失败:', error);
    ArcMessage.error('获取好友申请列表失败');
  }
};

const fetchReceivedFriendRequests = async () => {
  try {
    const res = await getMyFriendReceiveList({
      uid: useUserInfoStore().userInfo.uid,
      page: receivedFriendCurrentPage.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      receivedFriendRequests.value = res.data.records.map(item => ({
        id: item.id,
        name: item.username,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=U',
        friendId: item.friendId,
        createTime: item.createTime,
        status: item.applyStatus,
        userStatus: item.userStatus,
        level: calculateLevel(item.exep || 0)
      }));
      receivedFriendTotal.value = res.data.total;
    }
  } catch (error) {
    console.error('获取收到的好友申请列表失败:', error);
    ArcMessage.error('获取收到的好友申请列表失败');
  }
};

const fetchSentGroupRequests = async () => {
  try {
    const res = await getMyGroupApplyList({
      page: sentGroupCurrentPage.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      sentGroupRequests.value = res.data.records.map(item => ({
        id: item.id,
        roomId: item.roomId,
        name: item.name,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=G',
        msg: item.msg,
        status: item.status,
        time: item.updateTime
      }));
      sentGroupTotal.value = res.data.total;
    }
  } catch (error) {
    console.error('获取群聊申请列表失败:', error);
    ArcMessage.error('获取群聊申请列表失败');
  }
};
// #endregion


// #region 分页处理
const handleSentFriendSizeChange = (val) => {
  pageSize.value = val;
  sentFriendCurrentPage.value = 1;
};

const handleSentFriendCurrentChange = (val) => {
  sentFriendCurrentPage.value = val;
};

const handleSentGroupCurrentChange = (val) => {
  sentGroupCurrentPage.value = val;
};

const handleReceivedFriendCurrentChange = (val) => {
  receivedFriendCurrentPage.value = val;
};

const handleReceivedGroupCurrentChange = (val) => {
  receivedGroupCurrentPage.value = val;
};

const handleSentGroupSizeChange = (val) => {
  pageSize.value = val;
  sentGroupCurrentPage.value = 1;
};

const handleReceivedFriendSizeChange = (val) => {
  pageSize.value = val;
  receivedFriendCurrentPage.value = 1;
};

const handleReceivedGroupSizeChange = (val) => {
  pageSize.value = val;
  receivedGroupCurrentPage.value = 1;
};
// #endregion

// #region 群组编辑
const handleEditGroupMsg = (item) => {
  editingGroupItem.value = item;
  editingMsg.value = item.msg || '';
  showEditMsgDialog.value = true;
};

const handleSaveGroupMsg = async () => {
  if (!editingGroupItem.value) return;
  try {
    const res = await updateGroupApplyMsg({ id: editingGroupItem.value.id, msg: editingMsg.value });
    if (res.code === 200) {
      ArcMessage.success('修改成功');
      showEditMsgDialog.value = false;
      fetchSentGroupRequests();
    } else {
      ArcMessage.error(res.msg || '修改失败');
    }
  } catch (e) {
    ArcMessage.error('修改失败');
  }
};

const handleCancelEditMsg = () => {
  showEditMsgDialog.value = false;
};
// #endregion

// #region 事件处理
const handleFriendRequestSent = () => {
  fetchSentFriendRequests();
};

emitter.on('refresh-mail-data', () => {
  fetchReceivedFriendRequests();
});
// #endregion

// #region 监听器
watch([sentFriendCurrentPage, pageSize], () => {
  fetchSentFriendRequests();
});

watch([sentGroupCurrentPage, pageSize], () => {
  fetchSentGroupRequests();
});

watch([receivedFriendCurrentPage, pageSize], () => {
  fetchReceivedFriendRequests();
});
// #endregion

// #region 生命周期钩子
onMounted(() => {
  fetchSentFriendRequests();
  fetchReceivedFriendRequests();
  fetchSentGroupRequests();
  
  emitter.on('refresh-mail-data', () => {
    fetchSentFriendRequests();
    fetchReceivedFriendRequests();
  });
});

onUnmounted(() => {
  emitter.off('refresh-mail-data');
});
// #endregion
</script>

<style scoped>
.mailbox-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px;
}

.mailbox-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mailbox-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--light-text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.mail-section {
  background: var(--bg-color) !important;
  border-radius: 16px;
  padding: 22px 20px;
  margin-bottom: 24px;
  transition: box-shadow 0.3s cubic-bezier(.4,0,.2,1);
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--light-text);
  margin: 0;
}

.mail-tabs {
  margin-top: 12px;
}

.mail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.mail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: all 1.5s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  box-shadow: 
    5px 5px 15px rgba(0, 0, 0, 0.1),
    -5px -5px 15px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(255, 255, 255, 0.8),
    inset -1px -1px 2px rgba(0, 0, 0, 0.05);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.mail-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transform: skewX(-25deg);
  transition: 1.2s ease;
}

.mail-item:hover::before {
  left: 150%;
}

.mail-item:hover {
  transform: translateY(-2px) rotateX(5deg);
  box-shadow: 
    8px 8px 20px rgba(0, 0, 0, 0.15),
    -8px -8px 20px rgba(255, 255, 255, 0.8),
    inset 1px 1px 2px rgba(255, 255, 255, 0.9),
    inset -1px -1px 2px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transition: all 0.5s ease;
}

.mail-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mail-info {
  flex: 1;
  min-width: 0;
  position: relative;
  padding-right: 8px;
}

.mail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.mail-name {
  font-weight: 600;
  color: var(--light-text);
  font-size: 14px;
}

.mail-time {
  font-size: 12px;
  color: var(--light-secondary-text);
  position: absolute;
  bottom: 0;
  right: 0;
}

.mail-message {
  font-size: 13px;
  color: var(--light-secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 4px 0 20px 0;
}

.mail-status {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 10px;
  display: inline-block;
  margin: 4px 0 20px 0;
}

.mail-status.pending {
  background: #e6f7ff;
  color: #1890ff;
}

.mail-status.accepted {
  background: #f6ffed;
  color: #52c41a;
}

.mail-status.rejected {
  background: #fff1f0;
  color: #f5222d;
}

.mail-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
/* Element UI 组件样式 */
:deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-empty__description) {
  margin-top: 8px;
  color: var(--light-secondary-text);
  font-size: 13px;
}

/* 暗色模式统一适配 */
.dark-mode .mail-section {
  background: var(--dark-sidebar-bg) !important;
}

.dark-mode .mailbox-header h2,
.dark-mode .section-title h3,
.dark-mode .mail-name {
  color: var(--dark-text);
}

.dark-mode .mail-time,
.dark-mode .mail-message {
  color: var(--dark-secondary-text);
}

.dark-mode .mail-item {
  background: linear-gradient(145deg, rgba(40, 40, 40, 0.8), rgba(30, 30, 30, 0.6));
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    5px 5px 15px rgba(0, 0, 0, 0.3),
    -5px -5px 15px rgba(60, 60, 60, 0.3),
    inset 1px 1px 2px rgba(255, 255, 255, 0.1),
    inset -1px -1px 2px rgba(0, 0, 0, 0.2);
}

.dark-mode .mail-item::before {
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
}

.dark-mode .mail-item:hover {
  box-shadow: 
    8px 8px 20px rgba(0, 0, 0, 0.4),
    -8px -8px 20px rgba(60, 60, 60, 0.4),
    inset 1px 1px 2px rgba(255, 255, 255, 0.15),
    inset -1px -1px 2px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark-mode .mail-status.pending {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.dark-mode .mail-status.accepted {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.dark-mode .mail-status.rejected {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.dark-mode :deep(.el-empty__description) {
  color: var(--dark-secondary-text);
}

.el-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.el-avatar:hover {
  transform: scale(1.05);
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

/* 分页样式优化 */
.el-pagination * {
  border: none !important;
  color: black !important;
  background: transparent !important;
}

/* 夜间模式特殊处理 */
.dark-mode .el-pagination,
.dark-mode .el-pagination * {
  background: transparent !important;
  color: white !important;
}
</style> 