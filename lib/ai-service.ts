import { supabase } from './supabase';
import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AIService {
  private client: OpenAI;
  private endpoint: string;
  private modelName: string;
  private systemPrompt: string;

  constructor(token: string) {
    if (!token) {
      throw new Error('API token is required');
    }

    this.endpoint = 'https://models.inference.ai.azure.com';
    this.modelName = 'gpt-4o';
    
    this.client = new OpenAI({
      apiKey: token,
      baseURL: this.endpoint,
      dangerouslyAllowBrowser: true // Enable browser usage
    });

    this.systemPrompt = `You are an AI medical assistant. Your role is to:
1. Help analyze symptoms and provide preliminary guidance
2. Use medical terminology appropriately
3. Always include disclaimers about the preliminary nature of AI analysis
4. Recommend professional medical consultation when appropriate
5. Focus on gathering relevant medical information
6. Provide clear, structured responses
7. Be empathetic and professional

Important notes:
- Maintain professional medical terminology
- Be clear about limitations of AI analysis
- Structure responses clearly
- Always recommend professional medical review for serious symptoms
- Never make definitive diagnoses
- If symptoms are severe or concerning, respond with "CONSULTATION_REQUESTED" at the start of your message`;
  }

  async analyzeSymptoms(messages: Message[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content || 'No response generated';
    } catch (error) {
      console.error('AI Service Error:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your environment variables.');
        }
        if (error.message.includes('502')) {
          throw new Error('Server is temporarily unavailable. Please try again in a few moments.');
        }
      }
      throw new Error('Failed to analyze symptoms. Please try again.');
    }
  }

  async analyzeImage(imageUrl: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this medical image and provide detailed observations.'
              },
              {
                type: 'image_url',
                image_url: imageUrl
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content || 'No analysis generated';
    } catch (error) {
      console.error('AI Service Error:', error);
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your environment variables.');
        }
        if (error.message.includes('502')) {
          throw new Error('Server is temporarily unavailable. Please try again in a few moments.');
        }
      }
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  async saveChatHistory(userId: string, messages: Message[]) {
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          messages: messages,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }
}

export const createAIService = (token: string) => {
  return new AIService(token);
};