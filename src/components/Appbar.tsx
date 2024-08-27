import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../context/themeContext'
import { Link } from 'react-router-dom'

import logoLightMode from '../assets/logo-light-mode.png'
import logoDarkMode from '../assets/logo-dark-mode.png'

const Appbar = () => {
  const [checked, setChecked] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleChange = () => {
    setChecked(!checked)
    toggleTheme()
  }

  return (
    <div>
      <div id='topbar' className='flex flew-row justify-between'>
        <div className='flex items-center'>
          <Link to='/'>
            <img
              src={theme === 'dark' ? logoDarkMode : logoLightMode}
              alt='Logo'
              style={{ height: '32px', marginLeft: '12px' }}
            />
          </Link>
          {/* <h3 className="text-xl mx-4">Deployments</h3> */}
          {/* <Link to='/calculator'>
            <h3 className='text-xl mx-4'>Calculator</h3>
          </Link> */}
          {/* <a href='https://docs.titanml.co/docs/intro'>
            <h3 className='text-xl mx-4'>Docs</h3>
          </a> */}
        </div>
        <div className='flex mr-4'>
          <label className='toggle-switch'>
            <input type='checkbox' checked={checked} onChange={handleChange} />
            <span className='slider'>
              <span className='slider-content'>
                {checked ? (
                  <FontAwesomeIcon icon={faSun} id='sun-icon' />
                ) : (
                  <FontAwesomeIcon icon={faMoon} id='moon-icon' />
                )}
              </span>
            </span>
          </label>
        </div>
      </div>
      <Outlet />
    </div>
  )
}

export default Appbar
