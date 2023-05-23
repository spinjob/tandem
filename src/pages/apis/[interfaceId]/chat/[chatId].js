import {Text} from '@mantine/core'
import { useState, useEffect } from 'react'
import { Chat } from '../../../../components/Chat/Chat'
import { useRouter } from 'next/router'
import axios from 'axios'

const ApiChat = () => {

  const [apiName, setApiName] = useState('')
  const router = useRouter()
  const { interfaceId, chatId } = router.query

  useEffect(() => {
    if (apiName == '' && interfaceId) { 
       axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId).then((response) => {
        setApiName(response.data.name)
      }).catch((error) => {
        console.log(error)
      })
    }

  }, [apiName, interfaceId])

  return (
    <div style={{padding: 50}}>
        <Text sx={{fontFamily: 'Visuelt', fontSize: 30}}>{apiName} Bot</Text>
        <Text sx={{fontFamily: 'Visuelt', fontWeight: 100}} >
           This chat bot has been provided your API documentation and can answer questions with it.
        </Text>
        <div style={{height: 30}}/>
      <section>
        <div>
          <Chat apiId={interfaceId} />
        </div>
      </section>
    </div>
  )
}

export default ApiChat