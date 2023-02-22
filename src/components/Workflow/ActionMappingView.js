import WorkflowSchemaTree from "./workflow-schema-tree"
import {Text, Accordion} from '@mantine/core'

const ActionMappingView = ({action, node, edge})=> {
    console.log(edge)

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
        <div>
            <Text>No Data Coming from Trigger</Text>
        </div>
        
    ) : (
        <div style={{padding: 20}}>
            {node?.id == edge?.target ? (
                <div>
                    <div style={{paddingBottom: 20}}>
                        <Text style={{fontFamily:'Visuelt'}}>Action Request Schema</Text>
                        <Text style={{fontFamily:'Visuelt', fontWeight: 100}}>{upperCaseString(action?.method)} {action?.path}</Text>
                    </div>
                    <Accordion  radius="lg" chevronPosition="left" variant="separated" defaultValue="requestBody">
        
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
                        <Text style={{fontFamily:'Visuelt', fontWeight: 100}}>{upperCaseString(action?.method)} {action?.path}</Text>
                    </div>
                    <Accordion  radius="lg" chevronPosition="left" variant="separated"defaultValue={action?.responses[0]?.http_status_code}>
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