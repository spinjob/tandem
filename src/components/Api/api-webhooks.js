import React, {useState} from 'react'
import { Text, Divider, Card, Code, ScrollArea, Tabs} from '@mantine/core';
import ActionsTable from './actions-table'
import {VscSymbolArray} from 'react-icons/vsc'
import {RxQuestionMarkCircled} from 'react-icons/rx'
import SchemaTree from './schema-tree'
import LargeActionsTable from './Actions/actions-table-large';

const ApiWebhooks = ({actions, setAction}) => {

    const [selectedWebhook, setSelectedWebhook] = useState(null)
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
    
    var newActionRows = actions.map((action, index) => {
        var headerSchema = action.parameterSchema && action.parameterSchema.header ? action.parameterSchema.header : null
        var pathSchema = action.parameterSchema && action.parameterSchema.path ? action.parameterSchema.path : null
        var requestBodySchema = action.requestBody2 && action.requestBody2.schema ? action.requestBody2.schema : null
        var responseBodySchema = action.responses && action.responses.length > 0 && action.responses[0].schema ? action.responses[0].schema : null

        return (
            {
                name: action.name,
                method: action.method,
                uuid: action.uuid,
                path: action.path,
                headerParameters: headerSchema ? 'true': 'false',
                pathParameters: pathSchema ? 'true': 'false',
                requestBodySchema: requestBodySchema ? 'true' : 'false',
                responseBodySchema: responseBodySchema ? 'true' : 'false'
            }
        )
    }) 

    const processSchemaPath = (path, schemaType) => {
        if(schemaType == 'requestBody') {
            var pathArray = path.split('.')
            var parent = selectedWebhook.requestBody2.schema
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
            
            var headerProperty = selectedWebhook.parameterSchema.header[path]
            return {
                name: headerProperty.name,
                type: headerProperty.schema.type,
                description: headerProperty.schema.description,
                key: path,
                required: headerProperty.required,
                example: headerProperty.schema.example
            }
        }  else if(schemaType == 'path') {
            
            var pathProperty = selectedWebhook.parameterSchema.path[path]
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
        const { id } = event.currentTarget.dataset;
        const action = actions.find((action) => action.uuid === id)
        setSelectedWebhook(action)
        setAction(action)
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
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#9596FF', alignItems:'center', justifyContent:'center'}}>
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
                      action.requestBody2?.schema ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="requestBody">Request Body</Tabs.Tab>
                    ) : null 
                    } 
                    {
                      action.parameterSchema?.header ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="header">Header</Tabs.Tab>
                    ) : null 
                    } 
                    {
                      action.parameterSchema?.path ? (
                        <Tabs.Tab style={{fontFamily: 'apercu-regular-pro', fontSize: '18px', fontWeight: 200}} value="path">Path Parameters</Tabs.Tab>
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
        <div>
            <div style={{height: 20}}/>
            <LargeActionsTable data={newActionRows} setUUID={setUUID} statusFilter={'None'}/>
        </div>
    )
}

export default ApiWebhooks