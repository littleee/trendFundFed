import React, { useEffect, useState } from 'react';
import './Home.css';
import footerIcon from './footer.png';
import { Layout, Row, Divider, Card, Typography, Col } from 'antd';
import { BannerAnimation } from '../../components/BannerAnimation';
import { LineChart } from '../../components/LineChart';
import axios from 'axios';
import echarts from 'echarts'

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

export const Home = () => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);

  useEffect(()=> {
    const fetchCharts = async () => {
    const [{data: t1}, {data:handleBtc}] = await Promise.all([
      axios.get(`https://raw.githubusercontent.com/imkgk/td/master/2020-04-22/short_margin_dollar.json`),
      axios.get(`https://raw.githubusercontent.com/imkgk/td/master/2020-04-22/price.json`)
    ]);
    console.log(t1, handleBtc)
    const startPriceByT1 = t1[0][1];
    const startPriceByHandle = handleBtc[0][1]
    const t1Income = t1.map(x=>[x[0], ((x[1]/startPriceByT1 - 1) * 100).toFixed(2)]);
    const handleIncome = handleBtc.map(x=>[x[0], ((x[1]/startPriceByHandle - 1) * 100).toFixed(2)]);
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
  return (
    <Layout>
      <Divider className="divider"/>
      <Content>
        <Row className="banner">
          <BannerAnimation />
          <div className="title-wrapper">
            <p className="title">趋势中的数字黄金</p>
            <p className="sub-title">加密货币CTA策略</p>
          </div>
        </Row>
        <Row className="content">
          <Card className="card">
            <Row className="card-title-wrapper">
              <div className="title-wrapper-left">
              <Text className="card-title">T1 趋势跟踪策略</Text>
              <Text className="card-subtitle">远超基准</Text>
              <Text className="card-subtitle">双向持仓</Text>
              <Text className="card-subtitle">超低杠杆</Text>
              </div>
              <div>
                <a href='/'>策略详情></a>
              </div>
            </Row>
            <Row style = {{padding: '20px 0'}} >
              <Col sm={16} xs={24} className="card-left">
              {
                <LineChart
                  option={option}
                />
              }
              </Col>
              <Col sm={8} xs={24} className="card-right">
                <div style={{width: '100%'}}>
                <Row>
                  <Col sm={12}>
                    <p className="card-right-title">成立以来收益</p>
                    <p className="card-right-content green size-30">1000%</p>
                  </Col>
                  <Col sm={12}>
                    <p className="card-right-title">最新净值（05-10）</p>
                    <p className="card-right-content"><span className="size-30">1.34</span> <span className="grey">USD</span></p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={8}>
                    <p className="card-right-title">日涨跌</p>
                    <p className="card-right-content green">+10%</p>
                  </Col>
                  <Col sm={8}>
                  <p className="card-right-title">近1月涨跌</p>
                  <p className="card-right-content red">-16.4%</p>
                  </Col>
                  <Col sm={8}>
                  <p className="card-right-title">近3月涨跌</p>
                  <p className="card-right-content red">-10.4%</p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={8}>
                    <p className="card-right-title">运行天数</p>
                    <p className="card-right-content">1234</p>
                  </Col>
                  <Col sm={16}>
                    <p className="card-right-title">交易标的</p>
                    <p className="card-right-content">BitMEX XBTUSD</p>
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
