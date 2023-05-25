import { useEffect, useState } from 'react'
import { Button } from './Button'
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from './ChatLine'
import { useCookies } from 'react-cookie'
import {PineconeClient} from '@pinecone-database/pinecone'

const COOKIE_NAME = 'nextjs-example-ai-chat-gpt3'

interface ChatProps {
    apiId: string;
}

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: 'assistant',
    content: 'Hi! I am Tandem\'s AI assistant. I can help you with any questions you have about your API.',
  },
]

async function embedQuery(message: string){
    var requestOptions: any = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+process.env.NEXT_PUBLIC_OPEN_AI_API_KEY
        },
        body: JSON.stringify({
            'input': message,
            'model': 'text-embedding-ada-002'
        }),
        redirect: 'follow'
    };

    var embeddings;
    
    let embedding_response = await fetch("https://api.openai.com/v1/embeddings", requestOptions)
        .then(
            response => response.json()
        ).then(
            json => {
                console.log(json)
                embeddings = json.data[0].embedding;
            }
        ).catch(
            error => console.log('error', error)
        )

    return embeddings;
}

async function queryPinecone(message: string, apiId: string){

    //Get embeddings for question
    let embeddings = await embedQuery(message);

    var requestOptions: any = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'embeddings': embeddings
        }),
    };

    let query_response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/interfaces/${apiId}/query`, requestOptions).then(
        response => response.json()
    ).then(json => {
        return json
    })

    console.log(query_response)
    return query_response;
}

async function createContextQuery(contexts:[any], question: string){
    let prompt;
    let limit = 3750; // Your limit

    let prompt_start = (
        "Answer the question based on the following contexts.\n\n"
    );

    let prompt_end = (
        `\n\nQuestion: ${question}\nAnswer:`
    );

    // Compute the token count for prompt_start and prompt_end
    let tokenCount = prompt_start.length + prompt_end.length;

    let contextText = '';

    for (let context of contexts) {
        let match = context.metadata.text;
        let label = context.metadata.metadata_type; // Assuming the label for the group is stored here
        let labelledContext = `${label} Context:\n${match}\n\n`;
        if (tokenCount + labelledContext.length <= limit) {
            contextText += labelledContext;
            tokenCount += labelledContext.length;
        } else {
            let remainingTokens = limit - tokenCount;
            let truncatedContext = labelledContext.substring(0, remainingTokens);
            contextText += truncatedContext;
            break;
        }
    }
    prompt = prompt_start + contextText + prompt_end;
    return prompt;
}


const InputMessage = ({ input, setInput, sendMessage, apiId }: any) => (
  <div style={{display:'flex', flexDirection: 'column', width: '100%', alignItems:'end'}}>
    <input
      type="text"
      required
      style={{ height: 50, width:'100%', borderRadius: 5, border: '1px solid #ccc', padding: 10}}
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(input,apiId)
          setInput('')
        }
      }}
      onChange={(e) => {
        setInput(e.target.value)
      }}
    />
    <div style={{height: 10}} />
    <Button
      type="submit"
      style={{ cursor: 'pointer', height: 50, width: '20%', borderRadius: 5}}
      onClick={() => {
        sendMessage(input, apiId)
        setInput('')
      }}
    >
      Send
    </Button>
  </div>
)


export const Chat: React.FC<ChatProps> = ({ apiId }) => {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages)
  const [formattedMessages, setFormattedMessages] = useState<ChatGPTMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string, apiId: string) => {

    const matches = await queryPinecone(message, apiId)

    const groupedMatches = []
    let apiActionMatch, apiWebhookMatch, apiSecurityMatch, apiDocumentationMatch, apiBaseUrlMatch;

    for (const match of matches) {
      if ((!apiActionMatch || match.score > apiActionMatch.score) && match.metadata.metadata_type === 'http_action') {
        apiActionMatch = match
        groupedMatches.push(match)
      } 
      if ((!apiWebhookMatch || match.score > apiWebhookMatch.score) && match.metadata.metadata_type === 'api_webhook') {
        apiWebhookMatch = match;
        groupedMatches.push(match)
      }
      if ((!apiSecurityMatch || match.score > apiSecurityMatch.score) && match.metadata.metadata_type === 'api_authentication') {
        apiSecurityMatch = match;
        groupedMatches.push(match)
      }
      if ((!apiDocumentationMatch || match.score > apiDocumentationMatch.score) && match.metadata.metadata_type === 'additional_documentation') {
        apiDocumentationMatch = match;
        groupedMatches.push(match)
      }
      if ((!apiBaseUrlMatch || match.score > apiBaseUrlMatch.score) && match.metadata.metadata_type === 'base_url') {
        apiBaseUrlMatch = match;
        groupedMatches.push(match)
      }
    }

    console.log("groupedMatches", groupedMatches)
    

    var prompt : any = message;

    if (matches.length > 0) {
        prompt = await createContextQuery(matches, message);
        console.log("prompt", prompt)
    } 

    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]

    const promptMessages = [
        ...messages,
        { role: 'user', content: prompt } as ChatGPTMessage,
      ]

    setFormattedMessages(promptMessages)
    setMessages(newMessages)

    const last10messages = promptMessages.slice(-10) // remember last 10 messages

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: last10messages,
        user: cookie[COOKIE_NAME],
      }),
    })

    console.log('Edge function returned.')

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    let lastMessage = ''

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      lastMessage = lastMessage + chunkValue

      setMessages([
        ...newMessages,
        { role: 'assistant', content: lastMessage } as ChatGPTMessage,
      ])

      setLoading(false)
    }
  }

  return (
    <div>
        <div style={{display: 'flex', flexDirection: 'column', borderRadius: 8, paddingLeft: 10}}>
            {messages.map(({ content, role }, index) => (
                <ChatLine key={index} role={role} content={content} />
            ))}
        </div>

      {loading && <LoadingChatLine />}
      <div style={{height: 20}} />
      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        apiId={apiId}
      />
    </div>
  )
}