// 解析歌词（格式化）
// export const parseLyric=(raw='')=>{
//     return raw.split('\n').map((line)=>line.trim()).filter((line)=>line).map((line)=>{
//         const text=line.replace(/^\[[^\]]*]/g,'').trim()
//         return text
//     }).filter((text)=>text)
// }
// src/utils/parseLyric.js
export const parseLyric = (raw = '') => {
    const lines = raw.split('\n');
    const result = [];
    // 匹配格式如 [00:02.88] 的正则
    const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    lines.forEach(line => {
        const match = timeExp.exec(line);
        if (match) {
            // 提取分钟、秒、毫秒
            const min = parseInt(match[1]);
            const sec = parseInt(match[2]);
            const ms = parseInt(match[3]);
            // 统一换算成秒 (注意 最后那个是百分秒还是毫秒)
            const time = min * 60 + sec + ms / (match[3].length === 3 ? 1000 : 100);
            // 替换掉时间标签，只剩下歌词文本
            const text = line.replace(timeExp, '').trim();
            // 有的 LRC 歌词会出现一行有多个时间戳的情况，例如：[00:10.00][00:20.00] 这一句歌词重复了两遍，
            // 所以正则表达式比match[0]更好（match[0]只能表示匹配到的第一个）
            if (text) {
                result.push({ time, text });
            }
        }
    });
    // 确保歌词是按时间顺序排好的
    return result.sort((a, b) => a.time - b.time);
};