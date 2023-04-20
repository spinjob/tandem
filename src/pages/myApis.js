import { useState, useCallback, useEffect } from 'react';
import {Modal, Button,Text, Loader, ScrollArea, Grid, Container, Badge, Tabs, TextInput, Textarea, Progress} from '@mantine/core'
import {GrAddCircle} from 'react-icons/gr'
import {VscTypeHierarchy} from 'react-icons/vsc'
import {AiOutlineCheckCircle} from 'react-icons/ai'
import ImportApiDropzone from '../components/import-api.tsx'
import { useUser } from '@auth0/nextjs-auth0/client';
import {useContext} from 'react'
import AppContext from '../context/AppContext';
import axios from 'axios';
import { useRouter } from 'next/router'

const MyApis = () => {

   const [modalOpened, setModalOpened] = useState(false)
   const [apis, setApis] = useState(null)
   const { user, error, isLoading } = useUser();
   const {organization} = useContext(AppContext).state
   const {setOrganization} = useContext(AppContext)
   const {dbUser} = useContext(AppContext).state
   const {setDbUser} = useContext(AppContext)
   const [isUploading, setIsUploading] = useState(false)
   const [uploadProgress, setUploadProgress] = useState(0)
   const [uploadJob, setUploadJob] = useState(null)
   const [newApiView, setNewApiView] = useState('upload')
   const [newApiName, setNewApiName] = useState('')
   const [newApiDescription, setNewApiDescription] = useState('')
   const [newApiVersion, setNewApiVersion] = useState('')
   const [isCreationLoading, setIsCreationLoading] = useState(false)

   const router  = useRouter();

   const delay = (ms) => new Promise((res) => setTimeout(res, ms));
   
    useEffect(() => {
        if(user?.email && !dbUser){
            console.log('refetching user')
            axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/find',{email: user.email})
            .then((res) => {
                setDbUser(res.data)
                if(res.data.organization){
                console.log("Organization Found for User")
                setOrganization(res.data.organization)
                }
            })
            .catch((err) => {
                // console.log(err)
            })
        } else {

        }
    }, [user, dbUser, setOrganization, setDbUser])

   const fetchApis = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces?organization=' + organization)
            .then((res) => {
                setApis(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
   }, [organization])

   const updateProgress = (job) => {
    var schemaProgress = job.metadata.schema.status == 'COMPLETED' ? 100 : 0
    var actionStatus = job.metadata.actions.status == 'COMPLETED' ? 100 : 0
    var parameterStatus = job.metadata.parameters.status == 'COMPLETED' ? 100 : 0
    var securitySchemeStatus = job.metadata.securitySchemes.status == 'COMPLETED' ? 100 : 0
    var webhookStatus = job.metadata.webhooks.status == 'COMPLETED' ? 100 : 0

    var totalProgress = (schemaProgress + actionStatus + parameterStatus + securitySchemeStatus + webhookStatus) / 5

    if(totalProgress == 100){

            setUploadProgress(100)
            fetchApis()
            updateJob(job.uuid)

            delay(2000).then(() => {
                setIsUploading(false)
                
            })
      
    } else {
        setUploadProgress(totalProgress)
        delay(1000).then(() => {
            fetchJob(job.uuid)
        })
        console.log(totalProgress)
    }
}


   const fetchJob = useCallback((uuid) => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/jobs/' + uuid).then((res) => {
            updateProgress(res.data)
            setUploadJob(res.data)
            console.log(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }, [updateProgress])

    const updateJob = useCallback((uuid) => {
        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/jobs/' + uuid, {status: "COMPLETE"}).then((res) => {
            setUploadJob(res.data)
        }).catch((err) => {
            console.log(err)
        })
    })

   const handleApiClick = (api) => {
        router.push('/apis/' + api.uuid)
    }

    const setInitialJob = (job) => {
        setUploadJob(job)
        setIsUploading(true)
        fetchJob(job.uuid)
    }


   useEffect(() => {
        if(organization && !apis){
            fetchApis()
        }
    }, [organization, fetchApis, apis])

    useEffect(() => {
        if(user?.email && !dbUser){
            axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/find',{email: user.email})
            .then((res) => {
                setDbUser(res.data)
                if(res.data.organization){
                  setOrganization(res.data.organization)
                }
            })
            .catch((err) => {
                console.log(err)
            })
        } else if (dbUser) {
            if(dbUser.organization){
                setOrganization(dbUser.organization)
            }
        } else {
            console.log('no user')
        }
    }, [user, dbUser, setOrganization, setDbUser])

   const renderApis = () => {
        return apis.map((api) => {
            return (
                <Grid.Col key={"gridColumn"+api.uuid} xs={4}>
                        <Button key={'button_'+api.uuid} onClick={() => {
                            handleApiClick(api)
                        }} sx={{
                            '&:hover': {
                                boxShadow: '0 0 0 1px #eaeaff'
                            }
                        }} style={{padding: 0, paddingLeft: 2, height: 170, width: 280, backgroundColor: '#ffffff', borderRadius: 20, borderColor: '#f2f0ee'}}>
                            <Container style={{display:'flex', flexDirection: 'column'}}>
                                <div style={{display:'flex', flexDirection:'row', width: '100vw', height: 60, alignItems: 'left'}}>
                                    <div style={{display: 'flex',height: 28, width: 28, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                                        <Text style={{color:"black"}}>{api.name.charAt(0)}</Text>                                 
                                    </div>
                                    <div style={{width: 190}}/>
                                    <VscTypeHierarchy style={{height: 25, width: 25, color: '#f2f0ee'}}/>
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

    function generateAPI () { 
        setIsCreationLoading(true)
        var newInterface = {
            name: newApiName,
            version: newApiVersion,
            description: newApiDescription,
            organizationId: organization
        }

        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces', newInterface).then((res) => {
            router.push('/apis/' + res.data.uuid)
            setIsCreationLoading(false)
            return res.data
        }).catch((err) => {
            console.log(err)
            setIsCreationLoading(false)
            return null
        })

    }


    return apis ? (
        <div style={{display: 'block'}}>
            <Modal
                centered
                opened={modalOpened}
                onClose={() => {
                    setModalOpened(false)
                    setUploadJob(null)
                    setUploadProgress(0)
                    setIsUploading(false)
                }}
                size="lg"
                title={
                    uploadProgress == 100 ? (
                        <Text style={{fontFamily: 'Visuelt', fontWeight: 650, fontSize: '30px', paddingLeft: 10,paddingTop: 10}}>We have processed your API spec</Text>                 

                    ) : (
                        <Text style={{fontFamily: 'Visuelt', fontWeight: 650, fontSize: '30px', paddingLeft: 10,paddingTop: 10}}>New API Spec</Text>                 
                    )     
                }
            >
               <Tabs color="dark" defaultValue={"upload"}>
                    <Tabs.List>
                        <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="upload">Open API Import</Tabs.Tab>
                        <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 500}} value="manual">Create from Scratch</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="upload" label="Upload">
                        {
                            isUploading && uploadProgress < 100 ? (
                                    <div>
                                        <div style={{height: '20px'}}/>
                                        <div style={{display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F6F3', padding: 30 }}>
                                            <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '20px', color: '#3E3E3E'}}>{uploadProgress}%</Text>
                                            <div style={{display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'center'}}>
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '20px', color: '#3E3E3E'}}></Text>
                                                <div style={{height: 60}}/>
                                                <Progress animate striped color={'#9595FF'} style={{width: 300, height: 10, backgroundColor: '#EAEAFF', borderRadius: 10}} value={uploadProgress} />
                                            </div>
                                        </div>
                                    </div>
                                    
                            ) : uploadProgress == 100 ? (
                                <>
                                <div style={{height: '20px'}}/>
                                    <div style={{display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F6F3', padding: 30 }}>
                                        <div style={{display:'flex', flexDirection:'column', width:"100%"}}>
                                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', }}>
                                                <AiOutlineCheckCircle style={{height: 30, width: 30, color: 'black', backgroundColor: '#A9E579', borderRadius:'60%'}}/>
                                                <div style={{width: 10}}/>
                                                <Text sx={{fontFamily: 'Visuelt', fontSize: '20px'}}>{uploadJob?.metadata?.schema?.count} Schemas</Text> 
                                            </div>
                                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                                <AiOutlineCheckCircle style={{height: 30, width: 30, color: 'black', backgroundColor: '#A9E579', borderRadius:'60%'}}/>
                                                <div style={{width: 10}}/>
                                                <Text sx={{fontFamily: 'Visuelt', fontSize: '20px'}}>{uploadJob?.metadata?.actions?.count} Actions</Text> 
                                            </div>
                                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                                <AiOutlineCheckCircle style={{height: 30, width: 30, color: 'black', backgroundColor: '#A9E579', borderRadius:'60%'}}/>
                                                <div style={{width: 10}}/>
                                                <Text sx={{fontFamily: 'Visuelt', fontSize: '20px'}}>{uploadJob?.metadata?.parameters?.count} Parameters</Text> 
                                            </div>
                                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                                <AiOutlineCheckCircle style={{height: 30, width: 30, color: 'black', backgroundColor: '#A9E579', borderRadius:'60%'}}/>
                                                <div style={{width: 10}}/>
                                                <Text sx={{fontFamily: 'Visuelt', fontSize: '20px'}}>{uploadJob?.metadata?.webhooks?.count} Webhooks</Text> 
                                            </div>
                                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                                <AiOutlineCheckCircle style={{height: 30, width: 30, color: 'black', backgroundColor: '#A9E579', borderRadius:'60%'}}/>
                                                <div style={{width: 10}}/>
                                                <Text sx={{fontFamily: 'Visuelt', fontSize: '20px'}}>{uploadJob?.metadata?.securitySchemes?.count} Security Schemes</Text> 
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{display: 'flex', flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', paddingTop: 30}}>
                                        <Button
                                            onClick={() => {
                                                setModalOpened(false)
                                                setUploadJob(null)
                                                setUploadProgress(0)
                                                setIsUploading(false)
                                            }}
                                            sx={{
                                                backgroundColor: 'white',
                                                color: 'black',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                    border: '1px solid #3E3E3E',
                                                    
                                                },
                                                fontFamily: 'Visuelt',
                                                border: '1px solid #3E3E3E',
                                                fontSize: '18px',
                                                fontWeight: 400,
                                                width: 120,
                                                height: 50,
                                                borderRadius: 10,
                                            }}
                                        >Close</Button>
                                        <Button
                                            onClick={() => {
                                                
                                                router.push(`/apis/${uploadJob?.metadata?.interface}`)

                                            }}
                                            sx={{
                                                backgroundColor: 'black',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#3E3E3E',
                                                
                                                },
                                                fontFamily: 'Visuelt',
                                                border: '1px solid #eaeaff',
                                                fontSize: '18px',
                                                fontWeight: 400,
                                                
                                                height: 50,
                                                borderRadius: 10,
                                            }}
                                    >View API Spec</Button>
                                    </div>
                                </>
                            
                            ) :  (
                                <>
                                    <div style={{height: '20px'}}/>
                                    <div style={{display: 'flex', flexDirection:'row', alignItems: 'center', paddingBottom: 10}}>
                                        <Text style={{ fontFamily: 'Visuelt', fontSize: '15px', paddingLeft: 10, color: '#3E3E3E'}}>Supported Open API Versions:</Text> 
                                        <Badge>v2.X</Badge>
                                        <Badge>v3.X</Badge>
                                    </div>
                                    <ImportApiDropzone setUploadJob={setInitialJob} organizationId={organization} userId={user?.sub}/>
                                </>
                            ) 
                        }
                    </Tabs.Panel>
                    <Tabs.Panel value="manual" label="Manual">
                        <>
                            <div style={{height: '20px'}}/>
                            <div style={{display: 'flex', flexDirection:'column', alignItems: 'center', paddingBottom: 10}}>
                                <TextInput
                                    withAsterisk
                                    label="API Name"
                                    value= {newApiName}
                                    onChange={(e) => {
                                        setNewApiName(e.target.value)
                                    }}
                                    sx={{
                                        width: '100%',
                                        height: 50,
                                        borderRadius: 10,
                                        fontFamily: 'Visuelt',
                                        fontSize: '18px',
                                        fontWeight: 400,
                                        paddingLeft: 10,
                                        '&:focus': {
                                            border: '1px solid #3E3E3E',
                                        }
                                    }}
                                    placeholder="e.g. My API"
                                />
                                <div style={{height: '20px'}}/>
                                <TextInput
                                    withAsterisk
                                    label="API Version"
                                    value= {newApiVersion}
                                    onChange={(e) => {
                                        setNewApiVersion(e.target.value)
                                    }}

                                    sx={{
                                        width: '100%',
                                        height: 50,
                                        borderRadius: 10,
                                        fontFamily: 'Visuelt',
                                        fontSize: '18px',
                                        fontWeight: 400,
                                        paddingLeft: 10,
                                        '&:focus': {
                                            border: '1px solid #3E3E3E',
                                        }
                                    }}
                                    placeholder="e.g. My API"
                                />
                                <div style={{height: '20px'}}/>
                                <Textarea
                                    label="API Description"
                                    value= {newApiDescription}
                                    onChange={(e) => {
                                        setNewApiDescription(e.target.value)
                                    }}

                                    sx={{
                                        width: '100%',
                                        height: 50,
                                        borderRadius: 10,
                                        fontFamily: 'Visuelt',
                                        fontSize: '18px',
                                        fontWeight: 400,
                                        paddingLeft: 10,
                                        '&:focus': {
                                            border: '1px solid #3E3E3E',
                                        }
                                    }}
                                    placeholder="e.g. My API"
                                />
                            </div>
                            <div style={{height: '60px'}}/>
                            <Button
                               disabled = {newApiName === '' || newApiVersion === ''}
                               loading={isCreationLoading}
                               onClick={() => {
                                    setIsCreationLoading(true)
                                    var api = generateAPI()
                                    if(api){
                                        
                                        setModalOpened(false)
                                    }
                               }}
                                sx={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#3E3E3E',
                                    
                                    },
                                    fontFamily: 'Visuelt',
                                    border: '1px solid #eaeaff',
                                    fontSize: '18px',
                                    fontWeight: 400,
                                    
                                    height: 50,
                                    borderRadius: 10,
                                }}
                            >Create API</Button>
                                
                        </>
                    </Tabs.Panel>
               </Tabs>

            </Modal>
            <div style={{height: '100vh', width: '45vw',padding:30, display:'flex', flexDirection:'column'}}>
                <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>Imported APIs</Text>
                <Container style={{width: '100vw', height: '100vh'}}>
                    <Grid grow={false}>
                        <Grid.Col xs={4}>
                            <Button 
                            onClick={() => setModalOpened(true)}
                            sx={{
                                '&:hover': {
                                    boxShadow: '0 0 0 1px #eaeaff'
                                }
                            }}
                            style={{height: 180, width: 280, backgroundColor: '#f8f6f3', borderRadius: 20}}>
                                <div style={{display:'flex', flexDirection:'column', alignItems: 'center'}}>
                                <GrAddCircle style={{height: 35, width: 35, color: '#c4c4c4'}} />
                                <Text style={{paddingTop: 10,fontFamily:'Visuelt', fontWeight: 100, fontSize: '20px', color:'#000000'}}>Add API Spec</Text>
                                </div>
                            </Button>
                        </Grid.Col>    
                            {renderApis()}
                        </Grid>
                </Container>   
            </div>   
        </div>
        ) : (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        )
}

export default MyApis