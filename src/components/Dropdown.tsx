import React, { ChangeEvent, useEffect } from 'react'

interface DropdownProps {
  label: string
  options: string[]
  state: string
  setState: (state: string) => void
}

const Dropdown = ({ options, label, state, setState }: DropdownProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setState(event.target.value)
  }

  useEffect(() => {
    if (options.length > 0) {
      setState(options[0])
    }
  }, [options, setState])

  return (
    <div className='flex flex-row items-center'>
      <label htmlFor='dropdown' className='whitespace-nowrap mr-4'>
        {label}:
      </label>
      <select id='dropdown' className='dropdown-input' value={state} onChange={handleChange}>
        {options.length === 0 && <option value=''>Loading options...</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Dropdown
