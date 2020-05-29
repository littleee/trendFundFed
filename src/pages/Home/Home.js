import React, { useEffect, useState } from 'react';
import footerIcon from './footer.png';
import bannerIcon from './banner.png';
import { Layout, Row, Divider, Card, Typography, Col } from 'antd';
import { BannerAnimation } from '../../components/BannerAnimation';
import { LineChart } from '../../components/LineChart';
import axios from 'axios';
import echarts from 'echarts'
import cn from 'classnames'
import styled from "styled-components";
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getNumberColor, getNumberFormat } from '../../utils';

const { Text } = Typography;
const { Content, Footer } = Layout;


const HomeComponent = ({className}) => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);
  const [t1Data, setT1Data] = useState([]);
  const [handleData, setHandleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(()=> {
    const fetchCharts = async () => {
    const [{data: t1}, {data:handleBtc}] = await Promise.all([
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`)
    ]);
    setT1Data(t1);
    setHandleData(handleBtc);
    const startPriceByT1 = t1[0][1];
    const startPriceByHandle = handleBtc[0][1]
    const t1Income = t1.map(x=>[x[0] * 1000, ((x[1]/startPriceByT1 - 1) * 100).toFixed(4)]);
    const handleIncome = handleBtc.map(x=>[x[0] * 1000, ((x[1]/startPriceByHandle - 1) * 100).toFixed(4)]);
    setT1Income(t1Income);
    setHandleIncome(handleIncome)
    setIsLoading(false)
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
            return `<span>${dateFormat}</span><br/><span>本策略： ${returnHtmT1}</span> <br/> <span>BTCUSD：  ${returnHtmlBTC}</span>`;
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
        formatter: (name) =>{
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
          splitLine: {
            show: false
          }
      },
      yAxis: {
          type: 'value',
          axisLabel: {
             show:true,
             formatter:'{value} %'
          },
          splitLine: {
            show: true
          }
      },
      series: [
          {
              name: '本策略',
              type: 'line',
              data: t1Income,
              showSymbol: false,
              hoverAnimation: true,
              itemStyle: {
                color: '#ED662C'
              }
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

  const getIncomeSinceStart = (start, end) => {
    const income = (end / start - 1) * 100;

    return income
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

  const getRunDays = () => {
    if(t1Data.length > 0){
      const start = t1Data[0][0];
      const end = t1Data[t1Data.length - 1][0]
      const runDays = (end - start) / (24 * 60 * 60);
      return Math.ceil(runDays)
    }
    return  '--'
  }
  return (
    <Layout className={className}>
      <Divider className="divider"/>
      <Content>
        <Row className="banner">
          <div className="title-wrapper">
            <p className="title">趋势中的数字黄金</p>
            <p className="sub-title">加密货币CTA策略</p>
          </div>
        </Row>
        <Row className="content">
          <Card className="card">
            <Row className="card-title-wrapper">
              <Col sm={4} xs={24}><Text className="card-title">T1 趋势跟踪策略</Text></Col>
              <Col sm={20} xs={24} style={{textAlign: 'right'}}>
                <Text className="card-subtitle">运行中</Text>
              </Col>
              <div>
              {
                params.action && <a href={`/#/details/${params.action}`}>策略详情></a>
              }
              </div>
            </Row>
            <Row style = {{padding: '20px 0'}} >
              <Col sm={16} xs={24} className="card-left">
              {
                <LineChart
                  option={option}
                  showLoading={isLoading}
                />
              }
              </Col>
              <Col sm={8} xs={24} className="card-right">
                <div style={{width: '100%'}}>
                <Row>
                  <Col xs={12}>
                    <p className="card-right-title">成立以来收益</p>
                    <p className={`card-right-content size-30 ${getNumberColor(t1Data.length > 0 ? getIncomeSinceStart(t1Data[0][1], t1Data[t1Data.length - 1][1]).toFixed(4) : 0)}`}>{t1Data.length > 0 ? `${getNumberFormat(getIncomeSinceStart(t1Data[0][1], t1Data[t1Data.length - 1][1]).toFixed(4))} % `: '0 %'}</p>
                  </Col>
                  <Col xs={12}>
                    <p className="card-right-title">最新净值 ({t1Data.length > 0 ? dayjs(t1Data[t1Data.length - 1][0] * 1000).format('MM-DD') : '--'}）</p>
                    <p className="card-right-content"><span className="size-30">{t1Data.length > 0 ? t1Data[t1Data.length - 1][1].toFixed(4) : '--'}</span> <span className="grey">USD</span></p>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8}>
                    <p className="card-right-title">24H涨跌</p>
                    <p className={cn('card-right-content', getNumberColor(getIncomeByTimes(1)))}>{getNumberFormat(getIncomeByTimes(1).toFixed(4))} %</p>
                  </Col>
                  <Col xs={8}>
                  <p className="card-right-title">近1月涨跌</p>
                  <p className={cn('card-right-content', getNumberColor(getIncomeByTimes(30)))}>{getNumberFormat(getIncomeByTimes(30).toFixed(4))} %</p>
                  </Col>
                  <Col xs={8}>
                  <p className="card-right-title">近3月涨跌</p>
                  <p className={cn('card-right-content', getNumberColor(getIncomeByTimes(90)))}>{getNumberFormat(getIncomeByTimes(90).toFixed(4))} %</p>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8}>
                    <p className="card-right-title">运行天数</p>
                    <p className="card-right-content">{getRunDays()}</p>
                  </Col>
                  <Col xs={16}>
                    <p className="card-right-title">交易标的</p>
                    <p className="card-right-content">BTCUSD 永续合约</p>
                  </Col>
                </Row>
                </div>
              </Col>
            </Row>
          </Card>
        </Row>

        <p className="more">更多产品 敬请期待</p>
      </Content>
      <Footer className="footer">
        <p className="footer-title">关于 TrendFund</p>
        <p className="footer-subtitle">TrendFund 成立于2017年，专注于加密资产的量化交易研究。团队成员均为业内顶尖产品经理、分析师、交易员、工程师等。</p>
        <img className="footer-icon" src={footerIcon} alt="footer details" draggable="false" />
      </Footer>
    </Layout>
  )
}

 export const Home = styled(HomeComponent)`
  .divider {
    border-color: #000;
    opacity:0.8;
    margin: 0;
  }

  .banner {
    height: 380px;
    background: rgb(14,16,20);
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url(${bannerIcon});
    background-position: 50%;
    background-size: contain;
    background-repeat: no-repeat;
  }

  .title-wrapper {
    color: #fff;
    margin-top: -60px;
  }

  .title-wrapper .title {
    font-size:36px;
    font-family: PingFang SC;
    font-weight: 200;
    color:rgba(255,255,255,1);
    margin-bottom: 17px;
    text-align: center;
  }

  .title-wrapper .sub-title {
    font-size:16px;
    font-family:PingFang SC;
    font-weight: 200;
    color:rgba(255,255,255,1);
    text-align: center;
  }

  .card {
    max-width: 1120px;
    width: 100%;
    border-radius: 6px;
    margin: -64px auto 0 auto;
    box-shadow:0px 6px 13px 0px rgba(0, 0, 0, 0.03);
    border-radius:6px;
  }

  .card .card-title-wrapper {
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding: 15px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card .card-title {
    font-size:18px;
    font-family:PingFang SC;
    font-weight:400;
    color:rgba(19,24,31,1);
    padding-right: 6px;
  }

  .card .card-subtitle {
    border: 1px solid rgba(18,186,46,1);
    border-radius: 3px;
    font-size:12px;
    font-family:PingFang SC;
    font-weight:400;
    color:rgba(18,186,46,1);
    padding: 2px 6px;
    margin: 0 6px;
  }

  .ant-card-body {
    padding: 0;
  }
  .card-left {
    padding: 0 20px;
    margin-bottom: 20px;
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

  .footer {
    background: rgb(14,16,20);
    text-align: center;
  }
  .footer-title {
    font-size:18px;
    font-family:PingFang SC;
    font-weight:400;
    color:rgba(255,255,255,1);
  }

  .footer-subtitle {
    font-size:14px;
    font-family:PingFang SC;
    font-weight:400;
    color:rgba(255,255,255,1);
    opacity:0.6;
    margin-bottom: 60px;
  }

  .footer-icon {
    width: 100%;
    max-width: 412px;
    margin-bottom: 108px;
  }

  @media (max-width: 375px){
    .banner {
      background-size: cover;
    }
  }
`
