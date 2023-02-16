import React, {useState} from 'react'
import { Text, Divider, Card, Code, ScrollArea} from '@mantine/core';
import ActionsTable from './actions-table'
import {VscSymbolArray} from 'react-icons/vsc'
import {BiCodeCurly} from 'react-icons/bi'
import {RiDoubleQuotesL} from 'react-icons/ri'
import {AiOutlineNumber} from 'react-icons/ai'
import {RxComponentBoolean, RxQuestionMarkCircled} from 'react-icons/rx'
import JSONPretty from 'react-json-pretty';
import JSONPrettyAcai from 'react-json-pretty/dist/acai'

const ApiActions = ({actions}) => {

    const [selectedAction, setSelectedAction] = useState(null)

    var actionRows = actions.map((action, index) => {
        return (
            {
                name: action.name,
                method: action.method,
                uuid: action.uuid
            }
        )
    })  
    const setUUID = (event) => {
        const uuid = event.currentTarget.value
        const action = actions.find((action) => action.uuid === uuid)
        setSelectedAction(action)
        console.log(action)
    }
    

    // const returnIcon = (type) => {
    //     switch (type) {
    //         case 'string':
    //             return (
    //             <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
    //                 <RiDoubleQuotesL/>                                
    //             </div>
    //         )
    //         case 'number':
    //             return (
    //                 <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
    //                     <AiOutlineNumber/>                              
    //                 </div>
    //             )
    //         case 'boolean':
    //             return (          
    //                 <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
    //                     <RxComponentBoolean/>                           
    //                 </div>
    //             )
    //         case 'array':
    //             return (
    //                 <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
    //                     <VscSymbolArray/>                          
    //                 </div>
    //             )
    //         case 'object':
    //             return (
    //                 <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
    //                     <BiCodeCurly/>                        
    //                 </div>
    //             )
    //         default:
    //             return (
    //                 <div style={{display: 'flex',height: 40, width: 40, borderRadius: 4, backgroundColor: '#eaeaff', alignItems:'center', justifyContent:'center'}}>
    //                     <RxQuestionMarkCircled/>                       
    //                 </div>
    //             )
    //     }
    // }


    return (
        <div style={{paddingTop: 30}}>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width: '25vw'}}>
                     <ActionsTable setUUID={setUUID} data={actionRows} />
                </div>
                <div style={{width: '10vw'}}>
                    <Divider size="xl" orientation='vertical' color='dark'/>
                </div>
                <div style={{width: '40vw'}}>

                    {selectedAction ? (
                        <div>
                            <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>Action Details:</Text>
                            <div style={{height: 20}}/>
                            <Card shadow="sm" p="lg" radius="md" withBorder style={{padding: 30}}>
                                <Card.Section style={{padding: 30}}>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 20}}>{selectedAction.name}</Text>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedAction.description}</Text>
                                    <div style={{height: 15}}/>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedAction.method}</Text>
                                    <div style={{height: 15}}/>
                                    <Text style={{fontFamily: 'apercu-regular-pro', fontSize: 15}}>{selectedAction.path}</Text>
                                </Card.Section>
                                <Divider size="sm" color='gray' variant='dotted'/>
                                <Card.Section style={{padding: 30}}>
                                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '18px'}}>Request Body:</Text>
                                    <div style={{height: 20}}/>
                                    <ScrollArea style={{height: 700}}>
                                        {selectedAction.requestBody2 ? (
                                            <div>
                                               <JSONPretty theme={JSONPrettyAcai} data={selectedAction.requestBody2}></JSONPretty>
                                            </div>
                                        ) : (
                                            <div>
                                                <Text>No request body</Text>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </Card.Section>
                            </Card>
                        </div>
                        // renderSchemaCard()
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

export default ApiActions