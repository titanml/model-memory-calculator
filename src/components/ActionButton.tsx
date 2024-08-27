import React from 'react'
import { useNavigate } from 'react-router-dom'

type ActionButtonProps = {
  title: string
  description: string
  link: string
  clientRendered: boolean
}

const ActionButton = ({ title, description, link, clientRendered }: ActionButtonProps) => {
  const navigate = useNavigate()
  return (
    <button onClick={clientRendered ? () => navigate(link) : () => (window.location.href = link)}>
      <div className='home-button flex-grow m-2 p-4 border'>
        <div className='home-button-title'>{title}</div>
        <div className='home-button-description'>{description}</div>
      </div>
    </button>
  )
}

export default ActionButton
