// src/utils/debounce.js
/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数（最后要执行的那个）
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay) => {
  let timer = null;
  // 返回箭头函数作为防抖包装函数（...args接收所有入参）
  return (...args) => {
    if (timer) clearTimeout(timer); // 清除旧定时器，重置计时
    timer = setTimeout(() => {
      // 箭头函数无自身this，此处this继承自外层防抖包装函数的this：
      // 若防抖函数绑定到DOM事件（如input/click），this指向触发事件的DOM元素；
      // 若在Vue组件中使用，this指向组件实例（需结合实际调用场景）
      fn.apply(this, args); 
    }, delay);
  };
};