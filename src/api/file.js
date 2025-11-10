import request from '/src/utils/request.js'

export const fileUploadService = (formData)=>{
  return request.post('/user/upload',formData)
}
