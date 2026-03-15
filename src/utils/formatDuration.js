// 格式化时间
export const formatDuration=(ms)=>{
    if(!ms||!Number.isFinite(ms)) return '00:00'
    const s=Math.floor(ms/1000)
    const m=Math.floor(s/60)
    const rs=s%60
    const mm=m.toString().padStart(2,'0')
    const ss=rs.toString().padStart(2,'0')
    return `${mm}:${ss}`
}