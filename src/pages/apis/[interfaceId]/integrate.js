
import React, {useState,useContext,useCallback, useEffect} from 'react'
import {Text, Button, Card, Image, Center, Loader, useMantineTheme, TextInput, Select, Badge} from '@mantine/core'
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router'
import axios from 'axios';
import { CiSearch } from "react-icons/ci";


const Integrate = () => {

    const router = useRouter()
    const { interfaceId } = router.query
    const [isLoading , setIsLoading] = useState(false)
    const {user, error, isLoading: isUserLoading} = useUser();
    const [organization, setOrganization] = useState(null)
    const [partnerships, setPartnerships] = useState(null)
    const [api, setApi] = useState(null)
    const [partnershipId, setPartnershipId] = useState(null)
    const [email, setEmail] = useState(null)

    const newWorkflowHandler = () => {
        setIsLoading(true)
        var newWorkflow = {
            parent_project_uuid: partnershipId,
            trigger: {},
            steps: [],
            name: "Untitled Workflow",
            created_by: 'temp_' + email,
            status: "Draft",
            uuid: "",
            nodes: [],
            edges: [],
            interfaces: [interfaceId]
        }

        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + partnershipId + '/workflows', newWorkflow)
            .then((res) => {
                console.log(res)
                let newWorkflowUuid = res.data.workflow.uuid
                //Add WorkflowUUID to Partnership Workflows Array
                router.push(`/partnerships/${partnershipId}/workflows/${newWorkflowUuid}`)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err)
                setIsLoading(false)
            })
    }

    useEffect( () => {
        if(!partnerships && organization){
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects',{params: {'organization': organization.uuid}}).then((res) => {
                setPartnerships(res.data)
            })
        }
    }, [organization, partnerships])

    useEffect( () => {
        if(!api && interfaceId){
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + interfaceId).then((res) => {
                setApi(res.data)
                let organizationId = res.data.importing_organization ? res.data.importing_organization : res.data.owning_organization
                
                if(organizationId){
                    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/' + res.data.owning_organization).then((res) => {
                        setOrganization(res.data)
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [interfaceId, api])

    return (
        <div style={{height: '100%',display:'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
            <Card shadow='md' style={{width: '80%', marginLeft: 20, marginTop: 20, padding: 40}}>
                <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>Enter Partner Code</Text>
                
                {
                    organization && organization.name ? (
                        <Text style={{paddingLeft: 20, paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 100, fontSize: '20px'}}>A partner code should have been provided to you by {organization.name}.  Enter the code along with your email address to start integrating.</Text>
                    ) : (
                        <Text style={{paddingLeft: 20, paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 100, fontSize: '20px'}}>A partner code should have been provided to you.  Enter the code along with your email address to start integrating.</Text>
                    )
                }
                <TextInput 
                    style={{width: 300, marginLeft: 20}}
                    placeholder="Partner Code"
                    onChange={(e) => setPartnershipId(e.target.value)}
                />
                <div style={{height: 20}}/>
                <TextInput 
                    style={{width: 300, marginLeft: 20}}
                    placeholder="Email Address"
                    type='email'
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={()=>{
                    newWorkflowHandler()
                }} loading={isLoading} color='dark' style={{marginLeft: 20, marginTop: 20}}>Get Started</Button>
            </Card>
        </div>
    )
}

export default Integrate