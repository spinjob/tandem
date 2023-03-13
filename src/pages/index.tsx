import type {NextPage} from 'next'
import Head from 'next/head'
import {Image, Card, Text, Button, TextInput, Center} from '@mantine/core';
import RegistrationForm from '../components/RegistrationForm'
import LoginForm from '../components/LoginForm.js'
import {Player } from '@lottiefiles/react-lottie-player';
import { useState, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import Partnerships from './partnerships'
import { useContext} from 'react'
import AppContext from '../context/AppContext'
import axios from 'axios';
import { useRouter } from 'next/router';
import OrganizationInput from '../components/Home/organization-input'
import LoadingAnimation from '../../public/animations/Loading_Animation.json'

const Index: NextPage = () => {

  const { user, error, isLoading } = useUser();
  const {organization} = useContext(AppContext).state
  const {setOrganization} = useContext(AppContext)
  const {dbUser} = useContext(AppContext).state
  const {setDbUser} = useContext(AppContext)
  const [isDbUserLoading, setIsDbUserLoading] = useState(false)
  const [hasCheckedDbUser, setHasCheckedDbUser] = useState(false)
  const [organizationCode, setOrganizationCode] = useState('')
  const [organizationCheckLoading, setOrganizationCheckLoading] = useState(false)
  const [organizationCodeError, setOrganizationCodeError] = useState(null)
  const router = useRouter()

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    if(user?.email && !dbUser && !isDbUserLoading && !hasCheckedDbUser){
        console.log('refetching user')
        setIsDbUserLoading(true)
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/find',{email: user.email})
        .then((res) => {
            setDbUser(res.data)
            delay(5000).then(() => {
              setIsDbUserLoading(false)
              setHasCheckedDbUser(true)
            })
            
            if(res.data.organization && !organization ){
              console.log("Organization Found for User")
              setOrganization(res.data.organization)
            } else if (!res.data.organization && organization){
              console.log("Organization Found for User")
              axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/' + res.data._id, {organization: organization.uuid}).then((res) => {
                console.log("User Updated")
              }).catch((err) => {
                console.log(err)
              })

            }
        })
        .catch((err) => {
            console.log(err)
            setIsDbUserLoading(false)
            setHasCheckedDbUser(true)
        })
    } 

    if (!user && !isLoading) {
      router.push('/api/auth/login')
    }

    if(user && dbUser && organization){
      router.push('/partnerships')
    }

    if(dbUser && isDbUserLoading){
      setIsDbUserLoading(false)
    }

    if(user && dbUser && organization && dbUser?.organization == ""){
      console.log("DB User without Organization")
      axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/' + dbUser._id, {organization: organization.uuid}).then((res) => {
        console.log("User Updated")
        setDbUser(
          {...dbUser, organization: organization.uuid}
        )
      }).catch((err) => {
        console.log(err)
      })
    }

}, [user, dbUser, organization, setDbUser, isLoading, isDbUserLoading])

const confirmOrganization = () => {
    setOrganizationCheckLoading(true)
    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/' + organizationCode)
    .then((res) => {
        setOrganization(res.data.uuid)
        setOrganizationCheckLoading(false)
        if(dbUser?._id){
          axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/' + dbUser._id, {organization: res.data.uuid}).then((res) => {
            setOrganizationCheckLoading(false)
          }).catch((err) => {
            console.log(err)
            setOrganizationCheckLoading(false)
          })
        }
        
    
    })
    .catch((err) => {
      console.log(err)
      setOrganizationCheckLoading(false)
    })
}

return !user && !dbUser ? (
    <Center sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
      }}>
        <Player
          src={LoadingAnimation}
          style={{width: 200, height: 200}}
          loop
          autoplay
          />
  </Center>  
) : user && dbUser && !organization && !isDbUserLoading ? (
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
                          setOrganizationCode(e.target.value)
                      }}  
                  />
                  <div style={{paddingTop: 10}}/>
                  <Button loading={organizationCheckLoading} type="submit" style={{backgroundColor: 'black', height: '44px',width: '400px', borderRadius: 8}} 
                      onClick={() => {
                          confirmOrganization()
                      }}
                  >
                      <Text className='registrationButtonText'>Confirm Company Code</Text>
                  </Button>
              </Card.Section>
          </Card>
      </div>
  </div>
) : (
    <Center sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
        }}>
        <Player
        src={LoadingAnimation}
        style={{width: 200, height: 200}}
        loop
        autoplay
        />
    </Center>  
)
}

export default Index