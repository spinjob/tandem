import {Text, Divider, Button, Loader, ScrollArea} from '@mantine/core'
import { useEffect, useState } from 'react'
import {RxArrowRight} from 'react-icons/rx'

const SchemaMappingDrawer = ({action}) => {

    const [requiredCount, setRequiredCount] = useState(0)
    const [optionalCount, setOptionalCount] = useState(0)
    const [mappings, setMappings] = useState([])
    const [requiredPropertyObjects, setRequiredPropertyObjects] = useState(null)
    const [optionalPropertyObjects, setOptionalPropertyObjects] = useState(null)

    console.log(optionalPropertyObjects)
    console.log(requiredPropertyObjects)
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
                    var filteredRequiredArray = required.filter((item) => { 
                        return item.type !== "object" && item.type !== "array"
                    })
                    var filteredOptionalArray = optional.filter((item) => {
                        return item.type !== "object" && item.type !== "array"
                    })
                    requiredNestedPropertyArray.push(...filteredRequiredArray)
                    optionalNestedPropertyArray.push(...filteredOptionalArray)
                }
            } else {
                optionalNestedPropertyArray.push(property)
                if(property.properties){
                    processNestedProperties(property.properties)
                    var {required} = processNestedProperties(property.properties, parent+ "." + property.key)
                    var {optional} = processNestedProperties(property.properties, parent+ "." + property.key)
                    var filteredRequiredArray = required.filter((item) => { 
                        return item.type !== "object" && item.type !== "array"
                    })
                    var filteredOptionalArray = optional.filter((item) => {
                        return item.type !== "object" && item.type !== "array"
                    })
                    optionalNestedPropertyArray.push(...required, ...optional)
                }
            } 
        })
        return {required: requiredNestedPropertyArray, optional: optionalNestedPropertyArray}
    }

    const processProperties = () => {
        const propertyKeys = Object.keys(action.requestBody2.schema)
        const propertyValues = Object.values(action.requestBody2.schema)
        const propertyObjects = propertyKeys.map((key, index) => {
            return {
                key: key,
                path: key,
                ...propertyValues[index]
            }
        })
        const requiredPropertyArray = []
        const optionalPropertyArray = []

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
        
        setRequiredPropertyObjects(requiredPropertyArray)
        setOptionalPropertyObjects(optionalPropertyArray)
        setOptionalCount(optionalPropertyArray.length)
        setRequiredCount(requiredPropertyArray.length)

    }
    useEffect (() => {
        if (!requiredPropertyObjects)
        {processProperties()}
    }, [requiredPropertyObjects])

    const requiredProperties = () => {
        if(action.requestBody2) {
            return !requiredPropertyObjects ? (
                <Loader/>
            ) : (
                requiredPropertyObjects.map((property, index) => {
                    return (
                        <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12}}>
                            <div style={{width: '92%', height: 48,border: '1px solid #F2F0EC', borderRadius: 4, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                    <Button style={{
                                        fontFamily: 'Visuelt',
                                        fontWeight: 100,
                                        color: '#5A5A5A',
                                        backgroundColor: '#FFFFFF',
                                        border: '1px dashed #5A5A5A',
                                        width: 180
                                    }}>Not Mapped</Button>
                                </div>
                                <div style={{paddingRight: 2, paddingLeft:2}}>
                                    <RxArrowRight style={{height: 20, width: 40}}/>
                                </div>
                                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                    <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>{property.path}</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                )})
            )

    }}

    const optionalProperties = () => {
        if(action.requestBody2) {
            return !optionalPropertyObjects ? (
                <Loader/>
            ) :(
                optionalPropertyObjects.map((property, index) => {
                    return (
                        <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12}}>
                            <div style={{width: '92%', height: 48,border: '1px solid #F2F0EC', borderRadius: 4, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                    <Button style={{
                                        fontFamily: 'Visuelt',
                                        fontWeight: 100,
                                        color: '#5A5A5A',
                                        backgroundColor: '#FFFFFF',
                                        border: '1px dashed #5A5A5A',
                                        width: 180
                                    }}>Not Mapped</Button>
                                </div>
                                <div style={{paddingRight: 2, paddingLeft:2}}>
                                    <RxArrowRight style={{height: 20, width: 40}}/>
                                </div>
                              
                                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                    <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>{property.path}</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                )})
            )

    }}

    return (
        <div style={{padding: 10}}>
            <Text style={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 600}}>Schema Mapping </Text>
            <Divider></Divider>
                <Text style={{padding: 20, fontFamily: 'Visuelt', fontSize: '12px', fontWeight: 400, color: 'grey'}}>Below are all of the required and optional properties for {action?.name}. The API documentation indicates that all of the required properties must have a value mapped or set - not doing so will likely result in failure.</Text>
                <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: 10, display:'flex',flexDirection:'row', justifyContent: 'space-between'}}>
                    <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Required Properties</Text>
                    <Text style={{fontFamily:'Visuelt'}}>{mappings.length}/{requiredCount}</Text>
                </div>
                
                <div style={{paddingBottom: 20, display: 'flex', flexDirection: 'column'}}>
                    {requiredProperties()}
                </div>
            
                <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: 10, display:'flex',flexDirection:'row', justifyContent: 'space-between'}}>
                    <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Optional Properties</Text>
                    <Text style={{fontFamily:'Visuelt'}}>{mappings.length}/{optionalCount}</Text>
                    </div>
                    <ScrollArea.Autosize maxHeight={700} width={50}>
                   { 
                        !optionalPropertyObjects ? (
                            <Loader/>
                        ) :  optionalPropertyObjects.map((property, index) => {
                            return (
                                <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12}}>
                                    <div style={{width: '92%', height: 48,border: '1px solid #F2F0EC', borderRadius: 4, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                        <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <Button style={{
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100,
                                                color: '#5A5A5A',
                                                backgroundColor: '#FFFFFF',
                                                border: '1px dashed #5A5A5A',
                                                width: 180
                                            }}>Not Mapped</Button>
                                        </div>
                                        <div style={{paddingRight: 2, paddingLeft:2}}>
                                            <RxArrowRight style={{height: 20, width: 40}}/>
                                        </div>
                                    
                                        <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>{property.path}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>)
                            }
                        )}

                    </ScrollArea.Autosize>
                    

        </div>
    )
}

export default SchemaMappingDrawer