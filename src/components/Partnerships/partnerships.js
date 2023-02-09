import { useState, useCallback, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import {Card, Button,Text, Loader, createStyles, Image} from '@mantine/core'
import OrganizationInput from '../Home/organization-input'
import PartnershipsTable from './partnership-table'
import axios from 'axios';
import { relative } from 'path';

const Partnerships = ({userDetails}) => {

    const { user, error, isLoading } = useUser();
    const [dbUser, setDbUser] = useState(userDetails)
    const [partnerships, setPartnerships] = useState(null)
    
    const data = [
        {
          "id": "1",
          "name": "Athena Weissnat",
          "avatar": "https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
          "workflows":"10",
          "updated": "2023-01-02 22:14:53"
        },
        {
        "id": "2",
          "name": "Deangelo Runolfsson",
          "avatar": "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
          "workflows": "2",
          "updated": "2023-01-02 22:14:53"
        },
        {
          "id": "3",
          "name": "Danny Carter",
          "avatar": "https://images.unsplash.com/photo-1632922267756-9b71242b1592?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
          "workflows": "3",
          "updated": "2023-01-02 22:14:53"
        },
        {
          "id": "4",
          "name": "Trace Tremblay PhD",
          "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
          "workflows": "1",
          "updated": "2023-01-02 22:14:53"
        },
        {
          "id": "5",
          "name": "Derek Dibbert",
          "avatar": "https://images.unsplash.com/photo-1630841539293-bd20634c5d72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
          "workflows": "5",
          "updated": "2023-01-02 22:14:53"
        }
      ]
    useEffect(() => {
        if(user?.email){
            console.log('refetching user')
            axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/find',{email: user.email})
            .then((res) => {
                setDbUser(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
        } else {
            console.log('no user')
        }
    }, [user])

    return user && dbUser?.organization ? ( 
            <div style={{display: 'flex', flexDirection:'column', padding:30}}>
                <Text style={{paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>Welcome, {user?.given_name}</Text>
                <Text style={{paddingBottom: 30}} >Organization: {dbUser?.organization}</Text>
                <div style={{display:'flex'}}>
                    <Card style={{height: 180, width: 280, paddingTop: 38, paddingLeft: 50, backgroundColor: '#ffecea'}}radius={'xl'}>
                        <Card.Section>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '18px'}}>Uncleared Errors</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 30}}/>
                    <Card style={{height: 180, width: 280, paddingTop: 38, paddingLeft: 50, backgroundColor: '#d9fac0'}}radius={'xl'}>
                        <Card.Section>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px'}}>Active Workflows</Text>
                        </Card.Section>
                    </Card>
                    <div style={{width: 30}}/>
                    <Card style={{height: 180, width: 280, paddingTop: 38, paddingLeft: 50, backgroundColor: '#eaeaff'}}radius={'xl'}>
                        <Card.Section>
                            <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px'}}>Hours Saved</Text>
                        </Card.Section>
                    </Card>
                </div>
                <div style={{display:'flex', justifyContent: 'right', padding: 30}}>
                        <Button type="submit" style={{backgroundColor: 'black', height: '35px',width: '175px', borderRadius: 8}}>
                            <Text className='registrationButtonText'>New Partnership</Text>
                        </Button>
                </div>
                <div>
                    <Text style={{paddingBottom: 30, paddingLeft: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px'}}>Partnerships</Text>

                    <div style={{paddingBottom: 20,paddingLeft: 10}}>
                        <Button style={{borderRadius: 30, height: 18, backgroundColor: 'black', color: 'white'}}> All </Button>
                        <Button style={{borderRadius: 30, height: 18, backgroundColor: '#b4f481', color: 'black', fontWeight: 4, borderColor: 'black'}}>Active</Button>
                        <Button style={{borderRadius: 30, height: 18, backgroundColor: '#e7e7e7', color: 'black', fontWeight: 4, borderColor: 'black'}}> Draft </Button>
                    </div>
                
                    <PartnershipsTable data={data} />
                
                </div>
            </div>  
        ) : (
            <div>
                <Loader/>
            </div>
        )
}

export default Partnerships