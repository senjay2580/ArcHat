<template>
  <transition name="dropdown-fade">
    <div v-if="visible" class="dropdown-container" @click.stop 
         :style="{ left: position.x + 'px', top: position.y + 'px' }">
      <div class="dropdown-content" :class="{ 'dark-mode': isDarkMode }">
        <!-- 动态分组 -->
        <div v-for="(section, index) in sections" :key="section.title" class="section">
          <div class="section-header" @click="toggleSection(index)">
            <ChevronRight 
              :class="['section-icon', { 'expanded': sectionsExpanded[index] }]" 
              :size="14" 
            />
            <span class="section-title">{{ section.title }}</span>
          </div>
          <div v-show="sectionsExpanded[index]" class="grid-container">
            <div v-for="item in section.items" :key="item.name" class="grid-item" @click="item.action()">
              <div class="item-icon">
                <component :is="iconMap[item.icon]" />
              </div>
              <span class="item-label">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Grid3X3, 
  MousePointer2, 
  CheckSquare, 
  ToggleLeft, 
  CreditCard, 
  Loader2, 
  Type, 
  Circle,
  ChevronRight,
  User,
  Users,
  Plus,
  Video,
  FileText,
  Workflow,
  Bot,
  Database,
  UserCog
} from 'lucide-vue-next'

// Icon mapping
const iconMap = {
  Grid3X3,
  MousePointer2,
  CheckSquare,
  ToggleLeft,
  CreditCard,
  Loader2,
  Type,
  Circle,
  User,
  Users,
  Plus,
  Video,
  FileText,
  Workflow,
  Bot,
  Database,
  UserCog
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  isDarkMode: { type: Boolean, default: false },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  sections: {
    type: Array,
    default: () => [
    
    ]
  }
})

const emit = defineEmits(['close'])

// 控制分组展开/收缩状态 - 基于索引
const sectionsExpanded = ref({})

// 初始化展开状态
const initializeSections = () => {
  props.sections.forEach((section, index) => {
    // 默认"更多功能"栏折叠，其他展开
    sectionsExpanded.value[index] = section.title !== '更多功能'
  })
}

// 切换分组展开状态
const toggleSection = (index) => {
  sectionsExpanded.value[index] = !sectionsExpanded.value[index]
}

// 组件挂载时初始化
initializeSections()

const closeDropdown = () => {
  emit('close')
}
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-container {
  position: fixed;
  z-index: 10000;
  /* 位置通过内联样式动态设置 */
}

.dropdown-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 360px;
  max-width: 420px;
  transform-origin: top right;
}

.dropdown-content.dark-mode {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.section-header:hover {
  opacity: 0.8;
}

.section-icon {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  transition: transform 0.2s ease;
  color: #666;
  transform: rotate(0deg);
}

.section-icon.expanded {
  transform: rotate(90deg);
}

.dark-mode .section-icon {
  color: #999;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.dark-mode .section-title {
  color: #ccc;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 8px 0;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  text-align: center;
}

.grid-item:hover {
  background: rgba(48, 83, 238, 0.1);
}

.dark-mode .grid-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: #666;
  flex-shrink: 0;
}

.dark-mode .item-icon {
  color: #999;
}

.item-label {
  font-size: 12px;
  color: #333;
  font-weight: 400;
  line-height: 1.2;
}

.dark-mode .item-label {
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .dropdown-content {
    min-width: 320px;
    margin: 0 10px;
  }
  
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


