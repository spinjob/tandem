import { Text, TextInput, Button, ActionIcon, Divider } from "@mantine/core"
import { useState } from "react"
import axios from 'axios'

const ApiMetadata = ({ metadata }) => {
    console.log(metadata)
    const [editingProduction, setEditingProduction] = useState(false)
    const [editingSandbox, setEditingSandbox] = useState(false)
    const [production, setProduction] = useState(metadata.production_base_url)
    const [sandbox, setSandbox] = useState(metadata.sandbox_base_url)
    
    const environments = [
        {
            name: 'Production',
            baseUrl: metadata.production_base_url
        }, 
        {
            name: 'Sandbox',
            baseUrl: metadata.sandbox_base_url
        }]
    
    const updateServers = (environment) => {

        var data = environment == 'Production' ? {
            production_base_url: production
        } : {
            sandbox_base_url: sandbox
        }

        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + metadata.uuid + "/servers", data).then((res) => {
            console.log(res.data)
        }).catch((err) => {
            console.log(err)
        })
    }

    return (
        <div style={{padding: 20}}>
            <Text style={{fontFamily:'Visuelt', fontSize:'30px', fontWeight: 500}}>Settings</Text>
            <div style={{height:'20px'}}/>
           {
            environments.map((environment) => {
                    return(
                        <div key={environment.name} style={{width: '100%',paddingBottom: 30}}>
                            <Text style={{fontFamily:'Visuelt', fontSize:'20px'}}>{environment.name}</Text>
                            <Divider style={{width: '35%'}} size={'xs'} color={'#E7E7E7'}/>
                            <div style={{height:'10px'}}/>
                            <div style={{display:'flex',flexDirection:'row', alignItems:'end'}}>
                                <div style={{display:'block', width: '28%'}}>
                                    <Text style={{fontFamily:'Visuelt', fontSize:'15px'}}>Base URL</Text>
                                    {
                                        environment.name == 'Production' && !editingProduction ? (
                                            <TextInput disabled value={environment.baseUrl == '' || environment.baseUrl == null ? 'https://api.example.com' : environment.baseUrl}
                                            sx={{
                                                width: '100%',
                                                '& input': {
                                                    '&: focus': {
                                                            border: '1px solid black'
                                                    }
                                                }
                                            }}
                                            />
                                        ) : environment.name == 'Sandbox' && !editingSandbox ? (
                                            <TextInput disabled value={environment.baseUrl == '' || environment.baseUrl == null ? 'https://api.example.com' : environment.baseUrl}
                                            sx={{
                                                width: '100%',
                                                '& input': {
                                                    '&: focus': {
                                                            border: '1px solid black'
                                                    }
                                                }
                                            }}
                                            />
                                        ) : (
                                            <TextInput value={environment.baseUrl}
                                            onChange={(e) => {
                                                if(environment.name === 'Production') {
                                                    setProduction(e.target.value)
                                                }
                                                if(environment.name === 'Sandbox') {
                                                    setSandbox(e.target.value)
                                                }
                                            }}
                                            sx={{
                                                width: '100%',
                                                '& input': {
                                                    '&: focus': {
                                                            border: '1px solid black'
                                                    }
                                                }
                                            }}
                                            />
                                        )
                                    }
                                    
                                </div>
                                <div style={{width: 10}}/>
                                <Button onClick={() => {
                                    
                                    if(environment.name === 'Production') {
                                        if(editingProduction) {
                                            updateServers()
                                        }
                                        setEditingProduction(!editingProduction)
                                    }
                                    if(environment.name === 'Sandbox') {
                                        if(editingProduction) {
                                            updateServers()
                                        }
                                        setEditingSandbox(!editingSandbox)
                                    }
                                }} radius={'sm'} style={{backgroundColor: 'white', color:"black", border:'1px solid black'}}>
                                    { environment.name == 'Production' && !editingProduction ? 'Edit' : environment.name == 'Sandbox' && !editingSandbox ? 'Edit' : 'Save'}
                                </Button>
                                <div style={{width: 10}}/>
                                {
                                    environment.name == 'Production' && editingProduction ? (
                                        <Button onClick={()=>{
                                            setEditingProduction(false)
                                        }} radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", border:'1px solid #FF7E35'}}>
                                            Cancel
                                        </Button>
                                    ) : environment.name == 'Sandbox' && editingSandbox ? (
                                        <Button onClick={()=>{
                                            setEditingSandbox(false)
                                        }} radius={'sm'} style={{backgroundColor: 'white', color:"#FF7E35", border:'1px solid #FF7E35'}}>
                                            Cancel
                                        </Button>
                                    ) : (
                                        null
                                    )
                                }
                               
                            </div>
                        </div>
                    )
                })}
        </div>
    )
}

export default ApiMetadata