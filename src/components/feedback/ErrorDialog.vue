<template>
  <Transition name="slide-fade-bottom">
    <div v-if="visible" class="notifications-container">
      <div class="error-alert">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="error-svg">
              <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" fill-rule="evenodd"></path>
            </svg>
          </div>
          <div class="error-prompt-container">
            <p class="error-prompt-heading">{{ title }}</p>
            <div class="error-prompt-wrap" v-if="messages && messages.length > 0">
              <ul class="error-prompt-list" role="list">
                <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
              </ul>
            </div>
            <div class="error-prompt-wrap" v-else-if="message">
              <p>{{ message }}</p>
            </div>
          </div>
          <div class="error-close" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#B91C1C"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'An error occurred'
  },
  message: {
    type: String,
    default: ''
  },
  messages: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:visible', 'close'])
const close = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
.slide-fade-bottom-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-bottom-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-bottom-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-bottom-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
@keyframes SlideInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(20%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
.notifications-container {
  animation: SlideInFromLeft 0.4s ease-out;

  width: 320px;
  height: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: auto;
}

.flex {
  display: flex;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.error-alert {
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: rgb(254 242 242);
  
}

.error-svg {
  color: #F87171;
  width: 1.25rem;
  height: 1.25rem;
}

.error-prompt-heading {
  color: #991B1B;
  font-size: 1rem;
  line-height: 1.85rem;
  font-weight: bold;
  margin: 0;
}

.error-prompt-container {
  display: flex;
  flex-direction: column;
  margin-left: 1.25rem;
  
}

.error-prompt-wrap {
  color: #B91C1C;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.error-prompt-list {
  padding-left: 1.5rem;
  margin-top: 0.25rem;
  list-style-type: disc;

}
.error-prompt-list li {
  color: #5e0606;
}
.error-close {
  flex-shrink: 0;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: background-color 0.2s;
  margin-left: auto;
  pointer-events: auto;
}



</style>


