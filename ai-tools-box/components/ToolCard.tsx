import { Tool } from '../config/tools'

type ToolCardProps = Tool

export default function ToolCard({ title, description, icon, link }: ToolCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-blue-50">
          <span className="text-sm">{icon}</span>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <a
        href={link}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
      >
        开始使用
        <span className="ml-1">→</span>
      </a>
    </div>
  )
} 