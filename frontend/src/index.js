import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Context from './Context';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.render(
  <React.StrictMode>
    <Context>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Context>
  </React.StrictMode>,
  document.getElementById('root')
);
