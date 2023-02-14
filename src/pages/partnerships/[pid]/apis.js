import { useState, useCallback, useEffect } from 'react';
import {Modal, Button,Text, Loader, ScrollArea, Grid, Container, Badge} from '@mantine/core'
import {GrAddCircle} from 'react-icons/gr'
import {VscTypeHierarchy} from 'react-icons/vsc'
import ImportApiDropzone from '../../../components/import-api.tsx'
import { useUser } from '@auth0/nextjs-auth0/client';
import {useContext} from 'react'
import AppContext from '@/context/AppContext';
import axios from 'axios';

const PartnershipApis = ({pid, partnershipApis}) => {

   const [modalOpened, setModalOpened] = useState(false)
   const [apis, setApis] = useState(partnershipApis)
   const { user, error, isLoading } = useUser();
   const {organization} = useContext(AppContext).state
   const {dbUser, setDbUser} = useContext(AppContext).state

   const renderApis = () => {
        return partnershipApis.map((api) => {
            return (
                <Grid.Col key={"gridColumn"+api.uuid} xs={4}>
                        <Button key={'button_'+api.uuid} sx={{
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
                                    <Text style={{fontFamily:'Visuelt', fontWeight:100,fontSize: '15px', color:'#939393'}}>{api.version}</Text>
                                </div>
                            </Container>
                        </Button>
                </Grid.Col>           
            )
        })
    }


    return partnershipApis ? (
        <div>
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
            <ScrollArea>
                <div style={{display: 'flex', flexDirection:'column', height: '100vh', paddingTop: 30}}>
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
            </ScrollArea>
        </div>
        ) : (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        )
}

export default PartnershipApis