<template>
  <div class="personal-center">
   
    <!-- Header - Apple-inspired clean navigation -->
 

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- 第一部分：个人信息 -->
      <div class="content-box profile-section">
        <div class="content-box-header">
          <h2 class="content-box-title">我的信息</h2>
        </div>
        <div class="content-box-body">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div class="avatar-container" style="position:relative;">
              <div class="avatar-upload-icon" @click="showAvatarUploadDialog = true">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Flowbite Icons by Themesberg - https://github.com/themesberg/flowbite-icons/blob/main/LICENSE --><path fill="currentColor" fill-rule="evenodd" d="M12 3a1 1 0 0 1 .78.375l4 5a1 1 0 1 1-1.56 1.25L13 6.85V14a1 1 0 1 1-2 0V6.85L8.78 9.626a1 1 0 1 1-1.56-1.25l4-5A1 1 0 0 1 12 3M9 14v-1H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4v1a3 3 0 1 1-6 0m8 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z" clip-rule="evenodd"/></svg>
              </div>
              <el-image
            :src="userInfo.avatar"
            :preview-src-list="[userInfo.avatar]"
            :initial-index="0"
            fit="cover"
            style="width: 120px; height: 120px; border-radius: 50%;"
          />
             
            </div>
            <div class="profile-info flex-1">
              <div class="name-level">
                <div class="name-section">
                  <h2 class="text-3xl font-bold mb-2">{{userInfo.username}}</h2>
                  <div class="level-badge" :style="getLevelBadgeStyle(userLevel)">
                    Lv.{{ userLevel }}
                  </div>
                  <el-popover
                    v-model:visible="showPopover"
                    placement="top"
                    :width="300"
                    trigger="manual"
                    :popper-class="username-popover"
                  >
                    <template #reference>
                      <UserCog class="edit-icon" @click="handleEditUsername" />
                    </template>
                    <div class="popover-content">
                      <div class="popover-header">
                        <span class="popover-title">修改用户名</span>
                        <el-icon class="close-icon" @click="showPopover = false"><Close /></el-icon>
                      </div>
                      <el-input
                        v-model="editingUsername"
                        placeholder="请输入新用户名"
                        style="height: 45px !important;"
                        @keyup.enter="saveUsername"
                      >
                        <template #append>
                          <el-button @click="saveUsername" style="display: flex;align-items: center;justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg"  width="30"  viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="green" d="m10.6 13.8l-2.15-2.15q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7L9.9 15.9q.3.3.7.3t.7-.3l5.65-5.65q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </el-popover>
                </div>
                
                <div class="logout-container">
                  <button @click="handleLogout" class="Btn">
                    <div class="sign">
                      <svg viewBox="0 0 512 512">
                        <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                      </svg>
                    </div>
                    <div class="text">退出登录</div>
                  </button>
                </div>
              </div>
              <div class="exp-bar">
                <div class="exp-progress" :style="{ width: expPercentage + '%' }"></div>
                <span class="exp-text">{{ currentExp }}/{{ nextLevelExp }} 经验值</span>
              </div>
              <div class="stats-card bg-white rounded-lg p-4 shadow-sm mt-4">
                <div class="stats-content">
                  <div class="stat-item">
                    <div class="stat-value">{{ friendList.length }}</div>
                    <div class="stat-label">好友</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{groupList.length}}</div>
                    <div class="stat-label">群聊</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{userExp}}</div>
                    <div class="stat-label">积分值</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ formatArcAge(userInfo.createTime) }}</div>
                    <div class="stat-label">Arcage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二部分：好友和群聊 -->
      <div class="content-box social-section">
        <div class="content-box-header">
          <h2 class="content-box-title">社交关系</h2>
        </div>
        <div class="content-box-body">
          <!-- 好友部分 -->
          <div class="social-part">
            <div class="part-header">
              <h3 class="part-title">我的好友</h3>
              <el-space wrap :size="20">
                <DangerButton type="gradient-teal" @click="showFriendsDialog = true">
                  <el-icon><Setting /></el-icon>
                  管理好友
                </DangerButton>
                <DangerButton type="gradient-green" @click="handleShowSearchDialog('friend')">
                  <el-icon><Plus /></el-icon>
                  添加好友
                </DangerButton>
              </el-space>
            </div>
            <div class="friends-list" v-if="friends.length > 0">
              <div class="friends-avatars">
                <el-avatar v-for="friend in friends" :key="friend.id" :size="40" :src="friend.avatar" />
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无好友" :image-size="120">
                <template #description>
                  <p class="empty-text">还没有好友，快去添加吧</p>
                </template>
                <DangerButton type="primary" @click="handleShowSearchDialog('friend')">
                  <el-icon><Plus /></el-icon>
                  添加好友
                </DangerButton>
              </el-empty>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="divider"></div>

          <!-- 群聊部分 -->
          <div class="social-part">
            <div class="part-header">
              <h3 class="part-title">我的群聊</h3>
              <el-space wrap :size="20">
                <DangerButton type="gradient-teal" @click="showManageGroupsDialog = true">
                  <el-icon><Setting /></el-icon>
                  管理群聊
                </DangerButton>
                <DangerButton type="gradient-green" @click="handleShowSearchDialog('group')">
                  <el-icon><Plus /></el-icon>
                  添加群聊
                </DangerButton>
               
              </el-space>
            </div>
            <div class="groups-grid" v-if="groups.length > 0">
              <div v-for="group in groups" :key="group.id" class="group-card" @click="handleGroupClick(group, $event)">
                <div class="group-avatar">
                  <el-avatar :size="60" :src="group.avatar" />
                </div>
                <div class="group-info">
                  <h4 class="group-name">{{ group.name }}</h4>
                </div>
                <div class="group-more-btn" @click.stop="handleGroupMoreClick(group, $event)">
                  <el-icon><MoreFilled /></el-icon>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="暂无群聊" :image-size="120">
                <template #description>
                  <p class="empty-text">还没有加入任何群聊</p>
                </template>
                <DangerButton type="primary" @click="handleShowSearchDialog('group')">
                  <el-icon><Plus /></el-icon>
                  添加群聊
                </DangerButton>
              </el-empty>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三部分：账号设置 -->
      <div class="content-box settings-section">
        <div class="content-box-header">
          <h2 class="content-box-title">账号设置</h2>
        </div>
        <div class="content-box-body">
          <el-form :model="settingsForm" label-width="100px" @submit.prevent>
            <el-form-item label="原密码">
              <el-input v-model="settingsForm.oldPassword" type="password" placeholder="请输入原密码" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="settingsForm.newPassword" type="password" placeholder="请输入新密码" />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="settingsForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
            </el-form-item>
            <el-form-item>
              <DangerButton type="warning" @click="saveSettings">保存修改</DangerButton>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 第四部分：数据统计 -->
      <UserDataVisualization :user-id="userInfo.username" :friend-list="friendList" />

      <!-- 好友管理弹窗 -->
      <FullScreenDialog v-model:visible="showFriendsDialog" title="好友管理">
        <div class="friends-dialog-content">
          <div class="search-section">
            <el-input
              v-model="friendSearchQuery"
              placeholder="搜索好友"
              class="search-input"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
            <DangerButton type="primary" @click="handleShowSearchDialog('friend')">
              <el-icon><Plus /></el-icon>
              添加好友
            </DangerButton>
          </div>
          <div class="friends-list-container">
            <div
              v-for="friend in filteredFriends"
              :key="friend.id"
              class="friend-item"
              @dblclick="handleChat(friend)"
            >
              <div class="friend-info">
                <el-avatar :size="40" :src="friend.avatar" />
                <div class="friend-details">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-status" :style="getStatusStyle(friend.status)">
                    {{ friend.status ? '在线' : '离线' }}
                  </span>
                </div>
              </div>
              <div class="friend-actions">
                <DangerButton type="primary" @click.stop="(e) => handleView(friend, e)">
                  <el-icon><View /></el-icon>
                </DangerButton>
                <DangerButton type="danger" @click="handleDelete(friend)">
                  <el-icon><Delete /></el-icon>
                </DangerButton>
              </div>
            </div>
          </div>
        </div>
      </FullScreenDialog>

      <!-- 用户详情弹窗 -->
      <user-detail-popup
        v-model:visible="showUserDetail"
        :user="selectedUser"
        :position="userDetailPosition"
        @friend-request-sent="handleFriendRequestSent"
        @start-chat="handleStartChat"
      />

      <!-- 群聊简要信息弹窗 -->
      <group-detail-popup
        v-model:visible="showGroupDetail"
        :group="selectedGroup"
        :position="groupDetailPosition"
        @group-more="handleGroupMoreClick"
      />

      <!-- 在模板中替换原有的搜索弹窗 -->
      <SearchDialog
        v-model:visible="showSearchDialog"
        :initial-type="searchType"
      />



      <!-- 管理群聊全屏弹窗 -->
      <FullScreenDialog v-model:visible="showManageGroupsDialog" title="管理群聊">
        <el-tabs v-model="manageGroupsTab" class="manage-groups-tabs">
          <el-tab-pane name="groups">
            <template #label>
              <span class="custom-tab-icon"><component :is="ManageIcon" /></span>
            </template>
            <div class="manage-groups-content">
              <div class="manage-groups-grid">
                <div v-for="group in pagedGroups" :key="group.id" class="manage-group-card" @click="handleManageGroupCardClick(group, $event)">
                  <el-avatar :size="60" :src="group.avatar" />
                  <div class="manage-group-info">
                    <h4 class="group-name">{{ group.name }}</h4>
                  </div>
                </div>
              </div>
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="groupsPage"
                  v-model:page-size="groupsPageSize"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="groups.length"
                  layout="total, sizes, prev, pager, next"
                  @size-change="val => { groupsPageSize = val; groupsPage = 1; }"
                  @current-change="val => groupsPage = val"
                />
              </div>
              <!-- 管理群聊弹窗专用的群聊简要信息弹窗 -->
              <group-detail-popup
                v-if="showManageGroupDetailPopup"
                v-model:visible="showManageGroupDetailPopup"
                :group="selectedManageGroup"
                :position="manageGroupDetailPosition"
                :hide-start-group="true"
                @group-more="handleManageGroupMoreClick"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane name="requests">
            <template #label>
              <span class="custom-tab-icon"><component :is="RequestIcon" /></span>
            </template>
            <div class="manage-groups-content">
              <!-- 美化后的筛选区域 -->
              <div class="filter-section">
                <el-select
                  v-model="filterGroupId"
                  placeholder="选择群聊"
                  clearable
                  style="width:140px"
                  filterable
                >
                  <el-option
                    v-for="g in groups"
                    :key="g.id"
                    :label="g.name"
                    :value="g.id"
                  />
                </el-select>
                <el-date-picker
                  v-model="filterDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始"
                  end-placeholder="结束"
                  style="width:220px"
                  value-format="YYYY-MM-DD"
                  clearable
                />
              </div>
              <div class="group-requests-list">
                <div v-if="pagedRequests.length === 0" class="empty-requests">暂无入群申请</div>
                <div v-for="req in pagedRequests" :key="req.id" class="group-request-item">
                  <el-avatar :size="40" :src="req.avatar" />
                  <div class="request-info">
                    <div class="request-user"><b>{{ req.username }}</b></div>
                    <div class="request-group">
                      申请加入：<span class="group-name-link">{{ req.groupName }}</span>
                    </div>
                  </div>
                  <div class="request-meta">
                    <div class="request-msg-glass" v-if="req.msg">{{ req.msg }}</div>
                    <div class="request-time-blue">{{ formatDateTime(req.time) }}</div>
                  </div>
                  <div class="request-actions">
                    <DangerButton
                      v-if="req.status === 0"
                      type="primary"
                      size="small"
                      :loading="requestLoadingMap[req.id]"
                      @click="() => handleRequestAction(req, 1)"
                    >
                      同意
                    </DangerButton>
                    <DangerButton
                      v-if="req.status === 0"
                      type="warning"
                      size="small"
                      :loading="requestLoadingMap[req.id]"
                      @click="() => handleRequestAction(req, 2)"
                    >
                      拒绝
                    </DangerButton>
                    <DangerButton
                      v-if="req.status === 1"
                      type="success"
                      size="small"
                      disabled
                      style="cursor:default"
                    >
                      已同意
                    </DangerButton>
                    <DangerButton
                      v-if="req.status === 2"
                      type="danger"
                      size="small"
                      disabled
                      style="cursor:default"
                    >
                      已拒绝
                    </DangerButton>
                  </div>
                </div>
              </div>
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="requestsPage"
                  v-model:page-size="requestsPageSize"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="requestsTotal"
                  layout="total, sizes, prev, pager, next"
                  @size-change="val => { requestsPageSize.value = val; requestsPage.value = 1; }"
                  @current-change="val => requestsPage.value = val"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </FullScreenDialog>

      <!-- 头像上传弹窗 -->
      <FullScreenDialog v-model:visible="showAvatarUploadDialog" title="上传头像">
        <div class="avatar-upload-dialog-content">
          <div class="avatar-upload-drop" 
               @dragover.prevent 
               @drop.prevent="handleDropAvatar"
               @click="avatarInputRef.click()">
            <input type="file" accept="image/*" ref="avatarInputRef" style="display:none" @change="handleAvatarFileChange" />
            <div v-if="avatarPreview" class="avatar-preview-container">
              <img :src="avatarPreview" class="avatar-preview-img" />
             
            </div>
            <div v-else class="avatar-upload-tip">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#409EFF"/>
              </svg>
              <p>拖拽图片到此处或点击选择图片</p>
            </div>
          </div>
          <div class="avatar-upload-actions">
            <DangerButton type="danger" @click="cancelAvatarUpload" :disabled="!avatarFile">
              取消选择
            </DangerButton>
            <DangerButton type="primary" :loading="avatarUploading" :disabled="!avatarFile" @click="handleAvatarUpload">
              上传头像
            </DangerButton>
          </div>
        </div>
      </FullScreenDialog>

      <ExpDialog v-model:visible="showExpDialog" title="头像上传成功！" />
      
      <!-- 群聊详情抽屉 -->
      <GroupDetailDrawer 
        v-model:visible="showGroupDrawer"
        :group="selectedGroupForDrawer"
      />

      <!-- 退出登录确认弹窗 -->
      <div v-if="showLogoutConfirm" class="logout-overlay" @click="cancelLogout">
        <WorningTips 
          title="退出登录"
          message="确定要退出系统吗？退出后需要重新登录。"
          confirm-text="退出"
          cancel-text="取消"
          icon-bg-color="#fef2f2"
          icon-color="#ef4444"
          confirm-button-color="#ef4444"
          :width="'350px'"
          @confirm="confirmLogout"
          @cancel="cancelLogout"
        />
      </div>

      <!-- 保存设置确认弹窗 -->
      <div v-if="showSaveConfirm" class="logout-overlay" @click="cancelSaveSettings">
        <WorningTips 
          title="确认修改密码"
          message="确定要修改密码吗？修改成功后需要重新登录。"
          confirm-text="确认修改"
          cancel-text="取消"
          icon-bg-color="#f0f9ff"
          icon-color="#3b82f6"
          confirm-button-color="#3b82f6"
          width="350px"
          @confirm="confirmSaveSettings"
          @cancel="cancelSaveSettings"
        />
      </div>

      <!-- 成功提示弹窗 -->
      <div v-if="showSuccessTips" class="logout-overlay">
        <SuccessTips 
          title="密码修改成功"
          message="您的密码已成功修改，即将跳转到登录页面..."
          @close="closeSuccessTips"
        />
      </div>
    </main>


 
  </div>
</template>

<script setup>
// #region 导入依赖
import { ref, computed, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { SwitchButton, Close, Delete, Search, Plus, Check, Folder, UserFilled, View, MoreFilled, Setting } from '@element-plus/icons-vue';
import { UserCog } from 'lucide-vue-next';

import UserDetailPopup from '@/components/business/UserDetailPopup.vue';
import GroupDetailPopup from '@/components/business/GroupDetailPopup.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import FullScreenDialog from '@/components/layout/FullScreenDialog.vue';
import SearchDialog from '@/components/business/SearchDialog.vue';
import UserDataVisualization from '@/components/business/UserDataVisualization.vue';
import ExpDialog from '@/components/feedback/ExpDialog.vue';
import GroupDetailDrawer from '@/components/business/GroupDetailDrawer.vue';
import WorningTips from '@/components/feedback/WorningTips.vue';
import SuccessTips from '@/components/feedback/SuccessTips.vue';

import { logoutService, modifyPwdService, modifyUsernameService, modifyAvatarService } from '@/api/user';
import { deleteFriend } from '@/api/friend';
import { getGroupDetail, getGroupMemberCount, listGroupMember, getOtherJoinGroupApplyList, handleGroupJoinApply } from '@/api/room';

import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';

import { calculateLevel, calculateExpProgress, getLevelBadgeStyle as getExpLevelBadgeStyle, getStatusStyle } from '@/utils/exp';
import { formatDateTime } from '@/utils/time';
import { uploadImageFile } from '@/utils/fileHandler';
import emitter from '@/utils/eventBus';
// #endregion

// #region 基础状态
const router = useRouter();
const userInfoStore = useUserInfoStore();
const contactStore = useContactStore();
const userInfo = computed(() => userInfoStore.userInfo);
// #endregion

// #region 数据存储
// 对话框显示状态
const showFriendsDialog = ref(false); // 好友列表对话框
const showAvatarUploadDialog = ref(false); // 头像上传对话框
const showGroupDrawer = ref(false); // 群聊抽屉
const showLogoutConfirm = ref(false); // 退出登录确认对话框
const showSaveConfirm = ref(false); // 保存设置确认对话框
const showSuccessTips = ref(false); // 成功提示显示状态
const showPopover = ref(false); // 用户名编辑弹窗显示状态
const showAddFriendDialog = ref(false); // 添加好友对话框
const showSearchDialog = ref(false); // 搜索对话框
const showManageGroupsDialog = ref(false); // 管理群聊对话框
const showManageGroupDetailPopup = ref(false); // 管理群聊详情弹窗
const showExpDialog = ref(false); // 经验值对话框

// 输入和编辑
const friendSearchQuery = ref(''); // 好友搜索关键词
const editingUsername = ref(''); // 正在编辑的用户名

// 表单数据
const settingsForm = ref({ // 设置表单
  oldPassword: '', // 旧密码
  newPassword: '', // 新密码
  confirmPassword: '' // 确认密码
});

const groupForm = ref({ // 群聊表单
  name: '', // 群名
  avatar: '', // 群头像
  announcement: '' // 群公告
});

// 选中的数据
const selectedGroupForDrawer = ref(null); // 抽屉中选中的群聊
const selectedManageGroup = ref(null); // 管理页面选中的群聊

const props = defineProps({
  friendList: {
    type: Array,
    default: () => []
  },
  groupList: {
    type: Array,
    default: () => []
  }
});

// 用户详情弹窗
const showUserDetail = ref(false); // 用户详情弹窗显示状态
const selectedUser = ref({ // 选中的用户信息
  id: '',
  name: '',
  avatar: '',
  level: '',
  status: '',
  createTime: '',
});
const userDetailPosition = ref({ x: 0, y: 0 }); // 用户详情弹窗位置

// 群聊详情弹窗
const showGroupDetail = ref(false); // 群聊详情弹窗显示状态
const selectedGroup = ref({ // 选中的群聊信息
  id: '',
  name: '',
  avatar: '',
  memberCount: 0,
  createTime: '',
  owner: '',
  announcement: '',
  members: []
});
const groupDetailPosition = ref({ x: 0, y: 0 }); // 群聊详情弹窗位置

// 搜索相关
const searchResults = ref([]); // 搜索结果列表
const searchType = ref('friend'); // 搜索类型
const activeTab = ref('friends'); // 活动标签页

// 群聊管理相关
const manageGroupsTab = ref('groups'); // 管理群聊标签页
const manageGroupDetailPosition = ref({ x: 0, y: 0 }); // 管理群聊详情弹窗位置

// 分页数据
const groupsPage = ref(1); // 群聊列表当前页
const groupsPageSize = ref(5); // 群聊列表每页数量
const requestsPage = ref(1); // 申请列表当前页
const requestsPageSize = ref(5); // 申请列表每页数量
const requestsTotal = ref(0); // 申请列表总数
const groupJoinRequests = ref([]); // 群聊加入申请列表
const filterGroupId = ref(''); // 筛选群聊ID
const filterDateRange = ref([]); // 筛选日期范围
const requestLoadingMap = ref({}); // 申请加载状态Map

// 头像上传相关
const avatarInputRef = ref(null); // 头像上传input引用
const avatarFile = ref(null); // 头像文件
const avatarPreview = ref(''); // 头像预览URL
const avatarUploading = ref(false); // 头像上传中状态
// #endregion

// #region 计算属性
/**
 * 用户经验值
 */
const userExp = computed(() => userInfo.value.exp);

/**
 * 用户等级
 */
const userLevel = computed(() => calculateLevel(userExp.value));

/**
 * 当前等级经验值进度
 */
const { currentExp, nextLevelExp, percentage: expPercentage } = computed(() => 
  calculateExpProgress(userExp.value, userLevel.value)
).value;

/**
 * 格式化后的好友列表
 */
const friends = computed(() => props.friendList.map(friend => ({
  id: friend.id,
  name: friend.username,
  avatar: friend.avatar,
  status: friend.status,
  createTime: friend.createTime,
  level: calculateLevel(friend.exp || 0)
})));

/**
 * 格式化后的群聊列表
 */
const groups = computed(() => props.groupList.map(group => ({
  id: group.roomId,
  name: group.name,
  avatar: group.avatar,
  memberCount: group.memberCount || 0,
  createTime: group.createTime || '',
  owner: group.owner || '',
  announcement: group.groupDesc || '',
  members: group.members || []
})));

/**
 * 过滤后的好友列表
 */
const filteredFriends = computed(() => {
  if (!friendSearchQuery.value) return friends.value;
  return friends.value.filter(friend => 
    friend.name.toLowerCase().includes(friendSearchQuery.value.toLowerCase())
  );
});

/**
 * 分页后的群聊列表
 */
const pagedGroups = computed(() => {
  const start = (groupsPage.value - 1) * groupsPageSize.value;
  return groups.value ? groups.value.slice(start, start + groupsPageSize.value) : [];
});

/**
 * 分页并过滤后的群聊加入申请列表
 */
const pagedRequests = computed(() => {
  let filtered = groupJoinRequests.value;
  if (filterGroupId.value) {
    filtered = filtered.filter(req => req.roomId == filterGroupId.value);
  }
  if (filterDateRange.value && filterDateRange.value.length === 2) {
    const [start, end] = filterDateRange.value;
    filtered = filtered.filter(req => {
      const t = req.time ? req.time.slice(0, 10) : '';
      return t >= start && t <= end;
    });
  }
  return filtered;
});
// #endregion

// #region 工具函数
/**
 * 获取等级徽章样式
 * @param {number} level - 等级
 * @returns {Object} 样式对象
 */
const getLevelBadgeStyle = (level) => {
  return {
    ...getExpLevelBadgeStyle(level),
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  };
};
// #endregion

// #region 用户名编辑
/**
 * 处理编辑用户名按钮点击
 */
const handleEditUsername = () => {
  editingUsername.value = userInfo.value.username;
  showPopover.value = true;
};

/**
 * 保存用户名修改
 */
const saveUsername = async () => {
  if(editingUsername.value === '') {
    ElMessage.warning('用户名不能为空');
    return;
  }
  if(editingUsername.value === userInfo.value.username) {
    ElMessage.warning('用户名不能与原用户名相同');
    return;
  }
  if(editingUsername.value.length < 5 || editingUsername.value.length > 20) {
    ElMessage.warning('用户名长度必须在5-20个字符之间');
    return;
  }
  if(!/^[a-zA-Z0-9]+$/.test(editingUsername.value)) {
    ElMessage.warning('用户名只能包含字母和数字');
    return;
  }

  try {
    const res = await modifyUsernameService({ username: editingUsername.value });
    if (res.code === 200) {
      userInfoStore.setUserInfo({ ...userInfo.value, username: editingUsername.value });
      ElMessage.success('用户名修改成功');
      showPopover.value = false;
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改用户名失败:', error);
    ElMessage.error('修改失败，请稍后重试');
  }
};
// #endregion

// #region 密码修改
/**
 * 保存设置（显示确认对话框）
 */
const saveSettings = () => {
  if (!settingsForm.value.oldPassword || !settingsForm.value.newPassword) {
    ElMessage.warning('请填写完整的密码信息');
    return;
  }
  showSaveConfirm.value = true;
};

/**
 * 确认保存设置
 */
const confirmSaveSettings = async () => {
  try {
    const res = await modifyPwdService({
      oldPassword: settingsForm.value.oldPassword,
      newPassword: settingsForm.value.newPassword,
      rePassword: settingsForm.value.confirmPassword
    });
    
    if (res.code === 200) {
      showSaveConfirm.value = false;
      showSuccessTips.value = true;
      
      // 3秒后自动关闭成功提示并跳转
      setTimeout(() => {
        showSuccessTips.value = false;
        settingsForm.value.oldPassword = '';
        settingsForm.value.newPassword = '';
        settingsForm.value.confirmPassword = '';
        userInfoStore.removeUserInfo();
        router.push('/login');
      }, 3000);
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error('修改失败，请稍后重试');
  }
  showSaveConfirm.value = false;
};

/**
 * 取消保存设置
 */
const cancelSaveSettings = () => {
  showSaveConfirm.value = false;
};

/**
 * 关闭成功提示
 */
const closeSuccessTips = () => {
  showSuccessTips.value = false;
  settingsForm.value.oldPassword = '';
  settingsForm.value.newPassword = '';
  settingsForm.value.confirmPassword = '';
  userInfoStore.removeUserInfo();
  router.push('/login');
};
// #endregion

// #region 好友管理
/**
 * 查看好友详情
 * @param {Object} friend - 好友对象
 * @param {Event} event - 点击事件
 */
const handleView = (friend, event) => {
  selectedUser.value = {
    ...friend,
    isFriend: true, // 标记为已经是好友
  };
  
  // 获取窗口尺寸
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 计算弹窗位置，固定在屏幕三分之一处
  userDetailPosition.value = {
    x: windowWidth / 7,  // 屏幕宽度的三分之一
    y: windowHeight / 3  // 屏幕高度的三分之一
  };
  
  showUserDetail.value = true;
};

/**
 * 删除好友
 * @param {Object} friend - 好友对象
 */
const handleDelete = async (friend) => {
  try {
    const res = await deleteFriend(friend.id);
    if (res.code === 200) {
      ElMessage.success('删除好友成功');
      contactStore.removeContact(friend.id);
      emitter.emit('refresh-friend-contact-list');
      emitter.emit('refresh-friend-list');
    } else {
      ElMessage.error(res.msg || '删除好友失败');
    }
  } catch (error) {
    console.error('删除好友失败:', error);
    ElMessage.error('删除好友失败');
  }
};
// #endregion

// #region 群聊管理
/**
 * 处理群聊卡片点击
 * @param {Object} group - 群聊对象
 * @param {Event} event - 点击事件
 */
const handleGroupClick = async (group, event) => {
  const rect = event.target.getBoundingClientRect();
  groupDetailPosition.value = {
    x: rect.left - 180,
    y: rect.top - 270
  };

  let detail = {};
  let memberCount = 0;
  try {
    const [detailRes, countRes] = await Promise.all([
      getGroupDetail(group.id),
      getGroupMemberCount(group.id)
    ]);
    if (detailRes.code === 200 && detailRes.data) {
      detail = detailRes.data;
    }
    if (countRes.code === 200 && typeof countRes.data === 'number') {
      memberCount = countRes.data;
    }
  } catch (e) {
    // ignore
  }

  selectedGroup.value = {
    ...group,
    ...detail,
    createTime: detail.createTime || group.createTime || '',
    owner: detail.owner || group.owner || '',
    announcement: detail.groupDesc || group.announcement || '暂无公告…',
    memberCount
  };

  showGroupDetail.value = true;
};

/**
 * 处理群聊 more按钮点击，打开群聊详情抽屉
 * @param {Object} group - 群聊对象
 * @param {Event} event - 点击事件
 */
const handleGroupMoreClick = async (group, event) => {

  let detail = {};
  let memberCount = 0;
  let members = [];
  try {
    const [detailRes, countRes, membersRes] = await Promise.all([
      getGroupDetail(group.id),
      getGroupMemberCount(group.id),
      listGroupMember(group.id, { page: 1, pageSize: 7 })
    ]);
    if (detailRes.code === 200 && detailRes.data) {
      detail = detailRes.data;
    }
    if (countRes.code === 200 && typeof countRes.data === 'number') {
      memberCount = countRes.data;
    }
    if (membersRes.code === 200 && membersRes.data && membersRes.data.records) {
      members = membersRes.data.records;
    }
  } catch (e) {
    // ignore
  }

  selectedGroupForDrawer.value = {
    ...group,
    ...detail,
    createTime: detail.createTime || group.createTime || '',
    owner: detail.owner || group.owner || '',
    announcement: detail.groupDesc || group.announcement || '暂无公告…',
    memberCount,
    members
  };

  showGroupDrawer.value = true;
};
// #endregion

// #region 退出登录
/**
 * 处理退出登录按钮点击
 */
const handleLogout = () => {
  showLogoutConfirm.value = true;
};

/**
 * 确认退出登录
 */
const confirmLogout = async () => {
  try {
    const token = userInfo.value.token;
    const res = await logoutService(token);
    
    if (res.code === 200) {
      userInfoStore.removeUserInfo(); // 这里会清空token并断开WebSocket
      router.push('/login');
      ElMessage.success('退出成功');
    } else {
      ElMessage.error(res.msg || '退出失败');
    }
  } catch (error) {
    console.error('退出登录失败:', error);
    ElMessage.error('退出失败，请稍后重试');
  }
  showLogoutConfirm.value = false;
};

/**
 * 取消退出登录
 */
const cancelLogout = () => {
  showLogoutConfirm.value = false;
};
// #endregion

// #region 搜索和好友相关
/**
 * 获取好友列表
 */
const fetchFriendList = async () => {
  // TODO: 实现获取好友列表的逻辑
};

/**
 * 显示搜索对话框
 * @param {string} type - 搜索类型: 'friend' | 'group'
 */
const handleShowSearchDialog = (type) => {
  searchType.value = type;
  showSearchDialog.value = true;
};

/**
 * 处理好友请求发送事件
 */
const handleFriendRequestSent = () => {
  // 刷新好友列表
  fetchFriendList();
};

/**
 * 处理开始聊天
 * @param {Object} user - 用户对象
 */
const handleStartChat = (user) => {
  // 先关闭好友管理弹窗
  showFriendsDialog.value = false;
  
  // 直接跳转到聊天界面
  router.push(`/chat/${user.id}`);
};
// #endregion

// #region 自定义图标组件
const ManageIcon = {
  name: 'ManageIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24', height: '24', viewBox: '0 0 16 16',
      style: 'display:block;'
    }, [
      h('path', { fill: 'currentColor', d: 'M8 0C3.582 0 0 1.119 0 2.5v2C0 5.881 3.582 7 8 7s8-1.119 8-2.5v-2C16 1.119 12.418 0 8 0' }),
      h('path', { fill: 'currentColor', d: 'M8 8.5C3.582 8.5 0 7.381 0 6v3c0 1.381 3.582 2.5 8 2.5s8-1.119 8-2.5V6c0 1.381-3.582 2.5-8 2.5' }),
      h('path', { fill: 'currentColor', d: 'M8 13c-4.418 0-8-1.119-8-2.5v3C0 14.881 3.582 16 8 16s8-1.119 8-2.5v-3c0 1.381-3.582 2.5-8 2.5' })
    ]);
  }
};
const RequestIcon = {
  name: 'RequestIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24', height: '24', viewBox: '0 0 16 16',
      style: 'display:block;'
    }, [
      h('path', { fill: 'currentColor', d: 'M6 8H1V6h5V4l3 3l-3 3zm10-8v13l-6 3v-3H4V9h1v3h5V3l4-2H5v4H4V0z' })
    ]);
  }
};
// #endregion

// #region 群聊加入申请管理
/**
 * 获取群聊加入申请列表
 */
const fetchGroupJoinRequests = async () => {
  try {
    const res = await getOtherJoinGroupApplyList({
      page: requestsPage.value,
      pageSize: requestsPageSize.value
    });
    if (res.code === 200) {
      groupJoinRequests.value = res.data.records.map(item => ({
        id: item.id,
        uid: item.uid,
        username: item.username,
        avatar: item.avatar || 'https://placeholder.svg?height=40&width=40&text=U',
        msg: item.msg,
        roomId: item.roomId,
        groupName: item.name,
        time: item.updateTime,
        status: item.status // 新增 status 字段
      }));
      requestsTotal.value = res.data.total;
    }
  } catch (e) {
    groupJoinRequests.value = [];
    requestsTotal.value = 0;
  }
};

/**
 * 处理管理群聊卡片点击
 * @param {Object} group - 群聊对象
 * @param {Event} event - 点击事件
 */
const handleManageGroupCardClick = async (group, event) => {
  // 获取点击元素的位置
  const rect = event.currentTarget.getBoundingClientRect();
  manageGroupDetailPosition.value = {
    x: rect.right + 20,
    y: rect.top
  };
  if (manageGroupDetailPosition.value.x + 280 > window.innerWidth) {
    manageGroupDetailPosition.value.x = rect.left - 300;
  }
  if (manageGroupDetailPosition.value.y + 500 > window.innerHeight) {
    manageGroupDetailPosition.value.y = window.innerHeight - 520;
  }
  let detail = {};
  let memberCount = 0;
  try {
    const [detailRes, countRes] = await Promise.all([
      getGroupDetail(group.id),
      getGroupMemberCount(group.id)
    ]);
    if (detailRes.code === 200 && detailRes.data) {
      detail = detailRes.data;
    }
    if (countRes.code === 200 && typeof countRes.data === 'number') {
      memberCount = countRes.data;
    }
  } catch (e) {}
  selectedManageGroup.value = {
    ...group,
    ...detail,
    memberCount,
    createTime: detail.createTime || group.createTime || ''
  };
  showManageGroupDetailPopup.value = true;
};

// 新增：管理群聊弹窗中群聊简要信息弹窗的more按钮
const handleManageGroupMoreClick = (group) => {
  selectedGroupForDrawer.value = group;
  showGroupDrawer.value = true;
};

const handleRequestAction = async (req, status) => {
  console.log(req, status);
  if (requestLoadingMap.value[req.id]) return;
  requestLoadingMap.value = { ...requestLoadingMap.value, [req.id]: true };
  try {
    await handleGroupJoinApply({ id: req.id, status });
    ElMessage.success(status === 1 ? '已同意' : '已拒绝');
    await fetchGroupJoinRequests();
  } catch (e) {
    ElMessage.error('操作失败');
  } finally {
    requestLoadingMap.value = { ...requestLoadingMap.value, [req.id]: false };
  }
};

watch([requestsPage, requestsPageSize], fetchGroupJoinRequests);
// #endregion

// #region 头像上传
function handleDropAvatar(e) {
  const file = e.dataTransfer.files[0];
  if (file) setAvatarFile(file);
}
function handleAvatarFileChange(e) {
  const file = e.target.files[0];
  if (file) setAvatarFile(file);
}
function setAvatarFile(file) {
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
}
function cancelAvatarUpload() {
  avatarFile.value = null;
  avatarPreview.value = '';
}
async function handleAvatarUpload() {
  if (!avatarFile.value) return;
  avatarUploading.value = true;
  try {
    const res = await uploadImageFile(avatarFile.value);
    // 新增：上传图片后，调用后端API修改头像
    const avatarUrl = res.data;
    const updateRes = await modifyAvatarService(avatarUrl);
    if (updateRes.code === 200) {
      // 实时更新pinia userInfo中的avatar
      userInfoStore.setUserInfo({ ...userInfo.value, avatar: avatarUrl });
      showExpDialog.value = true;
      // 关闭弹窗，重置状态
      showAvatarUploadDialog.value = false;
      avatarFile.value = null;
      avatarPreview.value = '';
      // 3秒后自动关闭ExpDialog
      setTimeout(() => {
        showExpDialog.value = false;
      }, 1000);
    } else {
      throw new Error(updateRes.msg || '头像修改失败');
    }
  } catch (err) {
    ElMessage.error('上传失败');
    console.error(err);
  } finally {
    avatarUploading.value = false;
  }
}
// #endregion

// #region 工具函数
function formatArcAge(createTime) {
  if (!createTime) return ''
  const now = new Date()
  const created = new Date(createTime)
  const diffMs = now - created
  if (isNaN(diffMs) || diffMs < 0) return ''
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return '今天'
  if (diffDays < 365) return diffDays + '天'
  const years = Math.floor(diffDays / 365)
  const leftDays = diffDays % 365
  return years + '年' + (leftDays > 0 ? leftDays + '天' : '')
}
// #endregion

// #region 生命周期钩子
onMounted(() => {
  fetchGroupJoinRequests();
});
// #endregion
</script>

<style scoped>
@import '/src/assets/styles/level.css';

/* CSS变量 - 统一管理重复样式 */
:root {
  --transition-ease: all 0.3s ease;
  --box-shadow-light: 0 2px 12px rgba(0, 0, 0, 0.1);
  --box-shadow-hover: 0 4px 24px rgba(64, 158, 255, 0.18);
  --box-shadow-dark: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.personal-center {
  padding: 0 8%;
  background-color: #f5f7fa;
  min-height: 100vh;
  transition: var(--transition-ease);
}

.stats-card .stats-content {
  display: flex;
  justify-content: space-between;
}

.stats-card .stat-item {
  text-align: center;
  padding: 0 10px;
}

.stats-card .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d43f09;
  transition: var(--transition-ease);
}

.stats-card .stat-label {
  font-size: 0.875rem;
  color: #020100;
  transition: var(--transition-ease);
}

.friends-list {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--box-shadow-light);
}

.friends-avatars {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.group-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: var(--box-shadow-light);
  transition: var(--transition-ease);
  position: relative;
}

.group-card:hover {
  transform: translateY(-5px);
}

.group-info {
  text-align: center;
}

.group-name {
  font-weight: 600;
  margin-bottom: 4px;
  transition: var(--transition-ease);
}

.group-more-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-ease);
  opacity: 0;
  transform: scale(0.8);
}

.group-card:hover .group-more-btn {
  opacity: 1;
  transform: scale(1);
}

.group-more-btn:hover {
  background: rgba(0,0,0,0.1);
  transform: scale(1.1);
}

.group-more-btn .el-icon {
  color: #409eff;
  font-size: 16px;
}

.name-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.exp-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 4px;
  transition: var(--transition-ease);
}

.exp-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 12px;
  color: #909399;
  transition: var(--transition-ease);
}

.friends-dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.friends-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
  margin-top: 8px;
}

.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--light-bg);
  transition: var(--transition-ease);
  border: 1px solid var(--light-border);
}

.friend-item:hover {
  background-color: var(--light-hover);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-light);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.friend-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.friend-name {
  font-weight: 500;
  color: var(--light-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: var(--transition-ease);
}

.friend-status {
  font-size: 12px;
  color: var(--light-secondary-text);
  transition: var(--transition-ease);
}

.friend-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.search-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-section .search-input {
  flex: 1;
  margin: 5px 1px;
}

.search-section .el-button {
  white-space: nowrap;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 0;
}

.empty-state :deep(.el-empty) {
  padding: 0;
}

.empty-state :deep(.el-empty__image) {
  width: 120px;
  height: 120px;
}

.empty-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 8px 0 16px;
}

.empty-state :deep(.el-button) {
  padding: 8px 20px;
  font-size: 14px;
}

.empty-state :deep(.el-button .el-icon) {
  margin-right: 4px;
}

/* 退出登录确认弹窗样式 */
.logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.content-box {
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--box-shadow-light);
  animation: fadeIn 0.3s ease-out;
}

.content-box.profile-section {
  background-image: url('/src/assets/image/mount.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  animation: waveMove 10s ease-in-out infinite alternate;
}

.content-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.content-box-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.content-box-body {
  padding: 8px 0;
}

.social-section {
  margin: 24px 0;
  background-image: url('/src/assets/image/social.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
}

.social-part {
  padding: 20px 0;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.part-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.divider {
  height: 1px;
  background: #ebeef5;
  margin: 20px 0;
}

.edit-icon {
  color: #737085;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  border: none;
}

.edit-icon:hover {
  transform: scale(1.1);
}

.edit-icon:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}


.popover-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.close-icon {
  cursor: pointer;
  padding: 4px;
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
}

.close-icon:hover {
  color: var(--el-color-danger);
  transform: scale(1.1);
}

.manage-groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 32px;
  padding: 40px;
}

.manage-group-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 32px 16px 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.manage-group-card:hover {
  box-shadow: 0 4px 24px rgba(64,158,255,0.18);
  transform: translateY(-5px);
}

.manage-group-info {
  text-align: center;
  margin-top: 16px;
}

.manage-group-info .group-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.manage-groups-tabs {
  padding: 16px 0;
}

.manage-groups-tabs :deep(.el-tabs__nav) {
  border-bottom: 1px solid #ebeef5;
}

.manage-groups-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
}

.custom-tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.manage-groups-tabs :deep(.el-tabs__item .custom-tab-icon) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.manage-groups-tabs :deep(.el-tabs__item:hover .custom-tab-icon),
.manage-groups-tabs :deep(.el-tabs__item.is-active .custom-tab-icon) {
  background: #e6f0ff;
  color: #409EFF;
}

.group-requests-list {
  padding: 20px;
}

.empty-requests {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 8px 0;
}

.group-request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.98);
  border-radius: 12px;
  transition: all 0.3s ease;
  margin: 16px 0;
  box-shadow: 0 2px 12px rgba(64,158,255,0.06);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(255,255,255,0.08);
}

.request-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.request-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--light-text);
}

.request-group {
  font-size: 12px;
  color: var(--light-secondary-text);
}

.request-msg {
  font-size: 12px;
  color: var(--light-text);
  margin-top: 4px;
}

.request-time {
  font-size: 12px;
  color: var(--light-text);
}

.request-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.manage-groups-content {
  position: relative;
  min-height: 400px;
  padding-bottom: 72px;
  overflow: visible;
  z-index: 1;
}

:deep(.el-tabs__nav-scroll) {
  padding-left: 50px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

:deep(.el-pagination) {
  --el-pagination-button-color: var(--light-text);
  --el-pagination-hover-color: var(--primary-color);
  --el-pagination-button-bg-color: var(--light-sidebar-bg);
  --el-pagination-button-disabled-color: var(--light-secondary-text);
  --el-pagination-button-disabled-bg-color: var(--light-sidebar-bg);
}

:deep(.el-pagination .el-select .el-input) {
  width: 100px;
}

:deep(.el-pagination .el-select .el-input .el-input__wrapper) {
  background-color: var(--light-sidebar-bg);
  box-shadow: none;
  border: 1px solid var(--light-border);
}

.friends-dialog-content .search-section :deep(.el-input__wrapper) {
  border: none !important;
  background: rgba(240, 245, 255, 0.85) !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(64,158,255,0.06);
  transition: box-shadow 0.2s, background 0.2s;
}

.friends-dialog-content .search-section :deep(.el-input__wrapper.is-focus) {
  background: #fff !important;
  box-shadow: 0 0 0 2px #409eff33;
}

.friends-dialog-content .search-section :deep(.el-input__inner) {
  background: transparent !important;
  color: #222;
  font-size: 16px;
  font-weight: 500;
  border: none !important;
  box-shadow: none !important;
}

.friends-dialog-content .search-section :deep(.el-input__inner::placeholder) {
  color: #a0b4d8;
  opacity: 1;
  font-weight: 400;
}

.friends-dialog-content .search-section :deep(.el-icon) {
  color: #409eff;
  opacity: 0.8;
}

.group-request-item:hover {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 4px 24px rgba(64,158,255,0.18);
  transform: translateY(-3px) scale(1.02);
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}

:deep(.manage-group-detail-popup) {
  position: absolute !important;
  z-index: 3000 !important;
}

:deep(.manage-group-detail-popup .user-detail-popup) {
  position: absolute;
  z-index: 3000 !important;
}

:deep(.el-overlay) {
  z-index: 2000 !important;
}

:deep(.el-dialog) {
  z-index: 2001 !important;
}

.avatar-upload-icon {
  margin-left: 100px;
  position: absolute;
  top: 75%;
  background: rgba(64, 158, 255, 1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  scale: 0.7;
  z-index: 2;
}

.avatar-upload-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 0;
}

.avatar-upload-drop {
  width: 240px;
  height: 240px;
  border: 2px dashed #409eff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.avatar-upload-drop:hover {
  border-color: #66b1ff;
  background: #f0f8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.avatar-upload-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

.avatar-upload-tip p {
  margin: 0;
  font-weight: 500;
}

.avatar-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 2px solid #fff;
}

.avatar-upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.avatar-upload-actions .danger-button {
  min-width: 100px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  margin-left: auto;
}

.logout-btn .el-icon {
  margin-right: 4px;
}

/* 暗色模式适配 */
.dark-mode .personal-center {
  background-color: #1a1d2d;
}

.dark-mode .friends-list,
.dark-mode .group-card {
  background: #2b2d3a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .exp-bar {
  background-color: #2b2d3a;
}

.dark-mode .exp-text {
  color: #a3a6ad;
}

.dark-mode .friend-item {
  background-color: var(--dark-bg);
  border-color: var(--dark-border);
}

.dark-mode .friend-item:hover {
  background-color: var(--dark-hover);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .friend-name {
  color: var(--dark-text);
}

.dark-mode .friend-status {
  color: var(--dark-secondary-text);
}

.dark-mode .search-section {
  background-color: var(--dark-sidebar-bg);
  border-bottom-color: var(--dark-border);
}

.dark-mode .search-input :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--dark-border);
}

.dark-mode .search-input :deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.08);
}

.dark-mode .search-input :deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .search-input :deep(.el-input__inner) {
  color: var(--dark-text);
}

.dark-mode .search-input :deep(.el-input__inner::placeholder) {
  color: var(--dark-secondary-text);
}

.dark-mode .search-icon {
  color: var(--dark-secondary-text);
}

.dark-mode .content-box {
  background: #2b2d3a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark-mode .content-box.profile-section {
  background-image: url('/src/assets/image/wave.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  animation: waveMove 10s ease-in-out infinite alternate;
}

.dark-mode .content-box:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.dark-mode .content-box-header {
  border-bottom-color: #363636;
}

.dark-mode .content-box-title {
  color: #e5eaf3;
}

.dark-mode .social-section {
  margin: 24px 0;
  background-image: url('/src/assets/image/socialDark.svg');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
}

.dark-mode .part-title {
  color: #e5eaf3;
}

.dark-mode .divider {
  background: #363636;
}

.dark-mode .empty-text {
  color: #a8abb2;
}

.dark-mode .stats-card .stat-value {
  color: #59e7d4;
}

.dark-mode .stats-card .stat-label {
  color: #e4e4e4;
}

.dark-mode .manage-groups-tabs :deep(.el-tabs__item:hover .custom-tab-icon),
.dark-mode .manage-groups-tabs :deep(.el-tabs__item.is-active .custom-tab-icon) {
  background: #223355;
  color: #6CA6FF;
}

.dark-mode .group-request-item {
  background: rgba(44, 62, 80, 0.92);
  color: #eaf6ff;
  box-shadow: 0 2px 12px rgba(64,158,255,0.10);
  text-shadow: 0 1px 2px rgba(0,0,0,0.18);
}

.dark-mode .group-request-item:hover {
  background: rgba(44, 62, 80, 0.85);
  box-shadow: 0 4px 24px rgba(64,158,255,0.22);
  transform: translateY(-3px) scale(1.02);
}

.dark-mode :deep(.el-pagination) {
  --el-pagination-button-color: var(--dark-text);
  --el-pagination-hover-color: var(--primary-color);
  --el-pagination-button-bg-color: var(--dark-sidebar-bg);
  --el-pagination-button-disabled-color: var(--dark-secondary-text);
  --el-pagination-button-disabled-bg-color: var(--dark-sidebar-bg);
}

.dark-mode :deep(.el-pagination .el-select .el-input .el-input__wrapper) {
  background-color: var(--dark-sidebar-bg);
  border-color: var(--dark-border);
}

.dark-mode .friends-dialog-content .search-section :deep(.el-input__wrapper) {
  background: rgba(30, 40, 60, 0.95) !important;
  box-shadow: 0 2px 8px rgba(64,158,255,0.10);
}

.dark-mode .friends-dialog-content .search-section :deep(.el-input__wrapper.is-focus) {
  background: #232b3a !important;
  box-shadow: 0 0 0 2px #409eff55;
}

.dark-mode .friends-dialog-content .search-section :deep(.el-input__inner) {
  color: #eaf6ff;
}

.dark-mode .friends-dialog-content .search-section :deep(.el-input__inner::placeholder) {
  color: #6c8bbd;
}

.dark-mode .friends-dialog-content .search-section :deep(.el-icon) {
  color: #6ca6ff;
  opacity: 0.9;
}

.dark-mode .avatar-upload-drop {
  background: #2b2d3a;
  border-color: #409eff;
}

.dark-mode .avatar-upload-drop:hover {
  background: #1e2a3a;
  border-color: #66b1ff;
}

.dark-mode .avatar-upload-tip {
  color: #a8abb2;
}

.dark-mode .avatar-preview-img {
  border-color: #363636;
}

:deep(.dark-mode) .popover-title {
  color: var(--el-text-color-primary);
}

:deep(.dark-mode) .close-icon {
  color: var(--el-text-color-secondary);
}

:deep(.dark-mode) .close-icon:hover {
  color: var(--el-color-danger);
}

@keyframes waveMove {
  0% {
    background-position: 0% bottom;
  }
  50% {
    background-position: 100% top;
  }
  100% {
    background-position: 0% center;
  }
}

:deep(.el-button) {
  background-color: var(--el-color-primary);
  color: white !important;
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  background-color: var(--el-color-primary-light-3);
  color: white;
}

:deep(.el-button:active) {
  background-color: var(--el-color-primary-dark-2);
  color: white;
}
.filter-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin:0 25px;
}
:deep(.filter-section .el-select),
:deep(.filter-section .el-date-editor) {
  border-radius: 8px !important;
  min-height: 32px !important;
  font-size: 14px !important;
  box-shadow: 0 1px 6px rgba(64,158,255,0.06);
}
:deep(.filter-section .el-input__wrapper) {
  border-radius: 8px !important;
  min-height: 32px !important;
}
:deep(.filter-section .el-input__inner) {
  font-size: 14px !important;
}
.request-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 120px;
  margin-right: 16px;
  margin-left: 12px;
}
.request-msg-glass {
  background: rgba(180, 180, 180, 0.18);
  color: #888;
  font-size: 13px;
  border-radius: 10px;
  padding: 6px 14px;
  margin-bottom: 6px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(180,180,180,0.08);
  text-align: center;
  min-width: 80px;
  max-width: 180px;
  word-break: break-all;
}
.request-time-blue {
  color: #409eff;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 4px rgba(64,158,255,0.08);
}
.group-name-link {
  color: #409eff;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
}
.request-user {
  font-weight: bold;
}

/* 头像美化，兼容 el-avatar、el-image、img，使用 :deep 选择器 */
:deep(.el-avatar),
:deep(.el-image),
:deep(img.user-avatar),
:deep(.user-avatar-img) {
  border-radius: 50%;
  border: 3px solid transparent;
  background: linear-gradient(135deg, #6c63ff 0%, #409eff 100%) border-box;
  box-shadow: 0 4px 18px 0 rgba(64, 158, 255, 0.18), 0 1.5px 6px 0 rgba(64, 158, 255, 0.10);
  padding: 3px;
  background-clip: padding-box, border-box;
  background-origin: border-box;
  position: relative;
}
:deep(.el-avatar img),
:deep(.el-image__inner),
:deep(img.user-avatar),
:deep(.user-avatar-img) {
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px 0 #e0e7ef inset;
}
.dark-mode :deep(.el-avatar),
.dark-mode :deep(.el-image),
.dark-mode :deep(img.user-avatar),
.dark-mode :deep(.user-avatar-img) {
  background: linear-gradient(135deg, #23263a 0%, #409eff 100%) border-box;
}

/* 布局调整 */
.name-level {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
}

.name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.logout-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 150px; /* 为按钮展开预留空间 */
}

/* 模仿 Uiverse.io 的退出登录按钮样式 */
.Btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition-duration: .3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
  background-color: rgb(255, 65, 65);
  z-index: 10; /* 确保按钮在最上层 */
}

/* plus sign */
.sign {
  width: 100%;
  transition-duration: .3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign svg {
  width: 17px;
}

.sign svg path {
  fill: white;
}

/* text */
.text {
  
  position: absolute;
  right: -10%;
  width: 0%;
  opacity: 0;
  color: white;
  font-size: 1em;
  font-weight: 600;
  transition-duration: .3s;
  white-space: nowrap;
}

/* hover effect on button width */
.Btn:hover {
  width: 125px;
  border-radius: 40px;
  transition-duration: .3s;
}

.Btn:hover .sign {
  width: 30%;
  transition-duration: .3s;
  padding-left: 20px;
}

/* hover effect button's text */
.Btn:hover .text {
  opacity: 1;
  width: 70%;
  transition-duration: .3s;
  padding-right: 10px;
}

/* button click effect*/
.Btn:active {
  transform: translate(2px ,2px);
}

/* 暗色模式适配 */
.dark-mode .Btn {
  background-color: rgb(220, 53, 69);
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
}
</style>

