import { Brain, MessageSquare, Image, Video, Music, Code, FileText, Sparkles } from 'lucide-react';
import { Tool } from '../types';

export const tools: Tool[] = [
  {
    id: 'ai-chat',
    icon: <MessageSquare className="w-6 h-6" />,
    name: "AI Chat",
    description: "Engage in natural conversations with advanced AI",
    category: "Chat",
    isNew: true,
    features: [
      "Natural language processing",
      "Context-aware responses",
      "Multi-language support",
      "Customizable personality"
    ],
    useCases: [
      "Customer support automation",
      "Virtual assistants",
      "Language learning",
      "Content generation"
    ]
  },
  {
    id: 'image-generation',
    icon: <Image className="w-6 h-6" />,
    name: "Image Generation",
    description: "Create stunning images from text descriptions",
    category: "Image",
    features: [
      "Text-to-image generation",
      "Style transfer",
      "Image editing",
      "Batch processing"
    ],
    useCases: [
      "Digital art creation",
      "Marketing materials",
      "Product visualization",
      "Concept art"
    ]
  },
  {
    id: 'video-creation',
    icon: <Video className="w-6 h-6" />,
    name: "Video Creation",
    description: "Generate and edit videos with AI assistance",
    category: "Video",
    features: [
      "Automated video editing",
      "Text-to-video generation",
      "Style transfer",
      "Voice synthesis"
    ],
    useCases: [
      "Social media content",
      "Educational videos",
      "Marketing campaigns",
      "Product demonstrations"
    ]
  },
  {
    id: 'music-generation',
    icon: <Music className="w-6 h-6" />,
    name: "Music Generation",
    description: "Create original music and audio with AI",
    category: "Audio",
    features: [
      "Music composition",
      "Sound design",
      "Audio mastering",
      "Genre adaptation"
    ],
    useCases: [
      "Background music",
      "Sound effects",
      "Podcast production",
      "Game audio"
    ]
  },
  {
    id: 'code-assistant',
    icon: <Code className="w-6 h-6" />,
    name: "Code Assistant",
    description: "Get help with programming and debugging",
    category: "Development",
    features: [
      "Code completion",
      "Bug detection",
      "Code refactoring",
      "Documentation generation"
    ],
    useCases: [
      "Software development",
      "Code review",
      "Learning programming",
      "Technical documentation"
    ]
  },
  {
    id: 'text-analysis',
    icon: <FileText className="w-6 h-6" />,
    name: "Text Analysis",
    description: "Analyze and process text content",
    category: "Text",
    features: [
      "Sentiment analysis",
      "Content summarization",
      "Language detection",
      "Named entity recognition"
    ],
    useCases: [
      "Market research",
      "Content moderation",
      "Data extraction",
      "Document processing"
    ]
  },
  {
    id: 'ai-learning',
    icon: <Brain className="w-6 h-6" />,
    name: "AI Learning",
    description: "Educational resources for AI learning",
    category: "Education",
    features: [
      "Interactive tutorials",
      "Personalized learning paths",
      "Progress tracking",
      "Practice exercises"
    ],
    useCases: [
      "Self-paced learning",
      "Skill development",
      "Professional training",
      "Academic support"
    ]
  },
  {
    id: 'ai-labs',
    icon: <Sparkles className="w-6 h-6" />,
    name: "AI Labs",
    description: "Experimental AI features and tools",
    category: "Experimental",
    isNew: true,
    features: [
      "Prototype testing",
      "Research tools",
      "Model experimentation",
      "Performance analysis"
    ],
    useCases: [
      "Research projects",
      "Innovation testing",
      "Model development",
      "Feature validation"
    ]
  }
];