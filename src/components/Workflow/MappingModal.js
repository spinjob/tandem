import {Text,Image,ActionIcon, Switch, Button, SegmentedControl, Tooltip, Card, Center, Loader, Code, Divider, Badge, ScrollArea} from '@mantine/core'
import axios from 'axios'
import {useRef, useState,useEffect} from 'react'
import useStore from '../../context/store'
import {v4 as uuidv4} from 'uuid'
import {RxArrowRight} from 'react-icons/rx'
import {VscSymbolArray} from 'react-icons/vsc'
import {BiBook} from 'react-icons/bi'
import {HiOutlineKey} from 'react-icons/hi'

const MappingModal = () => { 

    const selectedMapping = useStore(state => state.selectedMapping)
    const setSelectedMapping = useStore(state => state.setSelectedMapping)
    const selectedWorkflow = useStore(state => state.selectedWorkflow)
    const setSelectedWorkflow = useStore(state => state.setSelectedWorkflow)
    const workflowMappings = useStore(state => state.workflowMappings)
    const setWorkflowMappings = useStore(state => state.setWorkflowMappings)

    const [mapping, setMapping] = useState({})
    
    const renderConfigurationCard = () => {
        return(
            <Card shadow="sm" p="lg" radius="lg" withBorder>
                <Card.Section style={{padding: 20}}>
                    <Text style={{fontFamily:'Visuelt', fontSize: '20px'}}>Configuration Key</Text>
                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '15px', color: '#8E8E8E'}}>Configuration Type</Text>
                    <div style={{height: 12}}/>                    
                    <Text style={{fontFamily:'Visuelt', fontSize: '18px', color: '#6A6A6A'}}>Configuration Description</Text>
                </Card.Section>
            </Card>
        )}

    const renderContextHeaders = (context, index) => {

        return index === 0 ? (
            <div style={{ width: '100%',height: 50, backgroundColor: '#B5B6FF'}} />
        ) : 

        (
            <div style={{width: '100%%', height: 70, backgroundColor: '#B5B6FF'}} />
        )

    
    }

    const renderPropertyCard = (property) => {

        return (

            <Card shadow="xs" p="lg" radius={15} withBorder>
                
                {
                        property.parentContext?.length > 0 ? (
                            <Card.Section>
                                 { 
                                    property.parentContext.map((context, index) => {
                                        if(index === 0 || index % 2 == 0){
                                            return (
                                                <div key={context.contextType+'-'+index} style={{ width: '100%',height: 40, backgroundColor: '#B5B6FF', display:'flex', flexDirection: 'row', alignItems: 'center',padding: 20}}>
                                                    {context.contextType == 'array' ? (
                                                          <div style={{display:'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                          <VscSymbolArray style={{width: 15, alignContent:'center'}}/>
                                                              <div style={{width: 5}}/>
                                                              <Text style={{fontFamily:'apercu-regular-pro', fontSize:'15px'}}>
                                                                  {context.parentContextKey}
                                                              </Text>
                                                              <div style={{width: 5}}/>
                                                              <Text style={{fontFamily:'apercu-regular-pro', fontSize:'12px'}}>
                                                                  [array]
                                                              </Text>
                                                      </div>
                                                    )
                                                    : (
                                                        <div key={context.contextType+'-'+index} style={{width: '100%', display:'flex', flexDirection: 'row', justifyContent:'space-between'}}>
                                                            <div style={{display:'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                <BiBook style={{width: 15}}/>
                                                                <div style={{width: 5}}/>
                                                                <Text style={{fontFamily:'apercu-regular-pro', fontSize:'15px'}}>
                                                                    {context.parentContextKey}
                                                                </Text>
                                                                <div style={{width: 5}}/>
                                                                <Text style={{fontFamily:'apercu-regular-pro', fontSize:'12px'}}>
                                                                    [dictionary]
                                                                </Text>
                                                            </div>
                                                            <div style={{display:'flex', flexDirection: 'row'}}>
                                                                <Tooltip 
                                                                    label={
                                                                        <Text style={{fontFamily:'apercu-regular-pro'}}>{context.dictionaryKey}</Text>}>
                                                                        <div>
                                                                            <HiOutlineKey />
                                                                        </div>  
                                                                </Tooltip>
                                                                
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )

                                        } else {
                                            return (
                                                <div key={context.contextType+'-'+index} style={{ width: '100%',height: 40, backgroundColor: '#EAEAFF', display:'flex', flexDirection: 'row',alignItems: 'center',padding: 20}}>
                                                    {context.contextType == 'array' ? (
                                                        <div style={{display:'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                            <VscSymbolArray style={{width: 15, alignContent:'center'}}/>
                                                                <div style={{width: 5}}/>
                                                                <Text style={{fontFamily:'apercu-regular-pro', fontSize:'15px'}}>
                                                                    {context.parentContextKey}
                                                                </Text>
                                                                <div style={{width: 5}}/>
                                                                <Text style={{fontFamily:'apercu-regular-pro', fontSize:'12px'}}>
                                                                    [array]
                                                                </Text>
                                                        </div>
                                                    )
                                                    : (
                                                        <div key={context.contextType+'-'+index} style={{width: '100%', display:'flex', flexDirection: 'row', justifyContent:'space-between'}}>
                                                            <div style={{display:'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                                                <BiBook style={{width: 15}}/>
                                                                <div style={{width: 5}}/>
                                                                <Text style={{fontFamily:'apercu-regular-pro', fontSize:'15px'}}>
                                                                    {context.parentContextKey}
                                                                </Text>
                                                                <div style={{width: 5}}/>
                                                                <Text style={{fontFamily:'apercu-regular-pro', fontSize:'12px'}}>
                                                                    [dictionary]
                                                                </Text>
                                                            </div>
                                                            <div style={{display:'flex', flexDirection: 'row'}}>
                                                                <HiOutlineKey />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )

                                        }
                                    })
                                }
                            </Card.Section>
                            
                        ) : (null)
                }

                <Card.Section style={{padding: 20}}>
                    <Text style={{fontFamily:'Visuelt', fontSize: '20px'}}>{property.key}</Text>
                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '15px', color: '#8E8E8E'}}>{property.type}</Text>
                    <div style={{height: 12}}/>                    
                    {
                        property?.description ? (
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100,fontSize: '16px', color: '#6A6A6A'}}>{property?.description}</Text>
                        ) : (
                            null
                        )
                    }
                    <div style={{height: 12}}/>  
                    <Divider/>
                    <div style={{height: 12}}/>
                    <div style={{height: 12}}/>
                    <Text style={{fontFamily:'Visuelt', fontSize: '14px'}}>{property.path}</Text>
                </Card.Section>
            </Card>
        )}


    return(

            <div style={{paddingRight: 15, paddingLeft: 15}}>
                <Text style={{fontFamily:'Visuelt', fontSize: '30px', fontWeight: 600}}>Mapping Configuration</Text>
                <div style={{height: 40}}/>
                <div style={{display:'flex', flexDirection: 'row', alignItems:'center'}}>
                    {
                        selectedMapping?.sourceProperty?.path ? (
                            <div style={{display: 'block', width: '50%'}}>
                                <Text style={{fontFamily:'Visuelt', fontSize: '18px'}}>Input</Text>
                                <div style={{height: 8}}/>
                                {renderPropertyCard(selectedMapping?.sourceProperty)}
                            </div>
                        ) : (
                            <div style={{display: 'block', width: '50%'}}>
                                <Text style={{fontFamily:'Visuelt', fontSize: '18px'}}>Input</Text>
                                <div style={{height: 8}}/>
                                {renderConfigurationCard()}
                            </div>
                        )
                    }

                    <div style={{width: 40,display:'flex', flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
                        <RxArrowRight size={30}/>
                    </div>
                    <div style={{display: 'block', width: '50%'}}>
                        <Text style={{fontFamily:'Visuelt', fontSize: '18px'}}>Output</Text>
                        {renderPropertyCard(selectedMapping?.targetProperty)}
                    </div>
                </div>
                <div style={{height: 40}}/>
                <div style={{display:'flex', flexDirection: 'row', alignItems:'center'}}>
                    <Card shadow={"sm"}style={{border: '1px solid #EBEBEB', borderRadius: 15, height:80, width: '100%'}}>
                        <Card.Section style={{padding: 20, display:'flex', flexDirection: 'row', alignItems:'center',height:80, width: '100%'}}>
                            <div style={{display:'flex', flexDirection: 'row', alignItems:'center', justifyContent:'space-between',width: '100%'}}>
                                <Text>
                                    Adaption to Input
                                </Text>
                                <Switch color="dark">

                                </Switch>
                            </div>
                        </Card.Section>
                    </Card>
                </div>
                <div style={{height: 20}}/>
                <Divider size="xs" color={'#EBEBEB'}/>
                <div style={{height: 20}}/>
                <div style={{justifyContent:'space-between', width: '100%', display:'flex', flexDirection:'row'}}>
                    <Button sx={{
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
                        fontFamily: 'Visuelt',
                        fontSize: '16px',
                        fontWeight: 500,
                        height: 40,
                        border: '2px solid #EBEBEB',
                        ':hover': {
                            backgroundColor: '#BABABA',
                            color: '#FFFFFF',
                            fontFamily: 'Visuelt',
                            fontSize: '16px',
                            fontWeight: 500,
                            height: 40,
                            border: '2px solid #BABABA',
                        }
                    }}>
                        Cancel
                    </Button>
                    <Button sx={{
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        fontFamily: 'Visuelt',
                        fontSize: '16px',
                        fontWeight: 500,
                        height: 40,
                        border: '2px solid #000000',
                        ':hover': {
                            backgroundColor: '#BABABA',
                            color: '#FFFFFF',
                            fontFamily: 'Visuelt',
                            fontSize: '16px',
                            fontWeight: 500,
                            height: 40,
                            border: '2px solid #BABABA',
                        }
                    }}>
                        Save Mapping
                    </Button>
                </div>
            </div>

    )


}

export default MappingModal