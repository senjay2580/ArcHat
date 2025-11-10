<template>
  <node-view-wrapper class="code-block-container">
    <pre><code><node-view-content /></code></pre>
    <div class="toolbar">
      <button @click="copyCode" class="toolbar-button">{{ copyButtonText }}</button>
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3';
import { ref } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const copyButtonText = ref('Copy');

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.node.textContent);
    copyButtonText.value = 'Copied!';
    setTimeout(() => {
      copyButtonText.value = 'Copy';
    }, 2000);
  } catch (err) {
    copyButtonText.value = 'Error!';
    console.error('Failed to copy code: ', err);
  }
};
</script>

<style scoped>
.code-block-container {
  position: relative;
}

.toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.code-block-container:hover .toolbar {
  opacity: 1;
}

.toolbar-button {
  background-color: #4a5568; /* Gray 700 */
  color: #f7fafc; /* Gray 100 */
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  font-family: sans-serif;
}

.toolbar-button:hover {
  background-color: #2d3748; /* Gray 800 */
}
</style>


