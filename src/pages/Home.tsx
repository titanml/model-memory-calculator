import React from 'react'
import ActionButton from '../components/ActionButton'

const Home = () => {
  return (
    <div>
      <div className='flex flex-col items-center h-screen w-2000'>
        <h1 className='text-4xl mb-4'>TitanML</h1>
        <ActionButton
          title='Memory Calculator'
          description='Find out how much memory you need for your AI models.'
          link='/calculator'
          clientRendered={true}
        />
        <ActionButton
          title='Takeoff Documentation'
          description='View our official documentation for Titan Takeoff Server.'
          link='https://docs.titanml.co/docs/intro'
          clientRendered={false}
        />
      </div>
    </div>
  )
}

export default Home
