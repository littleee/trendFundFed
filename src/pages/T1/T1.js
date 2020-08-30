import React, { useEffect, useState } from "react";
import { Layout, Row, Divider, Card, Col, Table, Tag, Radio, Descriptions, Tabs, Typography } from "antd";
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
const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

export const T1Component = ({ className }) => {
  const [t1Income, setT1Income] = useState([]);
  const [handleIncome, setHandleIncome] = useState([]);
  const [t1Data, setT1Data] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useParams();
  const [ statistic, setStatistic ] = useState({});
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchCharts = async () => {
      const [ { data: handleBtc }, {data: all}, {data: statisticData}, {data: metricsData}] = await Promise.all([
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

      setMetrics(metricsData)
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
      text: "",
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
          <Col xs={24}>
            <Card
              title="T1 趋势跟踪策略"
              extra={<Tag color="green">运行中</Tag>}
            >
              <Row>
                <Col sm={5} xs={12}>
                  <Statistic
                    title="历史年化收益率"
                    value={(metrics.strategy && (metrics.strategy.annual_return * 100).toFixed(2)) || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={5} xs={12}>
                  <Statistic
                    title="成立以来收益率"
                    value={statistic.pnl_rate * 100 || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={5} xs={12}>
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
                <Col sm={5} xs={12}>
                  <Statistic
                    title="昨日涨跌"
                    value={statistic.last_day_pnl_rate * 100 || 0}
                    precision={2}
                    suffix="%"
                    isNormal={false}
                  />
                </Col>
                <Col sm={4} xs={12}>
                  <Statistic
                    title="价值本位"
                    value="USD"
                  />
                </Col>
              </Row>
            </Card>
            </Col>
          </Row>
          <Row className="content" gutter={24}>
            <Col sm={15} xs={24}>
              <Card
                title="业绩走势"
              >
                <Row style={{minHeight: '400px'}}>
                  <Col xs={24} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <LineChart option={option} showLoading={isLoading} />
                    <Radio.Group defaultValue="all" buttonStyle="solid" onChange={pickDate} style={{marginTop: '10px'}}>
                      <Radio.Button value="1m">近1月</Radio.Button>
                      <Radio.Button value="3m">近3月</Radio.Button>
                      <Radio.Button value="6m">近6月</Radio.Button>
                      <Radio.Button value="12m">近1年</Radio.Button>
                      <Radio.Button value="all">所有</Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col sm={9} xs={24}>
              <Card title="风险指标监控">
              <Descriptions bordered column={1} size='small' style={{minHeight: '400px'}}>
                <Descriptions.Item label="日胜率">{`${(metrics.strategy && (metrics.strategy.daily_winning_ratio * 100).toFixed(2))} %` || '--'}</Descriptions.Item>
                <Descriptions.Item label="年化波动率">{`${(metrics.strategy && (metrics.strategy.annual_volatility * 100).toFixed(2))} %` || '--'}</Descriptions.Item>
                <Descriptions.Item label="Alpha">{(metrics.strategy && (metrics.strategy.alpha).toFixed(2)) || '--'}</Descriptions.Item>
                <Descriptions.Item label="Beta">{(metrics.strategy && (metrics.strategy.beta).toFixed(2)) || '--'}</Descriptions.Item>
                <Descriptions.Item label="夏普比率">
                  {(metrics.strategy && (metrics.strategy.sharpe_ratio).toFixed(2)) || '--'}
                </Descriptions.Item>
                <Descriptions.Item label="索提诺比率">{(metrics.strategy && (metrics.strategy.sortino_ratio).toFixed(2)) || '--'}</Descriptions.Item>
                <Descriptions.Item label="最大回撤率">{`${(metrics.strategy && (metrics.strategy.max_drawdown * 100).toFixed(2))} %` || '--'}</Descriptions.Item>
              </Descriptions>
              </Card>
            </Col>
          </Row>
          <Row className="content" gutter={24}>
            <Col sm={15} xs={24}>
            <Card className="p-t-0">
            <Tabs defaultActiveKey="1" style={{background: '#fff'}} size="large">
              <TabPane tab="项目简介" key="1">
              <Typography>
              <Title level={5} className='title-p-t-10'>基本信息</Title>
              <Col sm={16} xs={24}>
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="项目名称">T1 趋势跟踪策略</Descriptions.Item>
                <Descriptions.Item label="项目代码">200501</Descriptions.Item>
                <Descriptions.Item label="策略类型">CTA 策略</Descriptions.Item>
                <Descriptions.Item label="策略风格">进取型</Descriptions.Item>
                <Descriptions.Item label="计价单位">USD</Descriptions.Item>
                <Descriptions.Item label="最低认购金额">100000 USD</Descriptions.Item>
                <Descriptions.Item label="运行时间">2020-05-01</Descriptions.Item>
                <Descriptions.Item label="运作人跟投比例">30%</Descriptions.Item>
                <Descriptions.Item label="最小募集金额">100000 USD</Descriptions.Item>
                <Descriptions.Item label="最大募集金额">10000000 USD</Descriptions.Item>
              </Descriptions>
              </Col>
              <Title level={5} className='title-p-t-10'>策略描述</Title>
              <Paragraph>运用复合技术指标寻找当前市场趋势，根据信号进行方向性交易。根据趋势信号的强度进行仓位及风险敞口管理，无论牛市还是熊市都可有效降低Beta，捕获Alpha。</Paragraph>
              <Title level={5} className='title-p-t-10'>风控参数</Title>
              <Paragraph>项目严格按照风控参数运作，其交易范围均被限制在 主流交易所 的 主流交易品种。</Paragraph>
              <Col sm={16} xs={24}>
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="最大总杠杆">2.00</Descriptions.Item>
                <Descriptions.Item label="最大风险敞口">95%</Descriptions.Item>
                <Descriptions.Item label="平仓净值">0.8</Descriptions.Item>
              </Descriptions>
              </Col>
              <Title level={5}  className='title-p-t-10'>申赎规则</Title>
              <Paragraph>预约申购，预约赎回</Paragraph>
              <Title level={5}  className='title-p-t-10'>利润分配</Title>
              <Col sm={16} xs={24}>
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="项目运作人">50%</Descriptions.Item>
                <Descriptions.Item label="份额持有人">50%</Descriptions.Item>
              </Descriptions>
              </Col>
              <Title level={5}  className='title-p-t-10'>收费标准</Title>
              <Col sm={16} xs={24}>
              <Descriptions bordered column={1} size='small'>
                <Descriptions.Item label="认购费用">免费</Descriptions.Item>
                <Descriptions.Item label="赎回费用">免费</Descriptions.Item>
                <Descriptions.Item label="管理费用">2% (年化)</Descriptions.Item>
                <Descriptions.Item label="托管费用">2% (年化)</Descriptions.Item>
              </Descriptions>
              </Col>
              <Title level={5}  className='title-p-t-10'>免责声明</Title>
              <Paragraph>所有项目均为第三方量化团队作为项目运作人提供，项目运作人不保证项目回报，过往业绩及累计净值走势不预示未来业绩表现。</Paragraph>
              <Paragraph>用户应认真阅读《专业级用户声明》、《专业级用户承诺书》、风险承受能力测评结果及项目风控措施等内容，确认已知晓并理解项目和相关风险，具备相应风险承受能力。</Paragraph>
              <Paragraph>市场有风险，请谨慎决定是否参与。</Paragraph>
              </Typography>
              </TabPane>
            </Tabs>
            </Card>
            </Col>
            <Col sm={9} xs={24}>
              <Card className="p-t-0">
              <Tabs defaultActiveKey="1" size="large">
                <TabPane tab="历史业绩" key="1">
                <Descriptions bordered column={1} size='small'>
                  <Descriptions.Item label="近1月">
                    <span className={getNumberColor(statistic.last_1m_pnl_rate * 100 || 0)}>
                      {getNumberFormat(getNumberWithDecimal(statistic.last_1m_pnl_rate * 100 || 0, 2))}%
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="近3月">
                    <span className={getNumberColor(statistic.last_3m_pnl_rate * 100 || 0)}>
                      {getNumberFormat(getNumberWithDecimal(statistic.last_3m_pnl_rate * 100 || 0, 2))}%
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="近6月">--</Descriptions.Item>
                  <Descriptions.Item label="近1年">--</Descriptions.Item>
                </Descriptions>
                </TabPane>
                <TabPane tab="历史净值" key="2">
                  <Table
                    columns={columnsT1}
                    dataSource={dataSource([...t1Data].reverse())}
                  />
                </TabPane>
              </Tabs>
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
  .p-t-0 {
    padding-top: 0;
    .ant-card-body {
      padding-top: 0;
    }
  }
  .divider {
    border-color: #000;
    opacity: 0.8;
    margin: 0;
  }
  .content {
    padding-top: 24px;
    max-width: 1120px;
    margin: 0 auto !important;
  }
  .title-p-t-10 {
    padding-top: 20px;
  }
`;
