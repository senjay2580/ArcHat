<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="background-overlay"></div>
    <el-container class="app-layout">

      <!-- #region 图标栏 -->
      <el-aside width="64px" class="icon-bar">
        <!-- 折叠/展开按钮 -->

        <div class="sidebar-toggle-btn" @click="isSidebarCollapse = !isSidebarCollapse"
          :class="{ 'collapsed': isSidebarCollapse }">
          <svg v-if="!isSidebarCollapse" xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 24 24">
            <!-- Icon: Arrow Left -->
            <path fill="currentColor"
              d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 24 24"
            style="transform: rotate(180deg);">
            <!-- Icon: Arrow Right (flipped) -->
            <path fill="currentColor"
              d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z" />
          </svg>
        </div>
        <!-- 添加用户头像 -->
        <div class="user-avatar-container" @click="router.push('/userHub')">
          <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        </div>
        <div class="sidebar-nav">
          <div v-for="(menu, key) in MENU_CONFIG" :key="key" class="nav-item"
            :class="{ active: activeIcon === menu.icon }" @click="handleMenuClick(menu)">
            <el-badge v-if="menu.badge" :value="menu.badge" class="nav-badge">
              <el-icon>
                <component :is="getIconComponent(menu.icon)" />
              </el-icon>
            </el-badge>
            <el-icon v-else>
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
          </div>
        </div>
      </el-aside>
      <!-- #endregion -->

      <!-- #region 会话列表 -->
      <el-aside :class="['sidebar', { collapsed: isSidebarCollapse }]">
        <div class="sidebar-header" v-if="!isSidebarCollapse">
          <h2 class="inbox-title"> <a @click="router.push('/login')" style="cursor: pointer;"><img src="/src/assets/image/archat.png" alt="" width="50px"></a>ArcHat
          </h2>
          <div class="visitor-tag"><el-icon>
              <UserFilled />
            </el-icon> 今日访客：{{ visitorCount }}</div>
        </div>
        <div v-if="!isSidebarCollapse" class="search-container">
          <el-input placeholder="Find a conversation" v-model="searchQuery" clearable class="custom-search-input">
            <template #prefix>
             <span style="color: #6466f5;"><svg xmlns="http://www.w3.org/2000/svg" width="12"  viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="currentColor" d="M20.94 11A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7"/></svg></span>
            </template>
            <template #suffix>
              <el-icon class="search-send-icon">
                <Position />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div v-if="!isSidebarCollapse" class="switch-container">
          <div class="switch-bar">
            <button class="switch-btn" :class="{ active: currentView === 'friends' }" @click="currentView = 'friends'"
              data-tooltip="好友列表">
              <el-icon>
                <User />
              </el-icon>
            </button>
            <button class="switch-btn" :class="{ active: currentView === 'groups' }" @click="currentView = 'groups'"
              data-tooltip="群组列表">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="22"
                viewBox="0 0 1200 1200"><!-- Icon from Elusive Icons by Team Redux - https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL -->
                <path fill="currentColor"
                  d="M596.847 188.488c-103.344 0-187.12 97.81-187.12 218.465c0 83.678 40.296 156.352 99.468 193.047l-68.617 31.801l-182.599 84.688c-17.64 8.821-26.444 23.778-26.444 44.947v201.102c1.451 25.143 16.537 48.577 40.996 48.974h649.62c27.924-2.428 42.05-24.92 42.325-48.974V761.436c0-21.169-8.804-36.126-26.443-44.947l-175.988-84.688l-73.138-34.65c56.744-37.521 95.061-108.624 95.061-190.197c-.001-120.656-83.778-218.466-187.121-218.466m-301.824 76.824c-44.473 1.689-79.719 20.933-106.497 51.596c-29.62 36.918-44.06 80.75-44.339 124.354c1.819 64.478 30.669 125.518 82.029 157.446L21.163 693.997C7.05 699.289 0 711.636 0 731.041v161.398c1.102 21.405 12.216 39.395 33.055 39.703h136.284V761.436c2.255-45.639 23.687-82.529 62.196-100.531l136.247-64.817c10.584-6.175 20.731-14.568 30.433-25.152c-56.176-86.676-63.977-190.491-27.773-281.801c-23.547-14.411-50.01-23.672-75.419-23.823m608.586 0c-29.083.609-55.96 11.319-78.039 26.444c35.217 92.137 25.503 196.016-26.482 276.52c11.467 13.23 23.404 23.377 35.753 30.434l130.965 62.195c39.897 21.881 60.47 59.098 60.866 100.532v170.707h140.235c23.063-1.991 32.893-20.387 33.093-39.704V731.042c0-17.641-7.05-29.987-21.163-37.045l-202.431-96.618c52.498-38.708 78.859-96.72 79.369-156.117c-1.396-47.012-15.757-90.664-44.339-124.354c-29.866-32.399-66.91-51.253-107.827-51.596" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="!isSidebarCollapse" class="conversation-list">
          <template v-if="currentView === 'friends'">
            <div class="scroll-wrapper" v-infinite-scroll="loadMoreFriends"
              :infinite-scroll-disabled="isLoading || noMoreData" :infinite-scroll-distance="20"
              style="height: 100%; overflow-y: auto;">
              <template v-if="filteredContacts.length > 0">
                <div v-for="contact in filteredContacts" :key="contact.id" class="conversation-item" :class="{
                  'active': route.params.id === contact.id.toString(),
                  'has-unread': contact.unreadCount > 0
                }" @click="handleChat(contact)">
                  <el-badge v-if="contact.unreadCount > 0" :value="contact.unreadCount" class="item-unread-badge"
                    type="danger" :max="99" style="--el-badge-bg-color: #f56c6c;" />
                  <div class="conversation-avatar">
                    <el-avatar :size="40" :src="contact.avatar"
                      :class="{ 'avatar-offline': !contact.status }"></el-avatar>
                    <div class="online-status" :class="{ 'online': contact.status }">
                      <span class="status-dot"></span>
                    </div>
                  </div>
                  <div class="conversation-content">
                    <div class="conversation-header">
                      <span class="company-name">{{ contact.username }}</span>
                      <div class="message-time">
                        <span v-if="contact.unreadCount === 0 && contact.activeTime">{{
                          formatMessageTime(contact.activeTime) }}</span>
                      </div>
                    </div>
                    <div class="message-preview">
                      <template v-if="contact.lastMsgId">
                        <template v-if="messagePreviews.get(contact.id)">
                          {{ getSenderName(contact) }}: {{ messagePreviews.get(contact.id) }}
                        </template>
                        <template v-else>加载中...</template>
                      </template>
                      <template v-else>暂无消息</template>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else-if="searchQuery" class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon">
                    <Search />
                  </el-icon>
                  <h3>未找到相关联系人</h3>
                  <p>换个关键词试试吧</p>
                </div>
              </div>
              <div v-else class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon">
                    <ChatDotRound />
                  </el-icon>
                  <h3>还没有聊天记录</h3>
                  <p>快去和好友聊天吧</p>
                </div>
              </div>
              <div v-if="isLoading" style="text-align:center;padding:8px;color:#999;">加载中...</div>
              <div v-if="noMoreData && filteredContacts.length > 0" style="text-align:center;padding:8px;color:#999;">
                没有更多了</div>
            </div>
          </template>
          <template v-else>
            <div class="scroll-wrapper" v-infinite-scroll="loadMoreGroups"
              :infinite-scroll-disabled="isLoadingGroups || noMoreGroups" :infinite-scroll-distance="20"
              style="height: 100%; overflow-y: auto;">
              <template v-if="filteredGroups.length > 0">
                <div v-for="group in filteredGroups" :key="group.roomId" class="conversation-item"
                  :class="{ 'active': route.params.id === group.roomId?.toString(), 'has-unread': group.unreadCount > 0 }"
                  @click="handleGroupChat(group)">
                  <el-badge v-if="group.unreadCount > 0" :value="group.unreadCount" class="item-unread-badge"
                    type="danger" :max="99" style="--el-badge-bg-color: #f56c6c;" />
                  <div class="conversation-avatar">
                    <el-avatar :size="40" :src="group.avatar"></el-avatar>
                  </div>
                  <div class="conversation-content">
                    <div class="conversation-header">
                      <span class="company-name">{{ group.name }}</span>
                      <span class="timestamp">{{ group.activeTime ? formatMessageTime(group.activeTime) : '' }}</span>
                    </div>
                    <div class="message-preview">
                      <template v-if="group.lastMsgId">
                        <template v-if="groupMessagePreviews.get(group.roomId)">
                          {{ getGroupSenderName(group) }}: {{ groupMessagePreviews.get(group.roomId) }}
                        </template>
                        <template v-else>加载中...</template>
                      </template>
                      <template v-else>暂无消息</template>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else-if="searchQuery" class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon">
                    <Search />
                  </el-icon>
                  <h3>未找到相关群聊</h3>
                  <p>换个关键词试试吧</p>
                </div>
              </div>
              <div v-else class="empty-conversation">
                <div class="empty-content">
                  <el-icon class="empty-icon">
                    <UserFilled />
                  </el-icon>
                  <h3>还没有群聊</h3>
                  <p>创建或加入一个群聊吧</p>
                </div>
              </div>
              <div v-if="isLoadingGroups" style="text-align:center;padding:8px;color:#999;">加载中...</div>
              <div v-if="noMoreGroups && filteredGroups.length > 0" style="text-align:center;padding:8px;color:#999;">
                没有更多了</div>
            </div>
          </template>
        </div>
      </el-aside>
      <!-- #endregion -->

      <!-- #region 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" :friend-list="friendList" :group-list="groupList" />
          </transition>
        </router-view>
      </el-main>
      <!-- #endregion -->

      <!-- #region 右上角控制按钮 -->
            <div class="theme-toggle-top" @mouseleave="hideDropdownWithDelay">
        <el-button 
          circle 
          class="dropdown-grid-btn" 
          data-tooltip="快捷导航"
          @mouseenter="showDropdown"
          :style="{ backgroundColor: 'transparent', ...dropdownBtnStyle }" 
          ref="dropdownTriggerBtn">

          <svg xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 512 512" :class="{ 'rotated': isDropDownVisible }" :style="{ color: dropdownIconFillColor }">
            <path d="M256 48C141.125 48 48 141.125 48 256s93.125 208 208 208 208-93.125 208-208S370.875 48 256 48zm0 272l-96-96h192l-96 96z" fill="currentColor"/>
          </svg>
        </el-button>

        <DayNightSwitch v-model="isDarkMode" data-tooltip="切换主题" />

        <div class="mac-window-controls">
          <button class="mac-btn close" @click="handleLogout" data-tooltip="退出登录">
            <el-icon>
              <Close />
            </el-icon>
          </button>
          <button class="mac-btn minimize" @click="handleMinimize" data-tooltip="切换会话列表">
            <el-icon>
              <Minus />
            </el-icon>
          </button>
          <button class="mac-btn maximize" @click="handleMaximize" data-tooltip="切换导航选项">
            <el-icon>
              <FullScreen />
            </el-icon>
          </button>
        </div>

        <!-- 日历签到按钮，放在详情按钮左边，适配日夜模式 -->
        <el-button circle class="calendar-btn" @click="handleShowSignInCalendar" data-tooltip="每日签到"
          :style="calendarBtnStyle">
          <el-icon>
            <Calendar style="color: #fff;" />
          </el-icon>
        </el-button>
        <!-- 消息中心icon按钮 -->
        <el-button circle class="calendar-btn" @click="router.push('/noticecenter')" data-tooltip="消息中心"
          :style="calendarBtnStyle">
          <el-icon>
            <Bell style="color: #fff;" />
          </el-icon>
        </el-button>
        
        <!-- 下拉网格按钮 -->
       
      </div>
      <!-- #endregion -->
    </el-container>

    <!-- DropdownGridBox 组件 -->
      <DropdownGridBox 
    :visible="isDropDownVisible" 
    :is-dark-mode="isDarkMode" 
    :position="dropdownPosition"
    :sections="dropdownSections"
    @close="isDropDownVisible = false"
    @mouseenter="cancelHideDropdown"
    @mouseleave="hideDropdownWithDelay"
  />

    <!-- #region 弹窗组件 -->
    <!-- 添加全屏搜索弹窗 -->
    <SearchDialog v-model:visible="showSearchDialog" :initial-type="searchType" />

    <!-- 添加创建群聊弹窗 -->
    <FullScreenDialog v-model:visible="showCreateGroupDialog" title="创建群聊">
      <div class="create-group-content">
        <el-form :model="groupForm" label-width="80px" class="create-group-form">
          <el-form-item label="群名称">
            <el-input v-model="groupForm.name" placeholder="请输入群名称" class="custom-input" clearable>
              <template #suffix>
                <el-icon class="input-clear-icon" @click="groupForm.name = ''">
                  <Close />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="群头像">
            <div class="avatar-uploader" @dragover.prevent @drop="handleGroupAvatarDrop"
              @click="() => $refs.groupAvatarInput.click()" style="cursor:pointer;">
              <input type="file" accept="image/*" ref="groupAvatarInput" style="display:none"
                @change="handleGroupAvatarChange" />
              <div class="avatar-wrapper">
                <img v-if="groupAvatarPreview" :src="groupAvatarPreview" class="avatar" />
                <div v-else class="avatar-placeholder">
                  <el-icon class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                  <span class="upload-text">上传群头像</span>
                </div>
              </div>

              <DangerButton type="warning" style="margin-top:12px;" v-if="groupAvatarPreview"
                @click.stop="handleGroupAvatarRemove">
                移除
              </DangerButton>

            </div>
          </el-form-item>
          <el-form-item label="群公告">
            <el-input v-model="groupForm.announcement" type="textarea" rows="3" placeholder="请输入群公告"
              class="custom-textarea" clearable>
              <template #suffix>
                <el-icon class="input-clear-icon" @click="groupForm.announcement = ''">
                  <Close />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="button-group">
            <el-button type="primary" class="create-btn" @click="handleCreateGroup">
              <span style="color: white;">创建</span>
            </el-button>
            <el-button type="danger" class="reset-btn" @click="handleResetForm">
              <span style="color: white;">重置</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </FullScreenDialog>

    <!-- 添加消息通知组件 -->
    <message-notification ref="messageNotificationRef" :message="notificationMessage"
      @click="handleNotificationClick" />
    <FullScreenDialog v-model:visible="showSignInCalendar" title="每日签到">
      <div class="signin-calendar-topbar">

      </div>
      <div class="sign-calendar-wrapper">
        <SignInCalendar v-model="showSignInCalendar" :signed-dates="signedDates" :is-today-signed-in="isTodaySignedIn"
          :consecutive-days="consecutiveDays" :total-days="totalDays" @sign="handleSignInClick" />
      </div>
      <template #footer>
        <el-button @click="showSignInCalendar = false" class="sign-close-btn">关闭</el-button>
      </template>
    </FullScreenDialog>

    <!-- ExpDialog经验值弹窗 -->
    <ExpDialog v-model:visible="showExpDialog" :title="expDialogTitle" @close="showExpDialog = false" />
    <!-- #endregion -->
    <!-- 退出登录确认弹窗 -->
  
  </div>
  <div v-if="showLogoutConfirm" class="warning-overlay" @click="cancelLogout">
      <WorningTips title="退出登录" message="确定要退出系统吗？退出后需要重新登录。" confirm-text="退出" cancel-text="取消" icon-bg-color="#fef2f2"
        icon-color="#ef4444" confirm-button-color="#ef4444" :width="'350px'" @confirm="confirmLogout"
        @cancel="cancelLogout" />
    </div>
</template>

<script setup>
// #region 导入依赖
import { ref, onMounted, onUnmounted, watch, computed, h, defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox, ElInfiniteScroll } from 'element-plus';
import ArcMessage from '@/utils/ArcMessage';
import { ChatDotRound, Setting, Sunny, Moon, ArrowLeft, Plus, User, UserFilled, Message, Bell, Close, Minus, FullScreen, Search, Position, Calendar, Folder } from '@element-plus/icons-vue';

import FullScreenDialog from '@/components/layout/FullScreenDialog.vue';
import SearchDialog from '@/components/business/SearchDialog.vue';
import MessageNotification from '@/components/feedback/MessageNotification.vue';
import SignInCalendar from '@/components/business/SignInCalendar.vue';
import ExpDialog from '@/components/feedback/ExpDialog.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import WorningTips from '@/components/feedback/WorningTips.vue';
import DayNightSwitch from '@/components/interaction/DayNightSwitch.vue';
import DropdownGridBox from '@/components/interaction/DropdownGridBox.vue';

import { getFriendList } from '@/api/friend';
import { getContactList, getGroupList, getUnreadMsgCnt } from '@/api/contact';
import { logoutService } from '@/api/user';
import { getMessageById } from '@/api/chatService';
import { addGroupRoom } from '@/api/room';
import { fetchVisitorCount, callAddVisitorOncePerDay } from '@/api/uv';

import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';

import { formatMessageTime } from '@/utils/time';
import { handleSignIn, getSignInDetail, getSignedDates, checkTodaySignIn, getConsecutiveSignInDays, getTotalSignInDays } from '@/utils/signInHandler';
import { uploadImageFile } from '@/utils/fileHandler';
import { loadMoreList } from '@/utils/paginatedListLoader';
import emitter from '@/utils/eventBus';
import '@/assets/styles/home.css';
// #endregion 

// #region 初始化Store和用户信息
const userInfoStore = useUserInfoStore()
const contactStore = useContactStore();
const userInfo = computed(() => userInfoStore.userInfo);

const groupAvatarFile = ref(null);
const groupAvatarPreview = ref('');
const groupAvatarInput = ref(null);
// #endregion

// #region 菜单配置
const MENU_CONFIG = {
  chat: {
    icon: 'chat',
    path: '/chat',
    label: '聊天',
  },
  mail: {
    icon: 'mail',
    path: '/mail',
    label: '消息'
  },
  user: {
    icon: 'user',
    path: '/UserHub',
    label: '设置'
  },
  aichat: {
    icon: 'aichat',
    path: '/aichat',
    label: 'AI Chat'
  },
  archives: {
    icon: 'archives',
    path: '/archives',
    label: '档案馆'
  }
};

// 路由路径到菜单图标的映射
const PATH_TO_ICON = Object.entries(MENU_CONFIG).reduce((acc, [key, value]) => {
  acc[value.path] = key;
  return acc;
}, {});
// #endregion

// #region 数据存储
const router = useRouter();
const route = useRoute();
const isDarkMode = ref(true);
const isSidebarCollapse = ref(false);
const isDropDownVisible = ref(false);
const dropdownPosition = ref({ x: 0, y: 0 });
const dropdownTriggerBtn = ref(null);

// 动态计算下拉框位置
const calculateDropdownPosition = () => {
  if (!dropdownTriggerBtn.value) return;
  
  const btnElement = dropdownTriggerBtn.value.$el;
  const btnRect = btnElement.getBoundingClientRect();
  
  // 下拉框宽度（与 CSS 中的 min-width 保持一致）
    const dropdownWidth = 480;
  
  // 计算水平位置：按钮中心对齐下拉框中心
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const dropdownX = btnCenterX - dropdownWidth / 2;
  
  // 计算垂直位置：按钮下方，留一些间距
  const dropdownY = btnRect.bottom + 8;
  
  // 边界检查：确保不超出视口
  const viewportWidth = window.innerWidth;
  const finalX = Math.max(10, Math.min(dropdownX, viewportWidth - dropdownWidth - 10));
  
  dropdownPosition.value = {
    x: finalX,
    y: dropdownY
  };
};

let hideTimer = null;

// 显示下拉框
const showDropdown = () => {
  if (hideTimer) clearTimeout(hideTimer);
  if (!isDropDownVisible.value) {
    calculateDropdownPosition();
    isDropDownVisible.value = true;
  }
};

// 延迟隐藏下拉框
const hideDropdownWithDelay = () => {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    isDropDownVisible.value = false;
  }, 200);
};

// 取消隐藏
const cancelHideDropdown = () => {
  if (hideTimer) clearTimeout(hideTimer);
};

// 下拉网格项目配置 - 使用 sections 结构
const dropdownSections = ref([
  {
    title: '聊天功能',
    items: [
      { 
        name: '添加好友', 
        icon: 'User', 
        action: () => {
          handleShowSearchDialog('friend');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '添加群聊', 
        icon: 'Users', 
        action: () => {
          handleShowSearchDialog('group');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '创建群聊', 
        icon: 'Plus', 
        action: () => {
          handleShowCreateGroupDialog();
          isDropDownVisible.value = false;
        }
      }
    ]
  },
  {
    title: 'AI功能',
    items: [
      { 
        name: 'AI助手', 
        icon: 'User', 
        action: () => {
          router.push('/aichat');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '智能翻译', 
        icon: 'Type', 
        action: () => {
          ArcMessage.success('开启智能翻译');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '语音识别', 
        icon: 'Circle', 
        action: () => {
          ArcMessage.info('启动语音识别');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '智能摘要', 
        icon: 'CheckSquare', 
        action: () => {
          ArcMessage.info('生成智能摘要');
          isDropDownVisible.value = false;
        }
      }
    ]
  },
  {
    title: '更多功能',
    items: [
      { 
        name: '文件传输', 
        icon: 'CreditCard', 
        action: () => {
          ArcMessage.success('打开文件传输');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '屏幕共享', 
        icon: 'Grid3X3', 
        action: () => {
          ArcMessage.info('启动屏幕共享');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '视频通话', 
        icon: 'MousePointer2', 
        action: () => {
          ArcMessage.info('发起视频通话');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '消息加密', 
        icon: 'ToggleLeft', 
        action: () => {
          ArcMessage.info('开启消息加密');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '直播间', 
        icon: 'Video', 
        action: () => {
          ArcMessage.success('进入直播间');
          isDropDownVisible.value = false;
        }
      },
      { 
        name: '文档协作', 
        icon: 'FileText', 
        action: () => {
          ArcMessage.info('打开文档协作');
          isDropDownVisible.value = false;
        }
      }
    ]
  }
]);

// 监听侧边栏状态变化
watch(isSidebarCollapse, (newVal) => {
  emitter.emit('sidebar-toggle', newVal);
});

// 搜索和视图
const searchQuery = ref(''); // 搜索关键词
const currentView = ref('friends'); // 当前视图: friends/groups

// 列表数据
const friendList = ref([]); // 好友列表
const groupList = ref([]); // 群聊列表
const contactList = ref([]); // 联系人列表（统一）
const contactQuery = ref({ // 联系人查询参数
  page: 1,
  pageSize: 10
});

// 导航状态
const activeIcon = ref('chat'); // 当前激活的导航图标

// 加载状态
const isLoading = ref(false); // 数据加载中
const isFriendListLoaded = ref(false); // 好友列表是否已加载
const noMoreData = ref(false); // 是否没有更多数据

// 消息预览
const messagePreviews = ref(new Map()); // 消息预览缓存（contactId -> preview）
const messageSenders = ref(new Map()); // 消息发送者缓存（contactId -> sender）
// #endregion

// #region 工具函数
/**
 * 处理群聊头像文件选择
 */
function handleGroupAvatarChange(e) {
  const file = e.target.files[0];
  if (file) {
    groupAvatarFile.value = file;
    groupAvatarPreview.value = URL.createObjectURL(file);
  }
}

/**
 * 处理群聊头像拖拽上传
 */
function handleGroupAvatarDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    groupAvatarFile.value = file;
    groupAvatarPreview.value = URL.createObjectURL(file);
  }
}

/**
 * 移除群聊头像预览
 */
function handleGroupAvatarRemove() {
  groupAvatarFile.value = null;
  groupAvatarPreview.value = '';
}


// #endregion

// #region 路由和菜单处理
// 根据路由路径设置活动图标
const setActiveIconFromRoute = () => {
  const path = route.path;
  // 查找最长的匹配路径
  const matchedPath = Object.keys(PATH_TO_ICON)
    .filter(p => path.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];

  activeIcon.value = matchedPath ? PATH_TO_ICON[matchedPath] : 'chat';
};

const handleMenuUpdate = (event) => {
  activeIcon.value = event.detail.activeMenu;
};

// 监听路由变化
watch(() => route.path, () => {
  setActiveIconFromRoute();
});
// #endregion

// #region 好友列表管理
// 获取好友列表
const fetchFriendList = async () => {
  try {
    const res = await getFriendList(userInfo.value.uid);
    if (res.code === 200) {
      const friends = res.data.map(item => ({
        id: item.id,
        username: item.username,
        avatar: item.avatar || '',
        status: item.status,
        createTime: item.createTime,
        exp: item.exp
      }));
      friendList.value = friends;
      isFriendListLoaded.value = true;

    } else {
      ArcMessage.error(res.msg || '获取好友列表失败');
    }
  } catch (error) {

  }
};
// #endregion

// #region 联系人列表管理
/**
 * 无限滚动加载更多好友联系人
 */
const loadMoreFriends = () => {
  if (connectionStatus.value !== 'connected') return;
  loadMoreList({
    apiList: getContactList,
    apiUnread: getUnreadMsgCnt,
    query: contactQuery.value,
    listRef: contactList,
    getId: c => c.friendId,
    getLastMsgId: c => c.lastMsgId,
    getLatestMsg: getLatestMessage,
    isLoadingRef: isLoading,
    noMoreRef: noMoreData,
    pageSizeKey: 'pageSize'
  });
};

// 初始加载第一页
const fetchContactList = async () => {
  contactQuery.value.page = 1;
  noMoreData.value = false;
  isLoading.value = true;
  try {
    if (!isFriendListLoaded.value) {
      await fetchFriendList();
    }
    // 并发请求联系人和未读消息
    const [contactRes, unreadRes] = await Promise.all([
      getContactList(contactQuery.value),
      getUnreadMsgCnt(contactQuery.value)
    ]);
    if (contactRes.code === 200 && unreadRes.code === 200) {
      const unreadMap = {};
      (unreadRes.data.records || []).forEach(item => {
        unreadMap[item.contactId] = item.count;
      });
      const contacts = contactRes.data.records.map(contact => {
        const friendInfo = friendMap.value.get(contact.friendId) || {};
        const existingContact = contactStore.getContactById(contact.friendId);
        return {
          contactId: contact.id,
          id: contact.friendId,
          roomId: contact.roomId,
          friendId: contact.friendId,
          activeTime: contact.activeTime,
          lastMsgId: contact.lastMsgId,
          readTime: contact.readTime,
          username: friendInfo.username || '未知用户',
          avatar: friendInfo.avatar || '',
          status: existingContact?.status ?? friendInfo.status ?? false,
          createTime: friendInfo.createTime,
          exp: friendInfo.exp,
          unreadCount: unreadMap[contact.id] || 0
        };
      });
      contactList.value = contacts;
      for (const contact of contacts) {
        if (contact.lastMsgId) {
          await getLatestMessage(contact);
        }
      }
      noMoreData.value = contacts.length < contactQuery.value.pageSize;
      contactStore.setContacts(contacts);
    } else {
      contactList.value = [];
      noMoreData.value = true;
      return [];
    }
  } catch (error) {
    contactList.value = [];
    noMoreData.value = true;
    return [];
  } finally {
    isLoading.value = false;
  }
};

// 创建好友信息映射
const friendMap = computed(() => {
  return new Map(friendList.value.map(friend => [
    friend.id,
    {
      username: friend.username,
      avatar: friend.avatar,
      status: friend.status,
      createTime: friend.createTime,
      exp: friend.exp
    }
  ]));
});

// 获取最新消息内容和发送者
const getLatestMessage = async (contact) => {
  if (!contact.lastMsgId) return;
  try {
    const res = await getMessageById(contact.lastMsgId);
    if (res.code === 200) {
      messagePreviews.value.set(contact.id, res.data.content);
      // 新增: 记录发送者id
      messageSenders.value.set(contact.id, res.data.fromUid);
    }
  } catch (error) {
    console.error('获取最新消息失败:', error);
  }
};
// #endregion

// #region 群聊列表管理
// 获取群聊会话列表

const fetchGroupListRaw = async () => {
  groupQuery.value.page = 1;
  noMoreGroups.value = false;
  isLoadingGroups.value = true;
  try {
    const [groupRes, unreadRes] = await Promise.all([
      getGroupList(groupQuery.value),
      getUnreadMsgCnt(groupQuery.value)
    ]);
    if (groupRes.code === 200 && unreadRes.code === 200) {
      const unreadMap = {};

      (unreadRes.data.records || []).forEach(item => {
        unreadMap[item.contactId] = item.count;
      });
      const groups = groupRes.data.records.map(group => ({
        id: group.roomId,
        roomId: group.roomId,
        name: group.name,
        avatar: group.avatar,
        activeTime: group.activeTime,
        lastMsgId: group.lastMsgId,
        readTime: group.readTime,
        unreadCount: unreadMap[group.id] || 0
      }));
      console.log('groups', groups);
      groupList.value = groups;
      // 获取每个群聊的最新消息
      for (const group of groups) {
        if (group.lastMsgId) {
          await getGroupLatestMessage(group);
        }
      }
      noMoreGroups.value = groups.length < groupQuery.value.pageSize;
      contactStore.setGroupChats(groups);
    } else {
      groupList.value = [];
      noMoreGroups.value = true;
      return [];
    }
  } catch (error) {
    groupList.value = [];
    noMoreGroups.value = true;
    return [];
  } finally {
    isLoadingGroups.value = false;
  }
};

// 统一管理所有会话
const fetchAllConversations = async () => {
  await Promise.all([
    fetchContactList(),
    fetchGroupListRaw()
  ]);
  // 分别存入私聊和群聊

};
// #endregion

const visitorCount = ref(0);

// #region 生命周期钩子
onMounted(() => {
  if (userInfo.value.token) {
    callAddVisitorOncePerDay()
    console.log('callAddVisitorOncePerDay')
  }

  fetchVisitorCount().then(res => {
    visitorCount.value = res.data;
  });
  fetchAllConversations();
  if (isDarkMode.value) {
    document.body.classList.add('dark-theme');
  }

  // 初始化时设置活动图标
  setActiveIconFromRoute();

  window.addEventListener('update-active-menu', handleMenuUpdate);
  // 监听刷新会话列表事件
  emitter.on('refresh-contact-list', () => {
    console.log('收到 refresh-contact-list 事件');
    fetchAllConversations();
  });
  emitter.on('refresh-friend-contact-list', () => {
    console.log('收到 refresh-friend-contact-list 事件');
    fetchContactList();
  });
  emitter.on('refresh-group-contact-list', (data) => {
    console.log('收到 refresh-group-contact-list 事件', data);
    // 如果传入了具体的roomId，只更新该群聊；否则更新所有群聊
    if (data && (data.message.roomId || data.message.id)) {
      const roomId = data.message.roomId || data.message.id;
      updateSpecificGroupMessage(roomId);
    } else {
      fetchGroupListRaw();
    }
  });
  // 监听刷新好友列表事件
  emitter.on('refresh-friend-list', () => {
    console.log('收到 refresh-friend-list 事件');
    fetchFriendList();
  });

  console.log('Home 组件挂载，检查消息通知组件:', messageNotificationRef.value);

  // 监听好友申请消息事件
  emitter.on('friend-apply', (data) => {
    console.log('Home 组件收到好友申请消息:', data);
    if (data && data.fromUid) {
      notificationMessage.value = '有人向你发起了好友申请';
      if (messageNotificationRef.value) {
        messageNotificationRef.value.show();
      }
    }
  });
  // 监听用户上下线通知
  emitter.on('user-status', (data) => {
    if (!data || !Array.isArray(data.changeList)) return;

    contactStore.updateContactsStatus(data.changeList);
  });
});

onUnmounted(() => {
  console.log('Home 组件卸载，移除事件监听');
  emitter.off('friend-apply');
  emitter.off('refresh-contact-list', fetchAllConversations);
  emitter.off('refresh-friend-list', fetchFriendList);
  emitter.off('refresh-friend-contact-list', fetchContactList);
  emitter.off('refresh-group-contact-list', fetchGroupListRaw);
  emitter.off('user-status');
  window.removeEventListener('update-active-menu', handleMenuUpdate);
});
// #endregion

// #region 主题和UI控制
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

const handleMenuClick = (menu) => {
  if (menu.handler) {
    menu.handler();
  } else {
    router.push(menu.path);
  }
};

// 修改isActive函数
const isActive = (path) => {
  if (path === '/chat') {
    return route.path.startsWith('/chat');
  }
  return route.path === path;
};
// #endregion

// #region 搜索功能
// 删除原有的搜索相关变量和函数
const showSearchDialog = ref(false);
const searchType = ref('friend');

// 处理显示搜索弹窗
const handleShowSearchDialog = (type) => {
  searchType.value = type;
  showSearchDialog.value = true;
};
// #endregion

// #region 用户操作处理
const showLogoutConfirm = ref(false);
const handleLogout = () => {
  showLogoutConfirm.value = true;
};


// 确认退出登录
const confirmLogout = async () => {
  try {
    const token = userInfo.value.token;
    const res = await logoutService(token);
    
    if (res.code === 200) {
      userInfoStore.removeUserInfo(); // 这里会清空token并断开WebSocket
      router.push('/login');
      ArcMessage.success('退出成功');
    } else {
      ArcMessage.error(res.msg || '退出失败');
    }
  } catch (error) {
    console.error('退出登录失败:', error);
    ArcMessage.error('退出失败，请稍后重试');
  }
  showLogoutConfirm.value = false;
};

// 取消退出登录
const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

const handleMinimize = () => {
  // 切换第二部分（会话列表）的拉伸状态
  isSidebarCollapse.value = !isSidebarCollapse.value;
};

const handleMaximize = () => {
  // 切换第一部分（图标栏）的活动选项
  const currentIndex = Object.keys(MENU_CONFIG).indexOf(activeIcon.value);
  const nextIndex = (currentIndex + 1) % Object.keys(MENU_CONFIG).length;
  const nextIcon = Object.keys(MENU_CONFIG)[nextIndex];
  handleMenuClick(MENU_CONFIG[nextIcon]);
};
// #endregion

// #region 图标组件管理
// 添加图标组件映射函数
const AnthropicIcon = defineComponent({
  name: 'AnthropicIcon',
  render() {
    return h(
      'svg',
      {
        fill: '#00000',
        fillRule: 'evenodd',
        style: 'flex:none;line-height:1',
        viewBox: '0 0 24 24',
        width: '1em',
        xmlns: 'http://www.w3.org/2000/svg'
      },
      [
        h('title', null, 'Anthropic'),
        h('path', {
          d: 'M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z'
        })
      ]
    );
  }
});

const ChatIcon = defineComponent({
  name: 'ChatIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '32',
      height: '32',
      viewBox: '0 0 24 24'
    }, [
      h('defs', null, [
        h('mask', { id: 'solarChatRoundDotsBold0' }, [
          h('g', { fill: 'none' }, [
            h('path', {
              fill: '#fff',
              d: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22'
            }),
            h('path', {
              fill: '#000',
              d: 'M15 12a1 1 0 1 0 2 0a1 1 0 0 0-2 0m-4 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0m-4 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0'
            })
          ])
        ])
      ]),
      h('path', {
        fill: 'currentColor',
        d: 'M0 0h24v24H0z',
        mask: 'url(#solarChatRoundDotsBold0)'
      })
    ])
  }
});

const MailIcon = defineComponent({
  name: 'MailIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '32',
      height: '32',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M19 22q-1.65 0-2.825-1.175T15 18v-4.5q0-1.05.725-1.775T17.5 11t1.775.725T20 13.5V18h-2v-4.5q0-.2-.15-.35T17.5 13t-.35.15t-.15.35V18q0 .825.588 1.413T19 20t1.413-.587T21 18v-4h2v4q0 1.65-1.175 2.825T19 22M3 18q-.825 0-1.412-.587T1 16V4q0-.825.588-1.412T3 2h16q.825 0 1.413.588T21 4v6h-3.5q-1.45 0-2.475 1.025T14 13.5V18zm8-7l8-5V4l-8 5l-8-5v2z'
      })
    ])
  }
});

const UserIcon = defineComponent({
  name: 'UserIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '32',
      height: '32',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M5.85 17.1q1.275-.975 2.85-1.537T12 15t3.3.563t2.85 1.537q.875-1.025 1.363-2.325T20 12q0-3.325-2.337-5.663T12 4T6.337 6.338T4 12q0 1.475.488 2.775T5.85 17.1M12 13q-1.475 0-2.488-1.012T8.5 9.5t1.013-2.488T12 6t2.488 1.013T15.5 9.5t-1.012 2.488T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22'
      })
    ])
  }
});

const ArchivesIcon = defineComponent({
  name: 'ArchivesIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '32',
      height: '32',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        fill: 'currentColor',
        d: 'M5 2.25h14A2.75 2.75 0 0 1 21.75 5v3a.75.75 0 0 1-.75.75h-.25V19A2.75 2.75 0 0 1 18 21.75H6A2.75 2.75 0 0 1 3.25 19V8.75H3A.75.75 0 0 1 2.25 8V5A2.75 2.75 0 0 1 5 2.25m-1.25 5h16.5V5c0-.69-.56-1.25-1.25-1.25H5c-.69 0-1.25.56-1.25 1.25zm6.75 3.5a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5z'
      })
    ])
  }
});

const getIconComponent = (icon) => {
  const iconMap = {
    chat: ChatIcon,
    mail: MailIcon,
    user: UserIcon,
    aichat: AnthropicIcon,
    archives: ArchivesIcon
  };
  return iconMap[icon] || ChatIcon;
};
// #endregion

// #region 群聊创建功能
// 添加新的响应式变量
const showCreateGroupDialog = ref(false);
const groupForm = ref({
  name: '',
  avatar: '',
  announcement: ''
});

// 处理显示创建群聊弹窗
const handleShowCreateGroupDialog = () => {
  showCreateGroupDialog.value = true;
};

// 处理创建群聊
async function handleCreateGroup() {
  let avatarUrl = groupForm.value.avatar;
  if (groupAvatarFile.value) {
    const res = await uploadImageFile(groupAvatarFile.value);
    avatarUrl = res.data;
  }
  try {
    const payload = {
      name: groupForm.value.name,
      avatar: avatarUrl,
      groupDesc: groupForm.value.announcement
    };
    const res = await addGroupRoom(payload);
    if (res.code === 200) {
      ArcMessage.success('群聊创建成功');
      showCreateGroupDialog.value = false;
      handleResetForm();
      // 刷新群聊列表
      groupQuery.value.page = 1;
      noMoreGroups.value = false;
      await fetchGroupListRaw();
    } else {
      ArcMessage.error(res.msg || '创建群聊失败');
    }
  } catch (error) {
    ArcMessage.error('创建失败，请稍后重试');
  }
};


// 处理重置表单
const handleResetForm = () => {
  groupForm.value = {
    name: '',
    avatar: '',
    announcement: ''
  };
  groupAvatarFile.value = null;
  groupAvatarPreview.value = '';
};
// #endregion

// #region 聊天功能
// 修改处理聊天点击事件
const handleChat = (contact) => {
  // 如果当前已经在聊天页面，且用户ID相同，则不进行跳转
  if (route.path === '/chat' && route.params.id === contact.id.toString()) {
    return;
  }
  // 设置当前聊天对象
  const roomId = contact.roomId;
  //TODO: 调用服务端更新read_time
  contactStore.setCurrentChat(contact.id);
  // 本地清除未读数，移除红点和闪烁动画
  const idx = contactList.value.findIndex(c => c.contactId === contact.contactId);
  if (idx !== -1) {
    contactList.value[idx].unreadCount = 0;
  }
  router.push(`/chat/${contact.id}`);
};
// #endregion

// #region 消息通知功能
// 添加消息通知相关的响应式变量
const messageNotificationRef = ref(null);
const notificationMessage = ref('');

// 处理通知点击
const handleNotificationClick = () => {
  emitter.emit('refresh-mail-data');
  router.push('/mail');

};
// #endregion

// #region 签到功能
const showSignInCalendar = ref(false);
const signedDates = ref([]);
const isTodaySignedIn = ref(false);
const consecutiveDays = ref(0);
const totalDays = ref(0);

// ExpDialog控制
const showExpDialog = ref(false);
const expDialogTitle = ref('获得100EX !');

const initSignInData = async () => {
  const detail = await getSignInDetail();
  signedDates.value = getSignedDates(detail);
  isTodaySignedIn.value = checkTodaySignIn(detail);
  consecutiveDays.value = getConsecutiveSignInDays(detail);
  totalDays.value = getTotalSignInDays(detail);
};

const handleShowSignInCalendar = async () => {
  await initSignInData();
  showSignInCalendar.value = true;
};

const handleSignInClick = async (date) => {
  const today = new Date();
  if (
    date.getFullYear() !== today.getFullYear() ||
    date.getMonth() !== today.getMonth() ||
    date.getDate() !== today.getDate()
  ) return;
  if (isTodaySignedIn.value) return;
  const success = await handleSignIn();
  if (success) {
    await initSignInData();
    // 显示经验值弹窗
    showExpDialog.value = true;
    setTimeout(() => {
      showExpDialog.value = false;
    }, 2000);
  }
};

const calendarBtnStyle = computed(() => ({
  background: isDarkMode.value ? '#2253a7' : '#409EFF',
  border: 'none',
  boxShadow: isDarkMode.value
    ? '0 2px 8px rgba(34,83,167,0.18)'
    : '0 2px 8px rgba(64, 158, 255, 0.18)',
  transition: 'background 0.3s',
}));

const dropdownBtnStyle = computed(() => ({
  background: 'transparent',
  border: 'none',
  boxShadow: 'none'
}));

const dropdownIconFillColor = computed(() => {
  if (isDropDownVisible.value) {
    return isDarkMode.value ? '#818cf8' : '#a78bfa'; // Active color
  } else {
    return isDarkMode.value ? '#4f46e5' : '#7c3aed'; // Inactive color
  }
});
// #endregion

// #region 群聊功能
// 添加处理群聊点击事件
const handleGroupChat = (group) => {
  // 如果当前已经在该群聊页面，则不进行跳转
  if (route.path === '/groupchat' && route.params.id === group.roomId?.toString()) {
    return;
  }
  contactStore.setCurrentChat(group.id);
  const idx = groupList.value.findIndex(c => c.id === group.id);
  if (idx !== -1) {
    groupList.value[idx].unreadCount = 0;
  }
  router.push(`/groupchat/${group.roomId}`);
};

const groupQuery = ref({
  page: 1,
  pageSize: 10
});
const isLoadingGroups = ref(false);
const noMoreGroups = ref(false);

// 无限滚动加载更多群聊
const loadMoreGroups = () => {
  // 判断 WebSocket 是否连接
  if (connectionStatus.value !== 'connected') return;
  loadMoreList({
    apiList: getGroupList,
    apiUnread: getUnreadMsgCnt,
    query: groupQuery.value,
    listRef: groupList,
    getId: g => g.roomId,
    getLastMsgId: g => g.lastMsgId,
    getLatestMsg: getGroupLatestMessage,
    isLoadingRef: isLoadingGroups,
    noMoreRef: noMoreGroups,
    pageSizeKey: 'pageSize'
  });
};
// #endregion

// #region 计算属性
// 添加计算属性用于过滤联系人和群组
const filteredContacts = computed(() => {
  if (!searchQuery.value) return contactList.value;
  const query = searchQuery.value.toLowerCase();
  return contactList.value.filter(contact =>
    contact.username.toLowerCase().includes(query) ||
    String(contact.friendId).includes(query)
  );
});

const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupList.value;
  const query = searchQuery.value.toLowerCase();
  return groupList.value.filter(group =>
    group.name.toLowerCase().includes(query) ||
    String(group.roomId).includes(query)
  );
});
// #endregion

function getSenderName(contact) {
  const fromUid = messageSenders.value.get(contact.id);
  if (!fromUid) return '';
  const friend = friendMap.value.get(fromUid);
  return friend ? friend.username : '';
}

const groupMessagePreviews = ref(new Map());
const groupMessageSenders = ref(new Map());

const getGroupLatestMessage = async (group) => {
  if (!group.lastMsgId) return;
  try {
    const res = await getMessageById(group.lastMsgId);
    if (res.code === 200) {
      groupMessagePreviews.value.set(group.roomId, res.data.content);
      groupMessageSenders.value.set(group.roomId, res.data.fromUid);
    }
  } catch (error) {
    // 错误处理
  }
};

// 优化的群聊消息更新函数 - 只更新特定群聊的最新消息和未读数量
const updateSpecificGroupMessage = async (roomId) => {
  if (!roomId) return;
  
  try {
    // 找到对应的群聊
    const groupIndex = groupList.value.findIndex(group => group.roomId === roomId);
    if (groupIndex === -1) {
      console.log('未找到对应的群聊，可能需要重新加载群聊列表');
      // 如果找不到群聊，可能是新加入的群，此时才调用完整的重新加载
      await fetchGroupListRaw();
      return;
    }
    
    // 获取该群聊的未读数量（使用contactId参数）
    const unreadRes = await getUnreadMsgCnt({ 
      page: 1, 
      pageSize: 10, // 获取多个可能的未读记录
      contactId: roomId 
    });
    
    if (unreadRes.code === 200) {
      // 处理未读数量数据
      const unreadCount = unreadRes.data?.records?.find(record => 
        String(record.contactId) === String(roomId)
      )?.unreadCount || 0;
      
      // 更新群聊的未读数量
      if (groupList.value[groupIndex]) {
        groupList.value[groupIndex].unreadCount = unreadCount;
      }
      
      // 重新获取群聊列表来获取最新的lastMsgId（只获取少量数据进行对比）
      const groupRes = await getGroupList({ 
        page: 1, 
        pageSize: 20 // 获取前20个群聊进行查找
      });
      
      if (groupRes.code === 200 && groupRes.data.records) {
        // 在返回的群聊列表中找到对应的群聊
        const updatedGroup = groupRes.data.records.find(group => 
          String(group.roomId) === String(roomId)
        );
        
        if (updatedGroup) {
          // 检查lastMsgId是否有变化
          const oldLastMsgId = groupList.value[groupIndex].lastMsgId;
          const newLastMsgId = updatedGroup.lastMsgId;
          
          if (oldLastMsgId !== newLastMsgId) {
            // 更新群聊的最新消息ID和时间
            groupList.value[groupIndex].lastMsgId = newLastMsgId;
            groupList.value[groupIndex].lastMsgTime = updatedGroup.lastMsgTime;
            
            // 获取最新消息内容
            if (newLastMsgId) {
              await getGroupLatestMessage(groupList.value[groupIndex]);
            }
          }
        }
      }
      
      // 更新联系人存储
      contactStore.setGroupChats(groupList.value);
      
      console.log(`群聊 ${roomId} 消息已更新，未读数量: ${unreadCount}`);
    }
  } catch (error) {
    console.error('更新群聊消息失败:', error);
    // 如果单独更新失败，降级到完整重新加载
    await fetchGroupListRaw();
  }
};

function getGroupSenderName(group) {
  const fromUid = groupMessageSenders.value.get(group.roomId);
  if (!fromUid) return '';
  // 先查好友列表
  const friend = friendMap.value.get(fromUid);
  if (friend) return friend.username;
  // 再查群成员
  const groupObj = groupList.value.find(g => g.roomId === group.roomId);
  if (groupObj && groupObj.members) {
    const member = groupObj.members.find(m => m.id === fromUid);
    if (member) return member.name;
  }
  return '';
}
</script>



<style scoped>

.visitor-tag {
  position: absolute;
  right: 10px;
  top: 50px;
  padding: 4px 10px;
  color: #fff;
  background: rgba(5, 70, 211, 0.35);
  /* 半透明灰色 */
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  opacity: 1;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.icon-bar {
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 毛玻璃效果 */
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  /* 嵌入式效果 */
  box-shadow:
    inset 0 2px 8px 0 rgba(255, 255, 255, 0.25),
    0 4px 24px 0 rgba(0, 0, 0, 0.10);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  /* 反光高光 */
  position: relative;
  overflow: hidden;
}


.dark-mode .icon-bar {
  box-shadow:
    inset 0 2px 12px 0 rgba(255, 255, 255, 0.10),
    0 4px 24px 0 rgba(0, 0, 0, 0.30);
  border: 1.5px solid rgba(255, 255, 255, 0.10);
}

.dark-mode .icon-bar::before {
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%);
  opacity: 0.5;
}

.dark-mode .icon-bar::after {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.02) 100%);
  opacity: 0.3;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 优化动画性能 */
* {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.member-count {
  font-size: 12px;
  color: var(--el-color-primary);
}

.no-results {
  padding: 40px 0;
}

/* 暗色模式适配 */
.dark-mode .result-item {
  background: rgba(255, 255, 255, 0.1);
}

.dark-mode .result-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.create-group-content {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.create-group-form {
  padding: 32px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.create-group-form:hover {
  transform: translateY(-2px);
}

.create-group-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.custom-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 0 20px;
  height: 52px;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-clear-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;
}

.input-clear-icon:hover {
  color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.1);
  transform: scale(1.1);
}

.input-clear-icon:active {
  transform: scale(0.95);
}

.custom-textarea :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  min-height: 120px;
  transition: all 0.3s ease;
}

.custom-textarea :deep(.el-textarea__inner:hover) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
}

.custom-textarea :deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.avatar-uploader {
  text-align: center;
}

.avatar-wrapper {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--el-border-color-light);
  margin: 0 auto;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  border-color: var(--el-color-primary);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  color: var(--el-text-color-secondary);
  transition: all 0.3s ease;
}

.avatar-uploader-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.button-group .el-button {
  width: 100px;
  height: 34px;
  font-size: 16px;
  border-radius: 10px;
  transition: all 0.5s ease;
}

.button-group .el-button--primary {
  background: linear-gradient(45deg, #2196F3, #00BCD4);
  border: none;
}

.button-group .el-button--primary:hover {
  background: linear-gradient(45deg, #1E88E5, #00ACC1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.button-group .el-button--danger {
  background: linear-gradient(45deg, #FF5252, #FF4081);
  border: none;
}

.button-group .el-button--danger:hover {
  background: linear-gradient(45deg, #F44336, #E91E63);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
}

.button-group .el-button:active {
  transform: translateY(0);
}

/* 暗色模式适配 */
.dark-mode .create-group-form {
  background: transparent;
}

.dark-mode .create-group-form:hover {
  transform: translateY(-2px);
}

.dark-mode .reset-btn:hover {
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.switch-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #909399;
  /* 默认颜色为灰色 */
}

.switch-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  /* 悬停时变为蓝色 */
}

.switch-btn.active {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  /* 激活状态为蓝色 */
}

.switch-btn svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.switch-btn:hover svg {
  transform: scale(1.1);
}

.conversation-list {
  padding: 12px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

/* 日间模式 */
.conversation-item {
  background: linear-gradient(to bottom, #f5f7fa, #e4e7ed);
  border: 1px solid #dcdfe6;
}

.conversation-item:hover {
  background: linear-gradient(to bottom, #e4e7ed, #dcdfe6);
  transform: translateY(1px);
}

.conversation-item.active {
  background: linear-gradient(45deg, #274472 0%, #409EFF 100%);
  border-color: #409EFF;
  box-shadow: 0 2px 16px 0 rgba(64, 158, 255, 0.45);
}

.dark-mode .conversation-item.active {
  background: linear-gradient(45deg, #274472 0%, #409EFF 100%);
  border-color: #409EFF;
  box-shadow: 0 2px 16px 0 rgba(64, 158, 255, 0.45);
}

.conversation-item.active .company-name,
.conversation-item.active .timestamp,
.conversation-item.active .message-preview {
  color: #ffffff;
}

/* 暗色模式 */
.dark-mode .conversation-item {
  background: linear-gradient(to bottom, #2b2b2b, #1f1f1f);
  border: 1px solid #363636;
}

.dark-mode .conversation-item:hover {
  background: linear-gradient(to bottom, #363636, #2b2b2b);
  transform: translateY(1px);
}


.dark-mode .conversation-item.active .company-name,
.dark-mode .conversation-item.active .timestamp,
.dark-mode .conversation-item.active .message-preview {
  color: #ffffff;
}

.dark-mode .company-name {
  color: #ffffff;
  font-weight: 600;
}

.dark-mode .timestamp {
  color: #a0a0a0;
}

.dark-mode .message-preview {
  color: #b0b0b0;
}


.conversation-avatar {
  position: relative;
  margin-right: 12px;
}

.item-unread-badge {

  position: absolute;
  top: -1.5px;
  left: 1.5px;
  pointer-events: none;
}

.conversation-item.has-unread {
  animation: flash-item 1s linear infinite alternate;
}

:deep(.el-badge__content--danger) {
  scale: 1.1;
  background: linear-gradient(145deg, #ff4e6a 0%, #e00d3a 60%, #ffb3c0 100%);
  border: 0;
  z-index: 10000 !important;
  /* 毛玻璃效果 */
  backdrop-filter: blur(6px) saturate(180%);
  -webkit-backdrop-filter: blur(6px) saturate(180%);
  /* 立体高光反光 */
  box-shadow:
    0 2px 8px 0 rgba(224, 13, 58, 0.18),
    0 4px 16px 0 rgba(255, 80, 120, 0.18),
    inset 0 2px 8px 0 rgba(255, 255, 255, 0.45),
    inset 0 8px 16px 0 rgba(255, 255, 255, 0.18);
  /* 轻微边框以增强毛玻璃感 */
  border: 1px solid rgba(255, 255, 255, 0.18);
  /* 反光高光 */
  position: relative;
  overflow: visible;
}

:deep(.el-badge__content--danger)::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 8px;
  width: 60%;
  height: 30%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.12) 100%);
  border-radius: 50%;
  filter: blur(1px);
  pointer-events: none;
  opacity: 0.85;
}

@keyframes flash-item {
  0% {
    background: rgba(192, 255, 0, 0.18);
    /* 黄绿色，透明 */
  }

  50% {
    background: rgba(192, 255, 0, 0.38);
    /* 更高透明度，增强对比 */
  }

  100% {
    background: rgba(192, 255, 0, 0.18);
  }
}

.dark-mode .conversation-item.has-unread {
  animation: flash-item-dark 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes flash-item-dark {
  0% {
    background: rgba(192, 255, 0, 0.18);
    /* 黄绿色，透明 */
  }

  50% {
    background: rgba(192, 255, 0, 0.38);
    /* 更高透明度，增强对比 */
  }

  100% {
    background: rgba(192, 255, 0, 0.18);
  }
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  transition: background-color 0.3s ease;
}

.online-status.online .status-dot {
  background-color: #67C23A;
}

.conversation-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.company-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 15px;
}

.timestamp {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.message-preview {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;

  margin-left: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}

.dark-mode .message-time {
  color: #a0a0a0;
}

.empty-conversation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 240px;
  padding: 20px;
}

.empty-content {
  text-align: center;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 32px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
  opacity: 0.8;
}

.empty-content h3 {
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--text-color);
}

.empty-content p {
  font-size: 13px;
  color: var(--text-color-secondary);
  opacity: 0.8;
}

/* 暗色模式适配 */
.dark-mode .empty-content {
  color: var(--text-color-secondary);
}

.start-chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.calendar-btn,
.dropdown-grid-btn {
  transition: background 0.3s;
}

.calendar-btn:hover,
.dropdown-grid-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.sign-dialog {
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.sign-dialog .el-dialog__body {
  padding: 0 24px 24px 24px;
}

.sign-calendar-wrapper {
  padding: 12px 0 0 0;
}

.sign-calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.sign-calendar-title {
  letter-spacing: 2px;
}

.sign-cell {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  user-select: none;
}

:deep(.el-calendar__header) {
  display: none !important;
}

:deep(.el-calendar-table .signed-cell) {
  background: #67C23A !important;
  color: #fff !important;
}

:deep(.el-calendar-table .unsigned-cell) {
  background: #B71A1A !important;
  color: #fff !important;
}

:deep(.el-calendar-table .today-cell) {
  background: #409EFF !important;
  color: #fff !important;
}

.dark-mode :deep(.el-calendar-table .future-cell) {
  background: #23272e !important;
  color: #555 !important;
}

.sign-close-btn {
  border-radius: 8px;
  min-width: 80px;
  font-size: 15px;
}

.dark-mode .sign-dialog {
  background: #23272e;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.38);
}

.dark-mode .sign-calendar-header {
  color: #90caf9;
}


.scroll-wrapper::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari */
}

.sidebar-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 12px auto;
  transition: all 0.3s ease;
  background: rgba(33, 36, 226, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #6466f5;
}

.sidebar-toggle-btn:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar-toggle-btn.collapsed {
  background: rgba(46, 125, 50, 0.1);
  border-color: rgba(46, 125, 50, 0.3);
}

.sidebar-toggle-btn.collapsed:hover {
  background: rgba(46, 125, 50, 0.15);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

/* 暗色模式适配 */
.dark-mode .sidebar-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .sidebar-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dark-mode .sidebar-toggle-btn.collapsed {
  background: rgba(46, 125, 50, 0.08);
  border-color: rgba(46, 125, 50, 0.2);
}

.dark-mode .sidebar-toggle-btn.collapsed:hover {
  background: rgba(46, 125, 50, 0.12);
}

:deep(.el-calendar) {
  background: transparent !important;
  border: none !important;
}

:deep(.el-calendar-table) {
  background: transparent !important;
  border: none !important;
}

:deep(.el-calendar-table td) {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  height: 54px !important;
  transition: background 0.2s;
}

:deep(.el-calendar-table .sign-cell-text) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0 auto;
  font-size: 17px;
  font-weight: 700;
  border-radius: 50%;
  box-shadow: none;
  background: none;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s, color 0.2s;
  cursor: pointer;
  user-select: none;
}

:deep(.el-calendar-table .sign-cell-text:hover) {
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.10);
  transform: translateY(-2px) scale(1.08);
}

:deep(.el-calendar-table .signed-cell.sign-cell-text) {
  background: #1AAD19 !important;
  color: #fff !important;
}

:deep(.el-calendar-table .unsigned-cell.sign-cell-text) {
  background: #B71A1A !important;
  color: #fff !important;
}

:deep(.el-calendar-table .today-cell.sign-cell-text) {
  background: #409EFF !important;
  color: #fff !important;
}

.dark-mode :deep(.el-calendar-table .sign-cell-text) {
  color: #eee;
  background: none;
}

.dark-mode :deep(.el-calendar-table .signed-cell.sign-cell-text) {
  background: #1AAD19 !important;
  color: #fff !important;
}

.dark-mode :deep(.el-calendar-table .unsigned-cell.sign-cell-text) {
  background: #B71A1A !important;
  color: #fff !important;
}

.dark-mode :deep(.el-calendar-table .today-cell.sign-cell-text) {
  background: #409EFF !important;
  color: #fff !important;
}

.dark-mode :deep(.el-calendar-table .sign-cell-text[disabled]),
.dark-mode :deep(.el-calendar-table .sign-cell-text.disabled) {
  background: #23272e !important;
  color: #555 !important;
}

.dark-mode :deep(.el-calendar-table .prev-month .sign-cell-text),
.dark-mode :deep(.el-calendar-table .next-month .sign-cell-text) {
  background: none !important;
  color: #444 !important;
  font-weight: 400;
}

.signin-calendar-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 24px;
}

.calendar-ym {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: #222;
}

.calendar-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.dark-mode .calendar-ym {
  color: #fff;
}

.dark-mode .calendar-stats .stat-item {
  color: #aaa;
}

.avatar-offline {
  filter: grayscale(1) brightness(0.8);
  opacity: 0.7;
}

.dropdown-grid-btn svg {
  transition: transform 0.3s ease;
}

.dropdown-grid-btn svg.rotated {
  transform: rotate(180deg);
}

.dropdown-grid-btn.el-button {
  background-color: transparent !important;
}
</style>


