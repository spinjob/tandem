import React, {useState} from 'react'
import { Text, Divider, Card, ScrollArea} from '@mantine/core';
import SchemaTable from './schema-table'
import {VscSymbolArray} from 'react-icons/vsc'
import {BiCodeCurly} from 'react-icons/bi'
import {RiDoubleQuotesL} from 'react-icons/ri'
import {AiOutlineNumber} from 'react-icons/ai'
import {RxComponentBoolean, RxQuestionMarkCircled} from 'react-icons/rx'

const ApiSchemas = ({schemas}) => {

    const [selectedSchema, setSelectedSchema] = useState(null)

    var schemaRows = schemas.map((schema, index) => {
        return (
            {
                name: schema.name,
                type: schema.type,
                uuid: schema.uuid
            }
        )
    })  

    const returnIcon = (type) => {
        switch (type) {
            case 'string':
                return (
                <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
                    <RiDoubleQuotesL/>                                
                </div>
            )
            case 'number':
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
        
    }
    
    const renderSchemaProperties = (properties) => {
        var propertyKeys = Object.keys(properties)
        var propertyValues = Object.values(properties)
        return (
            <div>
                <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>Properties:</Text>
                <div style={{height: 20}}/>
                {propertyKeys.map((key, index) => {
                    return (
                        <div key={index}>
                            <Card shadow="sm" p="lg" radius="md" withBorder style={{padding: 30}}>
                                <Card.Section style={{padding: 30}}>
                                    {returnIcon(propertyValues[index].type)}
                                    <div style={{height: 20}}/>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 20}}>{key}</Text>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{propertyValues[index].type}</Text>
                                    <div style={{height: 15}}/>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{propertyValues[index].description}</Text>
                                </Card.Section>
                            </Card>
                            <div style={{height: 20}}/>

                           
                        </div>
                    )
                }
                )}
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
                            {renderSchemaProperties(selectedSchema.properties)}
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
                     <SchemaTable setUUID={setUUID} data={schemaRows} />
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