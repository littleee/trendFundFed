import React, { useEffect, useState } from 'react';
import { Layout, Row, Divider, Card, Typography, Col, Table, Tag } from 'antd';
import axios from 'axios';
import echarts from 'echarts'
import cn from 'classnames'
import { useParams } from 'react-router-dom';
import styled from "styled-components";
import dayjs from 'dayjs';
import { getNumberColor, getNumberFormat, getDataByDayFormat, getRunDays, getIncomeRate, getNumberWithDecimal } from '../../utils';
import { Statistic, LineChart } from '../../components';

const { Text } = Typography;
const { Content } = Layout;

export const T1Component = ({className}) => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);
  const [t1Data, setT1Data] = useState([]);
  const [handleData, setHandleData] = useState([]);
  const [personData, setPersonData] = useState([]);
  const [dw, setDw] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useParams();

  useEffect(()=> {
    const fetchCharts = async () => {
    const [{data: t1}, {data:handleBtc}, {data: person}, {data: dwData}] = await Promise.all([
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1/main.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1/main.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1/dw.json`)
    ]);
    setT1Data(t1);
    setPersonData(person);
    setHandleData(handleBtc);
    setDw([...dwData].reverse().map((item,i) => {
      return {
        ...item,
        key: i
      }
    }))
    const startPriceByHandle = handleBtc[0][1]
    const startPriceByT1 = t1[0][1];
    const t1Income = t1.map(x=>[x[0] * 1000 - 24 * 60 * 60 * 1000, Math.floor((x[1]/startPriceByT1 - 1) * 10000)/100]);
    const handleIncome = handleBtc.map(x=>[x[0] * 1000 - 24 * 60 * 60 * 1000, Math.floor((x[1]/startPriceByHandle - 1) * 10000)/100]);
    setT1Income(getDataByDayFormat(t1Income));
    setHandleIncome(getDataByDayFormat(handleIncome))
    setIsLoading(false);
  };

  fetchCharts();
  }, [user])

  const option = {
      title: {
        text: '收益曲线',
      },
      tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const date = new Date(params[0].data[0]);
            const dateFormat = echarts.format.formatTime("yyyy-MM-dd hh:mm:ss", date)
            var returnHtmT1 = params[0] ? `${params[0].data[1]}%` : '--';
            var returnHtmlBTC = params[1] ? `${params[1].data[1]}%` : '--';
            return `<span>${dateFormat}</span><br/><span>本策略：${returnHtmT1}</span> <br/> <span>BTCUSD: ${returnHtmlBTC}</span>`;
          },
      },
      legend: {
        data: [{
          name: '本策略',
          // 强制设置图形为圆。
          icon: 'circle',
        },
        {
          name: 'BTCUSD',
          // 强制设置图形为圆。
          icon: 'circle',
        }],
        formatter: (name) => {
          const value = name === '本策略' ? t1Income : handleIncome;
          return value.length === 0 ? `${name} +0.00%` : `${name} ${getNumberFormat(value[value.length -1][1])}%`
        },
        right: 0,
        top: 3
      },
      grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
      },

      xAxis: {
          type: 'time',
      },
      yAxis: {
          type: 'value',
          axisLabel: {
             show:true,
             formatter:'{value}%'
          },
      },
      series: [
          {
              name: '本策略',
              type: 'line',
              data: t1Income,
              itemStyle: {
                color: '#ED662C'
              },
              showSymbol: false,
              hoverAnimation: true,
          },
          {
              name: 'BTCUSD',
              type: 'line',
              data: handleIncome,
              itemStyle: {
                color: '#50B7F9'
              },
              showSymbol: false,
              hoverAnimation: true,
          },
      ]
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    // {
    //   title: '份额',
    //   dataIndex: 'share',
    //   key: 'share',
    // },
    {
      title: '市值',
      dataIndex: 'marketValue',
      key: 'marketValue',
      render: (text, row, index) => {
        const { value, share } = row
        const result = value * share;
        return isNaN(result) ? '--' : getNumberWithDecimal(result,1).toLocaleString()
      }
    },
    {
      title: '收益额',
      dataIndex: 'incomeValue',
      key: 'incomeValue',
      render: text => {
        return (<span className={getNumberColor(text)}>{getNumberFormat(text)}</span>)
      }
    }
  ]

  const columnsExchangeDetails = [
    {
      title: '日期',
      dataIndex: 'datetime',
      key: 'datetime',
    },
    {
      title: '金额',
      dataIndex: 'Value',
      key: 'Value',
      render: (text, row, index) => {
        const { price, amount } = row
        const result = Number(price) * Number(amount);
        return <span className={getNumberColor(result)}>{isNaN(result) ? '--' : getNumberFormat(getNumberWithDecimal(result, 1))}</span>
      }
    }
  ]

  const columnsT1 = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '净值',
      dataIndex: 'value',
      key: 'value',
      render: text => text
    },
    {
      title: '日涨幅',
      dataIndex: 'incomeRate',
      key: 'incomeRate',
      render: text => {
        return (<span className={getNumberColor(text)}>{getNumberFormat(text)}%</span>)
      }
    },
  ]

  const dataSource = data => {
    if(data.length > 0){
      const result = data.reduce((acc, curr, index, arr) => {
        const obj = {
          date: dayjs(curr[0] * 1000).format('YYYY-MM-DD'),
          value: index === 0 ? '--' : getNumberWithDecimal(arr[index-1][1], 4),
          cost: curr[2],
          share: getNumberWithDecimal(curr[3], 0),
          key:curr[0],
          incomeRate: index !== 0 ? `${getNumberWithDecimal((arr[index - 1][1] / curr[1] - 1) * 100, 2)}` : '--',
          incomeValue: index !== 0 ? `${getNumberWithDecimal(arr[index - 1][4] - curr[4], 1)}` : '--',
        }
        return [...acc, obj]
      },[])
      return result;
    } else {
      return []
    }
  }
  const getLastestDataHandleValue = (data) => {
    const len = data.length;
    return len > 0 ? getNumberWithDecimal(data[len-1][1], 4) * getNumberWithDecimal(data[len-1][3], 0) : 0
  }
  const getLastestDataCost = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][2] : 0
  }
  const getLastestDataShare = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][3] : 0
  }

  const t1IncomeRate = getIncomeRate(t1Data);
  const personIncomeRate = getIncomeRate(personData);

  return (
    <Layout className={className}>
      <Divider className="divider"/>
      <Content>
        <Row className="content" gutter={24}>
        <Col sm={24} xs={24} className="content-left">
          <Card className="card">
          <Row className="card-title-wrapper">
            <Col sm={6} xs={12}><Text className="card-title">T1 趋势跟踪策略</Text></Col>
            <Col sm={18} xs={12} style={{textAlign: 'right'}}>
              <Tag color="green">运行中</Tag>
            </Col>
          </Row>
            <Row className="p-24">
              <Col sm={8} xs={12}>
                 <Statistic title="成立以来收益" value={t1IncomeRate} precision={2} suffix='%' isNormal={false}/>
              </Col>
              <Col sm={8} xs={12}>
                <Statistic
                  title={`最新净值（${t1Data.length > 0 ? dayjs(t1Data[t1Data.length - 1][0] * 1000).format('MM-DD') : '--'}）`}
                  value={t1Data.length > 0 ? t1Data[t1Data.length - 1][1] : 0}
                  precision={4}
                  suffix='USD'
                />
              </Col>
              <Col sm={8} xs={24}>
                <Statistic
                  title='昨日涨跌'
                  value={getIncomeRate(t1Data, 1)}
                  precision={2}
                  suffix='%'
                  isNormal={false}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={24} className="card-left">
              {
                <LineChart
                  option={option}
                  showLoading={isLoading}
                />
              }
              </Col>
            </Row>
            <Row className="p-24">
              <Col sm={6}  xs={12}>
                <Statistic
                  title='近1月涨跌'
                  value={getIncomeRate(t1Data, 30)}
                  precision={2}
                  suffix='%'
                  isNormal={false}
                />
              </Col>
              <Col sm={6} xs={12}>
              <Statistic
                title='近3月涨跌'
                value={getIncomeRate(t1Data, 90)}
                precision={2}
                suffix='%'
                isNormal={false}
              />
              </Col>
              <Col sm={6} xs={12}>
              <Statistic
                title='运行天数'
                value={getRunDays(t1Data)}
                precision={0}
              />
              </Col>
              <Col sm={6} x={12}>
              <Statistic
                title='交易标的'
                value='BTCUSD 永续合约'
                precision={0}
              />
              </Col>
            </Row>
          </Card>

          <Card className="card m-t-24 m-b-24">
            <Row className="card-title-wrapper">
              <div className="title-wrapper-left">
              <Text className="card-title">历史净值</Text>
              </div>
            </Row>
            <Table columns={columnsT1} dataSource={dataSource([...t1Data].reverse())} />
          </Card>
        </Col>
        </Row>

      </Content>
    </Layout>
  )
}

export const T1 = styled(T1Component)`
.p-24 {
  padding: 24px;
}
.m-t-24 {
  margin-top: 24px;
}
.m-b-24 {
  margin-bottom: 24px;
}
.divider {
  border-color: #000;
  opacity:0.8;
  margin: 0;
}
.content {
  padding-top: 40px;
  max-width: 1120px;
  margin: 0 auto!important;
  .content-right {

  }
  .card {
    width: 100%;
    border-radius: 6px;
    box-shadow:0px 6px 13px 0px rgba(0, 0, 0, 0.03);
    border-radius:6px;
    .card-title-wrapper {
      border-bottom: 1px solid rgba(0,0,0,0.1);
      padding: 15px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-title {
      font-size:18px;
      font-family:PingFang SC;
      font-weight:400;
      color:rgba(19,24,31,1);
      padding-right: 6px;
    }
  }
}

.card .title-wrapper-left {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ant-card-body {
  padding: 0;
}
.card-left {
  padding: 0 20px;
}
.card-right {
  padding: 0 20px;
  border-left: 1px solid rgba(0, 0, 0, .1);
  display: flex;
  align-items: center;
}

.card-right-title {
  font-size:14px;
  font-family:PingFang SC;
  font-weight:400;
  color:rgba(19,24,31,1);
  opacity:0.4;
  margin: 0;
}

.more {
  font-size:14px;
  font-family:PingFang SC;
  font-weight:400;
  color:rgba(19,24,31,1);
  opacity:0.6;
  margin: 80px auto;
  text-align: center;
}

.card-right-content {
  font-size:18px;
  font-family:PingFang SC;
  font-weight:600;
}
.green {
  color: #3f8600;
}
.red {
  color: #cf1322;
}
.grey {
  color:rgba(19,24,31, 0.6);
}
@media (max-width: 375px){
  .card-left {
    padding: 0;
  }
}
`
