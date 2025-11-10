<template>
  <VoiceCallBubble
    v-if="callStore.isCallActive"
    :visible="callStore.isCallActive"
    :userName="callStore.remoteUser.name"
    :userAvatar="callStore.remoteUser.avatar"
    :callStatus="callStore.callStatus"
    :callDuration="callStore.callDuration"
    :isMuted="callStore.isMuted"
    @minimize="callStore.minimizeCall"
    @restore="callStore.restoreCall"
    @mute="callStore.toggleMute"
    @hangup="callStore.hangupCall"
    @drag="handleDrag"
  />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import VoiceCallBubble from './VoiceCallBubble.vue'
import { useCallStore } from '@/stores/call.js'

const callStore = useCallStore()

const handleDrag = (position) => {
  // 保存气泡位置到localStorage
  localStorage.setItem('callBubblePosition', JSON.stringify(position))
}

onMounted(() => {
  // 从localStorage恢复气泡位置
  const savedPosition = localStorage.getItem('callBubblePosition')
  if (savedPosition) {
    try {
      const position = JSON.parse(savedPosition)
      // 这里可以设置初始位置，但需要在VoiceCallBubble组件中支持
    } catch (error) {
      console.warn('恢复通话气泡位置失败:', error)
    }
  }
})

onUnmounted(() => {
  // 清理资源
  callStore.cleanup()
})
</script>

<style scoped>
/* 全局通话气泡不需要额外样式，由VoiceCallBubble组件自己管理 */
</style>


