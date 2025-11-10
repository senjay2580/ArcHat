<template>
  <div class="items-container">
    <div v-if="items.length">
      <button
        class="item"
        :class="{ 'is-selected': index === selectedIndex }"
        v-for="(item, index) in items"
        :key="index"
        @click="selectItem(index)"
      >
        <img v-if="item.fallbackImage" :src="item.fallbackImage" class="emoji-image" />
        <span v-else>{{ item.emoji }}</span>
        <span>:{{ item.name }}:</span>
      </button>
    </div>
    <div class="item" v-else>
      No result
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({ items: Array, command: Function });
const selectedIndex = ref(0);

const selectItem = (index) => {
  const item = props.items[index];
  if (item) {
    props.command({ name: item.name });
  }
};

const upHandler = () => {
  selectedIndex.value = ((selectedIndex.value + props.items.length) - 1) % props.items.length;
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

defineExpose({ onKeyDown: ({ event }) => {
  if (event.key === 'ArrowUp') {
    upHandler();
    return true;
  }
  if (event.key === 'ArrowDown') {
    downHandler();
    return true;
  }
  if (event.key === 'Enter') {
    enterHandler();
    return true;
  }
  return false;
}});

</script>

<style scoped>
.items-container {
  padding: 0.2rem;
  position: relative;
  border-radius: 0.5rem;
  background: #fff;
  color: rgba(0,0,0,0.8);
  overflow: hidden;
  font-size: 0.9rem;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.1);
}
.item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border-radius: 0.4rem;
  border: 1px solid transparent;
  padding: 0.2rem 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.item.is-selected {
  border-color: #000;
}
.emoji-image {
  width: 1.2em;
  height: 1.2em;
}

/* Dark Mode Styles */
.dark .items-container {
  background: #1f2937; /* Dark background */
  color: #d1d5db; /* Light text */
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 10px 20px rgba(0, 0, 0, 0.2);
}

.dark .item.is-selected {
  border-color: #4b5563; /* Darker border */
  background-color: #374151; /* Selected background */
}
</style>


