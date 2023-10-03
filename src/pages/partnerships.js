import { useState, useCallback, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import {Card, Button,Text, Anchor, Image, Loader, Modal, BackgroundImage, Container} from '@mantine/core'
import PartnershipsTable from '../components/Partnerships/partnership-table'
import NewPartnership from '../components/Partnerships/newPartnership'
import axios from 'axios';
import {useContext} from 'react'
import {useRouter} from 'next/router'
import AppContext from '../context/AppContext';
import checkmarkCircleIcon from '../../public/icons/Checkmark-Circle-Icon.svg'
import arrowIcon from '../../public/icons/Arrow.svg'
import partnershipsTableBackground from '../../public/Partnerships-Table-Background.svg'
import purpleOnboardingContainer from '../../public/Purple-Onboarding-Container.svg'
import emptyStateHelpContainer from '../../public/EmptyState-Help-Container.svg'
import emptyStatePartnershipsBackground from '../../public/EmptyState-Partnerships-Background.svg'
import emptyStatePartnershipsGraphic from '../../public/EmptyState-Partnership-Table-Graphic.svg'
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
    const [workflowCount, setWorkflowCount] = useState(0)
    const [apis, setApis] = useState(null)
    const [statusFilter, setStatusFilter] = useState('None')
    const router = useRouter()
    const [onboarding, setOnboarding] = useState(null)

    const data = partnerships?.map((partnership) => {
 
        return {
            id: partnership.uuid,
            key: partnership.uuid,
            name: partnership.name,
            workflows: partnership.workflows?.length,
            updated: partnership.updated_at,
            status: partnership.status
        }
    })

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
                var partnershipWorkflowCount = 0
                res.data.forEach((partnership) => {
                    partnership.workflows.forEach((workflow) => {
                        partnershipWorkflowCount += 1
                    })
                })
                setWorkflowCount(partnershipWorkflowCount)
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
              setOrganization(res.data.organization)
            }
        })
        .catch((err) => {
            // console.log(err)
        })
    }, [user, setDbUser, setOrganization])

    useEffect(() => {
        // If there are no partnerships, workflows, or APIs have been created yet, set onboarding to true
        if(partnerships?.length ==0 || workflowCount==0 || apis?.length==0){
            setOnboarding(true)
        } else {
            setOnboarding(false)
        }
    }, [partnerships, partnershipWorkflows, apis, workflowCount, setOnboarding])

    useEffect(() => {
        if (organization && !apis) {
            
            fetchApis()
        }
    }, [organization, fetchApis, apis])

    useEffect(() => {
        if (organization && !partnerships) {
            fetchPartnerships()
        }
    }, [organization, partnerships])

    useEffect(() => {
        if (!organization && user && !dbUser) {
            fetchDbUser()
        }
    }, [organization, user, dbUser, fetchDbUser])

    const renderStatusFilters = () => {
        const statusArray = []
        partnerships?.forEach((partnership) => {
            if(!statusArray.includes(partnership.status)){
                statusArray.push(partnership.status)
            }
        })
        return statusArray.map((status) => {
            return status != 'Active' && status ? (
                    <div key={status} style={{paddingRight: 8}}>
                        <Button onClick={() => setStatusFilter(status)}  style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor:'#e7e7e7', color: 'black'}} >
                            {status} ({partnerships.filter((partnership) => partnership.status === status).length})
                        </Button>
                    </div>
                ) : (
                    null 
                )
        })
    }


    return user && organization && partnerships && !onboarding ? ( 
        <div style={{display: 'flex', flexDirection:'column', width: '100vw', padding:30, paddingLeft: 40}}>
            <Modal
                centered
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                size="xl"
                title={
                        <Text style={{fontFamily: 'Visuelt', fontWeight: 650, fontStyle: 'medium', fontSize: '25px'}}>Create a New Project</Text>                      
                }
            >
               <NewPartnership organization={organization} apis={apis}/>
            </Modal>
                {
                    user?.given_name ? (
                        <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 600, fontSize: '38px'}}>Welcome, {user?.given_name}</Text>

                    ):(
                        <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 600, fontSize: '38px'}}>Welcome!</Text>
                    )
                }
                <div style={{display:'flex'}}>
                    <Card style={{height: 165, width: 253, paddingTop: 38, paddingLeft: 50, backgroundColor: '#ffecea'}}radius={'xl'}>
                        <Card.Section>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Projects</Text>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 700, fontSize: '80px'}}>{
                                partnerships?.length
                            }</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 20}}/>
                    <Card style={{height: 165, width: 253, paddingTop: 38, paddingLeft: 50, backgroundColor: '#d9fac0'}}radius={'xl'}>
                        <Card.Section>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Workflows</Text>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 700, fontSize: '80px'}}>{workflowCount}</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 20}}/>
                    <Card style={{height: 165, width: 253, paddingTop: 38, paddingLeft: 50, backgroundColor: '#eaeaff'}}radius={'xl'}>
                        <Card.Section>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>APIs</Text>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 700, fontSize: '80px'}}>{apis?.length}</Text>
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
                                <Anchor  underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Managing Integrations</Anchor>
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
                        <Text style={{fontFamily:'Visuelt', fontWeight: 550, fontSize: '20px', paddingBottom: 20, marginTop: -10}}>Projects</Text>
                        <div style={{height: 10}}/>
                        <div style={{display:'flex', justifyContent: 'space-between', paddingBottom: 20}}>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <div style={{paddingRight: 8}}>
                                    <Button onClick={()=>{setStatusFilter('None')}} style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: 'black', color: 'white'}}> All ({data.length}) </Button>
                                </div>
                                <div style={{paddingRight: 8}}>
                                    <Button onClick={()=>{setStatusFilter('Active')}} style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: '#B4F481', color: 'black'}}> Active ({data.filter((item) => {
                                    return item.status === 'Active'
                                }).length}) </Button>
                                </div>
                                {renderStatusFilters()}
                            </div>
                            <Button onClick={() => setModalOpened(true)} style={{backgroundColor: 'black', height: '35px',width: '175px', borderRadius: 8}}>
                                <Text>New Project</Text>
                            </Button>
                        </div>
                        <PartnershipsTable statusFilter={statusFilter} data={
                            partnerships?.map((partnership) => {
                                return {
                                    id: partnership.uuid,
                                    key: partnership.uuid,
                                    name: partnership.name,
                                    workflows: partnership.workflows?.length,
                                    updated: partnership.updated_at,
                                    status: partnership.status
                                }
                            })}/>
                     </BackgroundImage>
                </div>
            </div>  
        ) : user && organization && partnerships && onboarding ? (
            <div style={{display: 'flex', flexDirection:'column', padding:30, paddingLeft: 40}}>
            <Modal
                centered
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                size="xl"
                title={
                        <Text style={{fontFamily: 'Visuelt', fontWeight: 650, fontStyle: 'medium', fontSize: '25px'}}>Create a New Project</Text>                      
                }
            >
               <NewPartnership organization={organization} apis={apis}/>
            </Modal>
                <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 600, fontSize: '38px'}}>Welcome, {user?.given_name}</Text>
                <div style={{display:'flex', justifyContent: 'space-between', width: 1128}}>
                    <BackgroundImage style={{
                        height: 215,
                        width: 780,

                    }} src={purpleOnboardingContainer}>
                        <div>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 400, fontSize: '18px', paddingTop: 15, paddingLeft: 30}}>Getting Started</Text>
                        </div>
                        <div style={{height: 20}}/>
                        <div style={{paddingLeft: 30, display:'flex', flexDirection:'column'}}>
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                {
                                    apis?.length > 0 ? (
                                        <div style={{width: 20, height: 20, backgroundColor: ''}}>
                                            <Image alt="checkmarkIcon" src={checkmarkCircleIcon}/>
                                        </div>
                                    ) : (
                                        <div style={{height: 20, width: 20, borderRadius:'50%', backgroundColor:'white'}}/>
                                    )
                                } 
                                <div style={{width:18}}/>    
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '15px'}}>
                                    Import API Spec
                                </Text>
                                <div style={{width: 95}}/>
                                <div>
                                    <Button sx={{backgroundColor:'transparent', '&:hover':{backgroundColor: 'transparent'}}}>
                                        <Text sx={{fontFamily:'Visuelt', fontWeight: 50, fontSize: '15px', color: '#5a5a5a'}}>See supported Open API versions</Text>
                                        <div style={{width: 5}}/>
                                        <div style={{width: 20, height: 20}}>
                                            <Image alt="arrowIcon" src={arrowIcon} />
                                        </div>
                                    </Button>
                                    
                                </div>

                            </div>
                            <div style={{height: 8}}/>
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                {
                                    partnerships.length > 0 ? (
                                        <div style={{width: 20, height: 20, backgroundColor: ''}}>
                                            <Image alt="checkmarkIcon" src={checkmarkCircleIcon}/>
                                        </div>
                                    ) : (
                                        <div style={{height: 20, width: 20, borderRadius:'50%', backgroundColor:'white'}}/>
                                    )
                                } 
                                <div style={{width:18}}/>      
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '15px'}}>
                                    Create an Integration
                                </Text>
                                <div style={{width: 65}}/>
                                <div>
                                    <Button sx={{backgroundColor:'transparent', '&:hover':{backgroundColor: 'transparent'}}}>
                                        <Text sx={{fontFamily:'Visuelt', fontWeight: 50, fontSize: '15px', color: '#5a5a5a'}}>Read up on integrations and workflows</Text>
                                        <div style={{width: 5}}/>
                                        <div style={{width: 20, height: 20}}>
                                            <Image alt="arrowIcon" src={arrowIcon} />
                                        </div>
                                    </Button>
                                    
                                </div>
                            </div>
                            <div style={{height: 10}}/>
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                {
                                    workflowCount > 0 ? (
                                        <div style={{width: 20, height: 20, backgroundColor: ''}}>
                                            <Image alt="checkmarkIcon" src={checkmarkCircleIcon}/>
                                        </div>
                                    ) : (
                                        <div style={{height: 20, width: 20, borderRadius:'50%', backgroundColor:'white'}}/>
                                    )
                                } 
                                <div style={{width:18}}/>    
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '15px'}}>
                                    Create a Workflow
                                </Text>
                                <div style={{width: 80}}/>
                                <div>
                                    <Button sx={{backgroundColor:'transparent', '&:hover':{backgroundColor: 'transparent'}}}>
                                        <Text sx={{fontFamily:'Visuelt', fontWeight: 50, fontSize: '15px', color: '#5a5a5a'}}>Learn more about workflow triggers and features</Text>
                                        <div style={{width: 20, height: 20}}>
                                            <Image alt="arrowIcon" src={arrowIcon} />
                                        </div>
                                    </Button>
                                    
                                </div>
                            </div>
                        </div>
                        <div>

                        </div>
                    </BackgroundImage>
                
                    <BackgroundImage style={{
                        height: 215,
                        width: 312, 
                       
                    }} src={emptyStateHelpContainer}>
                        <Card sx={{backgroundColor: 'transparent'}}>
                            <Card.Section sx={{backgroundColor: 'transparent', paddingTop: 14, paddingLeft: 23}}>
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 500, fontSize: '18px'}}>Help & Support</Text>
                            </Card.Section>
                            <Card.Section sx={{backgroundColor: 'transparent', paddingTop: 14, paddingLeft: 23}}>
                                <Anchor underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Importing API Specs</Anchor>
                                <div style={{height: 5}}/>
                                <Anchor  underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Creating New Workflows</Anchor>
                                <div style={{height: 5}}/>
                                <Anchor  underline={true} sx={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '14px', color: 'black'}}>Managing Integrations</Anchor>
                            </Card.Section>
                        </Card>
                        
                    </BackgroundImage>
                </div>
                <div style={{height: 30}}/>
                {
                    partnerships && partnerships.length > 0 ? (
                        <div>
                        <BackgroundImage style={{
                          
                            width: "1128px",
                            height:"467px",
                            padding: 30
                        }}
                         src={partnershipsTableBackground}
                         >
                            <Text style={{fontFamily:'Visuelt', fontWeight: 550, fontSize: '20px', paddingBottom: 20, marginTop: -10}}>Integrations</Text>
                            <div style={{height: 10}}/>
                            <div style={{display:'flex', justifyContent: 'space-between', paddingBottom: 20}}>
                                <div style={{display:'flex', flexDirection:'row'}}>
                                    <div style={{paddingRight: 8}}>
                                        <Button onClick={()=>{setStatusFilter('None')}} style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: 'black', color: 'white'}}> All ({data.length}) </Button>
                                    </div>
                                    <div style={{paddingRight: 8}}>
                                        <Button onClick={()=>{setStatusFilter('Active')}} style={{fontFamily: 'apercu-light-pro', borderRadius: 30, height: 20, backgroundColor: '#B4F481', color: 'black'}}> Active ({data.filter((item) => {
                                        return item.status === 'Active'
                                    }).length}) </Button>
                                    </div>
                                    {renderStatusFilters()}
                                </div>
                                <Button onClick={() => setModalOpened(true)} style={{backgroundColor: 'black', height: '35px',width: '175px', borderRadius: 8}}>
                                    <Text>New Project</Text>
                                </Button>
                            </div>
                            <PartnershipsTable statusFilter={statusFilter} data={
                                partnerships?.map((partnership) => {
                                    return {
                                        id: partnership.uuid,
                                        key: partnership.uuid,
                                        name: partnership.name,
                                        workflows: partnership.workflows?.length,
                                        updated: partnership.updated_at,
                                        status: partnership.status
                                    }
                                })}/>
                         </BackgroundImage>
                    </div>
                    ) : (
                            <div>
                                <BackgroundImage style={{
                                
                                    width: "1128px",
                                    height:"467px",
                                    padding: 30
                                }}
                                src={emptyStatePartnershipsBackground}
                                >
                                    <Text style={{fontFamily:'Visuelt', fontWeight: 550, fontSize: '20px', paddingBottom: 20, marginTop: -10}}>Integrations</Text>
                                    <div style={{height: 30}}/>
                                    <div style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                                        <div style={{width: 421, height: 335}}>
                                            <Image alt="noPartnerships" src={emptyStatePartnershipsGraphic}/>
                                        </div>
                                        <div style={{width: 60}}/>
                                        
                                            {
                                                apis && apis.length > 0 ? (
                                                    <div style={{width: 400}}>
                                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '22px'}}>
                                                        Create your first integration
                                                    </Text>
                                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '16px', color: '#5a5a5a',fontWeight: 100}}>
                                                        All you need to get started are two of your imported API specifications.
                                                    </Text>
                                                    <div style={{height: 30}}/>
                                                    <Button onClick={() => setModalOpened(true)} style={{backgroundColor: 'black', height: '52px',width: '200px', borderRadius: 8}}>
                                                        <Text sx={{fontFamily:'Visuelt', fontSize: '20px', fontWeight: 400}}>New Project</Text>
                                                    </Button>
                                                </div>
                                                ): (
                                                    <div style={{width: 400}}>
                                                        <Text sx={{fontFamily: 'Visuelt', fontSize: '22px'}}>
                                                            Import your first APIs
                                                        </Text>
                                                        <Text sx={{fontFamily: 'Visuelt', fontSize: '16px', color: '#5a5a5a',fontWeight: 100}}>
                                                            Tandem will need API specifications to generate an integration and workflows.
                                                        </Text>
                                                        <div style={{height: 30}}/>
                                                        <Button onClick={() => router.push('/myApis')} style={{backgroundColor: 'black', height: '52px',width: '200px', borderRadius: 8}}>
                                                            <Text sx={{fontFamily:'Visuelt', fontSize: '20px', fontWeight: 400}}>Import API Specs</Text>
                                                        </Button>
                                                    </div>
                                                )
                                            }
                                     
                                    </div>
                                   
                                </BackgroundImage>
                          </div>
                        

                    )
                }

            </div>  
        ) : (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        )
}

export default Partnerships