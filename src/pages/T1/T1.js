import React, { useEffect, useState } from "react";
import { Layout, Row, Divider, Card, Typography, Col, Table, Tag } from "antd";
import axios from "axios";
import echarts from "echarts";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import {
  getNumberColor,
  getNumberFormat,
  getRunDays,
  getIncomeRate,
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

  useEffect(() => {
    const fetchCharts = async () => {
      const [{ data: t1 }, { data: handleBtc }] = await Promise.all([
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/t1/main.json`
        ),
        axios.get(
          `https://raw.githubusercontent.com/odofmine/ocd/master/t1/btc_price/2020-05.json`
        ),
      ]);
      setT1Data(t1);

      const startPriceByHandle = handleBtc[0][1];
      const startPriceByT1 = t1[0][1];
      const t1Income = t1.map((x) => [
        x[0] * 1000,
        (x[1] / startPriceByT1 - 1) * 100,
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
      const result = data.reduce((acc, curr, index, arr) => {
        const obj = {
          date: dayjs(curr[0] * 1000).format("YYYY-MM-DD hh:mm:ss"),
          value: getNumberWithDecimal(arr[index][1], 4),
          cost: curr[2],
          share: getNumberWithDecimal(curr[3], 0),
          key: curr[0],
          incomeRate:
            index + 1 < arr.length
              ? `${getNumberWithDecimal(
                  (curr[1] / arr[index + 1][1] - 1) * 100,
                  2
                )}`
              : 0,
        };
        return [...acc, obj];
      }, []);
      return result;
    } else {
      return [];
    }
  };

  const t1IncomeRate = getIncomeRate(t1Data);

  return (
    <Layout className={className}>
      <Divider className="divider" />
      <Content>
        <Row className="content" gutter={24}>
          <Col sm={24} xs={24} className="content-left">
            <Card
              title="T1 趋势跟踪策略"
              extra={<Tag color="green">运行中</Tag>}
            >
              <Row>
                <Col sm={8} xs={12}>
                  <Statistic
                    title="成立以来收益"
                    value={t1IncomeRate}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={8} xs={12}>
                  <Statistic
                    title={`最新净值（${
                      t1Data.length > 0
                        ? dayjs(t1Data[t1Data.length - 1][0] * 1000).format(
                            "MM-DD"
                          )
                        : "--"
                    }）`}
                    value={t1Data.length > 0 ? t1Data[t1Data.length - 1][1] : 0}
                    precision={4}
                    suffix="USD"
                  />
                </Col>
                <Col sm={8} xs={24}>
                  <Statistic
                    title="昨日涨跌"
                    value={getIncomeRate(t1Data, 1)}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: "24px" }}>
                <Col xs={24}>
                  {<LineChart option={option} showLoading={isLoading} />}
                </Col>
              </Row>
              <Row className="p-24">
                <Col sm={6} xs={12}>
                  <Statistic
                    title="近1月涨跌"
                    value={getIncomeRate(t1Data, 30)}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={6} xs={12}>
                  <Statistic
                    title="近3月涨跌"
                    value={getIncomeRate(t1Data, 90)}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={6} xs={12}>
                  <Statistic
                    title="运行天数"
                    value={getRunDays(t1Data)}
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
    .content-right {
    }
    .card {
      .card-title-wrapper {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 15px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .card-title {
        font-size: 18px;
        font-family: PingFang SC;
        font-weight: 400;
        color: rgba(19, 24, 31, 1);
        padding-right: 6px;
      }
    }
  }

  .card .title-wrapper-left {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-left {
    padding: 0 20px;
  }

  .green {
    color: #3f8600;
  }
  .red {
    color: #cf1322;
  }
  .grey {
    color: rgba(19, 24, 31, 0.6);
  }
  @media (max-width: 375px) {
    .card-left {
      padding: 0;
    }
  }
`;
