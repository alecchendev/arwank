import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Home, Edit } from './pages'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/edit" element={<Edit/>}/>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);