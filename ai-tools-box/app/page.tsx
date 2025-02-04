import { Tool, tools } from '@/config/tools'
import ToolCard from '@/components/ToolCard'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">AI工具箱</h1>
        <p className="text-gray-600">
          探索AI工具，提升工作效率
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool: Tool) => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </main>
  )
} 