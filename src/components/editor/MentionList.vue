<template>
  <div class="mention-list-container">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="mention-item"
      :class="{ 'is-selected': selectedIndex === index }"
      @click="selectItem(index)"
    >
      {{ item.label }}
    </div>
    <div v-if="items.length === 0" class="mention-item-empty">
      No results found
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineExpose } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  command: {
    type: Function,
    required: true,
  },
});

const selectedIndex = ref(0);

const selectItem = (index) => {
  const item = props.items[index];
  if (item) {
    props.command({ id: item.id, label: item.label });
  }
};

const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length;
};

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
};

const enterHandler = () => {
  selectItem(selectedIndex.value);
};

watch(() => props.items, () => {
  selectedIndex.value = 0;
});

defineExpose({
  onKeyDown: ({ event }) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      upHandler();
      return true;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      downHandler();
      return true;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      enterHandler();
      return true;
    }
    if (event.key === 'Escape') {
      return false;
    }
    return false;
  },
});
</script>

<style scoped>
.mention-list-container {
  background-color: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color-light, #ddd);
  color: var(--el-text-color-primary, #303133);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px;
  max-height: 250px; /* Control max height */
  overflow-y: auto;   /* Enable vertical scrollbar */
  overflow-x: hidden;
  z-index: 1000;
}

.mention-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mention-item:hover {
  background-color: var(--el-fill-color-light, #f3f4f6);
}

.mention-item.is-selected {
  background-color: var(--el-color-primary-light-9, #dbeafe);
  color: var(--el-color-primary, #1e40af);
}

.mention-item-empty {
  padding: 8px 12px;
  color: var(--el-text-color-secondary, #6b7280);
}

/* Custom Scrollbar for dark mode compatibility */
.mention-list-container::-webkit-scrollbar {
  width: 8px;
}

.mention-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.mention-list-container::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color, #ccc);
  border-radius: 4px;
}

.mention-list-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-text-color-secondary, #999);
}
</style>

