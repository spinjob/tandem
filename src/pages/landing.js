import { Text, Image, Loader } from '@mantine/core';
import {UserContext} from '../context/UserContext'
import RegistrationForm from '../components/RegistrationForm'
import LoginForm from '../components/LoginForm.js'
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const Landing = () => {
    const [userContext, setUserContext] = useState(UserContext)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    
    const toggleLogin = () => {
        setIsLoggingIn(!isLoggingIn)
    }

return isLoggingIn ? (
    <div style={{display:'flex', flexDirection:'row'}}>
        <div style={{width: '60vw', alignContent:'center'}}>
            <Image alt='landing-page' src= 'https://i.ibb.co/5rzpBx3/landing-Page.png' style={{width: '100%', height:'100vh'}}/>
        </div>
        <div style={{width: '40vw', justifyItems:'center'}}>
            <LoginForm toggleLogin={toggleLogin} />
        </div>
    </div>
) : !isLoggingIn ?  (
    <div style={{display:'flex', flexDirection:'row'}}>
        <div style={{width: '60vw', alignContent:'center'}}>
            <Image alt='landing-page' src= 'https://i.ibb.co/5rzpBx3/landing-Page.png' style={{width: '100%', height:'100vh'}}/>
        </div>
        <div style={{width: '40vw', justifyItems:'center'}}>
            <RegistrationForm toggleLogin={toggleLogin} />
        </div>
    </div>
) : (
  <div style={{display:'flex', flexDirection:'row'}}>
        <div style={{width: '60vw', alignContent:'center'}}>
            <Image alt='landing-page' src= 'https://i.ibb.co/5rzpBx3/landing-Page.png' style={{width: '100%', height:'100vh'}}/>
        </div>
        <div style={{width: '40vw', justifyItems:'center'}}>
            <RegistrationForm toggleLogin={toggleLogin} />
        </div>
    </div>
)
}
export default Landing