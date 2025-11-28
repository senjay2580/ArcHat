<template>
  <router-view v-if="!route.params.id"></router-view>
  <div v-else class="chat-container">
    <!-- #region 连接状态提示 -->
    <!-- WebSocket 连接状态提示 -->
    <div v-if="connectionStatus === 'disconnected'" class="connection-status-bar">
      <el-alert title="WebSocket 连接已断开" type="warning" :closable="false" show-icon>
        <template #default>
          <span style="color:#409EFF; font-weight:600;">消息可能无法正常发送，请点击重新连接</span>
          <danger-button type="success" size="small" @click="handleManualReconnect"
            :loading="connectionStatus === 'connecting'" style="margin-left: 10px;">
            {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
          </danger-button>
        </template>
      </el-alert>
    </div>
    <!-- #endregion -->

    <!-- #region 顶部用户信息 -->
    <!-- 顶部用户信息（仅私聊） -->
    <div class="user-header">
      <div class="user-info">
        <el-avatar :size="40" class="user-avatar" :src="currentChat.avatar"
          @click="(e) => handleViewUser(e)"></el-avatar>
        <div class="user-details">
          <div class="user-name">
            {{ currentChat.name }}
          </div>
          <div class="user-status" :class="{ offline: !currentChatStatus }">
            <span class="status-dot" :class="{ offline: !currentChatStatus }"></span>
            {{ currentChatStatus ? '在线' : '离线' }}
          </div>
        </div>
      </div>

    </div>
    <!-- #endregion -->

    <!-- #region 聊天消息列表 -->
    <!-- 聊天显示信息框（可滚动） -->
    <div class="chat-message-list" ref="messagesContainer">

      <template v-if="messages.length > 0">
        <div v-for="(msg, idx) in messages" :key="msg.id || idx" 
             class="message-wrapper" 
             :data-msg-id="msg.id || idx"
             v-show="!isLoading"
             :style="{ minHeight: msg.isVisible ? 'auto' : '60px' }">
          <template v-if="msg.isVisible">
            <!-- 时间显示 -->
            <div v-if="shouldShowTime(msg, idx)" class="message-time-group">
              <span class="time-divider">{{ formatMessageDate(new Date(msg.time)) }}</span>
            </div>
            <div :class="['chat-message-item', msg.side]" @mouseenter="hoverIdx = idx" @mouseleave="hoverIdx = null">
              <!-- 撤回icon，仅自己消息可见，同行右侧 -->
              <span v-if="msg.side === 'right'" class="recall-inline-icon" v-show="hoverIdx === idx"
                @click="onRecallMessage(msg)">
                <el-icon style="color:#f5222d;font-size:15px;vertical-align:middle;">
                  <Close />
                </el-icon>
                <span class="recall-text">撤回</span>
              </span>
              <el-avatar v-if="msg.side === 'left'" :size="32" class="user-avatar" :src="currentChat.avatar"
                @click="(e) => handleViewUser(e)" />
              <div class="chat-bubble" v-html="linkify(msg.text)"></div>
              <el-avatar v-if="msg.side === 'right'" :size="32" class="user-avatar" :src="userStore.userInfo.avatar" />
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="no-message-tip" v-show="!isLoading">没有聊天记录</div>
      </template>

      <!-- 加载动画 -->
      <div v-if="isLoading" class="loading-wrapper">
        <Loading />
      </div>
    </div>
    <!-- #endregion -->

    <!-- #region 底部输入区 -->
    <!-- 底部输入区 -->
    <div class="message-input-container" ref="inputContainer">
      <!-- 通话按钮 -->
      <el-button class="input-icon-btn call-icon" circle @click="showCallOptions = true">
        <Phone :size="24" :stroke-width="2" style="color: #008bd0;" />
      </el-button>
      

      <el-button ref="emojiButton" class="input-icon-btn" circle @click.stop="showEmojiPicker=!showEmojiPicker">
        <svg xmlns="http://www.w3.org/2000/svg" width="30"
          viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt -->
          <mask id="lineMdEmojiGrinFilled0">
            <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path fill="#fff" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64"
                d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9">
                <animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.5s" values="0;1" />
                <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0" />
              </path>
              <path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M9 9v1">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.2s" dur="0.2s" values="2;0" />
              </path>
              <path stroke="#000" stroke-dasharray="2" stroke-dashoffset="2" d="M15 9v1">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.4s" dur="0.2s" values="2;0" />
              </path>
              <path fill="#000" stroke="none"
                d="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z">
                <animate fill="freeze" attributeName="d" begin="1.6s" dur="0.2s"
                  values="M12 15c-2.5 0 -3.25 0 -4 0c-0.55 0 -1 0 -1 0c0 0 1.5 0 5 0c3.5 0 5 0 5 0c0 0 -0.45 0 -1 0c-0.75 0 -1.5 0 -4 0Z;M12 14c-2.5 0 -3.25 -1 -4 -1c-0.55 0 -1 0.45 -1 1c0 0.75 1.5 4 5 4c3.5 0 5 -3.25 5 -4c0 -0.55 -0.45 -1 -1 -1c-0.75 0 -1.5 1 -4 1Z" />
              </path>
            </g>
          </mask>
          <rect width="24" height="24" fill="currentColor" mask="url(#lineMdEmojiGrinFilled0)" />
        </svg>
      </el-button>
      <div class="message-input">
        <input type="text" v-model="currentInputValue" placeholder="Type a message..." @keyup.enter="sendMessage"
          ref="messageInput" />
      </div>
      <el-button class="send-button" @click="sendMessage">
        <el-icon>
          <Position />
        </el-icon>
      </el-button>
    </div>
    <!-- #endregion -->

    <!-- #region Emoji 选择器 -->
    <!-- Emoji 选择器 -->
    <EmojiPickerPopup
      ref="emojiPanel"
      :visible="showEmojiPicker"
      @emoji-click="onEmojiSelect"
    />



    <!-- #endregion -->

    <!-- #region 通话选项弹窗 -->
    <!-- 通话选项弹窗 -->
    <CallOptionsPopup 
      :visible="showCallOptions" 
      @close="showCallOptions = false"
      @voice-call="startVoiceCall"
      @video-call="startVideoCall"
    />
    <!-- #endregion -->

    <!-- #region 用户详情弹窗 -->
    <!-- 用户详情弹窗 -->
    <user-detail-popup v-model:visible="showUserDetail" :user="currentChat" :position="userDetailPosition"
      :hide-start-chat="true" :hide-add-friend="true" />
    <!-- #endregion -->

    <!-- 遮罩和加载动画 -->
    <div v-if="isReconnecting" class="ws-reconnect-mask">
      <WaitConnLoading />
    </div>

    <!-- 摄像头设备选择器 -->
    <CameraDeviceSelector
      v-model="showCameraSelector"
      :current-device-id="selectedCameraDeviceId"
      @confirm="onCameraDeviceSelected"
      @cancel="onCameraSelectionCanceled"
    />
  </div>
</template>

<script setup>
// #region 导入依赖
import { ref, onMounted, watch, onUnmounted, onBeforeUnmount, computed, nextTick, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDark } from '@vueuse/core';
import { ElNotification } from 'element-plus';
import ArcMessage from '@/utils/ArcMessage';
import { Microphone, ChatRound, Link, Position, Close } from '@element-plus/icons-vue';
import 'emoji-picker-element';
import { Phone } from 'lucide-vue-next';

import EmojiPickerPopup from '@/components/interaction/EmojiPickerPopup.vue';
import UserDetailPopup from '@/components/business/UserDetailPopup.vue';
import Loading from '@/components/feedback/loading.vue';
import DangerButton from '@/components/form/DangerButton.vue';
import WaitConnLoading from '@/components/feedback/WaitConnLoading.vue';
import CallOptionsPopup from '@/components/business/CallOptionsPopup.vue';
import CameraDeviceSelector from '@/components/business/CameraDeviceSelector.vue';

import { checkFriend } from '@/api/friend';
import { addPrivateRoom, checkPrivateRoom } from '@/api/room';
import { getFriendMessageList } from '@/api/chatService';
import ChatWebSocket from '@/api/chat.js';

import { useUserInfoStore } from '@/stores/user';
import { useContactStore } from '@/stores/contact';
import { useCallStore } from '@/stores/call.js';
import { useVideoCallStore } from '@/stores/videoCall.js';

import { calculateLevel, linkify } from '@/utils/exp';
import emitter from '@/utils/eventBus';
// #endregion

// #region 基础状态
const route = useRoute();
const router = useRouter();
const userStore = useUserInfoStore();
const contactStore = useContactStore();
const callStore = useCallStore();
const videoCallStore = useVideoCallStore();
// #endregion

// #region 数据存储
// 聊天消息相关
const messages = ref([]); // 当前聊天消息列表
const inputValueMap = ref({}); // 各聊天室的输入内容缓存
const hoverIdx = ref(null); // 消息悬浮索引

// 表情选择器
const showEmojiPicker = ref(false); // 表情选择器显示状态
const recentEmojis = ref([]); // 最近使用的表情
const emojiPanel = ref(null); // 表情选择器DOM引用
const emojiButton = ref(null); // 表情按钮DOM引用

// 通话相关
const showCallOptions = ref(false); // 通话选项弹窗显示状态
const showCameraSelector = ref(false); // 摄像头选择器显示状态
const selectedCameraDeviceId = ref(''); // 已选摄像头设备ID
const pendingVideoCallTarget = ref(null); // 待发起的视频通话目标用户

// 用户详情
const showUserDetail = ref(false); // 用户详情弹窗显示状态
const selectedUser = ref({ // 选中查看的用户信息
  id: '',
  name: '',
  avatar: '',
  level: '',
  status: '',
  createTime: ''
});
const userDetailPosition = ref({ x: 0, y: 0 }); // 用户详情弹窗位置

// UI状态
const isReconnecting = ref(false); // WebSocket重连中标识
const isDarkMode = useDark(); // 暗黑模式状态
const inputContainer = ref(null); // 输入框容器DOM引用
const themeTransitionTimer = ref(null); // 主题切换防抖定时器
const currentInputValue = computed({ // 当前聊天室输入内容（可读写）
  get() {
    return inputValueMap.value[currentChat.value.roomId] || '';
  },
  set(val) {
    inputValueMap.value[currentChat.value.roomId] = val;
  }
});

// 当前聊天对象信息
const currentChat = ref({
  id: '',
  name: '',
  roomId: '',
  avatar: '',
  status: '',
  level: '',
  createTime: ''
});

// 消息输入与DOM引用
const message = ref(''); // 当前输入的消息内容
const messagesContainer = ref(null); // 消息列表容器DOM引用
const messageInput = ref(null); // 输入框DOM引用
const observer = ref(null); // Intersection Observer实例（懒渲染）
const isUserScrolling = ref(false); // 用户是否正在手动滚动

// WebSocket连接
const chatWS = computed(() => userStore.chatWS); // WebSocket实例
const connectionStatus = ref('connected'); // 连接状态: connected/disconnected/connecting

// UI状态
const isLoading = ref(false); // 加载状态
// #endregion

// #region 计算属性
// currentInputValue已在数据存储区域定义
// #endregion

// #region 工具函数
/**
 * 检查WebSocket连接状态
 * @returns {boolean} 连接是否正常
 */
const checkWebSocketConnection = () => {
  return chatWS.value && typeof chatWS.value.isConnected === 'function' && chatWS.value.isConnected();
};

/**
 * 检查用户是否在消息列表底部
 */
const isAtBottom = () => {
  const messageList = messagesContainer.value;
  if (!messageList) return true;
  
  const threshold = 100; // 100px的容差
  return messageList.scrollTop + messageList.clientHeight >= messageList.scrollHeight - threshold;
};

/**
 * 滚动消息列表到底部
 */
const scrollToBottom = (force = false) => {
  // 如果用户正在滚动且不是强制滚动，则不自动滚动到底部
  if (isUserScrolling.value && !force) {
    return;
  }
  
  nextTick(() => {
    const messageList = messagesContainer.value;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  });
};

/**
 * 设置Intersection Observer进行懒渲染
 * 与GroupChat保持一致的优雅实现
 */
const setupObserver = () => {
  if (observer.value) {
    observer.value.disconnect();
  }

  // 如果消息数量较少，不使用懒渲染，避免初始滚动问题
  if (messages.value.length < 50) {
    messages.value.forEach(msg => {
      msg.isVisible = true;
    });
    return;
  }

  const options = {
    root: messagesContainer.value,
    rootMargin: '200px 0px 200px 0px', // 更大的边距以获得更流畅的滚动
    threshold: 0.01
  };

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const msgId = entry.target.dataset.msgId;
      const msg = messages.value.find(m => (m.id || m.idx) == msgId);
      if (msg) {
        // 根据交集状态动态设置可见性
        msg.isVisible = entry.isIntersecting;
      }
    });
  }, options);

  // 观察所有消息元素
  nextTick(() => {
    const messageNodes = messagesContainer.value?.querySelectorAll('.message-wrapper');
    messageNodes?.forEach(node => {
      observer.value.observe(node);
    });
  });
};

/**
 * 优化主题切换性能
 */
const optimizeThemeTransition = () => {
  // 添加过渡类
  document.body.classList.add('theme-transition');
  
  // 清除之前的定时器
  if (themeTransitionTimer.value) {
    clearTimeout(themeTransitionTimer.value);
  }
  
  // 300ms后移除过渡类，避免影响其他动画
  themeTransitionTimer.value = setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 300);
};

// #endregion

// #region 表情选择器处理
/**
 * 处理表情选择器外部点击事件
 * @param {Event} e - 点击事件对象
 */
const handleClickOutside = (e) => {
  if (!showEmojiPicker.value) return;
  
  if (emojiPanel.value && emojiPanel.value.$el && emojiPanel.value.$el.contains(event.target)) {
    return;
  }
  
  if (inputContainer.value && inputContainer.value.contains(e.target)) {
    return;
  }
  
  showEmojiPicker.value = false;
};
// #endregion

// #region 聊天初始化
/**
 * 检查并处理聊天会话
 * @param {number} userId - 用户ID
 */
const checkAndHandleChat = async (userId) => {
  try {
    // 检查是否为好友
    const friendRes = await checkFriend(userId);
    if (friendRes.code !== 200 || friendRes.data === false) {
      router.push('/404');
      return;
    }
    // 检查私聊房间是否存在
    const roomRes = await checkPrivateRoom(userId);
    if (roomRes.code === 200 && roomRes.data === true) {
      return;
    } else {
      // 创建新的私聊房间
      const createRes = await addPrivateRoom({ uid: userId });
      if (createRes.code === 200) {
        emitter.emit('refresh-friend-contact-list');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      } else {
        router.push('/404');
      }
    }
  } catch (error) {
    console.error('处理聊天错误:', error);
    router.push('/404');
  }
};

/**
 * 获取历史消息
 * @param {string} roomId - 房间ID
 */
const getHistoryMessages = async (roomId) => {
  try {
    isLoading.value = true;
    const res = await getFriendMessageList({ roomId });
    if (res.code === 200) {
      const historyMessages = res.data.map((msg, idx) => ({
        side: msg.fromUid === userStore.userInfo.uid ? 'right' : 'left',
        text: msg.content,
        time: msg.createTime,
        id: msg.id,
        idx: `hist-${idx}`,
        status: msg.status,
        type: msg.type,
        isVisible: true // 历史消息初始为可见，避免初始滚动问题
      }));
      messages.value = historyMessages;
      // 立即设置滚动位置，避免滚动动画
      nextTick(() => {
        isUserScrolling.value = false;
        const messageList = messagesContainer.value;
        if (messageList) {
          // 直接设置scrollTop，无动画
          messageList.scrollTop = messageList.scrollHeight;
        }
        setupObserver();
      });
    } else {
      ArcMessage.error(res.msg || '获取历史消息失败');
    }
  } catch (error) {
    console.error('获取历史消息错误:', error);
    ArcMessage.error('获取历史消息失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};
// #endregion

// #region 路由监听与会话切换
watch(
  () => route.params.id,
  async (newId) => {
    if (route.path.startsWith('/chat/')) {
      newId = Number(newId);
      isLoading.value = true;
      // 切换房间时重置用户滚动状态
      isUserScrolling.value = false;

      await checkAndHandleChat(newId);
      try {
        let chatUser = contactStore.getContactById(newId);

        if (!chatUser) {
          isReconnecting.value = true;
          await new Promise(resolve => setTimeout(resolve, 1000));
          chatUser = contactStore.getContactById(newId);
        }
        contactStore.setCurrentChat(newId);
        currentChat.value = {
          id: chatUser.id,
          roomId: chatUser.roomId,
          name: chatUser.username,
          avatar: chatUser.avatar,
          status: chatUser.status,
          level: calculateLevel(chatUser.exp || 0),
          createTime: chatUser.createTime
        };
        if (chatUser.roomId) {
          await getHistoryMessages(chatUser.roomId);
        } else {
          // 如果没有历史消息，也要重置滚动状态
          isUserScrolling.value = false;
          nextTick(() => {
            const messageList = messagesContainer.value;
            if (messageList) {
              messageList.scrollTop = messageList.scrollHeight;
            }
          });
        }
      } catch (error) {
        router.push('/chat');
      } finally {
        isLoading.value = false;
        isReconnecting.value = false;
      }
    }
  },
  {
    immediate: true,
    deep: true,
    flush: 'post'
  }
);

const currentChatStatus = computed(() => {
  if (!currentChat.value.id) return false;
  const friend = contactStore.getContactById(currentChat.value.id);
  return friend ? friend.status : false;
});
// #endregion




// 滚动事件处理器
const handleScroll = () => {
  if (!messagesContainer.value) return;
  
  // 检测用户是否在底部
  const atBottom = isAtBottom();
  isUserScrolling.value = !atBottom;
};

// #region 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // 延迟添加滚动监听器，确保DOM已经渲染
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.addEventListener('scroll', handleScroll);
    }
  });
  
  emitter.on('websocket-reconnect', () => {
    connectionStatus.value = 'disconnected';
  });
  emitter.on('websocket-connected', () => {
    isReconnecting.value = false;
    connectionStatus.value = 'connected';
  });

  emitter.on('chat-message', (messageData) => {
    const isInCurrentChat = currentChat.value && currentChat.value.id === messageData.fromUid;
    
    if (isInCurrentChat) {
      // 只处理当前聊天的消息显示，其他交给GlobalMessageManager处理
      const newMsg = {
        side: messageData.fromUid === userStore.userInfo.uid ? 'right' : 'left',
        text: messageData.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: messageData.id || Date.now(),
        isVisible: true // 新消息立即可见
      };
      messages.value.push(newMsg);
      nextTick(() => {
        // 只有用户在底部时才自动滚动
        if (!isUserScrolling.value) {
          scrollToBottom();
        }
        setupObserver(); // 重新设置观察器
      });
    }
    // 不在当前聊天的消息由GlobalMessageManager统一处理
  });
  // 移除自动滚动的watch，避免用户滚动时被强制拉回底部
  
  // 监听用户上下线通知
  emitter.on('user-status', (data) => {
    if (!data || !Array.isArray(data.changeList)) return;
    
    // 更新联系人状态
    contactStore.updateContactsStatus(data.changeList);
    
    // 如果当前聊天用户状态发生变化，触发响应式更新
    if (currentChat.value && currentChat.value.id) {
      const currentUserChange = data.changeList.find(change => change.uid === currentChat.value.id);
      if (currentUserChange) {
        console.log(`用户 ${currentChat.value.name} 状态更新:`, currentUserChange.activeStatus ? '在线' : '离线');
        // 触发currentChatStatus计算属性重新计算
        nextTick(() => {
          // 强制触发响应式更新
        });
      }
    }
  });

  // 监听主题切换，优化性能
  watch(isDarkMode, () => {
    optimizeThemeTransition();
  });

});

onUnmounted(() => {
  emitter.off('chat-message');
  emitter.off('websocket-reconnect');
  emitter.off('websocket-connected');
  emitter.off('user-status'); // 清理用户状态事件监听
  document.removeEventListener('click', handleClickOutside);
  
  // 断开Intersection Observer
  if (observer.value) {
    observer.value.disconnect();
  }
  
  // 清理滚动监听器
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll);
  }
  
  // 清理主题切换定时器
  if (themeTransitionTimer.value) {
    clearTimeout(themeTransitionTimer.value);
  }
});
// #endregion

// #region 发送消息
const sendMessage = async () => {
  if (!currentInputValue.value.trim()) return;
  if (!checkWebSocketConnection()) {
    // 不显示警告消息，让连接状态弹窗显示重连按钮
    // 连接状态弹窗会在connectionStatus为'disconnected'时自动显示
    return;
  }
  try {
    const msg = {
      type: 4,
      data: {
        type: 1,
        targetUid: currentChat.value.id, // 使用好友的ID
        roomId: currentChat.value.roomId,
        content: currentInputValue.value
      }
    };
    console.log('发送消息:', msg);
    chatWS.value.send(msg);
    const newMsg = {
      side: 'right',
      text: currentInputValue.value,
      time: Date.now(), // 使用时间戳，确保可以被 new Date() 正确解析
      id: Date.now(),
      isVisible: true // 新发送的消息立即可见
    };
    messages.value.push(newMsg);
    inputValueMap.value[currentChat.value.roomId] = '';
    nextTick(() => {
      if (messageInput.value) {
        messageInput.value.focus();
      }
      // 发送消息时强制滚动到底部
      scrollToBottom(true);
      setupObserver(); // 重新设置观察器
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    ArcMessage.error('发送消息失败，请检查网络连接');
  }
};
// #endregion

// #region Emoji 选择
const onEmojiSelect = (event) => {
  const emoji = event.detail.unicode;
  currentInputValue.value += emoji;
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value = [emoji, ...recentEmojis.value].slice(0, 20);
  }
};
// #endregion

// #region 用户详情弹窗
const handleViewUser = (event) => {
  const rect = event.target.getBoundingClientRect();
  userDetailPosition.value = {
    x: rect.right + 10,
    y: rect.top - 10
  };
  showUserDetail.value = true;
};
// #endregion

// #region 消息分组与时间显示
const groupedMessages = computed(() => {
  const groups = [];
  let currentGroup = null;
  messages.value.forEach(msg => {
    const msgDate = new Date(msg.time);
    const dateStr = formatMessageDate(msgDate);
    if (!currentGroup || currentGroup.time !== dateStr) {
      currentGroup = {
        time: dateStr,
        messages: []
      };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });
  return groups;
});

const shouldShowTime = (currentMsg, index) => {
  if (index === 0) return true;
  const currentTime = new Date(currentMsg.time);
  const prevTime = new Date(messages.value[index - 1].time);
  const timeDiff = Math.abs(currentTime - prevTime);
  return timeDiff > 5 * 60 * 1000;
};

const formatMessageDate = (date) => {
  // 检查日期是否有效
  if (!date || isNaN(date.getTime())) {
    console.warn('Invalid date passed to formatMessageDate:', date);
    return new Date().toLocaleString(); // 返回当前时间作为备用
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
// #endregion

// #region 手动重连
const handleManualReconnect = async () => {
  try {
    isReconnecting.value = true; // 显示加载动画
    connectionStatus.value = 'connecting'; // 显示重连按钮文字为连接中...
    setTimeout(async () => {
      await userStore.manualReconnect();
    }, 1500);
  } catch (error) {
    isReconnecting.value = false;
    ArcMessage.error('手动重连失败');
  }
};
// #endregion

// #region 通话功能
/**
 * 发起语音通话
 */
const startVoiceCall = async () => {
  try {
    const targetUser = {
      id: currentChat.value.id,
      name: currentChat.value.name,
      avatar: currentChat.value.avatar
    };
    if (!callStore || typeof callStore.startVoiceCall !== 'function') {
      ArcMessage.error('callStore 初始化失败');
      return;
    }
    
    const success = await callStore.startVoiceCall(targetUser);
    
    if (success) {
      ArcMessage.info('正在发起语音通话...');
    } else {
      ArcMessage.error('发起通话失败');
    }
  } catch (error) {
    ArcMessage.error('发起通话失败: ' + error.message);
  }
};

/**
 * 发起视频通话
 */
const startVideoCall = async () => {
  try {
    // 构建目标用户信息
    const targetUser = {
      id: currentChat.value.id,
      name: currentChat.value.name,
      avatar: currentChat.value.avatar
    };
    
    // 检查videoCallStore是否可用
    if (!videoCallStore || typeof videoCallStore.startVideoCall !== 'function') {
      console.error('❌ videoCallStore 初始化失败或方法不存在');
      ArcMessage.error('视频通话模块初始化失败');
      return;
    }
    
    // 先显示摄像头设备选择器，让用户选择设备
    pendingVideoCallTarget.value = targetUser;
    showCallOptions.value = false; // 关闭通话选项弹窗
    showCameraSelector.value = true; // 显示摄像头选择器
    
  } catch (error) {
    console.error('❌ 视频通话函数执行异常:', error);
    ArcMessage.error('视频通话发起异常: ' + error.message);
  }
};

// 摄像头设备选择回调方法
const onCameraDeviceSelected = async (deviceInfo) => {
  try {
    selectedCameraDeviceId.value = deviceInfo.deviceId;
    
    if (!pendingVideoCallTarget.value) {
      console.error('❌ 没有待发起的视频通话目标');
      ArcMessage.error('视频通话目标丢失，请重试');
      return;
    }
    
    const targetUser = pendingVideoCallTarget.value;
    
    // 发起视频通话，传入选定的设备ID
    const result = await videoCallStore.startVideoCall(targetUser, {
      cameraEnabled: true,
      selectedDeviceId: deviceInfo.deviceId
    });
    
    if (result.success) {
      ArcMessage.success(`正在向 ${targetUser.name} 发起视频通话...`);
    } else {
      console.error('❌ 视频通话发起失败:', result.reason);
      
      // 根据失败原因显示不同的错误信息
      switch (result.reason) {
        case 'websocket_disconnected':
          ArcMessage.error('网络连接已断开，请检查网络后重试');
          break;
        case 'call_in_progress':
          ArcMessage.warning('当前有通话正在进行，请稍后再试');
          break;
        case 'start_call_failed':
          ArcMessage.error('视频通话发起失败，请重试');
          break;
        case 'exception':
          ArcMessage.error(`视频通话发起异常: ${result.error || '未知错误'}`);
          break;
        default:
          ArcMessage.error('视频通话发起失败，请重试');
      }
    }
  } catch (error) {
    console.error('❌ 摄像头设备选择后发起通话异常:', error);
    ArcMessage.error('视频通话发起异常: ' + error.message);
  } finally {
    // 清理状态
    pendingVideoCallTarget.value = null;
  }
};

const onCameraSelectionCanceled = () => {
  pendingVideoCallTarget.value = null;
  ArcMessage.info('已取消视频通话');
};
// #endregion

// #region 监听器
watch(connectionStatus, (val) => {
  if (val === 'disconnected') {
    ArcMessage.error('WebSocket 连接已断开，请刷新或者点击重连');
  }
});
// #endregion
</script>

<style scoped src="@/assets/styles/chat.css"></style>
<style scoped>
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.emoji-fade-enter-from,
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67C23A;
  margin-right: 4px;
  vertical-align: middle;
  transition: background 0.2s;
}

.status-dot.offline {
  background: #f5222d;
}

/* 通话按钮样式 */
.call-icon {
  border: none !important;
  transition: all 0.3s ease;
}


.call-icon:active {
  transform: scale(0.95);
}

.user-status {
  color: #67C23A;
  font-size: 13px;
  font-weight: 500;
}

.user-status.offline {
  color: #f5222d;
}

.recall-inline-icon {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2px 10px;
  transform: translateX(8px);
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
}

.recall-inline-icon:hover {
  background: rgba(44, 4, 4, 0.8);
}

.chat-message-item:hover .recall-inline-icon {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.recall-text {
  color: #f1101b;
  font-size: 13px;
  margin-left: 2px;
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

:deep(.el-drawer.btt) {
  position: fixed !important;


}
</style>

