import {Text, Divider, Button, Container, Image, UnstyledButton, Tooltip, Accordion, Loader, ScrollArea, ActionIcon} from '@mantine/core'
import { useCallback,useEffect, useState } from 'react'
import {RxArrowRight} from 'react-icons/rx'
import {AiOutlineCheck} from 'react-icons/ai'
import {VscWand} from 'react-icons/vsc'
import {RiCloseCircleFill} from 'react-icons/ri'
import useStore from '../../context/store'
import axios from 'axios'
import mappingIcon from '../../../public/icons/Programing, Data.1.svg'
import chatIcon from '../../../public/icons/message-chat.svg'
import blackLogoIcon from '../../../public/logos/SVG/Icon/Icon_Black.svg'

const SchemaMappingDrawer = ({action, toggleMappingModal, sourceNode, targetNode, partnership}) => {

    const [requiredCount, setRequiredCount] = useState(0)
    const [optionalCount, setOptionalCount] = useState(0)
    const [requiredMapped, setRequiredMapped] = useState(0)
    const [optionalMapped, setOptionalMapped] = useState(0)
    const [requiredPropertyObjects, setRequiredPropertyObjects] = useState(null)
    const [optionalPropertyObjects, setOptionalPropertyObjects] = useState(null)
    const outputPaths = useStore(state => state.outputPaths)
    const inputPaths = useStore(state => state.inputPaths)
    const setOutputPaths = useStore(state => state.setOutputPaths)
    const setInputPaths = useStore(state => state.setInputPaths)
    const selectedMapping = useStore(state => state.selectedMapping)
    const setSelectedMapping = useStore(state => state.setSelectedMapping)
    const selectedEdge = useStore(state => state.selectedEdge)
    const mappings = useStore(state => state.mappings)
    const [mappingSuggestions, setMappingSuggestions] = useState(null)
    const [areSuggestionsLoading, setAreSuggestionsLoading] = useState(false)
    const nodeActions = useStore(state => state.nodeActions)
    const setMappings = useStore(state => state.setMappings)

    console.log(mappings)
    console.log(targetNode)

    /// Functions related to the generation of GPT-3 prompts and handling the response.

    async function getMappingSuggestions (prompt, inputSchema, outputSchema) {

        setAreSuggestionsLoading(true)

        try {
            const response = await tokenizeWrapper(prompt)
            console.log(response)
            console.log(prompt)
            if(response.length > 3500){
                console.log("prompt too long")
            } else {
                axios.post(process.env.NEXT_PUBLIC_OPEN_AI_API_URL, {
                    "model": "text-davinci-003",
                    "prompt": response,
                    "max_tokens": 1000,
                    "temperature": 0,
                    "top_p": 1,
                    "n": 1,
                    "stream": false,
                    "logprobs": null,
                },{
                    headers: {
                        "Authorization": "Bearer " + process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
                }}).then((response) => {

                    console.log(response.data)
                    var mappings = JSON.parse(response.data.choices[0].text)
                    if(mappings) {
                        setMappingSuggestions(mappings)
                        
                    }
                    setAreSuggestionsLoading(false)
                }).catch((error) => {
                    console.log(error)
                    setAreSuggestionsLoading(false)
                })
            }
        } catch (error) {
            console.log(error)
            setAreSuggestionsLoading(false)
        }     

    }

    function tokenizeWrapper(prompt) {
        return new Promise((resolve, reject) => {
            tokenizePrompt(prompt, (response) => {
                resolve(response)
            }, (error) => {
                reject(error)
            })
        })
    }
    
    function tokenizePrompt(prompt, successCallback, failureCallback) {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "/transform/encode", {
            prompt: prompt  
          }).then((response) => {
                successCallback(response.data.encoded)
                return response.data
          }).catch((error) => {
              console.log(error)
              failureCallback(error)
              return error
        })
    }   

    // Function that retreives a properties parent context (i.e. if the property is nested in an array or dictionary)
    const getParentContext = (path, schema) => {
        var schemaLocationArray = path.split('.')

        if(schemaLocationArray.length == 1) {
            return []
        } else {
            var parent = schema
            var parentContext = []
            
            for (var i = 0; i < schemaLocationArray.length; i++) {
                var child = parent[schemaLocationArray[i]]

                if(child?.properties && i !== schemaLocationArray.length - 1){
                    parent = child.properties
                        if(schemaLocationArray[i].includes('{{') && schemaLocationArray[i].includes('}}')) {
                            // parentContext = parentContext.len ? parentContext: {contextType: 'dictionary', dictionaryKey: schemaLocationArray[i], parentContextKey: schemaLocationArray[i-1]}
                            parentContext.push({contextType: 'dictionary', dictionaryKey: schemaLocationArray[i], parentContextKey: schemaLocationArray[i-1]})
                        }
                    }                        

                else if(child?.items && i !== schemaLocationArray.length - 1){
                    if(child.items.properties) {
                        parent = child.items.properties
                        // parentContext = parentContext.contextType ? parentContext : {contextType: 'array', parentContextKey: schemaLocationArray[i], path: path}
                        parentContext.push({contextType: 'array', parentContextKey: schemaLocationArray[i], path: path})
                    } else {
                        if(parentContext.length > 0){
                            return parentContext
                        }
                        return []
                    }
                }
                else {     
                    
                    if(parentContext.length > 0){
                        return parentContext
                    }
                    return []
                }
    
            }
        }
    }

    const getSchemaFromPath = (path) => {
        var schema =  sourceNode?.id == 'trigger' && nodeActions['trigger']?.requestBody2?.schema ? nodeActions['trigger']?.requestBody2?.schema : nodeActions[sourceNode?.id]?.responses && Object.keys(nodeActions[sourceNode?.id]?.responses[0]?.schema).length > 0 ? 
            nodeActions[sourceNode?.id]?.responses[0]?.schema :  null

        var schemaLocationArray = path.split('.')
       
        if(schemaLocationArray.length == 1) {
            return {...schema[schemaLocationArray[0]], path: path, key: schemaLocationArray[0]}
        } else {
            var parent = schema
            var parentContext = []

            
            for (var i = 0; i < schemaLocationArray.length; i++) {
                var child = parent[schemaLocationArray[i]]

                if(child?.properties && i !== schemaLocationArray.length - 1){
                    parent = child.properties
                        if(schemaLocationArray[i].includes('{{') && schemaLocationArray[i].includes('}}')) {
                            parentContext.push({contextType: 'dictionary', dictionaryKey: schemaLocationArray[i], parentContextKey: schemaLocationArray[i-1], path: path})
                        }
                    }                        

                else if(child?.items && i !== schemaLocationArray.length - 1){
                    if(child.items.properties) {
                        parent = child.items.properties
                        parentContext.push({contextType: 'array', parentContextKey: schemaLocationArray[i], path: path})
                    } else {
                        if(parentContext.length > 0){
                            return {...child.items, path: path, key: schemaLocationArray[i], parentContext}
                        }
                        return {...child.items, path: path, key: schemaLocationArray[i]}
                    }
                }
                else {     
                    var childKey = schemaLocationArray[i]
                    if(parentContext.length > 0){
                        return {...child, path: path, key: schemaLocationArray[i], parentContext}
                    }
                    return {...child, key: childKey, path: path}
                }
    
            }
        }
    }

    const processNestedProperties = (properties, parent, requiredSchemaArray) => {
        const nestedPropertyKeys = Object.keys(properties)
        const nestedPropertyValues = Object.values(properties)
        
        const nestedPropertyObjects = nestedPropertyKeys.map((key, index) => {
            if(requiredSchemaArray && typeof requiredSchemaArray == 'object'){
                return {
                    key: key,
                    path: parent + "." + key,
                    ...nestedPropertyValues[index],
                    required: requiredSchemaArray?.includes(key)
                }
            } else {
                return {
                    key: key,
                    path: parent + "." + key,
                    ...nestedPropertyValues[index],
                }
            }
         
        })

        const requiredNestedPropertyArray = []
        const optionalNestedPropertyArray = []

        nestedPropertyObjects.forEach((property) => {
            if(property.required) {
                requiredNestedPropertyArray.push(property)
                if(property.properties){
                    var {required} = processNestedProperties(property.properties, property.path)
                    var {optional} = processNestedProperties(property.properties, property.path)
                    requiredNestedPropertyArray.push(...required)
                    optionalNestedPropertyArray.push(...optional)
                }
                if(property.items){
                    if(property.items.properties){
                        var {required} = processNestedProperties(property.items.properties, property.path)
                        var {optional} = processNestedProperties(property.items.properties, property.path)
                        requiredNestedPropertyArray.push(...required)
                        optionalNestedPropertyArray.push(...optional)
                    } else {
                        requiredNestedPropertyArray.push(property)
                    }
                }
            } else {
                if(property.properties){
                    processNestedProperties(property.properties)
                    var {required} = processNestedProperties(property.properties, property.path)
                    var {optional} = processNestedProperties(property.properties, property.path)
                    optionalNestedPropertyArray.push(...required, ...optional)
                } if(property.items){
                    if(property.items.properties){
                        var {required} = processNestedProperties(property.items.properties, property.path)
                        var {optional} = processNestedProperties(property.items.properties, property.path)
                        optionalNestedPropertyArray.push(...required, ...optional)
                    } else {
                        optionalNestedPropertyArray.push(property)
                    }
                } else {
                    optionalNestedPropertyArray.push(property)
                }
            } 
        })

        const requiredNestedPropertyArrayWithParentContext = requiredNestedPropertyArray.map((property) => {
            return {
                ...property,
                parentContext: getParentContext(property.path, action.requestBody2.schema)
            }
        }).filter((property) => {
            return property.type !== 'array' && property.type !== 'object'
        })


        const optionalNestedPropertyArrayWithParentContext = optionalNestedPropertyArray.map((property) => {
            return {
                ...property,
                parentContext: getParentContext(property.path, action.requestBody2.schema)
            }
        }).filter((property) => {
            return property.type !== 'array' && property.type !== 'object'
        })
        
        return {required: requiredNestedPropertyArrayWithParentContext, optional: optionalNestedPropertyArrayWithParentContext}
    }

    const processProperties = () => {
        const requiredPropertyArray = []
        const optionalPropertyArray = []
        
        if(action?.requestBody2?.schema){
            const propertyKeys = Object.keys(action.requestBody2.schema)
            const propertyValues = Object.values(action.requestBody2.schema)
            const requiredSchema = action?.requestBody2?.requiredSchema ? action?.requestBody2?.requiredSchema : []

            const propertyObjects = propertyKeys.map((key, index) => {
                if(propertyValues[index].type == 'object'){  
                    return {
                        key: key,
                        path: key,
                        requiredKeys: propertyValues[index].required ? propertyValues[index].required : [],
                        required: requiredSchema.includes(key),
                        ...propertyValues[index]
                    }
                } else {
                    return {
                        key: key,
                        path: key,
                        required: requiredSchema.includes(key),
                        ...propertyValues[index]
                    }
                }

            })

            propertyObjects.forEach((property) => {
                if(property.required) {
                        if(property.properties){
                            var {required} = processNestedProperties(property.properties, property.key, property.requiredKeys)
                            var {optional} = processNestedProperties(property.properties, property.key, property.requiredKeys)
                            requiredPropertyArray.push(...required)
                            optionalPropertyArray.push(...optional)
                        } else if(property.items){
                            if(property.items.properties){
                                var {required} = processNestedProperties(property.items.properties, property.key, property.items.required)
                                var {optional} = processNestedProperties(property.items.properties, property.key, property.items.required)
                                requiredPropertyArray.push(...required)
                                optionalPropertyArray.push(...optional)
                            } else {
                                requiredPropertyArray.push(property)
                            }
                        } else {
                            requiredPropertyArray.push(property)
                        }
                } else {
                    if(property.properties){
                        var {required} = processNestedProperties(property.properties, property.key, property.requiredSchema)
                        var {optional} = processNestedProperties(property.properties, property.key, property.requiredSchema)
                        optionalPropertyArray.push(...required, ...optional)
                    } else if(property.items){
                        if(property.items.properties){
                            var {required} = processNestedProperties(property.items.properties, property.key, property.items.required)
                            var {optional} = processNestedProperties(property.items.properties, property.key, property.items.required)
                            optionalPropertyArray.push(...required, ...optional)
                        } else {
                            optionalPropertyArray.push(property)
                        }
                    } else {
                        optionalPropertyArray.push(property)
                    }
                }
            })
            if(requiredPropertyObjects && requiredPropertyObjects.length > 0){
                var filteredPropertyObjects = requiredPropertyArray.filter((property) => {
                    return property.type !== 'array' && property.type !== 'object'
                })
                
                setRequiredPropertyObjects(requiredPropertyObjects, ...filteredPropertyObjects)
            } else {
                var filteredPropertyObjects = requiredPropertyArray.filter((property) => {
                    return property.type !== 'array' && property.type !== 'object'
                })
                setRequiredPropertyObjects(filteredPropertyObjects)
            }
            if(optionalPropertyObjects && optionalPropertyObjects.length > 0){
                var filteredPropertyObjects = optionalPropertyArray.filter((property) => {
                    return property.type !== 'array' && property.type !== 'object'
                })
                
                setOptionalPropertyObjects(optionalPropertyObjects, ...filteredPropertyObjects)
            } else {
                var filteredPropertyObjects = optionalPropertyArray.filter((property) => {
                    return property.type !== 'array' && property.type !== 'object'
                })
                
                setOptionalPropertyObjects(filteredPropertyObjects)
            }

            setOptionalCount(optionalCount + optionalPropertyArray.length)
            setRequiredCount(requiredCount + requiredPropertyArray.length)
        } 

        if(action?.parameterSchema?.header){
            const propertyKeys = Object.keys(action?.parameterSchema?.header)
            const propertyValues = Object.values(action?.parameterSchema?.header)
            const propertyObjects = propertyKeys.map((key, index) => {
                return {
                    key: key,
                    path: key,
                    ...propertyValues[index]
                }
            })

            propertyObjects.forEach((property) => {
                if(property.required) {
                        if(property.properties){
                            var {required} = processNestedProperties(property.properties, property.key)
                            var {optional} = processNestedProperties(property.properties, property.key)
                            requiredPropertyArray.push(...required)
                            optionalPropertyArray.push(...optional)
                        } else {
                            requiredPropertyArray.push(property)
                        }
                } else {
                    if(property.properties){
                        var {required} = processNestedProperties(property.properties, property.key)
                        var {optional} = processNestedProperties(property.properties, property.key)
                        optionalPropertyArray.push(...required, ...optional)
                    } else {
                        optionalPropertyArray.push(property)
                    }
                }
            })
            if(requiredPropertyObjects && requiredPropertyObjects.length > 0){
                setRequiredPropertyObjects(requiredPropertyObjects, ...requiredPropertyArray)
            } else {
                setRequiredPropertyObjects(requiredPropertyArray)
            }
            if(optionalPropertyObjects && optionalPropertyObjects.length > 0){
                setOptionalPropertyObjects(optionalPropertyObjects, ...optionalPropertyArray)
            } else {
                setOptionalPropertyObjects(optionalPropertyArray)
            }

            setOptionalCount(optionalCount + optionalPropertyArray.length)
            setRequiredCount(requiredCount + requiredPropertyArray.length)

        }

        if(action?.parameterSchema?.path){
            const propertyKeys = Object.keys(action?.parameterSchema?.path)
            const propertyValues = Object.values(action?.parameterSchema?.path)
            const propertyObjects = propertyKeys.map((key, index) => {
                return {
                    key: key,
                    path: key,
                    ...propertyValues[index]
                }
            })

            propertyObjects.forEach((property) => {
                if(property.required) {
                        if(property.properties){
                            var {required} = processNestedProperties(property.properties, property.key)
                            var {optional} = processNestedProperties(property.properties, property.key)
                            requiredPropertyArray.push(...required)
                            optionalPropertyArray.push(...optional)
                        } else {
                            requiredPropertyArray.push(property)
                        }
                } else {
                    if(property.properties){
                        var {required} = processNestedProperties(property.properties, property.key)
                        var {optional} = processNestedProperties(property.properties, property.key)
                        optionalPropertyArray.push(...required, ...optional)
                    } else {
                        optionalPropertyArray.push(property)
                    }
                }
            })
            if(requiredPropertyObjects && requiredPropertyObjects.length > 0){
                setRequiredPropertyObjects(requiredPropertyObjects, ...requiredPropertyArray)
            } else {
                setRequiredPropertyObjects(requiredPropertyArray)
            }
            if(optionalPropertyObjects && optionalPropertyObjects.length > 0){
                setOptionalPropertyObjects(optionalPropertyObjects, ...optionalPropertyArray)
            } else {
                setOptionalPropertyObjects(optionalPropertyArray)
            }

        }
        setOptionalCount(optionalCount + optionalPropertyArray.length)
        setRequiredCount(requiredCount + requiredPropertyArray.length)

        
    }
 
    const processNestedPaths = (schema, parentPath) => {
        const schemaPathsArray = []
        const propertyKeys = Object.keys(schema)
        const propertyValues = Object.values(schema)
        const propertyObjects = propertyKeys.map((key, index) => {
            
            if(propertyValues[index].type !== 'object' && propertyValues[index].type !== 'array'){
                schemaPathsArray.push(`${parentPath}.${key}`)
            }

            return {
                key: key,
                path: `${parentPath}.${key}`,
                ...propertyValues[index]
            }
        })

        propertyObjects.forEach((property) => {
            if(property.properties){
                var paths = processNestedPaths(property.properties, `${parentPath}.${property.key}`)
                schemaPathsArray.push(...paths)
            } else if(property.items){
                if(property.items.properties){
                    var paths = processNestedPaths(property.items.properties, `${parentPath}.${property.key}`)
                    schemaPathsArray.push(...paths)
                } else {
                    schemaPathsArray.push(property.items.type)
                }
            }
        })
        return schemaPathsArray
    }


    const processPaths = (schema) => {
        const schemaPathsArray = []
        const propertyKeys = Object.keys(schema)
        const propertyValues = Object.values(schema)
        
        const propertyObjects = propertyKeys.map((key, index) => {
            return {
                key: key,
                path: key,
                ...propertyValues[index]
            }
        })

        propertyObjects.forEach((property) => {
            if(property.properties){
                var paths = processNestedPaths(property.properties, property.key)
                schemaPathsArray.push(...paths)
            } else if(property.items){
                if(property.items.properties){
                    var paths = processNestedPaths(property.items.properties, property.key)
                    schemaPathsArray.push(...paths)
                } else {
                    schemaPathsArray.push(property.items.type)
                }
            } else {
                schemaPathsArray.push(property.key)
            }

        })


        return schemaPathsArray
    }

    useEffect (() => {
        
            if(outputPaths.length == 0 && action?.requestBody2?.schema || outputPaths.length == 0 && action?.parameterSchema?.path || outputPaths.length == 0 && action?.parameterSchema?.header){
                var pathArray = []
                if (action?.requestBody2?.schema && outputPaths.length == 0) {
                    var paths = processPaths(action.requestBody2.schema)
                    if(pathArray.length > 0){
                        pathArray = [...pathArray, ...paths]
                    } else {
                        pathArray.push(...paths)
                    }
                }
                if (action?.parameterSchema?.path && outputPaths.length == 0) {
                    var paths = Object.keys(action.parameterSchema.path)
                    var prefixedPaths = paths.map((path) => {
                        return `path.${path}`
                    })

                    if(pathArray.length > 0){
                        pathArray = [...pathArray, ...prefixedPaths]
                    } else {
                        pathArray.push(...prefixedPaths)
                    }
                }
                if (action?.parameterSchema?.header && outputPaths.length == 0) {
                    var paths = Object.keys(action.parameterSchema.header)
                    var prefixedPaths = paths.map((path) => {
                        return `header.${path}`
                    })
                    if(pathArray.length > 0){
                        pathArray = [...pathArray, ...prefixedPaths]
                    } else {
                        pathArray.push(...prefixedPaths)
                    }
                }
                setOutputPaths(pathArray)
            } 
            if (sourceNode?.id == 'trigger' && nodeActions['trigger']?.requestBody2?.schema && inputPaths.length == 0) {
                var paths = processPaths(nodeActions['trigger'].requestBody2.schema)
                setInputPaths(paths)
                console.log("Webhook Trigger")
            } else if (nodeActions[sourceNode?.id]?.responses && Object.keys(nodeActions[sourceNode?.id]?.responses[0]?.schema).length > 0 && inputPaths.length == 0) {
                var paths = processPaths(nodeActions[sourceNode?.id]?.responses[0]?.schema)
                setInputPaths(paths)
                console.log(paths)
            } 
     }, [action, nodeActions, sourceNode, targetNode, inputPaths, outputPaths,selectedEdge])

    useEffect (() => {

        if (!requiredPropertyObjects || !optionalPropertyObjects){
                processProperties()
        }
        
    }, [requiredPropertyObjects, optionalPropertyObjects, processProperties])

    useEffect (() => {
  
        var requiredMappingsSet = 0
        var optionalMappingsSet = 0

        if(mappings[targetNode?.id] && requiredPropertyObjects && optionalPropertyObjects){
            var propertyKeys = Object.keys(mappings[targetNode?.id])
            var propertyValues = Object.values(mappings[targetNode?.id])
            propertyKeys.forEach((key, index) => {
                if(propertyValues[index]?.input?.actionId == nodeActions[sourceNode.id]?.uuid && propertyValues[index]?.output?.actionId == nodeActions[targetNode.id]?.uuid || propertyValues[index]?.input?.path.includes('$variable') && propertyValues[index]?.output?.actionId == nodeActions[targetNode.id]?.uuid || propertyValues[index]?.input?.path.includes('$credential') && propertyValues[index]?.output?.actionId == nodeActions[targetNode.id]?.uuid){
                    requiredPropertyObjects.filter((property) => {
                 
                        if(property.path == key){
                            requiredMappingsSet++
                        }
                    })
                    optionalPropertyObjects.filter((property) => {
                        if(property.path == key){
                            optionalMappingsSet++
                        }
                    })
                } 
            })
        }
        setRequiredMapped(requiredMappingsSet)
        setOptionalMapped(optionalMappingsSet)

    }, [requiredPropertyObjects, optionalPropertyObjects, mappings,targetNode?.id])

    const renderPropertyMappingAccordions = (propertyType) => {

        var propertyObjects = propertyType == 'required' ? requiredPropertyObjects : optionalPropertyObjects
        
            return !propertyObjects ? (
                <Loader/>
            ) : propertyObjects.length == 0 ? (
                <div>
                    {
                        propertyType == 'required' ? (
                            <Text>No Required Properties</Text> 
                        )    : (
                            <Text>No Optional Properties</Text>
                        )
                    
                    }
                </div>
            ) : (
                propertyObjects.map((property, index) => {
                    return (
                        <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center',paddingTop: 12}}>
                            <Container className={selectedMapping?.targetProperty?.path == property.path ? 'active' : ''} sx={{
                                borderRadius: 4, 
                                width: 560,
                                display:'flex',
                                justifyContent: 'center',
                                border: '1px solid #F2F0EC',
                                '&.active': {
                                    border: '1px solid #000000',
                                    display:'block',
                                    alignItems: 'center'
                                }
                                }}>
                                <Container
                                    value={property.path}
                                    onClick={()=>{
                                        if(mappings[targetNode?.id] && mappings[targetNode?.id][property.path]){
                                            var mapping = mappings[targetNode?.id][property.path]
                                            setSelectedMapping({targetProperty: mapping.output, sourceProperty: mapping.input})
                                        } else {
                                            if(property.schema){
                                                const targetProperty = {
                                                    ...property.schema,
                                                    path: property.path,
                                                    key: property.key,
                                                    name: property.name,
                                                    required: property.required,
                                                    in: property.in ? property.in : null
                                                }
                                                setSelectedMapping({targetProperty: targetProperty, sourceProperty: {}})
                                            } else {
                                                setSelectedMapping({targetProperty: property, sourceProperty: {}})
                                            }
                                        }
                                    }}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'transparent'
                                        },
                                        backgroundColor: 'transparent',
                                        width: '100%', 
                                        height: 48,
                                        borderRadius: 4, 
                                        display: 'flex', 
                                        flexDirection: 'row',
                                        justifyContent: 'center', 
                                        alignItems: 'center'
                                    }}
                                        >
                                    <div style={{width: 250, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                    {
                                        selectedMapping?.targetProperty?.path == property.path && selectedMapping?.sourceProperty?.path ? (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#F2F0ED',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250,
                                            }}>  
                                            <ActionIcon
                                                    sx={{
                                                        width: '10%',
                                                        justifyContent:'left',
                                                        marginLeft: 8,
                                                        
                                                    }}
                                                    onClick={() =>{
                                                       var newMappings = {...mappings}
                                                        delete newMappings[targetNode?.id][property.path]
                                                        setMappings(newMappings)    
                                                    }}
                                                    >
                                                    <RiCloseCircleFill style={{color:'#000000'}} />
                                                </ActionIcon>    
                                                <Tooltip withinPortal={true} 
                                                    color={'#000000'}
                                                    label={
                                                        <Text sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 100,
                                                            color: 'white',
                                                        }}>
                                                            {selectedMapping?.sourceProperty?.path}
                                                        </Text>
                                                    } placement="top">           
                                                    <Text style={{marginRight: 34, display:'flex', width: '90%',fontFamily: 'Visuelt', fontWeight: 100, color: 'black', justifyContent:'center'}}>{selectedMapping?.sourceProperty?.path.split('.').length > 2 ? selectedMapping?.sourceProperty?.path.split('.')[0] + " [...] " + selectedMapping?.sourceProperty?.path.split('.').pop() : selectedMapping?.sourceProperty?.path}</Text> 
                                                </Tooltip>
                                            </div>
                                        ) : mappings[targetNode?.id] && mappings[targetNode?.id][property.path] && mappings[targetNode?.id][property.path].output?.actionId == nodeActions[targetNode.id].uuid ? (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#F2F0ED',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250,
                                            }}>  

                                                <ActionIcon
                                                    sx={{
                                                        width: '10%',
                                                        justifyContent:'left',
                                                        marginLeft: 8,
                                                        
                                                    }}
                                                    onClick={() =>{
                                                       var newMappings = {...mappings}
                                                        delete newMappings[targetNode?.id][property.path]
                                                        setMappings(newMappings)    
                                                    }}
                                                    >
                                                    <RiCloseCircleFill style={{color:'#000000'}} />
                                                </ActionIcon>    
                                                {
                                                    mappings[targetNode?.id][property.path]?.sourcePath ? (
                                                        <Tooltip 
                                                            withinPortal={true} 
                                                            color={'#000000'}
                                                            label={
                                                                <Text sx={{
                                                                    fontFamily: 'Visuelt',
                                                                    fontWeight: 100,
                                                                    color: 'white',
                                                                }}>
                                                                    {mappings[targetNode?.id][property.path]?.sourcePath}
                                                                </Text>
                                                                } 
                                                            placement="top">      
                                                            <Text truncate={true} style={{marginRight: 34, display:'flex', width: '90%',fontFamily: 'Visuelt', fontWeight: 100, color: 'black', justifyContent:'center'}}>{mappings[targetNode?.id][property.path]?.sourcePath.split('.').length > 2 ? mappings[targetNode?.id][property.path]?.sourcePath.split('.')[0] + " [...] " + mappings[targetNode?.id][property.path]?.sourcePath.split('.').pop() : mappings[targetNode?.id][property.path]?.sourcePath}</Text> 
                                                        </Tooltip>
                                                    ) : (
                                                        null
                                                    )
                                                }
                                                 
                                            </div>
                                        ) : mappingSuggestions && mappingSuggestions[property.path] ? (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#FFF0DB',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250,
                                                
                                            }}>
                                                <div style={{width: '100%', display:'flex', flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
                                                    <ActionIcon
                                                        sx={{
                                                            width: '5%',
                                                            position:'absolute',
                                                            left: 0,
                                                        }}
                                                        onClick={() =>{
                                                            var newMappingSuggestions = {...mappingSuggestions}
                                                            delete newMappingSuggestions[property.path]
                                                            setMappingSuggestions(newMappingSuggestions)
                                                        }}
                                                    >
                                                        <RiCloseCircleFill style={{color:'#FFC069'}} />
                                                    </ActionIcon>
                                                    
                                                    <Tooltip color={'#FFC069'} withinPortal={true} label={  
                                                        <Text 
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 100,
                                                                color: 'black'
                                                            }}>
                                                                {mappingSuggestions[property.path]}
                                                        </Text>
                                                        } position="top"> 
                                                        <Text truncate={true} style={{justifyContent: 'center',display:'flex', flexDirection:'row', width: '95%', fontFamily: 'Visuelt', fontWeight: 100, color: 'black'}}>{mappingSuggestions[property.path].split('.').length > 2 ? mappingSuggestions[property.path].split('.')[0] + " [...] " + mappingSuggestions[property.path].split('.').pop() : mappingSuggestions[property.path]}</Text>
                                                    </Tooltip>
                                                </div>
                                             
                                            </div>

                                        ) : (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#FFFFFF',
                                                border: '1px dashed #5A5A5A',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250
                                            }}>          
                                                <Text style={{fontFamily: 'Visuelt', fontWeight: 100}}>Not Mapped</Text> 
                                            </div>

                                        )
                                    }
                                    </div>
                                    <div style={{paddingRight: 2, paddingLeft:2}}>
                                        <RxArrowRight color={'black'} style={{height: 20, width: 40}}/>
                                    </div>
                                    <div style={{width: 250, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <div style={{backgroundColor: '#F2F0ED', width: 250, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <Tooltip withinPortal={true} 
                                            color={'#000000'}
                                            label={
                                                <Text sx={{
                                                    fontFamily: 'Visuelt',
                                                    fontWeight: 100,
                                                    color: 'white',
                                                }}>
                                                    {property.path}
                                                </Text>
                                            } placement="top">    
                                                <Text truncate style={{fontFamily: 'Visuelt', fontSize: '14px', fontWeight: 100, color: 'black'}}>{property.path.split('.').length > 2 ? property.path.split('.')[0] + " [...] " + property.path.split('.').pop() : property.path} </Text>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Container>
                                {selectedMapping?.targetProperty?.path == property.path && (
                                    <div style={{width: '100%', paddingBottom: 5, display:'flex', flexDirection:'center', justifyContent: 'center', alignItems:'center'}}>

                                        {
                                        mappingSuggestions && mappingSuggestions[property.path] ?
                                        ( 
                                            <Button onClick={(e)=>{
                                                var sourceProperty = getSchemaFromPath(mappingSuggestions[property.path])
                                                var targetProperty = property
                                                setSelectedMapping({sourceProperty, targetProperty})
                                                toggleMappingModal(e)
                                                delete mappingSuggestions[property.path]
                                                
                                                }} style={{width: '100%', height: 50, borderRadius: 8, backgroundColor: '#FFC069'}}>
                                                    <AiOutlineCheck size={20} color={'black'} />
                                                    <div style={{width: 10}}/>
                                                    <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'black'}}>Confirm Suggestion</Text>
                                                </Button>
                                        ) : (
                                            <Button onClick={(e)=>{toggleMappingModal(e)}} style={{width: '100%', height: 50, borderRadius: 8, backgroundColor: 'black'}}>
                                                
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'white'}}>{
                                                    mappings[targetNode?.id] && mappings[targetNode?.id][property.path] ? "Edit Mapping"
                                                    : selectedMapping?.sourceProperty?.path ? 'Map Properties' 
                                                    : 'Configure Property'
                                                }</Text>
                                            </Button>   
                                            )
                                        
                                        }

   
                                    </div>   
                                 ) }
                            </Container>
                        </div>
                )})) 

    }  
    
    const renderConfigurationMappingAccordions = () => {
        var configurationObjects =  partnership?.configuration
        var configurationKeys = partnership?.configuration ? Object.keys(partnership?.configuration) : []
        var configurationValues =  partnership?.configuration ? Object.values(partnership?.configuration): []
    
            return !configurationObjects ? (
                <div>
                    <Text>No Partnership Configurations</Text>
               </div>
            ) : (
                configurationKeys.map((config, index) => {

                    var configPath = '$variable.'+config
                    return (
                        <div key={configPath} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center',paddingTop: 12}}>
                            <Container className={selectedMapping?.targetProperty?.path == configPath ? 'active' : ''} sx={{
                                borderRadius: 4, 
                                width: 560,
                                display:'flex',
                                justifyContent: 'center',
                                border: '1px solid #F2F0EC',
                                '&.active': {
                                    border: '1px solid #000000',
                                    display:'block',
                                    alignItems: 'center'
                                }
                                }}>
                                <Container
                                    value={configPath}
                                    onClick={()=>{
                                        if(mappings[targetNode?.id] && mappings[targetNode?.id][configPath]){
                                            var mapping = mappings[targetNode?.id][configPath]
                                            setSelectedMapping({targetProperty: mapping.output, sourceProperty: mapping.input})
                                        } else {
                                                const targetConfig = {
                                                    path: configPath,
                                                    key: config,
                                                    name: config,
                                                    required: false,
                                                    type: configurationValues[index].type,
                                                    value: configurationValues[index].value,
                                                    in: 'configuration'
                                                }
                                                setSelectedMapping({targetProperty: targetConfig, sourceProperty: {}})
                                        }
                                    }}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'transparent'
                                        },
                                        backgroundColor: 'transparent',
                                        width: '100%', 
                                        height: 48,
                                        borderRadius: 4, 
                                        display: 'flex', 
                                        flexDirection: 'row',
                                        justifyContent: 'center', 
                                        alignItems: 'center'
                                    }}
                                        >
                                    <div style={{width: 250, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                    {
                                        selectedMapping?.targetProperty?.path == configPath && selectedMapping?.sourceProperty?.path ? (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#F2F0ED',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250,
                                            }}>  
                                            <ActionIcon
                                                    sx={{
                                                        width: '10%',
                                                        justifyContent:'left',
                                                        marginLeft: 8,
                                                        
                                                    }}
                                                    onClick={() =>{
                                                       var newMappings = {...mappings}
                                                        delete newMappings[targetNode?.id][configPath]
                                                        setMappings(newMappings)    
                                                    }}
                                                    >
                                                    <RiCloseCircleFill style={{color:'#000000'}} />
                                                </ActionIcon>    
                                                <Tooltip withinPortal={true} 
                                                    color={'#000000'}
                                                    label={
                                                        <Text sx={{
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 100,
                                                            color: 'white',
                                                        }}>
                                                            {selectedMapping?.sourceProperty?.path}
                                                        </Text>
                                                    } placement="top">           
                                                    <Text style={{marginRight: 34, display:'flex', width: '90%',fontFamily: 'Visuelt', fontWeight: 100, color: 'black', justifyContent:'center'}}>{selectedMapping?.sourceProperty?.path.split('.').length > 2 ? selectedMapping?.sourceProperty?.path.split('.')[0] + " [...] " + selectedMapping?.sourceProperty?.path.split('.').pop() : selectedMapping?.sourceProperty?.path}</Text> 
                                                </Tooltip>
                                            </div>
                                        ) : mappings[targetNode?.id] && mappings[targetNode?.id][configPath] && mappings[targetNode?.id][configPath].output?.actionId == nodeActions[targetNode.id].uuid ? (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#F2F0ED',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250,
                                            }}>  

                                                <ActionIcon
                                                    sx={{
                                                        width: '10%',
                                                        justifyContent:'left',
                                                        marginLeft: 8,
                                                        
                                                    }}
                                                    onClick={() =>{
                                                       var newMappings = {...mappings}
                                                        delete newMappings[targetNode?.id][configPath]
                                                        setMappings(newMappings)    
                                                    }}
                                                    >
                                                    <RiCloseCircleFill style={{color:'#000000'}} />
                                                </ActionIcon>    
                                                {
                                                    mappings[targetNode?.id][configPath]?.sourcePath ? (
                                                        <Tooltip 
                                                            withinPortal={true} 
                                                            color={'#000000'}
                                                            label={
                                                                <Text sx={{
                                                                    fontFamily: 'Visuelt',
                                                                    fontWeight: 100,
                                                                    color: 'white',
                                                                }}>
                                                                    {mappings[targetNode?.id][configPath]?.sourcePath}
                                                                </Text>
                                                                } 
                                                            placement="top">      
                                                            <Text truncate={true} style={{marginRight: 34, display:'flex', width: '90%',fontFamily: 'Visuelt', fontWeight: 100, color: 'black', justifyContent:'center'}}>{mappings[targetNode?.id][configPath]?.sourcePath.split('.').length > 2 ? mappings[targetNode?.id][configPath]?.sourcePath.split('.')[0] + " [...] " + mappings[targetNode?.id][configPath]?.sourcePath.split('.').pop() : mappings[targetNode?.id][configPath]?.sourcePath}</Text> 
                                                        </Tooltip>
                                                    ) : (
                                                        null
                                                    )
                                                }
                                                 
                                            </div>
                                        ) : mappingSuggestions && mappingSuggestions[configPath] ? (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#FFF0DB',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250,
                                                
                                            }}>
                                                <div style={{width: '100%', display:'flex', flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
                                                    <ActionIcon
                                                        sx={{
                                                            width: '5%',
                                                            position:'absolute',
                                                            left: 0,
                                                        }}
                                                        onClick={() =>{
                                                            var newMappingSuggestions = {...mappingSuggestions}
                                                            delete newMappingSuggestions[configPath]
                                                            setMappingSuggestions(newMappingSuggestions)
                                                        }}
                                                    >
                                                        <RiCloseCircleFill style={{color:'#FFC069'}} />
                                                    </ActionIcon>
                                                    
                                                    <Tooltip color={'#FFC069'} withinPortal={true} label={  
                                                        <Text 
                                                            sx={{
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 100,
                                                                color: 'black'
                                                            }}>
                                                                {mappingSuggestions[configPath]}
                                                        </Text>
                                                        } position="top"> 
                                                        <Text truncate={true} style={{justifyContent: 'center',display:'flex', flexDirection:'row', width: '95%', fontFamily: 'Visuelt', fontWeight: 100, color: 'black'}}>{mappingSuggestions[configPath].split('.').length > 2 ? mappingSuggestions[configPath].split('.')[0] + " [...] " + mappingSuggestions[configPath].split('.').pop() : mappingSuggestions[configPath]}</Text>
                                                    </Tooltip>
                                                </div>
                                             
                                            </div>

                                        ) : (
                                            <div style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#FFFFFF',
                                                border: '1px dashed #5A5A5A',
                                                borderRadius: 4,
                                                height: 35,
                                                display:'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 250
                                            }}>          
                                                <Text style={{fontFamily: 'Visuelt', fontWeight: 100}}>Not Mapped</Text> 
                                            </div>

                                        )
                                    }
                                    </div>
                                    <div style={{paddingRight: 2, paddingLeft:2}}>
                                        <RxArrowRight color={'black'} style={{height: 20, width: 40}}/>
                                    </div>
                                    <div style={{width: 250, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <div style={{backgroundColor: '#F2F0ED', width: 250, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <Tooltip withinPortal={true} 
                                            color={'#000000'}
                                            label={
                                                <Text sx={{
                                                    fontFamily: 'Visuelt',
                                                    fontWeight: 100,
                                                    color: 'white',
                                                }}>
                                                    {configPath}
                                                </Text>
                                            } placement="top">    
                                                <Text truncate style={{fontFamily: 'Visuelt', fontSize: '14px', fontWeight: 100, color: 'black'}}>{configPath.split('.').length > 2 ? configPath.split('.')[0] + " [...] " + configPath.split('.').pop() : configPath} </Text>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Container>
                                {selectedMapping?.targetProperty?.path == configPath && (
                                    <div style={{width: '100%', paddingBottom: 5, display:'flex', flexDirection:'center', justifyContent: 'center', alignItems:'center'}}>

                                        {
                                        mappingSuggestions && mappingSuggestions[configPath] ?
                                        ( 
                                            <Button onClick={(e)=>{
                                                var sourceProperty = getSchemaFromPath(mappingSuggestions[configPath])
                                                var targetProperty = property
                                                setSelectedMapping({sourceProperty, targetProperty})
                                                toggleMappingModal(e)
                                                delete mappingSuggestions[configPath]
                                                
                                                }} style={{width: '100%', height: 50, borderRadius: 8, backgroundColor: '#FFC069'}}>
                                                    <AiOutlineCheck size={20} color={'black'} />
                                                    <div style={{width: 10}}/>
                                                    <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'black'}}>Confirm Suggestion</Text>
                                                </Button>
                                        ) : (
                                            <Button onClick={(e)=>{toggleMappingModal(e)}} style={{width: '100%', height: 50, borderRadius: 8, backgroundColor: 'black'}}>
                                                
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'white'}}>{
                                                    mappings[targetNode?.id] && mappings[targetNode?.id][configPath] ? "Edit Mapping"
                                                    : selectedMapping?.sourceProperty?.path ? 'Map Properties' 
                                                    : 'Configure Property'
                                                }</Text>
                                            </Button>   
                                            )
                                        
                                        }

   
                                    </div>   
                                 ) }
                            </Container>
                        </div>
                )})) 

    }  
    

    const fetchMappingSuggestions = () => {

        //var promptPrefix = " Provided dot delimited paths to "+ requiredCount +" output data schema properties provide a single dot delimited path from the input schema array that maps best to each output dot delimited property path. Only respond with a parseable JSON dictionary object with this definition {  {{OUTPUT SCHEMA PROPERTY PATH}}: {{INPUT SCHEMA PROPERTY PATH}} }} }.  Neither the output or input property will be an array or an object. The result should only have one key value pair for each of the "+requiredCount+" output property paths. The input and output paths provided should not be altered in the response."
        var promptPrefix = "You are a helpful assistant that takes "+requiredCount+" key strings and matches them to value strings based on the meanings of the words and dot-notation when provided two arrays of strings: a value array and a key array.  Do not change the strings in either array in your suggestions in any way.  When you receive these arrays, only respond with a parseable JSON dictionary where each entry has an item from the key array and an item from the value array. Only provide a parseable JSON object."
        var requiredOutputPaths = []
        requiredPropertyObjects.forEach((property) => {
            requiredOutputPaths.push(property.path)
        })
        
        var inputSchema = "This is the value path array: " + JSON.stringify(inputPaths)       
        var outputSchema = " This is the key path array: " + JSON.stringify(requiredOutputPaths)
        var prompt = promptPrefix + outputSchema + inputSchema

        getMappingSuggestions(prompt, inputSchema, outputSchema)

    }


    return (
        <div style={{padding: 12}}>
            <div style={{display: 'flex', alignItems: 'center', marginTop:-22}}>
                <Image alt="mapping" src={mappingIcon} style={{height: 30, width: 30, marginRight: 10, filter: 'invert(0%) sepia(1%) saturate(7461%) hue-rotate(43deg) brightness(113%) contrast(100%)'}}/>
                <Text style={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500}}>Schema Mapping </Text>
            </div>
            <div style={{height: 20}}/>
            <Divider/>
            <Text style={{paddingTop: 20, paddingBottom: 20, fontFamily: 'Visuelt', fontSize: '15px', fontWeight: 300, color: 'grey'}}>Below are all of the required and optional properties for {action?.name}. The API documentation indicates that all of the required properties must have a value mapped or set - not doing so will likely result in failure.</Text>   
            {
                nodeActions[sourceNode?.id]?.responses && Object.keys(nodeActions[sourceNode?.id]?.responses[0]?.schema).length > 0 || sourceNode?.id == 'trigger' && nodeActions['trigger']?.requestBody2?.schema ? (
                        <Button 
                        loading={ areSuggestionsLoading}
                        onClick={()=>{
                           fetchMappingSuggestions()
                        }}
                        leftIcon={
                            <div style={{height:15, width: 15}}>
                                <Image src={blackLogoIcon} />
                            </div>
                        } variant="outline" 
                        sx={{
                            centerLoader: {
                                color: 'black',
                            },
                            color: 'black',
                            fontFamily: 'Visuelt',
                            fontWeight: 300,
                            fontSize: '16px',
                            height: 50,
                            borderRadius: 5,
                            border: '1px solid #000000',
                            backgroundColor: 'white',
                           
                            ':hover': {
                                backgroundColor: '#FBFAF9',
                                border: '1px solid #262626',
                            }

                        }}>
                        {
                            areSuggestionsLoading ? (
                                <Text style={{fontFamily: 'Vulf Sans', fontSize: '16px', fontWeight: 300}}>
                                    Thinking...
                                </Text>
                            ) : (
                                <Text style={{fontFamily: 'Vulf Sans', fontSize: '16px', fontWeight: 400}}>
                                    Suggest Mappings
                                </Text>
                            )
                        }
                    
                        </Button>
                    
                ) : (
                    null
                )
            }
          
            <div style={{height:20}}/>
            <Accordion variant="separated" defaultValue="required">
                <Accordion.Item value="required">
                <Accordion.Control>
                    <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Required Properties</Text>
                    <Text style={{fontFamily:'Visuelt'}}>{requiredMapped}/{requiredCount}</Text>
                </Accordion.Control>
                    <Accordion.Panel>
                    <div style={{paddingBottom: 20, display: 'flex', flexDirection: 'column'}}>
                    <ScrollArea.Autosize maxHeight={700} width={50}>
                        {renderPropertyMappingAccordions('required')}
                    </ScrollArea.Autosize>
                    </div>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="optional">
                    <Accordion.Control>
                        <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Optional Properties</Text>
                        <Text style={{fontFamily:'Visuelt'}}>{optionalMapped}/{optionalCount}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <ScrollArea.Autosize maxHeight={700} width={50}>
                            {renderPropertyMappingAccordions('optional')}
                        </ScrollArea.Autosize>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="partnerConfigurations">
                    <Accordion.Control>
                        <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Partner Configurations</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <ScrollArea.Autosize maxHeight={700} width={50}>
                            {renderConfigurationMappingAccordions()}
                        </ScrollArea.Autosize>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>

        </div>
    )
}

export default SchemaMappingDrawer