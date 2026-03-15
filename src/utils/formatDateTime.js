export const formatDateTime=(timestamp)=>{ //timestamp 是个 13 位的 JavaScript 时间戳
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 注意：JavaScript 中月份是从 0 开始的（0代表1月），所以要 +1
    const day = date.getDate();
    // 3. 拼接成 "年.月.日" 的格式
    return `${year}.${month}.${day}`;
    // return new Date(timestamp).toLocaleDateString() 
}