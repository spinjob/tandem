

import { useRouter } from 'next/router';
import React, { useCallback, useState, useContext, useEffect, useRef} from 'react';
import useStore from '../../context/store'
import axios from 'axios'
import WorkflowLogsTable from './workflowLogTable.tsx'
import {
    Button,
    Text,
    Image,
    Divider,
    Center
  } from '@mantine/core';

const WorkflowMonitor = ({workflow}) => {
    const nodeActions = useStore(state => state.nodeActions)
    const mappings = useStore(state => state.mappings)
    const nodes = useStore(state => state.nodes)
    const edges = useStore(state => state.edges)
    const router = useRouter()
    const [workflowLogs, setWorkflowLogs] = useState(null)
    const { pid, workflowId } = router.query
    console.log(workflowLogs)

    const fetchWorkflowLogs = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/workflows/' + workflowId + '/logs').then(res => {
            setWorkflowLogs(res.data)
        }).catch(err => {
            console.log(err)
        })
    }, [workflowId])

    useEffect(() => {
       if (workflow && !workflowLogs) {
         fetchWorkflowLogs()
       }
    }, [workflow, workflowLogs])

    const formatWorkflowLogTableData = () => {
        return workflowLogs.map((workflowLog) => {
            return {
                id: workflowLog.uuid,
                action: workflowLog.action,
                level: workflowLog.level ? workflowLog.level : 'info',
                timestamp: workflowLog.created_at,
                message: workflowLog.message
            }
        })
    }

    return workflowLogs ? (
        <Center sx={{width: '100%'}}>
            <WorkflowLogsTable data={formatWorkflowLogTableData()}/>
        </Center>
    ): (
        <div>
            <Text>Loading...</Text>
        </div>
    )
}

export default WorkflowMonitor