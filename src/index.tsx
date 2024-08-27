import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, Routes, HashRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './context/themeContext'
import { DeploymentGroupProvider } from './context/deploymentGroupContext'
import { ErrorProvider } from './context/errorContext'
import Appbar from './components/Appbar'
import Home from './pages/Home'
import Calculator from './pages/Calculator'
import NotFound from './pages/NotFound'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <DeploymentGroupProvider>
        <ErrorProvider>
          <HashRouter>
            <Routes>
              <Route path='/' element={<Appbar />}>
                <Route index element={<Calculator />} />
                {/* <Route path='calculator' element={<Calculator />} /> */}
                <Route path='*' element={<NotFound />} />
              </Route>
            </Routes>
          </HashRouter>
        </ErrorProvider>
      </DeploymentGroupProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
