
// import React from 'react';
// import ReactDOM from 'react-dom';

// import App from './App';
// import './App.scss';
// ReactDOM.render(
//   <App
//   />,
//   document.getElementById('root')
// )

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import './App.scss';


const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);