import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Descriptions, Card, Row, Col } from "antd";

const ftxAccounntColumns = [
  {
      title: '',
      dataIndex: 'coin',
      key: 'coin'
  },
  {
      title: '账户余额',
      dataIndex: 'total',
      key: 'total'
  },
  {
      title: '可用余额',
      dataIndex: 'free',
      key: 'free'
  },
  {
      title: '美元价值',
      dataIndex: 'usdValue',
      key: 'usdValue'
  },
]

export const Dashboard = () => {
    const [binance, setBinance] = useState({})
    const [ftx, setFtx] = useState({})
    const [deribit, setDeribit] = useState({})

useEffect(() => {
    const fetchCharts = async () => {
      const [{ data: ftxRes }, { data: deribitRes }, { data: binanceRes } ] = await Promise.all([
        axios.get('http://littleee.com/api/ftxInfo'),
        axios.get('http://littleee.com/api/deribitInfo'),
        axios.get('http://littleee.com/api/binanceInfo'),
      ])
        const ftxInfo = {
          position: ftxRes.positions.result,
          assets: ftxRes.balance.info.result
        }
        const binanceInfo = {
            position: binanceRes.result.info.positions.find(x=>x.symbol === 'BTCUSD_PERP'),
            assets: binanceRes.result.info.assets.find(x => x.asset === 'BTC')
        }
        const deribitInfo = {
          position: deribitRes.positions.result,
          assets: deribitRes.balance.info.result,
        }
        setBinance(binanceInfo)
        setFtx(ftxInfo)
        setDeribit(deribitInfo)
    };
    fetchCharts();
    const timer = setInterval(() => {
      fetchCharts();
    }, 5000);

    return () => clearInterval(timer)
}, [])
    const { position: binancePosition = {}, assets: binanceAssets = {} } = binance;
    const { position: ftxPosition = [], assets: ftxAssets = [] } = ftx;
    const { position: deribitPosition = {}, assets: deribitAssets = {} } = deribit;

    const getFtxByCurrency = currency => ftxAssets.find(x=>x.coin === currency) || {total: 0};
    return (
        <div style={{padding: '50px'}}>

  <Card title="T1 总资产">
    <Descriptions bordered column={1} size='small'>
      <Descriptions.Item label="USD">{getFtxByCurrency('USD').total}</Descriptions.Item>
      <Descriptions.Item label="BTC">{Number(getFtxByCurrency('BTC').total) + Number(binanceAssets.marginBalance) + Number(deribitAssets.margin_balance)}</Descriptions.Item>
      <Descriptions.Item label="USD价值">--</Descriptions.Item>
    </Descriptions>
    </Card>
<Row>
  <Col span={8}>
    <Card title="Binance 资产">
    <Descriptions bordered column={1} size='small'>
      <Descriptions.Item label="钱包余额(btc)">{binanceAssets.walletBalance}</Descriptions.Item>
      <Descriptions.Item label="未实现盈亏">{binanceAssets.unrealizedProfit}</Descriptions.Item>
      <Descriptions.Item label="保证金余额">{binanceAssets.marginBalance}</Descriptions.Item>
    </Descriptions>
    <Descriptions bordered column={1} size='small'>
      <Descriptions.Item label="交易对">{binancePosition.symbol}</Descriptions.Item>
      <Descriptions.Item label="杠杆">{binancePosition.leverage}</Descriptions.Item>
      <Descriptions.Item label="保证金">{binancePosition.initialMargin}</Descriptions.Item>
      <Descriptions.Item label="开仓价">{binancePosition.entryPrice}</Descriptions.Item>
      <Descriptions.Item label="未实现盈亏">{binancePosition.unrealizedProfit}</Descriptions.Item>
    </Descriptions>
  </Card>
  </Col>
  <Col span={8}>
      <Card title="FTX 仓位">
      <Table
          columns={ftxAccounntColumns}
          dataSource={ftxAssets}
          pagination={false}
      />
        <Descriptions bordered column={1} size='small'>
          <Descriptions.Item label="交易对">{ftxPosition[0]?.future}</Descriptions.Item>
          <Descriptions.Item label="方向">{ftxPosition[0]?.side}</Descriptions.Item>
          <Descriptions.Item label="持仓量">{ftxPosition[0]?.netSize}</Descriptions.Item>
          <Descriptions.Item label="合约面值">{ftxPosition[0]?.cost}</Descriptions.Item>
          <Descriptions.Item label="强平价格">{ftxPosition[0]?.estimatedLiquidationPrice}</Descriptions.Item>
          <Descriptions.Item label="盈亏">{ftxPosition[0]?.realizedPnl}</Descriptions.Item>
        </Descriptions>
      </Card>
      </Col>
      <Col span={8}>
      <Card title="Deribit 资产">
        <Descriptions bordered column={1} size='small'>
          <Descriptions.Item label="账户资产净值">{deribitAssets.equity}</Descriptions.Item>
          <Descriptions.Item label="可用余额">{deribitAssets.available_funds}</Descriptions.Item>
          <Descriptions.Item label="保证金余额">{deribitAssets.margin_balance}</Descriptions.Item>
          <Descriptions.Item label="未实现盈亏">{deribitAssets.futures_pl}</Descriptions.Item>
        </Descriptions>
        <Descriptions bordered column={1} size='small'>
          <Descriptions.Item label="交易品种">{deribitPosition.instrument_name}</Descriptions.Item>
          <Descriptions.Item label="仓位(USD)">{deribitPosition.size}</Descriptions.Item>
          <Descriptions.Item label="大小">{deribitPosition.size_currency}</Descriptions.Item>
          <Descriptions.Item label="持仓均价">{deribitPosition.average_price}</Descriptions.Item>
          <Descriptions.Item label="未实现盈亏">{deribitPosition.floating_profit_loss}</Descriptions.Item>
        </Descriptions>
      </Card>
      </Col>
      </Row>
  </div>
    )
}