// Originally from: /api/chat.ts
// This file is used to generate the chat stream

import { type ChatGPTMessage } from '../components/Chat/ChatLine'
import { OpenAIStream, OpenAIStreamPayload } from '../utils/OpenAIStream'

// break the app if the API key is missing
if (!process.env.NEXT_PUBLIC_OPEN_AI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()
  const systemPrompt = `You are a helpful AI assistant that assists developers in troubleshooting issues with their integration into an API.  You will be provided context for each question from the API documentation but use previous user messages as context as well.  Do not forget previous questions or answers.  This API 'Context' will not be provided directly to the user so do not assume the user has this context.  If there is no 'Context' or it isn't relevant to the question, use the context of your previous answers and the users previous messages to answer the question`

  const messages: ChatGPTMessage[] = [
    {
      role: 'system',
        content: systemPrompt
    },
  ]
  
  messages.push(...body?.messages)

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}
export default handler