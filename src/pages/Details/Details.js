import React, { useEffect, useState } from 'react';
import { Layout, Row, Divider, Card, Typography, Col, Table } from 'antd';
import axios from 'axios';
import echarts from 'echarts'
import { useParams } from 'react-router-dom';
import styled from "styled-components";
import dayjs from 'dayjs';
import { getNumberColor, getNumberFormat, getIncomeRate, getNumberWithDecimal } from '../../utils';
import { Statistic, LineChart } from '../../components';

const { Text } = Typography;
const { Content } = Layout;

export const DetailsComponent = ({className}) => {
  const [personData, setPersonData] = useState([]);
  const [incomeValue, setIncomeValue] = useState([]);
  const [dw, setDw] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useParams();
  useEffect(()=> {
    const fetchCharts = async () => {
    const [{data: person}, {data: dwData}] = await Promise.all([
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/${user}/main.json`),
      axios.get(`https://raw.githubusercontent.com/odofmine/ocd/master/fund/__t1__/${user}/dw.json`)
    ]);
    setPersonData(person);
    setDw([...dwData].reverse().map((item,i) => {
      return {
        ...item,
        key: i
      }
    }))
    let value = 0;
    const incomeValue = person.map((x,i)=>{
      if(i+1 >= person.length){
        return undefined
      }
      value += getNumberWithDecimal(person[i+1][4] - person[i][4], 1)
      return [person[i][0] * 1000, value]
    })
    incomeValue.unshift([person[0][0]*1000 - 24 * 60 * 60 * 1000, 0])
    setIsLoading(false);
    setIncomeValue(incomeValue)
  };

  fetchCharts();
  }, [user])

  const option = {
      title: {
        text: '累计收益',
      },
      tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const date = new Date(params[0].data[0]);
            const dateFormat = echarts.format.formatTime("yyyy-MM-dd hh:mm:ss", date)
            var returnHtmT1 = params[0] ? `${getNumberWithDecimal(params[0].data[1],1)}` : '--';
            return `<span>${dateFormat}</span><br/><span>累计收益：${returnHtmT1}</span> <br/>`;
          },
      },
      legend: {
        data: [{
          name: '累计收益',
          // 强制设置图形为圆。
          icon: 'circle',
        }],
        formatter: (name) => {

          return incomeValue.length === 0 ? `${name} +0.00%` : `${name} ${getNumberFormat(incomeValue[incomeValue.length -2][1])}`
        },
        right: 0,
        top: 3
      },
      grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
      },

      xAxis: {
          type: 'time',
      },
      yAxis: {
          type: 'value',
          axisLabel: {
             show:true,
             formatter:'{value}'
          },
      },
      series: [
          {
              name: '累计收益',
              type: 'line',
              data: incomeValue,
              itemStyle: {
                color: '#ED662C'
              },
              showSymbol: false,
              hoverAnimation: true,
          }
      ]
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '市值',
      dataIndex: 'marketValue',
      key: 'marketValue',
      render: (text, row, index) => {
        const { value, share } = row
        const result = value * share;
        return isNaN(result) ? '--' : getNumberWithDecimal(result,1).toLocaleString()
      }
    },
    {
      title: '收益额',
      dataIndex: 'incomeValue',
      key: 'incomeValue',
      render: text => {
        return (<span className={getNumberColor(text)}>{getNumberFormat(text)}</span>)
      }
    }
  ]

  const columnsExchangeDetails = [
    {
      title: '日期',
      dataIndex: 'datetime',
      key: 'datetime',
    },
    {
      title: '金额',
      dataIndex: 'Value',
      key: 'Value',
      render: (text, row, index) => {
        const { price, amount } = row
        const result = Number(price) * Number(amount);
        return <span className={getNumberColor(result)}>{isNaN(result) ? '--' : getNumberFormat(getNumberWithDecimal(result, 1))}</span>
      }
    }
  ]

  const dataSource = data => {
    if(data.length > 0){
      const result = data.reduce((acc, curr, index, arr) => {
        const obj = {
          date: dayjs(curr[0] * 1000).format('YYYY-MM-DD'),
          value: index === 0 ? '--' : getNumberWithDecimal(arr[index-1][1], 4),
          cost: curr[2],
          share: getNumberWithDecimal(curr[3], 0),
          key:curr[0],
          incomeRate: index !== 0 ? `${getNumberWithDecimal((arr[index - 1][1] / curr[1] - 1) * 100, 2)}` : '--',
          incomeValue: index !== 0 ? `${getNumberWithDecimal(arr[index - 1][4] - curr[4], 1)}` : '--',
        }
        return [...acc, obj]
      },[])
      return result;
    } else {
      return []
    }
  }
  const getLastestDataHandleValue = (data) => {
    const len = data.length;
    return len > 0 ? getNumberWithDecimal(data[len-1][1], 4) * getNumberWithDecimal(data[len-1][3], 0) : 0
  }
  const getLastestDataCost = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][2] : 0
  }
  const getLastestDataShare = (data) => {
    const len = data.length;
    return len > 0 ? data[len-1][3] : 0
  }

  const personIncomeRate = getIncomeRate(personData);

  return (
    <Layout className={className}>
      <Divider className="divider"/>
      <Content>
        <Row  gutter={24} className="content">
        <Col sm={24} xs={24} >
          <Card className="card">
          <Row className="card-title-wrapper">
            <Col sm={24} xs={24}><Text className="card-title">{user} T1 策略持仓</Text></Col>
          </Row>
            <Row className="p-24">
              <Col sm={5} xs={12}>
              <Statistic
                title='持仓市值（USD）'
                value={getLastestDataHandleValue(personData)}
                precision={0}
              />
              </Col>
              <Col sm={5} xs={12}>
                 <Statistic
                    title='累计收益（USD）'
                   value={personData.length > 0 ? personData[personData.length-1][4] + personData[personData.length-1][5] : 0}
                    precision={1}
                   isNormal={false}
                  />
              </Col>
              <Col sm={4} xs={12}>
                 <Statistic
                    title='持仓收益率'
                   value={personIncomeRate}
                    precision={2}
                    suffix='%'
                   isNormal={false}
                  />
              </Col>
              <Col sm={5} xs={24}>
              <Statistic
                title='持仓份额'
                value={getLastestDataShare(personData)}
                precision={0}
              />
              </Col>
              <Col sm={5} xs={24}>
              <Statistic
                title='持仓成本(USD)'
                value={getLastestDataCost(personData)}
                precision={5}
              />
              </Col>
            </Row>
            <Row>
              <Col xs={24} className="card-left">
              {
                <LineChart
                  option={option}
                  showLoading={isLoading}
                />
              }
              </Col>
            </Row>
          </Card>
        </Col>
        </Row>
        <Row gutter={24} className="content">
        <Col sm={12} xs={24}>
        <Card className="card" >
        <Row className="card-title-wrapper">
          <Text className="card-title">收益明细</Text>
        </Row>
        <Table columns={columns} dataSource={dataSource([...personData].reverse())} />
        </Card>
        </Col>
        <Col sm={12} xs={24}>
        <Card className="card">
          <Row className="card-title-wrapper">
            <Text className="card-title">交易明细</Text>
          </Row>
          <Table columns={columnsExchangeDetails} dataSource={dw} />
        </Card>
        </Col>
        </Row>
      </Content>
    </Layout>
  )
}

export const Details = styled(DetailsComponent)`
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
  opacity:0.8;
  margin: 0;
}
.content {
  padding-top: 40px;
  max-width: 1120px;
  margin: 0 auto!important;
  .content-right {

  }
  .card {
    width: 100%;
    border-radius: 6px;
    box-shadow:0px 6px 13px 0px rgba(0, 0, 0, 0.03);
    border-radius:6px;
    .card-title-wrapper {
      border-bottom: 1px solid rgba(0,0,0,0.1);
      padding: 15px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-title {
      font-size:18px;
      font-family:PingFang SC;
      font-weight:400;
      color:rgba(19,24,31,1);
      padding-right: 6px;
    }
  }
}

.ant-card-body {
  padding: 0;
}
.card-left {
  padding: 0 20px;
}
.card-right {
  padding: 0 20px;
  border-left: 1px solid rgba(0, 0, 0, .1);
  display: flex;
  align-items: center;
}

.more {
  font-size:14px;
  font-family:PingFang SC;
  font-weight:400;
  color:rgba(19,24,31,1);
  opacity:0.6;
  margin: 80px auto;
  text-align: center;
}

.card-right-content {
  font-size:18px;
  font-family:PingFang SC;
  font-weight:600;
}
.green {
  color: #3f8600;
}
.red {
  color: #cf1322;
}
.grey {
  color:rgba(19,24,31, 0.6);
}
@media (max-width: 375px){
  .card-left {
    padding: 0;
  }
}
`
