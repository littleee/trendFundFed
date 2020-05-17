import React from 'react';
import ReactEcharts from 'echarts-for-react';

export const LineChart = ({option}) => {
  return(
    <ReactEcharts
      option={option}
      style={{height: '350px', width: '100%'}}
      className='react_for_echarts' />
  )
}
