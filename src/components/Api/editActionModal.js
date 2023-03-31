import React, { useState, useEffect } from 'react';
import {Text, Button, TextInput, JsonInput, Icon, Select, Textarea, Card, Table, Badge} from '@mantine/core';

import SchemaTree from './schema-tree'

const ManageActionModal = ({ action, isOpen, toggle, updateAction }) => {
    const [selectedSchemaProperty, setSelectedSchemaProperty] = useState(null)
    const [groupBeingEdited, setGroupBeingEdited] = useState(null)
    const [editedAction, setEditedAction] = useState(action)

    function toUppercase (str) {
        return str.toUpperCase()
    }

    const processSchemaPath = (path, schemaType) => {
        if(schemaType == 'requestBody') {
            var pathArray = path.split('.')
            var parent = action.requestBody2.schema
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
            var parent = action.responses[0].schema
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
            
            var headerProperty = action.parameterSchema.header[path]
            return {
                name: headerProperty.name,
                type: headerProperty.schema.type,
                description: headerProperty.schema.description,
                key: path,
                required: headerProperty.required,
                example: headerProperty.schema.example
            }
        }  else if(schemaType == 'path') {
            
            var pathProperty = action.parameterSchema.path[path]
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
            <div style={{display:'flex', flexDirection:'row'}}>
                <Badge
                    size='xl'
                    sx={{
                        backgroundColor: action.method == 'get' ? '#B4F481' : action.method == 'post' ? '#FF7E35' : action.method == 'put' ? '#FFC069' : action.method == 'delete' ? '#FFA39E' : '#636e72',
                        color:'white',
                        fontFamily: 'Visuelt',
                        fontWeight: 400,
                        fontSize: '20px'
                    }}
                    >
                        {toUppercase(action.method)}
                    </Badge>
                <div style={{width: '10px'}}/>
                <Text
                    sx={{
                        fontSize: '20px',
                        color: 'black',
                        marginBottom: '10px',
                        display: 'block',
                        fontFamily: 'Visuelt',
                        fontWeight: 400
                    }}  
                >
                    {action.path}
                </Text>
            </div>
            {
                action.parameterSchema && action.parameterSchema?.header && groupBeingEdited != 'header' ? (
                    <div>
                        <div style={{height: '20px'}}/>
                        <div>
                            <div style={{display:'flex', flexDirection:'row',justifyContent: 'space-between'}}>
                                <Text
                                    sx={{
                                        fontSize: '20px',
                                        color: 'black',
                                        display: 'block',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400
                                    }}
                                >
                                    Headers
                                </Text>
                                <Button
                                    onClick={() => {setGroupBeingEdited('header')}}
                                    size='sm'
                                    variant='subtle'
                                    color='gray'
                                    sx={{
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400,
                                        fontSize: '16px'
                                    }}
                                >
                                    Edit
                                </Button>
                            </div>
                            <div style={{height: '10px'}}/>
                            <Table
                                sx={{   
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400,
                                    fontSize: '16px'
                                }}
                                >
                                <thead>
                                    <tr>
                                        <th style={{  width: 150 }} >Name</th>
                                        <th style={{  width: 100}}>Type</th>
                                        <th style={{  width: 250 }} >Description</th>
                                        <th style={{  width: 100 }} >Required</th>
                                        <th style={{  width: 200}} >Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(action.parameterSchema.header).map((header, index) => {
                                            return (
                                                <tr key={header}>
                                                    <td>{header}</td>
                                                    <td>{action.parameterSchema.header[header].schema.type}</td>
                                                    <td>{action.parameterSchema.header[header].schema.description}</td>
                                                    <td>{action.parameterSchema.header[header].required ? 'Yes' : 'No'}</td>
                                                    <td>{action.parameterSchema.header[header].schema.example}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </div>
                ) : action.parameterSchema && action.parameterSchema?.header && groupBeingEdited == 'header' ? (
                    <div>
                        <div style={{height: '20px'}}/>
                        <div>
                            <div style={{display:'flex', flexDirection:'row', justifyContent: 'space-between'}}>
                                <Text
                                    sx={{
                                        fontSize: '20px',
                                        color: 'black',
                                        display: 'block',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400
                                    }}
                                >
                                    Headers
                                </Text>
                                <div style={{width: '10px'}}/>
                                <Button
                                    onClick={() => {
                                        setGroupBeingEdited(null)
                                        setSelectedSchemaProperty(null)
                                    }}
                                    size='sm'
                                    variant='filled'
                                    color='dark'
                                    sx={{
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400,
                                        fontSize: '16px'
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                            <div style={{height: '10px'}}/>
                            <Table
                                sx={{   
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400,
                                    fontSize: '16px'
                                }}
                                >
                                <thead>
                                    <tr>
                                        <th style={{  width: 150 }} >Name</th>
                                        <th style={{  width: 100}}>Type</th>
                                        <th style={{  width: 250 }} >Description</th>
                                        <th style={{  width: 100 }} >Required</th>
                                        <th style={{  width: 200}} >Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(action.parameterSchema.header).map((header, index) => {
                                            return (
                                                <tr key={header}>
                                                    <td>
                                                        <TextInput
                                                            value={header}
                                                            onChange={(e) => {
                                                                let newAction = {...action}
                                                                let newHeader = {...newAction.parameterSchema.header[header]}
                                                                delete newAction.parameterSchema.header[header]
                                                                newAction.parameterSchema.header[e] = newHeader
                                                                setEditedAction(newAction)
                                                            }}
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 400,
                                                                fontSize: '16px',
                                                                width: 150
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Select 
                                                            value={editedAction.parameterSchema.header[header].schema.type}
                                                            onChange={(e) => {
                                                                let newAction = {...action}
                                                                newAction.parameterSchema.header[header].schema.type = e
                                                                setEditedAction(newAction)
                                                            }}
                                                            data={[{value: 'string', label: 'string'}, {value: 'number', label: 'number'}, {value: 'boolean', label: 'boolean'}]}
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 400,
                                                                fontSize: '16px',
                                                                width: 100
                                                            }}
                                                        />   
                                                    </td>
                                                    <td>
                                                        <Textarea
                                                            value={action.parameterSchema.header[header].schema.description}
                                                            onChange={(e) => {
                                                                let newAction = {...action}
                                                                newAction.parameterSchema.header[header].schema.description = e.target.value
                                                                setEditedAction(newAction)
                                                            }}
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 400,
                                                                fontSize: '16px',
                                                                width: 250
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Select
                                                            value={action.parameterSchema.header[header].required}
                                                            onChange={(e) => {
                                                                let newAction = {...action}
                                                                newAction.parameterSchema.header[header].required = e
                                                                setEditedAction(newAction)
                                                            }}
                                                            data={[{value: true, label: 'Yes'}, {value: false, label: 'No'}]}
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 400,
                                                                fontSize: '16px',
                                                                width: 100
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <TextInput
                                                            value={action.parameterSchema.header[header].schema.example}
                                                            onChange={(e) => {
                                                                let newAction = {...action}
                                                                newAction.parameterSchema.header[header].schema.example = e.target.value
                                                                setEditedAction(newAction)
                                                            }}
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 400,
                                                                fontSize: '16px',
                                                                width: 200
                                                            }}
                                                        />
                                                        </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </div>

                ) : null
            }
            
            {
                action.parameterSchema && action.parameterSchema?.path && groupBeingEdited != 'path' ? (
                    <div>
                        <div style={{height: '20px'}}/>
                        <div>
                            <div style={{display:'flex', flexDirection:'row',justifyContent: 'space-between'}}>
                                <Text
                                    sx={{
                                        fontSize: '20px',
                                        color: 'black',
                                        display: 'block',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400
                                    }}
                                >
                                    Path Parameters
                                </Text>
                                <Button
                                    onClick={() => {setGroupBeingEdited('path')}}
                                    size='sm'
                                    variant='subtle'
                                    color='gray'
                                    sx={{
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400,
                                        fontSize: '16px'
                                    }}
                                >
                                    Edit
                                </Button>
                            </div>
                            <div style={{height: '10px'}}/>
                            <Table
                                sx={{   
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400,
                                    fontSize: '16px'
                                }}
                                >
                                <thead>
                                    <tr>
                                        <th style={{  width: 150 }} >Name</th>
                                        <th style={{  width: 100}}>Type</th>
                                        <th style={{  width: 250 }} >Description</th>
                                        <th style={{  width: 100 }} >Required</th>
                                        <th style={{  width: 200}} >Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(action.parameterSchema.path).map((path, index) => {
                                            return (
                                                <tr key={path}>
                                                    <td>{path}</td>
                                                    <td>{action.parameterSchema.path[path].schema.type}</td>
                                                    <td>{action.parameterSchema.path[path].schema.description}</td>
                                                    <td>{action.parameterSchema.path[path].required ? 'Yes' : 'No'}</td>
                                                    <td>{action.parameterSchema.path[path].schema.example}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </div>
                ) : action.parameterSchema && action.parameterSchema?.path && groupBeingEdited == 'path' ? (
                    <div>
                    <div style={{height: '20px'}}/>
                    <div>
                        <div style={{display:'flex', flexDirection:'row', justifyContent: 'space-between'}}>
                            <Text
                                sx={{
                                    fontSize: '20px',
                                    color: 'black',
                                    display: 'block',
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400
                                }}
                            >
                                Path Parameters
                            </Text>
                            <div style={{width: '10px'}}/>
                            <Button
                                onClick={() => {
                                    setGroupBeingEdited(null)
                                    setSelectedSchemaProperty(null)
                                }}
                                size='sm'
                                variant='filled'
                                color='dark'
                                sx={{
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400,
                                    fontSize: '16px'
                                }}
                            >
                                Save
                            </Button>
                        </div>
                        <div style={{height: '10px'}}/>
                        <Table
                            sx={{   
                                fontFamily: 'Visuelt',
                                fontWeight: 400,
                                fontSize: '16px'
                            }}
                            >
                            <thead>
                                <tr>
                                    <th style={{  width: 150 }} >Name</th>
                                    <th style={{  width: 100}}>Type</th>
                                    <th style={{  width: 250 }} >Description</th>
                                    <th style={{  width: 100 }} >Required</th>
                                    <th style={{  width: 200}} >Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Object.keys(action.parameterSchema.path).map((path, index) => {
                                        return (
                                            <tr key={path}>
                                                <td>
                                                    <TextInput
                                                        value={path}
                                                        onChange={(e) => {
                                                            let newAction = {...action}
                                                            let newPathParameter = {...newAction.parameterSchema.path[path]}
                                                            delete newAction.parameterSchema.path[path]
                                                            newAction.parameterSchema.path[e] = newPathParameter
                                                            setEditedAction(newAction)
                                                        }}
                                                        sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400,
                                                            fontSize: '16px',
                                                            width: 150
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Select 
                                                        value={editedAction.parameterSchema.path[path].schema.type}
                                                        onChange={(e) => {
                                                            let newAction = {...action}
                                                            newAction.parameterSchema.path[path].schema.type = e
                                                            setEditedAction(newAction)
                                                        }}
                                                        data={[{value: 'string', label: 'string'}, {value: 'number', label: 'number'}, {value: 'boolean', label: 'boolean'}]}
                                                        sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400,
                                                            fontSize: '16px',
                                                            width: 100
                                                        }}
                                                    />   
                                                </td>
                                                <td>
                                                    <Textarea
                                                        value={action.parameterSchema.path[path].schema.description}
                                                        onChange={(e) => {
                                                            let newAction = {...action}
                                                            newAction.parameterSchema.path[path].schema.description = e.target.value
                                                            setEditedAction(newAction)
                                                        }}
                                                        sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400,
                                                            fontSize: '16px',
                                                            width: 250
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Select
                                                        value={action.parameterSchema.path[path].required}
                                                        onChange={(e) => {
                                                            let newAction = {...action}
                                                            newAction.parameterSchema.path[path].required = e
                                                            setEditedAction(newAction)
                                                        }}
                                                        data={[{value: true, label: 'Yes'}, {value: false, label: 'No'}]}
                                                        sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400,
                                                            fontSize: '16px',
                                                            width: 100
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <TextInput
                                                        value={action.parameterSchema.path[path].schema.example}
                                                        onChange={(e) => {
                                                            let newAction = {...action}
                                                            newAction.parameterSchema.path[path].schema.example = e.target.value
                                                            setEditedAction(newAction)
                                                        }}
                                                        sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400,
                                                            fontSize: '16px',
                                                            width: 200
                                                        }}
                                                    />
                                                    </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </div>
                </div>
            ) : null
            }

            {
                action.requestBody2 && action.requestBody2.schema ? (
                    <div>
                        <div>
                            <Text
                                sx={{
                                    fontSize: '20px',
                                    color: 'black',
                                    display: 'block',
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400
                                }}
                            >
                                Request Body
                            </Text>
                            <div style={{height: '10px'}}/>
                            <SchemaTree schema={action.requestBody2.schema} setSelectedSchemaProperty={selectProperty} schemaType='requestBody' actionUuid={action.uuid}/>
                        </div>
                    </div>
                ) : null 
            }

{
                action.responses.length > 0 && action.responses[0].schema ? (
                    <div>
                        <div style={{height: '20px'}}/>
                        <div>
                            <Text
                                sx={{
                                    fontSize: '20px',
                                    color: 'black',
                                    display: 'block',
                                    fontFamily: 'Visuelt',
                                    fontWeight: 400
                                }}
                            >
                                Response Body
                            </Text>
                            <div style={{height: '10px'}}/>
                            <SchemaTree schema={action.responses[0].schema} setSelectedSchemaProperty={selectProperty} schemaType='response' actionUuid={action.uuid}/>

                        </div>
                    </div>
                ) : null 
            }
        </div>
    )

}

export default ManageActionModal