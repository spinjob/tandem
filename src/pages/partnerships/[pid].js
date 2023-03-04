import { useRouter } from 'next/router'
import { Breadcrumbs, ActionIcon, Avatar, Group, Container,Anchor, Loader, Text, Tabs, Center} from '@mantine/core';
import { useState, useEffect, useContext, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios'
import PartnershipWorkflows from './[pid]/workflows'
import PartnershipApis from './[pid]/apis'
import AppContext from '../../context/AppContext';
import PartnershipConfigurations from './[pid]/configurations'
import {BsThreeDots} from 'react-icons/bs'


const Partnership = () => {
  const router = useRouter()
  const { pid } = router.query
  const [partnership, setPartnership] = useState(null)
  const [apis, setApis] = useState(null)

  const testUserData = [
    {
      "name": "Spencer Johnson",
      "image": null
    },
    {
      "name": "Ron Purdy",
      "image": null
    },
  ]
  
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

useEffect(() => { 
  if (partnership && !apis) {
    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/interfaces', {interfaces: partnership.interfaces})
      .then((res) => {
        setApis(res.data)
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }
}, [partnership, apis])

  const items = [
    { title: 'Partnerships', href: '/partnerships' },
    { title: `${partnership?.name}`, href: null }
  ].map((item, index) => {
    if(item.title=='Partnerships'){
      return (
        <Anchor href={item.href} key={index}>
          <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 500}}>{item.title}</Text>
        </Anchor>
      )
    } else {
      return (
        <Anchor href={item.href} key={index}>
          <Text style={{fontFamily:'Visuelt', color: 'gray', fontWeight: 100}}>{item.title}</Text>
        </Anchor>
      )

    }
      
  });
  
  return !partnership? (
    <div>
      <Loader />
    </div>
     ) : (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 30,
      width: '100%',

    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

        width: '100%'
      }}> 
          <div style={{display:'block'}}>
            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{partnership.name}</Text>
            <Breadcrumbs separator="→">{items}</Breadcrumbs>
          </div>
          <div>
            <div style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                <Avatar.Group>
                  {testUserData.map((user, index) => (
                    <Avatar key={index} src={user.image} alt={user.name} radius='xl' size={'md'} sx={{border:'1px solid black'}} />
                  ))}
                </Avatar.Group>
                <ActionIcon>
                  <BsThreeDots size={20} style={{color:'black'}}/>
                </ActionIcon>
              </div>
          </div>
          
      </div>
      <div style={{height:50}}/>
      <Tabs color="gray" defaultValue="workflows">
        <Tabs.List>
          <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="workflows">Workflows</Tabs.Tab>
          <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="apis">APIs</Tabs.Tab>
          <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="configurations">Configurations</Tabs.Tab>        
        </Tabs.List>

        <Tabs.Panel value="workflows">
          <PartnershipWorkflows apis={apis} pid={pid}/>
        </Tabs.Panel>
        <Tabs.Panel value="apis">
          <PartnershipApis pid={pid} partnershipApis={apis}/>
        </Tabs.Panel>
        <Tabs.Panel value="configurations">
          <PartnershipConfigurations partnership={partnership}/>
        </Tabs.Panel>

      </Tabs>
    </div>   
)
}

export default Partnership


