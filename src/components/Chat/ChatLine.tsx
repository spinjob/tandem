import clsx from 'clsx'
import Balancer from 'react-wrap-balancer'
import { Image, Text, TextInput, Select, Button, Textarea } from '@mantine/core'
import tandemLogo from '../../../public/logos/SVG/Icon/Icon_Bubble_Purple.svg'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import React from 'react'

// wrap Balancer to remove type errors :( - @TODO - fix this ugly hack
const BalancerWrapper = (props: any) => <Balancer {...props} />

type ChatGPTAgent = 'user' | 'system' | 'assistant'

export interface ChatGPTMessage {
  role: ChatGPTAgent
  content: string
}

// loading placeholder animation for the chat line
export const LoadingChatLine = () => (
  <div className="flex min-w-full animate-pulse px-4 py-5 sm:px-6">
    <div className="flex flex-grow space-x-3">
      <div className="min-w-0 flex-1">
        <p className="font-large text-xxl text-gray-900">
          <a href="#" className="hover:underline">
            Thinking...
          </a>
        </p>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-zinc-500"></div>
            <div className="col-span-1 h-2 rounded bg-zinc-500"></div>
          </div>
          <div className="h-2 rounded bg-zinc-500"></div>
        </div>
      </div>
    </div>
  </div>
)

export function ChatLine({ role = 'assistant', content }: ChatGPTMessage) {
  if (!content) {
    return null
  }

  return (
        <div style={{display: 'flex', flexDirection:'column', borderRadius:5, marginTop: 10, marginBottom: 10, alignItems: role == 'assistant' ? 'left' : 'end'}}>
            <div style={{display: 'flex', flexDirection:'column', border: role == 'assistant' ? '1px solid #EAEAFF' : '1px solid black', backgroundColor: role == 'assistant' ? '#EAEAFF' : 'white', borderRadius: 8, paddingLeft: 20, paddingTop: 20, paddingRight: 20, alignItems: role == 'assistant' ? 'left' : 'end'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'left'}}>
                {
                    role == 'assistant' ? (
                        <div style={{height: 20, width: 20, marginRight: 5}}>
                            <Image src={tandemLogo} />
                        </div> ) : null
                }
                
                <div>
                  {role == 'assistant' ? (<Text style={{fontFamily:'Vulf Sans'}}>tandem</Text>) : (<Text style={{fontFamily:'Visuelt'}}>You</Text>)}
                </div>
              </div>
              <div>
                <ReactMarkdown remarkPlugins={[gfm]}>
                    {content}
                </ReactMarkdown>
              </div>
            </div>
        </div>
  )
}