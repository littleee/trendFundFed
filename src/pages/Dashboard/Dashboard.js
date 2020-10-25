import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Descriptions, Card, Row, Col } from "antd";

export const Dashboard = () => {
  const [binance, setBinance] = useState([]);
  const [ftx, setFtx] = useState([]);
  const [deribit, setDeribit] = useState([]);

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
      ] = await Promise.all([
        axios.get("http://littleee.com/api/ftxInfo"),
        axios.get("http://littleee.com/api/deribitInfo"),
        axios.get("http://littleee.com/api/binanceInfo"),
      ]);
      // setFtx(data[0][1]);
      // setBinance(data[0][2]);
      // setDeribit(data[0][3]);
      setBinance(binanceRes.result);
      setFtx(ftxRes.result);
      setDeribit(deribitRes.result);
    };
    fetchCharts();
    const timer = setInterval(() => {
      fetchCharts();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  console.log(new Date().toISOString());
  return (
    <div style={{ padding: "50px" }}>
      <Card title="T1 总资产">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="USD">{ftx[5]}</Descriptions.Item>
          <Descriptions.Item label="BTC">
            {(
              Number(ftx[0]) +
              Number(binance[2]) +
              Number(deribit[2])
            ).toString()}
          </Descriptions.Item>
          <Descriptions.Item label="USD价值">--</Descriptions.Item>
        </Descriptions>
      </Card>
      <Row>
        <Col span={8}>
          <Card title="Binance 资产">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="钱包余额(btc)">
                {binance[0]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(usd)">
                {binance[5]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {binance[1]}
              </Descriptions.Item>
              <Descriptions.Item label="保证金余额">
                {binance[2]}
              </Descriptions.Item>
              <Descriptions.Item label="可用余额">
                {binance[3]}
              </Descriptions.Item>
              <Descriptions.Item label="美元价值">
                {binance[4]}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="交易对">
                {binance[10]}
              </Descriptions.Item>
              <Descriptions.Item label="杠杆">{binance[11]}</Descriptions.Item>
              <Descriptions.Item label="仓位">{binance[12]}</Descriptions.Item>
              <Descriptions.Item label="合约面值">
                {binance[13]}
              </Descriptions.Item>
              <Descriptions.Item label="持仓均价">
                {binance[14]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {binance[15]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="FTX 仓位">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="钱包余额(btc)">
                {ftx[0]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(usd)">
                {ftx[5]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">{ftx[1]}</Descriptions.Item>
              <Descriptions.Item label="保证金余额">{ftx[2]}</Descriptions.Item>
              <Descriptions.Item label="可用余额">{ftx[3]}</Descriptions.Item>
              <Descriptions.Item label="美元价值">{ftx[4]}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="交易对">{ftx[10]}</Descriptions.Item>
              <Descriptions.Item label="杠杆">{ftx[11]}</Descriptions.Item>
              <Descriptions.Item label="仓位">{ftx[12]}</Descriptions.Item>
              <Descriptions.Item label="合约面值">{ftx[13]}</Descriptions.Item>
              <Descriptions.Item label="持仓均价">{ftx[14]}</Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {ftx[15]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Deribit 资产">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="钱包余额(btc)">
                {deribit[0]}
              </Descriptions.Item>
              <Descriptions.Item label="钱包余额(usd)">
                {deribit[5]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {deribit[1]}
              </Descriptions.Item>
              <Descriptions.Item label="保证金余额">
                {deribit[2]}
              </Descriptions.Item>
              <Descriptions.Item label="可用余额">
                {deribit[3]}
              </Descriptions.Item>
              <Descriptions.Item label="美元价值">
                {deribit[4]}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="交易对">
                {deribit[10]}
              </Descriptions.Item>
              <Descriptions.Item label="杠杆">{deribit[11]}</Descriptions.Item>
              <Descriptions.Item label="仓位">{deribit[12]}</Descriptions.Item>
              <Descriptions.Item label="合约面值">
                {deribit[13]}
              </Descriptions.Item>
              <Descriptions.Item label="持仓均价">
                {deribit[14]}
              </Descriptions.Item>
              <Descriptions.Item label="未实现盈亏">
                {deribit[15]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
