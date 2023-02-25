import axios from 'axios'
import { useRouter } from 'next/router'
import {useState, useEffect,useContext, useCallback} from 'react'
import { Breadcrumbs, Anchor, Loader, Text, Tabs, Center} from '@mantine/core';
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
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="team">Team Members</Tabs.Tab>
                    <Tabs.Tab style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500}} value="settings">Settings</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="team">
                    <TeamTable data={testData} />
                </Tabs.Panel>
            </Tabs>

        </div>
    )
}
export default MyOrganization