export const formatCount=(cnt)=>{
    if(cnt<10000){
        return cnt+' '
    }
    else if(cnt<100000000){
        return Number((cnt/10000).toFixed(1))+' 万'
    }
    else{
        return Number((cnt/100000000).toFixed(1))+' 亿'
    }
}