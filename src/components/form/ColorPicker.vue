<template>
  <div v-if="show" class="color-picker" :style="style">
    <div class="color-picker-header">
      <div class="window-controls">
        <div class="control-dot close" @click="$emit('close')"></div>
        <div class="control-dot minimize"></div>
        <div class="control-dot expand"></div>
      </div>
      <div class="color-picker-title">文字颜色</div>
      <div class="color-picker-spacer"></div>
    </div>
    <div class="color-grid">
      <!-- 基础颜色行 -->
      <div class="color-row">
        <div class="color-item" @click="selectColor('#000000')" style="background-color: #000000" title="黑色"></div>
        <div class="color-item" @click="selectColor('#333333')" style="background-color: #333333" title="深灰"></div>
        <div class="color-item" @click="selectColor('#666666')" style="background-color: #666666" title="灰色"></div>
        <div class="color-item" @click="selectColor('#999999')" style="background-color: #999999" title="浅灰"></div>
        <div class="color-item" @click="selectColor('#cccccc')" style="background-color: #cccccc" title="很浅灰"></div>
        <div class="color-item" @click="selectColor('#ffffff')" style="background-color: #ffffff; border: 1px solid #ddd" title="白色"></div>
      </div>
      <!-- 彩虹色行 -->
      <div class="color-row">
        <div class="color-item" @click="selectColor('#ff0000')" style="background-color: #ff0000" title="红色"></div>
        <div class="color-item" @click="selectColor('#ff8800')" style="background-color: #ff8800" title="橙色"></div>
        <div class="color-item" @click="selectColor('#ffff00')" style="background-color: #ffff00" title="黄色"></div>
        <div class="color-item" @click="selectColor('#88ff00')" style="background-color: #88ff00" title="黄绿"></div>
        <div class="color-item" @click="selectColor('#00ff00')" style="background-color: #00ff00" title="绿色"></div>
        <div class="color-item" @click="selectColor('#00ff88')" style="background-color: #00ff88" title="青绿"></div>
      </div>
      <div class="color-row">
        <div class="color-item" @click="selectColor('#00ffff')" style="background-color: #00ffff" title="青色"></div>
        <div class="color-item" @click="selectColor('#0088ff')" style="background-color: #0088ff" title="天蓝"></div>
        <div class="color-item" @click="selectColor('#0000ff')" style="background-color: #0000ff" title="蓝色"></div>
        <div class="color-item" @click="selectColor('#8800ff')" style="background-color: #8800ff" title="紫蓝"></div>
        <div class="color-item" @click="selectColor('#ff00ff')" style="background-color: #ff00ff" title="紫色"></div>
        <div class="color-item" @click="selectColor('#ff0088')" style="background-color: #ff0088" title="粉红"></div>
      </div>
      <!-- 深色调行 -->
      <div class="color-row">
        <div class="color-item" @click="selectColor('#8b4513')" style="background-color: #8b4513" title="棕色"></div>
        <div class="color-item" @click="selectColor('#d2691e')" style="background-color: #d2691e" title="巧克力色"></div>
        <div class="color-item" @click="selectColor('#ff69b4')" style="background-color: #ff69b4" title="热粉"></div>
        <div class="color-item" @click="selectColor('#32cd32')" style="background-color: #32cd32" title="石灰绿"></div>
        <div class="color-item" @click="selectColor('#4169e1')" style="background-color: #4169e1" title="皇家蓝"></div>
        <div class="color-item" @click="selectColor('#9932cc')" style="background-color: #9932cc" title="深兰花紫"></div>
      </div>
      <!-- 新增更多颜色行 -->
      <div class="color-row">
        <div class="color-item" @click="selectColor('#ff6b6b')" style="background-color: #ff6b6b" title="珊瑚红"></div>
        <div class="color-item" @click="selectColor('#4ecdc4')" style="background-color: #4ecdc4" title="薄荷绿"></div>
        <div class="color-item" @click="selectColor('#45b7d1')" style="background-color: #45b7d1" title="天空蓝"></div>
        <div class="color-item" @click="selectColor('#f9ca24')" style="background-color: #f9ca24" title="向日葵黄"></div>
        <div class="color-item" @click="selectColor('#f0932b')" style="background-color: #f0932b" title="芒果橙"></div>
        <div class="color-item" @click="selectColor('#eb4d4b')" style="background-color: #eb4d4b" title="西瓜红"></div>
      </div>
      <div class="color-row">
        <div class="color-item" @click="selectColor('#6c5ce7')" style="background-color: #6c5ce7" title="薰衣草紫"></div>
        <div class="color-item" @click="selectColor('#a29bfe')" style="background-color: #a29bfe" title="紫罗兰"></div>
        <div class="color-item" @click="selectColor('#fd79a8')" style="background-color: #fd79a8" title="樱花粉"></div>
        <div class="color-item" @click="selectColor('#fdcb6e')" style="background-color: #fdcb6e" title="香槟金"></div>
        <div class="color-item" @click="selectColor('#e17055')" style="background-color: #e17055" title="赤陶橙"></div>
        <div class="color-item" @click="selectColor('#00b894')" style="background-color: #00b894" title="翡翠绿"></div>
      </div>
      <!-- HSL 色轮区域 -->
      <div class="color-wheel-section">
        <div class="color-wheel-title">色轮选择</div>
        <div class="color-wheel-container">
          <canvas ref="colorWheel" width="120" height="120" @click="onWheelClick" @mousemove="onWheelMove"></canvas>
          <div class="brightness-slider">
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model="brightness" 
              @input="updateColorFromWheel"
              class="slider"
            />
            <div class="slider-label">亮度: {{ brightness }}%</div>
          </div>
        </div>
        <div class="custom-color-preview">
          <div class="preview-color" :style="{ backgroundColor: currentWheelColor }"></div>
          <div class="color-info">
            <div>{{ currentWheelColor }}</div>
            <button @click="selectColor(currentWheelColor)" class="use-color-btn">使用此颜色</button>
          </div>
        </div>
      </div>
      <!-- 重置按钮 -->
      <div class="color-reset">
        <button @click="$emit('remove')" class="reset-color-btn">移除颜色</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['select', 'remove', 'close'])

// 色轮相关
const colorWheel = ref(null)
const brightness = ref(50)
const currentWheelColor = ref('#ff0000')
const selectedHue = ref(0)
const selectedSaturation = ref(100)

const selectColor = (color) => {
  emit('select', color)
}

// HSL转RGB
const hslToRgb = (h, s, l) => {
  h /= 360
  s /= 100
  l /= 100
  
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// 绘制色轮
const drawColorWheel = () => {
  if (!colorWheel.value) return
  
  const canvas = colorWheel.value
  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 5
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制色轮
  for (let angle = 0; angle < 360; angle += 1) {
    const startAngle = (angle - 1) * Math.PI / 180
    const endAngle = angle * Math.PI / 180
    
    for (let r = 0; r < radius; r += 1) {
      const saturation = r / radius * 100
      const hue = angle
      const lightness = brightness.value
      
      const [red, green, blue] = hslToRgb(hue, saturation, lightness)
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, startAngle, endAngle)
      ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
}

// 色轮点击事件
const onWheelClick = (event) => {
  const canvas = colorWheel.value
  const rect = canvas.getBoundingClientRect()
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const x = event.clientX - rect.left - centerX
  const y = event.clientY - rect.top - centerY
  
  const distance = Math.sqrt(x * x + y * y)
  const radius = Math.min(centerX, centerY) - 5
  
  if (distance <= radius) {
    const angle = Math.atan2(y, x) * 180 / Math.PI
    const hue = (angle + 360) % 360
    const saturation = (distance / radius) * 100
    
    selectedHue.value = hue
    selectedSaturation.value = saturation
    updateColorFromWheel()
  }
}

// 色轮鼠标移动事件
const onWheelMove = (event) => {
  // 可以添加预览功能
}

// 从色轮更新颜色
const updateColorFromWheel = () => {
  const [r, g, b] = hslToRgb(selectedHue.value, selectedSaturation.value, brightness.value)
  currentWheelColor.value = `rgb(${r}, ${g}, ${b})`
}

// 监听亮度变化重绘色轮
watch(brightness, () => {
  drawColorWheel()
  updateColorFromWheel()
})

// 监听显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(drawColorWheel, 50) // 延迟绘制确保DOM已渲染
  }
})

onMounted(() => {
  if (props.show) {
    drawColorWheel()
  }
})
</script>

<style scoped>
.color-picker {
  position: fixed;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 280px;
  max-width: 350px;
  border: 1px solid #e1e5e9;
  backdrop-filter: blur(10px);
}

.color-picker-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e1e5e9;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px 12px 0 0;
}

.window-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-dot.close {
  background: #ff5f57;
}

.control-dot.minimize {
  background: #ffbd2e;
}

.control-dot.expand {
  background: #28ca42;
}

.control-dot:hover {
  transform: scale(1.1);
}

.color-picker-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.color-picker-spacer {
  width: 60px;
}

.color-grid {
  padding: 16px;
}

.color-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  justify-content: center;
}

.color-item {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: #3498db;
}

.gradient-item {
  position: relative;
}

.gradient-item::after {
  content: '✨';
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 10px;
  background: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-wheel-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e1e5e9;
}

.color-wheel-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 14px;
}

.color-wheel-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

#colorWheel {
  border-radius: 50%;
  cursor: crosshair;
  border: 2px solid #e1e5e9;
}

.brightness-slider {
  flex: 1;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #000000, #ffffff);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.slider-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

.custom-color-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
}

.color-info {
  flex: 1;
}

.color-info div:first-child {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.use-color-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.use-color-btn:hover {
  background: #2980b9;
}

.color-reset {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e1e5e9;
  text-align: center;
}

.reset-color-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.reset-color-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

/* 深色模式 */
.dark-mode .color-picker {
  background: #2c3e50;
  border-color: #34495e;
}

.dark-mode .color-picker-header {
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  border-bottom-color: #34495e;
}

.dark-mode .color-picker-title {
  color: #ecf0f1;
}

.dark-mode .color-wheel-title {
  color: #ecf0f1;
}

.dark-mode .color-wheel-section {
  border-top-color: #34495e;
}

.dark-mode .color-reset {
  border-top-color: #34495e;
}

.dark-mode .custom-color-preview {
  background: #34495e;
}

.dark-mode .preview-color {
  border-color: #4a5f7a;
}

.dark-mode .color-info div:first-child {
  color: #bdc3c7;
}

.dark-mode .slider-label {
  color: #bdc3c7;
}

.dark-mode #colorWheel {
  border-color: #4a5f7a;
}
</style>


