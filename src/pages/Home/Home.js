import React from 'react';
import './Home.css';
import logo from './logo.png';
import { Layout, Row, Divider, Card, Typography, Col } from 'antd';
import { BannerAnimation } from '../../components/BannerAnimation';
import { LineChart } from '../../components/LineChart';

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;
const option = {
    title: {
        text: '收益曲线'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ['本产品', '持有BTC']
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    xAxis: {
        type: 'time',
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name: '邮件营销',
            type: 'line',
            stack: '总量',
            data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
            name: '联盟广告',
            type: 'line',
            stack: '总量',
            data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
            name: '视频广告',
            type: 'line',
            stack: '总量',
            data: [150, 232, 201, 154, 190, 330, 410]
        },
        {
            name: '直接访问',
            type: 'line',
            stack: '总量',
            data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
            name: '搜索引擎',
            type: 'line',
            stack: '总量',
            data: [820, 932, 901, 934, 1290, 1330, 1320]
        }
    ]
};

export const Home = () => {

  return (
    <Layout>
      <Header className="header">
        <img src={logo} alt="logo" className="logo"/>
      </Header>
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
            <Row>
              <Col sm={16} xs={24} className="card-left">
                <LineChart
                  option={option}
                />
              </Col>
              <Col sm={8} xs={24} className="card-right"></Col>
            </Row>
          </Card>
        </Row>
      </Content>
      <Footer></Footer>
    </Layout>
  )
}
