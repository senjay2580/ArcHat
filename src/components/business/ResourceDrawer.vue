<template>
  <transition name="slide-fade">
    <div v-if="visible" class="resource-drawer">
      <div style="color: #452;font-size: 1.2rem;font-weight: 500; margin-bottom: 18px;">
        我的资源
      </div>
      <ResourceInput />
      <el-tabs v-model="activeTab" class="resource-tabs">
        <el-tab-pane label="图片/视频" name="media">
          <div class="media-grid">
            <div v-for="item in mockMedia" :key="item.id" class="media-item">
              <img v-if="item.type==='image'" :src="item.url" :alt="item.name" />
              <video v-else controls :src="item.url" />
              <div class="media-name">{{ item.name }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="其他文件" name="files">
          <el-table :data="mockFiles" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="date" label="上传时间" width="180" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="文件" name="docs">
          <div class="file-list">
            <div v-for="file in mockDocs" :key="file.id" class="file-item">
              <el-icon class="file-icon">
                <component :is="file.icon" />
              </el-icon>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-meta">{{ file.size }} · {{ file.date }}</div>
              </div>
           
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="PDF" name="pdf">
          <div class="pdf-view">
            <el-empty description="PDF预览占位" />
          </div>
        </el-tab-pane>
      </el-tabs>
  
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { Document, Folder, Files, Collection } from '@element-plus/icons-vue';
import ResourceInput from '@/components/form/ResourceInput.vue';
const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(['close']);

const activeTab = ref('media');

// 模拟数据
const mockMedia = [
  { id: 1, type: 'image', name: '风景1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300' },
  { id: 2, type: 'image', name: '风景2', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=300' },
  { id: 3, type: 'video', name: '短视频', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];
const mockFiles = [
  { name: '文档.docx', size: '24KB', date: '2024-05-01' },
  { name: '数据表.xlsx', size: '12KB', date: '2024-05-02' },
  { name: '压缩包.zip', size: '2MB', date: '2024-05-03' }
];
const mockDocs = [
  { id: 1, name: '项目计划.md', size: '8KB', date: '2024-05-04', icon: Document },
  { id: 2, name: '会议记录.pdf', size: '1.2MB', date: '2024-05-05', icon: Files },
  { id: 3, name: '产品手册.pdf', size: '2.1MB', date: '2024-05-06', icon: Collection },
  { id: 4, name: '素材包.zip', size: '5MB', date: '2024-05-07', icon: Folder }
];
</script>

<style scoped>
.resource-drawer {
  background: #fff;
  border-radius: 0 0 18px 18px;
  box-shadow: 0 8px 32px 0 rgba(60,60,60,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.04);
  margin-top: 0;
  padding: 40px 48px 28px 48px;
  position: relative;
  z-index: 20;
  min-height: 420px;
  max-height: 600px;
  animation: slideDown 0.3s cubic-bezier(.4,0,.2,1);
  overflow-y: auto;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-16px);}
  to { opacity: 1; transform: translateY(0);}
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
.resource-tabs {
  margin-bottom: 18px;
}
.media-grid {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}
.media-item {
  width: 140px;
  text-align: center;
}
.media-item img, .media-item video {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(60,60,60,0.08);
  margin-bottom: 8px;
}
.media-name {
  font-size: 14px;
  margin-top: 2px;
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}
.file-item {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px 20px;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06);
  gap: 16px;
  transition: box-shadow 0.18s;
}
.file-item:hover {
  box-shadow: 0 4px 16px rgba(60,60,60,0.13);
}
.file-icon {
  font-size: 28px;
  color: #5371f7;
  margin-right: 8px;
}
.file-info {
  flex: 1;
  min-width: 0;
}
.file-name {
  font-size: 1.08rem;
  font-weight: 500;
  color: #222;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-meta {
  font-size: 13px;
  color: #888;
}

/* 强制覆盖 el-plus 组件的背景和主要色彩为日间风格 */
:deep(.el-tabs__nav),
:deep(.el-tabs__item),
:deep(.el-tabs__content),
:deep(.el-tab-pane),
:deep(.el-card),
:deep(.el-table),
:deep(.el-table__body),
:deep(.el-table__header),
:deep(.el-table th),
:deep(.el-table td),
:deep(.el-empty),
:deep(.el-table__row) {
  background: #fff !important;
  color: #222 !important;
}
:deep(.el-tabs__item.is-active) {
  color: #5371f7 !important;
}
:deep(.el-tabs__active-bar) {
  background: #5371f7 !important;
}
:deep(.el-table__row:hover) td {
  background: #f7f8fa !important;
}
:deep(.el-card) {
  border-radius: 10px !important;
  box-shadow: 0 1px 4px rgba(60,60,60,0.06) !important;
}
:deep(.el-empty__description) {
  color: #888 !important;
}
</style>

