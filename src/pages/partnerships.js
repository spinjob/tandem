import { useState, useCallback, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import {Card, Button,Text, Anchor, Image, Loader, Modal, BackgroundImage, Container} from '@mantine/core'
import PartnershipsTable from '../components/Partnerships/partnership-table'
import NewPartnership from '../components/Partnerships/newPartnership'
import axios from 'axios';
import {useContext} from 'react'
import AppContext from '../context/AppContext';
import partnershipsTableBackground from '../../public/Partnerships-Table-Background.svg'
import helpCardBackground from '../../public/Help-Card-Background.svg'

const Partnerships = () => {

    const { user, error, isLoading } = useUser();
    const [partnerships, setPartnerships] = useState(null)
    const [partnershipWorkflows, setPartnershipWorkflows] = useState(null)
    const {setOrganization} = useContext(AppContext)
    const {organization} = useContext(AppContext).state
    const {setDbUser} = useContext(AppContext)
    const {dbUser} = useContext(AppContext).state
    const [modalOpened, setModalOpened] = useState(false)
    const [apis, setApis] = useState(null)
    
    const data = partnerships?.map((partnership) => {
        return {
            id: partnership.uuid,
            name: partnership.name,
            workflows: partnership.workflows?.length,
            updated: partnership.updated_at
        }
    })

    console.log(partnerships)
    const fetchApis = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces?organization=' + organization)
            .then((res) => {
                setApis(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
   }, [organization])

    const fetchPartnerships = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects?organization=' + organization)
            .then((res) => {
                setPartnerships(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [organization, setPartnerships])

    const fetchDbUser = useCallback(() => {
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
    }, [user, setDbUser, setOrganization])

    useEffect(() => {
        if (organization && !apis) {
            
            fetchApis()
        }
    }, [organization, fetchApis, apis])

    useEffect(() => {
        if (organization && !partnerships) {
            fetchPartnerships()
        }
    }, [organization, fetchPartnerships, partnerships])

    useEffect(() => {
        if (!organization && user && !dbUser) {
            fetchDbUser()
        }
    }, [organization, user, dbUser, fetchDbUser])


    return user && organization && partnerships ? ( 
        <div style={{display: 'flex', flexDirection:'column', width: '100vw', padding:30, paddingLeft: 40}}>
            <Modal
                centered
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                size="xl"
                title={
                        <Text style={{fontFamily: 'Visuelt', fontWeight: 650, fontStyle: 'medium', fontSize: '25px'}}>Create a New Partnership</Text>                      
                }
            >
               <NewPartnership organization={organization} apis={apis}/>
            </Modal>
                <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 600, fontSize: '38px'}}>Welcome, {user?.given_name}</Text>
                <div style={{display:'flex'}}>
                    <Card style={{height: 165, width: 253, paddingTop: 38, paddingLeft: 50, backgroundColor: '#ffecea'}}radius={'xl'}>
                        <Card.Section>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Uncleared Errors</Text>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 700, fontSize: '80px'}}>0</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 20}}/>
                    <Card style={{height: 165, width: 253, paddingTop: 38, paddingLeft: 50, backgroundColor: '#d9fac0'}}radius={'xl'}>
                        <Card.Section>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Active Workflows</Text>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 700, fontSize: '80px'}}>0</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 20}}/>
                    <Card style={{height: 165, width: 253, paddingTop: 38, paddingLeft: 50, backgroundColor: '#eaeaff'}}radius={'xl'}>
                        <Card.Section>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Hours Saved</Text>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 700, fontSize: '80px'}}>0</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 20}}/>
                    <BackgroundImage style={{
                        height: 165,
                        width: 308, 
                       
                    }} src={helpCardBackground}>
                        <Card sx={{backgroundColor: 'transparent'}}>
                            <Card.Section sx={{backgroundColor: 'transparent', paddingTop: 14, paddingLeft: 23}}>
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Help & Support</Text>
                            </Card.Section>
                            <Card.Section sx={{backgroundColor: 'transparent', paddingTop: 14, paddingLeft: 23}}>
                                <Anchor underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Importing API Specs</Anchor>
                                <div style={{height: 5}}/>
                                <Anchor  underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Creating New Workflows</Anchor>
                                <div style={{height: 5}}/>
                                <Anchor  underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Managing Partnerships</Anchor>
                            </Card.Section>
                           
                        </Card>
                        
                    </BackgroundImage>
                </div>
                <div style={{height: 30}}/>
                <div>
                    <BackgroundImage style={{
                      
                        width: "1128px",
                        height:"467px",
                        padding: 30
                    }}
                     src={partnershipsTableBackground}
                     >
                        <Text style={{fontFamily:'Visuelt', fontWeight: 550, fontSize: '20px', paddingBottom: 20, marginTop: -10}}>Partnerships</Text>
                        <div style={{height: 10}}/>
                        <div style={{display:'flex', justifyContent: 'space-between', paddingBottom: 20}}>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <Button style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: 'black', color: 'white'}}> All </Button>
                                <div style={{width: 10}}/>
                                <Button style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: '#b4f481', color: 'black'}}>Active</Button>
                                <div style={{width: 10}}/>
                                <Button style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: '#e7e7e7', color: 'black'}}> Draft </Button>
                            </div>
                            <Button onClick={() => setModalOpened(true)} style={{backgroundColor: 'black', height: '35px',width: '175px', borderRadius: 8}}>
                                    <Text>New Partnership</Text>
                            </Button>
                        </div>
                        <PartnershipsTable data={data}/>
                     </BackgroundImage>
                </div>
            </div>  
        ) : (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        )
}

export default Partnerships