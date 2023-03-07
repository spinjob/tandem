import React, {useState} from 'react'
import { Text, Divider, Card, Code, ScrollArea, Tabs, Accordion} from '@mantine/core';
import ActionsTable from './actions-table'
import {VscSymbolArray} from 'react-icons/vsc'
import {RxQuestionMarkCircled} from 'react-icons/rx'
import SchemaTree from './schema-tree'

const ApiActions = ({actions}) => {

    const [selectedAction, setSelectedAction] = useState(null)
    const [schemaLoading, setSchemaLoading] = useState(false)
    const [selectedSchemaProperty, setSelectedSchemaProperty] = useState(null)

    var actionRows = actions.map((action, index) => {
        return (
            {
                name: action.name,
                method: action.method,
                uuid: action.uuid
            }
        )
    })  

    const processSchemaPath = (path, schemaType) => {
        if(schemaType == 'requestBody') {
            var pathArray = path.split('.')
            var parent = selectedAction.requestBody2.schema
            for (var i = 0; i < pathArray.length; i++) {
                var child = parent[pathArray[i]]
                if(child?.properties && i !== pathArray.length - 1){
                    parent = child.properties
                }
                else if(child?.items && i !== pathArray.length - 1){
                    parent = child.items
                }
                else {
                    var childKey = pathArray[i]
                    return {...child, key: childKey}
                }
    
            }

        } else if (schemaType == 'response'){
            var pathArray = path.split('.')
            var parent = selectedAction.responses[0].schema
            for (var i = 0; i < pathArray.length; i++) {
                var child = parent[pathArray[i]]
                if(child?.properties && i !== pathArray.length - 1){
                    parent = child.properties
                }
                else if(child?.items && i !== pathArray.length - 1){
                    parent = child.items
                }
                else {
                    var childKey = pathArray[i]
                    return {...child, key: childKey}
                }
    
            }
        }
        else if(schemaType == 'header') {
            
            var headerProperty = selectedAction.parameterSchema.header[path]
            return {
                name: headerProperty.name,
                type: headerProperty.schema.type,
                description: headerProperty.schema.description,
                key: path,
                required: headerProperty.required,
                example: headerProperty.schema.example
            }
        }  else if(schemaType == 'path') {
            
            var pathProperty = selectedAction.parameterSchema.path[path]
            return {
                name: pathProperty.name,
                type: pathProperty.schema.type,
                description: pathProperty.schema.description,
                key: path,
                required: pathProperty.required,
                example: pathProperty.schema.example
            }
        }
      
    }

    const selectProperty = (propertyPath, schemaType) => {

        setSelectedSchemaProperty(processSchemaPath(propertyPath[0], schemaType))
        return
    }

    const setUUID = (event) => {
        const uuid = event.currentTarget.value
        const action = actions.find((action) => action.uuid === uuid)
        setSelectedAction(action)
        setSchemaLoading(true)
        setSelectedSchemaProperty(null)
        setTimeout(() => {
            setSchemaLoading(false)
        }, 500)

    }
    

    const returnIcon = (method) => {
     
        switch (method) {
            case 'post':
                return (
                <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#FFBE9A', alignItems:'center', justifyContent:'center'}}>
                    <Text style={{fontFamily:'Vulf Sans', fontWeight: 600, fontSize: 10}}>POST</Text>                          
                </div>
            )
            case 'put':
                return (
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#FFA39E', alignItems:'center', justifyContent:'center'}}>
                       <Text style={{fontFamily:'Vulf Sans', fontWeight: 600, fontSize: 10}}>PUT</Text>                             
                    </div>
                )
            case 'get':
                return (          
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#DAFAC0', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontFamily:'Vulf Sans', fontWeight: 600, fontSize: 10}}>GET</Text>                          
                    </div>
                )
            case 'delete':
                return (
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                        <VscSymbolArray/>                          
                    </div>
                )
            default:
                return (
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                        <RxQuestionMarkCircled/>                       
                    </div>
                )
        }
    }

    const upperCaseMethod = (method) => {
       return method.toUpperCase()
    }

    const renderActionTabs = (action) => {

        return(
            <Tabs.List>
                    {
                      action.parameterSchema?.header ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="header">Header</Tabs.Tab>
                    ) : null 
                    } 
                    {
                      action.requestBody2?.schema ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="requestBody">Request Body</Tabs.Tab>
                    ) : null 
                    } 
                    
                    {
                      action.parameterSchema?.path ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="path">Path Parameters</Tabs.Tab>
                    ) : null 
                    } 
                    {
                      Object.keys(action?.responses[0]?.schema).length > 0 ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="responseBody">Response Body</Tabs.Tab>
                    ) : null 
                    } 
                    
            </Tabs.List>
           
        )
    }

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


    return (
        <div style={{paddingTop: 30}}>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width: '25vw'}}>
                     <ActionsTable tableType="actions"setUUID={setUUID} data={actionRows} />
                </div>
                <div style={{width: 100}}/>
                <div style={{width: '40vw'}}>
                    {selectedAction ? (
                        <div style={{maxWidth: 720}}>
                            <div style={{height: 20}}/>
                            <Card shadow="sm"radius="md" withBorder style={{padding: 30}}>
                                <Card.Section style={{padding: 30}}>
                                    {returnIcon(selectedAction.method)}
                                    <div style={{height: 15}}/>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 20}}>{selectedAction.name}</Text>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedAction.description}</Text>
                                    <div style={{height: 15}}/>
                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                        <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{upperCaseMethod(selectedAction.method)}</Text>
                                        <div style={{width: 10}}/>
                                        <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedAction.path}</Text>
                                    </div>

                                </Card.Section>
                                
                                <Card.Section style={{padding: 30}}>
                                    <Tabs defaultValue={'header'}>
                                        {renderActionTabs(selectedAction)}
                                        <Tabs.Panel style={{paddingTop: 30}} label="header" value="header">
                                             {
                                                selectedAction.parameterSchema && selectedAction.parameterSchema.header ? (
                                                    <div style={{display:'flex', flexDirection:'row', width:'30vw'}}>
                                                    <div style={{width: '50%'}}>
                                                        <ScrollArea scrollbarSize={2} type="scroll" style={{height: 700}}>
                                                            <SchemaTree schemaType={'header'} setSelectedSchemaProperty={selectProperty} isLoading={schemaLoading} schema={processParameterSchema(selectedAction.parameterSchema.header)} actionUuid={selectedAction.uuid}/>
                                                        </ScrollArea>
                                                    </div>
                                                    <div style={{width: '50%'}}>
                                                        {
                                                            selectedSchemaProperty ? (
                                                                <Card shadow="sm"radius="md" withBorder style={{width: 280, padding: 30}}>
                                                                    <Card.Section>
                                                                        <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.key}</Text>
                                                                        <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.type}</Text>
                                                                        <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.description}</Text>
                                                                    </Card.Section>
                                                                </Card>
                                                            ) : (
                                                                <div>
                                                                    
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                ) : (
                                                    <div/>
                                                )
                                            }
                                        </Tabs.Panel>
                                        <Tabs.Panel style={{paddingTop: 30}} label="requestBody" value="requestBody">
                                            {
                                                selectedAction.requestBody2 && selectedAction.requestBody2.schema ? (
                                                    <div style={{display:'flex', flexDirection:'row', width:'30vw'}}>
                                                    <div style={{width: '50%'}}>
                                                            <ScrollArea scrollbarSize={2} type="scroll" style={{height: 700}}>
                                                                <SchemaTree schemaType={'requestBody'} setSelectedSchemaProperty={selectProperty} isLoading={schemaLoading} schema={selectedAction.requestBody2.schema} actionUuid={selectedAction.uuid}/>
                                                            </ScrollArea>
                                                        </div>
                                                        <div style={{width: '50%'}}>
                                                            {
                                                                selectedSchemaProperty ? (
                                                                    <Card shadow="sm"radius="md" withBorder style={{width: 280, padding: 30}}>
                                                                        <Card.Section>
                                                                            <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.key}</Text>
                                                                            <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.type}</Text>
                                                                            <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.description}</Text>
                                                                        </Card.Section>
                                                                    </Card>
                                                                ) : (
                                                                    <div>
                                                                        
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </div>

                                                ) : (<div/>)
                                            }
                                        </Tabs.Panel>
                                        <Tabs.Panel style={{paddingTop: 30}} label="path" value="path">
                                        {
                                                selectedAction.parameterSchema && selectedAction.parameterSchema.path ? (
                                                    <div style={{display:'flex', flexDirection:'row', width:'30vw'}}>
                                                    <div style={{width: '50%'}}>
                                                        <ScrollArea scrollbarSize={2} type="scroll" style={{height: 700}}>
                                                            <SchemaTree schemaType={'path'} setSelectedSchemaProperty={selectProperty} isLoading={schemaLoading} schema={processParameterSchema(selectedAction.parameterSchema.path)} actionUuid={selectedAction.uuid}/>
                                                        </ScrollArea>
                                                    </div>
                                                    <div style={{width: '50%'}}>
                                                        {
                                                            selectedSchemaProperty ? (
                                                                <Card shadow="sm"radius="md" withBorder style={{width: 280, padding: 30}}>
                                                                     <Card.Section>
                                                                          <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.key}</Text>
                                                                          <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.type}</Text>
                                                                          <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.description}</Text>
                                                                     </Card.Section>
                                                                </Card>
                                                            ) : (
                                                                <div>
                                                                   
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                ) : (
                                                    <div/>
                                                )
                                        }
                                        </Tabs.Panel>
                                        <Tabs.Panel label="responseBody" value="responseBody">
                                        {
                                                selectedAction.responses ? (
                                                    <div style={{display:'flex', flexDirection:'row', width:'30vw'}}>
                                                    <div style={{width: '50%'}}>
                                                        <ScrollArea scrollbarSize={2} type="scroll" style={{height: 700}}>
                                                            <SchemaTree schemaType={'response'} setSelectedSchemaProperty={selectProperty} isLoading={schemaLoading} schema={selectedAction.responses[0].schema} actionUuid={selectedAction.uuid}/>
                                                        </ScrollArea>
                                                    </div>
                                                    <div style={{width: '50%'}}>
                                                        {
                                                            selectedSchemaProperty ? (
                                                                <Card shadow="sm"radius="md" withBorder style={{width: 280, padding: 30}}>
                                                                     <Card.Section>
                                                                          <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.key}</Text>
                                                                          <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.type}</Text>
                                                                          <Text style={{fontFamily:'apercu-regular-pro', fontSize: '16px'}}>{selectedSchemaProperty.description}</Text>
                                                                     </Card.Section>
                                                                </Card>
                                                            ) : (
                                                                <div>
                                                                  
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                ) : (
                                                    <div/>
                                                )
                                        }
                                        </Tabs.Panel>
                                    </Tabs>                                    
                                </Card.Section>
                            </Card>
                        </div>
                    ) : (
                        <div>
                            <Text>Select a schema to view details</Text>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ApiActions