import {useFormik} from 'formik'
import {Text, Button, PasswordInput, PasswordInputProps} from '@mantine/core'
import * as yup from 'yup'
import axios from 'axios'
import { UserContext } from "../context/UserContext"
import React, { useContext, useState } from "react"

function LoginForm({toggleLogin}) {
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [userContext, setUserContext] = useContext(UserContext)

    const loginHandler = (data) => {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/login',
            {
                username: data.email,
                password: data.password
            }).then(async response =>{
                if(response.ok){                 
                    setMessage('Success!')
                    const data = await response.data
                    console.log(data)
                    setUserContext(oldValues => {
                        return { ...oldValues, token: data.token }
                    })
                }
            }).catch(error => {
                console.log(error)
                setMessage('Login Failed. Please confirm your credentials.')
            })
        }

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: values => {
            setMessage('Form submitted')
            setSubmitted(true)
            loginHandler(values)
        },
        validationSchema: yup.object({
            email: yup.string().email('Invalid email address').required('An email is required.'),
            password: yup.string().required('A password is required.'),
        }),
    });

    return (
        <div>
            <div style={{display:'flex', flexDirection:'column', width:'100%',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <div hidden={!submitted} className="alert alert-primary" role="alert">
                    {message}
                </div>
                <div style={{width: '100%',alignItems:'left'}}>
                    <Text className='header' style={{paddingBottom: 30}}>Log In</Text>
                    <form onSubmit={formik.handleSubmit}>
                        <div style={{height: 15}}/>
                        <div style={{display:'block'}}>
                            <Text className='formFieldLabel'>Email Address</Text>
                            <input
                                type="text"
                                name="email"
                                className="form-control"
                                placeholder="mail@example.com"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                style={{borderColor: '#cbd5e0'}}
                            />
                            {formik.errors.email && <Text className='validationErrorLabel' >{formik.errors.email}</Text>}

                        </div>
                        <div style={{height: 15}}/>
                        <div style={{display:'block'}}>
                            <Text className='formFieldLabel'>Password</Text>
                            <PasswordInput style={{borderColor: '#cbd5e0',width:'400px', height: '44px'}} name="password" onChange={formik.handleChange} onBlur={formik.handleBlur} radius="md" placeholder={"Enter Password"} value={formik.values.password} size={'lg'} id="your-password" />
                            {formik.errors.password && <Text className='validationErrorLabel' >{formik.errors.password}</Text>}
                        </div>
                        <div style={{paddingTop: 20}}>
                            <Button type="submit" style={{backgroundColor: 'black', height: '44px',width: '400px', borderRadius: 8}}>
                                <Text className='registrationButtonText'>Log In</Text>
                            </Button>
                        </div>
                        <div style={{paddingTop: 20}}>
                        <div style={{display:'flex', width: '400px', justifyContent:'center', alignItems:'center'}}>
                             <Text>Need to create an account?</Text><div style={{width: '5px'}}/> <Button onClick={toggleLogin} variant="subtle">Sign Up</Button>
                        </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginForm;