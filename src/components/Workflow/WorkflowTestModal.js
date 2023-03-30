import React, { useEffect, useState } from 'react'
import { Text, Button, JsonInput, Image,ActionIcon, TextInput, Tooltip, Alert, CopyButton} from '@mantine/core'
import copyIcon from '../../../public/icons/copy-item-left-top.svg'
import checkmarkIcon from '../../../public/icons/checkmark-medium.svg'
import errorIcon from '../../../public/icons/warning-error.svg'
import axios from 'axios'
 
const WorkflowTestModal = ({ workflow}) => {

    const [workflowInputData, setWorkflowInputData] = useState('')
    const [isInputValid, setIsInputValid] = useState(false)
    const [workflowLogs, setWorkflowLogs] = useState(null)
    const [testResult, setTestResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const isJson = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    useEffect(() => {
        if(workflowInputData || workflowInputData == '') {
            if(isJson(workflowInputData)) {
                setIsInputValid(true)
            } else {
                setIsInputValid(false)
            }

        }
    }, [workflowInputData])
    
    const handleWorkflowTest = () => {
        var inputJSON = JSON.parse(workflowInputData)

        if(isJson(workflowInputData)) {
            axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + workflow.parent_project_uuid + '/workflows/' + workflow.uuid + '/trigger', inputJSON).then(res => {
                console.log(res)
                setLoading(false)
                setTestResult(res.data)
            }).catch(err => {
                console.log(err)
                setLoading(false)
            })
        } else {
            console.log('not json')
        }
    }
        
    return (
        <div>
            <Text
                sx={{
                    fontFamily: 'Visuelt',
                    fontWeight: 600,
                    fontSize: '32px'
                }}
            >Manual Workflow Test</Text>
            <Text
                sx={{
                    fontFamily: 'Visuelt',
                    fontWeight: 100,
                    fontSize: '16px',
                    marginTop: 10,
                    color: '#B9B9B9'
                }}
            > This worklow is triggered by a webhook and it relies on data provided in it.  Please provide an example webhook that matches that schema to test your workflow.
            </Text>
            <div style={{height: 20}}/>
            {
                testResult && !loading ? (
                    <div>
                        <Text
                            sx={{
                                fontFamily: 'Visuelt',
                                fontWeight: 600,
                                fontSize: '20px'
                            }}
                        >Test Result</Text>
                        <div style={{height: 20}}/>
                       <Alert color={testResult.status === 'success' ? 'teal' : 'red'} title={testResult.status === 'success' ? (<Text sx={{ fontFamily: 'Visuelt', fontWeight:400, fontSize: '16px', marginTop: 10, color: 'green' }}>Trigger Succeeded!</Text>) : <Text sx={{ fontFamily: 'Visuelt', fontWeight: 100, fontSize: '16px', marginTop: 10, color: 'red' }}>Failed Trigger.</Text>}>
                            {
                                testResult.status === 'success' ? (
                                        <div>
                                            <Text
                                                sx={{
                                                    fontFamily: 'Visuelt',
                                                    fontWeight: 100,
                                                    fontSize: '16px',
                                                    marginTop: 10,
                                                    color: '#000000'
                                                }}
                                            >Your workflow was successfully triggered.  The success or failure of the actions can be investigated in the logs. Use the trace ID below to view the status of each workflow action.</Text>
                                            <div style={{height: 10}}/>
                                            <div style={{display: 'flex', flexDirection:'row', alignItems:'center'}}>
                                                <CopyButton value={testResult.traceId}timeout={2000}>
                                                    {({ copied, copy }) => (
                                                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                                            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                                                                {copied ? (
                                                                    <div style={{width: 30, height: 30}}>
                                                                        <Image src={checkmarkIcon} alt="copy"/>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{width: 30, height: 30}}>
                                                                        <Image src={copyIcon} alt="copy"/>
                                                                    </div>
                                                                )}
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    )}
                                                </CopyButton>
                                                <div style={{width: 10}}/>
                                                <TextInput style={{width: 300}} value={testResult.traceId} disabled/>
                                            </div>
                                         
                                        </div>
                                ) : ( <div>
                                    <Text
                                        sx={{
                                            fontFamily: 'Visuelt',
                                            fontWeight: 100,
                                            fontSize: '16px',
                                            marginTop: 10,
                                            color: '#000000'
                                        }}
                                    >Your workflow could not be triggered.  This is likely because the data provided was not valid JSON. Please check your data and try again.</Text>
                                </div>)}

                       
                        </Alert>
                        <div style={{height: 20}}/>
                        <Button
                        onClick={() => {
                            setTestResult(null)
                            setLoading(false)
                            setWorkflowInputData(null)
                        }}
                        sx={{
                            marginTop: 20,
                            width: '100%',
                            backgroundColor: '#000000',
                            color: 'white',
                            fontFamily: 'Visuelt',
                            fontWeight: 100,
                            fontSize: '16px',
                            borderRadius: 8,
                            ':hover': {
                                backgroundColor: '#3E3E3E',
                            },

                        }}
                     >New Test</Button>
                    </div>
                ) : (
                    <div>
                    <Text
                        sx={{
                            fontFamily: 'Visuelt',
                            fontWeight: 100,
                            fontSize: '16px',
                            marginTop: 10,
                            
                        }}>
                        Send a POST request to this URL and check the logs:
                    </Text>
                    <div style={{height: 10}}/>
                    <div style={{display: 'flex', flexDirection:'row', alignItems:'center'}}>
                        <CopyButton value={process.env.NEXT_PUBLIC_API_BASE_URL+'/projects/'+workflow.parent_project_uuid+'/workflows/'+workflow.uuid+'/trigger'}timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                                            {copied ? (
                                                <div style={{width: 30, height: 30}}>
                                                    <Image src={checkmarkIcon} alt="copy"/>
                                                </div>
                                            ) : (
                                                <div style={{width: 30, height: 30}}>
                                                    <Image src={copyIcon} alt="copy"/>
                                                </div>
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                        </CopyButton>
                        <div style={{width: 10}}/>
                        <TextInput sx={{width: '100%'}} disabled value={process.env.NEXT_PUBLIC_API_BASE_URL+'/projects/'+workflow.parent_project_uuid+'/workflows/'+workflow.uuid+'/trigger'} />
                    </div>
                    <div style={{height: 10}}/>
                    <Text
                        sx={{
                            fontFamily: 'Visuelt',
                            fontWeight: 500,
                            fontSize: '16px',
                            marginTop: 10,
                            
                        }}
                    >
                        OR
                    </Text>
                    <div style={{height: 10}}/>
    
                    <JsonInput
                        label={
                        <Text
                            sx={{
                                fontFamily: 'Visuelt',
                                fontWeight: 100,
                                fontSize: '16px',
                                marginTop: 10,
                              
                            }}
                        >
                            Provide an example webhook payload:
                        </Text>}
                        value={workflowInputData}
                        onChange={setWorkflowInputData}
                        placeholder="Workflow JSON"
                        style={{ height: 250 }}
                        validationError="Invalid JSON"
                        maxRows={10}
                        minRows={10}
                    />
                      <Button
                        disabled={!isInputValid}
                        loading={loading}
                        onClick={() => {
                            handleWorkflowTest()
                            setLoading(true)
                        }}
                        sx={{
                            marginTop: 20,
                            width: '100%',
                            backgroundColor: '#000000',
                            color: 'white',
                            fontFamily: 'Visuelt',
                            fontWeight: 100,
                            fontSize: '16px',
                            borderRadius: 8,
                            ':hover': {
                                backgroundColor: '#3E3E3E',

                            },

                        }}
                     >Run with Example Webhook</Button>
                </div>
                )

            }
          
        </div>
    )


}

export default WorkflowTestModal