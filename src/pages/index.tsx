import type {NextPage} from 'next'
import Head from 'next/head'
import {Image, Card, Text, Button, TextInput, Loader, Center} from '@mantine/core';
import RegistrationForm from '../components/RegistrationForm'
import LoginForm from '../components/LoginForm.js'
import { useState, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import Partnerships from './partnerships'
import { useContext} from 'react'
import AppContext from '../context/AppContext'
import axios from 'axios';
import OrganizationInput from '../components/Home/organization-input'

const Index: NextPage = () => {

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { user, error, isLoading } = useUser();
  const {organization} = useContext(AppContext).state
  const {setOrganization} = useContext(AppContext)
  const {dbUser} = useContext(AppContext).state
  const {setDbUser} = useContext(AppContext)

  const toggleLogin = () => {
      setIsLoggingIn(!isLoggingIn)
  }

  useEffect(() => {
    if(user?.email && !dbUser){
        console.log('refetching user')
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
    } else {

    }
}, [user, dbUser, setOrganization, setDbUser])

return !user && isLoggingIn ? (
  <div style={{display:'flex', flexDirection:'row'}}>
    <Center style={{width: '100vw', height: '100vh'}}>
      <Loader size="lg" />
    </Center>
  </div>
) : !user && !isLoggingIn ?  (
  <div style={{display:'flex', flexDirection:'row'}}>
      <Head>
        <title>Login Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{width: '60vw', alignContent:'center'}}>
          <Image alt='landing-page' src= 'https://i.ibb.co/5rzpBx3/landing-Page.png' style={{width: '100%', height:'100vh'}}/>
      </div>
      <div style={{width: '40vw', justifyItems:'center'}}>
          <RegistrationForm toggleLogin={toggleLogin} />
      </div>
  </div>
) : user && !isLoggingIn && organization ? (
  <div style={{display: 'flex', height: '100vh', width: '80vw'}}>
      <Head>
        <title>Tandem</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Partnerships />
  </div>
) :  user && !isLoggingIn && !organization ? (
  <div style={{display: 'flex', height: '100vh', width: '80vw'}}>
      <Head>
        <title>Tandem</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{display: 'flex', flexDirection:'column',width: '100vw',height:'100vh', justifyContent:'center', alignItems:'center'}}>
          <Card style={{display: 'flex', width: 500, height: '35vh', justifyContent:'center', alignItems:'center'}} shadow="sm" p="lg" radius="md" withBorder>
              <Card.Section>
                  <Text style={{fontFamily: 'Visuelt', fontWeight: 600, fontSize: 30}}>Join an Organization</Text>
                  <div style={{paddingTop: 10}}/>
                  <Text style={{fontFamily: 'Visuelt', width: 400}}>You are not associated with an organization using Tandem yet.  Please provide a company code or reach out to get one.</Text>
                  <div style={{paddingTop: 10}}/>
                  <TextInput  
                      placeholder="Company Code" 
                      sx={{
                        width: '400px', 
                        height: '44px', 
                        borderRadius: 8}}
                      onChange={(e) => {
                          
                      }}  
                  />
                  <div style={{paddingTop: 10}}/>
                  <Button type="submit" style={{backgroundColor: 'black', height: '44px',width: '400px', borderRadius: 8}}>
                      <Text className='registrationButtonText'>Confirm Company Code</Text>
                  </Button>
              </Card.Section>
          </Card>
      </div>
  </div>
) : (
  <div style={{display:'flex', flexDirection:'row'}}>
    <Center style={{width: '100vw', height: '100vh'}}>
      <Loader size="lg" />
    </Center>
  </div>
)
}

export default Index