import React from 'react';
import './App.css';
import { Home } from '../Home';
import logo from './logo.png';
import { Layout } from 'antd';

const { Header } = Layout;
function App() {
  return (
    <div className="app">
    <Header className="header">
      <img src={logo} alt="logo" className="logo"/>
    </Header>
      <Home />
    </div>
  );
}

export default App;
