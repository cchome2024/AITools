import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tools } from '../data/tools';
import { ChatInterface } from '../components/ChatInterface';
import { ImageGenerationInterface } from '../components/ImageGenerationInterface';

export function ToolPage() {
  const { id } = useParams<{ id: string }>();
  const tool = tools.find(t => t.id === id);

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  const renderInterface = () => {
    if (tool.id === 'image-generation') {
      return <ImageGenerationInterface />;
    }
    return <ChatInterface />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                {React.cloneElement(tool.icon as React.ReactElement, {
                  className: 'w-5 h-5 text-blue-600'
                })}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{tool.name}</h1>
                <p className="text-sm text-gray-500">{tool.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Tool Information */}
          <div className="space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About this tool</h2>
              <p className="text-gray-600">{tool.description}</p>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h2>
              <ul className="space-y-3">
                {tool.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Use Cases</h2>
              <ul className="space-y-3">
                {tool.useCases?.map((useCase, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    </div>
                    <span className="ml-3 text-gray-600">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Tool Interface */}
          <div>
            {renderInterface()}
          </div>
        </div>
      </div>
    </div>
  );
}