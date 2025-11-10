<template>
  <div class="todo-list-root" @click.self="clearSelection">
    <div class="todo-category-tabs"
      :class="{ dragging: isDraggingTodo }"
    >
      <div
        v-for="cat in categories"
        :key="cat.value"
        :class="[
          'todo-category-dot-tab',
          { active: currentCategory === cat.value },
          { dragging: isDraggingTodo },
          { 'dragover': draggingOverCategory === cat.value }
        ]"
        :style="{
          background: currentCategory === cat.value ? cat.color : cat.color+'40',
          transform: isDraggingTodo ? 'scale(1.5)' : '',
          boxShadow: draggingOverCategory === cat.value ? '0 0 0 6px ' + cat.color + '55' : ''
        }"
        @click="currentCategory = cat.value"
        :title="cat.label"
        @dragover.prevent="onCategoryDragOver(cat)"
        @dragleave="onCategoryDragLeave(cat)"
        @drop.prevent="onCategoryDrop(cat)"
      >
      </div>
    </div>
    <div class="todo-progress-row">
      <svg class="progress-pie" width="56" height="56" viewBox="0 0 56 56">
        <!-- 背景圆环 -->
        <circle 
          cx="28" 
          cy="28" 
          r="24" 
          fill="none" 
          stroke="#e5e7eb" 
          stroke-width="3"
          opacity="0.3"
        />
        <!-- 进度圆环 -->
        <circle
          cx="28" 
          cy="28" 
          r="24"
          fill="none"
          :stroke="progressColor"
          stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          stroke-linecap="round"
          transform="rotate(-90 28 28)"
          class="progress-circle"
        />
        <!-- 百分比文字 -->
        <text 
          x="28" 
          y="32" 
          text-anchor="middle" 
          font-size="12" 
          font-weight="600"
          :fill="progressColor"
          class="progress-text"
        >
          {{ progressPercent }}%
        </text>
      </svg>
      <div class="progress-label"></div>
      <DangerButton type="danger" class="todo-batch-del-btn" :disabled="!selectedIds.length" @click="batchDelete">批量删除</DangerButton>
    </div>
    <div class="todo-input-row">
      <input v-model="input" @keyup.enter="addTodo" class="todo-input" placeholder="添加新任务..." />
      <select v-model="inputCategory" class="todo-category-select">
        <option v-for="cat in categories" :key="cat.value" :value="cat.value">
          {{ cat.label }}
        </option>
      </select>
      <DangerButton type="gradient-green" class="todo-add-btn" @click="addTodo">添加</DangerButton>
    </div>
    <ul class="todo-list">
      <li v-for="(todo, idx) in filteredTodos" :key="todo.id"
        :class="{
          done: todo.done,
          editing: editingId === todo.id,
          selected: selectedIds.includes(todo.id),
          dragging: draggingId === todo.id
        }"
        draggable="true"
        @dragstart="onDragStart(todo, idx, $event)"
        @dragover.prevent="onDragOver(todo, idx, $event)"
        @drop.prevent="onDrop(todo, idx, $event)"
        @dragend="onDragEnd"
        @mouseenter="hoverId = todo.id" @mouseleave="hoverId = null"
        @click="toggleSelect(todo, $event)">
        <label class="todo-checkbox" @click.stop>
          <input type="checkbox" v-model="todo.done" @change="$emit('update', todo)" />
          <span class="checkmark"></span>
        </label>
        <span class="todo-category-dot" :style="{ background: getCategoryColor(todo.category) }"></span>
        <template v-if="editingId === todo.id">
          <input v-model="editText" class="todo-edit-input" @keyup.enter="saveEdit(todo)" />
          <select v-model="editCategory" class="todo-category-select" style="width:110px;">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
          <button class="todo-edit-save-btn" @click="saveEdit(todo)">
            <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#4cd964"/><path d="M6 10.5l3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </template>
        <span v-else class="todo-text">{{ todo.text }}</span>
        <span class="todo-date">{{ formatDate(todo.date) }}</span>
        <label class="todo-multi-checkbox" @click.stop>
          <input type="checkbox" :checked="selectedIds.includes(todo.id)" readonly />
          <span class="multi-checkmark"></span>
        </label>
        <DangerButton type="danger" class="todo-del-btn" @click.stop="requestDelete(todo.id)">删除</DangerButton>
        <DangerButton type="primary" class="todo-edit-btn" @click.stop="startEdit(todo)">编辑</DangerButton>
      </li>
    </ul>
    <!-- 删除确认弹窗 -->
     <div class="warning-overlay" v-if="showWarningTip">
    <WarningTip
     
      title="删除待办"
      message="确定要删除这个待办事项吗？"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    </div>
    </div>
</template>
<script setup>
// ==================== 导入依赖 ====================
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DangerButton from '@/components/form/DangerButton.vue';
import WarningTip from '@/components/feedback/WorningTips.vue';

// ==================== Props & Emits ====================
const props = defineProps({
  todos: Array
});

const emit = defineEmits(['add', 'update', 'delete', 'reorder']);

// ==================== 常量定义 ====================
const categories = [
  { value: 'main', label: '主线', color: '#ff4d4f' },
  { value: 'branch', label: '支线', color: '#52c41a' },
  { value: 'schedule', label: '时间行程', color: '#1890ff' },
  { value: 'pending', label: '待决定', color: '#faad14' }
];

const circumference = 2 * Math.PI * 24;

// ==================== 响应式数据 ====================
// 删除相关
const showWarningTip = ref(false);
const todoToDeleteId = ref(null);

// 输入相关
const input = ref('');
const inputCategory = ref('main');

// 编辑相关
const editingId = ref(null);
const editText = ref('');
const editCategory = ref('main');

// UI状态
const hoverId = ref(null);
const selectedIds = ref([]);
const currentCategory = ref('main');

// 拖拽相关
const draggingId = ref(null);
const dragOverIdx = ref(null);
const dragFromIdx = ref(null);
const draggingOverCategory = ref(null);

// ==================== 计算属性 ====================
const filteredTodos = computed(() => 
  props.todos.filter(t => t.category === currentCategory.value)
);

const isDraggingTodo = computed(() => draggingId.value !== null);

// 进度相关
const total = computed(() => props.todos.length);
const done = computed(() => props.todos.filter(t => t.done).length);
const progressPercent = computed(() => 
  total.value ? Math.round(done.value / total.value * 100) : 0
);
const progressOffset = computed(() => 
  circumference * (1 - progressPercent.value / 100)
);
const progressColor = computed(() => 
  progressPercent.value === 100 ? '#4cd964' : '#5371f7'
);

// ==================== 工具函数 ====================
const getCategoryColor = (cat) => {
  const c = categories.find(c => c.value === cat);
  return c ? c.color : '#ccc';
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ==================== 删除操作 ====================
const requestDelete = (id) => {
  todoToDeleteId.value = id;
  showWarningTip.value = true;
};

const confirmDelete = () => {
  if (todoToDeleteId.value) {
    emit('delete', todoToDeleteId.value);
  }
  cancelDelete();
};

const cancelDelete = () => {
  showWarningTip.value = false;
  todoToDeleteId.value = null;
};

const batchDelete = () => {
  selectedIds.value.forEach(id => emit('delete', id));
  selectedIds.value = [];
};

// ==================== 添加操作 ====================
const addTodo = () => {
  if (input.value.trim()) {
    emit('add', { text: input.value.trim(), category: inputCategory.value });
    input.value = '';
  }
};

// ==================== 编辑操作 ====================
const startEdit = (todo) => {
  editingId.value = todo.id;
  editText.value = todo.text;
  editCategory.value = todo.category || 'main';
};

const saveEdit = (todo) => {
  if (editingId.value === todo.id && editText.value.trim() && 
      (editText.value !== todo.text || editCategory.value !== todo.category)) {
    emit('update', { ...todo, text: editText.value, category: editCategory.value });
  }
  editingId.value = null;
};

// ==================== 选择操作 ====================
const toggleSelect = (todo, e) => {
  if (editingId.value === todo.id) return;
  const idx = selectedIds.value.indexOf(todo.id);
  if (idx === -1) {
    selectedIds.value.push(todo.id);
  } else {
    selectedIds.value.splice(idx, 1);
  }
};

const clearSelection = () => {
  selectedIds.value = [];
  editingId.value = null;
};

// ==================== 拖拽操作 ====================
function onDragStart(todo, idx, e) {
  draggingId.value = todo.id;
  dragOverIdx.value = idx;
  dragFromIdx.value = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(todo, idx, e) {
  dragOverIdx.value = idx;
}
function onDrop(todo, idx, e) {
  // 如果当前悬停在分类圆点上，优先处理分类变更
  if (draggingOverCategory.value) {
    // 找到拖动的 todo
    const todoItem = props.todos.find(t => t.id === draggingId.value);
    if (todoItem && todoItem.category !== draggingOverCategory.value) {
      emit('update', { ...todoItem, category: draggingOverCategory.value });
    }
    draggingId.value = null;
    draggingOverCategory.value = null;
    dragOverIdx.value = null;
    dragFromIdx.value = null;
    return;
  }
  // 否则走原有排序逻辑
  if (draggingId.value == null || dragOverIdx.value == null) return;
  const fromIdx = filteredTodos.value.findIndex(t => t.id === draggingId.value);
  const toIdx = dragOverIdx.value;
  if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
    const newList = filteredTodos.value.slice();
    const [moved] = newList.splice(fromIdx, 1);
    newList.splice(toIdx, 0, moved);
    emit('reorder', newList);
  }
  draggingId.value = null;
  dragOverIdx.value = null;
  dragFromIdx.value = null;
}
const onDragEnd = () => {
  draggingId.value = null;
  dragOverIdx.value = null;
  dragFromIdx.value = null;
  draggingOverCategory.value = null;
};

// 分类拖拽事件
const onCategoryDragOver = (cat) => {
  if (!isDraggingTodo.value) return;
  draggingOverCategory.value = cat.value;
};

const onCategoryDragLeave = (cat) => {
  if (draggingOverCategory.value === cat.value) {
    draggingOverCategory.value = null;
  }
};

const onCategoryDrop = (cat) => {
  if (!isDraggingTodo.value) return;
  const todoItem = props.todos.find(t => t.id === draggingId.value);
  if (todoItem && todoItem.category !== cat.value) {
    emit('update', { ...todoItem, category: cat.value });
  }
  draggingId.value = null;
  draggingOverCategory.value = null;
  dragOverIdx.value = null;
  dragFromIdx.value = null;
};

// ==================== 外部点击处理 ====================
const handleClickOutside = (e) => {
  const root = document.querySelector('.todo-list-root');
  if (root && !root.contains(e.target)) {
    clearSelection();
  }
};
// ==================== 生命周期钩子 ====================
onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>
<style scoped>
.todo-list-root {
  background: #fff;
  border-radius: 0 0 18px 18px ;
  box-shadow: 0 8px 32px 0 rgba(60,60,60,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04);
  padding: 32px 32px 24px 32px;
  margin: 0 auto;
  transition: box-shadow 0.2s, border-radius 0.2s;
}
.dark-mode .todo-list-root {
  background: #171b2b;
  box-shadow: none;
}
.todo-category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.todo-category-dot-tab {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(.4,1.4,.6,1);
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.todo-category-dot-tab:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.todo-category-dot-tab.active {
  transform: scale(1.3);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}
.todo-progress-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.progress-pie {
  width: 56px;
  height: 56px;
  transition: all 0.3s ease;
}


.progress-circle {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 4px rgba(83, 113, 247, 0.3));
}

.progress-text {
  transition: all 0.3s ease;
}

.dark-mode .progress-pie circle:first-child {
  stroke: #374151;
  opacity: 0.4;
}
.progress-label {

  margin-right: auto;
}

.todo-batch-del-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.todo-batch-del-btn:hover:not(:disabled) {
  background: #f56c6c;
  color: #fff;
  border-color: #f56c6c;
}
.todo-input-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.todo-input {
  flex: 1;
  border: none;
  outline: none;
  background: #f5f6fc;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1.08rem;
  margin-right: 12px;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06);
  transition: box-shadow 0.18s;
}
.dark-mode .todo-input {
  background: #1b223d;
  color: #fff;
}
.todo-input:focus {
  box-shadow: 0 4px 16px rgba(60,60,60,0.13);
}


.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.todo-list li {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06);
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
  position: relative;
}
.dark-mode .todo-list li {
  color: #fff;
  background: #171b2b;
}
.todo-list li:hover {
  background: #f0f3ff;
  box-shadow: 0 4px 16px rgba(60,60,60,0.13);
}
.dark-mode .todo-list li:hover {
  box-shadow: 0 4px 16px rgba(60,60,60,0.13);
  background: #0e173b;
}
.todo-list li.selected {
  box-shadow: 0 12px 32px 0 rgba(83,113,247,0.18), 0 2px 8px 0 rgba(0,0,0,0.08);
  background: #eaf0ff;
  transform: translateY(-6px) scale(1.03) perspective(400px) rotateX(2deg);
  z-index: 2;
}
.dark-mode .todo-list li.selected {
  background: #171b2b;
}
.todo-list li.dragging {
  box-shadow: 0 16px 40px 0 rgba(83,113,247,0.22), 0 4px 12px 0 rgba(0,0,0,0.10);
  background: #e0e7ff;
  transform: scale(1.04) rotateZ(1deg);
  opacity: 0.85;
  z-index: 10;
}
.todo-list li.done {
  opacity: 0.6;
  text-decoration: line-through;
}
.todo-list li.editing {
  background: #eaf0ff;
}
.dark-mode .todo-list li.editing {
  background: #171b2b;
}

.todo-checkbox {
  margin-right: 16px;
  position: relative;
  display: flex;
  align-items: center;
}
.todo-checkbox input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}
.todo-checkbox .checkmark {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #fff;
  border: 2px solid #5371f7;
  display: inline-block;
  margin-right: 0;
  position: relative;
  transition: background 0.18s, border 0.18s;
}
.todo-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #5371f7;
  border-color: #5371f7;
}
.todo-checkbox .checkmark:after {
  content: '';
  position: absolute;
  display: none;
}
.todo-checkbox input[type="checkbox"]:checked + .checkmark:after {
  display: block;
}
.todo-checkbox .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
}
.todo-edit-input {
  flex: 1;
  font-size: 1.08rem;
  color: #222;
  border: none;
  outline: none;
  background: #fff;
  border-radius: 6px;
  padding: 8px 12px;
  margin-right: 8px;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06);
}
.dark-mode .todo-edit-input {
  background: #292d3a;
  color: #fff;
}

.todo-text {
  flex: 1;
  font-size: 1.08rem;
  color: #222;
  white-space: pre-line;
  word-break: break-all;
  cursor: pointer;
  user-select: text;
}
.dark-mode .todo-text {
  color: #fff;
}
.todo-date {
  font-size: 0.95rem;
  color: #aaa;
  margin: 0 12px 0 8px;
  min-width: 90px;
  text-align: right;
}
.todo-multi-checkbox {
  margin-left: 8px;
  margin-right: 8px;
  position: relative;
  display: flex;
  align-items: center;
}
.todo-multi-checkbox input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}
.todo-multi-checkbox .multi-checkmark {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: #fff;
  border: 2px solid #bbb;
  display: inline-block;
  position: relative;
  transition: background 0.18s, border 0.18s;
}
.todo-multi-checkbox input[type="checkbox"]:checked + .multi-checkmark {
  background: #5371f7;
  border-color: #5371f7;
}
.todo-multi-checkbox .multi-checkmark:after {
  content: '';
  position: absolute;
  display: none;
}
.todo-multi-checkbox input[type="checkbox"]:checked + .multi-checkmark:after {
  display: block;
}
.todo-multi-checkbox .multi-checkmark:after {
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.todo-del-btn {
  margin-left: 12px;
  transition: background 0.18s, color 0.18s, border 0.18s;
  position: absolute;
  right: 90px;
  top: 50%;
  transform: translateY(-50%);
}

.todo-edit-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.todo-edit-save-btn {
  border: none;
  background: none;
  margin-left: 8px;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  transition: box-shadow 0.18s;
  outline: none;
  vertical-align: middle;
}
.todo-edit-save-btn svg {
  display: block;
}
.todo-edit-save-btn:active {
  box-shadow: 0 2px 8px #4cd96444;
}
.todo-category-select {
  margin: 10px;
  border-radius: 12px;
  border: 1.5px solid #dbeafe;
  padding: 8px 18px 8px 12px;
  font-size: 15px;
  background: linear-gradient(135deg, #f5f6fc 60%, #e0e7ff 100%);
  box-shadow: 0 2px 8px rgba(83,113,247,0.08);
  color: #4159c7;
  font-weight: 500;
  appearance: none;
  outline: none;
  transition: border 0.18s, box-shadow 0.18s;
  cursor: pointer;
  position: relative;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235371f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}
.dark-mode .todo-category-select {
  border-color: #1f1c2e;
}
.todo-category-select:focus {
  box-shadow: 0 4px 16px rgba(83,113,247,0.13);
  border-color: #5371f7;
}

.todo-category-select:hover {
  border-color: #5371f7;
  box-shadow: 0 3px 12px rgba(83,113,247,0.12);
}
.todo-category-select option {
  padding: 8px 16px 8px 32px;
  font-size: 15px;
  background: #fff;
  color: #222;
  position: relative;
  border: none;
  outline: none;
}
.todo-category-select option:checked {
  background: #eaf0ff;
  color: #5371f7;
  font-weight: 600;
}
.todo-category-select option:hover {
  background: #f0f3ff;
}
/* 彩色小圆点 */
.todo-category-select option {
  background-repeat: no-repeat;
  background-position: 10px center;
}
.todo-category-select option[value="main"] {
  background-image: radial-gradient(circle, #ff4d4f 6px, transparent 7px);
}
.todo-category-select option[value="branch"] {
  background-image: radial-gradient(circle, #52c41a 6px, transparent 7px);
}
.todo-category-select option[value="schedule"] {
  background-image: radial-gradient(circle, #1890ff 6px, transparent 7px);
}
.todo-category-select option[value="pending"] {
  background-image: radial-gradient(circle, #faad14 6px, transparent 7px);
}
.todo-category-tabs.dragging .todo-category-dot-tab {
  transform: scale(1.5);
  z-index: 10;
}

</style> 

