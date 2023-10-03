
import React, {useState,useContext,useCallback, useEffect} from 'react'
import {Text, Button, Card, Image, Center, Loader, useMantineTheme, TextInput, Select, Badge, Modal} from '@mantine/core'
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router'
import AppContext from "../context/AppContext"
import axios from 'axios';
import jiraIcon from '../../public/icons/jira-software.svg'
import { useMergeLink } from "@mergeapi/react-merge-link";

const MyApps = () => {

    const {user, error} = useUser();
    const [linkToken, setLinkToken] = useState(null)
    const {organization} = useContext(AppContext).state
    const [organizationMetadata, setOrganizationMetadata] = useState(null)
    const [organizationConnections, setorganizationConnections] = useState(null)
    const [selectedApp, setSelectedApp] = useState(null)
    const [selectedConnection, setSelectedConnection] = useState(null)
    const [selectedProjectMappingType, setSelectedProjectMappingType] = useState(null)
    const [projectMappingOptions, setProjectMappingOptions] = useState(null)
    const [selectedConnectionSettings, setSelectedConnectionSettings] = useState(null)
    const [connectionSettingsChanged, setConnectionSettingsChanged] = useState(false)
    const [modalOpen, setModalOpen] = useState(false);
    const [connectionSettings, setConnectionSettings] = useState(null)
    const [saveInProgress, setSaveInProgress] = useState(false)
    
    const [apps, setApps] = useState([
        {
            name: 'Jira',
            icon: jiraIcon,
            description: 'Automatically create Projects from your Jira Tickets.',
            id: 'JIRA'
        }
    ])

    const onSuccess = useCallback((public_token) => {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/'+organization+'/accountToken',{
            publicToken: public_token
        })
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.log(err)
        })
        }, [organization]);

    const retrieveLinkToken = useCallback(() => {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/'+organization+'/linkToken', 
        {
            organizationName: organizationMetadata.name,
            email: user.email,
        }
    ).then((res) => {
            setLinkToken(res.data.link_token)
        })
    })


    const fetchorganizationConnections = useCallback(() => {
    
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/connections?organization=' + organization)
        .then((res) => {
            setorganizationConnections(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
        
    }, [organization])

    const fetchOrganizationMetadata = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/'+organization)
        .then((res) => {
            setOrganizationMetadata(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
    })

    const fetchProjectMappingOptions = useCallback((type) => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/connections/' + selectedConnection.uuid + '/ticketing/' + selectedConnection.account_token + '/parent' + '?type=' + type)
        .then((res) => {
            if(res.data.results){
                setProjectMappingOptions(res.data.results)
            }
        })
        .catch((err) => {
            console.log(err)
        })
        
    })

    const updateConnection = useCallback(() => {
        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/connections/' + selectedConnection.uuid, {
            configurations: selectedConnectionSettings
        })
        .then((res) => {
            console.log(res)
            setModalOpen(false)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [selectedConnection, selectedConnectionSettings])

    useEffect( () => {
        if(!linkToken && organizationMetadata && user){
            retrieveLinkToken()
        }
    }, [organizationMetadata, linkToken, user])
    
    useEffect( () => {
        if(!organizationMetadata && organization){
            fetchOrganizationMetadata()
        }
    }, [organization, organizationMetadata])

    useEffect( () => {
        if(!organizationConnections && organization){
            fetchorganizationConnections()
        }
    }, [organization, organizationConnections])

    useEffect( () => {
        if(selectedConnectionSettings !== selectedConnection?.configurations){
            setConnectionSettingsChanged(true)
        } 
        else {
            setConnectionSettingsChanged(false)
        }
    }, [selectedConnectionSettings, selectedConnection])


    const { open, isReady } = useMergeLink({
        linkToken: linkToken,
        onSuccess,

    });

    return (
        <>
            <div style={{width: '45vw',padding:30, display:'flex', flexDirection:'column'}}>
                <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>Applications</Text>
            </div>
            <div style={{width: '45vw',padding:30, display:'flex', flexDirection:'row', flexWrap:'wrap'}}>
                {
                    apps && apps.length > 0 ? (
                        apps.map((app) => {
                            const isConnected = organizationConnections && organizationConnections.some(connection => connection.service === app.id);
                            const connection = isConnected ? organizationConnections.find(connection => connection.service === app.id) : null;
                            const connectionStatus = isConnected ? 'ACTIVE' : 'INACTIVE';
                            return (
                                <Card key={app.id} shadow="sm" style={{width: '400px', height: '400px', margin: 20, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', position: 'relative'}}>
                                    {connectionStatus === 'ACTIVE' && <Badge color="green" style={{position: 'absolute', top: 10, right: 10}}>Active</Badge>}
                                    <Image src={app.icon} width={100} height={100} style={{marginBottom: 20}}/>
                                    <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px'}}>{app.name}</Text>
                                    <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 100, fontSize: '15px'}}>{app.description}</Text>
                                    <Button onClick={() => {
                                        open()
                                        setSelectedApp(app.id)
                                    }} disabled={!isReady && organization} variant="outline" color="dark" style={{marginTop: 0}}>
                                        {isConnected ? 'Edit Connection' : 'Connect'}
                                    </Button>
                                    {isConnected && <Button onClick={() => {
                                        setModalOpen(true)
                                        setSelectedConnection(connection)
                                        if(connection.configurations){
                                            setSelectedConnectionSettings(connection.configurations)
                                        }
                                    }} variant="outline" color="dark" style={{marginTop: 10}}>Settings</Button>}
                                    <Modal opened={modalOpen} onClose={() => setModalOpen(false)}>
                                        <div style={{width: '400px',padding:30, display:'flex', flexDirection:'column', flexWrap:'wrap'}}>
                                            <Text style={{fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>JIRA Settings</Text>
                                            <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 100, fontSize: '20px'}}>Specify what JIRA entities Tandem should create Projects from automatically</Text>
                                            <Select
                                                label="Choose an Entity Type"
                                                data={[
                                                    { value:'Project', label: 'JIRA Project'},
                                                    { value:'Epic', label: 'JIRA Epic'},
                                                    { value:'Story', label: 'JIRA Story'}
                                                ]}
                                                placeholder="Select a Project Mapping"
                                                style={{ marginBottom: 20}}
                                                onChange={(e) => {
                                                    setSelectedProjectMappingType(e)
                                                    fetchProjectMappingOptions(e)
                                                }}
                                            />
                                            {
                                                projectMappingOptions && projectMappingOptions.length > 0 ? (
                                                    <Select
                                                        label={"Choose a " + selectedProjectMappingType}
                                                        data={projectMappingOptions.map((option) => {
                                                            return {
                                                                value: option.id + '_' + option.name,
                                                                label: option.name
                                                            }
                                                        }
                                                        )}
                                                        placeholder="Select a Project Mapping"
                                                        style={{ marginBottom: 20}}
                                                        onChange={(e) => {
                                                            let connectionConfigurations = selectedConnectionSettings ? selectedConnectionSettings : {}
                                                            let [id, name] = e.split('_')

                                                            connectionConfigurations = {
                                                                ...connectionConfigurations,
                                                                projectMapping: {
                                                                    entity: selectedProjectMappingType,
                                                                    id: id,
                                                                    name: name
                                                                }
                                                            }
                                                            setSelectedConnectionSettings(connectionConfigurations)
                                                        }}
                                                    />

                                                ) : null
                                            }{
                                               selectedConnectionSettings && selectedConnectionSettings.projectMapping && !saveInProgress ? (
                                                <>
                                                    <Button 
                                                        disabled={!connectionSettingsChanged && selectedConnectionSettings} 
                                                        onClick={() => {
                                                            updateConnection()
                                                        }} 
                                                        variant="outline" 
                                                        color="dark" 
                                                        style={{marginTop: 10}}>
                                                            Save
                                                    </Button>
                                                    <Button 
                                                        onClick={() => {
                                                                setModalOpen(false)
                                                        }} 
                                                        variant="outline" 
                                                        color="dark" 
                                                        style={{marginTop: 10}}>
                                                            Cancel
                                                    </Button>

                                                </>
                                              
                                               ) : saveInProgress ? (
                                                <Loader />
                                               ) : null
                                            }
                                        </div>
                                    </Modal>
                                </Card>
                            )
                        }
                    )) : (
                        null
                    )
                }
            </div>
        </>
       
    )
}

export default MyApps