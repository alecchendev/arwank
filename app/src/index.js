import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Home, Edit, Story } from './pages'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Arweave from 'arweave';

// Since v1.5.1 you're now able to call the init function for the web version without options. The current URL path will be used by default. This is recommended when running from a gateway.
const arweave = Arweave.init({});
// const arweave = Arweave.init({
//   host: 'arweave.net',
//   port: '443',
// 	protocol: 'https'
// });

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home arweave={arweave} />}/>
      <Route path="/edit" element={<Edit arweave={arweave} />}/>
      <Route path="/edit/:storyId" element={<Edit arweave={arweave} />}/>
      <Route path="/story/:storyId" element={<Story arweave={arweave} />}/>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);