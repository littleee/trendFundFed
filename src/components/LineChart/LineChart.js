import React from 'react';
import ReactEcharts from 'echarts-for-react';

export const LineChart = ({option, showLoading = true}) => {
  const getLoadingOption = () => {
    return {
      text: '加载中...',
      // color: '#4413c2',
      // textColor: '#270240',
      // maskColor: 'rgba(194, 88, 86, 0.3)',
      zlevel: 0
    };
  };

  return(
    <ReactEcharts
      option={option}
      style={{height: '350px', width: '100%'}}
      className='react_for_echarts'
      showLoading={showLoading}
      loadingOption={getLoadingOption()}
    />
  )
}
