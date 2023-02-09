import { useState } from 'react';
import {useFormik} from 'formik'
import Link from 'next/link'
import {Text, Button, PasswordInput, Anchor} from '@mantine/core'
import * as yup from 'yup'
import axios from 'axios'

function RegistrationForm({toggleLogin}: {toggleLogin: any}) {
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)
   
    const fetchOrganizationDetails = (data: any) => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/' + data.organizationCode).then(response=>{
            console.log(response)
            registrationHandler(data)
            return response
        }).catch(error=>{
            console.log(error)
            return false;
        })
    }

    const registrationHandler = (data: any) => {
        const firstName = data.name.split(' ')[0]
        const lastName = data.name.split(' ')[1]

        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/signup',
            {
                username: data.email,
                email: data.email,
                password: data.password,
                firstName: firstName,
                lastName: lastName,
                organization: data.organizationCode
            }).then(response =>{
                console.log(response)
                setMessage('Registration Successful')
            }).catch(error => {
                console.log(error)
                setMessage('Registration Failed. Please confirm your organization code.')
            })

    }

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            organizationCode: ''
        },
        onSubmit: values => {
            fetchOrganizationDetails(values)
            setMessage('Form submitting')
            setSubmitted(true)
        },
        validationSchema: yup.object({
            name: yup.string().required('Your name is required.'),
            email: yup.string().email('Invalid email address').required('An email is required.'),
            password: yup.string().required('A password is required.'),
            organizationCode: yup.string().required('An organization code is required.')
        }),
    });

    return (
        <div>
            <div style={{display:'flex', flexDirection:'column', width:'100%',height:'100vh', justifyContent:'center', alignItems:'center'}}>
                <div hidden={!submitted} className="alert alert-primary" role="alert">
                    {message}
                </div>
                <div style={{width: '100%',alignItems:'left'}}>
                    <Text className='header' style={{paddingBottom: 30}}>Sign Up</Text>
                    <form onSubmit={formik.handleSubmit}>
                    <div style={{display:'block'}}>
                        <Text className='formFieldLabel'>Your Name</Text>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Enter Name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            style={{borderColor: '#cbd5e0'}}
                        />
                        {formik.errors.name && <Text className='validationErrorLabel' >{formik.errors.name}</Text>}
                    <div style={{height: 15}}/>
                   <div style={{display:'block'}}>
                    <Text className='formFieldLabel'>Company Code</Text>
                        <input
                            type="text"
                            name="organizationCode"
                            className="form-control"
                            placeholder="Acme Unlimited Co."
                            value={formik.values.organizationCode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            style={{borderColor: '#cbd5e0'}}
                        />
                        {formik.errors.organizationCode && <Text className='validationErrorLabel' >{formik.errors.organizationCode}</Text>}
                    </div>
                    </div>
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
                            <Text className='registrationButtonText'>Sign Up</Text>
                        </Button>
                    </div>
                    <div style={{height: 15}}/>
                    <div style={{display:'flex', width: '400px', justifyContent:'center', alignItems:'center'}}>
                        <Text>Already have an account? </Text><div style={{width: '5px'}}/><Link href="/api/auth/login">Log In</Link>
                    </div>
                   
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegistrationForm;