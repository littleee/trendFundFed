import React, { useEffect, useState } from 'react';
import footerIcon from './footer.png';
import bannerIcon from './banner.png';
import { Layout, Row, Divider, Card, Typography, Col, Tag } from 'antd';
import axios from 'axios';
import echarts from 'echarts'
import cn from 'classnames'
import styled from "styled-components";
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getNumberColor, getNumberFormat, getDataByDayFormat, getRunDays, getIncomeRate } from '../../utils';
import { Statistic, LineChart } from '../../components';
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
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1/main.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`)
    ]);
    setT1Data(t1);
    setHandleData(handleBtc);
    const startPriceByT1 = t1[0][1];
    const startPriceByHandle = handleBtc[0][1]
    const t1Income = t1.map(x=>[x[0] * 1000 - 24 * 60 * 60 * 1000, Math.floor((x[1]/startPriceByT1 - 1) * 10000)/100]);
    const handleIncome = handleBtc.map(x=>[x[0] * 1000 - 24 * 60 * 60 * 1000, Math.floor((x[1]/startPriceByHandle - 1) * 10000)/100]);
    setT1Income(getDataByDayFormat(t1Income));
    setHandleIncome(getDataByDayFormat(handleIncome))
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
            var returnHtmT1 = `${params[0].data[1]}%`;
            var returnHtmlBTC = `${params[1].data[1]}%`;
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
             formatter:'{value}%'
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
                <Tag color="green">运行中</Tag>
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
                <Row style={{width: '100%'}}>
                  <Col xs={12}>
                    <Statistic title="成立以来收益" value={getIncomeRate(t1Data)} precision={2} suffix='%' isNormal={false}/>
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title={`最新净值（${t1Data.length > 0 ? dayjs(t1Data[t1Data.length - 1][0] * 1000).format('MM-DD') : '--'}）`}
                      value={t1Data.length > 0 ? t1Data[t1Data.length - 1][1] : 0}
                      precision={4}
                      suffix='USD'
                    />
                  </Col>
                </Row>
                <Row style={{width: '100%'}}>
                  <Col xs={8}>
                  <Statistic
                    title='昨日涨跌'
                    value={getIncomeRate(t1Data, 1)}
                    precision={2}
                    suffix='%'
                    isNormal={false}
                  />
                  </Col>
                  <Col xs={8}>
                  <Statistic
                    title='近1月涨跌'
                    value={getIncomeRate(t1Data, 30)}
                    precision={2}
                    suffix='%'
                    isNormal={false}
                  />
                  </Col>
                  <Col xs={8}>
                  <Statistic
                    title='近3月涨跌'
                    value={getIncomeRate(t1Data, 90)}
                    precision={2}
                    suffix='%'
                    isNormal={false}
                  />
                  </Col>
                </Row>
                <Row style={{width: '100%'}}>
                  <Col xs={8}>
                  <Statistic
                    title='运行天数'
                    value={getRunDays(t1Data)}
                    precision={0}
                  />
                  </Col>
                  <Col xs={16}>
                  <Statistic
                    title='交易标的'
                    value='BTCUSD 永续合约'
                    precision={0}
                  />
                  </Col>
                </Row>
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
    flex-direction: column;
    justify-content: space-around;
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
