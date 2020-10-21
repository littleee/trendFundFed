import React, { useEffect, useState } from "react";
import footerIcon from "./footer.png";
import bannerIcon from "./banner.png";
import { Layout, Row, Divider, Card, Col, Tag, Radio } from "antd";
import axios from "axios";
import echarts from "echarts";
import styled from "styled-components";
import dayjs from "dayjs";
import {
  getNumberFormat,
  getNumberWithDecimal,
} from "../../utils";
import { Statistic, LineChart } from "../../components";

const { Content, Footer } = Layout;

const HomeComponent = ({ className }) => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ statistic, setStatistic ] = useState({});
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchCharts = async () => {
      const [{ data: handleBtc }, {data: all}, {data: statisticData}, {data: metricsData}] = await Promise.all([
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`
        ),
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/all.json`
        ),
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/statistic.json`
        ),
        axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/metrics.json`)
      ]);
      setStatistic(statisticData)
      setMetrics(metricsData)
      const startPriceByHandle = handleBtc[0][1];
      const t1Income = all.map((x) => [
        x[0] * 1000,
        x[2] * 100,
      ]);
      const handleIncome = handleBtc.map((x) => [
        x[0] * 1000,
        (x[1] / startPriceByHandle - 1) * 100,
      ]);
      setT1Income(t1Income);
      setHandleIncome(handleIncome);
      setIsLoading(false);
    };

    fetchCharts();

    // var ws = new WebSocket("wss://ftx.com/ws/");
    // var wss = new WebSocket("wss://echo.websocket.org");

//     ws.onopen = function(evt) { 
//       console.log("Connection open ...");
//       // const hmac = crypto.createHmac('sha256', 'secret-key');
//     let hash = CryptoJS.HmacSHA256(`${+new Date() - 8 * 60 * 60 * 1000}websocket_login`,'pS39_AF6qh3gN1jqiqSIID792YTqQgMrCskPoIcH');
//     const sign = CryptoJS.enc.Hex.stringify(hash)

//     const date = +new Date;
//     const signature = crypto.createHmac('sha256', 'pS39_AF6qh3gN1jqiqSIID792YTqQgMrCskPoIcH')
//       .update(date + 'websocket_login').digest('hex');

//     console.log(3,sign, date, signature)
//       ws.send(JSON.stringify({
//         'op': 'login',
//         'args': {
//           "subaccount": null,
//           'key': 'FKxofdboSzIYNgjfjp3yRVUkil_ER71eB_4eyfHE',
//           'sign': sign,
//           'time': +new Date() - 8 * 60 * 60 * 1000,
//         }
//       }));

//       setInterval(() => {
//         console.log(4555)
//         ws.send(JSON.stringify({'op': 'ping'}))
//       }, 15000)

// ws.send(JSON.stringify({
//  'channel': "orderbook",
// 'market': "BTC-PERP",
// 'op': "subscribe"}))
//  ws.send(JSON.stringify({'type': 'subscribed', 'channel': 'trades', 'market': 'BTC-PERP'}))
    // };

    // ws.onmessage = function(evt) {
    //   console.log( "Received Message: " + evt.data);
    //   // ws.close();
    // };

    // ws.onclose = function(evt) {
    //   console.log("Connection closed.");
    // };
  }, []);

  const pickDate = async (e) => {
    const value = e.target.value;
    const [res, btcRes] = await Promise.all([
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/${value}.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`)
    ])

    const { status, data } = res;
    if(status === 200) {
      const line = data.map((x) => [
        x[0] * 1000,
        x[2] * 100,
      ]);
      const startTime = data[0][0];
      const btcData = btcRes.data
      const btcDataWithTime = btcData.filter(x=>x[0] >= startTime);
      const handleIncome = btcDataWithTime.map((x) => [
        x[0] * 1000,
        (x[1] / btcDataWithTime[0][1] - 1) * 100,
      ]);
      setT1Income(line);
      setHandleIncome(handleIncome);
    }
  }

  const option = {
    title: {
      text: "业绩走势",
    },
    animation: true,
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const date = new Date(params[0].data[0]);
        const dateFormat = echarts.format.formatTime(
          "yyyy-MM-dd hh:mm:ss",
          date
        );
        var returnHtmT1 = params[0]
          ? `${getNumberWithDecimal(params[0].data[1], 2)}%`
          : "--";
        var returnHtmlBTC = params[1]
          ? `${getNumberWithDecimal(params[1].data[1], 2)}%`
          : "--";
        return `<span>${dateFormat}</span><br/><span>本策略：${returnHtmT1}</span> <br/> <span>BTCUSD: ${returnHtmlBTC}</span>`;
      },
    },
    legend: {
      data: [
        {
          name: "本策略",
          // 强制设置图形为圆。
          icon: "circle",
        },
        {
          name: "BTCUSD",
          // 强制设置图形为圆。
          icon: "circle",
        },
      ],
      formatter: (name) => {
        const value = name === "本策略" ? t1Income : handleIncome;
        return value.length === 0
          ? `${name} +0.00%`
          : `${name} ${getNumberFormat(
              getNumberWithDecimal(value[value.length - 1][1], 2)
            )}%`;
      },
      right: 0,
      top: 3,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },

    xAxis: {
      type: "time",
      splitLine: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "#888",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        show: true,
        formatter: "{value}%",
      },
      splitLine: {
        show: true,
      },
      splitNumber: 3,
      axisLine: {
        lineStyle: {
          color: "#888",
        },
      },
    },
    series: [
      {
        name: "本策略",
        type: "line",
        data: t1Income,
        showSymbol: false,
        hoverAnimation: true,
        itemStyle: {
          color: "rgb(73,151,247)",
        },
      },
      {
        name: "BTCUSD",
        type: "line",
        data: handleIncome,
        itemStyle: {
          color: "rgb(105,193,111)",
        },
        showSymbol: false,
        hoverAnimation: true,
      },
    ],
  };
  return (
    <Layout className={className}>
      <Divider className="divider" />
      <Content>
        <Row className="banner">
          <div className="title-wrapper">
            <p className="title">趋势中的数字黄金</p>
            <p className="sub-title">加密货币CTA策略</p>
          </div>
        </Row>
        <Row className="content">
          <Card
            className="card"
            title={<div style={{display: 'flex', alignItems: 'center'}}><span style={{marginRight: '20px'}}>T1 趋势跟踪策略</span><Tag color="green">运行中</Tag></div>}
            extra={<a href="#/t1" className="details-link">策略详情 ></a>}
          >
            <Row style={{ padding: "20px 0" }}>
              <Col sm={16} xs={24} className="card-left">
                <LineChart option={option} showLoading={isLoading} />
                <Radio.Group defaultValue="all" buttonStyle="solid" onChange={pickDate} style={{marginTop: '10px'}}>
                  <Radio.Button value="1m">近1月</Radio.Button>
                  <Radio.Button value="3m">近3月</Radio.Button>
                  <Radio.Button value="6m">近半年</Radio.Button>
                  <Radio.Button value="12m">近1年</Radio.Button>
                  <Radio.Button value="all">所有</Radio.Button>
                </Radio.Group>
              </Col>
              <Col sm={8} xs={24} className="card-right">
                <Row style={{ width: "100%" }}>
                  <Col xs={12}>
                    <Statistic
                      title="历史年化收益率"
                      value={(metrics.strategy && (metrics.strategy.annual_return * 100).toFixed(2)) || 0}
                      precision={2}
                      suffix="%"
                      isNormal={false}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title={`最新净值（${
                        statistic.timestamp ?
                          dayjs(statistic.timestamp * 1000).format(
                              "MM-DD"
                            ) : '--'
                      }）`}
                      value={
                        statistic.pps || 0
                      }
                      precision={4}
                      suffix="USD"
                    />
                  </Col>
                </Row>
                <Row style={{ width: "100%" }}>
                  <Col xs={12}>
                    <Statistic
                      title="成立以来收益率"
                      value={statistic.pnl_rate * 100 || 0}
                      precision={2}
                      suffix="%"
                      isNormal={false}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="昨日涨跌"
                      value={statistic.last_day_pnl_rate * 100 || 0}
                      precision={2}
                      suffix="%"
                      isNormal={false}
                    />
                  </Col>
                </Row>
                <Row style={{ width: "100%" }}>
                  <Col xs={12}>
                    <Statistic
                      title="价值本位"
                      value="USD"
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="策略类型"
                      value="CTA 策略"
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
        <p className="footer-subtitle">
          TrendFund
          成立于2017年，专注于加密资产的量化交易研究。团队成员均为业内顶尖产品经理、分析师、交易员、工程师等。
        </p>
        <img
          className="footer-icon"
          src={footerIcon}
          alt="footer details"
          draggable="false"
        />
      </Footer>
    </Layout>
  );
};

export const Home = styled(HomeComponent)`
  .divider {
    border-color: #000;
    opacity: 0.8;
    margin: 0;
  }

  .banner {
    height: 380px;
    background: rgb(14, 16, 20);
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
    .title {
      font-size: 36px;
      font-family: PingFang SC;
      font-weight: 200;
      color: rgba(255, 255, 255, 1);
      margin-bottom: 17px;
      text-align: center;
    }
    .sub-title {
      font-size: 16px;
      font-family: PingFang SC;
      font-weight: 200;
      color: rgba(255, 255, 255, 1);
      text-align: center;
    }
  }

  .card {
    max-width: 1120px;
    width: 100%;
    border-radius: 6px;
    margin: -64px auto 0 auto;
    box-shadow: 0px 6px 13px 0px rgba(0, 0, 0, 0.03);
    border-radius: 6px;
    .card-left {
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .card-right {
      padding: 0 20px;
      border-left: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-around;
    }
    .details-link {
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .more {
    font-size: 14px;
    font-family: PingFang SC;
    font-weight: 400;
    color: rgba(19, 24, 31, 1);
    opacity: 0.6;
    margin: 80px auto;
    text-align: center;
  }

  .footer {
    background: rgb(14, 16, 20);
    text-align: center;
    .footer-title {
      font-size: 18px;
      font-family: PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
    }
    .footer-subtitle {
      font-size: 14px;
      font-family: PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      opacity: 0.6;
      margin-bottom: 60px;
    }

    .footer-icon {
      width: 100%;
      max-width: 412px;
      margin-bottom: 108px;
    }
  }

  @media (max-width: 375px) {
    .banner {
      background-size: cover;
    }
  }
`;