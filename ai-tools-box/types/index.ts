import { ReactNode } from 'react'

export interface Tool {
  id: string
  title: string
  description: string
  icon: ReactNode
  link: string
} 