import axios from 'axios'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'
import {Tabs, Text, TextInput, Loader, Breadcrumbs, Anchor} from '@mantine/core'
import ApiSchemas from '../../components/Api/api-schemas'
import ApiActions from '../../components/Api/api-actions';

const ViewApi = () => {

    const router = useRouter()
    const { interfaceId } = router.query
    const [isLoading, setIsLoading] = useState(false)
    const [apiMetadata, setApiMetadata] = useState(null)
    const [securitySchemas, setSecuritySchemas] = useState(null)
    const [schemas, setSchemas] = useState(null)
    const [actions, setActions] = useState(null)
    const [webhooks, setWebhooks] = useState(null)
    const [parameters, setParameters] = useState(null)

    const items = [
        { title: 'My APIs', href: '/myApis' },
        { title: `${apiMetadata?.name}`, href: null }
      ].map((item, index) => {
        if(item.title=='My APIs'){
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

    const fetchApiDetails = useCallback(() => {
        setIsLoading(true)
        
        if(interfaceId){
            // Fetching API Metadata (Server URLs, basic info, etc.)
            if (!apiMetadata) {
                axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId)
                .then((res) => {
                   setApiMetadata(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })
            }
            // Fetching Security Schemas (Authentication Methods and Documentation.)
            if (!securitySchemas) {
                axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/security', {interfaces: [interfaceId]})
                .then((res) => {
                   setSecuritySchemas(res.data)
                //    console.log("Security Schemas")
                //    console.log(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })
            }
            // Fetching API Schemas
            if (!schemas) {
                axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId + '/objects')
                .then((res) => {
                   setSchemas(res.data)
                //    console.log("API Schemas")
                //    console.log(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })
            }
            // Fetching API Actions
            if (!actions) {
                axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/actions', {interfaces: [interfaceId]})
                .then((res) => {
                   setActions(res.data)
                //    console.log("API Actions")
                //    console.log(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })

            }

            // Fetching API Webhooks
            if (!webhooks) {
                axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/webhooks', {interfaces: [interfaceId]})
                .then((res) => {
                   setWebhooks(res.data)
                //    console.log("API Webhooks")
                //    console.log(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })
            }

            // Fetching API Parameters
            if (!parameters) {
                axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId + '/parameters')
                .then((res) => {
                   setParameters(res.data)
                //    console.log("API Parameters")
                //    console.log(res.data)
                })
                .catch((err) => {
                    console.log(err)
                })
            }

        }

    })

    
    useEffect(() => {
        if(interfaceId){
            if(!apiMetadata || !securitySchemas || !schemas || !actions || !webhooks || !parameters){
                fetchApiDetails()
            }
        }
    }, [interfaceId, apiMetadata, securitySchemas, schemas, actions, webhooks, parameters, fetchApiDetails])

    return apiMetadata ? (
        <div style={{      
            display: 'flex',
            flexDirection: 'column',
            padding: 30,
        }}>
            <div style={{display: 'flex', flexDirection: 'row', paddingBottom: 10, alignItems: 'baseline'}}>
                <Text style={{height: '40px', fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{apiMetadata.name}</Text>
                <div style={{width: 10}}></div>
                <Text style={{height: '40px',fontFamily:'apercu-regular-pro', fontSize: '25px'}}>{apiMetadata.version}</Text>
            </div>
            <Breadcrumbs separator="→">{items}</Breadcrumbs>
            <div style={{height: 20}}></div>
            <Tabs color="gray" defaultValue="metadata">
                <Tabs.List>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="metadata">Details</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="security">Security Schema</Tabs.Tab> 
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="schemas">Schemas</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="actions">Actions</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="webhooks">Webhooks</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="parameters">Parameters</Tabs.Tab>         
                </Tabs.List>

                <Tabs.Panel value="metadata" label="Metadata">
                    {apiMetadata ? (
                        <div>
                            <Text>API Name: {apiMetadata.name}</Text>
                            <Text>API Version: {apiMetadata.version}</Text>
                        </div>
                    ) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="security" label="Security Schema">
                    {securitySchemas ? ( securitySchemas.map((securitySchema) => {
                        return (
                            <div key={securitySchema.uuid}>
                                <Text>Security Schema Name: {securitySchema.name}</Text>
                                <Text>Security Schema Description: {securitySchema.description}</Text>
                                <Text>Security Schema Type: {securitySchema.type}</Text>
                            </div>
                        )
                    })) : (
                        <Loader/>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="schemas" label="Schemas">
                    {schemas ? ( 
                        <ApiSchemas schemas={schemas}/>
                    ) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="actions" label="Actions">
                    {actions ? ( 
                        <ApiActions actions={actions}/>
                    ) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="webhooks" label="Webhooks">
                    {webhooks ? ( webhooks.map((webhook) => {
                        return (
                            <div key={webhook.uuid}>
                                <Text>Webhook Name: {webhook.name}</Text>
                                <Text>Webhook Description: {webhook.description ? webhook.description : ""}</Text>
                            </div>
                        )
                    })) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="parameters" label="Parameters">
                    {parameters ? ( parameters.map((parameter) => {
                        return (
                            <div key={parameter.uuid}>
                                <Text>Parameter Name: {parameter.name}</Text>
                                <Text>Parameter Description: {parameter.description ? parameter.description : ""}</Text>
                                <Text>Parameter Type: {parameter.parameter_type}</Text>
                                <Text>Data Type: {parameter.type}</Text>
                            </div>
                        )
                    })) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    ) : (
        <Loader/>
    )
}

export default ViewApi