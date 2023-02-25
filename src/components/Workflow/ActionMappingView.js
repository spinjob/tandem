import WorkflowSchemaTree from "./workflow-schema-tree"
import {Text, Accordion, Image, Tooltip} from '@mantine/core'

const ActionMappingView = ({action, node, edge, type})=> {

    const processParameterSchema = (schema) => {
        var parameterSchemaKeys = Object.keys(schema)
        var parameterSchemaValues = Object.values(schema)
        var parameterSchema = {}
    
        for (var i = 0; i < parameterSchemaKeys.length; i++) {
            var parameterSchemaObject = {
                name: parameterSchemaKeys[i],
                key: parameterSchemaKeys[i],
                type: parameterSchemaValues[i].schema.type,
                description: parameterSchemaValues[i].schema.description ? parameterSchemaValues[i].schema.description : null,
                required: parameterSchemaValues[i].required ? parameterSchemaValues[i].required : false,
                schemaRef: parameterSchemaValues[i].schemaRef ? parameterSchemaValues[i].schemaRef : null,
                example: parameterSchemaValues[i].schema.example ? parameterSchemaValues[i].schema.example : null
            }
            parameterSchema[parameterSchemaKeys[i]] = parameterSchemaObject
        }
        return parameterSchema    
    }
    const upperCaseString = (string) => {
        return string?.toUpperCase()
    }
    
    return action?.type == "scheduled" ? (
        <div style={{display: 'flex', flexDirection:'column',alignItems: 'center', justifyContent:'center',height: 350}}>
            <Image src="https://i.ibb.co/yFHmNmy/Screen-Shot-2023-02-22-at-2-17-50-PM.png" alt="No Data Coming from Trigger" width={80} height={80}/>
            <Text style={{fontFamily: 'Visuelt'}}>No Schema Available</Text>
            <Text style={{fontFamily: 'Visuelt', fontWeight:100, fontSize:'14px', width: 200, alignContent:'center'}}>You can configure a property or select one from your partnership configurations on the right.</Text>
        </div>
        
    ) : (
        <div style={{padding: 20}}>
            {node?.id == edge?.target || type == "trigger-webhook" ? (
                <div>
                    <div style={{paddingBottom: 20}}>
                        <Text style={{fontFamily:'Visuelt'}}>Action Request Schema</Text>
                        <Text truncate style={{fontFamily:'Visuelt', fontWeight: 100}}>{upperCaseString(action?.method)} {action?.path}</Text>
                        
                    </div>
                    <Accordion multiple={true} radius="lg" chevronPosition="left" variant="separated" defaultValue={["requestBody","header","path"]}>
        
                        {action?.parameterSchema?.path ? (
                                <Accordion.Item value="path" >
                                <Accordion.Control>
                                    <Text style={{fontFamily:'Visuelt', fontSize: '14px'}}>Path Parameters</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <WorkflowSchemaTree node={node} schema={processParameterSchema(action?.parameterSchema?.path)} isLoading={false} setSelectedSchemaProperty={null} schemaType={"path"}/>
                                </Accordion.Panel>
                            </Accordion.Item>
                            )
                        : (
                            null
                        )}
        
                        {action?.parameterSchema?.header ? (
                                <Accordion.Item value="header">
                                <Accordion.Control style={{height: 20}}>
                                    <Text style={{fontFamily:'Visuelt', fontSize: '14px'}}>Header Parameters</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <WorkflowSchemaTree node={node} schema={processParameterSchema(action?.parameterSchema?.header)} isLoading={false} setSelectedSchemaProperty={null} schemaType={"header"}/>
                                </Accordion.Panel>
                            </Accordion.Item>
                            )
                        : (
                            null
                        )}
        
                        {action?.requestBody2?.schema ? (
                            <Accordion.Item value="requestBody">
                                <Accordion.Control style={{height: 20}}>
                                    <Text style={{fontFamily:'Visuelt', fontSize: '14px'}}>Request Body Schema</Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <WorkflowSchemaTree node={node} schema={action.requestBody2.schema} isLoading={false} setSelectedSchemaProperty={null} schemaType={"action"}/>
                                </Accordion.Panel>
                            </Accordion.Item>
                            )
                        : (
                            null
                        )}
                    </Accordion>
                </div>
                )
            : (
                <div>
                    <div style={{paddingBottom: 20}}>
                        <Text style={{fontFamily:'Visuelt'}}>Action Response Schema</Text>
                        <Text truncate style={{fontFamily:'Visuelt', fontWeight: 100}}>{upperCaseString(action?.method)} {action?.path}</Text>
                    </div>
                    <Accordion multiple={true} radius="lg" chevronPosition="left" variant="separated"defaultValue={[action?.responses[0]?.http_status_code]}>
                    {
                        action?.responses?.map((response, index) => {
                            return (
                                <Accordion.Item key={index} value={response.http_status_code}>
                                    <Accordion.Control style={{height: 20}}>
                                        <Text style={{fontFamily:'Visuelt', fontSize: '14px'}}>{response.http_status_code}</Text>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        {response?.schema
                                            ? <WorkflowSchemaTree node={node} schema={response?.schema} isLoading={false} setSelectedSchemaProperty={null} schemaType={"action"}/>
                                            : <Text>No Schema</Text>}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            )
                        })
                    }
                    </Accordion>
                </div>
            )}
            
            
        </div>
    )
}
export default ActionMappingView