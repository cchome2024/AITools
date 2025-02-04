from openai import OpenAI
import os

class ChatAgent:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        self.model = "gpt-4o"  # 或其他可用模型
        
    def get_response(self, message):
        try:
            client = OpenAI(api_key=self.api_key)  # 创建 client 实例
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个有帮助的AI助手。"},
                    {"role": "user", "content": message}]
            )
            print(response.choices[0].message.content)
            return response.choices[0].message.content
            
        except Exception as e:
            print(e)
            raise Exception(f"OpenAI API error: {str(e)}") 