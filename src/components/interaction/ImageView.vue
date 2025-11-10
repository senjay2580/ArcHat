<template>
  <node-view-wrapper class="image-view">
    <div class="image-container" :class="{ 'is-selected': selected }" @click="handleClick">
      <img :src="node.attrs.src" :class="node.attrs.class" />
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { inject } from 'vue';

const props = defineProps(nodeViewProps);

const openImageViewer = inject('openImageViewer');

const handleClick = () => {
  if (openImageViewer && !props.node.attrs.class?.includes('inline-emoji')) {
    openImageViewer(props.node.attrs.src);
  }
};
</script>

<style scoped>
.image-view {
  display: inline-block; /* Or 'block' if you want images on their own line */
  position: relative;
  line-height: 0; /* To remove extra space below image */
}

.image-container {
  position: relative;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.2s ease-in-out;
}


img {
  cursor: pointer;
  max-width: 100%;
  height: auto;
  border-radius: 2px;
}

/* 只对非表情图片应用尺寸限制 */
img:not(.inline-emoji) {
  max-width: 600px !important;
  max-height: 400px !important;
  min-width: 100px !important;
  min-height: 75px !important;
  object-fit: contain;
  display: block;
  margin: 10px auto;
}



</style>


