import React, {useState, useEffect, useCallback} from "react"
import {Text, Button, Card, Image, Center, Loader, useMantineTheme, TextInput, Select} from '@mantine/core'
import { useUser } from '@auth0/nextjs-auth0/client';
import {useContext} from 'react'
import AppContext from '../context/AppContext';
import axios from 'axios';
import { useRouter } from 'next/router'
import { CiSearch } from "react-icons/ci";
import schemaIcon from '../../public/icons/schemaIcon.svg';


const Models = () => {

    const { user, error, isLoading } = useUser();
    const [dbUser, setDbUser] = useState(null)
    const [organization, setOrganization] = useState(null)
    const [organizationMetadata, setOrganizationMetadata] = useState(null)
    const [selectedApi, setSelectedApi] = useState(null)
    const [schemas, setSchemas] = useState(null)
    const [apis, setApis] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const router = useRouter()

    const filteredAndSortedSchemas = schemas && schemas
        .filter(schema => schema.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));


   const fetchApis = useCallback(() => {

        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/'+ organization)
            .then((res) => {
                setOrganizationMetadata(res.data)
            })
            .catch((err) => {
                console.log(err)
            })

        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces?organization=' + organization)
            .then((res) => {
                setApis(
                    res.data.filter((api) => {
                        return api.owning_organization === organization
                    })
                )
                console.log(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
        
   }, [organization])

   const fetchModels = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/'+ selectedApi.uuid +'/objects')
            .then((res) => {
                setSchemas(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [selectedApi])

    const handleCardClick = (schema) => {
        router.push('/models/'+ schema.uuid)
    };

   useEffect(() => {
        if(organization && !apis){
            fetchApis()
        }
        if(apis && apis.length > 0 && !selectedApi){
            setSelectedApi(apis[0])
        }

    }, [organization, fetchApis, apis])

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

    useEffect(() => {
        if(selectedApi && !schemas){
            fetchModels()
        }
    }, [selectedApi, schemas, fetchModels])

    return (
            <div style={{display:'flex', flexDirection:'column'}}>
                <div style={{width: '45vw',padding:30, display:'flex', flexDirection:'column'}}>
                    {
                        organizationMetadata && organizationMetadata.name ? (
                            <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{organizationMetadata.name} Models</Text>
                        ) : (
                            <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>My Models</Text>
                        )
                    }
                    <div style={{display:'flex', paddingLeft:30, flexDirection:'row', justifyContent:'space-between'}}>
                        {
                            apis && apis.length > 0 ? (
                                <Select
                                label="Select an API"
                                data={apis?.filter((api) => {
                                    return api.owning_organization === organization
                                }).map((api) => {
                                    return {label: api.name, value: api.uuid}
                                })}
                                value={selectedApi?.uuid}
                                onChange={(value) => {
                                    setSelectedApi(apis.find((api) => api.uuid === value))
                                    setSchemas(null)
                                }}
                            />
                            ) : (
                                <div />
                            )
                        }
                    
                    </div>
                    <div style={{paddingTop: 10}} />
                    <TextInput 
                        icon={<CiSearch />}
                        placeholder="Search for a schema..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // radius="xl"
                        size="sm"
                        style={{paddingLeft:30}}
                    />
                    <div style={{paddingTop: 30}} />
                    <div style={{paddingLeft: 30, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                    {
                        filteredAndSortedSchemas && filteredAndSortedSchemas.length > 0 ? (
                            filteredAndSortedSchemas.map((schema) => {
                                return (
                                    <>
                                        <Button variant='outline' color='dark' style={{ width: '500px', height: '150px', display: 'flex', flexDirection:'row'}} onClick={() => handleCardClick(schema)}>
                                            <div style={{width: '450px'}}>
                                                <div style={{height: '80%', width: '15%', display:'flex', flexDirection: 'flex-start'}}>
                                                    <Image src={schemaIcon} width={20} height={20} style={{padding: 10}}/>
                                                </div>
                                                <div style={{paddingRight: 10}} />
                                                <div style={{height: '80%', width: '75%', display:'flex', flexDirection: 'column'}}>
                                                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                                                        <Text style={{fontFamily:'Visuelt', fontWeight: 650, fontSize: '20px', width: '450px'}}>{schema.name}</Text>
                                                    </div>
                                                    {
                                                            schema.description ? (
                                                                <Text truncate style={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '15px', width: '450px'}}>{schema.description}</Text>
                                                            ) : (
                                                                null
                                                            )
                                                    }
                                                    {
                                                        Object.keys(schema.properties).length > 0 ? (
                                                            <Text>
                                                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, fontSize: '16px'}}>{Object.keys(schema.properties).length} Properties</Text>
                                                            </Text>
                                                        ) : (
                                                            null
                                                        )
                                                    }

                                                </div>
                                            </div>
                                            
                                        </Button>
                                        <div style={{paddingTop: 10}} />
                                    </>
                                    
                                   
                                );
                            })
                        ) : (
                            <div>No schemas found</div>
                        )
                    }
                    </div>
                </div>
            </div>
    )
}

export default Models