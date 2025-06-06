// Import health check disabler first to ensure it patches axios before any other code runs
import './disableHealthCheck.js';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App'
import { store } from './store'

// No Google OAuth provider needed - using custom button instead
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-right" autoClose={5000} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
) 