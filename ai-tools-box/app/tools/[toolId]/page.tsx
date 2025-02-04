import { Tool, tools } from '../../../config/tools.tsx'
import { notFound } from 'next/navigation'

export default function ToolPage({ params }: { params: { toolId: string } }) {
  const tool = tools.find((t: Tool) => t.id === params.toolId)
  
  if (!tool) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{tool.title}</h1>
      {/* 工具具体实现 */}
    </div>
  )
} 