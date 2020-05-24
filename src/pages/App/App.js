import React, { Suspense, lazy } from 'react';
import './App.css';
import { Home } from '../Home';
import { Details } from '../Details';
import logo from './logo.png';
import { Layout } from 'antd';
import {
  Route,
  Routes
} from 'react-router-dom';

const { Header } = Layout;
function App() {
  return (
    <div className="app">
    <Suspense fallback={
        <>loading...</>
    }>
      <Header className="header">
        <img src={logo} alt="logo" className="logo"/>
      </Header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:user" element={<Details />} />
        </Routes>
    </Suspense>
    </div>
  );
}

export default App;
