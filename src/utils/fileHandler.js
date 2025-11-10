import { fileUploadService } from '@/api/file';

/**
 * 上传图片文件
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<{url: string, data: any}>}
 */
export async function uploadImageFile(file) {
  if (!file) throw new Error('未选择文件');
  const formData = new FormData();
  formData.append('file', file);
  // fileUploadService 返回 { data: { url: ... } }
  const res = await fileUploadService(formData);
  if (res && res.code === 200) {
    // 如果返回的是直接的URL字符串
    if (typeof res.data === 'string') {
      return { url: res.data, data: res.data };
    }
    // 如果返回的是对象包含url字段
    if (res.data && res.data.url) {
      return { url: res.data.url, data: res.data };
    }
    // 如果返回的是其他格式，直接返回data
    return { url: res.data, data: res.data };
  } else {
    throw new Error(res?.msg || '上传失败');
  }
} 