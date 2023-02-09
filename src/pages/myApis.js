import { useState, useCallback, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import {Card, Button,Text, Loader, createStyles, Image, Grid, Skeleton, Container} from '@mantine/core'
import {useHover} from '@mantine/hooks'
import axios from 'axios';
import { relative } from 'path';
import {GrAddCircle} from 'react-icons/gr'
import {VscTypeHierarchy} from 'react-icons/vsc'

const MyApis = ({apis}) => {
   const renderApis = () => {
        return apis.map((api) => {
            return (
                <Grid.Col key={api.id} xs={4}>
                        <Button sx={{
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


    return apis ? (
            <div style={{display: 'flex', flexDirection:'column', height: '100vh',padding:30}}>
                <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>Imported APIs</Text>
                <Container style={{width: '100vw', height: '100vh'}}>
                    <Grid grow={false}>
                    <Grid.Col xs={4}>
                        <Button 
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

        ) : (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        )
}

export default MyApis