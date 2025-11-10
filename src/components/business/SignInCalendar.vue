<template>
  <div class="sign-calendar-root">
    <!-- 签到统计信息 -->
    <div class="sign-stats" v-if="!loading">
      <div class="stat-item">
        <span class="stat-label">连续签到</span>
        <span class="stat-value">{{ consecutiveDays }}天</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">本月签到</span>
        <span class="stat-value">{{ totalDays }}天</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">今日状态</span>
           <!-- 签到按钮 -->
    <div class="sign-btn-row" v-if="!loading">
      <DangerButton
      style="margin-top: 1px;"
        :type="isTodaySignedIn ? 'success' : 'danger'"
        :disabled="isTodaySignedIn"
        @click="handleSignInBtn"
      >
        {{ isTodaySignedIn ? '已签到' : '签到' }}
      </DangerButton>
    </div>
      </div>
    </div>
    

    
    <!-- 加载状态 -->
    <div class="sign-loading" v-if="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载签到数据中...</span>
    </div>
    
    <div class="calendar-center">
      <VCalendar
        :attributes="calendarAttributes"
        is-expanded
        :locale="'zh-CN'"
        class="calendar-responsive"
      />
    </div>
   
  </div>
</template>

<script setup>
import { computed, ref  } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'
import DangerButton from '@/components/form/DangerButton.vue'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  signedDates: {
    type: Array,
    default: () => []
  },
  isTodaySignedIn: {
    type: Boolean,
    default: false
  },
  consecutiveDays: {
    type: Number,
    default: 0
  },
  totalDays: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue', 'sign'])

const today = new Date();
function formatDateYMD(date) {
  // 保证 yyyy-MM-dd 格式，且不受时区影响
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
const todayStr = formatDateYMD(today);

const calendarAttributes = computed(() => {
  // 已签到日期（包括今天已签到）
  const signedDates = props.signedDates || []
  // 今天是否已签到
  const isTodaySigned = props.isTodaySignedIn

  // 1. 已签到天数（含今天已签到）绿色
  const signed = signedDates
  // 2. 今天且未签到，单独蓝色
  const todayUnsigned = !isTodaySigned ? [todayStr] : []
  // 3. 其他未签到（不含今天）红色
  const unsigned = getUnsignedDates().filter(d => d !== todayStr)

  return [
    {
      key: 'signed',
      dates: signed,
      highlight: { color: '#1AAD19', fillMode: 'solid', contentClass: 'signed-highlight' },
      popover: { label: '已签到' }
    },
  {
    key: 'today',
      dates: todayUnsigned,
    highlight: {
      color: '#409EFF',
      fillMode: 'solid',
      contentClass: 'today-highlight',
    },
    popover: { label: '今天' }
  },
  {
      key: 'unsigned',
      dates: unsigned,
      highlight: { color: '#B71A1A', fillMode: 'solid', contentClass: 'unsigned-highlight' },
      popover: { label: '未签到' }
  }
  ]
})

function getUnsignedDates() {
  // 只高亮本月未签到的天数
  const days = [];
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (!props.signedDates.includes(dateStr) && dateStr <= todayStr) {
      days.push(dateStr);
    }
  }
  return days;
}


function handleSignInBtn() {
  if (!props.isTodaySignedIn) {
    emit('sign', new Date())
}
}

</script>

<style scoped>
.sign-calendar-root {
  height: 430px;
  margin: 0 auto;
  padding: 0 0 18px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: transparent;
  box-shadow: none;
  position: relative;
  justify-content: center;
  overflow: hidden;
  gap: 35px;
}


:deep(.dark-mode) .sign-header {
  color: #6CA6FF;
}
.calendar-center {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

:deep(.calendar-responsive ){
  width: 100%;
  height: 100%;
  background-color: transparent;
  border: 0;
  
}
:deep(.vc-pane) {
  border-radius: 18px;
  background: transparent;
  box-shadow: none;
  width: 100% !important;
  min-width: 0;
  min-height: 0;
}
:deep(.vc-weeks),
:deep(.vc-week),
:deep(.vc-days),
:deep(.vc-day) {
  width: 100% !important;
  min-width: 0;
}
:deep(.vc-day-content) {
  font-size: 18px;
  font-weight: 500;
  width: 38px;
  height: 38px;
  line-height: 38px;
  margin: 0 auto;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.today-highlight) {
  background: #409EFF !important;
  color: #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 8px rgba(64,158,255,0.18);
  font-weight: bold;
}
:deep(.vc-highlight-content) {
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1.5px 8px rgba(64,158,255,0.18);
}
.sign-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;

}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-value.signed {
  color: #58e412;
}

:deep(.dark-mode) .sign-stats {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.dark-mode) .stat-value {
  color: #ffffff;
}

:deep(.dark-mode) .stat-value.signed {
  color: #67C23A;
}

.sign-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.sign-loading .el-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.sign-loading span {
  font-size: 14px;
}

:deep(.dark-mode) .sign-loading {
  color: #a0a0a0;
}

.sign-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 0;
}


:deep(.signed-highlight) {
  background: #1AAD19 !important;
  color: #fff !important;
  border-radius: 50% !important;
  font-weight: bold;
}
:deep(.unsigned-highlight) {
  background: #B71A1A !important;
  color: #fff !important;
  border-radius: 50% !important;
  font-weight: bold;
}

.sign-btn-row {
  display: flex;
  justify-content: center;
}
</style> 

