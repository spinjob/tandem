import { useRouter } from 'next/router'
import { Breadcrumbs, ActionIcon, Avatar, Group, Tooltip, CopyButton, Container,Anchor,Button, Menu, Image, Loader, Text, Tabs, Center} from '@mantine/core';
import { useState, useEffect, useContext, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios'
import PartnershipWorkflows from './[pid]/workflows'
import PartnershipApis from './[pid]/apis'
import AppContext from '../../context/AppContext';
import PartnershipConfigurations from './[pid]/configurations'
import {BsThreeDots} from 'react-icons/bs'
import archiveIcon from '../../../public/icons/archive-documents-box-big.svg'
import activeIcon from '../../../public/icons/certificate-checkmark-square.svg'
import negotiationIcon from '../../../public/icons/handshake-deal-square.svg'
import onHoldIcon from '../../../public/icons/pause-sqaure.svg'
import scopingIcon from '../../../public/icons/hierarchy-sqaure.svg'
import testingIcon from '../../../public/icons/tube-test-lab.svg'
import pilotIcon from '../../../public/icons/Promotion, Rocket.svg'
import expansionIcon from '../../../public/icons/checkmark-done-check.3.svg'
import arrowDownIcon from '../../../public/icons/arrow-down.1.svg'
import chatIcon from '../../../public/icons/programming-code-message-chat.svg'
import copyIcon from '../../../public/icons/copy-item-left-top.svg'

import {v4 as uuidv4} from 'uuid'

const Partnership = () => {
  const router = useRouter()
  const { pid } = router.query
  const [partnership, setPartnership] = useState(null)
  const [apis, setApis] = useState(null)
  const [organizationUsers, setOrganizationUsers] = useState(null)
  const [indexed, setIndexed] = useState(false)
  const [indexingLoading, setIndexingLoading] = useState(false)

  const partnershipStatusOptions = [
    { label: 'Active', value: 'active', icon: activeIcon},
    { label: 'Negotiation', value: 'negotiation', icon: negotiationIcon },
    { label: 'Scoping', value: 'scoping', icon: scopingIcon },
    { label: 'Testing', value: 'testing', icon: testingIcon },
    { label: 'Pilot', value: 'pilot', icon: pilotIcon },
    { label: 'Expansion', value: 'expansion', icon: expansionIcon },
    { label: 'On Hold', value: 'on-hold', icon: onHoldIcon },
    { label: 'Archived', value: 'archived', icon: archiveIcon }
  ]
  
  const fetchPartnershipDetails = useCallback(() => {
    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/details')
        .then((res) => {
            setPartnership(res.data[0])
            if(res.data[0].indexed) {
                setIndexed(true)
            }
            fetchOrganizationUsers(res.data[0].owning_organization)
        })
        .catch((err) => {
            console.log(err)
        })
  }, [setPartnership, pid])

  const fetchOrganizationUsers = useCallback((organizationId) => {
    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/users?organization=' + organizationId).then((res) => {
        setOrganizationUsers(res.data)
    })
    .catch((err) => {
        console.log(err)
    })
}, [organizationUsers])

  async function indexPartnershipDocumentation () {
    setIndexingLoading(true)
    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/embed').then((response) => {
        setIndexed(true)
        setIndexingLoading(false)
    }).catch((error) => {
        console.log(error)
        setIndexingLoading(false)
    })
  }


  useEffect(() => {
    if (pid && !partnership) {
        fetchPartnershipDetails()
    } 
}, [pid, fetchPartnershipDetails, fetchOrganizationUsers, partnership, organizationUsers])

  useEffect(() => { 
    if (partnership && !apis) {
      axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/interfaces', {interfaces: partnership.interfaces})
        .then((res) => {
          setApis(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [partnership, apis])

  const items = [
    { title: 'Integrations', href: '/partnerships' },
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
    <Center sx={{height: '100%'}}>
      <Loader />
    </Center>
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
              <Menu>
                <Menu.Target>
                  <Button variant='subtle' sx={{fontFamily: 'visuelt', fontWeight: 100, fontSize: '16px', color: 'black', 
                    borderRadius: 10,  '&:hover': {
                    backgroundColor: '#F2F0ED',
                    border: '1px solid #F2F0ED',
                  }}} rightIcon={
                    <div style={{height: 10, width: 10}}>
                     <Image alt="arrow-down" src={arrowDownIcon}/>
                    </div>
                  } leftIcon={
                    <div style={{height: 20, width: 20}}>
                      <Image alt="status" src={
                       partnership.status ? partnershipStatusOptions.find(option => option.label == partnership.status)?.icon : activeIcon
                      }/>
                    
                    </div>
                  }>
                    {partnership.status ? partnership.status : 'Active'}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {partnershipStatusOptions.map((option, index) => (
                    <Menu.Item key={index} icon={
                      <div style={{height: 20, width: 20}}>
                        <Image alt="status" src={option.icon}/>
                      </div>
                      
                      } onClick={() => 
                        {
                          setPartnership({...partnership, status: option.label})
                          axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/status', {status: option.label})
                       }
                      }>
                        <Text sx={{fontFamily: 'visuelt', fontWeight: 100}}>
                          {option.label}
                        </Text>
                      
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              <div style={{width: 20}}/>
              <Avatar.Group>
                {organizationUsers?.map((user, index) => (
                  <Avatar key={index} alt={user.name} radius='xl' size={'md'} sx={{border:'1px solid black'}}>
                      {
                       user?.name ? user.name[0]+user.name[1] : user?.email[0]+user?.email[2]}
                  </Avatar>
                ))}
              </Avatar.Group>
              <div style={{width: 20}}/>
              <ActionIcon>
                <BsThreeDots size={20} style={{color:'black'}}/>
              </ActionIcon>
              </div>
          </div>
      </div>
      {/* <div style={{height: 50}}/>
      <div style={{border: '1px solid #EAEAFF', padding: 30, display:'flex', flexDirection:'column', borderRadius: 10}}>
          { 
            partnership && indexed ? ( 
                  <>
                      <div style={{display: 'flex', flexDirection: 'row'}}>
                          <div
                              style={{
                                  
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: 40,
                                  height: 40,
                                  borderRadius: 50
                              }}
                              >
                              <Image 
                                  src={chatIcon}
                                  alt="chat"
                              />
                          </div>
                          <div style={{width: 10}}/>
                          <div style={{display: 'flex', flexDirection:'column'}}>
                              <Text
                                  style={{
                                      fontFamily: 'Visuelt',
                                      fontWeight: 650,
                                      fontSize: '28px'

                                  }}
                              >
                                  Your Partnership Assistant
                              </Text>
                              <Text 
                                  style={{
                                      fontFamily:'Visuelt',
                                      fontWeight: 100,
                                      fontSize: '18px',
                                  }}
                              >
                                  Open or share this Partnership assistant to automate support for the workflows and documentation in Tandem.
                              </Text>
                          </div>

                      </div>
                      <div style={{height: 20}}/>
                      <div style={{display: 'flex', flexDirection:'row', alignItems:'center', paddingLeft: 50}}>
                          <div style={{display: 'flex', flexDirection:'row', alignItems:'center'}}>
                              <CopyButton  value={process.env.NEXT_PUBLIC_APP_BASE_URL+'/partnerships/'+pid+'/chat/'+uuidv4()}timeout={2000}>
                                      {({ copied, copy }) => (
                                          <Tooltip label={copied ? 'Copied' : 'Copy URL'} withArrow position="right">
                                              <ActionIcon  color={copied ? 'teal' : 'gray'} onClick={copy}>
                                                  {copied ? (
                                                          <div style={{width: 30, height: 30}}>
                                                              <Image src={checkmarkIcon} alt="copy"/>
                                                          </div>
                                                  ) : (
                                                          <div style={{width: 30, height: 30}}>
                                                              <Image src={copyIcon} alt="copy"/>
                                                          </div>
                                                  )}
                                              </ActionIcon>
                                          </Tooltip>
                                      )}
                              </CopyButton>         
                          </div>
                          <div style={{width: 20}}/>
                          <a style={{textDecoration: 'none',width: 200, ':hover':{}}} target="_blank" href={router.asPath +'/chat/'+uuidv4()} rel="noopener noreferrer">
                              <div style={{ 
                                      backgroundColor: 'white',
                                      border: '1px solid #eaeaff',
                                      width: '100%',
                                      height: '50px',
                                      borderRadius: 13,
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      ':hover': {
                                          backgroundColor: '#eaeaff'
                                      }}}>
                                  <Text
                                      sx={{
                                          fontFamily: 'Visuelt',
                                          fontWeight: 100,
                                          fontSize: '18px',
                                          color: 'black'
                                      }}
                                  >
                                      Open Your Assistant
                                  </Text>
                                  
                              </div>
                          </a>
                      </div>
                  </> 
                  
              ) : indexingLoading ? (
                  <div>
                      <Center>
                          <Loader size="xl" />
                      </Center>
                  </div>
              ) : (
                  <div>
                      <div style={{display: 'flex', flexDirection: 'row'}}>
                          <div
                              style={{
                                  
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: 40,
                                  height: 40,
                                  borderRadius: 50
                              }}
                              >
                              <Image 
                                  src={chatIcon}
                                  alt="chat"
                              />
                          </div>
                          <div style={{width: 10}}/>
                          <Text
                              style={{
                                  fontFamily: 'Visuelt',
                                  fontWeight: 650,
                                  fontSize: '28px'

                              }}
                          >
                              Generate a Partnership Assistant
                          </Text>
                      </div>
                      <div style={{height: 10}}/>
                      <Text
                          style={{
                              fontFamily: 'Visuelt',
                              fontSize: '18px',
                              fontWeight: 100
                          }}
                      >
                          Tandem will use your Partnership workflows, configurations, and documentation to inform the responses of an AI assistant. Feel free to share with your team or customers.
                      </Text>
                      <div style={{height: 20}}/>
                      <Button
                          style={{
                              backgroundColor: '#EAEAFF',
                              border: '1px solid #EAEAFF',
                              height: '50px',
                              borderRadius: 13,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer'
                          }}
                          onClick={() => {
                              indexPartnershipDocumentation()
                          }}
                      >
                          <Text style={{color: 'black', fontFamily:'Visuelt', fontWeight:400, fontSize: 15}}>
                              Generate Assistant
                          </Text>
                      </Button>
                  </div>  
              )
          }
               
      </div> */}
      <div style={{height:50}}/>
      <Tabs color="gray" defaultValue="workflows">
        <Tabs.List>
          <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="workflows">Workflows</Tabs.Tab>
          <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="apis">APIs</Tabs.Tab>
          <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="configurations">Integration Configurations</Tabs.Tab>   
        </Tabs.List>

        <Tabs.Panel value="workflows">
          <PartnershipWorkflows apis={apis} pid={pid}/>
        </Tabs.Panel>
        <Tabs.Panel value="apis">
          <PartnershipApis pid={pid} partnership={partnership} partnershipApis={apis}/>
        </Tabs.Panel>
        <Tabs.Panel value="configurations">
          <PartnershipConfigurations partnership={partnership}/>
        </Tabs.Panel>
      </Tabs>
    </div>   
)
}

export default Partnership


