export type Config = {
  system_prompt: string
  user_name: string
  bot_name: string
  generation_parameters: {
    consumer_group: string
    max_new_tokens: number
    sampling_topk: number
    sampling_topp: number
    sampling_temperature: number
    regex_string: string
    json_schema: string
  }
}

export type ChatConfig = {
  system_prompt: string
  user_name: string
  bot_name: string
  host: string
  generation_parameters: {
    consumer_group: string
    max_new_tokens: number
    sampling_topk: number
    sampling_topp: number
    sampling_temperature: number
    regex_string: string
    json_schema: string
  }
}

export type VariableMappings = {
  [key: string]: string
}

export type SetConfig = (prevState: (prev: Config) => Config) => void
export type SetChatConfig = (prevState: (prev: ChatConfig) => ChatConfig) => void

export type SetVariableMappings = (prevState: (prev: VariableMappings) => VariableMappings) => void

export type Role = 'user' | 'assistant'

export interface Message {
  role: Role
  content: string
}
