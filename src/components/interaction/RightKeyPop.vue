<template>
<div class="card" :style="computedStyle" :class="{ 'is-calculating': calculatingPosition }" @mouseleave="handleMenuMouseLeave">
  <ul class="list">
    <template v-for="(item, idx) in items" :key="item.key || idx">
            <li 
        :class="['element', item.class, { danger: item.danger, 'has-submenu': item.children && item.children.length > 0 }]" 
        :style="item.style || ''"
        @mouseenter="handleItemMouseEnter(item)"
      >
        <label :for="item.key || 'item'+idx" @click="handleClick(item, $event)">
          <!-- 移除radio点 -->
                    <span v-if="item.icon" class="menu-icon">
            <component v-if="typeof item.icon !== 'string'" :is="item.icon" :size="16" />
            <span v-else v-html="item.icon"></span>
          </span>
          <span class="label-text">{{ item.label }}</span>
                    <span v-if="item.children && item.children.length > 0" class="submenu-arrow"></span>
        </label>
        <RightKeyPop 
          v-if="item.children && item.children.length > 0 && activeSubMenu === item.key"
          :items="item.children"
          :position="'absolute'"
          :left="'100%'"
          :top="0"
          :z-index="zIndex + 1"
          @close="emit('close')"
        />
      </li>
      <div v-if="item.separatorAfter" class="separator"></div>
    </template>
  </ul>
</div>

</template>
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  left: { type: [Number, String], default: null },
  top: { type: [Number, String], default: null },
  position: { type: String, default: 'fixed' },
  zIndex: { type: [Number, String], default: 99999 },
  calculatingPosition: { type: Boolean, default: false },
  items: {
    type: Array,
    default: () => [] // [{key, label, icon, children, class, style, onClick, separatorAfter}]
  }
});

const emit = defineEmits(['close']);

const activeSubMenu = ref(null);

const computedStyle = computed(() => {
  const style = {
    position: props.position,
    zIndex: props.zIndex
  };
  if (props.left !== null) style.left = typeof props.left === 'number' ? `${props.left}px` : props.left;
  if (props.top !== null) style.top = typeof props.top === 'number' ? `${props.top}px` : props.top;
  return style;
});

const handleItemMouseEnter = (item) => {
  if (item.children && item.children.length > 0) {
    activeSubMenu.value = item.key;
  } else {
    // 从非子菜单项移开时，关闭任何打开的子菜单
    activeSubMenu.value = null;
  }
};

const handleMenuMouseLeave = () => {
  activeSubMenu.value = null;
};

const handleClick = (item, e) => {
  // 如果有子菜单，则点击不执行任何操作，也不关闭菜单
  if (item.children && item.children.length > 0) {
    return;
  }
  
  if (typeof item.onClick === 'function') {
    item.onClick(e);
  }
  emit('close');
};

</script>
<style>
/* ===================================
   右键菜单组件样式 - 日夜主题适配
   =================================== */

/* 基础卡片样式 */
.card.is-calculating {
  opacity: 0;
  transition: none !important;
}

.card {

  width: 200px;
  padding: 15px;
  user-select: none;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);

  /* 明亮主题样式 */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  color: #1f2937;
}

/* 暗黑主题样式 */
.dark-mode .card {
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
  
}

/* ===================================
   分隔线样式
   =================================== */

.card .separator {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 4px 0;
}

.dark-mode .card .separator {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}

/* ===================================
   列表容器样式
   =================================== */

.card .list {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0;
  margin: 0;
  
}

/* ===================================
   菜单项基础样式
   =================================== */

.card .list .element > label {
  display: flex;
  align-items: center;
  

  gap: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  background: none;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}


/* ===================================
   悬停和激活状态 - 明亮主题
   =================================== */

.card .list .element label:hover {
  color: #ffffff;
  transform: translateY(-1px);
  padding: 5px;
}

.card .list .element label:active {
  transform: translateY(0) scale(0.98);
}

/* ===================================
   悬停和激活状态 - 暗黑主题
   =================================== */

.dark-mode .card .list .element label:hover {
  color: #ffffff;
  transform: translateY(-1px);
}

.dark-mode .card .list .element label:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
}

/* ===================================
   图标颜色适配
   =================================== */

.card .list .element label:hover svg,
.card .list .element label:active svg {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.dark-mode .card .list .element label:hover svg,
.dark-mode .card .list .element label:active svg {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

/* ===================================
   危险操作样式 - 明亮主题
   =================================== */
.card .list .element.danger label {
  padding: 5px;
  margin-top: 10px;

  background-color: rgba(239, 68, 68, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.card .list .element.danger label:hover {
  color: #ffffff;
  transform: translateY(-1px);
}

.card .list .element.danger label:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
}

/* ===================================
   危险操作样式 - 暗黑主题
   =================================== */

.dark-mode .card .list .element.danger label {
  padding: 5px;
  
  background-color: rgba(73, 13, 13, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-top: 10px;
}
.dark-mode .card .list .element.danger label:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(248, 113, 113, 0.3);
}



/* ===================================
   图标容器样式
   =================================== */

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  transition: all 0.2s ease;
}

.menu-icon svg {
  transition: all 0.2s ease;
}

/* 明亮主题图标颜色 */
.card .list .element > label .menu-icon svg {
  color: #0a5ef0;
}

/* 暗黑主题图标颜色 */
.dark-mode .card .list .element > label .menu-icon svg {
  color: #5edaff;
}

/* 悬停时图标缩放效果 */
.card .list .element label:hover .menu-icon {
  transform: scale(1.1);
}

/* 激活时图标效果 */
.card .list .element label:active .menu-icon {
  transform: scale(1.05);
}

/* ===================================
   元素布局样式
   =================================== */

.element {
  position: relative;
}

.element label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 36px;
}

.label-text {
  flex-grow: 1;
  font-size: 14px;
  line-height: 1.4;
}

/* ===================================
   子菜单样式
   =================================== */

.submenu-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 5px;
  border-color: transparent transparent transparent currentColor;
  margin-left: 8px;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.has-submenu > .submenu-container {
  position: absolute;
  left: calc(100% + 4px);
  top: -8px;
  display: none;
  z-index: 1000;
}

.has-submenu:hover > .submenu-container {
  display: block;
}

.has-submenu:hover .submenu-arrow {
  opacity: 1;
  transform: translateX(2px);
}

/* ===================================
   滚动条样式
   =================================== */

.card::-webkit-scrollbar {
  width: 4px;
}

.card::-webkit-scrollbar-track {
  background: transparent;
}

.card::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dark-mode .card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

/* ===================================
   响应式设计
   =================================== */

@media (max-width: 768px) {
  .card {
    width: 180px;
    padding: 6px;
  }
  
  .card .list .element > label {
    padding: 6px 8px;
    font-size: 13px;
  }
  
  .menu-icon {
    width: 18px;
    height: 18px;
  }
}

</style>

