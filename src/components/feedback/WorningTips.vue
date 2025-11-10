<template>
<!-- From Uiverse.io by Yaya12085 --> 
<div class="card" @click.stop>
  <div class="header">
    <div class="image" :style="{ backgroundColor: iconBgColor }" v-if="showIcon">
      <svg
        aria-hidden="true"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        fill="none"
        :style="{ color: iconColor }"
      >
        <path
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          stroke-linejoin="round"
          stroke-linecap="round"
        ></path>
      </svg>
    </div>
    <div class="content">
      <span class="title">{{ title }}</span>
      <p class="message">
        {{ message }}
      </p>
    </div>
    <div class="actions">
      <button 
        class="desactivate" 
        type="button"
        :style="{ backgroundColor: confirmButtonColor }"
        @click="$emit('confirm')"
      >
        {{ confirmText }}
      </button>
      <button 
        class="cancel" 
        type="button"
        @click="$emit('cancel')"
      >
        {{ cancelText }}
      </button>
    </div>
  </div>
</div>
</template>

<script setup>
defineProps({
  // 标题
  title: {
    type: String,
    default: '警告提示'
  },
  // 消息内容
  message: {
    type: String,
    default: '这是一个警告提示，请确认您的操作。'
  },
  // 确认按钮文本
  confirmText: {
    type: String,
    default: '确认'
  },
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  // 图标背景颜色
  iconBgColor: {
    type: String,
    default: '#fee2e2'
  },
  // 图标颜色
  iconColor: {
    type: String,
    default: '#dc2626'
  },
  // 确认按钮颜色
  confirmButtonColor: {
    type: String,
    default: '#dc2626'
  },
  // 卡片宽度
  width: {
    type: String,
    default: '290px'
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: true
  }
});

// 定义事件
defineEmits(['confirm', 'cancel']);
</script>
<style scoped>

/* From Uiverse.io by Yaya12085 */ 
.card {
  padding: 0;
  overflow: hidden;
  position: relative;
  text-align: left;
  border-radius: 0.5rem;
  width: v-bind(width);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.4s ease-out;
  transform-origin: center;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.header {
  padding: 1.25rem 1rem 1rem 1rem;
  background-color: #ffffff;
}

.image {
  display: flex;
  margin-left: auto;
  margin-right: auto;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
}

.image svg {
  width: 1.5rem;
  height: 1.5rem;
}

.content {
  margin-top: 0.75rem;
  text-align: center;
}

.title {
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}

.message {
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.actions {
  margin: 0.75rem 1rem;
  background-color: none;
}

.desactivate {
  display: inline-flex;
  padding: 0.5rem 1rem;
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  justify-content: center;
  width: 100%;
  border-radius: 0.375rem;
  border-width: 1px;
  border-color: transparent;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.desactivate:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cancel {
  display: inline-flex;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  color: #374151;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  justify-content: center;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.cancel:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button {
  cursor: pointer;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .card {
    width: 90vw !important;
    max-width: 350px;
    margin: 0 auto;
  }
  
  .header {
    padding: 1rem 1rem 0.75rem 1rem;
  }
  
  .content {
    padding: 0 1rem 1rem 1rem;
  }
  
  .actions {
    margin: 0.5rem 1rem;
    gap: 0.75rem;
  }
  
  .desactivate,
  .cancel {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .card {
    width: 95vw !important;
    max-width: 320px;
  }
  
  .header {
    padding: 0.875rem 0.875rem 0.625rem 0.875rem;
  }
  
  .content {
    padding: 0 0.875rem 0.875rem 0.875rem;
  }
  
  .actions {
    margin: 0.5rem 0.875rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .desactivate,
  .cancel {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.875rem;
  }
  
  .title {
    font-size: 1rem;
  }
  
  .text {
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

/* 超小屏幕适配 */
@media (max-width: 360px) {
  .card {
    width: 98vw !important;
    max-width: 300px;
  }
  
  .header {
    padding: 0.75rem;
  }
  
  .content {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }
  
  .actions {
    margin: 0.5rem 0.75rem;
  }
  
  .title {
    font-size: 0.95rem;
  }
  
  .text {
    font-size: 0.8rem;
  }
}
</style>

