import React from 'react';
import { Statistic as StatisticAntd } from 'antd';
import { isNumberGreaterThanZero } from '../../utils';

export const Statistic = ({ title='title', value=0, percision=2, isNormal=true, ...props }) => {
  const getColor = type => {
    if(type){
      return '#000'
    }
    return value >= 0 ? '#3f8600' : '#cf1322'
  }
  return (
    <StatisticAntd
      title={title}
      value={value}
      precision={percision}
      valueStyle={{ color: getColor(isNormal), fontWeight: 600}}
      prefix={!isNormal && isNumberGreaterThanZero(value) ? '+' : ''}
      {...props}
    />
  )
}
