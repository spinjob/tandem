import React, {useState} from 'react'
import { Text, Divider, Card, ScrollArea} from '@mantine/core';
import SchemaTable from './schema-table'
import {VscSymbolArray} from 'react-icons/vsc'
import {BiCodeCurly} from 'react-icons/bi'
import {RiDoubleQuotesL} from 'react-icons/ri'
import {AiOutlineNumber} from 'react-icons/ai'
import {RxComponentBoolean, RxQuestionMarkCircled} from 'react-icons/rx'
import SchemaTree from './schema-tree';

const ApiSchemas = ({schemas}) => {

    const [selectedSchema, setSelectedSchema] = useState(null)
    const [schemaLoading, setSchemaLoading] = useState(false)
    const [selectedSchemaProperty, setSelectedSchemaProperty] = useState(null)
    const [propertyLoopCount, setPropertyLoopCount] = useState(0)

    var schemaRows = schemas.map((schema, index) => {
        return (
            {
                name: schema.name,
                type: schema.type,
                uuid: schema.uuid
            }
        )
    })

    const processSchemaReferences = (properties, parentSchema) => {
        var propertyKeys = Object.keys(properties)
        var propertyValues = Object.values(properties)
        var parentSchemaArray = []
        parentSchema.map((schema) => {
            parentSchemaArray.push(schema)
        })

        console.log(parentSchemaArray)
 
        // if(parentSchema.name == "ItemModifier") {
        //     console.log(parentSchema)
        //     console.log(propertyKeys)
        //     console.log(propertyValues)
        //     return properties
        // }else {

            propertyKeys.map((key, index) => {
                if(propertyValues[index].$ref) {
                    const ref = propertyValues[index].$ref.split('/').pop()
                    const refSchema = schemas.find((schema) => schema.name === ref)
                    if(parentSchemaArray.includes(ref)) {
                        console.log("Schema References itself as Child: Infinite Loop")
                        console.log("Parent Schema: " + parentSchemaArray)
                        console.log("Child Schema: " + ref)

                        properties[key] = {
                            name: ref,
                            type: refSchema.type,
                            description: refSchema.description + "Children of this object have been removed because of an inifinite reference loop.",
                        }

                    } else {
                        parentSchemaArray.push(ref)
                        const refSchema = schemas.find((schema) => schema.name === ref)
                        properties[key] = refSchema
    
                        if(refSchema.properties && propertyLoopCount < 5) {
                            properties[key].properties = processSchemaReferences(refSchema.properties, parentSchemaArray)
                        }
                        if(refSchema.items) {
                            properties[key].items = processSchemaReferences(refSchema.items, parentSchemaArray)
                        }
                    }
                    
                } else if (propertyValues[index].items?.$ref){
                    const ref = propertyValues[index].items.$ref.split('/').pop()
                    const refSchema = schemas.find((schema) => schema.name === ref)
                    if(parentSchemaArray.includes(ref)) {
                        console.log("Schema References itself as Child: Infinite Loop")
                        console.log("Parent Schema: " + parentSchemaArray)
                        console.log("Child Schema: " + ref)
                       
                        properties[key] = {
                            name: ref,
                            type: refSchema.type,
                            description: refSchema.description + "Children of this object have been removed because of an inifinite reference loop.",
                        }
                    } else {
                        parentSchemaArray.push(ref)
                        const refSchema = schemas.find((schema) => schema.name === ref)
                        properties[key].items = refSchema
                        if(refSchema.properties && propertyLoopCount < 5) {
                            properties[key].items.properties = processSchemaReferences(refSchema.properties, parentSchemaArray)
                        }
                        if(refSchema.items) {
                            properties[key].items.items = processSchemaReferences(refSchema.items, parentSchemaArray)
                        }
                    }
                   
                   
                }
            })
        // }

        return properties
        
    }
        
    const returnIcon = (type) => {
        switch (type) {
            case 'string':
                return (
                <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                    <RiDoubleQuotesL/>                                
                </div>
            )
            case 'number' || 'integer' || 'float':
                return (
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                        <AiOutlineNumber/>                              
                    </div>
                )
            case 'boolean':
                return (          
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                        <RxComponentBoolean/>                           
                    </div>
                )
            case 'array':
                return (
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                        <VscSymbolArray/>                          
                    </div>
                )
            case 'object':
                return (
                    <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                        <BiCodeCurly/>                        
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

    const setUUID = (event) => {
        const uuid = event.currentTarget.value
        const schema = schemas.find((schema) => schema.uuid === uuid)
        setSelectedSchema(schema)
        setSchemaLoading(true)
        setSelectedSchemaProperty(null)
        setTimeout(() => {
            setSchemaLoading(false)
        }, 500)
    }

    const setSelectedProperty = (property) => {
        // console.log(property)
    }
    
    const renderSchemaProperties = (properties, parentSchema) => {

        return (
            <div>
                <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>Properties:</Text>
                <div style={{height: 20}}/>
                <SchemaTree setSelectedSchemaProperty={setSelectedProperty} schema={processSchemaReferences(properties, parentSchema)} schemaType={"schema"}/>
            </div>
        )
    }


    const renderSchemaCard = () => {
        return(
            <Card shadow="sm" p="lg" radius="md" withBorder style={{padding: 30}}>
                <Card.Section style={{padding: 30}}>
                    {returnIcon(selectedSchema.type)}
                    <div style={{height: 20}}/>
                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 20}}>{selectedSchema.name}</Text>
                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedSchema.type}</Text>
                    <div style={{height: 15}}/>
                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedSchema.description}</Text>
                </Card.Section>
                
                
                {selectedSchema.properties ? (
                    <div>
                        <Divider size="sm" color='gray' variant='dotted'/>
                        <Card.Section style={{padding: 30}}>
                            <ScrollArea style={{height: 700}}>
                            {renderSchemaProperties(selectedSchema.properties, [selectedSchema.name])}
                            </ScrollArea>
                        </Card.Section>
                    </div>
                ) : (
                    <div>
                       
                    </div>
                )}

                {selectedSchema.items ? (
                    <div>
                        <Divider size="sm" color='gray' variant='dotted'/>
                        <Card.Section style={{padding: 30}}>
                            <ScrollArea style={{height: 700}}>
                            {renderSchemaProperties(selectedSchema.items, [selectedSchema.name])}
                            </ScrollArea>
                        </Card.Section>
                    </div>
                ) : (
                    <div>
                       
                    </div>
                )}
            </Card>
        ) 
}

    return (
        <div style={{paddingTop: 30}}>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width: '25vw'}}>
                     <SchemaTable  isLoading={schemaLoading} setUUID={setUUID} data={schemaRows} />
                </div>
                <div style={{width: '10vw'}}>
                    <Divider size="xl" orientation='vertical' color='dark'/>
                </div>
                <div style={{width: '40vw'}}>

                    {selectedSchema ? (
                        renderSchemaCard()
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

export default ApiSchemas