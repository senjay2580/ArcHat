//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';

import ArcMessage from '@/utils/ArcMessage';
//定义一个变量,记录公共的前缀  ,  baseURL
//const baseURL = 'http://localhost:8080';
const baseURL = '/api/client';
const instance = axios.create({ baseURL })

import { useUserInfoStore } from '@/stores/user';
//添加请求拦截器
instance.interceptors.request.use(
    (config)=>{
        //请求前的回调
        //添加token
        const userInfoStore = useUserInfoStore();
        const token = userInfoStore.userInfo.token
        //判断有没有token，有就配置到请求config参数中
        if(token){
            config.headers.Authorization = token
            
            // 请求头就是Authorization
        }
    
        return config;
    },
    (err)=>{
        //请求错误的回调
        Promise.reject(err)
    }
)

// import {useRouter} from 'vue-router'
// const router = useRouter()
// useRouter 只能在 Vue 组件的上下文中使用，不能在普通的 JavaScript 文件或模块中使用 而router 在vue和js中都可以使用
import router from '@/router';
// 添加响应拦截器
instance.interceptors.response.use(
    result => {
        //判断业务状态码 后端的code
        if(result.data.code === 200){
            // console.log(result)
            return result.data;
        }

        //操作失败
        // alert(result.data.msg?result.data.msg:'服务异常')
        ArcMessage.error(result.data.msg?result.data.msg:'服务异常！！！！')
        console.log(result)

        //异步操作的状态转换为失败
        return Promise.reject(result.data)
        
    },
    err => {
        // 判断响应状态码,如果为401,则证明未登录,提示请登录,并跳转到登录页面
        if (err.response.status === 401) {
            // 如果当前界面在 /chat 就不要跳转到 login
            if (router.currentRoute.value.path !== '/chat') {
                router.push('/login')
            }
        } else if (err.response.status === 404) {
            router.push('/404NotFound')
        }
        else{
        }
       
        return Promise.reject(err);//异步的状态转化成失败的状态 
    }
)

export default instance;