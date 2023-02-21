import {Text, Divider, Button } from '@mantine/core'
import { useEffect, useState } from 'react'
import {RxArrowRight} from 'react-icons/rx'

const SchemaMappingDrawer = ({action}) => {

    const [requiredCount, setRequiredCount] = useState(0)
    const [optionalCount, setOptionalCount] = useState(0)
    const [mappings, setMappings] = useState([])

    useEffect(() => {
        if(action.requestBody2) {
            const propertyKeys = Object.keys(action.requestBody2.schema)
            const propertyValues = Object.values(action.requestBody2.schema)
            const requiredProperties = propertyKeys.filter((key, index) => {
                    return propertyValues[index].required
            })
            setRequiredCount(requiredProperties.length)
            const optionalProperties = propertyKeys.filter((key, index) => {
                    return !propertyValues[index].required
            })
            setOptionalCount(optionalProperties.length)
        }
    } ,[setRequiredCount, setOptionalCount])

    const requiredProperties = () => {
        if(action.requestBody2) {
            const propertyKeys = Object.keys(action.requestBody2.schema)
            const propertyValues = Object.values(action.requestBody2.schema)
            const requiredProperties = propertyKeys.filter((key, index) => {
                    return propertyValues[index].required
            })
            // setRequiredCount(requiredProperties.length)
            return (
                requiredProperties.map((property, index) => {
                    return (
                        <div key={property} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12}}>
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
                                        <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>{property}</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                )})
            )

    }}

    const optionalProperties = () => {
        if(action.requestBody2) {
            const propertyKeys = Object.keys(action.requestBody2.schema)
            const propertyValues = Object.values(action.requestBody2.schema)
            const optionalProperties = propertyKeys.filter((key, index) => {
                    return !propertyValues[index].required
            })
            // setOptionalCount(optionalProperties.length)
            return (
                optionalProperties.map((property, index) => {
                    return (
                        <div key={property} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12}}>
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
                                        <Text style={{fontFamily: 'Visuelt', fontSize: '16px'}}>{property}</Text>
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
            <div style={{height: 5}}/>

            <Text style={{padding: 20, fontFamily: 'Visuelt', fontSize: '12px', fontWeight: 400, color: 'grey'}}>Below are all of the required and optional properties for {action.name}. The API documentation indicates that all of the required properties must have a value mapped or set - not doing so will likely result in failure.</Text>
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
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {optionalProperties()}
            </div>

        </div>
    )
}

export default SchemaMappingDrawer