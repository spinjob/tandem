import PartnershipWorkflowsTable from '../../../components/Partnerships/partnership-workflows-table'
import {Button, Center, Loader} from '@mantine/core'
import { useEffect, useState } from 'react'
import axios from 'axios'

const PartnershipWorkflows = ({ pid }) => {
    const [workflows, setWorkflows] = useState(null)
  

    const renderStatus = (status) => {
      switch (status) {
        case 'active':
          return "Active"
        case 'inactive':
          return "Unpublished"
        case 'needs_mapping':
          return "Draft"
        default: "Unknown"
      }
    }

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
        status: renderStatus(workflow.status),
        active: renderActiveSwitch(workflow.status),
        updated: workflow.updated_at
      }
    })


    useEffect(() => {
      if (!workflows) {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/workflows/details',{parent_project_uuid: pid})
          .then(res => {
            console.log(res.data)
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
            <PartnershipWorkflowsTable data={workflowRows}/>
        </div>
    )
    : (
        <Center>
            <Loader/>
        </Center>
    )
}

export default PartnershipWorkflows