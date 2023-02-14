import PartnershipWorkflowsTable from '../../../components/Partnerships/partnership-workflows-table'
import {Button, Center, Loader} from '@mantine/core'
import { useEffect, useState } from 'react'
import axios from 'axios'

const PartnershipWorkflows = ({ pid }) => {
    const [workflows, setWorkflows] = useState(null)
    
    const data = [
      {
        "id": "1",
        "name": "Athena Weissnat",
        "avatar": "https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        "workflows":"10",
        "updated": "2023-01-02 22:14:53"
      },
      {
      "id": "2",
        "name": "Deangelo Runolfsson",
        "avatar": "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        "workflows": "2",
        "updated": "2023-01-02 22:14:53"
      },
      {
        "id": "3",
        "name": "Danny Carter",
        "avatar": "https://images.unsplash.com/photo-1632922267756-9b71242b1592?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        "workflows": "3",
        "updated": "2023-01-02 22:14:53"
      },
      {
        "id": "4",
        "name": "Trace Tremblay PhD",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        "workflows": "1",
        "updated": "2023-01-02 22:14:53"
      },
      {
        "id": "5",
        "name": "Derek Dibbert",
        "avatar": "https://images.unsplash.com/photo-1630841539293-bd20634c5d72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
        "workflows": "5",
        "updated": "2023-01-02 22:14:53"
      }
    ]

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

    console.log(workflowRows)

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
            <div style={{paddingBottom: 20,paddingLeft: 10, paddingTop: 30}}>
                <Button style={{borderRadius: 30, height: 18, backgroundColor: 'black', color: 'white'}}> All </Button>
                <Button style={{borderRadius: 30, height: 18, backgroundColor: '#b4f481', color: 'black', fontWeight: 4}}>Active</Button>
                <Button style={{borderRadius: 30, height: 18, backgroundColor: '#FFBD9A', color: 'black', fontWeight: 4}}> Unpublished </Button>
                <Button style={{borderRadius: 30, height: 18, backgroundColor: '#e7e7e7', color: 'black', fontWeight: 4}}> Draft </Button>
            </div>
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