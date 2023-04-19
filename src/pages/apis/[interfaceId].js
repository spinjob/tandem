import axios from 'axios'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'
import {Tabs, Text, Image, TextInput, Button, Loader, Modal, Breadcrumbs, Anchor, Card} from '@mantine/core'
import ApiSchemas from '../../components/Api/api-schemas'
import ApiActions from '../../components/Api/api-actions';
import ApiWebhooks from '../../components/Api/api-webhooks';
import ApiSecurityScheme from '../../components/Api/api-security-schema';
import ApiMetadata from '../../components/Api/api-details';
import addIcon from '../../../public/icons/select-object-copy-plus-add.svg'
import NewWebhookForm from '../../components/Api/newComponentModals/newWebhook'
import NewActionForm from '../../components/Api/newComponentModals/newAction'
import ManageActionModal from '../../components/Api/editActionModal';

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
    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedAction, setSelectedAction] = useState(null)

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

      function setAction (action) {
        setSelectedAction(action)
        setViewModalOpen(true)
        }

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

    }, [interfaceId, apiMetadata, securitySchemas, schemas, actions, webhooks, parameters])

    
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
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalType == 'webhook' ? (
                    <Text
                        sx={{
                            fontFamily: 'Visuelt',
                            fontWeight: 650,
                            fontSize: '28px'
                        }}
                    >
                        New Webhook Definition
                    </Text>
                    ) : (<Text
                        sx={{
                            fontFamily: 'Visuelt',
                            fontWeight: 650,
                            fontSize: '28px'
                        }}
                    >
                        New API Action Definition
                    </Text>)}
                centered
                size={modalType== 'webhook' ? 'xl' : 1200}
            >
                {
                    modalType == 'webhook' ? (
                        <NewWebhookForm setModalOpen={setModalOpen} apiId={interfaceId} />
                    ) : (
                        <NewActionForm setModalOpen={setModalOpen} apiId={interfaceId} />
                    )
                }
            </Modal>
            <Modal
                opened={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                centered
                size={1250}
                title={selectedAction ? (
                  <Text
                    sx={{
                        fontFamily: "Visuelt",
                        fontWeight: 650,
                        fontSize: "40px",
                    }}

                  >
                    {selectedAction.name}
                  </Text> 
                ) : null}
            >
                <ManageActionModal setViewModalOpen={setViewModalOpen} action={selectedAction} />
            </Modal>
            <div style={{height: 20}}></div>
            <div style={{display:'flex', paddingBottom: 40, paddingTop: 30}}>
                <Card style={{height: 180, width: 280, paddingTop: 38, paddingLeft: 50, backgroundColor: '#eaeaff'}}radius={'xl'}>
                    <Card.Section>
                        <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '18px'}}>Schemas</Text>
                        <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '60px'}}>{schemas?.length}</Text>
                    </Card.Section>
                </Card>
                <div style={{width: 30}}/>
                    <Card style={{height: 180, width: 280, paddingTop: 38, paddingLeft: 50, backgroundColor: '#eaeaff'}}radius={'xl'}>
                        <Card.Section>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px'}}>Actions</Text>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '60px'}}>{actions?.length}</Text>
                        </Card.Section>
                    </Card>
                <div style={{width: 30}}/>
                    <Card style={{height: 180, width: 280, paddingTop: 38, paddingLeft: 50, backgroundColor: '#eaeaff'}}radius={'xl'}>
                        <Card.Section>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px'}}>Webhooks</Text>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '60px'}}>{webhooks?.length}</Text>
                        </Card.Section>
                    </Card>
                    <div style={{height: 5}}/>      
            </div>
            <div style={{height: 20}}></div>
            <Tabs radius={"sm"} color={'dark'} defaultValue="metadata">
                <Tabs.List>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="metadata">Details</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="actions">Actions</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="webhooks">Webhooks</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="schemas">Schemas</Tabs.Tab>
                    {/* <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="security">Authentication</Tabs.Tab>  */}
                    {/* <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 200}} value="parameters">Parameters</Tabs.Tab>          */}
                </Tabs.List>

                <Tabs.Panel value="metadata" label="Metadata">
                    {apiMetadata || securitySchemas ? (
                        <ApiMetadata metadata={apiMetadata} securityScheme={securitySchemas}/>
                    ) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="security" label="Security Schema">
                    {securitySchemas ? ( 
                        <ApiSecurityScheme scheme={securitySchemas}/>
                    ) : (
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
                        <div>
                            <div style={{height: 20}}></div>
                            <div style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between', alignItems:'center', padding: 20}}>
                                <div style={{width: '70%'}}>
                                    <Text
                                        sx={{
                                            fontFamily: 'Visuelt',
                                            fontWeight: 400,
                                            fontSize: '28px'

                                        }}
                                    >
                                        API Actions
                                    </Text>
                                    <Text
                                        sx={{
                                            fontFamily: 'Visuelt',
                                            fontWeight: 100,
                                            fontSize: '13px',
                                            color: '#3E3E3E'
                                        }}
                                    >
                                        Actions are the methods that can be called on your API. They are the endpoints that your users will call with specified data.  The table below shows all the actions that are currently defined for this API and what data the documentation indicates they support.  Click on any action to view the details and edit if necessary.
                                    </Text>
                                </div>

                                <Button
                                    onClick={() => {
                                        setModalOpen(true)
                                        setModalType('action')
                                    }}
                                    
                                    sx={{
                                        fontFamily: 'Visuelt',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        backgroundColor: '#000000',
                                        color: '#FFFFFF',
                                        borderRadius: '10px',
                                        height: '40px',
                                        width: '200',
                                        ':hover': {
                                            backgroundColor: '#3E3E3E',
                                            
                                        }
                                    }}>
                                    Create an Action
                                </Button>
                            </div>
                          <ApiActions setAction={setAction} actions={actions}/>
                        </div>
                       
                    ) : (
                        <Loader/>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value="webhooks" label="Webhooks">
                    {webhooks ? ( 
                        <div>
                            <div style={{height: 20}}></div>
                            <div style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between', alignItems:'center', padding: 20}}>
                                <div style={{width: '70%'}}>
                                    <Text
                                        sx={{
                                            fontFamily: 'Visuelt',
                                            fontWeight: 400,
                                            fontSize: '28px'

                                        }}
                                    >
                                        Webhooks
                                    </Text>
                                    <Text
                                        sx={{
                                            fontFamily: 'Visuelt',
                                            fontWeight: 100,
                                            fontSize: '13px',
                                            color: '#3E3E3E'
                                        }}
                                    >
                                        Webhooks are used to notify Tandem when to run a workflow.  They are triggered by an event, such as a new record being created in a database.  If the API documentation is missing supported webhooks, create one using an example payload.
                                    </Text>
                                </div>

                                <Button
                                    onClick={() => {
                                        setModalOpen(true)
                                        setModalType('webhook')
                                    }}
                                    
                                    sx={{
                                        fontFamily: 'Visuelt',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        backgroundColor: '#000000',
                                        color: '#FFFFFF',
                                        borderRadius: '10px',
                                        height: '40px',
                                        width: '200',
                                        ':hover': {
                                            backgroundColor: '#3E3E3E',
                                            
                                        }
                                    }}>
                                    Create a Webhook
                                </Button>
                            </div>
                            <ApiWebhooks setAction={setAction} actions={webhooks}/>
                        </div>
                        
                    ) : (
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