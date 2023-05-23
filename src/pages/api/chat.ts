import { type ChatGPTMessage } from '../../components/Chat/ChatLine'
import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream'

// break the app if the API key is missing
if (!process.env.NEXT_PUBLIC_OPEN_AI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  const messages: ChatGPTMessage[] = [
    {
      role: 'system',
      content: `You are a helpful AI assistant that assists developers solve issues and get answers to their questions related to an API they are integrating with.  The context provided in each question will provide details related to either an API Request, an API's security schema, or general documentation related to an APIs integration flows, onboarding, or other operational information.  This context will not be provided directly to the user - it will be queried for in the background.  So, do not assume the user knows this context; they will only be able to speak to their 'Question.' Please include the API Action in your answers that you've identified as relevant to the question, if one exists. `,
    },
  ]
  messages.push(...body?.messages)

  const payload: OpenAIStreamPayload = {
    model: 'gpt-4',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 100,
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