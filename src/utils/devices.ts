// Contains information about pre-set models
type DeviceInfo = {
  name: string
  size: number
}

export const DEVICES: DeviceInfo[] = [
  {
    name: 'NVIDIA RTX 3060 (8GB)',
    size: 8,
  },
  {
    name: 'NVIDIA RTX 3060 (12GB)',
    size: 12,
  },
  {
    name: 'NVIDIA GeForce RTX 4090 (24GB)',
    size: 24,
  },
  {
    name: 'NVIDIA A10 (24GB)',
    size: 24,
  },
  {
    name: 'NVIDIA L40 (48GB)',
    size: 48,
  },
  {
    name: 'NVIDIA A100 (40GB)',
    size: 40,
  },
  {
    name: 'NVIDIA A100 (80GB)',
    size: 80,
  },
  {
    name: 'NVIDIA H100 PCIe (80GB)',
    size: 80,
  },
  {
    name: 'NVIDIA H100 SXM (80GB)',
    size: 80,
  },
  {
    name: 'NVIDIA H100 NVL (188GB)',
    size: 188,
  },
]

export default DEVICES
