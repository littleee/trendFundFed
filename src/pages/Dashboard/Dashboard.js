import React, { useEffect, useState } from "react";
import axios from "axios";
import { Descriptions, Card, Row, Col } from "antd";
import { LineChart } from "../../components";

export const Dashboard = () => {
  const [binance, setBinance] = useState([]);
  const [ftx, setFtx] = useState([]);
  const [deribit, setDeribit] = useState([]);
  const [tdUsdValue, setTdUsdValue] = useState([]);
  const [info, setInfo] = useState([]);
  const [td, setTd] = useState([]);
  useEffect(() => {
    const fetchCharts = async () => {
      // const { data } = await axios.get(
      //   `https://raw.githubusercontent.com/littleee/td/main/${
      //     new Date()
      //       .toISOString()
      //       .replace(/T/, " ")
      //       .replace(/\..+/, "")
      //       .split(" ")[0]
      //   }.json`
      // );
      const [
        { data: ftxRes },
        { data: deribitRes },
        { data: binanceRes },
        { data: tdRes },
        { data: infoRes },
      ] = await Promise.all([
        axios.get("https://littleee.com/api/ftxInfo"),
        axios.get("https://littleee.com/api/deribitInfo"),
        axios.get("https://littleee.com/api/binanceInfo"),
        axios.get(
          `https://raw.githubusercontent.com/littleee/td/main/${
            new Date()
              .toISOString()
              .replace(/T/, " ")
              .replace(/\..+/, "")
              .split(" ")[0]
          }.json`
        ),
        axios.get(
          "https://raw.githubusercontent.com/odofmine/sim/main/info.json"
        ),
      ]);
      // setFtx(data[0][1]);
      // setBinance(data[0][2]);
      // setDeribit(data[0][3]);
      const usdValueChart = tdRes.map((x) => {
        if (Array.isArray(x[0])) {
          return x[0];
        }
        return [];
      });
      setTdUsdValue(usdValueChart);
      setBinance(binanceRes.result);
      setFtx(ftxRes.result);
      setDeribit(deribitRes.result);
      setInfo(infoRes);
      setTd(tdRes);
    };
    fetchCharts();
    const timer = setInterval(() => {
      fetchCharts();
    }, 10000);

    return () => clearInterval(timer);
  }, []);
  const currentDate = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "")
    .split(" ")[0];
  const option = {
    title: {
      text: "总美元价值",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        {
          name: "总美元价值",
          // 强制设置图形为圆。
          icon: "circle",
        },
      ],
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
      min: +new Date(currentDate),
      max: +new Date(currentDate) + 24 * 60 * 60 * 1000,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        show: true,
        formatter: "{value}",
      },
      scale: true,
      axisLine: {
        lineStyle: {
          color: "#888",
        },
      },
    },
    series: [
      {
        name: "总美元价值",
        type: "line",
        data: tdUsdValue,
        itemStyle: {
          color: "rgb(73,151,247)",
        },
        showSymbol: false,
        hoverAnimation: false,
      },
    ],
    animation: false,
  };
  const infoRealLeverage =
    info.length > 0
      ? info[info.length - 1][3] / info[info.length - 1][2]
      : undefined;
  const getRealLevertageByTd = (exchange) => {
    return infoRealLeverage &&
      td.length > 0 &&
      td[td.length - 1].length > 0 &&
      td[td.length - 1][exchange].length > 0
      ? td[td.length - 1][exchange][6] * infoRealLeverage
      : "--";
  };
  return (
    <div>
      <Card title="回测">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={`时间`}>
            {info.length > 0 ? info[info.length - 1][0] : "--"}
          </Descriptions.Item>
          <Descriptions.Item label={`资产`}>
            {info.length > 0 ? info[info.length - 1][2] : "--"}
          </Descriptions.Item>
          <Descriptions.Item label={`仓位`}>
            {info.length > 0 ? info[info.length - 1][3] : "--"}
          </Descriptions.Item>
          <Descriptions.Item label={`实际杠杆`}>
            {infoRealLeverage || "--"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="T1 总资产">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={`USD价值`}>
            {tdUsdValue.length > 0 && tdUsdValue[0][1]}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Row>
        <Col sm={8} xs={24}>
          <Card title="Binance">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="应有仓位">
                {getRealLevertageByTd(2)}
              </Descriptions.Item>
              <Descriptions.Item label="实际杠杆">
                {binance[0]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(btc)">
                {binance[1]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(usd)">
                {binance[2]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {binance[3]}
              </Descriptions.Item>
              <Descriptions.Item label="保证金余额">
                {binance[4]}
              </Descriptions.Item>
              <Descriptions.Item label="可用余额">
                {binance[5]}
              </Descriptions.Item>
              <Descriptions.Item label="美元价值">
                {binance[6]}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="交易对">{binance[7]}</Descriptions.Item>
              <Descriptions.Item label="杠杆">{binance[8]}</Descriptions.Item>
              <Descriptions.Item label="仓位">{binance[9]}</Descriptions.Item>
              <Descriptions.Item label="合约面值">
                {binance[10]}
              </Descriptions.Item>
              <Descriptions.Item label="持仓均价">
                {binance[11]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {binance[12]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col sm={8} xs={24}>
          <Card title="FTX">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="应有仓位">
                {getRealLevertageByTd(1)}
              </Descriptions.Item>
              <Descriptions.Item label="实际杠杆">{ftx[0]}</Descriptions.Item>
              <Descriptions.Item label="钱包余额(btc)">
                {ftx[1]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(usd)">
                {ftx[2]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">{ftx[3]}</Descriptions.Item>
              <Descriptions.Item label="保证金余额">{ftx[4]}</Descriptions.Item>
              <Descriptions.Item label="可用余额">{ftx[5]}</Descriptions.Item>
              <Descriptions.Item label="美元价值">{ftx[6]}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="交易对">{ftx[7]}</Descriptions.Item>
              <Descriptions.Item label="杠杆">{ftx[8]}</Descriptions.Item>
              <Descriptions.Item label="仓位">{ftx[9]}</Descriptions.Item>
              <Descriptions.Item label="合约面值">{ftx[10]}</Descriptions.Item>
              <Descriptions.Item label="持仓均价">{ftx[11]}</Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {ftx[12]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col sm={8} xs={24}>
          <Card title="Deribit">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="应有仓位">
                {getRealLevertageByTd(3)}
              </Descriptions.Item>
              <Descriptions.Item label="实际杠杆">
                {deribit[0]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(btc)">
                {deribit[1]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(usd)">
                {deribit[2]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {deribit[3]}
              </Descriptions.Item>
              <Descriptions.Item label="保证金余额">
                {deribit[4]}
              </Descriptions.Item>
              <Descriptions.Item label="可用余额">
                {deribit[5]}
              </Descriptions.Item>
              <Descriptions.Item label="美元价值">
                {deribit[6]}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="交易对">{deribit[7]}</Descriptions.Item>
              <Descriptions.Item label="杠杆">{deribit[8]}</Descriptions.Item>
              <Descriptions.Item label="仓位">{deribit[9]}</Descriptions.Item>
              <Descriptions.Item label="合约面值">
                {deribit[10]}
              </Descriptions.Item>
              <Descriptions.Item label="持仓均价">
                {deribit[11]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {deribit[12]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <LineChart option={option} />
    </div>
  );
};
