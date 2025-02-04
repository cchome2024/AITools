'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size,
        }),
      })
      
      const data = await response.json()
      setResult(data.imageUrl)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 inline-flex items-center">
            ← 返回工具集
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-center">AI图片生成</h1>
        <p className="text-gray-600 text-center mt-2 mb-12">
          使用智谱AI的CogView-3模型，将你的文字描述转换为精美图片
        </p>

        <div className="flex flex-col md:flex-row gap-12">
          {/* 左侧表单区域 */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="text-base mb-2">图片描述</div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-[140px] px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                placeholder="请输入详细的图片描述，例如：一只可爱的小猫咪，在阳光下玩耍"
              />
            </div>

            <div>
              <div className="text-base mb-2">图片尺寸</div>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
              >
                <option value="1024x1024">1024×1024</option>
                <option value="768x768">768×768</option>
                <option value="512x512">512×512</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-8 w-full bg-blue-500 text-white rounded-lg py-3 px-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              生成图片
            </button>
          </div>

          {/* 右侧结果区域 */}
          <div className="flex-1">
            <div className="text-base mb-2">生成结果</div>
            <div className="bg-white rounded-lg aspect-square flex items-center justify-center border border-gray-200">
              {loading ? (
                <div className="text-gray-500">生成中...</div>
              ) : result ? (
                <img src={result} alt="生成的图片" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-gray-500">生成的图片将在这里显示</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 