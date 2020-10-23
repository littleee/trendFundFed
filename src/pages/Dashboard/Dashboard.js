import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Descriptions, Card } from "antd";

const binanceAccountColumns = [
    {
      title: '钱包余额(btc)',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
    },
    {
      title: '未实现盈亏',
      dataIndex: 'unrealizedProfit',
      key: 'unrealizedProfit',
    },
    {
      title: '保证金余额',
      dataIndex: 'marginBalance',
      key: 'marginBalance',
    }
  ];

  const binancePositionColumns = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '杠杆',
      dataIndex: 'leverage',
      key: 'leverage',
    },
    {
      title: '保证金',
      dataIndex: 'initialMargin',
      key: 'initialMargins',
    },
    {
      title: '开仓价',
      dataIndex: 'entryPrice',
      key: 'entryPrice',
    },
    {
      title: '未实现盈亏',
      dataIndex: 'unrealizedProfit',
      key: 'unrealizedProfit',
    }
  ];

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

  const ftxPositionColumns = [
    {
      title: '交易对',
      dataIndex: 'future',
      key: 'future',
    },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
    },
    {
      title: '持仓量',
      dataIndex: 'netSize',
      key: 'netSize',
    },
    {
      title: '合约面值',
      dataIndex: 'cost',
      key: 'cost',
    },
    {
      title: '强平价格',
      dataIndex: 'estimatedLiquidationPrice',
      key: 'estimatedLiquidationPrice',
    },
    {
        title: '盈亏',
        dataIndex: 'realizedPnl',
        key: 'realizedPnl'
    }
  ];


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
        console.log(deribitRes)
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
    console.log(444,deribitPosition)
    const binanceAccountData = [binanceAssets];
    const binancePositionData = [binancePosition]
    const getFtxByCurrency = currency => ftxAssets.find(x=>x.coin === currency) || {total: 0};
    return (
        <div style={{padding: '50px'}}>
    <Card title="T1 总资产">
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="USD">{getFtxByCurrency('USD').total}</Descriptions.Item>
                <Descriptions.Item label="BTC">{Number(getFtxByCurrency('BTC').total) + Number(binanceAssets.marginBalance)}</Descriptions.Item>
                <Descriptions.Item label="USD价值">--</Descriptions.Item>
              </Descriptions>
              </Card>

    <div> Binance 资产</div>
            <Table
                columns={binanceAccountColumns}
                dataSource={binanceAccountData}
                pagination={false}
            />
            <Table
                columns={binancePositionColumns}
                dataSource={binancePositionData}
                pagination={false}
            />
            <div>FTX 资产</div>
            <Table
                columns={ftxAccounntColumns}
                dataSource={ftxAssets}
                pagination={false}
            />
            <Table
                columns={ftxPositionColumns}
                dataSource={ftxPosition}
                pagination={false}
            />
            <Card title="Deribit资产">
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="账户资产净值">{deribitAssets.equity}</Descriptions.Item>
                <Descriptions.Item label="可用余额">{deribitAssets.available_funds}</Descriptions.Item>
                <Descriptions.Item label="保证金余额">{deribitAssets.margin_balance}</Descriptions.Item>
                <Descriptions.Item label="未实现盈亏">{deribitAssets.futures_pl}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Card title="Deribit仓位">
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="交易品种">{deribitPosition.instrument_name}</Descriptions.Item>
                <Descriptions.Item label="仓位(USD)">{deribitPosition.size}</Descriptions.Item>
                <Descriptions.Item label="大小">{deribitPosition.size_currency}</Descriptions.Item>
                <Descriptions.Item label="持仓均价">{deribitPosition.average_price}</Descriptions.Item>
                <Descriptions.Item label="未实现盈亏">{deribitPosition.floating_profit_loss}</Descriptions.Item>
              </Descriptions>
            </Card>
        </div>
    )
}