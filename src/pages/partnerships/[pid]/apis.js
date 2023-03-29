import { useState, useCallback, useEffect } from 'react';
import {Modal, Button,Text, Loader, ScrollArea, Select, Grid, Container,Alert, Image, Badge, TextInput, Textarea, PasswordInput, Divider} from '@mantine/core'
import {GrAddCircle} from 'react-icons/gr'
import {VscTypeHierarchy} from 'react-icons/vsc'
import apiIcon from '../../../../public/icons/Programing, Data.2.svg'
import ImportApiDropzone from '../../../components/import-api.tsx'
import { useUser } from '@auth0/nextjs-auth0/client';
import {useContext} from 'react'
import AppContext from '@/context/AppContext';
import axios from 'axios';
import { useRouter } from 'next/router';
import qs from 'qs'

const PartnershipApis = ({pid, partnershipApis, partnership}) => {

   const [modalOpened, setModalOpened] = useState(false)
   const [apis, setApis] = useState(partnershipApis)
   const [securityScheme, setSecurityScheme] = useState(null)
   const [selectedApi, setSelectedApi] = useState(null)
   const [partnershipAuthentication, setPartnershipAuthentication] = useState(partnership?.authentication ? partnership.authentication : null)
   const [isEditingAuthentication, setIsEditingAuthentication] = useState(false)
   const { user, error,isLoading } = useUser();
   const {organization} = useContext(AppContext).state
   const {dbUser, setDbUser} = useContext(AppContext).state
   const router = useRouter();
   const [selectedEnvironment, setSelectedEnvironment] = useState('Sandbox')
   const [tokenLoading, setTokenLoading] = useState(false)
   const [token, setToken] = useState(null)
   const [testResult, setTestResult] = useState(null)

   const fetchSecuritySchemes = useCallback(() => {
        var apiIds = []
        partnershipApis.forEach((api) => {
            apiIds.push(api.uuid)
        })
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/security',{interfaces: apiIds}).then((res) => {
            setSecurityScheme(res.data)
        }).catch((err) => {
            console.log(err)
        }
        )
    }, [partnershipApis])
    
    useEffect(() => {
        if (partnershipApis && !securityScheme) {
            fetchSecuritySchemes()
            setSelectedApi(partnershipApis[0].uuid)
        }
    }, [partnershipApis, securityScheme, fetchSecuritySchemes])

    const savePartnershipAuthentication = () => {
        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/authentication', {authentication: partnershipAuthentication}).then((res) => {
        }).catch((err) => {
            console.log(err)
        })
    }

   const renderApis = () => {
        return partnershipApis.map((api) => {
            return (
                <Grid.Col key={"gridColumn"+api.uuid} xs={4}>
                        <Button key={'button_'+api.uuid} onClick={() => {
                            setSelectedApi(api.uuid)
                            setTestResult(null)
                        }} sx={{
                            border: selectedApi == api.uuid ? '1px solid #000000' : '1px solid #f2f0ee',
                            boxShadow: selectedApi == api.uuid ? '0 0 0 1px #000000' : null,
                            '&:hover': {
                                boxShadow: selectedApi == api.uuid ? '0 0 0 1px #000000' : '0 0 0 1px #eaeaff'
                            }
                        }} style={{padding: 0, paddingLeft: 2, height: 170, width: 280, backgroundColor: '#ffffff', borderRadius: 20, borderColor: '#f2f0ee'}}>
                            <Container style={{display:'flex', flexDirection: 'column'}}>
                                <div style={{display:'flex', flexDirection:'row', width: '100vw', height: 60, alignItems: 'left'}}>
                                    <div style={{display: 'flex',height: 28, width: 28, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                                        <Text style={{color:"black"}}>{api.name.charAt(0)}</Text>                                 
                                    </div>
                                    <div style={{width: 180}}/>
                                    <Image src={apiIcon} alt="api icon" width={30} height={26} style={{opacity:.2}}/>
                                    </div>
                                <div style={{display:'block', flexDirection:'column', alignItems: 'left'}}>
                                    <Text style={{fontFamily:'Visuelt', fontWeight: 600, color:'#000000', fontSize: 28}}>{api.name}</Text>
                                    <Text style={{fontFamily:'apercu-regular-pro', fontWeight:100,fontSize: '15px', color:'#939393'}}>{api.version}</Text>
                                </div>
                            </Container>
                        </Button>
                </Grid.Col>           
            )
        })
    }

    return partnershipApis ? (
        <div>
            <div style={{width: '75%',paddingTop: 30, paddingBottom: 30, display:'flex', flexDirection:'column'}}>
                    <Container style={{width: '100vw'}}>
                        <Grid grow={false}>  
                            {renderApis()}
                        </Grid>
                    </Container>   
            </div> 
            <div style={{ paddingLeft: 20, width: '75%',paddingTop: 30, paddingBottom: 30,display:'flex', flexDirection:'column'}}>
                {
                    securityScheme ? (
                        securityScheme.filter((scheme) => {
                            return scheme.parent_interface_uuid == selectedApi
                        }).map((scheme) => {
                            return (
                                <div key={scheme.uuid} style={{display:'flex', flexDirection:'column',paddingBottom: 100, width: '100%',alignItems: 'left'}}>
                                   <div style={{display:'flex', flexDirection:'column', width: 580}}>
                                        <Text sx={{fontFamily:'Visuelt', fontSize: '24px'}}>
                                            {partnershipApis.filter((api) => {
                                                    return api.uuid == scheme.parent_interface_uuid
                                                })[0].name
                                            } Credentials
                                        </Text>
                                        <Text sx={{fontFamily:'Visuelt', fontSize: '15px', fontWeight: 100, color:'#939393'}}>
                                           The following credentials and configurations are required to authorize your requests to {partnershipApis.filter((api) => {
                                                    return api.uuid == scheme.parent_interface_uuid
                                                })[0].name} according to the documented security scheme.
                                        </Text>
                                        <div style={{height: 20}}/>
                                        <div style={{display:'flex', flexDirection:'row'}}>
                                            <Badge sx={{backgroundColor:'#EAEAFF', color:'black', fontFamily: 'Visuelt', fontWeight: 500}}>
                                                {scheme.type ? scheme.type : scheme.type}
                                            </Badge>
                                            <div style={{width: 10}}/>
                                            {
                                                scheme.flows && scheme.flows.length > 0 && scheme.flows[0].type ? (
                                                    <Badge sx={{backgroundColor:'#EAEAFF', color:'black', fontFamily: 'Visuelt', fontWeight: 500}}>
                                                        {scheme.flows ? scheme.flows[0].type : scheme.type}
                                                    </Badge>
                                                ) : null
                                            }
                                        </div>
                                    </div>
                                    
                                    <div style={{height: 20}}/>
                                    <div>

                                    {
                                            scheme.type == 'oauth2' ? (
                                                <div style={{display:'flex', flexDirection:'column', width: '100vw', alignItems: 'left'}}>
                                                    <TextInput
                                                    disabled={!isEditingAuthentication}
                                                    value={partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid] ? partnershipAuthentication[scheme.parent_interface_uuid].client_id : ''}
                                                    onChange={(e) => {
                                                            if(partnershipAuthentication){
                                                                setPartnershipAuthentication({
                                                                    ...partnershipAuthentication,
                                                                    [scheme.parent_interface_uuid]: {
                                                                        ...partnershipAuthentication[scheme.parent_interface_uuid],
                                                                        client_id: e.target.value
                                                                    }
                                                                })
                                                            } else {
                                                                setPartnershipAuthentication({
                                                                    [scheme.parent_interface_uuid]: {
                                                                        client_id: e.target.value
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                    label={
                                                        <Text sx={{fontFamily: 'Visuelt'}}>
                                                            Client ID
                                                        </Text>
                                                    } sx={{width: 580}} />
                                                    <PasswordInput 
                                                     value={ partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid] ? partnershipAuthentication[scheme.parent_interface_uuid].client_secret : ''}
                                                     disabled={!isEditingAuthentication}
                                                     onChange={(e) => {
                                                            if(partnershipAuthentication){
                                                                setPartnershipAuthentication({
                                                                    ...partnershipAuthentication,
                                                                    [scheme.parent_interface_uuid]: {
                                                                        ...partnershipAuthentication[scheme.parent_interface_uuid],
                                                                        client_secret: e.target.value
                                                                    }
                                                                })
                                                            } else {
                                                                setPartnershipAuthentication({
                                                                    [scheme.parent_interface_uuid]: {
                                                                        client_secret: e.target.value
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                    label={
                                                        <Text sx={{fontFamily: 'Visuelt'}}>
                                                            Client Secret
                                                        </Text>
                                                    }  sx={{width: 580}} />
                                                    <Textarea 
                                                        value={partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid] ? partnershipAuthentication[scheme.parent_interface_uuid].scope : ''}
                                                        disabled={!isEditingAuthentication}
                                                        onChange={(e) => {
                                                            if(partnershipAuthentication){
                                                                setPartnershipAuthentication({
                                                                    ...partnershipAuthentication,
                                                                    [scheme.parent_interface_uuid]: {
                                                                        ...partnershipAuthentication[scheme.parent_interface_uuid],
                                                                        scope: e.target.value
                                                                    }
                                                                })
                                                            } else {
                                                                setPartnershipAuthentication({
                                                                    [scheme.parent_interface_uuid]: {
                                                                        scope: e.target.value
                                                                    }
                                                                })
                                                            }
                                                        }}
                                                    label={
                                                        <Text sx={{fontFamily: 'Visuelt'}}>
                                                            Scopes (comma separated)
                                                        </Text>
                                                    }  sx={{width: 580}} />
                                                    <TextInput disabled label={
                                                        <Text sx={{fontFamily: 'Visuelt'}}>
                                                            Grant Type
                                                        </Text>
                                                    } sx={{width: 580}} value={
                                                        scheme.flows && scheme.flows[0].type == 'clientCredentials' ? 'client_credentials' : scheme.type
                                                    }/>
                                                    <div style={{height: 20}}/>
                                                    <div style={{display: 'flex'}}>
                                                        <Button sx={{width: !isEditingAuthentication ? 580 : 285}} onClick={() => {
                                                            if(isEditingAuthentication) {
                                                                savePartnershipAuthentication()
                                                            }
                                                            setIsEditingAuthentication(!isEditingAuthentication)
                                                            }} radius={'sm'} style={{backgroundColor: 'white', color:"black", border:'1px solid black'}}>
                                                                { !isEditingAuthentication ? 'Edit' : 'Save'}
                                                        </Button>
                                                        {
                                                            isEditingAuthentication ? (
                                                                <>
                                                                    <div style={{width: 10}}/>
                                                                    <Button onClick={()=>{
                                                                        setIsEditingAuthentication(false)
                                                                        setPartnershipAuthentication(partnership?.authentication ? partnership.authentication : null)
                                                                    }
                                                                    } radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", width: 280, border:'1px solid #FF7E35'}}>
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                                
                                                            ) : (
                                                                null
                                                            )

                                                        }
                                                    </div>
                                                    <div style={{height: 20}}/>
                                                    {
                                                        partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid] && partnershipAuthentication[scheme.parent_interface_uuid].client_id && partnershipAuthentication[scheme.parent_interface_uuid].client_secret ? (
                                                        
                                                            <div style={{display: 'flex', flexDirection:'column'}}>
                                                                <Text sx={{fontFamily: 'Visuelt', fontSize: '20px'}}>
                                                                    Validate Your Credentials
                                                                </Text>
                                                                <Text sx={{width: 600, fontFamily:'Visuelt', fontSize: '15px', fontWeight: 100, color:'#939393'}}>
                                                                    Click the button below to validate your credentials. If the credentials are valid, you will be able to see the token response.
                                                                </Text>
                                                                <div style={{height: 20}}/>
                                                                <Select 
                                                                    value={selectedEnvironment}
                                                                    onChange={(e) => {
                                                                        setSelectedEnvironment(e)
                                                                    }}
                                                                    label= {
                                                                        <Text sx={{fontFamily: 'Visuelt'}}>
                                                                            Environment
                                                                        </Text>
                                                                    }
                                                                    sx={{width: 580}}
                                                                    data={[
                                                                        {
                                                                            value: 'Sandbox',
                                                                            label: 'Sandbox'
                                                                        },
                                                                        {
                                                                            value: 'Production',
                                                                            label: 'Production'
                                                                        }
                                                                    ]}
                                                                />
                                                                <TextInput disabled label={
                                                                    <Text sx={{fontFamily: 'Visuelt'}}>
                                                                        Token URL
                                                                    </Text>
                                                                } sx={{width: 580}} value={
                                                                    scheme.flows && scheme.flows[0].tokenUrl && partnershipApis.filter((api) => { return api.uuid == scheme.parent_interface_uuid})[0].production_server  && selectedEnvironment == 'Production' ?  partnershipApis.filter((api) => {
                                                                        return api.uuid == scheme.parent_interface_uuid
                                                                    })[0].production_server + scheme.flows[0].tokenUrl :  scheme.flows && scheme.flows[0].tokenUrl && partnershipApis.filter((api) => { return api.uuid == scheme.parent_interface_uuid})[0].sandbox_server  && selectedEnvironment == 'Sandbox' ?  partnershipApis.filter((api) => {
                                                                        return api.uuid == scheme.parent_interface_uuid
                                                                    })[0].sandbox_server + scheme.flows[0].tokenUrl : ''
                                                                }/>
                                                                {
                                                                    tokenLoading ? (
                                                                        <div >
                                                                            <div style={{height: 20}}/>
                                                                            <div style={{height: 20}}/>
                                                                            <Alert color="gray" sx={{fontFamily: 'Visuelt', color: 'black', width: 580}} title={ <Text sx={{fontFamily: 'Visuelt', fontSize: '15px', fontWeight: 500}}> Validating Credentials...</Text>}>  
                                                                                 <Loader color="gray"  />
                                                                            </Alert>
                                                                        </div>
                                                                    ) : !tokenLoading && testResult && testResult.status == 'success' ? (
                                                                        <div>
                                                                            <div style={{height: 20}}/>
                                                                            <Alert 
                                                                                sx={{backgroundColor: '#DAFAC0', fontFamily: 'Visuelt', color: 'black', width: 580}}
                                                                               
                                                                                title={<Text sx={{fontFamily: 'Visuelt', fontSize: '15px', fontWeight: 500}}>
                                                                                    Your credentials are valid!
                                                                                </Text>}>
                                                                                <div style={{height: 10}}/>
                                                                                <TextInput disabled label={
                                                                                <Text sx={{fontFamily: 'Visuelt'}}>
                                                                                    Token Retrieved
                                                                                </Text>
                                                                            } sx={{width: '99%'}} value={
                                                                                token
                                                                            }/>
                                                                            </Alert>
                                                                            
                                                                        </div>
                                                                    ) : !tokenLoading && testResult && testResult.status == 'error' ? (
                                                                        <div> 
                                                                            <div style={{height: 20}}/>
                                                                            <Alert 
                                                                                sx={{backgroundColor: '#FFBE9A', fontFamily: 'Visuelt', color: 'black', width: 580}}
                                                                               
                                                                                title={<Text sx={{fontFamily: 'Visuelt', fontSize: '15px', fontWeight: 500}}>
                                                                                    Your credentials or environment base URL is invalid. Please confirm both and try again.
                                                                                </Text>}>
                                                                                <div style={{height: 10}}/>
                                                                                <TextInput disabled label={
                                                                                    <Text sx={{fontFamily: 'Visuelt'}}>
                                                                                        Error Message
                                                                                    </Text>
                                                                            } sx={{width: '99%'}} value={
                                                                                testResult.error
                                                                            }/>
                                                                            </Alert>
                                                                        </div>
                                                                    ) : (
                                                                        null
                                                                    )

                                                                }
                                                                
                                                                <div style={{height: 20}}/>
                                                                <Button sx={{width: 580}} onClick={() => {
                                                                        if(partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid]){
                                                                            if(partnershipAuthentication[scheme.parent_interface_uuid].client_id && partnershipAuthentication[scheme.parent_interface_uuid].client_secret){
                                                                                if(scheme.flows && scheme.flows[0].tokenUrl){
                    
                                                                                    setTokenLoading(true)
                                                                    
                                                                                    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + selectedApi + '/authenticate/' + scheme.uuid, {
                                                                                        environment: selectedEnvironment,
                                                                                        partnershipId: partnership.uuid
                                                                                    }).then((response) => {
                                                                                        console.log(response)
                                                                                        setTokenLoading(false)
                                                                                        setToken(response.data.tokenData.token)
                                                                                        setTestResult({
                                                                                            status: 'success',
                                                                                            message: 'Successfully retrieved token'
                                                                                        })
                                                                                    }).catch((error) => {
                                                                                        console.log(error)
                                                                                        setTokenLoading(false)
                                                                                        setToken(null)
                                                                                        setTestResult({
                                                                                            status: 'error',
                                                                                            message: 'Failed to retrieve token',
                                                                                            error: error
                                                                                        })
                                                                                    }) 
                                                                                }
                                                                            }
                                                                        }
                                                                    }} radius={'sm'} style={{backgroundColor: 'white', color:"black", border:'1px solid black'}}>
                                                                        {tokenLoading ? 'Loading...' : 'Get Token'}
                                                                    </Button>
                                                                <div style={{height: 20}}/>
                                                            </div>
                                                            ) : null
                                                    }
                                                   
                                                </div>
                                                ) : scheme.type == 'apiKey' ? (
                                                    <div style={{display:'flex', flexDirection:'column', width: '100vw', alignItems: 'left'}}>
                                                        <TextInput
                                                            value={partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid] ? partnershipAuthentication[scheme.parent_interface_uuid].keyName : ''}  
                                                            disabled={!isEditingAuthentication}
                                                            onChange={(e) => {
                                                                if(partnershipAuthentication){
                                                                    setPartnershipAuthentication({
                                                                        ...partnershipAuthentication,
                                                                        [scheme.parent_interface_uuid]: {
                                                                            ...partnershipAuthentication[scheme.parent_interface_uuid],
                                                                            keyName: e.target.value
                                                                        }
                                                                    })
                                                                } else {
                                                                    setPartnershipAuthentication({
                                                                        [scheme.parent_interface_uuid]: {
                                                                            keyName: e.target.value
                                                                        }
                                                                    })
                                                                }
                                                            }}  
                                                            placeholder="e.g. X-API-KEY" 
                                                            label={
                                                                <Text  sx={{fontFamily: 'Visuelt'}}>Key Name</Text>
                                                            } 
                                                            sx={{width: 580}} />
                                                        <PasswordInput
                                                            value={partnershipAuthentication && partnershipAuthentication[scheme.parent_interface_uuid] ? partnershipAuthentication[scheme.parent_interface_uuid].key : ''}
                                                            disabled={!isEditingAuthentication} 
                                                            onChange={(e) => {
                                                                if(partnershipAuthentication){
                                                                    setPartnershipAuthentication({
                                                                        ...partnershipAuthentication,
                                                                        [scheme.parent_interface_uuid]: {
                                                                            ...partnershipAuthentication[scheme.parent_interface_uuid],
                                                                            key: e.target.value
                                                                        }
                                                                    })
                                                                } else {
                                                                    setPartnershipAuthentication({
                                                                        [scheme.parent_interface_uuid]: {
                                                                            key: e.target.value
                                                                        }
                                                                    })
                                                                }
                                                            }}  
                                                            label={
                                                                <Text sx={{fontFamily: 'Visuelt'}}>
                                                                    Key
                                                                </Text>
                                                            }  
                                                            sx={{width: 580}} />
                                                        <div style={{height: 20}}/>
                                                        <div style={{display: 'flex'}}>
                                                        <Button sx={{width: !isEditingAuthentication ? 580 : 285}} onClick={() => {
                                                            if(isEditingAuthentication) {
                                                                savePartnershipAuthentication()
                                                            }
                                                            setIsEditingAuthentication(!isEditingAuthentication)
                                                            }} radius={'sm'} style={{backgroundColor: 'white', color:"black", border:'1px solid black'}}>
                                                                { !isEditingAuthentication ? 'Edit' : 'Save'}
                                                        </Button>
                                                        {
                                                            isEditingAuthentication ? (
                                                                <>
                                                                    <div style={{width: 10}}/>
                                                                    <Button onClick={()=>{
                                                                        setIsEditingAuthentication(false)
                                                                        setPartnershipAuthentication(partnership?.authentication ? partnership.authentication : null)
                                                                    }
                                                                    } radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", width: 285, border:'1px solid #FF7E35'}}>
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                                
                                                            ) : (
                                                                null
                                                            )

                                                        }
                                                    </div>
                                                    </div>
                    
                                                ) : ( 
                                                    null
                                                )
                                    }
                                   </div>
                                   
                                </div>
                            )
                        })
                    ) : (
                        null 
                    )
                }
            </div>
        </div>
        ) : (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        )
}

export default PartnershipApis