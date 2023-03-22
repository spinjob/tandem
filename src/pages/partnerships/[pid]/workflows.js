import PartnershipWorkflowsTable from '../../../components/Partnerships/partnership-workflows-table'
import {Button, Center, Loader} from '@mantine/core'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {useUser} from '@auth0/nextjs-auth0/client'

const PartnershipWorkflows = ({apis, pid }) => {
    const [workflows, setWorkflows] = useState(null)
    const { user, error, isLoading } = useUser();
    const apiIDArray = apis?.map((api) => {
      return api.uuid
    })


    const renderActiveSwitch = (status) => {
      switch (status) {
        case 'active':
          return "true"
        case 'unpublished':
          return "false"
        case 'draft':
          return "false"
        default: "false"
      }
    }

    const workflowRows = workflows?.map((workflow) => {
      return {
        id: workflow.uuid,
        name: workflow.name,
        status: workflow.status,
        active: renderActiveSwitch(workflow.status),
        updated: workflow.updated_at
      }
    })


    useEffect(() => {
      if (!workflows) {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/workflows/details',{parent_project_uuid: pid})
          .then(res => {
            setWorkflows(res.data)
          })
          .catch(err => {
            console.log(err)
          }
        )
      }
    }, [workflows, pid])


    return workflows?.length > 0 && pid ? (
        <div>
            <PartnershipWorkflowsTable apis={apiIDArray} userId={user?.sub} partnershipId={pid} data={workflowRows}/>
        </div>
    )
    : workflows?.length == 0 && pid ? (
      <div>
        <PartnershipWorkflowsTable apis={apiIDArray} userId={user?.sub} partnershipId={pid} data={workflowRows}/>
      </div>
    ) : (
        <Center>
            <Loader/>
        </Center>
    )
}

export default PartnershipWorkflows