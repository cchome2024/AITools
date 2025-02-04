from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from agents.chat_agent import ChatAgent

# 加载环境变量
load_dotenv()

app = Flask(__name__)
CORS(app)

# 初始化聊天代理
chat_agent = ChatAgent()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        print(message)
        if not message:
            return jsonify({'error': '消息不能为空'}), 400
            
        response = chat_agent.get_response(message)
        return jsonify({'response': response})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 