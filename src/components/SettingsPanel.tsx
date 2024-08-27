import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'

import { SetVariableMappings, VariableMappings, Config, SetConfig } from '../types/types'
import JsonBox from './JsonBox'

// Types for SettingsPanel
type SettingsPanelProps = {
  config: Config
  setConfig: SetConfig
  variableMappings: VariableMappings
  setVariableMappings: SetVariableMappings
  isValidJson: boolean
  setIsValidJson: (arg0: boolean) => void
  isValidRegex: boolean
  setIsValidRegex: (arg0: boolean) => void
}

const SettingsPanel = ({
  config,
  setConfig,
  isValidJson,
  setIsValidJson,
  isValidRegex,
  setIsValidRegex,
}: SettingsPanelProps) => {
  const [showConfig, setShowConfig] = useState(true)

  useEffect(() => {
    try {
      console.log('trying regex')
      new RegExp(config.generation_parameters.regex_string)
      setIsValidRegex(true)
    } catch (e) {
      setIsValidRegex(false)
    }
  }, [config.generation_parameters.regex_string])
  return (
    <div id='settings-panel' className='mt-4 mx-4'>
      <button
        id='config-accordion'
        className='accordion flex flex-row justify-between w-full items-center'
        onClick={() => setShowConfig(!showConfig)}
      >
        <h3 className='text-xl'>Generation Config</h3>
        {showConfig ? <FontAwesomeIcon icon={faAngleDown} /> : <FontAwesomeIcon icon={faAngleUp} />}
      </button>
      {showConfig && (
        <div className='accordion-content mb-2' id='generation-config'>
          <form
            id='config-form'
            // onsubmit="saveConfig(event)"
          >
            <div className='py-1'>
              <label className='block py-2 text-sm' htmlFor='system-prompt'>
                System Prompt
              </label>
              <input
                id='system-prompt'
                type='text'
                className='block px-4 py-2 text-sm w-full config-input'
                value={config.system_prompt}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    system_prompt: e.target.value,
                  }))
                }
              />
              <label className='block py-2 text-sm' htmlFor='sampling_temperature'>
                Temperature
              </label>
              <input
                id='sampling-temperature'
                type='number'
                step={0.01}
                className='block px-4 py-2 text-sm w-full config-input'
                value={config.generation_parameters.sampling_temperature}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    generation_parameters: {
                      ...prev.generation_parameters,
                      sampling_temperature: parseFloat(e.target.value),
                    },
                  }))
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === null) {
                    setConfig((prev) => ({
                      ...prev,
                      generation_parameters: {
                        ...prev.generation_parameters,
                        sampling_temperature: 1.0,
                      },
                    }))
                  }
                }}
                placeholder='1.0'
              />
              <label className='block py-2 text-sm' htmlFor='sampling-topp'>
                Sampling top p
              </label>
              <input
                id='sampling-topp'
                type='number'
                step={0.01}
                min={0}
                max={1}
                className='block px-4 py-2 text-sm w-full config-input'
                value={config.generation_parameters.sampling_topp}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    generation_parameters: {
                      ...prev.generation_parameters,
                      sampling_topp: parseFloat(e.target.value),
                    },
                  }))
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === null) {
                    setConfig((prev) => ({
                      ...prev,
                      generation_parameters: {
                        ...prev.generation_parameters,
                        sampling_topp: 1.0,
                      },
                    }))
                  }
                }}
                placeholder='1.0'
              />
              <label className='block py-2 text-sm' htmlFor='sampling-topk'>
                Sampling top k
              </label>
              <input
                id='sampling-topk'
                type='number'
                className='block px-4 py-2 text-sm w-full config-input'
                value={config.generation_parameters.sampling_topk}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    generation_parameters: {
                      ...prev.generation_parameters,
                      sampling_topk: parseFloat(e.target.value),
                    },
                  }))
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === null) {
                    setConfig((prev) => ({
                      ...prev,
                      generation_parameters: {
                        ...prev.generation_parameters,
                        sampling_topk: 10,
                      },
                    }))
                  }
                }}
                min={0}
                placeholder='10'
              />
              <label className='block py-2 text-sm' htmlFor='generate-max-length'>
                Max generation length
              </label>
              <input
                id='generate-max-length'
                type='number'
                className='block px-4 py-2 text-sm w-full config-input'
                value={config.generation_parameters.max_new_tokens}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    generation_parameters: {
                      ...prev.generation_parameters,
                      max_new_tokens: parseFloat(e.target.value),
                    },
                  }))
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === null) {
                    setConfig((prev) => ({
                      ...prev,
                      generation_parameters: {
                        ...prev.generation_parameters,
                        max_new_tokens: 300,
                      },
                    }))
                  }
                }}
                min={1}
                placeholder='300'
              />
              <label className='block py-2 text-sm' htmlFor='regex-string'>
                Regex String
              </label>
              <input
                id='regex-string'
                type='text'
                className='block px-4 py-2 text-sm w-full config-input'
                value={config.generation_parameters.regex_string}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    generation_parameters: {
                      ...prev.generation_parameters,
                      regex_string: e.target.value,
                    },
                  }))
                }
                placeholder='Regex string'
              />
              {!isValidRegex && <p style={{ color: 'red' }}>Invalid Regex</p>}
              <label className='block py-2 text-sm' htmlFor='json-schema'>
                Json Schema
              </label>
              <JsonBox
                value={config.generation_parameters.json_schema}
                setConfig={setConfig}
                isValidJson={isValidJson}
                setIsValidJson={setIsValidJson}
              />
            </div>
          </form>
        </div>
      )}
      {/*<button
        className="accordion flex flex-row justify-between w-full items-center"
        id="template-accordion"
        onClick={(e) => setShowTemplateVariables(!showTemplateVariables)}
      >
          <h3 className="text-xl">Template variables</h3>
        {showTemplateVariables ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleUp}/>}
      </button>
      {showTemplateVariables && false &&
        <div className="accordion-content mb-2" id="template-variables">
          <div className="py-1" id="template-variables-form">
            {Object.entries(variableMappings).map(([variable, value]) => (
              <div key={variable}>
                <label className="block py-2 text-sm">{`{{${variable}}}`}</label>
                <input
                  className="block px-4 py-2 text-sm w-full config-input"
                  type="text"
                  value={value}
                  onChange={(e) => setVariableMappings((prev) => ({
                    ...prev,
                    [variable]: e.target.value
                  }))}
                />
              </div>
            ))}
          </div>
        </div>
      }
        <button
          className="accordion flex flex-row justify-between w-full items-center"
          onClick={(e) => setShowGenerationPlaceholders(!showGenerationPlaceholders)}
        >
          <h3 className="text-xl">Generation Placeholders</h3>
          {showGenerationPlaceholders ? <FontAwesomeIcon icon={faAngleDown}/> : <FontAwesomeIcon icon={faAngleUp}/>}
        </button>
        {showGenerationPlaceholders &&
          <div className="accordion-content mb-2" id="generation-placehoders">
            <div className="py-1" id="generation-placehoders-display"></div>
          </div>
        }*/}
    </div>
  )
}

export default SettingsPanel
