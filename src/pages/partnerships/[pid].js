import { useRouter } from 'next/router'
import { Breadcrumbs, Anchor, Loader, Text, Tabs} from '@mantine/core';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'

const Partnership = () => {
  const router = useRouter()
  const { pid } = router.query
  const [partnership, setPartnership] = useState(null)

  const fetchPartnershipDetails = useCallback(() => {
    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/details')
        .then((res) => {
            setPartnership(res.data[0])
        })
        .catch((err) => {
            console.log(err)
        })
}, [setPartnership, pid])

  useEffect(() => {
    if (pid && !partnership) {
        fetchPartnershipDetails()
    }
}, [pid, fetchPartnershipDetails, partnership])

  const items = [
    { title: 'Partnerships', href: '/partnerships' },
    { title: `${partnership?.name}`, href: null }
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      <Text style={{fontFamily:'Visuelt', color: 'gray'}}>{item.title}</Text>
    </Anchor>
  ));
  
  return !partnership? (
    <div>
      <Loader />
    </div>
     ) : (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 30
    }}>
      <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{partnership.name}</Text>
      <Breadcrumbs separator="→">{items}</Breadcrumbs>


    </div>   
)
}

export default Partnership


