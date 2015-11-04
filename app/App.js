import React from 'react';
import ReactDOM from 'react-dom';
import SideButtons from './components/sideButtons'
import Sidebar from './components/sidebar'

ReactDOM.render(
  <div className="header">Header</div>,
  document.getElementById('header')
)

ReactDOM.render(
  <SideButtons/>,
  document.getElementById('side-buttons')
)

ReactDOM.render(
  <Sidebar/>,
  document.getElementById('sidebar')
)
