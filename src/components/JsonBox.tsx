import React, { useEffect } from 'react'
import { Config } from '../types/types'

type JsonInputProps = {
  value: string
  setConfig: (updater: (prev: Config) => Config) => void
  isValidJson: boolean
  setIsValidJson: (arg0: boolean) => void
}
const JsonInput = ({ value, setConfig, isValidJson, setIsValidJson }: JsonInputProps) => {
  useEffect(() => {
    const delay = setTimeout(() => {
      if (value.length === 0) {
        setIsValidJson(true)
      } else {
        try {
          JSON.parse(value)
          setIsValidJson(true)
        } catch (error) {
          setIsValidJson(false)
        }
      }
    }, 100) // Adjust the delay as needed

    return () => clearTimeout(delay)
  }, [value, setIsValidJson])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfig((prev) => ({
      ...prev,
      generation_parameters: {
        ...prev.generation_parameters,
        json_schema: e.target.value,
      },
    }))
  }

  return (
    <div>
      <textarea
        id='json-schema'
        className='block px-4 py-2 text-sm w-full config-input resize-none'
        rows={10}
        placeholder='Json Schema'
        onChange={handleInputChange}
      />
      {!isValidJson && <p style={{ color: 'red' }}>Invalid JSON</p>}
    </div>
  )
}

export default JsonInput
