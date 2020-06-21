import React, { useEffect, useState } from "react";
import { Layout, Row, Divider, Card, Col, Table, Tag, Radio } from "antd";
import axios from "axios";
import echarts from "echarts";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import {
  getNumberColor,
  getNumberFormat,
  getNumberWithDecimal,
} from "../../utils";
import { Statistic, LineChart } from "../../components";
const { Content } = Layout;

export const T1Component = ({ className }) => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);
  const [t1Data, setT1Data] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useParams();
  const [ statistic, setStatistic ] = useState({});

  useEffect(() => {
    const fetchCharts = async () => {
      const [ { data: handleBtc }, {data: all}, {data: statisticData}] = await Promise.all([
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
      setT1Data(all);
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
  }, [user]);

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
        itemStyle: {
          color: "rgb(73,151,247)",
        },
        showSymbol: false,
        hoverAnimation: true,
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

  const columnsT1 = [
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "净值",
      dataIndex: "value",
      key: "value",
      render: (text) => text,
    },
    {
      title: "日涨幅",
      dataIndex: "incomeRate",
      key: "incomeRate",
      render: (text) => {
        return (
          <span className={getNumberColor(text)}>
            {getNumberFormat(getNumberWithDecimal(text, 2))}%
          </span>
        );
      },
    },
  ];

  const dataSource = (data) => {
    if (data.length > 0) {
      const result = data.map(x=>{
        return {
          date: dayjs(x[0] * 1000).format("YYYY-MM-DD hh:mm:ss"),
          value: getNumberWithDecimal(x[1], 4),
          incomeRate: x[3] * 100,
          key: x[0]
        }
      })
      return result;
    } else {
      return [];
    }
  };

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
      console.log(btcDataWithTime);
      const handleIncome = btcDataWithTime.map((x) => [
        x[0] * 1000,
        (x[1] / btcDataWithTime[0][1] - 1) * 100,
      ]);
      setHandleIncome(handleIncome);
    }
  }

  return (
    <Layout className={className}>
      <Divider className="divider" />
      <Content>
        <Row className="content" gutter={24}>
          <Col sm={24} xs={24}>
            <Card
              title="T1 趋势跟踪策略"
              extra={<Tag color="green">运行中</Tag>}
            >
              <Row>
                <Col sm={8} xs={12}>
                  <Statistic
                    title="成立以来收益"
                    value={statistic.pnl_rate * 100 || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={8} xs={12}>
                  <Statistic
                    title={`最新净值（${
                      statistic.timestamp ?
                        dayjs(statistic.timestamp * 1000).format(
                            "MM-DD"
                          ) : '--'
                    }）`}
                    value={statistic.pps || 0}
                    precision={4}
                    suffix="USD"
                  />
                </Col>
                <Col sm={8} xs={24}>
                  <Statistic
                    title="昨日涨跌"
                    value={statistic.last_day_pnl_rate * 100 || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: "24px" }}>
                <Col xs={24} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <LineChart option={option} showLoading={isLoading} />
                  <Radio.Group defaultValue="all" buttonStyle="solid" onChange={pickDate} style={{marginTop: '10px'}}>
                    <Radio.Button value="1m">近1月</Radio.Button>
                    <Radio.Button value="3m">近3月</Radio.Button>
                    <Radio.Button value="6m">近半年</Radio.Button>
                    <Radio.Button value="12m">近1年</Radio.Button>
                    <Radio.Button value="all">所有</Radio.Button>
                  </Radio.Group>
                </Col>
              </Row>
              <Row className="p-24">
                <Col sm={6} xs={12}>
                  <Statistic
                    title="近1月涨跌"
                    value={statistic.last_1m_pnl_rate * 100 || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={6} xs={12}>
                  <Statistic
                    title="近3月涨跌"
                    value={statistic.last_3m_pnl_rate * 100 || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={6} xs={12}>
                  <Statistic
                    title="运行天数"
                    value={statistic.running_days || 0}
                    precision={0}
                  />
                </Col>
                <Col sm={6} x={12}>
                  <Statistic
                    title="交易标的"
                    value="BTCUSD 永续合约"
                    precision={0}
                  />
                </Col>
              </Row>
            </Card>

            <Card className="card m-t-24 m-b-24" title="历史净值">
              <Table
                columns={columnsT1}
                dataSource={dataSource([...t1Data].reverse())}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export const T1 = styled(T1Component)`
  .p-24 {
    padding: 24px;
  }
  .m-t-24 {
    margin-top: 24px;
  }
  .m-b-24 {
    margin-bottom: 24px;
  }
  .divider {
    border-color: #000;
    opacity: 0.8;
    margin: 0;
  }
  .content {
    padding-top: 40px;
    max-width: 1120px;
    margin: 0 auto !important;
  }
`;
