import type {NextPage} from 'next'
import Head from 'next/head'
import {Image} from '@mantine/core';
import RegistrationForm from '../components/RegistrationForm'
import LoginForm from '../components/LoginForm.js'
import { useState, useEffect } from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
import Partnerships from './partnerships'
import { useContext} from 'react'
import AppContext from '../context/AppContext'
import axios from 'axios';

const Index: NextPage = () => {

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { user, error, isLoading } = useUser();
  const {organization, setOrganization} = useContext(AppContext)
  const {dbUser, setDbUser} = useContext(AppContext)

  const toggleLogin = () => {
      setIsLoggingIn(!isLoggingIn)
  }

  useEffect(() => {
    if(user?.email){
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
        console.log('no user')
    }
}, [user, dbUser, setOrganization, setDbUser])

return !user && isLoggingIn ? (
  <div style={{display:'flex', flexDirection:'row'}}>
      <Head>
        <title>Login Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{width: '60vw', alignContent:'center'}}>
          <Image alt='landing-page' src= 'https://i.ibb.co/5rzpBx3/landing-Page.png' style={{width: '100%', height:'100vh'}}/>
      </div>
      <div style={{width: '40vw', justifyItems:'center'}}>
          <LoginForm toggleLogin={toggleLogin} />
      </div>
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
) : user && !isLoggingIn ? (
  <div style={{display: 'flex', height: '100vh', width: '80vw'}}>
      <Head>
        <title>Tandem</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Partnerships />
  </div>
) : (
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
)
}

export default Index