import React, { useRef, useEffect } from "react";
import echarts from "echarts";
import useResizeObserver from "@react-hook/resize-observer";

export const ReactEcharts = ({
  className = "",
  style = {},
  option = {},
  ...rest
}) => {
  const chartsEl = useRef(null);
  useEffect(() => {
    const instance =
      echarts.getInstanceByDom(chartsEl.current) ||
      echarts.init(chartsEl.current);
    instance.setOption(option);
    return () => {
      echarts.dispose(instance);
    };
  }, [option, chartsEl]);

  useResizeObserver(chartsEl, (entry) => {
    const instance =
      echarts.getInstanceByDom(chartsEl.current) ||
      echarts.init(chartsEl.current);
    instance.resize();
  });
  return (
    <div
      ref={chartsEl}
      className={`react-echarts ${className}`}
      style={{ height: "300px", width: "600px", ...style }}
      {...rest}
    ></div>
  );
};
