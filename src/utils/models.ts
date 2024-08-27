type ModelInfo = {
  name: string;
  params: number;
  hidden_size: number;
  intermediate_size: number;
  num_hidden_layers: number;
};

export const MODELS: ModelInfo[] = [
  // LLaMA 3.1 Models
  {
    name: 'LLaMA 3.1 (70B)',
    params: 70,
    hidden_size: 8192,
    intermediate_size: 28672,
    num_hidden_layers: 80,
  },
  {
    name: 'LLaMA 3.1 (8B)',
    params: 8,
    hidden_size: 4096,
    intermediate_size: 14336,
    num_hidden_layers: 32,
  },

  // LLaMA 3 Models
  {
    name: 'LLaMA 3 (70B)',
    params: 70,
    hidden_size: 8192,
    intermediate_size: 28672,
    num_hidden_layers: 80,
  },
  {
    name: 'LLaMA 3 (8B)',
    params: 8,
    hidden_size: 4096,
    intermediate_size: 14336,
    num_hidden_layers: 32,
  },

  // LLaMA 2 Models
  {
    name: 'LLaMA 2 (70B)',
    params: 70,
    hidden_size: 8192,
    intermediate_size: 28672,
    num_hidden_layers: 80,
  },
  {
    name: 'LLaMA 2 (13B)',
    params: 13,
    hidden_size: 5120,
    intermediate_size: 13824,
    num_hidden_layers: 40,
  },
  {
    name: 'LLaMA 2 (7B)',
    params: 7,
    hidden_size: 4096,
    intermediate_size: 11008,
    num_hidden_layers: 32,
  },

  // Mistral Models
  {
    name: 'Mistral (13B NeuralPivot)',
    params: 13,
    hidden_size: 4096,
    intermediate_size: 14336,
    num_hidden_layers: 60,
  },
  {
    name: 'Mistral (7B)',
    params: 7,
    hidden_size: 4096,
    intermediate_size: 14336,
    num_hidden_layers: 32,
  },
  {
    name: 'Mistral (13B Amethyst)',
    params: 13,
    hidden_size: 5120,
    intermediate_size: 13824,
    num_hidden_layers: 40,
  },

  // Qwen Models
  {
    name: 'Qwen (7B)',
    params: 7,
    hidden_size: 4096,
    intermediate_size: 22016,
    num_hidden_layers: 32,
  },
  {
    name: 'Qwen (1.5 7B)',
    params: 7,
    hidden_size: 4096,
    intermediate_size: 11008,
    num_hidden_layers: 32,
  },

  // Llava Models
  {
    name: 'Llava (1.6 34B)',
    params: 34,
    hidden_size: 7168,
    intermediate_size: 20480,
    num_hidden_layers: 60,
  },
  {
    name: 'Llava (1.5 13B)',
    params: 13,
    hidden_size: 5120,
    intermediate_size: 13824,
    num_hidden_layers: 40,
  },
  {
    name: 'Llava (7B)',
    params: 7,
    hidden_size: 4096,
    intermediate_size: 11008,
    num_hidden_layers: 32,
  },

  // Gemma Models
  {
    name: 'Gemma (27B)',
    params: 27,
    hidden_size: 4608,
    intermediate_size: 36864,
    num_hidden_layers: 46,
  },
  {
    name: 'Gemma (2.9B)',
    params: 2.9,
    hidden_size: 3584,
    intermediate_size: 14336,
    num_hidden_layers: 42,
  },
  {
    name: 'Gemma (2B)',
    params: 2,
    hidden_size: 2048,
    intermediate_size: 16384,
    num_hidden_layers: 18,
  },

  // Mixtral Models
  {
    name: 'Mixtral (46B)',
    params: 46,
    hidden_size: 4096,
    intermediate_size: 14336,
    num_hidden_layers: 32,
  },
];

export default MODELS;
