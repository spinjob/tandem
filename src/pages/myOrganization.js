import axios from 'axios'
import { useRouter } from 'next/router'
import {useState, useEffect,useContext, useCallback} from 'react'
import { Breadcrumbs, Anchor, Loader, Text, Tabs, TextInput, Center} from '@mantine/core';
import {useUser} from '@auth0/nextjs-auth0/client'
import AppContext from '../context/AppContext'
import TeamTable from '../components/Organization/team-table'

const MyOrganization = () => {

    const [organizationUsers, setOrganizationUsers] = useState(null)
    const { user, error, isLoading } = useUser();
    const [organizationObject, setOrganizationObject] = useState(null)
    const {dbUser} = useContext(AppContext).state
    const {organization} = useContext(AppContext).state


    const testData = [{
        id: 1,
        key: 'test',
        value: 'test_value',
        type: 'String'
    }]

    const userData = organizationUsers?.map((user) => {
        return {
            id: user._id,
            key: user._id,
            name: user.name ? user.name : user.email,
            email: user.email,
            role: 'Admin'
        }
    })

    const fetchOrganizationUsers = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/users?organization=' + organization).then((res) => {
            setOrganizationUsers(res.data)
            console.log(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [organization])

    const fetchOrganization = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/organizations/' + organization).then((res) => {
            setOrganizationObject(res.data)
            console.log(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [organization])
    

    useEffect(() => {
        if(organization && !organizationObject){
            fetchOrganization()
        }
    }, [organization, organizationObject])

    useEffect(() => {
        if(organization && !organizationUsers){
            fetchOrganizationUsers()
        }
    }, [organization, organizationUsers])


    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 30,
            width: '100%'
          }}>
            <div>
                <Text style={{paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{organizationObject?.name ? organizationObject?.name : "My Organization"}</Text>
            </div>
            <Tabs color="gray" defaultValue="team">
                <Tabs.List>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, width: 130}} value="team">Team Members</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, width: 120}} value="settings">Settings</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="team">
                    <div style={{height:20}}/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 10,
                    }}>
                        <TextInput
                            placeholder="e.g. sofia@example.com"
                            label="Add People"
                            style={{width: 300}}
                        >
                            
                        </TextInput>
                        {
                            organizationUsers ? (
                                <TeamTable data={userData} />
                            ) : (null)
                        }
                    </div>
                   
                </Tabs.Panel>
            </Tabs>

        </div>
    )
}
export default MyOrganization