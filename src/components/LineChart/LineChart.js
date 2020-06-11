import React from "react";
import ReactEcharts from "echarts-for-react";

export const LineChart = ({ option, showLoading = true }) => {
  const getLoadingOption = () => {
    return {
      text: "加载中...",
      color: "rgb(74,151,247)",
      // textColor: '#270240',
      // maskColor: 'rgba(194, 88, 86, 0.3)',
      zlevel: 0,
    };
  };

  return (
    <ReactEcharts
      option={option}
      style={{ height: "350px", width: "100%" }}
      showLoading={showLoading}
      loadingOption={getLoadingOption()}
    />
  );
};
