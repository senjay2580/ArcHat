<template>
  <div class="warning" :style="warningStyle">
    <div class="warning__icon">
      <!-- 支持传 SVG 字符串或组件 -->
      <component v-if="isComponent" :is="icon" />
      <span v-else v-html="icon"></span>
    </div>
    <div class="warning__title">{{ title }}</div>
    <div class="warning__close" @click="$emit('close')">
      <!-- 右上角关闭icon -->
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="#393A37" stroke-width="2" stroke-linecap="round"/></svg>
    </div>
    <div class="warning__footer" v-if="showDangerButton">
      <danger-button
        class="danger-btn"
        v-bind="dangerButtonProps"
        @click="$emit('danger')"
      >{{ dangerButtonText }}</danger-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import dangerButton from '@/components/form/DangerButton.vue';

const props = defineProps({
  icon: { type: [String, Object], required: true }, // SVG 字符串或组件
  title: { type: String, required: true },
  showDangerButton: { type: Boolean, default: false },
  dangerButtonText: { type: String, default: '操作' },
  dangerButtonProps: { type: Object, default: () => ({}) },
  background: { type: String, default: '#F7C752' } // 支持颜色、渐变、图片url
});

const isComponent = computed(() => typeof props.icon === 'object');

const warningStyle = computed(() => {
  const style = {};
  if (props.background) {
    style.background = props.background;
  }
  return style;
});
</script>

<style scoped>
.warning {
  position: relative;
  width: 320px;
  padding: 16px 16px 16px 12px;
  display: flex;
  flex-direction: column;
  background: #F7C752;
  border-radius: 8px;
  box-shadow: 0px 0px 5px -3px #111;
}
.warning__icon {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 24px;
  height: 24px;
}
.warning__title {
  margin-left: 40px;
  font-weight: 500;
  font-size: 15px;
  color: #393A37;
  line-height: 24px;
}
.warning__close {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.warning__footer {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}
.danger-btn {
  min-width: 80px;
}
</style>

