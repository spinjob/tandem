import { Text, TextInput, Button, Select, Divider, SimpleGrid} from "@mantine/core"
import { useEffect, useState } from "react"
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'

const ApiMetadata = ({ metadata, securityScheme }) => {

    const [editingProduction, setEditingProduction] = useState(false)
    const [editingSandbox, setEditingSandbox] = useState(false)
    const [production, setProduction] = useState(metadata.production_server)
    const [sandbox, setSandbox] = useState(metadata.sandbox_server)
    const [editingSecurityScheme, setEditingSecurityScheme] = useState(false)
    const [authenticationType, setAuthenticationType] = useState(null)
    const [authenticationFlowType, setAuthenticationFlowType] = useState(null)
    const [authenticationUrl, setAuthenticationUrl] = useState(null)
    const [tokenUrl, setTokenUrl] = useState(null)
    const [authenticationScopes, setAuthenticationScopes] = useState(null)
    const [securitySchemeState, setSecuritySchemeState] = useState(securityScheme && securityScheme.length > 0 ? securityScheme[0] : null)

    const environments = [
        {
            name: 'Production',
            baseUrl: production
        }, 
        {
            name: 'Sandbox',
            baseUrl: sandbox
        }]
    
    const updateServers = (environment) => {

        var data = environment == 'Production' ? {
            productionServer: production
        } : {
            sandboxServer: sandbox
        }

        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + metadata.uuid + "/servers", data).then((res) => {
            console.log(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }

    const updateSecurityScheme = () => {

        if(!securityScheme || securityScheme.length == 0){
            var newSecurityScheme = {
                type: authenticationType,
                flows: [
                    {
                        type: authenticationFlowType,
                        authorizationUrl: authenticationUrl,
                        tokenUrl: tokenUrl,
                        scopes: authenticationScopes
                    }],
                parent_interface_uuid: metadata.uuid,
                name: null,
                description: null
            }
            axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + metadata.uuid + "/security", newSecurityScheme).then((res) => {
                console.log(res.data)
            }
            ).catch((err) => {
                console.log(err)
            }
            )

        } else {

            var updatedSecurityScheme = {
                parent_interface_uuid: metadata.uuid,
                security_scheme_uuid: securityScheme?.uuid,
                type: authenticationType,
                flows: [
                    {
                        type: authenticationFlowType,
                        authorizationUrl: authenticationUrl,
                        tokenUrl: tokenUrl,
                        scopes: authenticationScopes
                    }
                ]
            }
    
            axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + metadata.uuid + "/security", updatedSecurityScheme).then((res) => {
                console.log(res.data)
            }).catch((err) => {
                console.log(err)
            }
            )
        }

    }

    useEffect(() => {
        if(securityScheme && securityScheme.length > 0){
            setAuthenticationType(securityScheme[0].type)
            if(!authenticationUrl && securityScheme[0]?.flows && securityScheme[0]?.flows?.length > 0 && securityScheme[0]?.flows[0]?.tokenUrl){
                setTokenUrl(securityScheme[0]?.flows[0]?.tokenUrl)
            }
            if(!authenticationUrl && securityScheme[0]?.flows && securityScheme[0]?.flows?.length > 0 && securityScheme[0]?.flows[0]?.authorizationUrl){
                setAuthenticationUrl(securityScheme[0]?.flows[0]?.authorizationUrl)
            }
            if(!authenticationFlowType && securityScheme[0]?.flows && securityScheme[0]?.flows?.length > 0 && securityScheme[0]?.flows[0]?.type){
                setAuthenticationFlowType(securityScheme[0]?.flows[0]?.type)
            }
            if(!authenticationScopes && securityScheme[0]?.flows && securityScheme[0]?.flows?.length > 0 && securityScheme[0]?.flows[0]?.scopes){
                setAuthenticationScopes(securityScheme[0]?.flows[0]?.scopes)
            }
        }
    }, [securityScheme])

    const renderScopeCards = () => {
        var scopeKeys = Object.keys(authenticationScopes)
        var scopeValues = Object.values(authenticationScopes)
        return scopeKeys.map((key, index) => {
            return(
                <div key={key} style={{width: 250, backgroundColor: '#F8F6F3', border:'1px solid #F8F6F3', padding: 10, borderRadius: 10}}>
                    <Text style={{fontFamily:'Visuelt', fontSize:'14px'}}>{key}</Text>
                    <Text style={{fontFamily:'Visuelt', fontSize:'12px', fontWeight: 100}}>{scopeValues[index]}</Text>
                </div>
            )
        })
    }


    return (
        <div style={{padding: 20}}>
            <div style={{height:'20px'}}/>
            <div>
                <Text style={{fontFamily:'Visuelt', fontSize:'30px', fontWeight: 500}}>Base URLs</Text>
                <Text style={{fontFamily:'Visuelt', fontSize:'15px', fontWeight: 100, color: '#858585'}}>The base URLs for the production and sandox servers hosting the API.</Text>
                <div style={{height:'20px'}}/>
                {
                    environments.map((environment) => {
                    return(
                        <div key={environment.name} style={{width: '100%',paddingBottom: 30}}>
                            <Text style={{fontFamily:'Visuelt', fontSize:'20px'}}>{environment.name}</Text>
                            <Divider style={{width: '35%'}} size={'xs'} color={'#E7E7E7'}/>
                            <div style={{height:'10px'}}/>
                            <div style={{display:'flex',flexDirection:'row', alignItems:'end'}}>
                                <div style={{display:'block', width: '28%'}}>
                                    <Text style={{fontFamily:'Visuelt', fontSize:'15px'}}>Base URL</Text>
                                    {
                                        environment.name == 'Production' && !editingProduction ? (
                                            <TextInput disabled value={environment.baseUrl == '' || environment.baseUrl == null ? 'https://api.example.com' : environment.baseUrl}
                                            sx={{
                                                width: '100%',
                                                '& input': {
                                                    '&: focus': {
                                                            border: '1px solid black'
                                                    }
                                                }
                                            }}
                                            />
                                        ) : environment.name == 'Sandbox' && !editingSandbox ? (
                                            <TextInput disabled value={environment.baseUrl == '' || environment.baseUrl == null ? 'https://api.example.com' : environment.baseUrl}
                                            sx={{
                                                width: '100%',
                                                '& input': {
                                                    '&: focus': {
                                                            border: '1px solid black'
                                                    }
                                                }
                                            }}
                                            />
                                        ) : (
                                            <TextInput value={environment.baseUrl}
                                            onChange={(e) => {
                                                if(environment.name === 'Production') {
                                                    console.log(e.target.value)
                                                    setProduction(e.target.value)
                                                }
                                                if(environment.name === 'Sandbox') {
                                                    console.log(environment)
                                                    console.log(e.target.value)
                                                    setSandbox(e.target.value)
                                                }
                                            }}
                                            sx={{
                                                width: '100%',
                                                '& input': {
                                                    '&: focus': {
                                                            border: '1px solid black'
                                                    }
                                                }
                                            }}
                                            />
                                        )
                                    }
                                    
                                </div>
                                <div style={{width: 10}}/>
                                <Button onClick={() => {
                                    console.log(environment.name)
                                    console.log(editingProduction)
                                    if(environment.name === 'Production') {
                                        if(editingProduction) {
                                            updateServers(environment.name)
                                        }
                                        setEditingProduction(!editingProduction)
                                    } else {
                                        if(editingSandbox) {
                                            updateServers(environment.name)
                                        }
                                        setEditingSandbox(!editingSandbox)
                                    }
                                }} radius={'sm'} style={{backgroundColor: 'white', color:"black", border:'1px solid black'}}>
                                    { environment.name == 'Production' && !editingProduction ? 'Edit' : environment.name == 'Sandbox' && !editingSandbox ? 'Edit' : 'Save'}
                                </Button>
                                <div style={{width: 10}}/>
                                {
                                    environment.name == 'Production' && editingProduction ? (
                                        <Button onClick={()=>{
                                            setEditingProduction(false)
                                        }} radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", border:'1px solid #FF7E35'}}>
                                            Cancel
                                        </Button>
                                    ) : environment.name == 'Sandbox' && editingSandbox ? (
                                        <Button onClick={()=>{
                                            setEditingSandbox(false)
                                        }} radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", border:'1px solid #FF7E35'}}>
                                            Cancel
                                        </Button>
                                    ) : (
                                        null
                                    )
                                }
                               
                            </div>
                        </div>
                    )
                    })
                }
            </div>
            <div style={{height:'40px'}}/>
            <div>
                <div style={{display:'flex', flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                    <div  style={{display:'flex', flexDirection: 'column'}} >
                        <Text style={{fontFamily:'Visuelt', fontSize:'30px', fontWeight: 500}}>Security Scheme</Text>
                        <Text style={{fontFamily:'Visuelt', fontSize:'15px', fontWeight: 100, color: '#858585'}}>The authentication model for the API. Rules and settings in the API documentation will be displayed if available.</Text>
                    </div>
                    <div style={{display: 'flex'}}>
                        <Button onClick={() => {
                            if(editingSecurityScheme) {
                                updateSecurityScheme()
                            }
                            setEditingSecurityScheme(!editingSecurityScheme)
                            }} radius={'sm'} style={{backgroundColor: 'white', color:"black", border:'1px solid black'}}>
                                { !editingSecurityScheme ? 'Edit' : 'Save'}
                        </Button>
                    {
                        editingSecurityScheme ? (
                            <>
                                <div style={{width: 10}}/>
                                <Button onClick={()=>{
                                    setEditingSecurityScheme(false)
                                    setAuthenticationType(securityScheme[0].type)
                                    setTokenUrl(securityScheme[0]?.flows[0]?.tokenUrl)
                                    setAuthenticationUrl(securityScheme[0]?.flows[0]?.authorizationUrl)
                                    setAuthenticationFlowType(securityScheme[0]?.flows[0]?.type)
                                    setAuthenticationScopes(securityScheme[0]?.flows[0]?.scopes)
                                }
                                } radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", border:'1px solid #FF7E35'}}>
                                    Cancel
                                </Button>
                            </>
                            
                        ) : (
                            null
                        )

                    }
                    </div>
                   
                </div>
                <div style={{height:'20px'}}/>
             <Select
                label="Authentication Type"
                placeholder="Select Authentication Type"
                value={authenticationType}
                disabled={!editingSecurityScheme}
                onChange={(e) => {
                    setAuthenticationType(e)
                    setSecuritySchemeState(securityScheme.filter((scheme) => scheme.type == e)[0])
                }}
                data={[
                    { label: 'None', value: 'none' },
                    {label: 'OAuth 2.0', value: 'oauth2'},
                    {label: 'API Key', value:'apiKey'}
                ]}
             />
             <div style={{height:'10px'}}/>
            {
                authenticationType == 'oauth2' && (
                    <>
                        <Select
                        label="Authentication Flow"
                        placeholder="Select Authentication Flow"
                        value={authenticationFlowType}
                        disabled={!editingSecurityScheme}
                        onChange={(e) => {
                            setAuthenticationFlowType(e)
                        }}
                        data={[
                            {label: 'Client Credentials', value: 'clientCredentials'},
                            {label: 'Authorization Code', value: 'authorizationCode'},
                            {label: 'Implicit', value: 'implicit'},
                            {label: 'Password', value: 'password'}
                        ]}
                        />
                        <div style={{height:'10px'}}/>
                    </>
                   
                )
            }
            
            {
                authenticationFlowType == 'clientCredentials' && authenticationType != 'none' || authenticationFlowType == 'password' && authenticationType != 'none' || authenticationFlowType == 'authorizationCode' && authenticationType != 'none'? (
                    <>
                        <TextInput 
                            label="Token URL"
                            value={tokenUrl}
                            disabled={!editingSecurityScheme}
                            onChange={(e) => {
                                setTokenUrl(e.target.value)
                            }
                        }/>
                        <div style={{height:'10px'}}/>
                    </>
                   
                ): null
            }
            {
                authenticationScopes ? (
                    <>
                        <Text style={{fontFamily:'Visuelt', fontSize:'15px', fontWeight: 500}}>Scopes</Text>
                        <div style={{height:'10px'}}/>
                        <SimpleGrid cols={4} sx={{width: '100%'}}  breakpoints={[
                            { maxWidth: 992, cols: 3, spacing: 'md' },
                            { maxWidth: 768, cols: 2, spacing: 'sm' },
                            { maxWidth: 576, cols: 1, spacing: 'sm' },
                        ]}>
                            {
                            renderScopeCards()
                            }
                        </SimpleGrid>
                    </>
                   
                ) : null
            }
            
           <div style={{height:'20px'}}/>
           

            </div>
            <div style={{height:'20px'}}/>

          
        </div>
    )
}

export default ApiMetadata