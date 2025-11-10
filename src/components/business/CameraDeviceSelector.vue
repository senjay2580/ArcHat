<template>
  <div class="camera-device-selector">
    <el-dialog
      v-model="visible"
      title="选择摄像头设备"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="device-selector-content">
        <div class="selector-header">
          <h3>请选择要使用的摄像头设备</h3>
          <p class="selector-desc">选择您想要在视频通话中使用的摄像头设备</p>
        </div>

        <div class="device-list" v-loading="loading">
          <div 
            v-for="(device, index) in videoDevices" 
            :key="device.deviceId"
            class="device-item"
            :class="{ 'selected': selectedDeviceId === device.deviceId }"
            @click="selectDevice(device.deviceId)"
          >
            <div class="device-info">
              <div class="device-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <div class="device-details">
                <div class="device-name">{{ device.label || `摄像头 ${index + 1}` }}</div>
                <div class="device-id">{{ device.deviceId.substring(0, 20) }}...</div>
                <div class="device-tags">
                  <span v-if="isOBSDevice(device)" class="tag obs-tag">OBS虚拟摄像头</span>
                  <span v-if="isDefaultDevice(device)" class="tag default-tag">默认设备</span>
                </div>
              </div>
            </div>
            <div class="device-radio">
              <el-radio 
                :model-value="selectedDeviceId" 
                :value="device.deviceId"
                @change="selectDevice(device.deviceId)"
              />
            </div>
          </div>
        </div>

        <div class="preview-section" v-if="selectedDeviceId">
          <h4>预览</h4>
          <div class="preview-container">
            <video 
              ref="previewVideoRef"
              class="preview-video"
              autoplay
              playsinline
              muted
            ></video>
            <div v-if="previewError" class="preview-error">
              <p>预览失败: {{ previewError }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <danger-button type="danger" @click="cancel">取消</danger-button>
          <danger-button type="orange" @click="refreshDevices" :loading="loading">刷新设备</danger-button>
          <danger-button 
            type="primary" 
            @click="confirm"
            :disabled="!selectedDeviceId"
          >
            确认使用
          </danger-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import DangerButton from '@/components/form/DangerButton.vue'
// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentDeviceId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Reactive data
const visible = ref(false)
const loading = ref(false)
const videoDevices = ref([])
const selectedDeviceId = ref('')
const previewVideoRef = ref(null)
const previewStream = ref(null)
const previewError = ref('')

// Watch props
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    initializeSelector()
  } else {
    cleanup()
  }
})

watch(() => props.currentDeviceId, (newVal) => {
  if (newVal) {
    selectedDeviceId.value = newVal
  }
})

// Watch selected device for preview
watch(selectedDeviceId, async (newDeviceId) => {
  if (newDeviceId && visible.value) {
    await updatePreview(newDeviceId)
  }
})

// Methods
const initializeSelector = async () => {
  selectedDeviceId.value = props.currentDeviceId
  await loadVideoDevices()
}

const loadVideoDevices = async () => {
  loading.value = true
  previewError.value = ''
  
  try {
    console.log('🎥 开始加载摄像头设备列表...')
    
    // 先获取媒体权限以查看设备标签
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      tempStream.getTracks().forEach(track => track.stop())
      console.log('✅ 媒体权限获取成功')
    } catch (permError) {
      console.warn('⚠️ 获取媒体权限失败:', permError.message)
    }
    
    // 枚举设备
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    
    videoDevices.value = cameras
    console.log('🎥 找到摄像头设备:', cameras.length, '个')
    console.log('🎥 设备列表:', cameras.map(d => ({ label: d.label, deviceId: d.deviceId })))
    
    // 如果没有选中的设备，默认选择第一个
    if (!selectedDeviceId.value && cameras.length > 0) {
      selectedDeviceId.value = cameras[0].deviceId
    }
    
  } catch (error) {
    console.error('❌ 加载摄像头设备失败:', error)
    previewError.value = '加载设备列表失败: ' + error.message
  } finally {
    loading.value = false
  }
}

const selectDevice = (deviceId) => {
  selectedDeviceId.value = deviceId
  console.log('📹 选择设备:', deviceId)
}

const updatePreview = async (deviceId) => {
  if (!deviceId || !previewVideoRef.value) return
  
  // 清理之前的预览
  if (previewStream.value) {
    previewStream.value.getTracks().forEach(track => track.stop())
    previewStream.value = null
  }
  
  try {
    console.log('🎬 开始预览设备:', deviceId)
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    })
    
    previewStream.value = stream
    previewVideoRef.value.srcObject = stream
    previewError.value = ''
    
    console.log('✅ 预览启动成功')
    
  } catch (error) {
    console.error('❌ 预览失败:', error)
    previewError.value = '预览失败: ' + error.message
  }
}

const isOBSDevice = (device) => {
  const label = (device.label || '').toLowerCase()
  const obsKeywords = ['obs', 'virtual camera', 'streamlabs']
  return obsKeywords.some(keyword => label.includes(keyword))
}

const isDefaultDevice = (device) => {
  const label = (device.label || '').toLowerCase()
  return label.includes('default') || label.includes('默认')
}

const refreshDevices = async () => {
  await loadVideoDevices()
}

const confirm = () => {
  if (!selectedDeviceId.value) return
  
  const selectedDevice = videoDevices.value.find(d => d.deviceId === selectedDeviceId.value)
  console.log('✅ 确认使用设备:', selectedDevice?.label, selectedDeviceId.value)
  
  emit('confirm', {
    deviceId: selectedDeviceId.value,
    device: selectedDevice
  })
  
  visible.value = false
  emit('update:modelValue', false)
}

const cancel = () => {
  console.log('❌ 取消设备选择')
  emit('cancel')
  visible.value = false
  emit('update:modelValue', false)
}

const cleanup = () => {
  if (previewStream.value) {
    previewStream.value.getTracks().forEach(track => track.stop())
    previewStream.value = null
  }
  previewError.value = ''
}

// Lifecycle
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
:deep(.el-dialog) {
  background-color: rgb(255, 255, 255)!important;
}
.camera-device-selector {
  z-index: 10000;
}

.device-selector-content {
  padding: 0;
  
}

.selector-header {
  text-align: center;
  margin-bottom: 24px;
}

.selector-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.selector-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.device-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.device-item:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.device-item.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.device-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.device-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6b7280;
}

.device-icon svg {
  width: 20px;
  height: 20px;
}

.device-details {
  flex: 1;
}

.device-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.device-id {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  margin-bottom: 6px;
}

.device-tags {
  display: flex;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.obs-tag {
  background: #dcfce7;
  color: #166534;
}

.default-tag {
  background: #dbeafe;
  color: #1d4ed8;
}

.device-radio {
  margin-left: 12px;
}

.preview-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.preview-container {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  height: 200px;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>


