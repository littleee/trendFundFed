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

useEffect(() => {
  // i, i个物品
  const value = [0, 1, 6, 18, 22, 28];
  const weight = [0,1,2,5,6,7];
  var length = 6
  var arr =  new Array(6);
  for(var i = 0;i < arr.length; i++){
     arr[i] = new Array(12);
  }

  const memoized = (v,w,rongliang) => {
    for(let i=0; i < length; i++){
      for(let j =0;j <=rongliang; j++){
        arr[i][j] = -1
      }
    }
    console.log(arr);

    return calc(v,w,5,rongliang)
  }

  const calc = (v,w,i,rongliang) => {
    let temp = 0
    if(arr[i][rongliang] !== -1){
      return arr[i][rongliang]
    }
    if(i === 0 || rongliang === 0){
      //没物品或者容量是0, 最大价值为0
      return  arr[i][rongliang] = 0
    } else {
      arr[i][rongliang] = calc(v,w,i-1,rongliang)
      if(i>0 && rongliang >= w[i]){
        temp = calc(v,w,i-1,rongliang - w[i]) + v[i]
        if(arr[i][rongliang] < temp){
          arr[i][rongliang] = temp
        }
      }
    }
    return arr[i][rongliang]
  }

  console.log(2,memoized(value, weight, 11))
}, [])



  useEffect(() => {
    const fetchCharts = async () => {
      const [{ data: handleBtc }, {data: all}, {data: statisticData}] = await Promise.all([
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`
        ),
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/all.json`
        ),
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/statistic.json`
        )
      ]);
      // var ws = new WebSocket("wss://www.bitmex.com/realtime?subscribe=instrument,quoteBin1m:XBTUSD")
      // // ws.send("我是客户端发送的数据")
      // ws.onmessage = function(event){
      //   const data = event.data;
      //     console.log(JSON.parse(data))
      // }
      // const btcPrice = await axios.get(`https://www.bitmex.com/api/udf/history?symbol=XBTUSD&resolution=5&from=1595240610&to=1596536670`)
      //   console.log(btcPrice)
      setStatistic(statisticData)
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
  }, []);

  const pickDate = async (e) => {
    const value = e.target.value;
    const res = await axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/${value}.json`)
    const btcRes = await axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`)

    const { status, data } = res;
    if(status === 200) {
      const line = data.map((x) => [
        x[0] * 1000,
        x[2] * 100,
      ]);
      setT1Income(line);
      const startTime = data[0][0];
      const btcData = btcRes.data
      const btcDataWithTime = btcData.filter(x=>x[0] >= startTime);
      // console.log(btcDataWithTime);
      const handleIncome = btcDataWithTime.map((x) => [
        x[0] * 1000,
        (x[1] / btcDataWithTime[0][1] - 1) * 100,
      ]);
      setHandleIncome(handleIncome);
    }
  }

  const option = {
    title: {
      text: "业绩走势",
    },
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
        <Row className="content">
          <Card
            className="card"
            title="T1 趋势跟踪策略"
            extra={<Tag color="green">运行中</Tag>}
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
                      title="成立以来收益"
                      value={statistic.pnl_rate * 100 || 0}
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
                  <Col xs={8}>
                    <Statistic
                      title="昨日涨跌"
                      value={statistic.last_day_pnl_rate * 100 || 0}
                      precision={2}
                      suffix="%"
                      isNormal={false}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="近1月涨跌"
                      value={statistic.last_1m_pnl_rate * 100 || 0}
                      precision={2}
                      suffix="%"
                      isNormal={false}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="近3月涨跌"
                      value={statistic.last_3m_pnl_rate * 100 || 0}
                      precision={2}
                      suffix="%"
                      isNormal={false}
                    />
                  </Col>
                </Row>
                <Row style={{ width: "100%" }}>
                  <Col xs={8}>
                    <Statistic
                      title="运行天数"
                      value={statistic.running_days || 0}
                      precision={0}
                    />
                  </Col>
                  <Col xs={16}>
                    <Statistic
                      title="交易标的"
                      value="BTCUSD 永续合约"
                      precision={0}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Row>
      </Content>

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
// 
//
//
//
// class Parent {
//     constructor(name, age) {
//         this.name = name;
//         this.age = age;
//     }
//     sayName() {
//         console.log(this.name);
//     }
// };
//
// Parent.prototype.sayAge = function (){
//   console.log(this.age)
// }
// const child = new Parent('名字', 26);
// child.sayName()
// child.sayAge()
// console.log(child.constructor);
// console.log(child.__proto__.constructor)
// console.log(Parent.prototype);
//
//
// class B {}
// let b = new B();
//
// console.log(b.constructor === B.prototype.constructor)
// console.log(b.hasOwnProperty('constructor'))
// console.log(b.__proto__.hasOwnProperty('constructor'))
// console.log(B.hasOwnProperty('constructor'))
//  // true
