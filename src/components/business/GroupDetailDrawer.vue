<template>

    <!-- 抽屉模式 -->
    <div 
      v-if="visible" 
      :class="['group-detail-drawer', { 'iphone-card-preview': isIPhonePreview }]" 
      :style="drawerStyle"
      @mousedown="startDrag"
      ref="drawerRef"
    >
      <!-- 抽屉头部 -->
      <div class="drawer-header">
        <div class="drawer-handle"></div>
        <div class="drawer-title">
          <MacWindowControls @close="goBack" @minimize="toggleIPhonePreview" style="scale: 1.2; top: 5px;left: 10px;" />
        </div>
      </div>

      <!-- 抽屉内容 -->
      <div class="drawer-content">
        <!-- 管理系统风格布局 -->
        <div class="admin-layout">
          <!-- 左侧栏：群信息和成员 -->
          <div class="left-panel">
            <!-- 群基本信息 -->
            <div class="info-card group-info-section">
              <div class="card-header">
                <el-icon>
                  <UserFilled />
                </el-icon>
                <span>群基本信息</span>
              </div>
              <div class="group-info-content">
                <div class="group-avatar-container">
                  <el-avatar :size="100" :src="groupInfo.avatar" class="group-avatar">
                    <el-icon size="40">
                      <UserFilled />
                    </el-icon>
                  </el-avatar>
                </div>

                <div class="group-details">
                  <h2 class="group-name">{{ groupInfo.name }}</h2>
                  <p class="group-meta">{{ groupInfo.memberCount }} 名成员</p>

                  <div class="action-buttons">
                    <DangerButton type="orange" style="scale: 1.2; width: 50%;">
                      开始聊天
                    </DangerButton>

                  </div>
                </div>
              </div>
            </div>

            <!-- 群公告 -->
            <div class="info-card" v-if="groupInfo.announcement">
              <div class="card-header">
                <el-icon>
                  <Bell />
                </el-icon>
                <span>群公告</span>
              </div>
              <p class="announcement-text">{{ groupInfo.announcement }}</p>
            </div>

            <!-- 群成员 -->
            <div class="info-card">
              <div class="card-header">
                <div class="header-left">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>群成员</span>
                </div>
              </div>

              <!-- 成员搜索 -->
              <el-input v-model="memberSearchQuery" placeholder="搜索成员" :prefix-icon="Search"
                class="member-search" clearable @input="handleSearch" />

              <!-- 成员列表 -->
              <div class="members-container">
                <el-infinite-scroll :infinite-scroll-disabled="loading || finished"
                  :infinite-scroll-distance="10" @load="loadMembers" class="infinite-scroll-container">

                  <div v-for="member in members" :key="member.id || member.uid"
                    :class="['member-item', member.role === 1 ? 'owner' : member.role === 2 ? 'admin' : '']">
                    <el-badge>
                      <el-avatar :src="member.avatar" :size="48" @click="handleAvatarClick(member, $event)"
                        class="clickable-avatar">
                        <el-icon>
                          <UserFilled />
                        </el-icon>
                      </el-avatar>
                    </el-badge>

                    <div class="member-info">
                      <div class="member-name-row">
                        <span class="member-name">{{ member.name || member.username }}</span>
                        <div class="member-role-badge" v-if="member.role === 1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22"
                            viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
                            <path fill="currentColor"
                              d="M5 20v-2h14v2zm0-3.5L3.725 8.475q-.05 0-.113.013T3.5 8.5q-.625 0-1.062-.438T2 7t.438-1.062T3.5 5.5t1.063.438T5 7q0 .175-.038.325t-.087.275L8 9l3.125-4.275q-.275-.2-.45-.525t-.175-.7q0-.625.438-1.063T12 2t1.063.438T13.5 3.5q0 .375-.175.7t-.45.525L16 9l3.125-1.4q-.05-.125-.088-.275T19 7q0-.625.438-1.063T20.5 5.5t1.063.438T22 7t-.437 1.063T20.5 8.5q-.05 0-.112-.012t-.113-.013L19 16.5z" />
                          </svg>
                          <span>群主</span>
                        </div>
                        <div class="member-role-badge admin" v-else-if="member.role === 2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22"
                            viewBox="0 0 24 24"><!-- Icon from EOS Icons by SUSE UX/UI team - https://gitlab.com/SUSE-UIUX/eos-icons/-/blob/master/LICENSE -->
                            <path fill="currentColor"
                              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5Zm0 3.9a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0 7.9c2 0 6 1.09 6 3.08a7.2 7.2 0 0 1-12 0c0-1.99 4-3.08 6-3.08" />
                          </svg>
                          <span>管理员</span>
                        </div>
                      </div>
                    </div>

                    <!-- 成员操作按钮 -->
                    <div class="member-actions" v-if="canKickMember(member) || canManagePermission(member)">
                      <!-- 权限管理按钮 -->
                      <template v-if="canManagePermission(member)">
                        <!-- 撤销管理员权限 -->
                        <DangerButton v-if="member.role === 2"
                          @click="handleRevokePermission(member)"
                          :title="'撤销管理员权限'">
                          撤销权限
                        </DangerButton>
                        <!-- 授予管理员权限 -->
                        <DangerButton v-else @click="handleGrantPermission(member)"
                          :title="'授予管理员权限'">
                          授予权限
                        </DangerButton>
                      </template>

                      <!-- 踢出按钮 -->
                      <DangerButton v-if="canKickMember(member)" :title="'踢出群聊'" type="danger"
                        @click="handleKickMember(member)">
                        踢出
                      </DangerButton>
                    </div>
                  </div>

                  <!-- 加载状态 -->
                  <div v-if="loading" class="loading-item">
                    <el-icon class="is-loading">
                      <Loading />
                    </el-icon>
                    <span>加载中...</span>
                  </div>

                  <!-- 加载完成提示 -->
                  <div v-if="finished && members.length > 0" class="finished-item">
                    <span>已加载全部成员</span>
                  </div>

                  <!-- 添加成员 -->
                  <div class="member-item add-member" @click="handleAddMember">
                    <div class="add-member-avatar">
                      <el-icon size="20">
                        <Plus />
                      </el-icon>
                    </div>
                    <div class="member-info">
                      <span class="member-name">添加成员</span>
                    </div>
                  </div>
                </el-infinite-scroll>
              </div>
            </div>
          </div>

          <!-- 右侧栏：设置和操作 -->
          <div class="right-panel">
            <!-- 群文件管理面板 -->
            <div class="info-card">
              <div class="card-header">
                <el-icon>
                  <Folder />
                </el-icon>
                <span>群文件管理</span>

              </div>

              <div class="file-management">
                <!-- 文件搜索 -->
                <el-input v-model="fileSearchQuery" placeholder="搜索文件..." :prefix-icon="Search" class="file-search"
                  clearable />

                <!-- 文件类型筛选 -->
                <div class="file-filters">
                  <el-tag v-for="filter in fileFilters" :key="filter.type"
                    :type="activeFileFilter === filter.type ? 'primary' : 'info'"
                    @click="activeFileFilter = filter.type" class="filter-tag">
                    {{ filter.label }}
                  </el-tag>
                </div>

                <!-- 文件列表 -->
                <div class="file-list">
                  <div v-for="file in filteredFiles" :key="file.id" class="file-item" @click="handleFileClick(file)">
                    <div class="file-icon">
                      <el-icon size="24">
                        <component :is="getFileIcon(file.type)" />
                      </el-icon>
                    </div>
                    <div class="file-info">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-meta">
                        <span class="file-size">{{ file.size }}</span>
                        <span class="file-time">{{ file.time }}</span>
                        <span class="file-uploader">由 {{ file.uploader }} 上传</span>
                      </div>
                    </div>
                    <div class="file-actions">
                      <PrimaryButton btnName="下载" style="scale: 0.7;margin: 0;"></PrimaryButton>
                    </div>
                  </div>
                </div>

                <!-- 文件统计 -->
                <div class="file-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ totalFiles }}</div>
                    <div class="stat-label">总文件</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ totalSize }}</div>
                    <div class="stat-label">总大小</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ recentUploads }}</div>
                    <div class="stat-label">今日上传</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-card">
              <div class="card-header">
                <el-icon>
                  <ChatDotRound />
                </el-icon>
              </div>
              <el-tabs v-model="activeTab" class="quick-tabs">
                <el-tab-pane v-if="canSeeManageTab" label="群管理" name="manage">
                  <div class="manage-options">
                    <div class="manage-option" @click="handleManageAction('edit')">
                      <div class="option-icon">
                        <el-icon>
                          <Edit />
                        </el-icon>
                      </div>
                      <div class="option-content">
                        <div class="option-title">修改群信息</div>
                        <div class="option-desc">修改群名称、头像、公告等信息</div>
                      </div>
                      <div class="option-arrow">
                        <el-icon>
                          <ArrowRight />
                        </el-icon>
                      </div>
                    </div>

                    <div v-if="isGroupOwner" class="manage-option danger-option" @click="handleManageAction('disband')">
                      <div class="option-icon danger-icon">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </div>
                      <div class="option-content">
                        <div class="option-title">解散群聊</div>
                        <div class="option-desc">永久解散当前群聊，所有成员将被移除</div>
                      </div>
                      <div class="option-arrow">
                        <el-icon>
                          <ArrowRight />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="更多功能" name="quick">
                  <div class="quick-actions">
                    <DangerButton type="gradient-purple" @click="handleQuickAction('share')">
                      <el-icon>
                        <Link />
                      </el-icon>
                      分享群聊
                    </DangerButton>

                    <DangerButton type="gradient-green" @click="handleQuickAction('invite')">
                      <el-icon>
                        <Plus />
                      </el-icon>
                      邀请好友
                    </DangerButton>
                    <div class="item-border" style="margin: 10px 0; border: 1px solid #e5e7eb;"></div>
                    <DangerButton type="primary" @click="handleQuickAction('export')">
                      <el-icon>
                        <Download />
                      </el-icon>
                      发起会议
                    </DangerButton>

                  </div>
                </el-tab-pane>


              </el-tabs>
            </div>

            <!-- 危险操作 -->
            <div class="info-card danger-card">
              <div class="card-header">
                <el-icon>
                  <Warning />
                </el-icon>
              </div>

              <div class="danger-actions">
                <div class="danger-item" @click="handleDangerAction('report')">
                  <el-icon color="#e6a23c">
                    <Warning />
                  </el-icon>
                  <span>举报群聊</span>
                </div>
                <div class="danger-item" @click="handleDangerAction('leave')">
                  <el-icon color="#f56c6c">
                    <Delete />
                  </el-icon>
                  <span>退出群聊</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  <!-- 用户详情弹窗 -->
  <UserDetailPopup v-model:visible="showUserDetail" :user="selectedUser" :position="userDetailPosition"
    :hide-start-chat="true" :hide-add-friend="true" />

  <!-- 成功提示 -->
  <div v-if="showSuccessTips" class="success-overlay">
    <SuccessTips title="更新成功" message="群组信息已成功更新！" @close="showSuccessTips = false" />
  </div>

  <!-- 踢出成员警告弹窗 -->
  <div v-if="showKickWarning" class="warning-overlay" @click="cancelKickMember">
    <div class="warning-container" @click.stop>
      <WorningTips :title="'踢出成员'" :message="`确定要将 ${memberToKick?.name || memberToKick?.username} 踢出群聊吗？该操作不可撤销。`"
        :confirm-text="'确定踢出'" :cancel-text="'取消'" :icon-bg-color="'#fee2e2'" :icon-color="'#dc2626'"
        :confirm-button-color="'#dc2626'" :width="'320px'" @confirm="confirmKickMember" @cancel="cancelKickMember" />
    </div>
  </div>

  <!-- 退出群聊警告弹窗 -->
  <div v-if="showLeaveWarning" class="warning-overlay" @click="cancelLeaveGroup">
    <div class="warning-container" @click.stop>
      <WorningTips :title="'退出群聊'" :message="`确定要退出群聊 ${groupInfo.name} 吗？退出后将无法接收群消息，需要重新加入才能继续参与群聊。`"
        :confirm-text="'确定退出'" :cancel-text="'取消'" :icon-bg-color="'#fef3c7'" :icon-color="'#f59e0b'"
        :confirm-button-color="'#f59e0b'" :width="'360px'" @confirm="confirmLeaveGroup" @cancel="cancelLeaveGroup" />
    </div>
  </div>

  <!-- 群信息编辑弹窗 -->
  <FullScreenDialog v-model:visible="showEditDialog" title="编辑群信息">
    <div class="edit-group-content">
      <!-- 群头像编辑 -->
      <div class="edit-section">
        <h3>群头像</h3>
        <div class="avatar-upload-section">
          <div class="current-avatar">
            <el-avatar :size="80" :src="avatarPreview || groupInfo.avatar">
              <el-icon size="30">
                <UserFilled />
              </el-icon>
            </el-avatar>
          </div>
          <DangerButton type="gradient-purple" @click="handleAvatarUpload" class="upload-button">
            <el-icon>
              <Plus />
            </el-icon>
            选择头像
          </DangerButton>
          <p class="upload-tip">支持 JPG、PNG 格式，建议尺寸 200x200</p>
        </div>
      </div>

      <!-- 群名称编辑 -->
      <div class="edit-section">
        <h3>群名称</h3>
        <el-input v-model="editForm.name" placeholder="请输入群名称" maxlength="20" show-word-limit class="name-input" />
      </div>

      <!-- 群公告编辑 -->
      <div class="edit-section">
        <h3>群公告</h3>
        <el-input v-model="editForm.announcement" type="textarea" placeholder="请输入群公告（最多100字）" :rows="4" maxlength="100"
          show-word-limit class="announcement-input" />
      </div>

      <!-- 操作按钮 -->
      <div class="edit-actions">
        <DangerButton type="gradient-orange" @click="exitEditMode" class="cancel-button">
          取消
        </DangerButton>
        <DangerButton type="gradient-green" @click="confirmSaveGroupInfo" :loading="isUploading" class="save-button">
          保存修改
        </DangerButton>
      </div>
    </div>
  </FullScreenDialog>

  <!-- 解散群聊警告弹窗 -->
  <div v-if="showDisbandWarning" class="warning-overlay" @click="cancelDisbandGroup">
    <div class="warning-container" @click.stop>
      <WorningTips :title="'解散群聊'" :message="`确定要解散群聊 ${groupInfo.name} 吗？解散后所有成员将被移除，聊天记录将被清空，此操作不可撤销。`"
        :confirm-text="'确定解散'" :cancel-text="'取消'" :icon-bg-color="'#fee2e2'" :icon-color="'#dc2626'"
        :confirm-button-color="'#dc2626'" :width="'400px'" @confirm="confirmDisbandGroup"
        @cancel="cancelDisbandGroup" />
    </div>
  </div>
  <div v-if="showPermissionWarning" class="warning-overlay" @click="cancelPermissionChange">
    <div class="warning-container" @click.stop>
      <WorningTips :title="'权限变更'" :message="`确定要${permissionAction === 'grant' ? '授予' : '撤销'}${memberToChangePermission?.name || memberToChangePermission?.username}管理员权限吗？`"
        :confirm-text="'确定'" :cancel-text="'取消'" :icon-bg-color="'#fee2e2'" :icon-color="'#dc2626'"
        :confirm-button-color="'#dc2626'" :width="'400px'" @confirm="confirmPermissionChange"
        @cancel="cancelPermissionChange" />
    </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import MacWindowControls from '@/components/layout/MacWindowControls.vue'
import {
  UserFilled,
  Bell,
  User,
  Search,
  Plus,
  ChatDotRound,
  Download,
  Link,
  ArrowRight,
  Setting,
  Warning,
  Delete,
  Folder,
  Picture,
  VideoPlay,
  Document as DocumentIcon,
  Loading,
  Edit,

  Star,
  Close
} from '@element-plus/icons-vue'
import DangerButton from '@/components/form/DangerButton.vue'
import PrimaryButton from '@/components/form/PrimaryButton.vue'
import UserDetailPopup from '@/components/business/UserDetailPopup.vue'
import WorningTips from '@/components/feedback/WorningTips.vue'
import SuccessTips from '@/components/feedback/SuccessTips.vue'
import { listGroupMember, removeMember, modifyGroup, authorizeMember, outGroup, dismissGroup } from '@/api/room'
import ArcMessage from '@/utils/ArcMessage'
import { useUserInfoStore } from '@/stores/user'
import { uploadImageFile } from '@/utils/fileHandler'
import FullScreenDialog from '@/components/layout/FullScreenDialog.vue'
import emitter from '@/utils/eventBus'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  group: {
    type: Object,
    default: () => ({})
  }
})

// Emits定义
const emit = defineEmits(['update:visible', 'refresh-group-data'])

// 响应式数据
const memberSearchQuery = ref('')
const activeTab = ref('manage')
const fileSearchQuery = ref('')
const activeFileFilter = ref('all')
const showSuccessTips = ref(false)

// 高性能拖拽功能
const drawerRef = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: window.innerWidth / 2 - 775, y: window.innerHeight / 2 - 400 }) // 居中显示

// 计算样式 - 只用于初始定位，拖拽时直接操作DOM
const drawerStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  position: 'fixed',
  zIndex: 20000
}))

// 高性能Windows风格拖拽 - 直接DOM操作
const startDrag = (e) => {
  // 更精确的拖拽区域检测 - 只允许在特定区域拖拽
  const isInDragArea = e.target.closest('.drawer-header') || 
                      (e.target.closest('.group-detail-drawer') && 
                       !e.target.closest('.drawer-content'))
  
  if (!isInDragArea) return // 只在头部区域或边缘允许拖拽
  
  // 排除按钮和交互元素
  if (e.target.closest('button, .el-button, .danger-button, .manage-option, .danger-item, .member-item, .el-input, .el-tabs, .clickable-avatar')) {
    return
  }
  
  isDragging.value = true
  const rect = drawerRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  // 设置拖拽样式和优化 - 移除 pointerEvents 设置
  if (drawerRef.value) {
    drawerRef.value.style.cursor = 'grabbing'
    drawerRef.value.style.userSelect = 'none'
    drawerRef.value.style.zIndex = '99999' // 确保在最顶层
  }
  
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag, { passive: false })
  e.preventDefault()
  e.stopPropagation()
}

const onDrag = (e) => {
  if (!isDragging.value || !drawerRef.value) return
  
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  // 边界检查
  const drawerWidth = isIPhonePreview.value ? 450 : 1200
  const drawerHeight = 800
  const maxX = window.innerWidth - drawerWidth
  const maxY = window.innerHeight - drawerHeight
  
  const boundedX = Math.max(0, Math.min(newX, maxX))
  const boundedY = Math.max(0, Math.min(newY, maxY))
  
  // 直接操作DOM，绕过Vue响应式系统
  drawerRef.value.style.left = `${boundedX}px`
  drawerRef.value.style.top = `${boundedY}px`
  drawerRef.value.style.transform = 'translate3d(0, 0, 0)' // 启用硬件加速
  
  // 更新内部位置状态（但不触发重新渲染）
  position.value.x = boundedX
  position.value.y = boundedY
  
  e.preventDefault()
  e.stopPropagation()
}

const stopDrag = () => {
  isDragging.value = false
  
  // 恢复样式 - 移除 pointerEvents 恢复
  if (drawerRef.value) {
    drawerRef.value.style.cursor = 'default'
    drawerRef.value.style.userSelect = 'auto'
    drawerRef.value.style.zIndex = '20000'
  }
  
  // 清理事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
// 群信息编辑相关
const showEditDialog = ref(false)
const editForm = ref({
  name: '',
  announcement: ''
})
const avatarFile = ref(null)
const avatarPreview = ref('')
const isUploading = ref(false)
const showDisbandWarning = ref(false)

// 用户详情弹窗相关
const showUserDetail = ref(false)
const selectedUser = ref({})
const userDetailPosition = ref({ x: 0, y: 0 })

// 踢出成员警告弹窗相关
const showKickWarning = ref(false)
const memberToKick = ref(null)

// 退出群聊警告弹窗相关
const showLeaveWarning = ref(false)

// iPhone预览模式（只影响卡片大小）
const isIPhonePreview = ref(false)

// 权限管理相关
const showPermissionWarning = ref(false)
const memberToChangePermission = ref(null)
const permissionAction = ref('') // 'grant' 或 'revoke'
// 获取用户状态
const userStore = useUserInfoStore()

// 当前用户信息 - 从群成员中获取当前用户的角色信息
const currentUser = computed(() => {
  // 从用户状态获取当前用户ID
  const currentUserId = userStore.userInfo?.uid || userStore.userInfo?.id

  if (!currentUserId) {
    // 如果没有用户ID，默认为普通成员（不能踢出任何人）
    return {
      id: null,
      role: 3 // 普通成员
    }
  }

  // 从群成员中查找当前用户
  const currentMember = allMembers.value.find(member =>
    String(member.id) === String(currentUserId) ||
    String(member.uid) === String(currentUserId)
  )

  if (currentMember) {
    return {
      id: currentMember.id || currentMember.uid,
      role: currentMember.role || 3 // 默认为普通成员
    }
  }

  // 如果在群成员中找不到当前用户，默认为普通成员
  return {
    id: currentUserId,
    role: 3 // 普通成员不能踢出任何人
  }
})



// 群信息 - 使用props传入的数据
const groupInfo = computed(() => ({
  name: props.group.name || '群聊',
  avatar: props.group.avatar || '/placeholder.svg?height=80&width=80',
  memberCount: props.group.memberCount || 0,
  announcement: props.group.announcement || ''
}))

// 群成员数据 - 使用从父组件传递的真实数据
const allMembers = computed(() => {
  return props.group?.members || []
})

// 无限滚动相关状态
const members = ref([])
const loading = ref(false)
const finished = ref(false)
const pageSize = 7
const currentPage = ref(1)



// 文件数据
const files = ref([
  { id: 1, name: 'Vue3开发指南.pdf', size: '2.3MB', time: '昨天', type: 'document', uploader: '张三' },
  { id: 2, name: '项目需求文档.docx', size: '1.8MB', time: '前天', type: 'document', uploader: '李四' },

])

// 文件筛选选项
const fileFilters = ref([
  { type: 'all', label: '全部' },
  { type: 'document', label: '文档' },
  { type: 'image', label: '图片' },
  { type: 'video', label: '视频' }
])





// 搜索处理函数
const handleSearch = () => {
  // 重置分页状态
  members.value = []
  currentPage.value = 1
  finished.value = false
  // 重新加载数据
  loadMembers()
}

// 无限滚动加载方法 - 通过API动态获取数据
const loadMembers = async () => {
  if (loading.value || finished.value || !props.group?.id) return

  loading.value = true

  try {
    // 如果有搜索条件，从本地已有数据中过滤
    if (memberSearchQuery.value) {
      // 搜索模式：从allMembers中过滤
      const filteredData = allMembers.value.filter(member =>
        (member.name || member.username || '').toLowerCase().includes(memberSearchQuery.value.toLowerCase())
      )

      const startIndex = (currentPage.value - 1) * 7
      const endIndex = startIndex + 7
      const newMembers = filteredData.slice(startIndex, endIndex)

      if (newMembers.length > 0) {
        if (currentPage.value === 1) {
          members.value = newMembers
        } else {
          members.value.push(...newMembers)
        }
        currentPage.value++
      }

      if (endIndex >= filteredData.length) {
        finished.value = true
      }
    } else {
      // 无搜索模式：通过API获取更多数据
      const response = await listGroupMember(props.group.id, {
        page: currentPage.value,
        pageSize: 7
      })

      if (response.code === 200 && response.data && response.data.records) {
        const newMembers = response.data.records

        if (newMembers.length > 0) {
          if (currentPage.value === 1) {
            members.value = newMembers
          } else {
            members.value.push(...newMembers)
          }
          currentPage.value++
        }

        // 检查是否还有更多数据
        if (newMembers.length < 7 || members.value.length >= (response.data.total || 0)) {
          finished.value = true
        }
      } else {
        finished.value = true
      }
    }
  } catch (error) {
    console.error('加载群成员失败:', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 重置无限滚动状态
const resetInfiniteScroll = async () => {
  members.value = []
  currentPage.value = 1
  finished.value = false
  loading.value = false
  // 重新加载第一页数据
  await loadMembers()
}

// 初始化成员数据
const initializeMembers = async () => {
  // 重置状态
  members.value = []
  currentPage.value = 1
  finished.value = false
  loading.value = false
  // 加载第一页数据
  await loadMembers()
}

// 统计计算属性
const onlineMembersCount = computed(() => {
  return allMembers.value.filter(member => member.status === 1 || member.online).length
})

const adminMembersCount = computed(() => {
  return allMembers.value.filter(member => member.role === 2 || member.role === 1 || member.role === 'admin' || member.role === 'owner').length
})

// 文件管理相关计算属性
const filteredFiles = computed(() => {
  let filtered = files.value

  // 按类型筛选
  if (activeFileFilter.value !== 'all') {
    filtered = filtered.filter(file => file.type === activeFileFilter.value)
  }

  // 按搜索关键词筛选
  if (fileSearchQuery.value) {
    filtered = filtered.filter(file =>
      file.name.toLowerCase().includes(fileSearchQuery.value.toLowerCase()) ||
      file.uploader.toLowerCase().includes(fileSearchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const totalFiles = computed(() => files.value.length)

const totalSize = computed(() => {
  const totalMB = files.value.reduce((sum, file) => {
    const size = parseFloat(file.size.replace('MB', ''))
    return sum + (isNaN(size) ? 0 : size)
  }, 0)
  return totalMB.toFixed(1) + 'MB'
})

const recentUploads = computed(() => {
  return files.value.filter(file => file.time === '今天' || file.time.includes('小时前')).length
})

// 方法
const goBack = () => {
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  emit('update:visible', false)
}

// 切换iPhone预览模式（只影响卡片大小）
const toggleIPhonePreview = () => {
  isIPhonePreview.value = !isIPhonePreview.value
}

// 点击成员头像显示用户详情
const handleAvatarClick = (member, event) => {
  event.stopPropagation()

  // 确保数据字段正确映射到UserDetailPopup组件期望的格式
  selectedUser.value = {
    id: member.id || member.uid,
    name: member.name || member.username || member.nickname,
    avatar: member.avatar || member.avatarUrl,
    level: member.level || 1,
    createTime: member.createTime || member.joinTime || new Date().toISOString(),
    status: member.status !== undefined ? member.status : false, // 默认不在线
    isFriend: member.isFriend || false
  }

  // 计算弹窗位置
  const rect = event.target.getBoundingClientRect()
  userDetailPosition.value = {
    x: rect.left + rect.width + 10,
    y: rect.top
  }

  showUserDetail.value = true
}

// 踢出成员
const handleKickMember = (member) => {
  // 设置要踢出的成员信息并显示警告弹窗
  memberToKick.value = member
  showKickWarning.value = true
}

// 确认踢出成员
const confirmKickMember = async () => {
  if (!memberToKick.value) return

  try {
    const response = await removeMember({
      uid: memberToKick.value.id,
      roomId: props.group.id
    })

    if (response.code === 200) {
      ArcMessage.success('成员已被踢出')
      // 重新加载成员列表
      await resetInfiniteScroll()
      // 通知父组件重新获取数据
      emit('refresh-group-data')
    } else {
      ArcMessage.error(response.message || '踢出成员失败')
    }
  } catch (error) {
    ArcMessage.error('踢出成员失败')
  } finally {
    // 关闭弹窗并清空选中的成员
    showKickWarning.value = false
    memberToKick.value = null
  }
}

// 取消踢出成员
const cancelKickMember = () => {
  showKickWarning.value = false
  memberToKick.value = null
}

// 授予管理员权限
const handleGrantPermission = (member) => {

  memberToChangePermission.value = member
  permissionAction.value = 'grant'
  showPermissionWarning.value = true
}

// 撤销管理员权限
const handleRevokePermission = (member) => {
  memberToChangePermission.value = member
  permissionAction.value = 'revoke'
  showPermissionWarning.value = true
}

// 确认权限变更
const confirmPermissionChange = async () => {
  if (!memberToChangePermission.value) return

  try {
    // 这里需要根据实际API调整
    const response = await authorizeMember({
      uid: memberToChangePermission.value.uid || memberToChangePermission.value.id,
      groupId: props.group.id,
      role: permissionAction.value === 'grant' ? 2 : 3
    })

    ArcMessage.success(`${permissionAction.value === 'grant' ? '授予' : '撤销'}管理员权限成功`)

    // 重新加载成员列表
    await resetInfiniteScroll()
    // 通知父组件重新获取数据
    emit('refresh-group-data')
  } catch (error) {
    ArcMessage.error('权限变更失败')
  } finally {
    // 关闭弹窗并清空选中的成员
    showPermissionWarning.value = false
    memberToChangePermission.value = null
    permissionAction.value = ''
  }
}

// 取消权限变更
const cancelPermissionChange = () => {
  showPermissionWarning.value = false
  memberToChangePermission.value = null
  permissionAction.value = ''
}

// 判断是否可以管理权限
const canManagePermission = (member) => {
  // 只有群主可以管理权限
  if (currentUser.value.role !== 1) return false

  // 不能管理自己的权限
  if (String(member.id) === String(currentUser.value.id) || String(member.uid) === String(currentUser.value.id)) return false

  // 只能管理管理员和普通成员的权限
  return member.role === 2 || member.role === 3 || !member.role
}

// 判断是否为群主
const isGroupOwner = computed(() => {
  return currentUser.value.role === 1
})

// 判断是否可以看到群管理tab
const canSeeManageTab = computed(() => {
  // 只有群主和管理员可以看到群管理tab
  return currentUser.value.role === 1 || currentUser.value.role === 2
})

// 判断是否可以踢出成员
const canKickMember = (member) => {


  // 群主可以踢出所有人(除了自己)
  if (currentUser.value.role === 1) {

    return member.uid !== currentUser.value.id
  }

  // 管理员只能踢出普通成员
  if (currentUser.value.role === 2) {
    return member.role !== 1 && member.role !== 2 // 不能踢出群主和管理员
  }

  // 普通成员不能踢出任何人
  return false
}

const handleAddMember = () => {
  console.log('添加成员')
}


// 文件管理相关方法
const getFileIcon = (type) => {
  const iconMap = {
    document: DocumentIcon,
    image: Picture,
    video: VideoPlay
  }
  return iconMap[type] || DocumentIcon
}



const handleFileClick = (file) => {
  console.log('点击文件:', file)
  // 这里可以预览文件或下载文件
}



const handleFileDelete = (file) => {
  console.log('删除文件:', file)
  // 这里可以显示确认对话框并删除文件
}



// 监听抽屉显示状态，处理拖拽初始化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 重置位置到居中
    position.value = { 
      x: window.innerWidth / 2 - (isIPhonePreview.value ? 225 : 600), 
      y: window.innerHeight / 2 - 400 
    }
  }
})

// 监听props.group变化，重新初始化数据
watch(() => props.group, (newGroup) => {
  if (newGroup && newGroup.id) {
    initializeMembers()
  }
}, { immediate: true })



const handleQuickAction = (action) => {
  if (action === 'share') {
    console.log('快捷操作: 分享群聊')
  } else if (action === 'invite') {
    console.log('快捷操作: 邀请好友')
  } else if (action === 'export') {
    console.log('快捷操作: 导出记录')
  }
}

const handleManageAction = (action) => {
  if (action === 'edit') {
    enterEditMode()
  } else if (action === 'disband') {
    showDisbandWarning.value = true
  }
}

// 处理危险操作
const handleDangerAction = (action) => {
  if (action === 'report') {
    ArcMessage.info('举报群聊', '功能开发中')
    ArcMessage.error('举报失败', [
        '举报失败'
      ], false, 2000)
    // 这里可以添加举报群聊的逻辑
  } else if (action === 'leave') {
    // 显示退出群聊警告弹窗
    showLeaveWarning.value = true
  }
}

// 确认退出群聊
const confirmLeaveGroup = async () => {
  try {
    let response = await outGroup(props.group.id)
      emit('refresh-group-data')
      emitter.emit('refresh-group-contact-list')
      ArcMessage.info('操作成功','退出群聊成功')
      router.push('/chat')
    }
  catch (error) {
    ArcMessage.error(error.code,[error.msg,"请正确操作","如还有问题请联系管理员3381335358@qq.com"],true)
  }
  finally {
    showLeaveWarning.value = false
  }

}

// 取消退出群聊
const cancelLeaveGroup = () => {
  showLeaveWarning.value = false
}

// 进入编辑模式
const enterEditMode = () => {
  editForm.value = {
    name: props.group.name || '',
    announcement: props.group.announcement || props.group.groupDesc || ''
  }
  avatarFile.value = null
  avatarPreview.value = ''
  showEditDialog.value = true
}

// 退出编辑模式
const exitEditMode = () => {
  showEditDialog.value = false
  editForm.value = {
    name: '',
    announcement: ''
  }
  avatarFile.value = null
  avatarPreview.value = ''
}

// 处理头像上传
const handleAvatarUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      avatarFile.value = file
      avatarPreview.value = URL.createObjectURL(file)
    } else {
      ArcMessage.warning('请上传图片文件')
    }
  }
  input.click()
}

// 确认保存群信息
const confirmSaveGroupInfo = async () => {
  if (!editForm.value.name.trim()) {
    ArcMessage.warning('群名称不能为空')
    return
  }

  if (editForm.value.announcement.length > 100) {
    ArcMessage.warning('群公告不能超过100字')
    return
  }

  isUploading.value = true

  try {
    let avatarUrl = props.group.avatar

    // 如果有新头像，先上传
    if (avatarFile.value) {
      const uploadRes = await uploadImageFile(avatarFile.value)
      if (uploadRes && uploadRes.data) {
        avatarUrl = uploadRes.data
      } else {
        throw new Error('头像上传失败')
      }
    }

    // 更新群信息
    const updateData = {
      roomId: props.group.id,
      name: editForm.value.name,
      avatar: avatarUrl,
      groupDesc: editForm.value.announcement
    }

    const response = await modifyGroup(updateData)

    if (response.code === 200) {
      exitEditMode()
      showSuccessTips.value = true

      emit('refresh-group-data')
    } else {
      ArcMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新群信息失败:', error)
    ArcMessage.error('更新失败，请稍后重试')
  } finally {
    isUploading.value = false
  }
}

// 确认解散群聊
const confirmDisbandGroup = async () => {
  try {
    await dismissGroup(props.group.id)
    ArcMessage.success('群聊已解散')
    showDisbandWarning.value = false
    emit('update:visible', false)
  } catch (error) {
    console.error('解散群聊失败:', error)
    ArcMessage.error('解散失败，请稍后重试')
  }
}

// 取消解散群聊
const cancelDisbandGroup = () => {
  showDisbandWarning.value = false
}

// 生命周期钩子 - 清理拖拽事件
onMounted(() => {
  // 组件挂载时无需特殊处理
})

onUnmounted(() => {
  // 组件卸载时清理可能残留的事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
/* 抽屉样式 */
.group-detail-drawer {
  position: fixed;
  width: 80%;
  max-width: 1200px;
  height: 100vh;
  max-height: 800px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 28px;
  overflow: hidden;
  z-index: 20000;
  animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  cursor: grab;
  user-select: none;
  
  /* 高性能拖拽优化 - 完全照拷通话气泡 */
  will-change: transform, left, top;
  transform: translate3d(0, 0, 0); /* 强制硬件加速 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  /* 移除所有transition，确保拖拽时无延迟 */
  transition: none !important;
  
  /* 优化渲染性能 */
  contain: layout style paint;
  isolation: isolate;
}

/* iPhone预览模式 - 缩小抽屉宽度，内容响应式布局 */
.group-detail-drawer.iphone-card-preview {
  max-width: 440px;
  width: 85%;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.group-detail-drawer.iphone-card-preview .drawer-content {
  padding: 20px 20px 36px 20px;
}

.group-detail-drawer.iphone-card-preview .info-card {
  padding: 20px;
  margin-bottom: 16px;
}

.group-detail-drawer.iphone-card-preview .admin-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-detail-drawer.iphone-card-preview .left-panel {
  width: 100%;
  margin-right: 0;
  margin-bottom: 20px;
}

.group-detail-drawer.iphone-card-preview .right-panel {
  width: 100%;
}

.group-detail-drawer.iphone-card-preview .member-item {
  padding: 10px;
  margin: 6px;
}

.group-detail-drawer.iphone-card-preview .group-info-section {
  padding: 20px;
}

.group-detail-drawer.iphone-card-preview .group-name {
  font-size: 20px;
}

.group-detail-drawer.iphone-card-preview .card-header {
  font-size: 16px;
}

/* 统计网格在缩小模式下单列显示 */
.group-detail-drawer.iphone-card-preview .stats-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}

/* 文件统计在缩小模式下单列显示 */
.group-detail-drawer.iphone-card-preview .file-stats {
  grid-template-columns: 1fr;
  gap: 10px;
}

/* 按钮组在缩小模式下横向排列，按钮宽度自适应 */
.group-detail-drawer.iphone-card-preview .action-buttons {
  flex-direction: row;
  gap: 12px;
  justify-content: center;
}

.group-detail-drawer.iphone-card-preview .action-buttons button {
  width: auto !important;
  flex: 0 0 auto;
  min-width: 100px;
}

/* 文件过滤器在缩小模式下横向排列 */
.group-detail-drawer.iphone-card-preview .file-filters {
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 成员操作区域在缩小模式下优化 */
.group-detail-drawer.iphone-card-preview .member-actions {
  gap: 6px;
  flex-wrap: wrap;
}

/* 成员操作按钮在缩小模式下调整大小 */
.group-detail-drawer.iphone-card-preview .member-actions button {
  font-size: 12px;
  padding: 6px 10px;
  min-width: auto;
}


/* Apple 风格反光效果 */
.group-detail-drawer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.8) 20%,
      rgba(255, 255, 255, 0.9) 50%,
      rgba(255, 255, 255, 0.8) 80%,
      transparent 100%);
  z-index: 1;
}

/* 边角高光反射 */
.group-detail-drawer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 50%,
      transparent 75%,
      rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .group-detail-drawer {
    width: 98%;
    max-width: none;
    max-height: 95vh;
    border-radius: 20px;
  }

  .drawer-content {
    padding: 24px 24px 40px 24px;
  }

  .group-info-section {
    padding: 32px 20px;
  }

  .info-card {
    padding: 28px;
  }
}

@media (max-width: 480px) {
  .group-detail-drawer {
    width: 100%;
    max-height: 98vh;
    border-radius: 16px;
  }

  .drawer-content {
    padding: 20px 20px 36px 20px;
  }

  .group-info-section {
    padding: 28px 16px;
  }

  .info-card {
    padding: 24px;
  }
}

.drawer-header {
  padding: 20px 30px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  /* 拖拽相关样式 */
  cursor: grab;
  user-select: none;
}

.drawer-header:active {
  cursor: grabbing;
}

.drawer-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

.drawer-handle {
  width: 32px;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  margin: 0 auto 16px;
  transition: background-color 0.3s ease;
}

.drawer-handle:hover {
  background: rgba(0, 0, 0, 0.3);
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.dark-mode .page-title {
  color: white;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 32px 48px 32px;
  background: linear-gradient(180deg,
      rgba(248, 250, 252, 0.4) 0%,
      rgba(241, 245, 249, 0.3) 100%);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  position: relative;
}

/* 管理系统风格布局 */
.admin-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 100%;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .admin-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .left-panel,
  .right-panel {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .drawer-content {
    padding: 24px 24px 40px 24px;
  }

  .admin-layout {
    gap: 16px;
  }

  .left-panel,
  .right-panel {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .drawer-content {
    padding: 20px 20px 36px 20px;
  }

  .admin-layout {
    gap: 12px;
  }

  .left-panel,
  .right-panel {
    gap: 10px;
  }
}

.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 群基本信息 */
.group-info-section {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.group-info-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 20px;
}

.group-info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.group-avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.group-avatar {
  border: 4px solid #f5f5f7;
  width: 100px !important;
  height: 100px !important;
}



.group-details {
  width: 100%;
}

.group-name {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 6px;
}

.group-meta {
  font-size: 16px;
  color: #8e8e93;
  margin: 0 0 20px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}




/* 信息卡片 */
.info-card {
  background: linear-gradient(145deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.85) 100%);
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border-radius: 24px;
  padding: 28px;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.06),
    0 8px 20px rgba(0, 0, 0, 0.04),
    0 4px 10px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}



.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 18px;
}

.card-header .el-icon {
  margin-right: 10px;
  color: #409eff;
  font-size: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

/* 群公告 */
.announcement-text {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", STHeiti, "Microsoft Yahei", Tahoma, Simsun, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  color: #12035f;
  letter-spacing: 0.5px;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  max-width: 100%;
}

.dark-mode .announcement-text {
  color: #9e9898;
}

/* 成员搜索 */
.member-search {
  margin-bottom: 20px;
}

.member-search .el-input__wrapper {
  height: 48px;
  font-size: 16px;
}

/* 成员列表 */
.members-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(180, 31, 31, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 10px;
}

/* 群主金色渐变背景 */
.member-item.owner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.1) 50%, rgba(255, 152, 0, 0.15) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.member-item.owner:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 193, 7, 0.2) 50%, rgba(255, 152, 0, 0.25) 100%);
  border: 1px solid rgba(255, 215, 0, 0.5);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
}

/* 管理员绿色渐变背景 */
.member-item.admin {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.1) 50%, rgba(0, 200, 83, 0.15) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.member-item.admin:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(139, 195, 74, 0.2) 50%, rgba(0, 200, 83, 0.25) 100%);
  border: 1px solid rgba(76, 175, 80, 0.5);
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.2);
}

.member-item:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.member-badge {
  flex-shrink: 0;
}

.member-badge .el-avatar {
  width: 48px !important;
  height: 48px !important;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.member-name {
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
}


.role-tag {
  flex-shrink: 0;

}


.add-member {
  border: 1px dashed #d0d0d0;
  background: #fafafa;
}

.add-member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
}

.add-member-avatar .el-icon {
  font-size: 20px;
}

/* 无限滚动容器样式 */
.infinite-scroll-container {
  max-height: 400px;
  overflow-y: auto;
}

/* 加载状态样式 */
.loading-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #666;
  font-size: 14px;
}

.loading-item .el-icon {
  font-size: 16px;
  color: #409eff;
}

/* 加载完成提示样式 */
.finished-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #999;
  font-size: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

/* 暗色模式下的加载状态 */
.dark-mode .loading-item {
  color: #a0a0a0;
}

.dark-mode .loading-item .el-icon {
  color: #6ca6ff;
}

.dark-mode .finished-item {
  color: #666;
  border-top-color: rgba(255, 255, 255, 0.1);
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.clickable {
  cursor: pointer;
}

.setting-item.clickable:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  margin: 0 -16px;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}




/* 群管理选项样式 */
.manage-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manage-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.manage-option:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.manage-option.danger-option:hover {
  background: rgba(255, 235, 238, 0.8);
  border-color: rgba(244, 67, 54, 0.3);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  color: #409eff;
}

.option-icon.danger-icon {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-title {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.option-arrow {
  color: #999;
  font-size: 16px;
}

:deep(.el-tabs__content) {
  padding: 5px 2%;
  margin-top: 12px;
}

/* 暗色模式适配 */
:deep(.el-tabs__content .quick-actions button) {
  margin-top: 1%;
}

.dark-mode .manage-option {
  background: rgba(42, 42, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .manage-option:hover {
  background: rgba(42, 42, 42, 0.8);
}

.dark-mode .manage-option.danger-option:hover {
  background: rgba(74, 44, 44, 0.8);
  border-color: rgba(244, 67, 54, 0.4);
}

.dark-mode .option-title {
  color: #ffffff;
}

.dark-mode .option-desc {
  color: #a0a0a0;
}

.dark-mode .option-arrow {
  color: #666;
}

/* 危险操作 */
.danger-card {
  border: 1px solid #ffebee;
  background: #fff5f5;
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.danger-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.danger-item:hover {
  background: rgba(255, 235, 238, 0.8);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
}

.danger-item span {
  font-weight: 500;
}

.danger-item .el-icon {
  font-size: 20px;
}

/* 文件管理面板样式 */
.file-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-search {
  margin-bottom: 8px;
}

.file-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  transform: translateY(-1px);
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-item:hover {
  background: rgba(182, 246, 255, 0.8) !important;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .file-item:hover {
  background: rgba(54, 37, 102, 0.8) !important;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  color: #409eff;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

.file-size,
.file-time,
.file-uploader {
  white-space: nowrap;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}


.file-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 暗色模式适配 */
.dark-mode .group-detail-drawer {
  background: linear-gradient(145deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(20, 20, 20, 0.9) 100%);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.25),
    0 16px 32px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

.dark-mode .group-detail-drawer::before {
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 20%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.15) 80%,
      transparent 100%);
}

.dark-mode .group-detail-drawer::after {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.03) 25%,
      transparent 50%,
      transparent 75%,
      rgba(255, 255, 255, 0.02) 100%);
}

.dark-mode .drawer-header {
  background: rgba(26, 26, 26, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .drawer-content {
  background: rgba(15, 15, 15, 0.8);
}

.dark-mode .info-card {
  background: rgba(42, 42, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .group-info-section {
  background: rgba(42, 42, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .group-name {
  color: #ffffff;
}

.dark-mode .group-meta {
  color: #a0a0a0;
}

.dark-mode .card-header {
  color: #ffffff;
}

.dark-mode .member-name {
  color: #ffffff;
}

.dark-mode .setting-item {
  border-bottom-color: #333;
}

.dark-mode .danger-card {
  border-color: #4a2c2c;
  background: #2a1a1a;
}

.dark-mode .danger-item:hover {
  background: #4a2c2c;
}

.dark-mode .admin-layout {
  background: rgba(15, 15, 15, 0.8);
}

.dark-mode .stat-item {
  background: rgba(42, 42, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .stat-item:hover {
  background: rgba(42, 42, 42, 0.8);
}

.dark-mode .stat-number {
  color: #6ca6ff;
}

.dark-mode .stat-label {
  color: #a0a0a0;
}

.dark-mode .quick-action-btn {
  background: rgba(42, 42, 42, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .quick-action-btn:hover {
  background: rgba(42, 42, 42, 1);
}

/* 文件管理面板暗色模式 */
.dark-mode .file-item {
  background: rgba(42, 42, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .file-item:hover {
  background: rgba(42, 42, 42, 0.8);
}

.dark-mode .file-name {
  color: #ffffff;
}

.dark-mode .file-meta {
  color: #a0a0a0;
}

.dark-mode .file-icon {
  background: rgba(108, 166, 255, 0.2);
  color: #6ca6ff;
}

.dark-mode .file-stats {
  border-top-color: rgba(255, 255, 255, 0.1);
}

/* 新增/增强暗色模式适配和hover效果 */
.dark-mode .info-card {
  background: rgba(42, 42, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .stat-item {
  background: rgba(42, 42, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .stat-item:hover {
  background: rgba(42, 42, 42, 0.8);
}

.dark-mode .file-item {
  background: rgba(42, 42, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .file-item:hover {
  background: rgba(42, 42, 42, 0.8);
}

.dark-mode .member-item {
  background: rgba(42, 42, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 暗色模式下普通成员item的hover效果 */
.dark-mode .member-item:hover:not(.owner):not(.admin) {
  background: rgba(42, 42, 42, 0.8);
}

/* 暗色模式下的群主金色渐变 */
.dark-mode .member-item.owner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.15) 50%, rgba(255, 152, 0, 0.2) 100%);
  border: 1px solid rgba(255, 215, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark-mode .member-item.owner:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.25) 50%, rgba(255, 152, 0, 0.3) 100%);
  border: 1px solid rgba(255, 215, 0, 0.6);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
}

/* 暗色模式下的管理员绿色渐变 */
.dark-mode .member-item.admin {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(139, 195, 74, 0.15) 50%, rgba(0, 200, 83, 0.2) 100%);
  border: 1px solid rgba(76, 175, 80, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark-mode .member-item.admin:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(139, 195, 74, 0.25) 50%, rgba(0, 200, 83, 0.3) 100%);
  border: 1px solid rgba(76, 175, 80, 0.6);
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}



.dark-mode .setting-item {
  background: rgba(42, 42, 42, 0.5);
  border-bottom-color: #333;
}

.dark-mode .setting-item.clickable:hover {
  background: rgba(64, 158, 255, 0.08);
  color: #6ca6ff;
}

.dark-mode .danger-item {
  background: rgba(42, 42, 42, 0.5);
  border-color: #4a2c2c;
}

.dark-mode .danger-item:hover {
  background: #4a2c2c;
}

.dark-mode .file-filters .el-tag {
  background: rgba(42, 42, 42, 0.7) !important;
  color: #a0a0a0 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.file-item,
.member-item,
.stat-item,
.setting-item,
.danger-item {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.file-item:hover,
.stat-item:hover,
.setting-item.clickable:hover,
.danger-item:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 普通成员item的hover效果 */
.member-item:hover:not(.owner):not(.admin) {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 成员项布局调整 */
.member-item {
  display: flex;
  align-items: center;
  position: relative;
  padding: 12px;
  gap: 12px;
}

/* 可点击头像样式 */
.clickable-avatar {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 成员信息区域 */
.member-info {
  flex: 1;
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 角色徽章样式 */
.member-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, #ffd700 0%, #ffc107 50%, #ff9800 100%);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.member-role-badge.admin {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 50%, #00c853 100%);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.member-role-badge .el-icon {
  font-size: 14px;
}

/* 成员操作区域 */
.member-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 暗色模式下的角色徽章 */
.dark-mode .member-role-badge {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 193, 7, 0.8) 50%, rgba(255, 152, 0, 0.8) 100%);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.4);
}

.dark-mode .member-role-badge.admin {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(139, 195, 74, 0.8) 50%, rgba(0, 200, 83, 0.8) 100%);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.4);
}


/* 警告弹窗覆盖层样式 */
.group-detail-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10000; /* 确保在最顶层 */
  display: flex;
  justify-content: center;
  align-items: center; /* 确保垂直居中 */
  pointer-events: auto; /* 确保可以响应点击事件 */
}

.success-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50000; /* 提升层级，确保覆盖在管理页面之上 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 暗色模式下的警告弹窗覆盖层 */
.dark-mode .warning-overlay {
  background: rgba(0, 0, 0, 0.7);
}

/* 群信息编辑弹窗样式 */
.edit-group-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.edit-section {
  margin-bottom: 30px;
}

.edit-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--light-text);
}

.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.current-avatar {
  flex-shrink: 0;
}

.upload-button {
  flex-shrink: 0;
}

.upload-tip {
  margin: 0;
  font-size: 12px;
  color: var(--light-secondary-text);
  flex-basis: 100%;
}

.name-input,
.announcement-input {
  width: 100%;
}

.edit-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--light-border);
}

.cancel-button,
.save-button {
  min-width: 100px;
}

/* 暗色模式适配 */
.dark-mode .edit-section h3 {
  color: var(--dark-text);
}

.dark-mode .upload-tip {
  color: var(--dark-secondary-text);
}

.dark-mode .edit-actions {
  border-top-color: var(--dark-border);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .edit-group-content {
    padding: 15px;
  }

  .avatar-upload-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .edit-actions {
    flex-direction: column;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }
}
</style>

