import {Text,Image,ActionIcon, Select, Switch, Button, SegmentedControl, Tooltip, Card, Center, Loader, Code, Divider, Badge, ScrollArea, TextInput, Textarea} from '@mantine/core'
import axios from 'axios'
import { useListState } from "@mantine/hooks"
import {useRef, useState,useEffect} from 'react'
import useStore from '../../context/store'
import {v4 as uuidv4} from 'uuid'
import {RxArrowRight} from 'react-icons/rx'
import {VscSymbolArray} from 'react-icons/vsc'
import {BiBook} from 'react-icons/bi'
import {HiOutlineKey} from 'react-icons/hi'
import AdaptionDesigner from './AdaptionDesigner'

const MappingModal = ({ apis, getSchemaFromPath, edge, nodes, sourceNode, targetNode, partnership, toggleMappingModal}) => { 

    const selectedMapping = useStore(state => state.selectedMapping)
    const selectedEdge  = useStore(state => state.selectedEdge)
    const setSelectedMapping = useStore(state => state.setSelectedMapping)
    const nodeActions = useStore(state => state.nodeActions)
    const selectedWorkflow = useStore(state => state.selectedWorkflow)
    const setSelectedWorkflow = useStore(state => state.setSelectedWorkflow)
    const workflowMappings = useStore(state => state.workflowMappings)
    const mappings = useStore(state => state.mappings)
    const setWorkflowMappings = useStore(state => state.setWorkflowMappings)
    const addMapping = useStore(state => state.addMapping)
    const [functionDesignerOpened, setFunctionDesignerOpened] = useState(false)
    const stepIndex = edge?.target ? Number(edge.target.split('-')[1]) : null
    const sourceNodeAction = nodes[edge.source]
    const targetNodeAction = nodes[edge.target]
    const [configurationMappingView, setConfigurationMappingView] = useState(partnership?.configuration ? "select" : "create")
    const [newConfigKey, setNewConfigKey] = useState("")
    const [newConfigValue, setNewConfigValue] = useState("")
    const [newConfigType, setNewConfigType] = useState("string")
    const [selectedConfiguration, setSelectedConfiguration] = useState(null)
    const [canSaveConfiguration, setCanSaveConfiguration] = useState(false)
    const [configurationMenuValue, setConfigurationMenuValue] = useState(partnership?.configuration ? "select" : "new")
    const [formulas, handlers] = useListState([])
    const [didLoadInitialFormula, setDidLoadInitialFormula] = useState(false)
    const inputPaths = useStore(state => state.inputPaths)

    const saveMapping = () => {
        console.log(selectedMapping)
        const newMapping = {
            id: uuidv4(),
            stepIndex: stepIndex,
            input: {
                ...selectedMapping?.sourceProperty,
                in: selectedMapping?.sourceProperty?.in ? selectedMapping?.sourceProperty?.in : "body",
                actionId: sourceNodeAction?.uuid ? sourceNodeAction.uuid : "configuration",
                apiId: sourceNodeAction?.parent_interface_uuid ? sourceNodeAction.parent_interface_uuid : "configuration",
                formulas: formulas
            },
            output:{
                ...selectedMapping?.targetProperty,
                in: selectedMapping?.targetProperty?.in ? selectedMapping?.targetProperty?.in : "body",
                actionId: targetNodeAction.uuid,
                apiId: targetNodeAction.parent_interface_uuid
            },
            sourcePath: selectedMapping?.sourceProperty?.path,
            targetPath: selectedMapping?.targetProperty?.path,
            sourceNode: sourceNode?.id ? sourceNode.id : "configuration",
            targetNode: targetNode.id, 
        }

        addMapping(newMapping)

    }

    const renderPartnershipConfigurationMenu = () => {
        var selectionOptionsArray = [{'label': 'New Workflow Variable', 'value': 'new'}]
        if(partnership?.configuration){
            var configurationKeys = Object.keys(partnership.configuration)
            configurationKeys.forEach((key) => {
                selectionOptionsArray.push({label: key, value: key, group: 'Partnership Configurations'})
            })
        }
        if(partnership?.authentication){
            var authenticationKeys = Object.keys(partnership.authentication)
            var authenticationValues = Object.values(partnership.authentication)
            
            authenticationKeys.forEach((key, index) => {
                var apiId = key
                var apiGroup = apis.filter((api) => api.uuid === key)[0].name + " Authentication Credentials"
                var authenticationCredentialKeys = Object.keys(authenticationValues[index])
                var authenticationCredentialValues = Object.values(authenticationValues[index])

                authenticationCredentialKeys.forEach((key,index) => {
                    selectionOptionsArray.push({label: key, value: '$AuthKey-'+key+'$AuthValue-'+authenticationCredentialValues[index]+'$AuthGroup-'+apiId, group: apiGroup})
                })
             
            })
        }
        return selectionOptionsArray
    }

    const renderConfigurationCreationCard = () => {
        return(
            <div>
                    <TextInput 
                        label={<Text style={{fontFamily:'Visuelt', fontWeight: 500, fontSize:'12px'}}>Variable Key</Text>}
                        placeholder="Provide a key to identify this variable."
                        onChange={(e) => {
                            setNewConfigKey(e.target.value)
                        }}
                        sx={{
                            borderRadius: '5px',
                            width: '100%',
                            '& input': {
                                fontFamily: 'Visuelt',
                                fontSize: '14px',
                                fontWeight: 100,
                                color: '#000000',
                                '&:focus': {
                                    border: '1px solid #000000',
                                }
                            }
                        }}
                    />
                    <Select
                        label={<Text style={{fontFamily:'Visuelt', fontWeight: 500, fontSize:'12px'}}>Data Type</Text>}
                        placeholder="Select a type"
                        data={[{label: 'String', value: 'string'}, {label: 'Number', value: 'number'}, {label: 'Boolean', value: 'boolean'}]}
                        dropdownPosition="bottom"
                        onChange={(value) => {
                            setNewConfigType(value)
                        }}
                        withinPortal={true}
                        sx={{
                            borderRadius: '5px',
                            width: '100%',
                            '& input': {
                                fontFamily: 'Visuelt',
                                fontSize: '14px',
                                fontWeight: 100,
                                color: '#000000',
                                '&:focus': {
                                    border: '1px solid #000000',
                                }
                            }
                        }}
                    />
                    <Textarea
                        label={<Text style={{fontFamily:'Visuelt', fontWeight: 500, fontSize:'12px'}}>Variable Value</Text>}
                        placeholder="Provide the value to set this variable to."
                        onChange={(e) => {
                            setNewConfigValue(e.target.value)
                        }}

                        sx={{
                            borderRadius:'5px',
                            width: '100%',
                            '& textarea': {
                                fontFamily: 'Visuelt',
                                fontSize: '14px',
                                fontWeight: 100,
                                color: '#000000',
                                '&:focus': {
                                    border: '1px solid #000000',
                                }
                            }
                        }}
                    />
                        <div style={{height: 12}}/>
                    <Button
                        disabled={!canSaveConfiguration}
                        onClick={() => {
                            setSelectedConfiguration({type: newConfigType, value: newConfigValue, key: newConfigKey})
                            setConfigurationMappingView('view')
                            var sourceProperty = {
                                key: newConfigKey,
                                path: '$variable.'+newConfigKey,
                                description: newConfigValue,
                                type: newConfigType,
                                value: newConfigValue,
                            }
                            console.log(sourceProperty)
                            setSelectedMapping({...selectedMapping, sourceProperty: sourceProperty})
                        }}
                        radius={'md'}
                        sx={{
                            width: '100%',
                            height: 40,
                            backgroundColor: '#000000',
                            '&:hover': {
                                backgroundColor: '#5A5A5A',
                            }
                        }}
                    >
                        <Text style={{fontFamily:'Visuelt', fontWeight: 500, fontSize:'15px'}}>Save</Text>
                    </Button>
                    <div style={{height: 12}}/>
            </div>
    )}

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
                    <Text style={{fontFamily:'apercu-regular-pro', fontSize: '15px', color: '#8E8E8E'}}>{property.type ? property.type : property.schema?.type ? property.schema.type : null}</Text>
                    <div style={{height: 12}}/>                    
                    {
                        property?.description || property.schema?.description ? (
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100,fontSize: '16px', color: '#6A6A6A'}}>{property?.description ? property.description : property.schema?.description ? property.schema.description : null}</Text>
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

    const renderConfigurationViewCard = () => {
        
        return(
            <div>
                <Text style={{fontFamily:'apercu-regular-pro', fontSize: '15px', color: '#8E8E8E'}}>{selectedConfiguration.type}</Text>
                <div style={{height: 12}}/>
                <Divider/>     
                <div style={{height: 12}}/>
                <div style={{height: 12}}/>
                <Text style={{fontFamily:'Visuelt', fontSize: '14px'}}>{selectedConfiguration.value}</Text>
            </div>
        )
    }

    useEffect(() => {
        if (configurationMappingView == 'create' && newConfigKey != '' && newConfigValue != '' && newConfigType != '') {
            setCanSaveConfiguration(true)
        } else {
            setCanSaveConfiguration(false)
        }
        
    }, [newConfigKey, newConfigValue, newConfigType, configurationMappingView])


    useEffect(() => {
        if(mappings[selectedEdge?.target] && selectedMapping && !didLoadInitialFormula) {
            var fullMapping = mappings[selectedEdge?.target][selectedMapping?.targetProperty?.path]
    
            if(fullMapping?.input?.formulas) {
                handlers.setState(fullMapping.input.formulas)
                setFunctionDesignerOpened(true)
            }
            setDidLoadInitialFormula(true)
        }

    }, [mappings, selectedEdge, selectedMapping, didLoadInitialFormula])

    return(
            <div style={{paddingRight: 15, paddingLeft: 15}}>
                <div style={{display:'flex', flexDirection: 'row', alignItems:'center'}}>
                    {
                        selectedMapping?.sourceProperty?.path ? (
                            <div style={{display: 'block', width: '50%'}}>
                                <Text style={{fontFamily:'Visuelt', fontSize: '18px'}}>Input</Text>
                                <div style={{height: 8}}/>
                                {
                                    selectedMapping?.sourceProperty?.path?.split('.')[0] == '$variable' || selectedMapping?.sourceProperty?.path?.split('.')[0] == '$credential'? (
                                        renderPropertyCard(selectedMapping.sourceProperty)
                                    ) : (
                                        renderPropertyCard(getSchemaFromPath(selectedMapping.sourceProperty.path))
                                    )

                                }
                            </div>
                        ) : (
                            <div style={{display: 'block', width: '50%'}}>
                                <Text style={{fontFamily:'Visuelt', fontSize: '18px'}}>Input</Text>
                                <div style={{height: 8}}/>


                                <Card shadow="sm" p="lg" radius="lg" withBorder>
                                    <Card.Section style={{padding: 20, minHeight: 300}}>
                                        {
                                            configurationMappingView == 'select' ? (
                                                <Text style={{fontFamily:'Visuelt', fontSize: '20px'}}>Configuration</Text>
                                            ) : (
                                                null
                                            )
                                        }
                                       
                                        <div style={{height: 12}}/>
                                        <Select
                                            withinPortal={true}
                                            value={configurationMenuValue}
                                            className={
                                                configurationMappingView == 'view' ? 'view' : 'create' ? 'create' : 'select'
                                            }
                                            placeholder="Select Configuration"
                                            data={renderPartnershipConfigurationMenu()}
                                            dropdownPosition="bottom"
                                            zIndex={1000}
                                            onChange={(value, group) => {
                                                setConfigurationMenuValue(value)
                                                if(value == 'new'){
                                                    setConfigurationMappingView('create')
                                                    setSelectedConfiguration(null)
                                                    setNewConfigKey('')
                                                    setNewConfigValue('')
                                                    setNewConfigType('')

                                                } else if (value.includes('$Auth')) {
                                                    setConfigurationMappingView('view')
                                                    var authConfigKey = value.split('$AuthKey-')[1].split('$AuthValue-')[0]
                                                    var authConfigValue = value.split('$AuthValue-')[1].split('$AuthGroup-')[0]
                                                    var authConfigSecuritySchemaId = value.split('$AuthGroup-')[1]
                                                    setSelectedConfiguration({type: 'string', value: authConfigValue, key: authConfigKey})
                                                    setConfigurationMappingView('view')
                                                    var sourceProperty = {
                                                        key: authConfigKey,
                                                        path: '$credential.'+authConfigKey,
                                                        description: authConfigValue,
                                                        type: 'string',
                                                        value: authConfigValue,
                                                    }
                                                  
                                                    setSelectedMapping({...selectedMapping, sourceProperty: sourceProperty})
                                                } 
                                                else {
                                                    setConfigurationMappingView('view')
                                                    setSelectedConfiguration({type: partnership.configuration[value].type, value: partnership.configuration[value].value, key: value})
                                                    var sourceProperty = {
                                                        key: value,
                                                        path: '$variable.'+value,
                                                        description: value,
                                                        type: partnership.configuration[value].type,
                                                        value: partnership.configuration[value].value,
                                                    }
    
                                                    setSelectedMapping({...selectedMapping, sourceProperty: sourceProperty})
                                                }
                                            }}
                                            sx={{
                                                width: '100%',
                                                height: 40,
                                                fontFamily: 'Visuelt',
                                                fontSize: '15px',
                                                '& input': {
                                                    fontFamily: 'Visuelt',
                                                    fontSize: '18px',
                                                    color: '#000000',
                                                },
                                                '&:focus': {
                                                    border: '1px solid #000000',
                                                },
                                                '&.view': {
                                                    border: 'none',
                                                    padding:0
                                                },
                                                '&.create': {
                                                    border: '1px solid #EBEBEB',
                                                    paddingLeft: 5,
                                                    borderRadius: 5
                                                },
                                            }}
                                            variant={'unstyled'}
                                        />
                                        <div style={{height: 12}}/>
                                        {
                                            configurationMappingView == 'select' ? (
                                                null
                                            ) : configurationMappingView == 'create' ? (
                                                renderConfigurationCreationCard()
                                            ) : configurationMappingView == 'view' ? (
                                                renderConfigurationViewCard(selectedConfiguration)
                                            ) : (
                                                null
                                            )
                                            }
                                    </Card.Section>
                                </Card>
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
                    <Card shadow={"sm"}style={{border: '1px solid #EBEBEB', borderRadius: 15, width: '100%'}}>
                        <Card.Section style={{padding: 20, display:'flex', flexDirection: 'row', alignItems:'center',height:80, width: '100%'}}>
                            <div style={{display:'flex', flexDirection: 'row', alignItems:'center', justifyContent:'space-between',width: '100%'}}>
                                <Text style={{fontWeight: functionDesignerOpened ? 600 : null }}>
                                    Adaption to Input
                                </Text>
                                <div style={{display:'flex', flexDirection:'row', alignItems: 'center'}}>
                                    <Switch onChange={(event)=>{
                                        setFunctionDesignerOpened(event.target.checked)
                                    }} color="dark" checked={functionDesignerOpened}>
                                    </Switch>
                                    {
                                        functionDesignerOpened ? (
                                            <>
                                                <div style={{width: 10}}/>
                                                <Text
                                                    sx={{
                                                        fontFamily: 'Visuelt',
                                                        fontSize: '22px',
                                                        color: '#000000',
                                                        fontWeight: 500
                                                    }}
                                                >On</Text>
                                            </>
                                            
                                        ) : (
                                            <>
                                                <div style={{width: 10}}/>
                                                <Text></Text>
                                            </>
                                        )
                                    }
                                   
                                </div>
                              
                                
                            </div>
                        </Card.Section>
                        {
                            functionDesignerOpened ? (
                                <Card.Section style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20, display:'flex', flexDirection: 'column', alignItems:'center', width: '100%',}}>
                                    <Divider size={'xs'} style={{width: '100%'}}/>
                                    <div style={{height: 20}}/>
                                    <AdaptionDesigner formulas={formulas} handlers={handlers} selectedMapping={selectedMapping} mappings={mappings} source={sourceNode} target={targetNode}/> 
                                </Card.Section>
                            ) : (null) 
                        }
                    </Card>
                </div>
                <div style={{height: 20}}/>
                <Divider size="xs" color={'#EBEBEB'}/>
                <div style={{height: 20}}/>
                <div style={{justifyContent:'space-between', width: '100%', display:'flex', flexDirection:'row'}}>
                    <Button 
                    onClick={()=>{
                        toggleMappingModal()
                    }}
                    sx={{
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
                    <Button
                    onClick={()=>{
                        saveMapping()
                        toggleMappingModal()
                        setSelectedMapping({sourceProperty: null, targetProperty: null})
                        console.log(mappings)
                        
                    }}
                    sx={{
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
                        Set Mapping
                    </Button>
                </div>
            </div>

    )


}

export default MappingModal