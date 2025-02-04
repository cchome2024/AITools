import React from 'react'
import { 
  ImageIcon, 
  PaletteIcon, 
  VideoIcon, 
  CardStackIcon 
} from '../components/icons'

export interface Tool {
  id: string
  title: string
  description: string
  icon: string
  link: string
}

export const tools: Tool[] = [
  {
    id: 'image-gen',
    title: '智谱AI图片生成',
    description: '使用智谱AI的CogView-3模型生成高质量图片',
    icon: '🖼️',
    link: '/tools/image-gen'
  },
  {
    id: 'palette',
    title: '调色板生成器',
    description: '从图片中提取配色方案，生成和谐的色彩组合',
    icon: '🎨',
    link: '/tools/palette'
  }
] 