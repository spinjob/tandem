import React, {useState} from 'react'
import { Text, Divider, Card, Code, ScrollArea} from '@mantine/core';
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

    const processSchemaPath = (path) => {

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
    }

    const selectProperty = (propertyPath) => {
        setSelectedSchemaProperty(processSchemaPath(propertyPath[0]))
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


    return (
        <div style={{paddingTop: 30}}>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width: '25vw'}}>
                     <ActionsTable setUUID={setUUID} data={actionRows} />
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
                                <Divider size="sm" color='gray' variant='dotted'/>
                                <Card.Section style={{padding: 30}}>
                                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>Request Body Schema:</Text>
                                    <div style={{height: 20}}/>
                                    
    
                                        {selectedAction.requestBody2 && selectedAction.requestBody2.schema ? (
                                            <div style={{display:'flex', flexDirection:'row'}}>
                                                <div style={{width: '50%'}}>
                                                    <ScrollArea scrollbarSize={2} type="scroll" style={{height: 700}}>
                                                        <SchemaTree setSelectedSchemaProperty={selectProperty} isLoading={schemaLoading} schema={selectedAction.requestBody2.schema} actionUuid={selectedAction.uuid}/>
                                                    </ScrollArea>
                                                </div>
                                                <div style={{width: '50%'}}>
                                                    {
                                                        selectedSchemaProperty ? (
                                                            <Card>
                                                                <Card.Section>
                                                                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>{selectedSchemaProperty.key}</Text>
                                                                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>{selectedSchemaProperty.type}</Text>
                                                                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>{selectedSchemaProperty.description}</Text>
                                                                </Card.Section>
                                                            </Card>
                                                        ) : (
                                                            <div>
                                                                <Text>No property selected</Text>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>

                                        ) : (
                                            <div>
                                                <Text>No request body</Text>
                                            </div>
                                        )}
                                    
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