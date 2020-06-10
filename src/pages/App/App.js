import React, { Suspense, lazy } from 'react';
import logo from './logo.png';
import { Layout, Menu, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {
  Route,
  Routes,
  Link,
  useNavigate
} from 'react-router-dom';
import styled from 'styled-components';

const Home = lazy(() => import('../Home'))
const Details = lazy(() => import('../Details'))
const T1 = lazy(() => import('../T1'))

const { Header } = Layout;

const antIcon = <LoadingOutlined style={{ fontSize: 100 }} spin />;

const App = styled(({className}) => {
  const { hash } = window.location;
  const navigate = useNavigate()
  return (
    <Layout className={className}>
    <Suspense fallback={
      <div className="loading">
      <Spin indicator={antIcon} />
      </div>
    }>
      <Header className="header">
        <Link to={`/`}>  <img src={logo} alt="logo" className="logo"/></Link>
        <Menu theme="dark" mode="horizontal" selectedKeys={hash}>
          <Menu.Item key="#/t1" onClick={()=>navigate('/t1')}>T1 策略</Menu.Item>
        </Menu>
      </Header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="t1" exact element={<T1 />} />
          <Route path="account/:user" element={<Details />} />
        </Routes>
    </Suspense>
    </Layout>
  );
})`
.header {
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background: rgb(14,16,20);
}
.logo {
  height: 20px;
  margin: 16px 24px 16px 0;
  float: left;
}
.ant-menu-item {
  background: rgb(14,16,20);
}
.loading {
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
}
`

export default App;
