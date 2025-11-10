<template>
  <div class="container">
  
  <div class="notice-center-glass-pc">
    <div class="notice-center-header-pc">
      <h1 class="notice-title-pc" style="display: flex; gap:12px; align-items: center;"> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><!-- Icon from Flat Color Icons by Icons8 - undefined --><path fill="#2196F3" d="M37 40H11l-6 6V12c0-3.3 2.7-6 6-6h26c3.3 0 6 2.7 6 6v22c0 3.3-2.7 6-6 6"/><g fill="#fff"><path d="M22 20h4v11h-4z"/><circle cx="24" cy="15" r="2"/></g></svg>消息中心</h1>
   
      <div class="notice-search-bar">
        <PurpleInput
          v-model="searchText"
          placeholder="Search..."
          :icon="SearchIcon"
          :width="350"
        />
      </div>
    </div>
   
    <!-- 新增仪表盘卡片布局 -->
    <div class="dashboard-section">
    <div class="dashboard-cards">
      <div v-for="(stat, idx) in dashboardStats" :key="idx" class="dashboard-card">
        <div class="dashboard-card-icon" :style="{background: stat.bg, color: stat.color}" v-html="stat.icon"></div>
        <div class="dashboard-card-info">
          <div class="dashboard-card-title">{{ stat.value }}</div>
          <div class="dashboard-card-desc">{{ stat.desc }}</div>
        </div>
      </div>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-group-invites">
        <div class="dashboard-section-title-row">
          <span class="dashboard-section-title">群聊邀请</span>
          <span class="dashboard-section-icons">
            <component :is="SearchIcon" />
            <component :is="FilterIcon" />
          </span>
        </div>
        <table class="dashboard-table">
          <thead>
            <tr><th>Inviter</th><th>Group</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="invite in pagedGroupInvites" :key="invite.inviter + invite.group + invite.date">
              <td><img :src="invite.avatar" class="dashboard-avatar"/> {{ invite.inviter }}</td>
              <td>{{ invite.group }}</td>
              <td>{{ invite.date }}</td>
              <td>
                <span class="dashboard-status" :class="invite.status.toLowerCase()">{{ invite.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      <el-pagination
        background
        layout="prev, pager, next"
          :total="groupInvites.length"
          :page-size="groupInvitePageSize"
          :current-page="groupInvitePage"
          @current-change="handleGroupInvitePageChange"
          style="margin-top:16px;justify-content:flex-end;"
      />
    </div>
      <div class="dashboard-sysmsgs">
        <div class="dashboard-section-title-row">
          <span class="dashboard-section-title">系统消息</span>
          <span class="dashboard-section-icons">
            <component :is="SearchIcon" />
            <component :is="FilterIcon" />
          </span>
        </div>
        <ul class="dashboard-todo-list">
          <li v-for="(msg, idx) in sysMessages" :key="idx" :class="msg.type">
            <span></span>
            <component :is="getSysMsgIcon(msg.type)" style="margin-right:8px;" />
            {{ msg.text }}
          </li>
        </ul>
          </div>
        </div>
      </div>
  <!-- 仪表盘卡片布局结束 -->
  </div>

  <div class="notice-grid-section-pc-standalone">
    <h2 class="notice-grid-title-pc">更多服务</h2>
    <div class="notice-grid-pc-standalone">
      <div v-for="item in gridItems" :key="item.title" class="notice-grid-card-pc-standalone">
        <div class="notice-grid-icon-pc" v-html="item.icon"></div>
        <div class="notice-grid-content-pc">
          <div class="notice-grid-card-title-pc">{{ item.title }}</div>
          <div class="notice-grid-card-desc-pc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
// #region 导入依赖
import { ref, computed, defineComponent, h } from 'vue';
import PurpleInput from '@/components/form/PurpleInput.vue';
// #endregion

// #region 图标组件定义
const SearchIcon = defineComponent({
  name: 'SearchIcon',
  render() {
    return h('svg', {
      width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none',
      class: 'dashboard-icon',
    }, [
      h('circle', { cx: 11, cy: 11, r: 7, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M20 20L17 17', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ])
  }
})
const FilterIcon = defineComponent({
  name: 'FilterIcon',
  render() {
    return h('svg', {
      width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none',
      class: 'dashboard-icon',
    }, [
      h('path', { d: 'M4 7h16', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M7 12h10', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M10 17h4', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ])
  }
});

const UpdateMajorIcon = defineComponent({
  name: 'UpdateMajorIcon',
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '22', viewBox: '0 0 12 12', fill: 'none', class: 'sysmsg-icon' }, [
      h('path', { fill: '#e00e0e', d: 'M4.283 2.98a1.735 1.735 0 1 1 3.434 0l-.576 4.03a1.153 1.153 0 0 1-2.282 0zM7 10a1 1 0 1 1-2 0a1 1 0 0 1 2 0' })
    ])
  }
})
const UpdateMinorIcon = defineComponent({
  name: 'UpdateMinorIcon',
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '22', viewBox: '0 0 24 24', fill: 'none', class: 'sysmsg-icon' }, [
      h('path', { fill: '#409EFF', d: 'M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2L8.6 4.5L10 7zm12 9.8L22 14l-1.4 2.5L22 19l-2.5-1.4L17 19l1.4-2.5L17 14zM22 2l-1.4 2.5L22 7l-2.5-1.4L17 7l1.4-2.5L17 2l2.5 1.4zm-8.66 10.78l2.44-2.44l-2.12-2.12l-2.44 2.44zm1.03-5.49l2.34 2.34c.39.37.39 1.02 0 1.41L5.04 22.71c-.39.39-1.04.39-1.41 0l-2.34-2.34c-.39-.37-.39-1.02 0-1.41L12.96 7.29c.39-.39 1.04-.39 1.41 0' })
    ])
  }
})
const BugFixIcon = defineComponent({
  name: 'BugFixIcon',
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '22', viewBox: '0 0 24 24', fill: 'none', class: 'sysmsg-icon' }, [
      h('path', { fill: '#21e208', d: 'M11.157 20.313a9.157 9.157 0 1 0 0-18.313a9.157 9.157 0 0 0 0 18.313', opacity: '.5' }),
      h('path', { fill: '#21e208', d: 'M17.1 18.122a9 9 0 0 0 1.022-1.022l3.666 3.666a.723.723 0 0 1-1.022 1.022z' }),
      h('path', { fill: '#21e208', 'fill-rule': 'evenodd', d: 'M11 6.5c-1.14 0-2.157.532-2.81 1.36l-.68-.338a.716.716 0 0 0-.958.318a.71.71 0 0 0 .319.953l.679.338a3.5 3.5 0 0 0-.121.922v.236h-.715A.71.71 0 0 0 6 11c0 .392.32.71.714.71h.715v.237q.001.48.12.922l-.678.338a.71.71 0 0 0-.32.953c.177.35.606.493.959.318l.68-.338A3.57 3.57 0 0 0 11 15.5c1.14 0 2.157-.532 2.81-1.36l.68.338a.716.716 0 0 0 .958-.318a.71.71 0 0 0-.319-.953l-.679-.338q.12-.442.121-.922v-.236h.715A.71.71 0 0 0 16 11c0-.392-.32-.71-.714-.71h-.715v-.237q-.002-.48-.12-.922l.678-.338a.71.71 0 0 0 .32-.953a.716.716 0 0 0-.959-.318l-.68.338A3.57 3.57 0 0 0 11 6.5m0 1.42c-.933 0-1.726.594-2.02 1.422h4.041a2.14 2.14 0 0 0-2.02-1.421m-2.143 4.027v-1.184h1.429v3.194a2.13 2.13 0 0 1-1.429-2.01m2.858 2.01v-3.194h1.428v1.184c0 .928-.596 1.718-1.428 2.01', 'clip-rule': 'evenodd' })
    ])
  }
});
// #endregion

// #region 数据存储
// 搜索
const searchText = ref(''); // 搜索关键词

// 仪表盘统计数据
const dashboardStats = [ // 仪表盘卡片数据
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025"/></svg>` ,
    value: '1020',
    desc: 'New Group Invites',
    bg: '#cfe8ff',
    color: '#3c91e6',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/><path d="M15.03 17.478A8.8 8.8 0 0 1 12 18q-5.4 0-9-6q3.6-6 9-6t9 6a21 21 0 0 1-.258.419M19 16v3m0 3v.01"/></g></svg>`,
    value: '2834',
    desc: 'Visitors',
    bg: '#fff2c6',
    color: '#ffce26',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m3 8h-4v1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1h-2v-1H9v-2h4v-1h-3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1V7h2v1h2z" fill="currentColor"/></svg>`,
    value: '$2543.00',
    desc: 'Total Arcorns',
    bg: '#ffe0d3',
    color: '#fd7238',
  },
]

// 群聊邀请数据
const groupInvites = ref([ // 群聊邀请列表
  { inviter: 'Micheal John', group: 'Vue Devs', date: '18-10-2021', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Ryan Doe', group: 'Frontend Masters', date: '01-06-2022', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Tarry White', group: 'Design Team', date: '14-10-2021', status: 'Declined', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Selma', group: 'AI Enthusiasts', date: '01-02-2023', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Andreas Doe', group: 'Open Source', date: '31-10-2021', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Jane Smith', group: 'UI/UX', date: '05-03-2022', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Tom Lee', group: 'Backend Pros', date: '12-07-2022', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Anna Kim', group: 'ML Club', date: '22-08-2022', status: 'Declined', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Chris Paul', group: 'React China', date: '10-09-2022', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Linda Green', group: 'Cloud Native', date: '15-10-2022', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
])
const groupInvitePage = ref(1) // 群聊邀请当前页
const groupInvitePageSize = 5 // 群聊邀请每页数量

// 系统消息
const sysMessages = [ // 系统消息列表
  { text: 'Platform v2.0 Major Update Released', type: 'major' },
  { text: 'Added new notification center', type: 'minor' },
  { text: 'Fixed group invite bug', type: 'bugfix' },
  { text: 'UI overhaul for dashboard', type: 'major' },
  { text: 'Improved performance', type: 'minor' },
  { text: 'Fixed login issue', type: 'bugfix' },
]

// 服务网格
const gridItems = [ // 服务网格项目列表
  {
    title: '网站资源',
    desc: '查看实用网站、工具资源汇总',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -1 24 24"><!-- Icon from Jam Icons by Michael Amprimo - https://github.com/cyberalien/jam-backup/blob/main/LICENSE --><path fill="currentColor" d="m2 8.654l2.813 2.822l6.332-6.35l-2.814-2.823l-6.332 6.35zm4.441 8.128l2.11-2.117a.993.993 0 0 1 1.408 0a1 1 0 0 1 0 1.411l-2.11 2.117a1 1 0 0 1 0 1.411L6.44 21.015a.993.993 0 0 1-1.407 0l-1.407-1.41a1 1 0 0 1 0-1.412l1.407-1.411a.993.993 0 0 1 1.407 0zm9.146-6.35l6.331-6.35l-1.407-1.412l-6.331 6.35c-.777-.78-.912-1.907-.302-2.52L19.406.956c.61-.612 1.735-.477 2.512.303l1.407 1.41c.778.78.913 1.909.302 2.52l-5.528 5.545c-.61.612-1.735.477-2.512-.303zm-.924 3.866L9.738 9.36l-.704.706l4.925 4.939zm1.407 1.412l-.704.705l1.759 1.764c.194.195.51.195.703 0a.5.5 0 0 0 0-.705zM2.06 5.77a1.5 1.5 0 0 1 .291-1.704l1.407-1.41a1.49 1.49 0 0 1 1.699-.293L6.924.892a1.986 1.986 0 0 1 2.814 0l2.814 2.823a2 2 0 0 1 0 2.822l-1.407 1.411l8.09 8.114a2.5 2.5 0 0 1 0 3.528a2.48 2.48 0 0 1-3.517 0l-8.09-8.114l-1.408 1.411c-.777.78-2.037.78-2.814 0L.592 10.065a2 2 0 0 1 0-2.823l1.467-1.47z"/></svg>`
  },
  {
    title: '游戏中心',
    desc: '游玩小游戏赚取积分、经验值。',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 11h4M8 9v4m7-1h.01M18 10h.01m-.69-5H6.68a4 4 0 0 0-3.978 3.59l-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258q-.01-.075-.017-.151A4 4 0 0 0 17.32 5"/></svg>`
  },
  {
    title: '更多AI应用',
    desc: '汇集各种效率AI工具',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE --><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 14v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5zM12 3c1.33 0 2.584.324 3.687.899l.606-.606a1 1 0 1 1 1.414 1.414l-.35.35A7.98 7.98 0 0 1 20 11v1H4v-1a7.98 7.98 0 0 1 2.644-5.942l-.351-.35a1 1 0 0 1 1.414-1.415l.606.606A8 8 0 0 1 12 3M9 7a1 1 0 1 0 0 2a1 1 0 0 0 0-2m6 0a1 1 0 1 0 0 2a1 1 0 0 0 0-2"/></g></svg>`
  },
  {
    title: '意见反馈',
    desc: '如有任何建议，欢迎随时联系我。',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M9 22c-.55 0-1-.45-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 1.11-.89 2-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12zm5.84-7.8l-1.01 1.01l-2.07-2.03l1.01-1.02c.2-.21.54-.22.78 0l1.29 1.25c.21.21.22.55 0 .79M8 11.91l4.17-4.19l2.07 2.08l-4.16 4.2H8z"/></svg>`
  },
]
// #endregion

// #region 计算属性
/**
 * 分页后的群聊邀请列表
 */
const pagedGroupInvites = computed(() => {
  const start = (groupInvitePage.value - 1) * groupInvitePageSize
  return groupInvites.value.slice(start, start + groupInvitePageSize)
})
// #endregion

// #region 功能函数
/**
 * 处理群聊邀请分页变化
 * @param {number} val - 新的页码
 */
function handleGroupInvitePageChange(val) {
  groupInvitePage.value = val
}

/**
 * 根据消息类型获取对应图标组件
 * @param {string} type - 消息类型: major/minor/bugfix
 * @returns {Component} 图标组件
 */
function getSysMsgIcon(type) {
  if (type === 'major') return UpdateMajorIcon
  if (type === 'minor') return UpdateMinorIcon
  if (type === 'bugfix') return BugFixIcon
  return null
}
// #endregion
</script>

<style scoped>




.notice-center-glass-pc {
  max-width: 1300px;
  margin: 48px auto 0 auto;
  padding: 32px 36px 32px 36px;
  /* 取消背景、阴影、圆角 */
  background: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border: none !important;
  font-family: 'San Francisco', 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}
.dark-mode .notice-center-glass-pc {
  background: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border: none !important;
}
.notice-center-header-pc {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
}
.notice-title-pc {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #1a233a;
  margin-bottom: 0;
  background: linear-gradient(90deg, #2253a7 0%, #409eff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dark-mode .notice-title-pc {
  background: linear-gradient(90deg, #eaf6ff 0%, #90c4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.notice-tabs-pc {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}
.notice-tab-pc {
  background: none;
  border: none;
  font-size: 1.08rem;
  font-weight: 600;
  color: #2253a7;
  padding: 6px 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.notice-tab-pc.active {
  background: linear-gradient(90deg, #a2bdeb 0%, #6caae9 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.10);
  backdrop-filter: blur(12px) saturate(160%);
  background-color: rgba(34, 83, 167, 0.18);
}
.dark-mode .notice-tab-pc {
  color: #ffffff;
}


.notice-search-input {
  width: 100%;
  --el-input-bg-color: rgba(255,255,255,0.95);
  --el-input-border-radius: 12px;
  --el-input-border-color: #dbeafe;
  --el-input-hover-border-color: #409eff;
  --el-input-focus-border-color: #409eff;
  --el-input-placeholder-color: #b0b8c9;
}
.notice-list-pc {
  
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 520px;
  min-height: 320px;  overflow-y: auto;
}
.notice-card-pc {
  width: 95%;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  background: rgba(255,255,255,0.38); /* 高透明毛玻璃 */
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10), 0 1.5px 6px 0 rgba(64, 158, 255, 0.08);
  padding: 14px 18px 12px 14px;
  position: relative;
  transition: box-shadow 0.18s, background 0.18s, border 0.18s, transform 0.18s;
  border: 1.5px solid rgba(180,200,255,0.10);
  min-height: 44px;
  font-size: 15px;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  margin-bottom: 6px;
}
.notice-card-pc:hover {
  background: rgba(255,255,255,0.55);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.16), 0 2px 12px 0 rgba(64, 158, 255, 0.13);
  transform: translateY(-2px) scale(1.01);
}
.notice-card-pc.unread {
  border-color: #409eff;
  background: linear-gradient(90deg, rgba(234,246,255,0.55) 0%, rgba(245,250,255,0.55) 100%);
}
.dark-mode .notice-card-pc {
  background: rgba(24,36,64,0.38);
  border: 1.5px solid rgba(80,120,200,0.18);
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.18), 0 1.5px 6px 0 rgba(64, 158, 255, 0.10);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}
.dark-mode .notice-card-pc.unread {
  background: linear-gradient(90deg, rgba(26,35,58,0.55) 0%, rgba(34,83,167,0.55) 100%);
  border-color: #90c4ff;
}
.notice-avatar-pc {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 8px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.06);
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-avatar-pc img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}
.notice-content-pc {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.notice-header-pc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
}
.notice-title-main-pc {
  font-size: 0.97rem;
  font-weight: 600;
  color: #1a233a;
  letter-spacing: 0.1px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dark-mode .notice-title-main-pc {
  color: #eaf6ff;
}
.notice-time-pc {
  font-size: 0.93rem;
  color: #90a4ae;
  font-weight: 400;
  margin-left: 8px;
  flex-shrink: 0;
}
.notice-desc-pc {
  font-size: 0.93rem;
  color: #4f5353;
  font-weight: 400;
  line-height: 1.4;
  word-break: break-word;
  opacity: 0.92;
}
.dark-mode .notice-desc-pc {
  color: #b0c4de;
}
.notice-unread-dot-pc {
  position: absolute;
  right: 10px;
  top: 12px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ff4e6a 0%, #e00d3a 100%);
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(224, 13, 58, 0.10);
  border: 2px solid #fff;
  z-index: 2;
  animation: unread-dot-pulse 1.2s infinite alternate;
}
@keyframes unread-dot-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.18); opacity: 0.7; }
}
.notice-empty-pc {
  margin-top: 48px;
  text-align: center;
  opacity: 0.7;
}
.notice-pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 18px 0 18px 0;
  padding: 12px 0;
  border-radius: 18px;

  width: 96%;
  margin-left: auto;
  margin-right: auto;
}
:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-border-radius: 10px;
  --el-pagination-font-size: 1.08rem;
}
.dark-mode .el-pagination {
  background:none !important; 
}

:deep(.el-pagination button) {
  background:none !important; 
  color: #244775 !important;
}

.notice-grid-section-pc {
  margin-top: 38px;
}
.notice-grid-title-pc {
  font-size: 1.13rem;
  font-weight: 700;
  color: #2253a7;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #2253a7 0%, #409eff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dark-mode .notice-grid-title-pc {
  background: linear-gradient(90deg, #eaf6ff 0%, #90c4ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.notice-grid-pc {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.notice-grid-card-pc {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255,255,255,0.98);
  border-radius: 10px;
  box-shadow: 0 1px 6px 0 rgba(64, 158, 255, 0.06);
  padding: 14px 14px 12px 14px;
  border: 1px solid rgba(180,200,255,0.10);
  min-height: 56px;
  transition: box-shadow 0.15s, background 0.15s, border 0.15s;
  cursor: pointer;
}
.notice-grid-card-pc:hover {
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.13);
  border-color: #409eff;
  background: rgba(240,250,255,0.98);
}
.dark-mode .notice-grid-card-pc {
  background: linear-gradient(120deg, rgba(24,36,64,0.92) 60%, rgba(60,80,120,0.38) 100%);
  border: 1.5px solid rgba(80,120,200,0.22);
}
.dark-mode .notice-grid-card-pc:hover {
  background: linear-gradient(90deg, #1a233a 0%, #2253a7 100%);
  border-color: #90c4ff;
}
.notice-grid-icon-pc {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notice-grid-content-pc {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.notice-grid-card-title-pc {
  font-size: 1rem;
  font-weight: 600;
  color: #1a233a;
  margin-bottom: 1px;
}
.dark-mode .notice-grid-card-title-pc {
  color: #eaf6ff;
}
.notice-grid-card-desc-pc {
  font-size: 0.97rem;
  color: #4f5353;
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.92;
}
.dark-mode .notice-grid-card-desc-pc {
  color: #b0c4de;
}
/* 独立的更多服务容器 */
.notice-grid-section-pc-standalone {
  margin: 38px auto 0 auto;
  padding:36px;
  margin-bottom: 38px;
}
.notice-grid-pc-standalone {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  background: none;
  box-shadow: none;
  border-radius: 0;
  color:rgb(116, 152, 253);
}
.notice-grid-card-pc-standalone {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(130, 148, 247, 0.32);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.08);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  padding: 14px 14px 12px 14px;
  border: 1.5px solid rgba(180,200,255,0.10);
  min-height: 56px;
  transition: box-shadow 0.15s, background 0.15s, border 0.15s, transform 0.15s;
  cursor: pointer;
}
.notice-grid-card-pc-standalone:hover {
  background: rgba(255,255,255,0.48);
  box-shadow: 0 4px 18px 0 rgba(31, 38, 135, 0.13);
  transform: translateY(-2px) scale(1.03);
}

.notice-leave-title {
  font-size: 1.13rem;
  font-weight: 700;
  color: #2253a7;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #2253a7 0%, #409eff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.notice-leave-form {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}
.notice-leave-input {
  flex: 1;
  min-width: 0;
}
.notice-leave-btn {
  height: 36px;
  font-size: 15px;
  border-radius: 8px;
}
.notice-leave-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.notice-leave-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #333;
  padding: 0;
}
.notice-leave-avatar {
  font-size: 18px;
  margin-top: 1px;
}
.notice-leave-content {
  word-break: break-all;
  flex: 1;
}
.notice-leave-empty {
  color: #aaa;
  font-size: 13px;
  padding: 8px 0;
}
.dashboard-section {
  margin: 40px auto 0 auto;
  max-width: 1300px;
  background: none;
  border-radius: 18px;
  padding: 0 0 32px 0;
}
.dashboard-cards {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}
.dashboard-card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px #0001;
  min-width: 200px;
  transition: background 0.3s;
}
.dark-mode .dashboard-card {
  background: #23263a;
  box-shadow: 0 2px 8px #0003;
}
.dashboard-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.dashboard-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dashboard-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #342e37;
  transition: color 0.3s;
}
.dark-mode .dashboard-card-title {
  color: #fff;
}
.dashboard-card-desc {
  color: #aaa;
  font-size: 1rem;
  transition: color 0.3s;
}
.dark-mode .dashboard-card-desc {
  color: #ccc;
}
.dashboard-main {
  display: flex;
  gap: 24px;
}
.dashboard-group-invites {
  flex: 1.5;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 2px 8px #0001;
  min-width: 320px;
  transition: background 0.3s;
}
.dashboard-sysmsgs {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 2px 8px #0001;
  min-width: 320px;
  transition: background 0.3s;
}
.dark-mode .dashboard-group-invites {
  background: #23263a;
  box-shadow: 0 2px 8px #0003;
}
.dark-mode .dashboard-sysmsgs {
  background: #23263a;
  box-shadow: 0 2px 8px #0003;
}
.dashboard-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #342e37;
  transition: color 0.3s;
}
.dark-mode .dashboard-section-title {
  color: #fff;
}
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}
.dashboard-table th, .dashboard-table td {
  padding: 12px 0;
  text-align: left;
}
.dashboard-table th {
  color: #aaa;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  transition: color 0.3s, border-color 0.3s;
}
.dark-mode .dashboard-table th {
  color: #bbb;
  border-bottom: 1px solid #333;
}
.dashboard-table td {
  color: rgb(14, 14, 14);
}
.dark-mode .dashboard-table td {
  color: #fff;
}
.dashboard-table td img.dashboard-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}
.dashboard-status {
  display: inline-block;
  padding: 6px 18px;
  border-radius: 16px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
}
.dashboard-status.accepted {
  background: #3c91e6;
}
.dashboard-status.pending { 
  background: #ff7626;
}
.dashboard-status.declined {
  background: #f50909;
  color: #f4f4f5;
}

.dashboard-todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dashboard-todo-list li {
  display: flex;
  align-items: center;
  background: #f4f6fa;
  border-radius: 10px;
  padding: 12px 0;
  font-size: 1rem;
  gap: 12px;
  position: relative;
  transition: background 0.3s;
  font-weight: 600;
}
.dark-mode .dashboard-todo-list li {
  background: #181a20;
}



.dashboard-section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.dashboard-section-icons {
  display: flex;
  align-items: center;
  gap: 18px;
}
.dashboard-section-icons .dashboard-icon {
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  transition: filter 0.2s;
  color: #222;
}
.dark-mode .dashboard-section-icons .dashboard-icon {
  color: #fff;
}
.dashboard-section-icons .dashboard-icon:hover {
  filter: brightness(0.7);
}


.sysmsg-icon {
  vertical-align: middle;
}

/* 响应式布局 */
@media (max-width: 1100px) {
  .dashboard-cards {
    flex-direction: column;
    gap: 18px;
  }
  .dashboard-main {
    flex-direction: column;
    gap: 18px;
  }
  .dashboard-group-invites, .dashboard-sysmsgs {
    min-width: 0;
    width: 100%;
    margin-bottom: 18px;
  }
}
@media (max-width: 900px) {
  .notice-center-glass-pc {
    padding: 18px 8px 18px 8px;
  }
  .dashboard-section {
    padding: 0 0 18px 0;
  }
  .dashboard-cards {
    gap: 12px;
  }
  .dashboard-group-invites, .dashboard-sysmsgs {
    padding: 12px;
  }
  .notice-grid-section-pc-standalone {
    padding: 12px;
  }
  .notice-grid-pc-standalone {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
@media (max-width: 600px) {
  .dashboard-cards {
    flex-direction: column;
    gap: 10px;
  }
  .dashboard-main {
    flex-direction: column;
    gap: 10px;
  }
  .dashboard-group-invites, .dashboard-sysmsgs {
    padding: 8px;
    min-width: 0;
    width: 100%;
  }
  .dashboard-section {
    padding: 0 0 8px 0;
  }
  .notice-grid-section-pc-standalone {
    padding: 4px;
  }
  .notice-grid-pc-standalone {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* 仪表盘卡片 hover 效果 */
.dashboard-card {
  cursor: pointer;
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
}
.dashboard-card:hover {
  background: #f4f8ff;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
  transform: translateY(-2px) scale(1.03);
}
.dark-mode .dashboard-card:hover {
  background: #2a2e4a;
}

/* 群聊邀请表格行 hover 效果 */
.dashboard-table tbody tr {
  transition: background 0.18s;
  cursor: pointer;
}
.dashboard-table tbody tr:hover {
  background: #f4f8ff;
}
.dark-mode .dashboard-table tbody tr:hover {
  background: #23263a;
}

/* 系统消息 hover 效果 */
.dashboard-todo-list li {
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
}
.dashboard-todo-list li:hover {
  background: #eaf2ff;
  box-shadow: 0 2px 8px 0 #409eff22;
  transform: translateY(-1px) scale(1.01);
}
.dark-mode .dashboard-todo-list li:hover {
  background: #23263a;
}

/* 更多服务卡片 hover 效果 */
.notice-grid-card-pc-standalone {
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
  cursor: pointer;
}
.notice-grid-card-pc-standalone:hover {
  background: #f4f8ff;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
  transform: translateY(-2px) scale(1.03);
}
.dark-mode .notice-grid-card-pc-standalone:hover {
  background: #23263a;
}

</style>




