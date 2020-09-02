import React, { useRef, useEffect, useState } from 'react';
import echarts from 'echarts'

export const ReactEcharts = ({className = "", style={}, option = {}, ...rest}) => {
  const chartsEl = useRef(null)
  useEffect(() => {
    const instance = echarts.getInstanceByDom(chartsEl.current) || echarts.init(chartsEl.current);
    instance.setOption(option)
    return ()=>{
      echarts.dispose(instance)
    }
  },[option, chartsEl])
  return (
    <div
      ref={chartsEl}
      className={`react-echarts ${className}`}
      style={{height: '300px', width: "600px", ...style}}
      {...rest}
    ></div>
  )
}
