<template>
  <div class="arc-tooltip-wrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip" ref="wrapperRef">
    <slot></slot>

      <Transition name="arc-tooltip-fade">
        <div
          v-if="visible"
          ref="tooltipRef"
          :class="[
            'arc-tooltip',
            `arc-tooltip--${actualPlacement}`,
            `arc-tooltip--${effect}`
          ]"
          :style="tooltipStyle"
          role="tooltip"
        >
          <div class="arc-tooltip__content">
            <div class="arc-tooltip__indicator"></div>
            <div class="arc-tooltip__text">{{ content }}</div>
          </div>
          <div :class="`arc-tooltip__arrow arc-tooltip__arrow--${actualPlacement}`"></div>
        </div>
      </Transition>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  effect: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showDelay: {
    type: Number,
    default: 0
  },
  hideDelay: {
    type: Number,
    default: 200
  }
})

const visible = ref(false)
const tooltipRef = ref(null)
const wrapperRef = ref(null)
const tooltipStyle = ref({})
const actualPlacement = ref(props.placement) // 实际使用的位置（可能与props.placement不同）

let showTimer = null
let hideTimer = null

const showTooltip = () => {
  if (props.disabled) return
  
  clearTimeout(hideTimer)
  showTimer = setTimeout(() => {
    visible.value = true
    nextTick(() => {
      updatePosition()
    })
  }, props.showDelay)
}

const hideTooltip = () => {
  clearTimeout(showTimer)
  hideTimer = setTimeout(() => {
    visible.value = false
  }, props.hideDelay)
}

const updatePosition = () => {
  if (!tooltipRef.value || !wrapperRef.value) return

  const wrapper = wrapperRef.value
  const tooltip = tooltipRef.value
  const wrapperRect = wrapper.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  
  const padding = 8
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 为每个编辑器实例生成唯一标识
  const editorId = wrapper.closest('.flash-editor-container')?.dataset?.editorId || 
                   wrapper.closest('[data-editor-id]')?.dataset?.editorId ||
                   'default'
  
  // 智能定位逻辑：检查空间并自动翻转位置
  let finalPlacement = props.placement
  let top = 0
  let left = 0
  
  // 计算各个方向的可用空间
  const spaceTop = wrapperRect.top
  const spaceBottom = viewportHeight - wrapperRect.bottom
  const spaceLeft = wrapperRect.left
  const spaceRight = viewportWidth - wrapperRect.right
  
  // 根据原始位置和可用空间决定最终位置
  switch (props.placement) {
    case 'top':
      if (spaceTop < tooltipRect.height + padding && spaceBottom > tooltipRect.height + padding) {
        // 上方空间不足，翻转到下方
        finalPlacement = 'bottom'
        top = wrapperRect.bottom + 8
      } else {
        // 保持在上方
        top = wrapperRect.top - tooltipRect.height - 8
      }
      left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2
      break
      
    case 'bottom':
      if (spaceBottom < tooltipRect.height + padding && spaceTop > tooltipRect.height + padding) {
        // 下方空间不足，翻转到上方
        finalPlacement = 'top'
        top = wrapperRect.top - tooltipRect.height - 8
      } else {
        // 保持在下方
        top = wrapperRect.bottom + 8
      }
      left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2
      break
      
    case 'left':
      if (spaceLeft < tooltipRect.width + padding && spaceRight > tooltipRect.width + padding) {
        // 左侧空间不足，翻转到右侧
        finalPlacement = 'right'
        left = wrapperRect.right + 8
      } else {
        // 保持在左侧
        left = wrapperRect.left - tooltipRect.width - 8
      }
      top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2
      break
      
    case 'right':
      if (spaceRight < tooltipRect.width + padding && spaceLeft > tooltipRect.width + padding) {
        // 右侧空间不足，翻转到左侧
        finalPlacement = 'left'
        left = wrapperRect.left - tooltipRect.width - 8
      } else {
        // 保持在右侧
        left = wrapperRect.right + 8
      }
      top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2
      break
  }
  
  // 更新实际使用的位置
  actualPlacement.value = finalPlacement
  
  // 最终边界检查和微调
  if (left < padding) left = padding
  if (left + tooltipRect.width > viewportWidth - padding) {
    left = viewportWidth - tooltipRect.width - padding
  }
  if (top < padding) top = padding
  if (top + tooltipRect.height > viewportHeight - padding) {
    top = viewportHeight - tooltipRect.height - padding
  }

  tooltipStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 99999,
    // 添加编辑器标识以避免混淆
    '--editor-id': editorId
  }
}



onUnmounted(() => {
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
})
</script>

<style scoped>
.arc-tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.arc-tooltip {
  position: fixed;
  z-index: 99999;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  letter-spacing: 0.2px;
  pointer-events: none;
}

.arc-tooltip__content {
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
}

/* ================================ */
/* 默认日间模式样式 (Light Mode)    */
/* ================================ */

/* 日间模式 - 内容区域 */
.arc-tooltip__content {
  background: #fef3c7;
  color: #921520;
  border-color: #fef3c7;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* 日间模式 - 绿色指示点 */
.arc-tooltip__indicator {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.3);
}

.arc-tooltip__indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.arc-tooltip__indicator::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: 50%;
  background: inherit;
  filter: blur(1px);
  opacity: 0.6;
  z-index: -1;
}

.arc-tooltip__text {
  white-space: nowrap;
  font-weight: 500;
}

.arc-tooltip__arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.arc-tooltip__arrow--top {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
}

/* 日间模式 - 箭头样式 */
.arc-tooltip__arrow--top {
  border-color: rgba(255, 255, 255, 0.95) transparent transparent transparent;
}

.arc-tooltip__arrow--bottom {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
}

.arc-tooltip__arrow--bottom {
  border-color: transparent transparent rgba(255, 255, 255, 0.95) transparent;
}

.arc-tooltip__arrow--left {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
}

.arc-tooltip__arrow--left {
  border-color: transparent transparent transparent rgba(255, 255, 255, 0.95);
}

.arc-tooltip__arrow--right {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
}

.arc-tooltip__arrow--right {
  border-color: transparent rgba(255, 255, 255, 0.95) transparent transparent;
}

/* Transitions */
.arc-tooltip-fade-enter-active,
.arc-tooltip-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.arc-tooltip-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}

.arc-tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}

/* ================================ */
/* 夜间模式样式 (.dark-mode)       */
/* ================================ */

/* 夜间模式 - 内容区域 */
.dark-mode .arc-tooltip__content {
  background: #183021; /* 墨绿色黑客风背景 */
  color: #5edaff !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

/* 夜间模式 - 绿色指示点 */
.dark-mode .arc-tooltip__indicator {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.4) !important;
}

/* 夜间模式 - 箭头样式 */
.dark-mode .arc-tooltip__arrow--top {
  border-color: #183021 transparent transparent transparent !important;
}

.dark-mode .arc-tooltip__arrow--bottom {
  border-color: transparent transparent #183021 transparent !important;
}

.dark-mode .arc-tooltip__arrow--left {
  border-color: transparent transparent transparent #183021 !important;
}

.dark-mode .arc-tooltip__arrow--right {
  border-color: transparent #183021 transparent transparent !important;
}
</style>


