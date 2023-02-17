import { useState, useCallback, useEffect } from 'react';
import {Modal, Button,Text, Loader, ScrollArea, Grid, Container, Badge, createSt} from '@mantine/core'
import {GrAddCircle} from 'react-icons/gr'
import {VscTypeHierarchy} from 'react-icons/vsc'
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
   const router  = useRouter();

   const fetchApis = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces?organization=' + organization)
            .then((res) => {
                setApis(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
   }, [organization])

   const handleApiClick = (api) => {
        router.push('/apis/' + api.uuid)
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


    return apis ? (
        <div style={{display: 'block'}}>
            <Modal
                centered
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                size="lg"
                title={
                        <Text style={{fontFamily: 'Visuelt', fontWeight: 650, fontSize: '30px', paddingLeft: 10,paddingTop: 10}}>Upload API Spec</Text>                      
                }
            >
                <div style={{display: 'flex', flexDirection:'row', alignItems: 'center', paddingBottom: 10}}>
                    <Text style={{ fontFamily: 'Visuelt', fontSize: '15px', paddingLeft: 10, color: '#3E3E3E'}}>Supported Open API Versions:</Text> 
                    <Badge color="gray" style={{marginLeft: 10}}>v2.X</Badge>
                    <Badge color="gray" style={{marginLeft: 10}}>v3.X</Badge>
                </div>
                <ImportApiDropzone organizationId={organization} userId={user?.sub}/>
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
                                <Text style={{paddingTop: 10,fontFamily:'Visuelt', fontWeight: 100, fontSize: '20px', color:'#000000'}}>Upload API Spec</Text>
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