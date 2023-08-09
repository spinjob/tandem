import {Text} from '@mantine/core'
import { useState, useEffect } from 'react'
import { Chat } from '../../../../components/Chat/Chat'
import { useRouter } from 'next/router'
import axios from 'axios'

const PartnershipChat = () => {

  const [partnership, setPartnership] = useState(null)
  const router = useRouter()
  const { pid, chatId } = router.query

  useEffect(() => {
    if (pid && !partnership) { 
       axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/details').then((response) => {
        console.log(response.data)
        setPartnership(response.data[0])
      }).catch((error) => {
        console.log(error)
      })
    }

  }, [pid, partnership])

  return (
    <div style={{padding: 50}}>
        <Text sx={{fontFamily: 'Visuelt', fontSize: 30}}>{partnership?.name} Bot</Text>
        <Text sx={{fontFamily: 'Visuelt', fontWeight: 100}} >
           I am trained to answer questions related to the {partnership?.name} Partnership!
        </Text>
        <div style={{height: 30}}/>
      <section>
        <div>
          <Chat apiId={null} partnership={partnership} chatType={'partnership'} />
        </div>
      </section>
    </div>
  )
}

export default PartnershipChat