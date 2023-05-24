import axios from 'axios'
import { useState, useEffect, useCallback, useRef} from 'react';
import { useRouter } from 'next/router'
import {Tabs, Text, Image, TextInput, Button, Loader, Modal, Breadcrumbs, Anchor, Card, CopyButton, Tooltip, ActionIcon, Center} from '@mantine/core'
import { Editor } from '@tinymce/tinymce-react';

import ApiSchemas from '../../components/Api/api-schemas'
import ApiActions from '../../components/Api/api-actions';
import ApiWebhooks from '../../components/Api/api-webhooks';
import ApiSecurityScheme from '../../components/Api/api-security-schema';
import ApiMetadata from '../../components/Api/api-details';
import NewWebhookForm from '../../components/Api/newComponentModals/newWebhook'
import NewActionForm from '../../components/Api/newComponentModals/newAction'
import ManageActionModal from '../../components/Api/editActionModal';

import chatIcon from '../../../public/icons/programming-code-message-chat.svg'
import apiBreakdownIcon from '../../../public/icons/programming-code-elements-square.svg'
import schemaIcon from '../../../public/icons/schemaIcon.svg'
import recipeIcon from '../../../public/icons/book-recipe-chef-gear-hat.svg'
import actionIcon from '../../../public/icons/chat-message-programming-code.svg'
import copyIcon from '../../../public/icons/copy-item-left-top.svg'
import checkmarkIcon from '../../../public/icons/checkmark-medium.svg'

import {TbWebhook} from 'react-icons/tb'
import addIcon from '../../../public/icons/select-object-copy-plus-add.svg'
import {v4 as uuidv4} from 'uuid'
import { set } from 'lodash';

const ViewApi = () => {

    const router = useRouter()
    const { interfaceId } = router.query
    const [isLoading, setIsLoading] = useState(false)
    const [apiMetadata, setApiMetadata] = useState(null)
    const [opsDocumentation, setOpsDocumentation] = useState({})
    const [canTrainOnDocumentation, setCanTrainOnDocumentation] = useState(false)
    const [updatedOpsDocumentation, setUpdatedOpsDocumentation] = useState({})

    const [indexed, setIndexed] = useState(false)
    const [indexingLoading, setIndexingLoading] = useState(false)
    const [securitySchemas, setSecuritySchemas] = useState(null)
    const [schemas, setSchemas] = useState(null)
    const [actions, setActions] = useState(null)
    const [webhooks, setWebhooks] = useState(null)
    const [parameters, setParameters] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedAction, setSelectedAction] = useState(null)
    const [newDocumentationGroupName, setNewDocumentationGroupName] = useState('')
    const [addingNewDocumentationGroup, setAddingNewDocumentationGroup] = useState(false)
    const [selectedDocGroupTab, setSelectedDocGroupTab] = useState('')
    const [savingDocumentation, setSavingDocumentation] = useState(false)
    
    const editorRef = useRef(null);

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

    const saveDocumentation = () => {
        setSavingDocumentation(true)
        var contentToSave = editorRef.current.getContent({format : 'text'});
        var newOpsDocumentation = {...updatedOpsDocumentation}
        newOpsDocumentation[selectedDocGroupTab]['text'] = contentToSave
    
        //Save the updatedOpsDocumentation DB
        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId + '/documentation', {"documentation": newOpsDocumentation}).then((response) => {
            console.log(response)
            setOpsDocumentation(newOpsDocumentation)
            setSavingDocumentation(false)
            setCanTrainOnDocumentation(true)
        }).catch((error) => {
            setSavingDocumentation(false)
            console.log(error)
        })

    };

    function setAction (action) {
        setSelectedAction(action)
        setViewModalOpen(true)
    }

    async function updateOpsDocumentationContext (group, text){
        //Save changes to the updatedOpsDocumentation context
        let newOpsDocumentation = {...updatedOpsDocumentation}
        if(!newOpsDocumentation[group]){
            newOpsDocumentation[group] = {'text': text}
        } else {
            newOpsDocumentation[group]['text'] = text
        }
        setUpdatedOpsDocumentation(newOpsDocumentation)

        return newOpsDocumentation
    }

    async function indexApiDocumentation () {
        setIndexingLoading(true)
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId + '/embed').then((response) => {
            setIndexed(true)
            setIndexingLoading(false)
        }).catch((error) => {
            console.log(error)
            setIndexingLoading(false)
        })
    }

    const fetchApiDetails = useCallback(() => {
        setIsLoading(true)
        
        if(interfaceId){
            // Fetching API Metadata (Server URLs, basic info, etc.)
            if (!apiMetadata) {
                axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId)
                .then((res) => {
                   setApiMetadata(res.data)
                   if(res.data.indexed && res.data.indexed==true){
                          setIndexed(true)
                    } else {
                         setIndexed(false)
                    }

                    if(res.data.documentation && Object.keys(res.data.documentation).length>0){
                        setOpsDocumentation(res.data.documentation)
                        setUpdatedOpsDocumentation(res.data.documentation)
                        setSelectedDocGroupTab(Object.keys(res.data.documentation)[0])
                    }
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
            <Modal
                opened={addingNewDocumentationGroup}
                onClose={() => setAddingNewDocumentationGroup(false)}
                centered
                size={800}
                title={<Text
                    sx={{
                        fontFamily: "Visuelt",
                        fontWeight: 650,
                        fontSize: "40px",
                        paddingTop:20,
                        paddingLeft: 20
                    }}

                  >
                    New Documentation Group
                  </Text>}
                >
                    <div style={{paddingLeft:20, paddingRight: 20, paddingBottom: 20}}>
                        <Text
                            style={{
                                fontFamily: 'Visuelt',
                                fontSize: '18px',
                                fontWeight: 100,
                                color: '#000000'
                            }}
                        >
                            The name of this group will be used to categorize your documentation.  Choose this carefully as Tandem will use this category to query for relevant information when providing support.
                        </Text>
                        <div style={{height: 20}}/>
                        <TextInput
                            label={
                                <Text
                                    style={{
                                        fontFamily: 'Visuelt',
                                        fontSize: '18px',
                                        fontWeight: 500,
                                        color: '#000000'
                                    }}
                                >
                                    Group Name
                                </Text>}
                            value={newDocumentationGroupName}
                            style={{width: 400}}
                            onChange={(e) => setNewDocumentationGroupName(e.target.value)}
                        />
                        <div style={{height: 20}}/>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <Button
                                style={{
                                    fontFamily: 'Visuelt',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    backgroundColor: '#000000',
                                    color: '#FFFFFF',
                                    borderRadius: '10px',
                                    height: '40px',
                                    width: '200'
                                }}
                                onClick={() => {
                                    var formattedNewDocumentationGroupName = newDocumentationGroupName.replace(/\s+/g, '_').toLowerCase()
                                    updateOpsDocumentationContext(formattedNewDocumentationGroupName, '').then(() => {
                                        setAddingNewDocumentationGroup(false)
                                        setNewDocumentationGroupName('')
                                        setSelectedDocGroupTab(formattedNewDocumentationGroupName)
                                    })
                                }}
                            >
                                Create Group
                            </Button>
                            <div style={{height: 20}}/>
                            <Button
                                style={{
                                    fontFamily: 'Visuelt',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    backgroundColor: '#FFFFFF',
                                    color: '#000000',
                                    borderRadius: '10px',
                                    height: '40px',
                                    width: '200'
                                }}
                                onClick={() => {
                                    setAddingNewDocumentationGroup(false)
                                    setNewDocumentationGroupName('')
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
            </Modal>
            <div style={{display: 'flex', flexDirection: 'row', paddingBottom: 10, alignItems: 'baseline'}}>
                <Text style={{height: '40px', fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{apiMetadata.name}</Text>
                <div style={{width: 10}}></div>
                <Text style={{height: '40px',fontFamily:'apercu-regular-pro', fontSize: '25px'}}>{apiMetadata.version}</Text>
            </div>
            <Breadcrumbs separator="→">{items}</Breadcrumbs>
            <div style={{height: 20}}/>         
            <div style={{display:'flex', paddingBottom: 20, paddingTop: 30}}>
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
            <div style={{border: '1px solid #EAEAFF', padding: 30, display:'flex', flexDirection:'column', borderRadius: 10}}>
               { 
                  apiMetadata && indexed ? ( 
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
                                        Your API Assistant
                                    </Text>
                                    <Text 
                                        style={{
                                            fontFamily:'Visuelt',
                                            fontWeight: 100,
                                            fontSize: '18px',
                                        }}
                                    >
                                        Open or share this API assistant to automate support for your API documentation.
                                    </Text>
                                </div>

                            </div>
                            <div style={{height: 20}}/>
                            <div style={{display: 'flex', flexDirection:'row', alignItems:'center', paddingLeft: 50}}>
                                <div style={{display: 'flex', flexDirection:'row', alignItems:'center'}}>
                                    <CopyButton  value={process.env.NEXT_PUBLIC_APP_BASE_URL+'/apis/'+interfaceId+'/chat/'+uuidv4()}timeout={2000}>
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
                                    Generate an API AI Assistant
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
                                Tandem will use your API documentation to inform the responses of an AI assistant.  Feel free to share with your team or customers.
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
                                    indexApiDocumentation()
                                }}
                            >
                                <Text style={{color: 'black', fontFamily:'Visuelt', fontWeight:400, fontSize: 15}}>
                                    Generate API Assistant
                                </Text>
                            </Button>
                        </div>  
                    )
                }
               
            </div>
            <div style={{height: 20}}/>
            <div style={{border: '1px solid #EAEAFF', padding: 30, display:'flex', flexDirection:'column', borderRadius: 10}}>
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
                            src={apiBreakdownIcon}
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
                        API Data Breakdown
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
                    Below is a breakdown of the data that Tandem has stored for you API.  Feel free to add details, actions, or webhooks.  If you have generated an API Assistant, this is the data that will be used to answer questions.
                </Text>
                <div style={{height: 20}}/>
                <Tabs radius={"sm"} color={'dark'} defaultValue="metadata">
                    <Tabs.List>
                        <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="metadata">
                            <Text style={{fontFamily: 'Visuelt', fontSize: '20px'}}>
                                Basics
                            </Text>
                        </Tabs.Tab>
                        <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="actions" icon={
                            <div style={{width: 20, height: 20}}>
                                <Image alt="actions" src={actionIcon}/>
                            </div>
                        }>
                            <Text style={{fontFamily: 'Visuelt', fontSize: '20px'}}>
                                Actions
                            </Text>
                        </Tabs.Tab>
                        <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="webhooks" icon={
                            <TbWebhook size={20}/>
                        }>
                            <Text style={{fontFamily: 'Visuelt', fontSize: '20px'}}>
                                Webhooks
                            </Text>
                        </Tabs.Tab>
                        <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="schemas" icon={
                            <div style={{width: 20, height: 20}}>
                                <Image alt="schemas" src={schemaIcon}/>
                            </div>
                        }>
                            <Text style={{fontFamily: 'Visuelt', fontSize: '20px'}}>
                                Schemas
                            </Text>
                        </Tabs.Tab>
                        {/* <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} icon={
                            <div style={{width: 20, height: 20}}>
                                <Image alt="recipes" src={recipeIcon}/>
                            </div>
                        } value="recipes">Recipes (Coming soon)</Tabs.Tab> */}
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
                    <Tabs.Panel value="recipes" label="Recipes">
                        <Button onClick={() => {
                            router.push(`/apis/${interfaceId}/recipes/new`)
                        }}>Create a Recipe</Button>
                    </Tabs.Panel>
                </Tabs>
            </div>
            <div style={{height: 20}}/>
            <div style={{border: '1px solid #EAEAFF', padding: 30, display:'flex', flexDirection:'column', borderRadius: 10}}>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <>
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
                                src={apiBreakdownIcon}
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
                            Categorized Documentation
                        </Text>
                    </>
                    <>
                        <Button 
                            disabled = {!canTrainOnDocumentation}
                            loading={indexingLoading}
                            sx={{
                                marginLeft: 'auto',
                                marginRight: 0,
                                backgroundColor: '#000000',
                                color: '#FFFFFF',
                                borderRadius: '10px',
                                height: '40px',
                                width: '200'
                            }}
                            onClick={() => {
                                indexApiDocumentation()
                            }}
                            >
                                Train on Documentation
                            </Button>
                    </>
                    
                </div>
                <div style={{height: 10}}/>
                <Text
                    style={{
                        fontFamily: 'Visuelt',
                        fontSize: '18px',
                        fontWeight: 100
                    }}
                >
                    Add additional documentation grouped by functional area that will provide context to the API Assistant when answering questions.
                </Text>
                <div style={{height: 20}}/>
                {
                    Object.keys(updatedOpsDocumentation).length > 0 ? (
                        <Tabs value={selectedDocGroupTab} onTabChange={setSelectedDocGroupTab} radius={"sm"} color={'dark'} defaultValue="metadata">
                            <Tabs.List>
                                {
                                    Object.keys(updatedOpsDocumentation).map((key, index) => {
                                        
                                        return (
                                        <Tabs.Tab key={key} style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value={key}>
                                            <Text style={{fontFamily: 'Visuelt', fontSize: '20px'}}>
                                                {key.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); })}
                                            </Text>
                                        </Tabs.Tab>
                                        )
                                    })
                                }
                                <Tabs.Tab onClick={() => {
                                    setAddingNewDocumentationGroup(true)
                                }} key={'new'} value={'new'}>
                                        <Text
                                            sx={{
                                                fontFamily: 'Visuelt', 
                                                fontSize: '20px',
                                                color:'#BABABA',
                                                fontWeight: 500
                                            }}
                                        >
                                            + New Group
                                        </Text>
                                
                                </Tabs.Tab>
                            </Tabs.List>

                            {
                                Object.keys(updatedOpsDocumentation).map((key, index) => {
                                    return (
                                        <Tabs.Panel key={key} value={key}>
                                            <div style={{height: 20}}/>
                                            <Editor
                                                apiKey='w08ojy3xmc3wgrerv67mjjt7l7ivhosg1obj6gin6ngjc4gn'
                                                onInit={(evt, editor) => editorRef.current = editor}
                                                initialValue={"<p>"+updatedOpsDocumentation[key].text+"</p>"}
                                                init={{
                                                height: 500,
                                                menubar: false,
                                                plugins: [
                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                ],
                                                toolbar: 'undo redo | blocks | code |' +
                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'removeformat | help',
                                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                                }}
                                            />  
                                            <div style={{height: 20}}/>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                }}
                                            >
                                                <Button 
                                                    style={{
                                                        fontFamily: 'Visuelt',
                                                        fontSize: '16px',
                                                        fontWeight: 500,
                                                        backgroundColor: '#000000',
                                                        color: '#FFFFFF',
                                                        borderRadius: '10px',
                                                        height: '40px',
                                                        width: '200',
                                                        loading: savingDocumentation
                                                    }} onClick={()=>{
                                                        saveDocumentation()
                                                    }}>
                                                    Save Changes
                                                </Button>  
                                            
                                                {/* <Button 
                                                    style={{
                                                        fontFamily: 'Visuelt',
                                                        fontSize: '16px',
                                                        fontWeight: 500,
                                                        backgroundColor: 'white',
                                                        color: '#000000',
                                                        border: '1px solid #000000',
                                                        borderRadius: '10px',
                                                        height: '40px',
                                                        width: '200',
                                                        marginLeft: 20
                                                    }}
                                                onClick={() => {
                                                                                                    }}
                                                >
                                                    Cancel Changes
                                                </Button> */}
                                            </div>
                                            
                                        </Tabs.Panel>
                                    )
                                })
                            }
                        
                        </Tabs>
                    ) : (
                        <div>
                            <Button
                                onClick={() => {
                                    setAddingNewDocumentationGroup(true)
                                }}
                                style={{
                                    fontFamily: 'Visuelt',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    backgroundColor: '#000000',
                                    color: '#FFFFFF',
                                    borderRadius: '10px',
                                    height: '40px',
                                    width: '200'
                                }}
                            >
                                Create a Documentation Group
                            </Button>
                        </div>
                    )
                }
                    
            </div>
        </div>
    ) : (
        <Loader/>
    )
}

export default ViewApi