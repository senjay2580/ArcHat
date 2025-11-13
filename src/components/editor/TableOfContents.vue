<template>
  <div 
    class="toc-container" 
    :class="{ 'collapsed': isCollapsed, 'expanded': !isCollapsed }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 折叠/展开按钮 -->
    <div class="toc-toggle" @click="toggleCollapse">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24"
        :class="{ 'rotated': !isCollapsed }"
      >
        <path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6l-1.41-1.41z"/>
      </svg>
    </div>

    <!-- 目录内容 -->
    <div class="toc-content" v-show="!isCollapsed">
      <div class="toc-header">
        <h3>目录</h3>
        <div class="toc-actions">
          <button @click="refreshToc" title="刷新目录" class="toc-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6c0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6c0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4l-4-4v3z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="toc-list" v-if="headings.length > 0">
        <div 
          v-for="heading in headings" 
          :key="heading.id"
          :class="['toc-item', `toc-level-${heading.level}`, { 'active': activeHeading === heading.id }]"
          @click="scrollToHeading(heading.id)"
        >
          <span class="toc-bullet">•</span>
          <span class="toc-text">{{ heading.text }}</span>
        </div>
      </div>
      
      <div class="toc-empty" v-else>
        <p>暂无标题</p>
        <small>使用 H1-H6 标题来生成目录</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  editor: Object,
  autoCollapse: {
    type: Boolean,
    default: true
  },
  positioning: {
    type: String,
    default: 'fixed', // 'fixed' | 'absolute'
    validator: (value) => ['fixed', 'absolute'].includes(value)
  }
});

const isCollapsed = ref(false);
const headings = ref([]);
const activeHeading = ref(null);
const isHovering = ref(false);
const autoCollapseTimeout = ref(null);

// 提取标题
const extractHeadings = () => {
  if (!props.editor) return;
  
  const newHeadings = [];
  let headingCounter = 0;
  
  props.editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const id = `heading-${++headingCounter}`;
      const text = node.textContent;
      const level = node.attrs.level;
      
      newHeadings.push({
        id,
        text,
        level,
        pos
      });
      
      // 为标题添加ID属性（如果还没有）
      if (!node.attrs.id) {
        props.editor.commands.updateAttributes('heading', { id });
      }
    }
  });
  
  headings.value = newHeadings;
};

// 刷新目录
const refreshToc = () => {
  extractHeadings();
};

// 滚动到指定标题
const scrollToHeading = (headingId) => {
  const element = document.getElementById(headingId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest'
    });
    activeHeading.value = headingId;
  } else {
    // 如果没有找到元素，尝试通过编辑器定位
    const heading = headings.value.find(h => h.id === headingId);
    if (heading && props.editor) {
      // 设置光标位置到该标题
      props.editor.commands.setTextSelection(heading.pos);
      props.editor.commands.scrollIntoView();
      activeHeading.value = headingId;
    }
  }
};

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  clearAutoCollapseTimeout();
};

// 鼠标进入 - 取消自动展开
const handleMouseEnter = () => {
  isHovering.value = true;
  clearAutoCollapseTimeout();
  // 移除自动展开功能，只能手动点击展开
  // if (props.autoCollapse && isCollapsed.value) {
  //   isCollapsed.value = false;
  // }
};

// 鼠标离开 - 取消自动收缩
const handleMouseLeave = () => {
  isHovering.value = false;
  // 移除自动折叠功能
  // if (props.autoCollapse) {
  //   autoCollapseTimeout.value = setTimeout(() => {
  //     if (!isHovering.value) {
  //       isCollapsed.value = true;
  //     }
  //   }, 2000); // 2秒后自动折叠
  // }
};

// 清除自动折叠定时器
const clearAutoCollapseTimeout = () => {
  if (autoCollapseTimeout.value) {
    clearTimeout(autoCollapseTimeout.value);
    autoCollapseTimeout.value = null;
  }
};

// 监听编辑器内容变化
const setupEditorListener = () => {
  if (!props.editor) return;
  
  props.editor.on('update', () => {
    nextTick(() => {
      extractHeadings();
    });
  });
};

// 监听滚动事件，高亮当前标题
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let currentHeading = null;
  
  for (let i = headings.value.length - 1; i >= 0; i--) {
    const heading = headings.value[i];
    const element = document.getElementById(heading.id);
    if (element && element.offsetTop <= scrollTop + 100) {
      currentHeading = heading.id;
      break;
    }
  }
  
  activeHeading.value = currentHeading;
};

onMounted(() => {
  nextTick(() => {
    setupEditorListener();
    extractHeadings();
  });
  
  window.addEventListener('scroll', handleScroll);
  
  // 默认为折叠状态
  isCollapsed.value = true;
});

onUnmounted(() => {
  clearAutoCollapseTimeout();
  window.removeEventListener('scroll', handleScroll);
});

// 暴露方法
defineExpose({
  refreshToc,
  extractHeadings,
  scrollToHeading
});
</script>

<style scoped>
.toc-container {
  position: absolute;
  top: 60px; /* 避开工具栏 */
  right: 10px;
  z-index: 1000;
  max-width: 280px; /* 稍微减小宽度 */
  min-width: 40px;
  max-height: calc(100% - 80px); /* 限制高度，避免超出容器 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.toc-container.collapsed {
  width: 40px;
  background: rgba(255, 255, 255, 0.7);
  top: 120px; /* 缩小状态时往下移动 */
}

.toc-container.expanded {
  width: 260px; /* 调整展开宽度 */
  top: 60px; /* 展开状态时回到原位置 */
}

.toc-container:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.toc-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  position: relative;
}

.toc-toggle:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.toc-toggle svg {
  transition: transform 0.3s ease;
}

.toc-toggle svg.rotated {
  transform: rotate(90deg);
}

.toc-content {
  flex: 1;
  padding: 0 16px 16px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* 允许flex子元素收缩 */
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.toc-header h3 {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

.toc-actions {
  display: flex;
  gap: 4px;
}

.toc-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.toc-action-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0; /* 确保flex子元素可以收缩 */
}

.toc-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.toc-item:hover {
  background: rgba(0, 122, 255, 0.08);
  transform: translateX(2px);
}

.toc-item:hover .toc-bullet {
  opacity: 1;
  color: #007aff;
}

.toc-item.active {
  background: rgba(0, 122, 255, 0.12);
  color: #007aff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 122, 255, 0.1);
}

.toc-item.active .toc-bullet {
  color: #007aff;
  opacity: 1;
  transform: scale(1.1);
}

.toc-bullet {
  margin-right: 10px;
  color: #007aff;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.toc-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 不同级别标题的Apple风格样式 */
.toc-level-1 {
  padding-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

.toc-level-2 {
  padding-left: 24px;
  font-size: 15px;
  font-weight: 500;
  color: #424245;
  letter-spacing: -0.015em;
}

.toc-level-3 {
  padding-left: 36px;
  font-size: 14px;
  font-weight: 450;
  color: #6e6e73;
  letter-spacing: -0.01em;
}

.toc-level-4 {
  padding-left: 48px;
  font-size: 13px;
  font-weight: 400;
  color: #86868b;
  letter-spacing: -0.005em;
}

.toc-level-5,
.toc-level-6 {
  padding-left: 60px;
  font-size: 12px;
  font-weight: 400;
  color: #a1a1a6;
  letter-spacing: 0;
}

.toc-empty {
  text-align: center;
  padding: 20px 0;
  color: #9ca3af;
}

.toc-empty p {
  margin: 0 0 4px 0;
  font-size: 13px;
}

.toc-empty small {
  font-size: 11px;
  opacity: 0.8;
}

/* Apple风格滚动条 */
.toc-content::-webkit-scrollbar {
  width: 6px;
}

.toc-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.toc-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.toc-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.toc-content::-webkit-scrollbar-thumb:active {
  background: rgba(0, 0, 0, 0.35);
}

/* 暗色模式支持 */
.dark-mode .toc-container {
  background: rgba(31, 41, 55, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .toc-container:hover {
  background: rgba(31, 41, 55, 0.95);
}

.dark-mode .toc-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .toc-header h3 {
  color: #f5f5f7;
  font-weight: 700;
}

/* 暗色模式下的标题层次 */
.dark-mode .toc-level-1 {
  color: #f5f5f7;
}

.dark-mode .toc-level-2 {
  color: #d1d1d6;
}

.dark-mode .toc-level-3 {
  color: #98989d;
}

.dark-mode .toc-level-4 {
  color: #8e8e93;
}

.dark-mode .toc-level-5,
.dark-mode .toc-level-6 {
  color: #636366;
}

.dark-mode .toc-item:hover {
  background: rgba(0, 122, 255, 0.15);
}

.dark-mode .toc-item.active {
  background: rgba(0, 122, 255, 0.2);
  color: #0a84ff;
}

.dark-mode .toc-bullet {
  color: #0a84ff;
}

.dark-mode .toc-item.active .toc-bullet {
  color: #0a84ff;
}

/* 暗色模式滚动条 */
.dark-mode .toc-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.dark-mode .toc-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.dark-mode .toc-content::-webkit-scrollbar-thumb:active {
  background: rgba(255, 255, 255, 0.35);
}

.dark-mode .toc-toggle {
  color: #9ca3af;
}

.dark-mode .toc-toggle:hover {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.dark-mode .toc-action-btn {
  color: #9ca3af;
}

.dark-mode .toc-action-btn:hover {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
}

.dark-mode .toc-item:hover {
  background: rgba(96, 165, 250, 0.1);
}

.dark-mode .toc-item.active {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.dark-mode .toc-level-3 {
  color: #9ca3af;
}

.dark-mode .toc-level-4,
.dark-mode .toc-level-5,
.dark-mode .toc-level-6 {
  color: #6b7280;
}

.dark-mode .toc-empty {
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toc-container {
    right: 10px;
    max-width: 250px;
  }
  
  .toc-container.expanded {
    width: 240px;
  }
}

@media (max-width: 480px) {
  .toc-container {
    right: 5px;
    max-width: 200px;
  }
  
  .toc-container.expanded {
    width: 200px;
  }
}
</style>
