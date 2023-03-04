import { useState, useCallback, useEffect } from 'react';
import {Modal, Button,Text, Loader, ScrollArea, Grid, Container, Image, Badge} from '@mantine/core'
import {GrAddCircle} from 'react-icons/gr'
import {VscTypeHierarchy} from 'react-icons/vsc'
import apiIcon from '../../../../public/icons/Programing, Data.2.svg'
import ImportApiDropzone from '../../../components/import-api.tsx'
import { useUser } from '@auth0/nextjs-auth0/client';
import {useContext} from 'react'
import AppContext from '@/context/AppContext';
import axios from 'axios';
import { useRouter } from 'next/router';

const PartnershipApis = ({pid, partnershipApis}) => {

   const [modalOpened, setModalOpened] = useState(false)
   const [apis, setApis] = useState(partnershipApis)
   const { user, error, isLoading } = useUser();
   const {organization} = useContext(AppContext).state
   const {dbUser, setDbUser} = useContext(AppContext).state
   const router = useRouter();

   const renderApis = () => {
        return partnershipApis.map((api) => {
            return (
                <Grid.Col key={"gridColumn"+api.uuid} xs={4}>
                        <Button key={'button_'+api.uuid} onClick={() => {
                            router.push('/apis/' + api.uuid)
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
                                    <div style={{width: 180}}/>
                                    <Image src={apiIcon} alt="api icon" width={30} height={26} style={{opacity:.2}}/>
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


    return partnershipApis ? (
        <div>
            <div style={{height: '100vh',width: '75%',paddingTop: 30, display:'flex', flexDirection:'column'}}>
                    <Container style={{width: '100vw'}}>
                        <Grid grow={false}>  
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

export default PartnershipApis