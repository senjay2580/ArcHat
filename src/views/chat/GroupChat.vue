<template>
  <div class="chat-container">
    <!-- 遮罩和加载动画 -->
    <div v-if="isReconnecting" class="ws-reconnect-mask">
      <WaitConnLoading />
    </div>
    <!-- 顶部群聊信息 -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="40" class="user-avatar" :src="currentGroup.avatar" @click="showGroupDetailPopupHandler"
          style="cursor:pointer;" />
        <div class="user-details">
          <div class="user-name">{{ currentGroup.name }}</div>
          <div class="user-subtitle">
            <span class="online-dot"></span><span class="online-count-label">在线人数:{{ onlineCount }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 群聊详情弹窗 -->
    <GroupDetailPopup v-if="showGroupDetailPopup" :visible="showGroupDetailPopup" :group="currentGroup"
      :position="groupDetailPopupPosition" @update:visible="showGroupDetailPopup = false" ref="groupDetailPopupRef" @group-more="handleGroupMoreClick"/>
    <GroupDetailDrawer 
        v-model:visible="showGroupDrawer"
        :group="selectedGroupForDrawer"
      />
    <!-- 聊天消息区 -->
    <div class="chat-message-list" ref="messagesContainer" style="position: relative;">
      <!-- 遮罩层，点击关闭抽屉 -->
      <div v-if="showMemberDrawer" class="drawer-mask" @click="showMemberDrawer = false"></div>
      <template v-if="messages.length > 0">
        <div v-for="(msg, idx) in messages" :key="msg.id || idx" 
             class="message-wrapper" 
             :data-msg-id="msg.id || idx"
             v-show="!isLoading"
             :style="{ minHeight: msg.isVisible ? 'auto' : '60px' }">
          <template v-if="msg.isVisible">
            <div v-if="shouldShowTime(msg, idx)" class="message-time-group">
              <span class="time-divider">{{ formatMessageDate(new Date(msg.time)) }}</span>
            </div>
            <!-- 撤回消息特殊样式 -->
            <div v-if="msg.isRecalled || msg.type === 2" class="recall-message-wrapper">
              <div class="recall-message-content">
                <svg class="recall-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2" opacity=".5"/>
                  <path fill="currentColor" d="M10.564 7.461a.75.75 0 1 1 .871 1.22l-3.221 2.302a1.25 1.25 0 0 0 0 2.034l3.221 2.301a.75.75 0 1 1-.871 1.22l-3.222-2.3a2.75 2.75 0 0 1 0-4.476z"/>
                  <path fill="currentColor" d="M16.5 15.132V8.869a1 1 0 0 0-1.555-.832l-4.697 3.131a1 1 0 0 0 0 1.664l4.697 3.132a1 1 0 0 0 1.555-.832"/>
                </svg>
                <span class="recall-text">{{ msg.body }}</span>
              </div>
            </div>
            <!-- 普通消息 -->
            <div v-else :class="['chat-message-item', msg.side]">
                <el-avatar v-if="msg.side === 'left'" :size="40" class="user-avatar"
                :src="msg.avatar && msg.avatar.trim() ? msg.avatar : undefined" :alt="msg.username"
                @click="(e) => handleAvatarClick(e, msg)" style="cursor:pointer;">
                <template v-if="!msg.avatar || !msg.avatar.trim()">
                  {{ msg.username ? msg.username.charAt(0) : '' }}
                </template>
              </el-avatar>
              <div class="msg-main" @contextmenu.prevent="handleRightClick(msg, $event)">
                <!-- 新增：左侧消息显示用户名 -->
                <div v-if="msg.side === 'left'"
                     class="msg-username"
                     :class="{'owner-name': msg.role === 1, 'admin-name': msg.role === 2}">
                  {{ msg.username }}
                </div>
                <!-- 文件消息 -->
                <template v-if="msg.type === 4 && msg.body && msg.body.url">
                  <div :class="['file-msg', getFileTypeClass(msg.body.fileName || msg.body.name)]">
                    <a :href="msg.body.url" :download="msg.body.fileName || msg.body.name" target="_blank">
                      <div class="file-msg-content">
                        <div class="file-msg-info">
                          <div class="file-msg-name">{{ msg.body.fileName || msg.body.name }}</div>
                          <div class="file-msg-size">{{ formatFileSize(msg.body.size) }}</div>
                        </div>
                        <div class="file-msg-icon" v-html="getFileSvg((msg.body.fileName || msg.body.name).split('.').pop().toLowerCase())"></div>
                      </div>
                      <div class="file-msg-footer">
                        <div class="file-msg-divider"></div>
                        <div class="file-msg-arc-icon">ARC File</div>
                      </div>
                    </a>
                  </div>
                </template>
                <!-- 图片消息 -->
                <template v-else-if="msg.type === 3 && msg.body && msg.body.url">
                  <el-image :src="msg.body.url" :preview-src-list="[msg.body.url]" class="img-shadow"
                    style="max-width:280px;max-height:580px;border-radius:8px;" />
                </template>
                <!-- 普通文本消息 -->
                <template v-else>
                  <div class="chat-bubble" v-html="getMessageText(msg)"></div>
                </template>
              </div>
              <el-avatar v-if="msg.side === 'right'" :size="40" class="user-avatar" :src="userStore.userInfo.avatar" />
            </div>
          </template>
        </div>
        <!-- 加载中的消息 -->
        <div v-for="(loadingMsg, idx) in loadingMessages" :key="'loading-' + idx" 
             class="message-wrapper">
          <div class="chat-message-item right">
            <div class="msg-main">
              <!-- 文本消息加载状态 -->
              <div v-if="loadingMsg.type === 'text'" class="message-container message-sending">
                <div class="chat-bubble">{{ loadingMsg.content }}</div>
                <!-- 右下角加载动画 -->
                <div v-if="loadingMsg.status === 'sending'" class="message-loading-indicator">
                  <div class="loading-spinner-mini"></div>
                </div>
              </div>
              <!-- 图片消息加载状态 -->
              <div v-else-if="loadingMsg.type === 'image'" class="message-container message-sending">
                <img :src="loadingMsg.previewUrl" alt="发送中" class="img-shadow" 
                     style="max-width:280px;max-height:580px;border-radius:8px;" />
                <!-- 右下角加载动画 -->
                <div v-if="loadingMsg.status === 'sending'" class="message-loading-indicator">
                  <div class="loading-spinner-mini"></div>
                </div>
              </div>
              <!-- 文件消息加载状态 -->
              <div v-else-if="loadingMsg.type === 'file'" class="message-container message-sending">
                <div class="file-msg" :class="getFileTypeClass(loadingMsg.fileExt)">
                  <div class="file-msg-content">
                    <div class="file-msg-info">
                      <div class="file-msg-name">{{ loadingMsg.fileName }}</div>
                      <div class="file-msg-size">{{ formatFileSize(loadingMsg.fileSize) }}</div>
                    </div>
                    <div class="file-msg-icon" v-html="getFileSvg(loadingMsg.fileExt)"></div>
                  </div>
                  <div class="file-msg-footer">
                    <div class="file-msg-divider"></div>
                    <div class="file-msg-arc-icon">ARC</div>
                  </div>
                </div>
                <!-- 右下角加载动画 -->
                <div v-if="loadingMsg.status === 'sending'" class="message-loading-indicator">
                  <div class="loading-spinner-mini"></div>
                </div>
              </div>
              <!-- 发送失败的重发按钮 -->
              <div v-if="loadingMsg.status === 'failed'" class="message-retry-btn" @click="retryMessage(loadingMsg)">
                <svg class="retry-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                重发
              </div>
            </div>
            <el-avatar :size="40" class="user-avatar" :src="userStore.userInfo.avatar" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="no-message-tip" v-show="!isLoading">没有聊天记录</div>
      </template>
      <div v-if="isLoading" class="loading-wrapper">
        <Loading />
      </div>
      <!-- 群成员抽屉按钮 -->
      <div class="member-drawer-btn-wrapper" ref="memberDrawerBtnRef">
        <el-button type="primary" icon="UserFilled" @click="showMemberDrawer = true"
          class="member-btn-semicircle">群成员</el-button>
      </div>
      <!-- 群成员自定义抽屉，仅覆盖聊天区 -->
      <transition name="drawer-slide">
        <div v-if="showMemberDrawer" class="custom-member-drawer" ref="memberDrawerRef">
          <div class="drawer-header">
            <MacWindowControls @close="showMemberDrawer = false" style="margin-right: 8px; top: 2px" />
          </div>
          <div class="group-description-section" v-if="currentGroup.groupDesc">
            <div class="group-description-title">群公告</div>
            <div class="group-description-content">{{ currentGroup.groupDesc }}</div>
          </div>
          <div class="member-list">
            <div v-for="member in currentGroup.members.slice(0, 7)" :key="member.id" class="member-item">
              <div class="member-avatar-wrapper">
                <el-avatar :size="32" :src="member.avatar"
                  :class="[member.role === 1 ? 'avatar-owner' : member.role === 2 ? 'avatar-admin' : '']"
                  @click="(e) => handleMemberClick(e, member)" style="cursor:pointer;" />
                <span class="member-status-dot"
                  :class="{ online: member.status === 1, offline: member.status !== 1 }"></span>
              </div>
              <span>{{  member.name }}</span>
            </div>
          </div>
        </div>
      </transition>
      <!-- 用户详情弹窗 -->
      <UserDetailPopup v-if="showUserDetailPopup" :visible="showUserDetailPopup" :user="userDetail"
        :position="userDetailPopupPosition" @update:visible="showUserDetailPopup = false" @start-chat="handleStartChat"
        @add-friend="handleAddFriend">
        <template #footer>
          <template v-if="userDetail.id !== userStore.userInfo.uid">
            <DangerButton v-if="isFriend(userDetail.id)" type="primary" @click="handleStartChat">开始聊天</DangerButton>
            <DangerButton v-else type="warning" @click="handleAddFriend">添加好友</DangerButton>
          </template>
        </template>
      </UserDetailPopup>
    </div>
    <!-- 底部输入区 -->
    <div class="message-input-container" ref="inputContainer" style="position: relative;"
         @dragover.prevent
         @drop.prevent="handleDropFile">
      <!-- 多图预览区，悬浮在输入框上方 -->
      <div v-if="imagePreviewUrls.length" class="image-preview-floating">
        <div v-for="(url, idx) in imagePreviewUrls" :key="url" class="image-preview-item">
          <img :src="url" class="image-preview-thumb" />
          <el-button class="image-preview-close" circle
            @click="() => { imagePreviewUrls.splice(idx, 1); selectedImages.splice(idx, 1); }">
            <el-icon>
              <Close style="color: #f56c6c; scale: 1.2;" />
            </el-icon>
          </el-button>
        </div>

      </div>
      <!-- 文件和图片预览区，居中显示，超出横向滚动 -->
      <div v-if="imagePreviewUrls.length || filePreviewList.length"
        class="file-image-preview-bar file-image-preview-center">

        <!-- 文件预览 -->
        <div v-for="(preview, idx) in filePreviewList" :key="preview.previewKey" class="preview-card"
          :title="preview.fileName">
          <div class="preview-card-inner">
            <span :class="['file-icon-large', preview.fileTypeClass]">{{ preview.fileIcon }}</span>
            <div class="file-info-block">
              <div class="file-name-block">{{ preview.fileName }}</div>
              <div class="file-size-block">{{ formatFileSize(preview.file.size) }}</div>
            </div>
            <button class="remove-btn-card" @click="removePreviewFile(idx)">×</button>
          </div>
        </div>
      </div>
      <el-button ref="emojiButton" class="input-icon-btn" circle @click.stop="showEmojiPicker=!showEmojiPicker">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><mask id="lineMdEmojiGrinFilled0"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="#fff" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9"><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.5s" values="0;1"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M9 9v1"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.2s" dur="0.2s" values="2;0"/></path><path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M15 9v1"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.4s" dur="0.2s" values="2;0"/></path><path fill="#000" stroke="none" d="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z"><animate fill="freeze" attributeName="d" begin="1.6s" dur="0.2s" values="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z;M12 14c-2.5 0 -3.25 -1 -4 -1c-0.55 0 -1 0.45 -1 1c0 0.75 1.5 4 5 4c3.5 0 5 -3.25 5 -4c0 -0.55 -0.45 -1 -1 -1c-0.75 0 -1.5 1 -4 1Z"/></path></g></mask><rect width="24" height="24" fill="currentColor" mask="url(#lineMdEmojiGrinFilled0)"/></svg>
      </el-button>
      <el-button class="input-icon-btn" circle @click="triggerImageInput">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm1-4h12l-3.75-5l-3 4L9 13z"/></svg>
      </el-button>
      <el-button class="input-icon-btn" circle @click="triggerFileInput">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="currentColor" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64" d="M12 7h8c0.55 0 1 0.45 1 1v10c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-11Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.5s" values="0;1"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"/></path><path d="M12 7h-9v0c0 0 0.45 0 1 0h6z" opacity="0"><animate fill="freeze" attributeName="d" begin="0.6s" dur="0.2s" values="M12 7h-9v0c0 0 0.45 0 1 0h6z;M12 7h-9v-1c0 -0.55 0.45 -1 1 -1h6z"/><set fill="freeze" attributeName="opacity" begin="0.6s" to="1"/></path></g></svg>
      </el-button>
      <input type="file" ref="imageInput" accept="image/*" multiple style="display:none" @change="onImageSelected" />
      <input type="file" ref="fileInput" multiple style="display:none" @change="onFileSelected"
        accept=".pdf,.doc,.docx,.md,.txt,.zip,.rar,.7z,.xlsx,.xls,.ppt,.pptx,.csv,.json,.xml,.html,.js,.ts,.vue,.mp3,.wav,.aac,.ogg" />

      <div class="message-input">
        <input type="text" v-model="inputValue" placeholder="Type a message..." @keyup.enter="sendMessage"
          ref="messageInput" />
      </div>
      <el-button class="send-button" @click="imagePreviewUrls.length ? sendImageMessage() : sendMessage()">
        <el-icon>
          <Position />
        </el-icon>
      </el-button>
    </div>
    <!-- #region Emoji 选择器 -->
    <EmojiPickerPopup
      ref="emojiPanel"
      :visible="showEmojiPicker"
      @emoji-click="onEmojiSelect"
    />
    <!-- #endregion -->
    <!-- 群聊专属功能区 -->
    <!-- WebSocket 连接状态提示（群聊） -->
    <div v-if="connectionStatus === 'disconnected'" class="connection-status-bar">
      <el-alert title="WebSocket 连接已断开" type="warning" :closable="false" show-icon
        style="--el-alert-title-color: #f56c6c; --el-alert-text-color: #409EFF;">
        <template #default>
          <span style="color:#409EFF; font-weight:600;">消息可能无法正常发送，请点击重新连接</span>
          <danger-button type="success" size="small" @click="handleManualReconnect"
            :loading="connectionStatus === 'connecting'" style="margin-left: 10px;">
            {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
          </danger-button>
        </template>
      </el-alert>
    </div>
    <RightKeyPop
      v-if="showRightKeyPop"
      ref="rightKeyPopRef"
      :calculating-position="isCalculatingPosition"
      :style="{
        position: 'fixed',
        left: rightKeyPopPosition.x + 'px',
        top: rightKeyPopPosition.y + 'px',
        zIndex: 99999
      }"
      :items="menuItems "
      @click.stop
      @mousedown.stop
      @contextmenu.stop
      @close="showRightKeyPop = false"
    />
    <ExpDialog v-if="showCopySuccess" :visible="showCopySuccess" title="复制成功" @update:visible="showCopySuccess = false" />
  </div>
</template>
<script setup>
// #region 导入依赖
import { ref, onMounted, watch, nextTick, computed, onBeforeUnmount, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDark } from '@vueuse/core';
import ArcMessage from '@/utils/ArcMessage';
import { ChatRound, Link, Position, UserFilled, Close, Picture, UploadFilled } from '@element-plus/icons-vue';
import 'emoji-picker-element';

import EmojiPickerPopup from '@/components/interaction/EmojiPickerPopup.vue';
import Loading from '@/components/feedback/loading.vue';
import MacWindowControls from '@/components/layout/MacWindowControls.vue';
import GroupDetailPopup from '@/components/business/GroupDetailPopup.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import UserDetailPopup from '@/components/business/UserDetailPopup.vue';
import WaitConnLoading from '@/components/feedback/WaitConnLoading.vue';
import RightKeyPop from '@/components/interaction/RightKeyPop.vue';
import ExpDialog from '@/components/feedback/ExpDialog.vue';
import GroupDetailDrawer from '@/components/business/GroupDetailDrawer.vue';

import { getGroupDetail, listGroupMember, getGroupMemberCount } from '@/api/room';
import { getGroupMessageList, sendMsg, recallMsg } from '@/api/chatService';
import { searchFriends, addFriend } from '@/api/friend';

import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';

import { formatDateTime } from '@/utils/time';
import { calculateLevel } from '@/utils/exp';
import { uploadImageFile } from '@/utils/fileHandler';
import { getFileSvg } from '@/utils/filesIcons';
import emitter from '@/utils/eventBus';
// #endregion

// #region 基础状态
const route = useRoute();
const router = useRouter();
const userStore = useUserInfoStore();
const contactStore = useContactStore();
// #endregion

// #region 数据存储
// 消息相关
const messages = ref([]); // 群聊消息列表
const inputValue = ref(''); // 输入框内容
const messagesContainer = ref(null); // 消息容器DOM引用
const messageInput = ref(null); // 输入框DOM引用
const loadingMessages = ref([]); // 正在加载的消息ID列表
const observer = ref(null); // Intersection Observer实例（懒渲染）

// 分页相关
const page = ref(1); // 当前页码
const pageSize = 100; // 每页消息数量
const hasMore = ref(true); // 是否还有更多历史消息

// 表情选择器
const showEmojiPicker = ref(false); // 表情选择器显示状态
const recentEmojis = ref([]); // 最近使用的表情
const emojiPanel = ref(null); // 表情面板DOM引用
const emojiButton = ref(null); // 表情按钮DOM引用
const inputContainer = ref(null); // 输入容器DOM引用

// 群组信息
const currentGroup = ref({ // 当前群聊信息
  id: '',
  roomId: '',
  name: '',
  avatar: '',
  createTime: '',
  groupDesc: '',
  memberCount: '',
  members: [],
  onlineCount: 0
});
const memberMap = ref({}); // 群成员映射表（id -> member）
const showMemberDrawer = ref(false); // 群成员抽屉显示状态

// UI状态
const isLoading = ref(false); // 页面加载状态
const isReconnecting = ref(false); // WebSocket重连中状态
const isDarkMode = useDark(); // 暗黑模式状态
const menuItems = ref([
{
      key: 'share',
      label: '分享',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20"viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M17 22q-1.25 0-2.125-.875T14 19q0-.15.075-.7L7.05 14.2q-.4.375-.925.588T5 15q-1.25 0-2.125-.875T2 12t.875-2.125T5 9q.6 0 1.125.213t.925.587l7.025-4.1q-.05-.175-.062-.337T14 5q0-1.25.875-2.125T17 2t2.125.875T20 5t-.875 2.125T17 8q-.6 0-1.125-.213T14.95 7.2l-7.025 4.1q.05.175.063.338T8 12t-.012.363t-.063.337l7.025 4.1q.4-.375.925-.587T17 16q1.25 0 2.125.875T20 19t-.875 2.125T17 22"/></svg>',
      checked: true,
  onClick: () => { 
    console.log('share')
   },
  separatorAfter: false
},
{
  key: 'delete',
  label: '删除',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M9 17h2V8H9zm4 0h2V8h-2zm-8 4V6H4V4h5V3h6v1h5v2h-1v15z"/></svg>',
  danger:true,
  checked: false,
  onClick: () => { 
    console.log('delete')
  },
  separatorAfter: false
},
{
  key: 'recall',
  label: '撤回',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10" opacity=".5"/><path fill="currentColor" d="M10.564 7.461a.75.75 0 1 1 .871 1.22l-3.221 2.302a1.25 1.25 0 0 0 0 2.034l3.221 2.301a.75.75 0 1 1-.871 1.22l-3.222-2.3a2.75 2.75 0 0 1 0-4.476z"/><path fill="currentColor" d="M16.5 15.132V8.869a1 1 0 0 0-1.555-.832l-4.697 3.131a1 1 0 0 0 0 1.664l4.697 3.132a1 1 0 0 0 1.555-.832"/></svg>',
  danger:true,
  checked: false,
  onClick: () => { 
    console.log('recall')
  },
  separatorAfter: true
},

{
  key: 'copy',
  label: '复制',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20"  viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M4 23q-.825 0-1.412-.587T2 21V7h2v14h11v2zm4-4q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h7l6 6v10q0 .825-.587 1.413T19 19zm6-11h5l-5-5z"/></svg>',
  checked: false,
  onClick: () => { 
    handleCopy(rightKeyPopMsg.value)
  },
  separatorAfter: false
}])

const props = defineProps({
  friendList: {
    type: Array,
    default: () => []
  }
});

const connectionStatus = ref('connected'); // WebSocket连接状态

// 文件和图片上传相关
const imageInput = ref(null); // 图片上传input引用
const fileInput = ref(null); // 文件上传input引用
const selectedImages = ref([]); // 多图文件数组
const imagePreviewUrls = ref([]); // 图片预览URL列表
const filePreviewList = ref([]); // 文件预览列表
const showCopySuccess = ref(false); // 复制成功提示显示状态

// 群聊详情弹窗
const showGroupDetailPopup = ref(false); // 群聊详情弹窗显示状态
const groupDetailPopupPosition = ref({ x: 0, y: 0 }); // 群聊详情弹窗位置
const groupDetailPopupRef = ref(null); // 群聊详情弹窗DOM引用

// 用户详情弹窗
const showUserDetailPopup = ref(false); // 用户详情弹窗显示状态
const userDetailPopupPosition = ref({ x: 0, y: 0 }); // 用户详情弹窗位置
const userDetail = ref({}); // 用户详情数据
const userDetailLoading = ref(false); // 用户详情加载状态

// 右键菜单
const showRightKeyPop = ref(false); // 右键菜单显示状态
const rightKeyPopPosition = ref({ x: 0, y: 0 }); // 右键菜单位置
const rightKeyPopMsg = ref(null); // 右键菜单关联的消息
const isCalculatingPosition = ref(false); // 右键菜单位置计算中状态
const rightKeyPopRef = ref(null); // 右键菜单DOM引用

// 群聊抽屉
const showGroupDrawer = ref(false); // 群聊抽屉显示状态
const selectedGroupForDrawer = ref(null); // 抽屉中选中的群聊
const memberDrawerRef = ref(null); // 成员抽屉DOM引用
const memberDrawerBtnRef = ref(null); // 成员抽屉按钮DOM引用
// #endregion

// #region 计算属性
/**
 * 在线成员数量
 */
const onlineCount = computed(() => {
  return (currentGroup.value.members || []).filter(member => member.status === 1).length;
});
// #endregion

// #region 工具函数
/**
 * 同步WebSocket连接状态
 */
const syncWebSocketState = () => {
  if (userStore.chatWS && userStore.chatWS.waitConnLoading) {
    // 直接监听WebSocket的waitConnLoading状态
    watch(() => userStore.chatWS.waitConnLoading.value, (newValue) => {
      console.log('WebSocket waitConnLoading状态变化:', newValue);
      if (!newValue) {
        // waitConnLoading为false时，关闭重连动画
        setTimeout(() => {
          isReconnecting.value = false;
          console.log('根据WebSocket状态关闭重连动画');
        }, 500);
      }
    }, { immediate: true });
  }
};

function showGroupDetailPopupHandler(event) {
  const rect = event.target.getBoundingClientRect();
  groupDetailPopupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 8
  };
  showGroupDetailPopup.value = true;
  nextTick(() => {
    // 聚焦弹窗，便于后续点击检测
    if (groupDetailPopupRef.value) {
      groupDetailPopupRef.value.focus && groupDetailPopupRef.value.focus();
    }
  });
}
// #endregion


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
    // 映射成员数据字段以确保与GroupDetailDrawer组件兼容
    members = membersRes.data.records.map(m => ({
      id: m.uid,
      uid: m.uid,
      name: m.name || m.username || m.nickname,
      username: m.name || m.username || m.nickname,
      avatar: m.avatar,
      role: m.role,
      status: m.status,
      level: calculateLevel(m.exp || 0),
      exp: m.exp || 0,
      joinGroupTime: m.joinGroupTime,
      createTime: m.createTime,
      isFriend: m.isFriend || false
    }));
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

// Intersection Observer for lazy rendering
const setupObserver = () => {
  if (observer.value) {
    observer.value.disconnect();
  }

  const options = {
    root: messagesContainer.value,
    rootMargin: '200px 0px 200px 0px', // Larger margin for smoother scrolling
    threshold: 0.01
  };

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const msgId = entry.target.dataset.msgId;
      const msg = messages.value.find(m => (m.id || m.idx) == msgId);
      if (msg) {
        // Dynamically set visibility based on intersection status
        msg.isVisible = entry.isIntersecting;
      }
    });
  }, options);

  // Observe all message elements
  nextTick(() => {
    const messageNodes = messagesContainer.value?.querySelectorAll('.message-wrapper');
    messageNodes?.forEach(node => {
      observer.value.observe(node);
    });
  });
};

function resetAndFetch() {
  messages.value = [];
  currentGroup.value = { members: [] };
  // 拉取新数据...
}

onMounted(resetAndFetch);

watch(
  () => route.params.id,
  () => {
    resetAndFetch();
  }
);

onMounted(() => {
  resetAndFetch();
  // 启动WebSocket状态同步
  syncWebSocketState();
  // 添加emoji点击外部关闭事件监听器
  document.addEventListener('click', handleClickOutside);
  emitter.on('group-message', handleGroupMessage);
  // 监听撤回消息事件
  emitter.on('message-recall', handleMessageRecall);
  // 监听WebSocket连接成功事件，关闭loading动画
  emitter.on('websocket-connected', () => {
    console.log('GroupChat收到WebSocket连接成功事件，关闭所有动画');
    // 确保所有重连相关的状态都被重置
    setTimeout(() => {
      isReconnecting.value = false;
      connectionStatus.value = 'connected';
      console.log('重连动画状态已重置');
    }, 500); // 稍微延迟确保状态同步
  });
  
  emitter.on('websocket-reconnect', () => {
    console.log('GroupChat收到WebSocket重连事件，显示重连弹窗');
    connectionStatus.value = 'disconnected';
    // 如果不是手动重连，则不显示重连动画
    if (!isReconnecting.value) {
      console.log('自动重连失败，显示重连弹窗');
    }
  });
});

onUnmounted(() => {
  // 移除emoji点击外部关闭事件监听器
  document.removeEventListener('click', handleClickOutside);
  emitter.off('group-message');
  emitter.off('message-recall');
  emitter.off('websocket-connected');
  emitter.off('websocket-reconnect');
  // Disconnect the observer
  if (observer.value) {
    observer.value.disconnect();
  }
});

// 手动重连函数
const handleManualReconnect = async () => {
  try {
    console.log('开始手动重连...');
    isReconnecting.value = true;
    connectionStatus.value = 'connecting';
    
    // 等待一下再调用重连，让用户看到动画
    setTimeout(async () => {
      try {
        await userStore.manualReconnect();
        console.log('手动重连成功');
        // 重连成功后等待一下再关闭动画
        setTimeout(() => {
          isReconnecting.value = false;
          connectionStatus.value = 'connected';
        }, 1000);
      } catch (error) {
        console.error('手动重连失败:', error);
        isReconnecting.value = false;
        connectionStatus.value = 'disconnected';
        ArcMessage.error('手动重连失败，请稍后再试');
      }
    }, 1500);
  } catch (error) {
    console.error('手动重连初始化失败:', error);
    isReconnecting.value = false;
    connectionStatus.value = 'disconnected';
    ArcMessage.error('重连初始化失败');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const messageList = document.querySelector('.chat-message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
};
function isFriend(uid) {
  return props.friendList.some(f => f.id === uid);
}

function handleStartChat() {
  // 跳转到私聊
  router.push(`/chat/${userDetail.value.id}`);
  showUserDetailPopup.value = false;
}
// 加载群聊消息（分页）
const loadGroupMessages = async (reset = false) => {
  if (!currentGroup.value.roomId || !hasMore.value) return;
  isLoading.value = true;
  try {
    const params = {
      roomId: currentGroup.value.roomId,
      basePageReq: {
        page: page.value,
        pageSize
      }
    };
    const res = await getGroupMessageList(params);
    // 适配后端分页结构
    const records = res?.data?.records || [];
    if (res.code === 200 && Array.isArray(records)) {
      const historyMessages = records.map((msg, idx) => {
        const fromUid = msg.fromUser?.uid;
        const message = msg.message || {};
        // 通过memberMap查找群成员信息
        const member = memberMap.value[fromUid] || {};
        return {
          id: message.id,
          idx: `hist-${page.value}-${idx}`,
          roomId: message.roomId,
          time: message.sendTime,
          type: message.type,
          body: message.body,
          fromUid,
          side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
          avatar: member.avatar || msg.fromUser?.avatar || '',
          username: member.name || msg.fromUser?.username || 'UnKnown',
          role: member.role,
          status: member.status,
          isVisible: false // All historical messages start as not visible
        };
      });
      if (reset) {
        messages.value = historyMessages;
        nextTick(() => {
          scrollToBottom();
          setupObserver();
        });
      } else {
        const oldHeight = messagesContainer.value?.scrollHeight || 0;
        messages.value = [...historyMessages, ...messages.value];
        nextTick(() => {
          // Maintain scroll position when loading older messages
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - oldHeight;
          }
          setupObserver();
        });
      }
      hasMore.value = records.length === pageSize;
    } else {
      hasMore.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

// 监听路由变化，首次加载最新100条
watch(
  () => route.params.id,
  async (newId) => {
    if (route.path.startsWith('/groupchat/') && newId) {
      isLoading.value = true;
      try {
        // 查询群聊详情
        const detailRes = await getGroupDetail(newId);
        if (detailRes.code === 200 && detailRes.data) {
          const detail = detailRes.data;
          currentGroup.value = {
            ...currentGroup.value,
            id: detail.roomId,
            roomId: detail.roomId,
            name: detail.name,
            avatar: detail.avatar,
            groupDesc: detail.groupDesc,
            createTime: detail.createTime
          };
        } else {
          const group = contactStore.getGroupChatById(newId);
          if (!group) return;
          currentGroup.value = { ...group };
        }
        // 查询群成员（分页，前7个）
        const memberRes = await listGroupMember(newId, { page: 1, pageSize: 7 });
        if (memberRes.code === 200 && memberRes.data && memberRes.data.records) {
          const members = memberRes.data.records.map(m => ({
            id: m.uid,
            name: m.name || m.username || m.nickname,
            avatar: m.avatar,
            role: m.role,
            status: m.status,
            level: calculateLevel(m.exp || 0),
            joinGroupTime: m.joinGroupTime
          }));
          currentGroup.value.members = members;
          // 建立id->member映射
          memberMap.value = Object.fromEntries(members.map(m => [m.id, m]));
          currentGroup.value.memberCount = memberRes.data.total || 0;
        } else {
          currentGroup.value.members = [];
          memberMap.value = {};
          currentGroup.value.memberCount = 0;
        }
        if (currentGroup.value.roomId) {
          page.value = 1;
          hasMore.value = true;
          await loadGroupMessages(true);
          nextTick(() => scrollToBottom());
        }
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

// 滚动到顶部加载更多
const handleScroll = async () => {
  const container = messagesContainer.value;
  if (!container || isLoading.value || !hasMore.value) return;
  if (container.scrollTop === 0) {
    page.value += 1;
    const oldHeight = container.scrollHeight;
    await loadGroupMessages();
    nextTick(() => {
      // 保持滚动位置
      container.scrollTop = container.scrollHeight - oldHeight;
    });
  }
};

onMounted(() => {


  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll);
  }
  emitter.on('user-status', (data) => {
    if (!data || !Array.isArray(data.changeList)) return;
    currentGroup.value.members.forEach(member => {
      const change = data.changeList.find(c => c.uid === member.id);
      if (change) {
        member.status = change.activeStatus;
      }
    });
  });
});
onBeforeUnmount(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll);
  }
});
onBeforeUnmount(() => {
  emitter.off('start-chat');
  emitter.off('user-status');
  emitter.off('add-friend');

});
const getMessageText = (message) => {
  if (!message) return '';
  switch (message.type) {
    case 1: // TEXT
      if (typeof message.body === 'string') return message.body;
      if (typeof message.body === 'object' && message.body !== null) {
        // 优先取 content 字段
        return message.body.content || message.body.text || JSON.stringify(message.body);
      }
    case 2: // RECALL
      if (message.body && typeof message.body === 'string') {
        return message.body;
      } 
    case 3: // IMG
      // body.url, body.width, body.height
      return message.body && message.body.url
        ? { url: message.body.url, width: message.body.width, height: message.body.height }
        : { url: '', width: 0, height: 0 };
    case 4: // FILE
      // 返回结构体
      return message.body && message.body.url
        ? { url: message.body.url, fileName: message.body.name || message.body.fileName, size: message.body.size }
        : null;
    case 5: // SOUND
      // 假设 body.url 为音频地址
      return message.body && message.body.url ? `<audio controls src="${message.body.url}" class="chat-audio-msg"></audio>` : '[语音]';
    case 6: // VIDEO
      // 假设 body.url 为视频地址
      return message.body && message.body.url ? `<video controls src="${message.body.url}" class="chat-video-msg"></video>` : '[视频]';
    case 7: // EMOJI
      // 假设 body.url 为表情图片
      return message.body && message.body.url ? `<img src="${message.body.url}" class="chat-emoji-msg" />` : '[表情]';
    default:
      return '[未知消息类型]';
  }
};

const sendMessage = async () => {
  if (!inputValue.value.trim() && !filePreviewList.value.length) return;
  
  // 1. 先发送文本消息（如有）
  if (inputValue.value.trim()) {
    // 添加文本加载气泡
    const loadingId = Date.now();
    const textContent = inputValue.value;
    loadingMessages.value.push({
      id: loadingId,
      type: 'text',
      content: textContent,
      status: 'sending'
    });
    
    // 清空输入框并滚动到底部
    inputValue.value = '';
    nextTick(scrollToBottom);
    
    const params = {
      roomId: currentGroup.value.roomId,
      msgType: 1, // 文本
      body: { content: textContent }
    };
    
    try {
      const res = await sendMsg(params);
      if (res.code === 200 && res.data) {
        // 移除加载气泡
        loadingMessages.value = loadingMessages.value.filter(msg => msg.id !== loadingId);
        
        // 解析返回的消息结构
        const msg = res.data;
        const fromUid = msg.fromUser?.uid;
        const message = msg.message || {};
        // 通过memberMap查找群成员信息
        const member = memberMap.value[fromUid] || {};
        const newMsg = {
          id: message.id,
          roomId: message.roomId,
          time: message.sendTime,
          type: message.type,
          body: message.body, // 直接使用原始的message.body
          fromUid,
          side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
          avatar: member.avatar || msg.fromUser?.avatar || '',
          username: member.name || msg.fromUser?.username || '群成员',
          role: member.role,
          status: member.status,
          isVisible: true // 新发送的消息立即可见
        };
        messages.value.push(newMsg);
        nextTick(scrollToBottom);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 标记消息为失败状态
      const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
      if (failedMsgIndex !== -1) {
        loadingMessages.value[failedMsgIndex].status = 'failed';
        loadingMessages.value[failedMsgIndex].error = error.message || '发送失败';
        loadingMessages.value[failedMsgIndex].originalParams = params;
      }
      // 显示失败提示
      ArcMessage.error('消息发送失败，请点击重发');
    }
  }
  
  // 2. 再上传并发送所有待发送文件
  if (filePreviewList.value.length) {
    await sendFileMessages();
  }
}

// 重发消息函数
const retryMessage = async (loadingMsg) => {
  if (!loadingMsg.originalParams) {
    ArcMessage.warning('无法重发消息，缺少原始参数');
    return;
  }
  
  // 更新状态为发送中
  const msgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingMsg.id);
  if (msgIndex !== -1) {
    loadingMessages.value[msgIndex].status = 'sending';
  }
  
  try {
    console.log('重发消息:', loadingMsg.originalParams);
    const res = await sendMsg(loadingMsg.originalParams);
    if (res.code === 200 && res.data) {
      // 移除加载气泡
      loadingMessages.value = loadingMessages.value.filter(msg => msg.id !== loadingMsg.id);
      
      // 添加正常消息
      const msg = res.data;
      const fromUid = msg.fromUser?.uid;
      const message = msg.message || {};
      const member = memberMap.value[fromUid] || {};
      const newMsg = {
        id: message.id,
        roomId: message.roomId,
        time: message.sendTime,
        type: message.type,
        body: message.body,
        fromUid,
        side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
        avatar: member.avatar || msg.fromUser?.avatar || '',
        username: member.name || msg.fromUser?.username || '群成员',
        role: member.role,
        status: member.status,
        isVisible: true
      };
      messages.value.push(newMsg);
      nextTick(scrollToBottom);
      ArcMessage.success('消息重发成功');
    }
  } catch (error) {
    console.error('重发消息失败:', error);
    // 恢复失败状态
    if (msgIndex !== -1) {
      loadingMessages.value[msgIndex].status = 'failed';
      loadingMessages.value[msgIndex].error = error.message || '重发失败';
    }
    ArcMessage.error('消息重发失败');
  }
}

const onEmojiSelect = (event) => {
  const emoji = event.detail.unicode;
  inputValue.value += emoji;
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value = [emoji, ...recentEmojis.value].slice(0, 20);
  }
};

// Emoji 点击外部关闭功能
const handleClickOutside = (e) => {
  // 如果 emoji 面板不存在，直接返回
  if (!showEmojiPicker.value) return;
  
  // 检查点击目标是否在 emoji 面板内
    // 检查点击目标是否在 emoji 面板内
  if (emojiPanel.value && emojiPanel.value.$el && emojiPanel.value.$el.contains(e.target)) {
    return;
  }
  
  // 检查点击目标是否在底部输入控制栏内（包括所有按钮和输入框）
  if (inputContainer.value && inputContainer.value.contains(e.target)) {
    return;
  }
  
  // 如果点击在面板和输入控制栏之外，关闭 emoji 选择器
  showEmojiPicker.value = false;
};

const shouldShowTime = (currentMsg, index) => {
  if (index === 0) return true;
  const currentTime = new Date(currentMsg.time);
  const prevTime = new Date(messages.value[index - 1].time);
  return Math.abs(currentTime - prevTime) > 5 * 60 * 1000;
};

const formatMessageDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};


function handleAvatarClick(event, msg) {
  if (msg.side !== 'left') return;
  // 计算弹窗位置
  const rect = event.target.getBoundingClientRect();
  userDetailPopupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 8
  };
  userDetailLoading.value = true;
  // 搜索好友
  searchFriends({ keyword: msg.username, page: 1, pageSize: 1 })
    .then(res => {
      if (
        res.code === 200 &&
        res.data &&
        Array.isArray(res.data.records) &&
        res.data.records.length > 0
      ) {
        const u = res.data.records[0];
        // 判断是否为好友
        const isFriend = props.friendList.some(f => f.id === u.id);
        userDetail.value = {
          id: u.id,
          name: u.username,
          avatar: u.avatar,
          level: calculateLevel(u.exp),
          createTime: u.createTime,
          status: u.status,
          isFriend
        };
        showUserDetailPopup.value = true;
      } else {
        userDetail.value = { name: msg.username, avatar: msg.avatar, isFriend: false };
        showUserDetailPopup.value = true;
      }
    })
    .catch(() => {
      userDetail.value = { name: msg.username, avatar: msg.avatar, isFriend: false };
      showUserDetailPopup.value = true;
    })
    .finally(() => {
      userDetailLoading.value = false;
    });
}

function handleMemberClick(event, member) {
  // 判断是否为自己
  if (String(member.id) === String(userStore.userInfo.uid)) {
    router.push('/userhub');
    return;
  }
  // 计算弹窗位置（左侧）
  const rect = event.target.getBoundingClientRect();
  userDetailPopupPosition.value = {
    x: rect.left - 220, // 偏移到左侧
    y: rect.top
  };
  userDetailLoading.value = true;
  searchFriends({ keyword: member.name, page: 1, pageSize: 1 })
    .then(res => {
      if (
        res.code === 200 &&
        res.data &&
        Array.isArray(res.data.records) &&
        res.data.records.length > 0
      ) {
        const u = res.data.records[0];
        const isFriend = props.friendList.some(f => f.id === u.id);
        userDetail.value = {
          id: u.id,
          name: u.username,
          avatar: u.avatar,
          level: calculateLevel(u.exp),
          createTime: u.createTime,
          status: u.status,
          isFriend
        };
        showUserDetailPopup.value = true;
      } else {
        userDetail.value = { id: member.id, name: member.name, avatar: member.avatar, isFriend: false };
        showUserDetailPopup.value = true;
      }
    })
    .catch(() => {
      userDetail.value = { id: member.id, name: member.name, avatar: member.avatar, isFriend: false };
      showUserDetailPopup.value = true;
    })
    .finally(() => {
      userDetailLoading.value = false;
    });
}



const handleClickOutsideMemberDrawer = (event) => {
  if (
    showMemberDrawer.value &&
    memberDrawerRef.value &&
    !memberDrawerRef.value.contains(event.target) &&
    memberDrawerBtnRef.value &&
    !memberDrawerBtnRef.value.contains(event.target)
  ) {
    showMemberDrawer.value = false;
  }
};

function handleGroupMessage(data) {
  if (!data || !data.message) return;
  // 只处理当前群聊的消息
  if (String(data.message.roomId) !== String(currentGroup.value.roomId)) return;

  const fromUid = data.fromUser?.uid;
  const message = data.message;
  const member = memberMap.value[fromUid] || {};

  // 检查是否已存在相同id的消息
  if (messages.value.some(m => m.id === message.id)) return;

  const newMsg = {
    id: message.id,
    roomId: message.roomId,
    time: message.sendTime,
    type: message.type,
    body: message.body, // 直接使用原始的message.body
    fromUid,
    side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
    avatar: member.avatar || data.fromUser?.avatar || '',
    username: member.name || data.fromUser?.username || '群成员',
    role: member.role,
    status: member.status,
    isVisible: true // New messages are immediately visible
  };

  messages.value.push(newMsg);
  nextTick(() => {
    scrollToBottom();
    const newNode = messagesContainer.value?.querySelector(`[data-msg-id="${newMsg.id}"]`);
    if (newNode) {
      observer.value?.observe(newNode);
    }
  });
}

// 处理撤回消息的WebSocket推送
function handleMessageRecall(data) {
  console.log('收到撤回消息推送:', data);
  
  if (!data || !data.msgId || !data.roomId) {
    console.warn('撤回消息数据不完整:', data);
    return;
  }
  
  // 只处理当前群聊的撤回消息
  if (String(data.roomId) !== String(currentGroup.value.roomId)) {
    console.log('撤回消息不属于当前群聊，忽略');
    return;
  }
  
  const messageIndex = messages.value.findIndex(msg => msg.id === data.msgId);
  if (messageIndex !== -1) {
    const originalMsg = messages.value[messageIndex];
    const recallUid = data.recallUid;
    
    let recallText;
    if (recallUid !== originalMsg.fromUid) {
      // 管理员撤回成员消息
      const recallUser = memberMap.value[recallUid];
      const recallUsername = recallUser?.name || '管理员';
      recallText = `管理员"${recallUsername}"撤回了一条成员消息`;
    } else {
      // 用户撤回自己的消息
      const username = originalMsg.username || '群成员';
      recallText = `"${username}"撤回了一条消息`;
    }
    
    // 更新消息内容为撤回状态
    messages.value[messageIndex] = {
      ...messages.value[messageIndex],
      type: 2, // 撤回消息类型
      body: recallText, // 设置和后端数据库一致的撤回文本
      isRecalled: true
    };

  } else {
    console.warn('未找到要撤回的消息:', data.msgId);
  }
}


// #region 图片上传处理
/**
 * 触发图片上传input点击
 */
function triggerImageInput() {
  imageInput.value && imageInput.value.click();
}

function onImageSelected(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    imagePreviewUrls.value.push(URL.createObjectURL(file));
    selectedImages.value.push(file);
  }
  e.target.value = '';
}

/**
 * 发送多张图片消息
 */
async function sendImageMessage() {
  if (!selectedImages.value.length) return;
  for (let i = 0; i < selectedImages.value.length; i++) {
    const file = selectedImages.value[i];
    const url = imagePreviewUrls.value[i];
    
    // 添加图片加载气泡
    const loadingId = Date.now() + i; // 避免ID冲突
    loadingMessages.value.push({
      id: loadingId,
      type: 'image',
      previewUrl: url,
      file: file,
      status: 'sending'
    });
    
    nextTick(scrollToBottom);
    
    // 获取图片宽高
    const img = new window.Image();
    img.src = url;
    await new Promise(resolve => { img.onload = resolve; });
    const width = img.width;
    const height = img.height;
    
    try {
      // 上传图片
      const uploadRes = await uploadImageFile(file);
      if (!uploadRes || !uploadRes.url) {
        // 标记为失败状态
        const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
        if (failedMsgIndex !== -1) {
          loadingMessages.value[failedMsgIndex].status = 'failed';
          loadingMessages.value[failedMsgIndex].error = '图片上传失败';
        }
        ArcMessage.error('图片上传失败');
        continue;
      }
      
      // 发送消息
      const params = {
        roomId: currentGroup.value.roomId,
        msgType: 3,
        body: {
          url: uploadRes.url,
          size: file.size,
          width,
          height
        }
      };
      
      // 保存原始参数用于重发
      const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
      if (failedMsgIndex !== -1) {
        loadingMessages.value[failedMsgIndex].originalParams = params;
      }
      
      const res = await sendMsg(params);
      if (res.code === 200 && res.data) {
        // 移除加载气泡
        loadingMessages.value = loadingMessages.value.filter(msg => msg.id !== loadingId);
        
        // 添加正常消息
        const msg = res.data;
        const fromUid = msg.fromUser?.uid;
        const message = msg.message || {};
        const member = memberMap.value[fromUid] || {};
        const newMsg = {
          id: message.id,
          roomId: message.roomId,
          time: message.sendTime,
          type: message.type,
          body: message.body,
          fromUid,
          side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
          avatar: member.avatar || msg.fromUser?.avatar || '',
          username: member.name || msg.fromUser?.username || '群成员',
          role: member.role,
          status: member.status,
          isVisible: true
        };
        messages.value.push(newMsg);
        nextTick(scrollToBottom);
      }
    } catch (error) {
      console.error('图片发送失败:', error);
      // 标记为失败状态
      const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
      if (failedMsgIndex !== -1) {
        loadingMessages.value[failedMsgIndex].status = 'failed';
        loadingMessages.value[failedMsgIndex].error = error.message || '图片发送失败';
      }
      ArcMessage.error('图片发送失败，请点击重发');
    }
  }
  // 清空
  imagePreviewUrls.value = [];
  selectedImages.value = [];
}

// 处理各种文件消息
// #region 文件上传处理
/**
 * 触发文件上传input点击
 */
function triggerFileInput() {
  fileInput.value && fileInput.value.click();
}

function onFileSelected(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase();
    // 只允许非图片/非视频文件
    if (
      [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpg', 'mpeg', '3gp', 'rmvb', 'rm', 'asf', 'ts', 'm4v'
      ].includes(ext)
    ) {
      continue;
    }
    filePreviewList.value.push({
      file,
      url: '',
      isImage: false,
      fileName: file.name,
      fileTypeClass: getFileTypeClass(ext),
      fileIcon: getFileTypeIcon(ext),
      previewKey: file.name + '-' + file.size + '-' + Date.now()
    });
  }
  e.target.value = '';
}

function removePreviewFile(idx) {
  filePreviewList.value.splice(idx, 1);
}
// 预览显示的icon
function getFileTypeClass(ext) {
  if (['pdf'].includes(ext)) return 'file-pdf';
  if (['doc', 'docx'].includes(ext)) return 'file-doc';
  if (['md'].includes(ext)) return 'file-md';
  if (['xls', 'xlsx'].includes(ext)) return 'file-xls';
  if (['ppt', 'pptx'].includes(ext)) return 'file-ppt';
  if (['zip', 'rar', '7z'].includes(ext)) return 'file-zip';
  return 'file-other';
}
function getFileTypeIcon(ext) {
  if (['pdf'].includes(ext)) return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['md'].includes(ext)) return '🗒️';
  if (['xls', 'xlsx'].includes(ext)) return '📊';
  if (['ppt', 'pptx'].includes(ext)) return '📈';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
  return '📁';
}
function formatFileSize(size) {
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + 'MB'
  return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
}

async function sendFileMessages() {
  for (let i = 0; i < filePreviewList.value.length; i++) {
    const preview = filePreviewList.value[i];
    
    // 添加文件加载气泡
    const loadingId = Date.now() + i; // 避免ID冲突
    const ext = preview.file.name.split('.').pop().toLowerCase();
    loadingMessages.value.push({
      id: loadingId,
      type: 'file',
      fileName: preview.file.name,
      fileSize: preview.file.size,
      fileExt: ext,
      file: preview.file,
      status: 'sending'
    });
    
    nextTick(scrollToBottom);
      //  // 模拟网络延迟 5 秒
      //  await new Promise(resolve => setTimeout(resolve, 5000));
    try {
      // 1. 上传文件
      const uploadRes = await uploadImageFile(preview.file);
      if (!uploadRes || !uploadRes.url) {
        // 标记为失败状态
        const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
        if (failedMsgIndex !== -1) {
          loadingMessages.value[failedMsgIndex].status = 'failed';
          loadingMessages.value[failedMsgIndex].error = '文件上传失败';
        }
        ArcMessage.error('文件上传失败');
        continue;
      }
      
      // 2. 构造消息体
      const params = {
        roomId: currentGroup.value.roomId,
        msgType: 4, // 文件
        body: {
          url: uploadRes.url,
          size: preview.file.size,
          fileName: preview.file.name
        }
      };
      
      // 保存原始参数用于重发
      const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
      if (failedMsgIndex !== -1) {
        loadingMessages.value[failedMsgIndex].originalParams = params;
      }
      
      const res = await sendMsg(params);
      if (res.code === 200 && res.data) {
        // 移除加载气泡
        loadingMessages.value = loadingMessages.value.filter(msg => msg.id !== loadingId);
        
        // 添加正常消息
        const msg = res.data;
        const fromUid = msg.fromUser?.uid;
        const message = msg.message || {};
        const member = memberMap.value[fromUid] || {};
        const newMsg = {
          id: message.id,
          roomId: message.roomId,
          time: message.sendTime,
          type: message.type,
          body: message.body, // 直接使用原始的message.body
          fromUid,
          side: fromUid === userStore.userInfo.uid ? 'right' : 'left',
          avatar: member.avatar || msg.fromUser?.avatar || '',
          username: member.name || msg.fromUser?.username || '群成员',
          role: member.role,
          status: member.status,
          isVisible: true // 新发送的消息立即可见
        };
        messages.value.push(newMsg);
        nextTick(scrollToBottom);
      }
    } catch (error) {
      console.error('文件发送失败:', error);
      // 标记为失败状态
      const failedMsgIndex = loadingMessages.value.findIndex(msg => msg.id === loadingId);
      if (failedMsgIndex !== -1) {
        loadingMessages.value[failedMsgIndex].status = 'failed';
        loadingMessages.value[failedMsgIndex].error = error.message || '文件发送失败';
      }
      ArcMessage.error('文件发送失败，请点击重发');
    }
  }
  filePreviewList.value = [];
}

function handleRightClick(msg, event) {
  // 动态生成右键菜单
  const baseItems = [
    {
      key: 'share',
      label: '分享',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20"viewBox="0 0 24 24"><path fill="currentColor" d="M17 22q-1.25 0-2.125-.875T14 19q0-.15.075-.7L7.05 14.2q-.4.375-.925.588T5 15q-1.25 0-2.125-.875T2 12t.875-2.125T5 9q.6 0 1.125.213t.925.587l7.025-4.1q-.05-.175-.062-.337T14 5q0-1.25.875-2.125T17 2t2.125.875T20 5t-.875 2.125T17 8q-.6 0-1.125-.213T14.95 7.2l-7.025 4.1q.05.175.063.338T8 12t-.012.363t-.063.337l7.025 4.1q.4-.375.925-.587T17 16q1.25 0 2.125.875T20 19t-.875 2.125T17 22"/></svg>',
      checked: true,
      onClick: () => { console.log('share') },
      separatorAfter: false
    },
    {
      key: 'delete',
      label: '删除',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="currentColor" d="M9 17h2V8H9zm4 0h2V8h-2zm-8 4V6H4V4h5V3h6v1h5v2h-1v15z"/></svg>',
      danger: true,
      checked: false,
      onClick: () => { console.log('delete') },
      separatorAfter: false
    },
    {
      key: 'copy',
      label: '复制',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20"  viewBox="0 0 24 24"><path fill="currentColor" d="M4 23q-.825 0-1.412-.587T2 21V7h2v14h11v2zm4-4q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h7l6 6v10q0 .825-.587 1.413T19 19zm6-11h5l-5-5z"/></svg>',
      checked: false,
      onClick: () => { handleCopy(msg) },
      separatorAfter: false
    }
  ]
  
  // 撤回权限检查
  const canRecall = checkRecallPermission(msg);
  if (canRecall) {
    baseItems.splice(2, 0, {
      key: 'recall',
      label: '撤回',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10" opacity=".5"/><path fill="currentColor" d="M10.564 7.461a.75.75 0 1 1 .871 1.22l-3.221 2.302a1.25 1.25 0 0 0 0 2.034l3.221 2.301a.75.75 0 1 1-.871 1.22l-3.222-2.3a2.75 2.75 0 0 1 0-4.476z"/><path fill="currentColor" d="M16.5 15.132V8.869a1 1 0 0 0-1.555-.832l-4.697 3.131a1 1 0 0 0 0 1.664l4.697 3.132a1 1 0 0 0 1.555-.832"/></svg>',
      danger: true,
      checked: false,
      onClick: () => { handleRecallMessage(msg) },
      separatorAfter: true
    })
  }
  menuItems.value = baseItems
  if (msg.side === 'right' || msg.side === 'left') {
    isCalculatingPosition.value = true;
    showRightKeyPop.value = true;
    rightKeyPopMsg.value = msg;
    // Render invisibly at the click position to calculate size
    rightKeyPopPosition.value = { x: event.clientX, y: event.clientY };

    nextTick(() => {
      const menuEl = rightKeyPopRef.value?.$el;
      if (!menuEl) return;

      const rect = menuEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let finalX = event.clientX;
      let finalY = event.clientY;

      // Horizontal positioning: if click is on the right half, show menu to the left of cursor
      if (event.clientX > viewportWidth / 2) {
        finalX = event.clientX - rect.width;
      }

      // Vertical positioning: if click is on the bottom half, show menu above cursor
      if (event.clientY > viewportHeight / 2) {
        finalY = event.clientY - rect.height;
      }

      // Edge clamping to prevent any part of the menu from going off-screen
      if (finalX < 0) finalX = 5;
      if (finalX + rect.width > viewportWidth) finalX = viewportWidth - rect.width - 5;
      if (finalY < 0) finalY = 5;
      if (finalY + rect.height > viewportHeight) finalY = viewportHeight - rect.height - 5;

      // Set the final position and make it visible
      rightKeyPopPosition.value = { x: finalX, y: finalY };
      isCalculatingPosition.value = false;

      if (rightKeyPopRef.value) rightKeyPopRef.value.focus?.();
    });
  } else {
    showRightKeyPop.value = false;
  }
}

function closeRightKeyPop(e) {
  // 如果菜单没显示，直接返回
  if (!showRightKeyPop.value) return
  // 如果点击在菜单内部，不关闭
  if (rightKeyPopRef.value && rightKeyPopRef.value.$el?.contains(e.target)) return
  showRightKeyPop.value = false
}
onMounted(() => {
  document.addEventListener('mousedown', closeRightKeyPop);
  document.addEventListener('mousedown', handleClickOutsideMemberDrawer);
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeRightKeyPop);
  document.removeEventListener('mousedown', handleClickOutsideMemberDrawer);
})

// #region 消息权限检查

function checkRecallPermission(msg) {
  const currentUserId = userStore.userInfo.uid;
  const currentUserMember = memberMap.value[currentUserId];
  const msgAuthorMember = memberMap.value[msg.fromUid];
  
  if (!currentUserMember) return false;
  
  // 如果是自己的消息，都可以撤回
  if (msg.fromUid === currentUserId) return true;
  
  // 群主可以撤回所有人的消息
  if (currentUserMember.role === 1) return true;
  
  // 管理员可以撤回普通成员的消息，但不能撤回群主和其他管理员的消息
  if (currentUserMember.role === 2) {
    return msgAuthorMember && msgAuthorMember.role === 3; // 只能撤回普通成员(role=3)的消息
  }
  
  // 普通成员只能撤回自己的消息
  return false;
}

// 处理撤回消息
async function handleRecallMessage(msg) {
  try {
    await recallMsg({
      msgId: msg.id,
      roomId: msg.roomId
    });
    
    ArcMessage.success('消息已撤回');
    
    // 关闭右键菜单
    showRightKeyPop.value = false;
  } catch (error) {
    console.error('撤回消息失败:', error);
    ArcMessage.error('撤回消息失败');
  }
}

function handleCopy(msg) {
  let text = ''
  if (msg.type === 1) { // 文本
    text = getMessageText(msg) || ''
  } else if (msg.type === 4 && msg.body?.fileName) {
    text = msg.body.url
  } else if (msg.type === 3 && msg.body?.url) {
    text = msg.body.url
  } else {
    text = '[暂不支持复制该类型]'
  }
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess.value = true
      setTimeout(() => { showCopySuccess.value = false }, 1500)
    })
  }
}

// 拖拽文件上传
function handleDropFile(e) {
  const files = Array.from(e.dataTransfer.files);
  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase();
    // 图片类型
    if ([
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'
    ].includes(ext)) {
      const url = URL.createObjectURL(file);
      imagePreviewUrls.value.push(url);
      selectedImages.value.push(file);
      continue;
    }
    // 视频类型
    if ([
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpg', 'mpeg', '3gp', 'rmvb', 'rm', 'asf', 'ts', 'm4v'
    ].includes(ext)) {
      // 可扩展：视频预览
      filePreviewList.value.push({
        file,
        url: '',
        isImage: false,
        fileName: file.name,
        fileTypeClass: 'file-video',
        fileIcon: '🎬',
        previewKey: file.name + '-' + file.size + '-' + Date.now()
      });
      continue;
    }
    // 其他文档类型
    filePreviewList.value.push({
      file,
      url: '',
      isImage: false,
      fileName: file.name,
      fileTypeClass: getFileTypeClass(ext),
      fileIcon: getFileTypeIcon(ext),
      previewKey: file.name + '-' + file.size + '-' + Date.now()
    });
  }
}

</script>

<style scoped src="@/assets/styles/chat.css"></style>
<style scoped>
.file-preview-icon {
  display: flex;
  align-items: center;
  font-size: 22px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f5f5;
  margin-right: 8px;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.file-pdf {
  color: #e53935;
  background: #fff3f3;
}

.file-doc {
  color: #1976d2;
  background: #f3f7ff;
}

.file-md {
  color: #43a047;
  background: #f3fff3;
}

.file-xls {
  color: #388e3c;
  background: #f3fff3;
}

.file-ppt {
  color: #fbc02d;
  background: #fffbe3;
}

.file-zip {
  color: #8d6e63;
  background: #f7f3f0;
}

.file-other {
  color: #616161;
  background: #f5f5f5;
}

.file-preview-name {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  word-break: break-all;
}

.member-drawer-btn-wrapper {
  position: fixed;
  top: 10%;
  right: 0;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;

}

.member-drawer-btn-wrapper .el-button {
  pointer-events: auto;
  width: 80px;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
}

.custom-member-drawer {
  padding-top: 10px;
  position: fixed;
  top: 0%;
  right: 0%;
  width: 250px;
  background: var(--drawer-bg, #90eb9f80);
  /* 半透明 */
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  color: var(--drawer-text, #222);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
}


.drawer-header {
  padding: 16px 20px 8px 20px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--drawer-text, #222);
}

.member-list {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
  background: transparent;
}


.group-description-section {
  padding: 16px;
  padding-bottom: 0;

}

.group-description-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.group-description-content {
  font-size: 13px;
  line-height: 1.5;
  padding: 12px;
  border-radius: 8px;
  color: #3f4140;
  border-left: 3px solid rgb(50, 49, 53);
  border-right: 3px solid rgb(50, 49, 53);
  word-wrap: break-word;
  max-height: 120px;
  overflow-y: auto;
}

.dark-mode .group-description-section {
  border-bottom-color: var(--drawer-border, #404040);
}

.dark-mode .group-description-title {
  color: var(--drawer-text, #e0e0e0);
}



.member-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 8px 16px;
  color: var(--drawer-text, #222);
}
.member-item:hover {
  background-color: rgb(155, 240, 129);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.dark-mode .member-item:hover {
  background-color: rgb(12, 41, 3);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.member-item span {
  font-size: 14px;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0);
}



.drawer-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.01);
  z-index: 99;
}

.member-btn-semicircle {
  border-radius: 0 32px 0 32px;
  border-top-right-radius: 32px;
  border-bottom-right-radius: 32px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin: 0;
  padding: 10px 22px 10px 16px;
  min-width: 60px;
  min-height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.774);
  background: rgb(231, 229, 229);
  /* 半透明蓝色 */
  color: red;
  font-weight: 800;
  border: none;
  transition: background 0.2s;
  backdrop-filter: blur(19px);
  /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px);
  /* 让内容更清晰 */
  outline: none;
}

.dark-mode .member-btn-semicircle {
  background: rgb(95, 95, 95);
  /* 半透明蓝色 */

}

.member-btn-semicircle:hover {
  background: rgba(51, 126, 204, 0.35);
}

.online-count-label {
  font-size: 11px;
  color: #999;
  margin-left: 0;
  margin-right: 0;
  font-weight: 400;
}

.online-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #54ee36;
  margin-right: 4px;
  vertical-align: middle;
}

.member-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.member-status-dot {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #bbb;
  z-index: 2;
}

.member-status-dot.online {
  background: #67C23A;
}

.member-status-dot.offline {
  background: #bbb;
}

.msg-left-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
}
.msg-main{
  cursor: pointer;
}
.user-avatar {
  flex-shrink: 0;
  margin: 0 4px ;
}

.msg-left-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 1 0%;
  min-width: 0;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--chat-bg-color);
  position: relative;
}

.msg-username {
  font-size: 15px;
  color: #4f5353;
  margin-bottom: 2px;
  font-weight: 500;
  line-height: 1;
}

.dark-mode .msg-username {
  color: #ece7e7;
}

.owner-name {
  /* 动态金色渐变文字，兼容日夜模式 */
  background: linear-gradient(90deg, #c5870c, #f0d807, #e9ec0c, #ec650a, #d15813, #ec2409);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  animation: gold-gradient-move 2.5s linear infinite;
  font-weight: bold;
  filter: drop-shadow(0 0 2px #fff8dc88);
}

.admin-name {
  /* 渐变色毛玻璃反光效果 */
  background: linear-gradient(90deg, #43e97b 0%, #16bea0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  position: relative;
  font-weight: bold;
  filter: drop-shadow(0 0 4px #b8ffe6aa);

  /* 毛玻璃反光伪元素 */
}

.chat-bubble-left {
  margin-top: 0;
  /* 保证气泡和用户名紧凑 */
}

.chat-bubble,
.chat-bubble-left {
  max-width: min(400px, 38vw);
  word-break: break-all;
  white-space: pre-wrap;
  font-size: 16px;
  border-radius: 18px;
  line-height: 1.5;
}

.ws-reconnect-mask {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

body.dark-theme .ws-reconnect-mask {
  background: rgba(30, 30, 30, 0.6);
}

.image-preview-wrapper {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.image-preview-floating {
  position: absolute;
  left: 3%;
  bottom: 100%;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
}

.image-preview-item {
  display: flex;
  align-items: flex-end;
  margin-right: 8px;
  position: relative;
}

.image-preview-thumb {
  max-width: 160px;
  max-height: 160px;
  border-radius: 6px;
  margin-right: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background: #222;
}

.image-preview-close {
  position: absolute;
  top: -1px;
  right: -1px;
  border: none !important;
  box-shadow: none !important;
  color: #fff !important;
  z-index: 2;

  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  background: rgba(40, 40, 40, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 50%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.img-shadow {
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.18), 0 1.5px 8px 0 rgba(0, 0, 0, 0.10);
  transition: box-shadow 0.2s;
}

.img-shadow:hover {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.28), 0 2px 12px 0 rgba(0, 0, 0, 0.18);
}



/* 添加更宽的滚动条样式 */
:deep(.chat-message-list::-webkit-scrollbar) {
  width: 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.file-preview-floating {
  position: absolute;
  left: 3%;
  bottom: 100%;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
}

.file-preview-item {
  display: flex;
  align-items: flex-end;
  margin-right: 8px;
  position: relative;
}

.file-preview-thumb {
  max-width: 160px;
  max-height: 160px;
  border-radius: 6px;
  margin-right: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background: #222;
}

.file-preview-close {
  position: absolute;
  top: -1px;
  right: -1px;
  border: none !important;
  box-shadow: none !important;
  color: #fff !important;
  z-index: 2;

  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  background: rgba(40, 40, 40, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 50%;
}

.file-preview-icon {
  display: flex;
  align-items: center;
  font-size: 22px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f5f5;
  margin-right: 8px;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}


.file-preview-name {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  word-break: break-all;
}

.file-msg {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px 10px 25px;
  border-radius: 18px;
  background: rgba(255,255,255,0.55);
  margin-right: 8px;
  width: 200px;
  height: 100px;
  transition: box-shadow 0.18s, border 0.18s, background 0.18s;
  position: relative;
  overflow: hidden;
}
.dark-mode .file-msg {

  
  background: linear-gradient(120deg, rgba(24,36,64,0.72) 60%, rgba(60,80,120,0.38) 100%);
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.22), 0 1.5px 8px 0 rgba(0,0,0,0.18);
}
.file-msg:hover {
  box-shadow: 0 8px 32px 0 rgba(60,60,120,0.18), 0 2px 12px 0 rgba(0,0,0,0.18);
  border-color: #409eff;
  background: rgba(255,255,255,0.82);
}
.dark-mode .file-msg:hover {
  background: linear-gradient(120deg, rgba(40,60,120,0.92) 60%, rgba(80,120,200,0.38) 100%);
  border-color: #90c4ff;
}
.file-msg a {
  display: block;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

.file-msg-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: calc(100% - 20px);
  padding-bottom: 8px;
}

.file-msg-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.file-msg-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.file-msg-divider {
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin-right: 8px;
}

.file-msg-arc-icon {
  font-size: 10px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.4);
  letter-spacing: 0.5px;
}

.dark-mode .file-msg-divider {
  background: rgba(255, 255, 255, 0.2);
}

.dark-mode .file-msg-arc-icon {
  color: rgba(255, 255, 255, 0.5);
}
.file-msg-icon {
  font-size: 32px;
  margin-left: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}
.file-msg-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a233a !important;
  margin-bottom: 4px;
  max-width: 200px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.dark-mode .file-msg-name {
  color: #eaf6ff !important;
}
.file-msg-size {
  font-size: 13px;
  color: #6a7a8c;
  font-weight: 500;
  margin-left: 0;
  flex-shrink: 0;
}

.file-image-preview-bar {
  position: absolute;
  left: 3%;
  bottom: 100%;
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
  max-width: 94%;
  overflow-x: auto;
}

.file-preview-bar {
  /* 文件区比图片区再往下偏移一行 */
  margin-bottom: -48px;
}

.preview-card {
  position: relative;
  min-width: 90px;
  max-width: 140px;
  height: 48px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(60, 60, 60, 0.10);
  display: flex;
  align-items: center;
  transition: box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
  padding: 0;
}



.preview-card-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 8px 0 6px;
  position: relative;
}

.preview-card-inner.is-image {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.file-icon-large {
  display: inline-block;
  width: 24px;
  height: 24px;
  font-size: 18px;
  margin-right: 6px;
  background-size: contain;
  background-repeat: no-repeat;
  flex-shrink: 0;
  text-align: center;
  line-height: 24px;
}

.file-info-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  min-width: 0;
  margin-left: 0;
}

.file-name-block {
  font-size: 12px;
  color: #222;
  font-weight: 500;
  line-height: 1.2;
  max-width: 80px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.file-size-block {
  font-size: 10px;
  color: #888;
  line-height: 1;
  margin-top: 2px;
}

.remove-btn-card {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  cursor: pointer;
  line-height: 14px;
  text-align: center;
  z-index: 2;
  opacity: 0.85;
  transition: background 0.18s;
}

.remove-btn-card:hover {
  background: #e74c3c;
  opacity: 1;
}

.file-image-preview-bar.file-image-preview-center {
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  z-index: 20;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-height: 48px;
  max-width: 520px;
  /* 固定最大宽度 */
  width: 100%;
  overflow-x: auto;
  justify-content: center;
}

/* 撤回消息样式 */
.recall-message-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 0;
  padding: 0 20px;
}

.recall-message-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(63, 63, 66, 0.25);
  border-radius: 12px;
  font-size: 13px;
  max-width: 300px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.recall-icon {
  color: #ffffff;
  flex-shrink: 0;
  opacity: 0.8;
}

.recall-text {
  font-size: 13px;
  color: #838080;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 暗色模式下的撤回消息样式 */
body.dark .recall-message-content {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #aaa;
}

body.dark .recall-icon {
  color: #aaa;
}

body.dark .recall-text {
  color: #aaa;
}

/* 悬停效果 */
.recall-message-content:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
}

body.dark .recall-message-content:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.16);
}

/* 消息容器样式 */
.message-container {
  position: relative;
  display: inline-block;
}

/* 发送中的消息样式 */
.message-sending {
  position: relative;
  opacity: 0.8;
}

/* 右下角加载动画 */
.message-loading-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* 小型加载动画 */
.loading-spinner-mini {
  width: 10px;
  height: 10px;
  border: 1.5px solid #e0e0e0;
  border-top: 1.5px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 重发按钮样式 */
.message-retry-btn {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
  transition: all 0.2s ease;
  z-index: 10;
}

.message-retry-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.retry-icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

</style>

