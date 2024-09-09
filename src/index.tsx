import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, Routes, HashRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './context/themeContext'
import Appbar from './components/Appbar'
import Calculator from './pages/Calculator'
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path='/' element={<Appbar />}>
            <Route index element={<Calculator />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
)