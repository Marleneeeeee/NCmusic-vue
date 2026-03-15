import axios from "axios";
// 配置后端地址
const BASE_URL="/api"
// 创建实例对象
const instance=axios.create({
    baseURL:BASE_URL,
    timeout:10000,
    withCredentials:true
    // 网络请求跨域的时候是否允许携带凭证（本次不需要处理跨域问题，已经解决掉了）
})

// 请求拦截器：可以统一添加token
instance.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
instance.interceptors.response.use(
    // 成功
    (respense)=>{
        // 假设后端返回:{code,data,message}
        const res=respense.data
        return res
    },
    (error)=>{
        // 处理全局错误 如：网络错误、401、未登录
        return Promise.reject(error)
    }
)

// 简单GET POST封装
export function get(url,params={},config={}){
    return instance.get(url,{params,...config})
}
export function post(url,params={},config={}){
    return instance.post(url,params,config)
}
const api={
    get,
    post
}
export default api