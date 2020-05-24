import React, { useEffect, useState } from 'react';
import { Layout, Row, Divider, Card, Typography, Col, Table } from 'antd';
import { BannerAnimation } from '../../components/BannerAnimation';
import { LineChart } from '../../components/LineChart';
import axios from 'axios';
import echarts from 'echarts'
import cn from 'classnames'
import { useParams } from 'react-router-dom';
import styled from "styled-components";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

export const DetailsComponent = ({className}) => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);
  const [t1Data, setT1Data] = useState([]);
  const [handleData, setHandleData] = useState([]);
  const [personData, setPersonData] = useState([]);
  const { user } = useParams();

  useEffect(()=> {
    const fetchCharts = async () => {
    const [{data: t1}, {data:handleBtc}, {data: person}] = await Promise.all([
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/${user}.json`)
    ]);
    setT1Data(t1);
    setPersonData(person);
    setHandleData(handleBtc);
    const startPriceByT1 = t1[0][1];
    const startPriceByHandle = handleBtc[0][1]
    const t1Income = t1.map(x=>[x[0] * 1000, ((x[1]/startPriceByT1 - 1) * 100).toFixed(4)]);
    const handleIncome = handleBtc.map(x=>[x[0] * 1000, ((x[1]/startPriceByHandle - 1) * 100).toFixed(4)]);
    setT1Income(t1Income);
    setHandleIncome(handleIncome)
  };

  fetchCharts();
  }, [])

  const option = {
      title: {
          text: '收益曲线'
      },
      tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const date = new Date(params[0].data[0]);
            const dateFormat = echarts.format.formatTime("yyyy-MM-dd hh:mm:ss", date)
            var returnHtmT1 = `${params[0].data[1]} %`;
            var returnHtmlBTC = `${params[1].data[1]} %`;
            return `<span>${dateFormat}</span><br/><span>${returnHtmT1}</span> <br/> <span>${returnHtmlBTC}</span>`;
          },
      },
      legend: {
        data: [{
          name: '本产品',
          // 强制设置图形为圆。
          icon: 'circle',
        },
        {
          name: '持有BTC',
          // 强制设置图形为圆。
          icon: 'circle',
        }],
        formatter: (name) =>{
          const value = name === '本产品' ? t1Income : handleIncome;
          return value.length === 0 ? `${name} +0.00%` : `${name} +${value[value.length -1][1]}%`
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
             formatter:'{value} %'
          },
      },
      series: [
          {
              name: '本产品',
              type: 'line',
              data: t1Income,
              itemStyle: {
                color: '#ED662C'
              }
          },
          {
              name: '持有BTC',
              type: 'line',
              data: handleIncome,
              itemStyle: {
                color: '#50B7F9'
              }
          },
      ]
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '份额',
      dataIndex: 'share',
      key: 'share',
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost',
    },
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
    },
    {
      title: '日涨幅',
      dataIndex: 'incomeRate',
      key: 'incomeRate',
    },
  ]

  const dataSource = fn => x => {
    const data = fn(x);
    if(data.length > 0){
      const result = data.reverse().reduce((acc, curr, index, arr) => {

        const obj = {
          date: dayjs(curr[0] * 1000).format('YYYY-MM-DD'),
          value: curr[1],
          cost: curr[2],
          share: curr[3].toFixed(0),
          key:curr[0],
          incomeRate: index !== arr.length-1 ? `${((curr[1] / arr[index + 1][1] - 1) * 100).toFixed(4)} %` : '0 %'
        }
        return [...acc, obj]
      },[])
      return result;
    } else {
      return []
    }
  }

  const getIncomeSinceStart = (start, end) => {
    const income = (end / start - 1) * 100;

    return income
  }

  const isUp = (num) => {
    return num >= 0 ? true : false
  }

  const getIncomeByTimes = (days) => {
    const timeByDays = 24 * 60 * 60 * days
    if(t1Income.length > 0){
      const currentTime = t1Data[t1Data.length - 1][0];
      const startTime = currentTime - timeByDays;
      if(t1Data.filter(x => x[0] === startTime).length === 0){
        return t1Data.length > 0 ? getIncomeSinceStart(t1Data[0][1], t1Data[t1Data.length - 1][1]) : 0
      } else {
        const end = t1Data.find(x => x[0] === currentTime)[1];
        const start = t1Data.find(x => x[0] === startTime)[1];
        return getIncomeSinceStart(start, end)
      }
    }
    return 0
  }
  const getPersonIncomeByTimes = (days) => {
    const timeByDays = 24 * 60 * 60 * days
    if(t1Income.length > 0){
      const currentTime = personData[personData.length - 1][0];
      const startTime = currentTime - timeByDays;
      if(personData.filter(x => x[0] === startTime).length === 0){
        return personData.length > 0 ? getIncomeSinceStart(personData[0][1], personData[personData.length - 1][1]) : 0
      } else {
        const end = personData.find(x => x[0] === currentTime)[1];
        const start = personData.find(x => x[0] === startTime)[1];
        return getIncomeSinceStart(start, end)
      }
    }
    return 0
  }

  const getRunDays = () => {
    if(t1Data.length > 0){
      const start = t1Data[0][0];
      const end = t1Data[t1Data.length - 1][0]
      const runDays = (end - start) / (24 * 60 * 60);
      return Math.ceil(runDays)
    }
  }

  const getLastestDataHandleValue = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][1] * data[len-1][3] : 0
  }
  const getLastestDataValue = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][1] : 0
  }
  const getLastestDataCost = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][2] : 0
  }
  const getLastestDataShare = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][3] : 0
  }
  const getIncomeRate = data => data.length > 0 ? (t1Data[t1Data.length -1][1] / t1Data[t1Data.length -1][2] - 1) : 0

  const getDataWith8Hour = (data) => data.length > 0 ? data.filter(x => new Date(x[0] * 1000).getHours() === 8) : []
  return (
    <Layout className={className}>
      <Divider className="divider"/>
      <Content>
        <Row className="content" gutter={16}>
        <Col sm={16} xs={24} className="content-left">
          <Card className="card">
            <Row className="card-title-wrapper">
              <div className="title-wrapper-left">
              <Text className="card-title">T1 趋势跟踪策略</Text>
              <Text className="card-subtitle">远超基准</Text>
              <Text className="card-subtitle">双向持仓</Text>
              <Text className="card-subtitle">超低杠杆</Text>
              </div>
            </Row>
            <Row>
              <Col sm={8}>
                <p className="card-right-title">成立以来收益</p>
                <p className="card-right-content green size-30">{`${(getIncomeRate(t1Data) * 100).toFixed(4)} % `}</p>
              </Col>
              <Col sm={8}>
                <p className="card-right-title">最新净值（05-10）</p>
                <p className="card-right-content"><span className="size-30">{t1Data.length > 0  && t1Data[t1Data.length - 1][1].toFixed(4)}</span> <span className="grey">USD</span></p>
              </Col>
              <Col sm={8}>
                <p className="card-right-title">24H涨跌</p>
                <p className={cn('card-right-content', isUp(getIncomeByTimes(1)) ? 'green' : 'red')}><span className="size-30">{getIncomeByTimes(1).toFixed(4)} %</span></p>
              </Col>
            </Row>
            <Row>
              <Col xs={24} className="card-left">
              {
                <LineChart
                  option={option}
                />
              }
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
              <p className="card-right-title">近1月涨跌</p>
              <p className={cn('card-right-content', isUp(getIncomeByTimes(30)) ? 'green' : 'red')}>{getIncomeByTimes(30).toFixed(4)} %</p>
              </Col>
              <Col sm={6}>
              <p className="card-right-title">近3月涨跌</p>
              <p className={cn('card-right-content', isUp(getIncomeByTimes(90)) ? 'green' : 'red')}>{getIncomeByTimes(90).toFixed(4)} %</p>
              </Col>
              <Col sm={6}>
                <p className="card-right-title">运行天数</p>
                <p className="card-right-content">{getRunDays()}</p>
              </Col>
              <Col sm={6}>
                <p className="card-right-title">交易标的</p>
                <p className="card-right-content">BitMEX XBTUSD</p>
              </Col>
            </Row>
          </Card>

          <Card className="card m-t-24">
            <Row className="card-title-wrapper">
              <div className="title-wrapper-left">
              <Text className="card-title">历史净值</Text>
              </div>
            </Row>
            <Table columns={columnsT1} dataSource={dataSource(getDataWith8Hour)(t1Data)} />
          </Card>
        </Col>
        <Col sm={8} xs={24} className="content-right">
        <Card className="card">
        <Row className="card-title-wrapper">
          <div className="title-wrapper-left">
          <Text className="card-title">{user} 的持仓</Text>
          </div>
        </Row>
        <Row>
          <Col sm={12}>
            <p className="card-right-title">持仓市值</p>
            <p className="card-right-content"><span className="size-30">{getLastestDataHandleValue(personData).toFixed(0)}</span></p>
          </Col>
          <Col sm={12}>
            <p className="card-right-title">持仓收益</p>
            <p className={cn('card-right-content', isUp(getIncomeRate(personData)) ? 'green' : 'red')}><span className="size-30">{`${(getIncomeRate(personData) * 100).toFixed(4)} % `}</span></p>
          </Col>
          <Col sm={12}>
            <p className="card-right-title">持仓份额</p>
            <p className={cn('card-right-content')}><span className="size-30">{getLastestDataShare(personData).toFixed(0)}</span></p>
          </Col>
          <Col sm={12}>
            <p className="card-right-title">持仓成本</p>
            <p className={cn('card-right-content')}><span className="size-30">{getLastestDataCost(personData)}</span></p>
          </Col>
        </Row>
        <Table columns={columns} dataSource={dataSource(getDataWith8Hour)(personData)} />
        </Card>
        </Col>
        </Row>

      </Content>
    </Layout>
  )
}

export const Details = styled(DetailsComponent)`
.m-t-24 {
  margin-top: 24px;
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
    .card-subtitle {
      border: 1px solid rgba(0, 0, 0, 0.3);
      border-radius: 3px;
      font-size:12px;
      font-family:PingFang SC;
      font-weight:400;
      color:rgba(19,24,31,0.6);
      padding: 2px 6px;
      margin: 0 6px;
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
  color:rgba(18,186,46,1);
}
.red {
  color:rgba(214,85,55,1);
}
.size-30 {
  font-size: 30px;
}
.grey {
  color:rgba(19,24,31, 0.6);
}
`
