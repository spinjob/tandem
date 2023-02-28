import {Text, Divider, Button, Container, UnstyledButton, Tooltip, Accordion, Loader, ScrollArea, ActionIcon} from '@mantine/core'
import { useEffect, useState } from 'react'
import {RxArrowRight} from 'react-icons/rx'
import {BiBrain} from 'react-icons/bi'
import useStore from '../../context/store'
import axios from 'axios'

const SchemaMappingDrawer = ({action, toggleMappingModal, sourceNode, targetNode, nodes}) => {

    const [requiredCount, setRequiredCount] = useState(0)
    const [optionalCount, setOptionalCount] = useState(0)
    const [requiredMapped, setRequiredMapped] = useState(0)
    const [optionalMapped, setOptionalMapped] = useState(0)
    const [requiredPropertyObjects, setRequiredPropertyObjects] = useState(null)
    const [optionalPropertyObjects, setOptionalPropertyObjects] = useState(null)
    const setActionProperties = useStore(state => state.setActionProperties)
    const actionProperties = useStore(state => state.actionProperties)
    const selectedMapping = useStore(state => state.selectedMapping)
    const setSelectedMapping = useStore(state => state.setSelectedMapping)
    const selectedEdge = useStore(state => state.selectedEdge)
    const mappings = useStore(state => state.mappings)
    const selectedAdaption = useStore(state => state.selectedAdaption)
    
    const getMappingSuggestions = () => {

        const promptPrefix = " Provided an input and output data schema (labeled 'input_schema' and 'output_schema') provide mappings between the input and output schema. Only respond with an array of JSON Objects with this definition { inputProperty: $inputPropertyJSONPath, outputProperty: $outputPropertyJSONPath}."
        var inputSchema = " input_schema: " + JSON.stringify(sourceNode?.data?.selectedAction?.responses[0]?.schema)
        var outputSchema = " output_schema: " + JSON.stringify(action.requestBody2.schema)
        var prompt = promptPrefix + inputSchema + outputSchema

        // axios.post(process.env.NEXT_PUBLIC_OPEN_AI_API_URL, {
        //     "model": "text-davinci-003",
        //     "prompt": prompt,
        //     "max_tokens": 1000,
        //     "temperature": 0,
        //     "top_p": 1,
        //     "n": 1,
        //     "stream": false,
        //     "logprobs": null,
        // },{
        //     headers: {
        //         "Authorization": "Bearer " + process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
        // }}).then((response) => {
        //     console.log(response.data)
        // }).catch((error) => {
        //     console.log(error)
        // }
        // )
    }


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

    const processNestedProperties = (properties, parent) => {
        const nestedPropertyKeys = Object.keys(properties)
        const nestedPropertyValues = Object.values(properties)
        const nestedPropertyObjects = nestedPropertyKeys.map((key, index) => {
            return {
                key: key,
                path: parent + "." + key,
                ...nestedPropertyValues[index]
            }
        })
        const requiredNestedPropertyArray = []
        const optionalNestedPropertyArray = []

        nestedPropertyObjects.forEach((property) => {
            if(property.required) {
                requiredNestedPropertyArray.push(property)
                if(property.properties){
                    var {required} = processNestedProperties(property.properties, parent+ "." + property.key)
                    var {optional} = processNestedProperties(property.properties, parent+ "." + property.key)
                    requiredNestedPropertyArray.push(...required)
                    optionalNestedPropertyArray.push(...optional)
                }
                if(property.items){
                    if(property.items.properties){
                        var {required} = processNestedProperties(property.items.properties, property.key)
                        var {optional} = processNestedProperties(property.items.properties, property.key)
                        requiredNestedPropertyArray.push(...required)
                        optionalNestedPropertyArray.push(...optional)
                    } else {
                        requiredNestedPropertyArray.push(property)
                    }
                }
            } else {
                if(property.properties){
                    processNestedProperties(property.properties)
                    var {required} = processNestedProperties(property.properties, parent+ "." + property.key)
                    var {optional} = processNestedProperties(property.properties, parent+ "." + property.key)
                    optionalNestedPropertyArray.push(...required, ...optional)
                } if(property.items){
                    if(property.items.properties){
                        var {required} = processNestedProperties(property.items.properties, property.key)
                        var {optional} = processNestedProperties(property.items.properties, property.key)
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
        })

        const optionalNestedPropertyArrayWithParentContext = optionalNestedPropertyArray.map((property) => {
            return {
                ...property,
                parentContext: getParentContext(property.path, action.requestBody2.schema)
            }
        })
        
        return {required: requiredNestedPropertyArrayWithParentContext, optional: optionalNestedPropertyArrayWithParentContext}
    }

    const processProperties = () => {
        const requiredPropertyArray = []
        const optionalPropertyArray = []
        
        if(action?.requestBody2?.schema){
            const propertyKeys = Object.keys(action.requestBody2.schema)
            const propertyValues = Object.values(action.requestBody2.schema)
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
                        } else if(property.items){
                            if(property.items.properties){
                                var {required} = processNestedProperties(property.items.properties, property.key)
                                var {optional} = processNestedProperties(property.items.properties, property.key)
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
                        var {required} = processNestedProperties(property.properties, property.key)
                        var {optional} = processNestedProperties(property.properties, property.key)
                        optionalPropertyArray.push(...required, ...optional)
                    } else if(property.items){
                        if(property.items.properties){
                            var {required} = processNestedProperties(property.items.properties, property.key)
                            var {optional} = processNestedProperties(property.items.properties, property.key)
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
 

    useEffect (() => {
        console.log("Use Effect: Null Property Objects")
        if (!requiredPropertyObjects || !optionalPropertyObjects){
                processProperties()
        }
        
    }, [requiredPropertyObjects, optionalPropertyObjects])

    useEffect (() => {
        console.log("Use Effect: Property Mapping Counts")
        var requiredMappingsSet = 0
        var optionalMappingsSet = 0

        if(mappings[targetNode?.id] && requiredPropertyObjects && optionalPropertyObjects){
            var propertyKeys = Object.keys(mappings[targetNode?.id])

            propertyKeys.forEach((key) => {
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
            })
        }
        setRequiredMapped(requiredMappingsSet)
        setOptionalMapped(optionalMappingsSet)

    }, [requiredPropertyObjects, optionalPropertyObjects, mappings])

    const renderPropertyMappingAccordions = (propertyType) => {
        
          if(propertyType == 'required')  
          {
            return !requiredPropertyObjects ? (
                <Loader/>
            ) : requiredPropertyObjects.length == 0 ? (
                <div>
                    <Text>No Required Properties</Text>
                </div>
            ) : (
                requiredPropertyObjects.map((property, index) => {
                    return (
                        <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center',paddingTop: 12}}>
                            <Container className={selectedMapping?.targetProperty?.path == property.path ? 'active' : ''} sx={{
                                borderRadius: 4, 
                                width: 440,
                                display:'flex',
                                justifyContent: 'center',
                                border: '1px solid #F2F0EC',
                                '&.active': {
                                    border: '1px solid #000000',
                                    display:'block',
                                    alignItems: 'center'
                                }
                                }}>
                                <Button
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
                                                setSelectedMapping({targetProperty: targetProperty})
                                            } else {
                                                setSelectedMapping({targetProperty: property})
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
                                    <div style={{width: 200, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
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
                                                width: 180
                                            }}>          
                                                <Text style={{fontFamily: 'Visuelt', fontWeight: 100, color: 'black'}}>{selectedMapping?.sourceProperty?.path}</Text> 
                                            </div>
                                        ) : mappings[targetNode?.id] && mappings[targetNode?.id][property.path] ? (
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
                                                width: 180
                                            }}>          
                                                <Text truncate={true} style={{fontFamily: 'Visuelt', fontWeight: 100, color: 'black'}}>{mappings[targetNode?.id][property.path]?.sourcePath}</Text> 
                                            </div>
                                        )
                                        : (
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
                                                width: 180
                                            }}>          
                                                <Text style={{fontFamily: 'Visuelt', fontWeight: 100}}>Not Mapped</Text> 
                                            </div>

                                        )
                                    }
                                    </div>
                                    <div style={{paddingRight: 2, paddingLeft:2}}>
                                        <RxArrowRight color={'black'} style={{height: 20, width: 40}}/>
                                    </div>
                                    <div style={{width: 200, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <Tooltip withinPortal={true} label={property.path} placement="top">    
                                                <Text truncate style={{fontFamily: 'Visuelt', fontSize: '14px', fontWeight: 100, color: 'black'}}>{property.path.split('.').length > 2 ? property.path.split('.')[0] + " [...] " + property.path.split('.').pop() : property.path} </Text>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Button>
                                {selectedMapping?.targetProperty?.path == property.path && (
                                    <div style={{width: '100%', paddingBottom: 5, display:'flex', flexDirection:'center', justifyContent: 'center', alignItems:'center'}}>
                                        <Button onClick={(e)=>{toggleMappingModal(e)}} style={{width: 480, height: 50, borderRadius: 8, backgroundColor: 'black'}}>
                                            <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'white'}}>{
                                                mappings[targetNode?.id] && mappings[targetNode?.id][property.path] ? "Edit Mapping"
                                                : selectedMapping?.sourceProperty?.path ? 'Map Properties' 
                                                : 'Configure Property'
                                            }</Text>
                                       </Button>      
                                    </div>   
                                 ) }
                            </Container>
                        </div>
                )})) 
         } else {
            return !optionalPropertyObjects ? (
                <Loader/>
            ) : optionalPropertyObjects.length == 0 ? (
                <div>
                    <Text>No Optional Properties</Text>
                </div>
            ) : (
                optionalPropertyObjects.map((property, index) => {
                    return (
                        <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center',paddingTop: 12}}>
                            <Container className={selectedMapping?.targetProperty?.path == property.path ? 'active' : ''} sx={{
                                borderRadius: 4, 
                                width: 440,
                                display:'flex',
                                justifyContent: 'center',
                                border: '1px solid #F2F0EC',
                                '&.active': {
                                    border: '1px solid #000000',
                                    display:'block',
                                    alignItems: 'center'
                                }
                                }}>
                                <Button
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
                                                setSelectedMapping({targetProperty: targetProperty})
                                            } else {
                                                setSelectedMapping({targetProperty: property})
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
                                    <div style={{width: 200, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
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
                                                width: 180
                                            }}>          
                                                <Text style={{fontFamily: 'Visuelt', fontWeight: 100, color: 'black'}}>{selectedMapping?.sourceProperty?.path}</Text> 
                                            </div>
                                        ) : mappings[targetNode?.id] && mappings[targetNode?.id][property.path] ? (
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
                                                width: 180
                                            }}>          
                                                <Text truncate={true} style={{fontFamily: 'Visuelt', fontWeight: 100, color: 'black'}}>{mappings[targetNode?.id][property.path]?.sourcePath}</Text> 
                                            </div>
                                        )
                                        : (
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
                                                width: 180
                                            }}>          
                                                <Text style={{fontFamily: 'Visuelt', fontWeight: 100}}>Not Mapped</Text> 
                                            </div>

                                        )
                                    }
                                    </div>
                                    <div style={{paddingRight: 2, paddingLeft:2}}>
                                        <RxArrowRight color={'black'} style={{height: 20, width: 40}}/>
                                    </div>
                                    <div style={{width: 200, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <Tooltip withinPortal={true} label={property.path} placement="top">    
                                                <Text truncate style={{fontFamily: 'Visuelt', fontSize: '14px', fontWeight: 100, color: 'black'}}>{property.path.split('.').length > 2 ? property.path.split('.')[0] + " [...] " + property.path.split('.').pop() : property.path} </Text>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Button>
                                {selectedMapping?.targetProperty?.path == property.path && (
                                    <div style={{width: '100%', paddingBottom: 5, display:'flex', flexDirection:'center', justifyContent: 'center', alignItems:'center'}}>
                                        <Button onClick={(e)=>{toggleMappingModal(e)}} style={{width: 480, height: 50, borderRadius: 8, backgroundColor: 'black'}}>
                                            <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'white'}}>{
                                                mappings[targetNode?.id] && mappings[targetNode?.id][property.path] ? "Edit Mapping"
                                                : selectedMapping?.sourceProperty?.path ? 'Map Properties' 
                                                : 'Configure Property'
                                            }</Text>
                                       </Button>      
                                    </div>   
                                 ) }
                            </Container>
                        </div>
                )})) 
         }
    }   


    return (
        <div style={{padding: 10}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent:'space-between'}}>
                <Text style={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 600}}>Schema Mapping </Text>
                <ActionIcon onClick={()=>{getMappingSuggestions()}}>
                    <BiBrain color={'black'}/>
                </ActionIcon>

            </div>

            <Divider/>
                <Text style={{padding: 20, fontFamily: 'Visuelt', fontSize: '12px', fontWeight: 400, color: 'grey'}}>Below are all of the required and optional properties for {action?.name}. The API documentation indicates that all of the required properties must have a value mapped or set - not doing so will likely result in failure.</Text>
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
                </Accordion>

        </div>
    )
}

export default SchemaMappingDrawer