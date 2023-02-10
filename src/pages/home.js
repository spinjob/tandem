import { useState, useCallback, useEffect } from 'react';
import {UserContext} from '../context/UserContext';
import {useUser} from '@auth0/nextjs-auth0/client'
import Partnerships from '../components/Partnerships/partnerships'
import MyApis from './myApis'
import Navigation from '../components/Navbar'
import { Text, Image, Loader, Card, Button} from '@mantine/core';
import OrganizationInput from '../components/Home/organization-input'
import axios from 'axios';

const Home = () => {

    const { user, error, isLoading } = useUser();
    const [dbUser, setDbUser] = useState(null)
    const [userContext, setUserContext] = useState(UserContext)
    const [selectedView, setSelectedView] = useState('partnerships')
    const [apis, setApis] = useState(null)
    const [refreshApis, setRefreshApis] = useState(false)
    
    const setView = (e) => {
        setSelectedView(e.label)
        console.log(e.label)
    }

    useEffect(() => {
        if(user?.email){
            axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/find',{email: user.email})
            .then((res) => {
                setDbUser(res.data)
                if(res.data.auth0Id == null || res.data.auth0Id == ""){
                    if(dbUser){
                        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/' + id, {
                            email: user.email,
                            name: user.name,
                            auth0Id: user.sub
                        }).then((res) => {
                            console.log(res)
                        }
                        ).catch((err) => {
                            console.log(err)
                        }
                        )   
                    }
                }
            })
            .catch((err) => {
                console.log(err)
            })

        } else {
            console.log('no user')
        }
    }, [user, dbUser])

    useEffect(()=> {
        if(dbUser?.organization && !apis){
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces?organization=' + dbUser.organization)
            .then((res) => {
                setApis(res.data)
                setRefreshApis(false)
                console.log(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
        }
    }, [dbUser, apis])


return !dbUser ? (
            <div style={{display:'flex',flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <Loader />
            </div>
        ) : !dbUser?.organization ? (
            <div style={{display:'flex'}}>
                <Navigation setView={setView} />
                <div style={{display: 'flex', flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'left', alignItems:'left'}}>
                    <Card style={{display: 'flex', width: 500, height: '35vh', justifyContent:'center', alignItems:'center'}} shadow="sm" p="lg" radius="md" withBorder>
                        <Card.Section>
                            <Text style={{fontFamily: 'Visuelt', fontWeight: 600, fontSize: 30}}>Join a Company</Text>
                            <div style={{paddingTop: 10}}/>
                            <Text style={{fontFamily: 'Visuelt', width: 400}}>You are not associated with a company using Tandem yet.  Please provide your company access code or reach out to get one.</Text>
                            <div style={{paddingTop: 10}}/>
                            <OrganizationInput />
                            <div style={{paddingTop: 10}}/>
                            <Button type="submit" style={{backgroundColor: 'black', height: '44px',width: '400px', borderRadius: 8}}>
                                        <Text className='registrationButtonText'>Confirm Company Code</Text>
                            </Button>
                        </Card.Section>
                    </Card>
                </div>
            </div>
        ) : dbUser?.organization && selectedView == 'Partnerships' ? ( 
            <div style={{display:'flex', width: '100vw'}}>
                 <Navigation setView={setView} />
                 <Partnerships userDetails={dbUser}/>
            </div>    
        ) : dbUser?.organization && selectedView == 'My APIs' ? (
            <div style={{display:'flex'}}>
                <Navigation setView={setView} />
                <MyApis style={{backgroundColor:'red'}} apis={apis} organization={dbUser?.organization} userId={user?.sub} setRefreshApis={setRefreshApis} />
            </div>  
        ) : dbUser?.organization && selectedView == 'My Organization' ?(
            <div style={{display:'flex'}}>
                <Navigation setView={setView} />
                <Text>My Organization</Text>
            </div>  
        ) : ( 
            <div style={{display:'flex'}}>
                 <Navigation setView={setView} />
                 <Partnerships/>
            </div>    
        )
    }

export default Home