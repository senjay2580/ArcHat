<template>
<div class="ui-input-container" :style="{ width }">
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    class="ui-input"
    :type="type"
    :required="required"
    :disabled="disabled"
    :style="{ width: width + 'px' }"
  />
  <div class="ui-input-underline"></div>
  <div class="ui-input-highlight"></div>
  <div class="ui-input-icon" v-if="icon">
    <component :is="icon" />
  </div>
  <slot name="icon" v-else />
</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Type something...' },
  icon: { type: [Object, Function], default: null },
  width: { type: String, default: '400px' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.ui-input-container {
  position: relative;
  width: 400px;
}

.ui-input {
  padding: 10px 10px 10px 40px;
  font-size: 1em;
  border: none;
  border-bottom: 2px solid #ccc;
  outline: none;
  background-color: transparent;
  transition: border-color 0.3s;
}
.dark-mode .ui-input {
  color: #fafbff;
}



.ui-input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: #638dff;
  transform: scaleX(0);
  transition: transform 0.3s;
}

.ui-input:focus + .ui-input-underline {
  transform: scaleX(1);
}

.ui-input-highlight {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 0;
  background-color: rgba(108, 99, 255, 0.1);
  transition: width 0.3s;
}

.ui-input:focus ~ .ui-input-highlight {
  width: 100%;
}

.ui-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  transition: color 0.3s;
}

.ui-input:focus ~ .ui-input-icon {
  color: #4e73f0;
}

.ui-input-icon svg {
  width: 20px;
  height: 20px;
}

</style>

