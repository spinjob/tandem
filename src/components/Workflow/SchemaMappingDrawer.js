import {Text, Divider, Button, Container, UnstyledButton, Loader, ScrollArea} from '@mantine/core'
import { useEffect, useState } from 'react'
import {RxArrowRight} from 'react-icons/rx'
import useStore from '../../context/store'

const SchemaMappingDrawer = ({action}) => {

    const [requiredCount, setRequiredCount] = useState(0)
    const [optionalCount, setOptionalCount] = useState(0)
    const [requiredPropertyObjects, setRequiredPropertyObjects] = useState(null)
    const [optionalPropertyObjects, setOptionalPropertyObjects] = useState(null)
    const selectedMapping = useStore(state => state.selectedMapping)
    const setSelectedMapping = useStore(state => state.setSelectedMapping)


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
        const requiredPropertyArray = []
        const optionalPropertyArray = []
        
        if(action?.requestBody2){
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
                // setRequiredPropertyObjects(requiredPropertyArray)
            }
            if(optionalPropertyObjects && optionalPropertyObjects.length > 0){
                setOptionalPropertyObjects(optionalPropertyObjects, ...optionalPropertyArray)
            } else {
                // setOptionalPropertyObjects(optionalPropertyArray)
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
                // setRequiredPropertyObjects(requiredPropertyArray)
            }
            if(optionalPropertyObjects && optionalPropertyObjects.length > 0){
                setOptionalPropertyObjects(optionalPropertyObjects, ...optionalPropertyArray)
            } else {
                // setOptionalPropertyObjects(optionalPropertyArray)
            }

        }


        setOptionalCount(optionalCount + optionalPropertyArray.length)
        setRequiredCount(requiredCount + requiredPropertyArray.length)


    }
 
    useEffect (() => {
        if (!requiredPropertyObjects)
        {processProperties()}
    }, [requiredPropertyObjects])

    const requiredProperties = () => {
        if(action?.requestBody2) {
            return !requiredPropertyObjects ? (
                <Loader/>
            ) : requiredPropertyObjects.length == 0 ? (
                <div>
                    <Text>No Optional Properties</Text>
                </div>
            ) : (
                requiredPropertyObjects.map((property, index) => {
                    return (
                        <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center',paddingTop: 12}}>
                            <Container className={selectedMapping?.path == property.path ? 'active' : ''} sx={{
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
                                        setSelectedMapping(property)
                                        console.log(property)
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
                                        }}>Not Mapped</div>
                                    </div>
                                    <div style={{paddingRight: 2, paddingLeft:2}}>
                                        <RxArrowRight color={'black'} style={{height: 20, width: 40}}/>
                                    </div>
                                    <div style={{width: 200, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                        <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <Text style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 100, color: 'black'}}>{property.path}</Text>
                                        </div>
                                    </div>
                                </Button>
                                {selectedMapping?.path == property.path && (
                                    <div style={{width: '100%', paddingBottom: 5, display:'flex', flexDirection:'center', justifyContent: 'center', alignItems:'center'}}>
                                        <Button style={{width: 480, height: 50, borderRadius: 8, backgroundColor: 'black'}}>
                                            <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'white'}}>Configure Fields</Text>
                                       </Button>      
                                    </div>   
                                 ) }
                            </Container>
                        </div>
                )})
            ) }
        else {
            return (
                <Loader/>
            )
    }}


    return (
        <div style={{padding: 10}}>
            <Text style={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 600}}>Schema Mapping </Text>
            <Divider/>
                <Text style={{padding: 20, fontFamily: 'Visuelt', fontSize: '12px', fontWeight: 400, color: 'grey'}}>Below are all of the required and optional properties for {action?.name}. The API documentation indicates that all of the required properties must have a value mapped or set - not doing so will likely result in failure.</Text>
                <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: 10, display:'flex',flexDirection:'row', justifyContent: 'space-between'}}>
                    <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Required Properties</Text>
                    <Text style={{fontFamily:'Visuelt'}}>{0}/{requiredCount}</Text>
                </div>
                
                <div style={{paddingBottom: 20, display: 'flex', flexDirection: 'column'}}>
                    {requiredProperties()}
                </div>
            
                <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: 10, display:'flex',flexDirection:'row', justifyContent: 'space-between'}}>
                    <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>Optional Properties</Text>
                    <Text style={{fontFamily:'Visuelt'}}>{0}/{optionalCount}</Text>
                    </div>
                    <ScrollArea.Autosize maxHeight={700} width={50}>
                   { 
                        !optionalPropertyObjects ? (
                            <Loader/>
                        ) :  optionalPropertyObjects.map((property, index) => {
                            return (
                                <div key={property.path} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center',paddingTop: 12}}>
                                <Container className={selectedMapping?.path == property.path ? 'active' : ''} sx={{
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
                                            setSelectedMapping(property)
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
                                            }}>Not Mapped</div>
                                        </div>
                                        <div style={{paddingRight: 2, paddingLeft:2}}>
                                            <RxArrowRight color={'black'} style={{height: 20, width: 40}}/>
                                        </div>
                                        <div style={{width: 200, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                            <div style={{backgroundColor: '#F2F0ED', width: 180, height: 35, borderRadius: 4, display: 'flex', flexDirection: 'row', justifyContent: 'center',alignItems: 'center'}}>
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 100, color: 'black'}}>{property.path}</Text>
                                            </div>
                                        </div>
                                    </Button>
                                    {selectedMapping?.path == property.path && (
                                        <div style={{width: '100%', paddingBottom: 5, display:'flex', flexDirection:'center', justifyContent: 'center', alignItems:'center'}}>
                                            <Button style={{width: 480, height: 50, borderRadius: 8, backgroundColor: 'black'}}>
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 500, color: 'white'}}>Configure Fields</Text>
                                           </Button>      
                                        </div>   
                                     ) }
                                </Container>
                            </div>
                                )
                            }
                        )}

                    </ScrollArea.Autosize>
                    

        </div>
    )
}

export default SchemaMappingDrawer