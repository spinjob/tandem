import React, { useState, useEffect } from 'react';
import {Text, Button, TextInput, JsonInput, Icon, Select, Textarea, Card, Table, Badge, Divider} from '@mantine/core';

import SchemaTree from './schema-tree'

const ManageActionModal = ({ action, isOpen, toggle, updateAction }) => {
    const [selectedSchemaProperty, setSelectedSchemaProperty] = useState(null)
    const [groupBeingEdited, setGroupBeingEdited] = useState(null)
    const [editedAction, setEditedAction] = useState(action)
    const [isInputValid, setIsInputValid] = useState(false)
    const [actionSchemaExample, setActionSchemaExample] = useState('')

    function toUppercase (str) {
        return str.toUpperCase()
    }

// function generateExampleJson(schema) {
//     const example = {};
//     for (const key in schema) {
//       const property = schema[key];
//       if (property.type) {
//         switch (property.type) {
//           case "object":
//             example[key] = generateExampleJson(property.properties);
//             break;
//           case "array":
//             example[key] = [generateExampleJson(property.items.properties)];
//             break;
//           case "string":
//             example[key] = property.example || "";
//             break;
//           case "number":
//             example[key] = property.example || 0;
//             break;
//           case "integer":
//             example[key] = property.example || 0;
//             break;
//           case "boolean":
//             example[key] = property.example || false;
//             break;
//         }
//       } else {
//         example[key] = generateExampleJson(property.properties);
//       }
//     }
//     console.log(example)
//     return example;
//   }
  

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

    function processSchemaProperties (schema) {
        const properties = {}
        const propertyKeys = Object.keys(schema) ? Object.keys(schema) : []
        propertyKeys.forEach(key => {
            properties[key] = {
                type: Array.isArray(schema[key]) ? 'array' : typeof schema[key],
                example: JSON.stringify(schema[key]),
                required: false
            }
            if(typeof schema[key] == 'object' && Array.isArray(schema[key]) == false) {
                properties[key].properties = processSchemaProperties(schema[key])
            }

            if(Array.isArray(schema[key]) == true && schema[key].length > 0) {
                properties[key].items = {
                   type: 'object',
                   required: [],
                   properties: processSchemaProperties(schema[key][0])
                }
            }
        })
        
        return properties
    }
    

   function schemaFromExample() {
        const schema = {}
        const exampleObj = JSON.parse(webhookSchemaExample)
        
        Object.keys(exampleObj).forEach(key => {
            schema[key] = {
                type: Array.isArray(exampleObj[key]) ? 'array' : typeof exampleObj[key],
                example: JSON.stringify(exampleObj[key]),
                required: false
            }
            
            if(typeof exampleObj[key] == 'object' && !Array.isArray(exampleObj[key])) {
               
                schema[key].properties = processSchemaProperties(exampleObj[key])
                
            }

            if(Array.isArray(exampleObj[key]) && exampleObj[key].length > 0) {
               
                schema[key].items = {
                    type: 'object',
                    required: [],
                    properties: processSchemaProperties(exampleObj[key][0])
                }
            }

        })

        return schema
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
            <div>
                {/* <Button
                    onClick={() => generateExampleJson(action.requestBody2.schema)}
                >
                    <Text
                        sx={{
                            fontSize: '20px',
                            color: 'black',
                            display: 'block',
                            fontFamily: 'Visuelt',
                            fontWeight: 400
                        }}
                    >
                        Generate Example from Schema
                    </Text>
                </Button> */}
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
                action.requestBody2 && action.requestBody2.schema && groupBeingEdited != 'requestBody' ? (
                    <div style={{display:'flex', flexDirection:'column', paddingTop: 30}}>
                        <Text
                            sx={{
                                fontSize: '24px',
                                color: 'black',
                                display: 'block',
                                fontFamily: 'Visuelt',
                                fontWeight: 400
                            }}
                        >
                            Request Body Schema
                        </Text>
                        <div style={{height: '10px'}}/>
                        <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                            <div style={{width: '50%', padding: 20}}>
                                <Text
                                    sx={{
                                        fontSize: '20px',
                                        color: 'black',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400
                                    }}
                                >
                                    Schema Tree
                                </Text>
                                <Text
                                    sx={{
                                        fontSize: '16px',
                                        color: 'black',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 100
                                    }}
                                >
                                    Click on a property to see more details
                                </Text>
                                <SchemaTree schema={action.requestBody2.schema} setSelectedSchemaProperty={selectProperty} schemaType='requestBody' actionUuid={action.uuid}/>
                            </div>
                            {/* <Divider orientation='vertical'/> */}
                       
                            {/* <div style={{width: '50%', padding: 20}}>
                                <Text
                                    sx={{
                                        fontSize: '20px',
                                        color: 'black',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 400
                                    }}
                                >
                                    View Property
                                </Text>
                                <Card>
                                    <Card.Section
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            
                                        }}
                                    >
                                        <TextInput
                                            value={selectedSchemaProperty ? selectedSchemaProperty.key : ''}
                                            disabled
                                        
                                            label='Key'
                                            sx = {{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 400,
                                                fontSize: '20px',
                                                width: '30%'
                                            }}
                                        />
                                        <TextInput
                                            value={selectedSchemaProperty ? selectedSchemaProperty.type : ''}
                                            disabled
                                            label='Type'
                                            sx = {{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 400,
                                                fontSize: '16px',
                                                width: '30%'
                                            }}
                                        />
                                        <Textarea
                                            value={selectedSchemaProperty ? selectedSchemaProperty.description : ''}
                                            label='Description'
                                            disabled
                                        
                                            sx = {{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 400,
                                                fontSize: '16px',
                                                width: '70%'
                                            }}
                                        />
                                    </Card.Section>
                                </Card>



                            </div> */}
                        </div>
                    </div>
                ) :  action.requestBody2 && action.requestBody2.schema && groupBeingEdited == 'requestBody' ? (
                    <div>

                    </div>
                ) : null
            }

{
                action.responses.length > 0 && !Array.isArray(action.responses[0].schema) ? (
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