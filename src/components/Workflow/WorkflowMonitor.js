

import { useRouter } from 'next/router';
import React, { useCallback, useState, useContext, useEffect, useRef} from 'react';
import useStore from '../../context/store'
import axios from 'axios'
import WorkflowLogsTable from './workflowLogTable.tsx'
import refreshIcon from '../../../public/icons/refresh-rotate.svg'
import {
    Button,
    Text,
    Image,
    Divider,
    Center,
    Select
  } from '@mantine/core';

const WorkflowMonitor = ({workflow}) => {
    const nodeActions = useStore(state => state.nodeActions)
    const mappings = useStore(state => state.mappings)
    const nodes = useStore(state => state.nodes)
    const edges = useStore(state => state.edges)
    const router = useRouter()
    const [workflowLogs, setWorkflowLogs] = useState(null)
    const [workflowRuns, setWorkflowRuns] = useState(null)
    const [errorRate, setErrorRate] = useState(null)
    const { pid, workflowId } = router.query

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
                message: workflowLog.message,
                traceId: workflowLog.traceId
            }
        })
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    const renderActionOptions = () => {
        const actionOptions = []
        actionOptions.push({label: 'All Actions', value: 'all'})
        workflowLogs.forEach((workflowLog) => {
            if(actionOptions.find((actionOption) => actionOption.value === workflowLog.action)) {
                return
            }

            actionOptions.push({label: workflowLog.action, value: workflowLog.action})
        })
        var uniqueActionOptions = actionOptions.filter(onlyUnique)
        return uniqueActionOptions
    }

    
    useEffect(() => {
        if (!workflowRuns && workflowLogs){ 
            const workflowTraceIds = workflowLogs.map((workflowLog) => {
                return workflowLog.traceId
            })
            setWorkflowRuns(workflowTraceIds.filter(onlyUnique))
        }
        if (workflowLogs && !errorRate) {
            const errorLogs = workflowLogs.filter((workflowLog) => {
                return workflowLog.level === 'error'
            }
            )
            setErrorRate(errorLogs.length / workflowLogs.length)
        }

    }, [workflowLogs, workflowRuns])


    return (
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 50}}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginTop: -10}}>
                <div style={{width: 200, height: 140, backgroundColor: '#EAEAFF', borderRadius:30, padding: 20}}>
                    <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 400, fontSize: 16}}>Workflow Runs</Text>
                    <div style={{height: 5}} />
                    <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 600, fontSize: 50}}>{workflowRuns ? workflowRuns.length : 0}</Text>
                </div>
                <div style={{width: 20}} />
                <div style={{width: 200, height: 140, backgroundColor: '#EAEAFF', borderRadius:30, padding: 20}}>
                    <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 400, fontSize: 16}}>Error Rate</Text>
                    <div style={{height: 5}} />
                    <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 600, fontSize: 50}}>{
                        errorRate ? (errorRate * 100).toFixed(2) + '%' : '0%'
                    }</Text>
                </div>
                <div style={{width: 20}} />
            </div>
            <div style={{height: 40}} />
            <div style={{width: '100%', display: 'flex', flexDirection: 'row', paddingLeft: 10, alignItems: 'center'}}>
                <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 600, fontSize: 30}}>Execution Logs</Text>
                <Button
                    variant='subtle'
                    leftIcon={<Image src={refreshIcon} width={20} height={20} />}
                    style={{marginLeft: 20, borderRadius: 30}}
                    
                    sx={{
                        ':hover': {
                            backgroundColor: '#EAEAFF',
                            borderRadius: 30
                        }
                    }}
                    onClick={() => {
                        setWorkflowLogs(null)
                    }}
                >
                    <Text
                        style={{fontFamily:'Visuelt', color: 'black', fontWeight: 400, fontSize: 16}}
                    >
                        Refresh Logs
                    </Text>
                </Button>
            </div>
                    
            <div style={{height: 20}} />
            {
                workflowLogs ? (
                    <WorkflowLogsTable style={{width: '100%'}} actions={renderActionOptions()} data={formatWorkflowLogTableData()}/>
                ) : (
                    <div>
                        <Text>Loading...</Text>
                    </div>
                )
            }
           
        </div>
    )
}

export default WorkflowMonitor