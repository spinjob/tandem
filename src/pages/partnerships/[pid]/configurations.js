import {Button, Modal, Text, TextInput, Textarea, Select} from '@mantine/core'
import {useState, useEffect, useCallback} from 'react'
import axios from 'axios'
import ConfigurationTable from '../../../components/Partnerships/configuration-table'

const PartnershipConfigurations = ({ partnership }) => {

    const [modalOpened, setModalOpened] = useState(false)
    const [configurations, setConfigurations] = useState(null)
    const [configurationMap, setConfigurationMap] = useState(null)
    const [newConfigKey, setNewConfigKey] = useState('')
    const [newConfigValue, setNewConfigValue] = useState('')
    const [newConfigType, setNewConfigType] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [selectedConfiguration, setSelectedConfiguration] = useState(null)


    const selectConfiguration = (configuration) => {
        var selectedConfig = configurationMap[configuration]
        setSelectedConfiguration(configuration)
        setIsEditing(true)
        setModalOpened(true)
        setNewConfigKey(configuration)
        setNewConfigValue(selectedConfig.value)
        setNewConfigType(selectedConfig.type)
    }

    const setConfigKey = (e) => {
        setNewConfigKey(e.target.value)
    }

    const setConfigValue = (e) => {
        setNewConfigValue(e.target.value)
    }

    const setConfigType = (e) => {
        setNewConfigType(e)
    }

    const deleteConfiguration = (configurationKey) => {
        console.log(configurationMap)
        console.log(configurationKey)
        var newConfigurations = configurations.filter((config) => {
            return config.key != configurationKey
        })
        var newConfigurationMap = configurationMap
        delete newConfigurationMap[configurationKey]

        console.log(newConfigurationMap)
        setConfigurations(newConfigurations)
        setConfigurationMap(newConfigurationMap)
        saveConfigurations(newConfigurationMap)
        setIsEditing(false)
        setSelectedConfiguration(null)
    }


    const addConfiguration = () => {
        var newConfigurationArrayItem = {
            key: newConfigKey,
            value: newConfigValue,
            type: newConfigType
        }

        var newConfigurationMap = {
            [newConfigKey]: {
                value: newConfigValue,
                type: newConfigType
            }
        }

        if(configurations?.length > 0 ){
            setConfigurations([...configurations, newConfigurationArrayItem])
            setConfigurationMap({...configurationMap, ...newConfigurationMap})
            saveConfigurations({...configurationMap, ...newConfigurationMap})
        } else {
            setConfigurations([newConfigurationArrayItem])
            setConfigurationMap(newConfigurationMap)
            saveConfigurations(newConfigurationMap)
        }

        saveConfigurations()
        setModalOpened(false)
    }

    const saveConfigurations = useCallback((configurations) => {
        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + partnership.uuid + '/configuration', {"configurations": configurations}).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    }, [configurations])

    useEffect(() => {
        if(partnership?.configuration && !configurations){
            var configKeys = Object.keys(partnership.configuration)
            var newConfigurations = []
            configKeys.forEach((key) => {
                var newConfiguration = {
                    key: key,
                    value: partnership.configuration[key].value,
                    type: partnership.configuration[key].type
                }
                newConfigurations.push(newConfiguration)
            })
            setConfigurations(newConfigurations)
            setConfigurationMap(partnership.configuration)
        } 
    }, [partnership, setConfigurations, configurations])


    return (
        <div>
            <Modal
                centered
                opened={modalOpened}
                onClose={() => 
                    {  
                        setModalOpened(false)
                        setIsEditing(false)
                        setSelectedConfiguration(null)
                    }
                }
                overlayColor={'#000'}
                overlayOpacity={0.50}
                radius={'lg'}
                size={'sm'}
                >
                    {
                        isEditing && selectedConfiguration ?
                        (
                                <div style={{display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 20}}>
                                    <Text style={{fontFamily: 'Visuelt', fontSize: '24px', paddingLeft: 20}}>
                                        Edit Configuration
                                    </Text>
                                    <div style={{display: 'flex', flexDirection: 'column', padding: 30, justifyContent:'left', alignItems:'center'}}>
                                        <TextInput 
                                            onChange={setConfigKey}
                                            value={newConfigKey}
                                            label={
                                                <Text
                                                    style={{fontFamily: 'Visuelt',fontSize: '18px'}}
                                                    >Configuration Key
                                                </Text>
                                            } 
                                            style={{
                                                height: 40, 
                                                width: 300, 
                                                borderRadius: 10}}/>
                                        <div style={{height: 40}}/>
                                        <Select
                                            onChange={setConfigType}
                                            value={newConfigType}
                                            label={
                                                <Text
                                                    style={{fontFamily: 'Visuelt', fontSize: '18px'}}
                                                    >Data Type
                                                </Text>
                                            }
                                            placeholder="Pick one"
                                            data={[
                                                { value: 'string', label: 'String' },
                                                { value: 'number', label: 'Number' },
                                                { value: 'object', label: 'Object' },
                                                { value: 'array', label: 'Array' },
                                                { value: 'boolean', label: 'Boolean'},
                                                { value: 'dictionary', label: 'Dictionary'}
                                            ]}
                                            style={{height: 40, width: 300}}
                                        />
                                        <div style={{height: 40}}/>
                                        <Textarea 
                                            onChange={setConfigValue}
                                            value={newConfigValue}
                                            label={
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '18px'}}
                                                    >Configuration Value
                                                </Text>
                                            } 
                                            style={{
                                                height: 40, 
                                                width: 300, 
                                                borderRadius: 10
                                            }}/>  
                                        <div style={{height: 70}}/>
                                        <div style={{height: 40, width: 300}}>
                                            <Button
                                                sx={{   
                                                    backgroundColor: '#B4F481',
                                                    color: 'black',
                                                    fontFamily: 'Visuelt', 
                                                    fontSize: '16px',
                                                    borderColor: 'black',
                                                    '&:hover': {
                                                        backgroundColor: '#D9FAC0',
                                                    },
                                                    height: 40, 
                                                    width: 300
                                                }}
                                                onClick={() => {
                                                    setModalOpened(false)
                                                    addConfiguration()
                                                }}>
                                                Save
                                            </Button>
                                            <div style={{height: 10}}/>
                                            <Button
                                                sx={{   
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                    fontFamily: 'Visuelt', 
                                                    fontSize: '16px',
                                                    borderColor: 'black',
                                                    '&:hover': {
                                                        backgroundColor: '#FFE7DA',
                                                    },
                                                    height: 40, 
                                                    width: 300
                                                }}
                                                onClick={() => {
                                                    setModalOpened(false)
                                                    deleteConfiguration(selectedConfiguration)
                                                }}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div> 
                                </div> 
                        ) : (
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <Text style={{fontFamily: 'Visuelt', fontSize: '24px', paddingLeft: 20}}>
                                        New Configuration
                                    </Text>
                                    <div style={{display: 'flex', flexDirection: 'column', padding: 30, justifyContent:'left', alignItems:'center'}}>
                                        
                                        <TextInput 
                                            onChange={setConfigKey}
                                            label={
                                                <Text
                                                    style={{fontFamily: 'Visuelt',fontSize: '18px'}}
                                                    >Configuration Key
                                                </Text>
                                            } 
                                            style={{
                                                height: 40, 
                                                width: 300, 
                                                borderRadius: 10}}/>
                                        <div style={{height: 40}}/>
                                        <Select
                                            onChange={setConfigType}
                                            label={
                                                <Text
                                                    style={{fontFamily: 'Visuelt', fontSize: '18px'}}
                                                    >Data Type
                                                </Text>
                                            }
                                            placeholder="Pick one"
                                            data={[
                                                { value: 'string', label: 'String' },
                                                { value: 'number', label: 'Number' },
                                                { value: 'object', label: 'Object' },
                                                { value: 'array', label: 'Array' },
                                                { value: 'boolean', label: 'Boolean'},
                                                { value: 'dictionary', label: 'Dictionary'}
                                            ]}
                                            style={{height: 40, width: 300}}
                                        />
                                        <div style={{height: 40}}/>
                                        <Textarea 
                                            onChange={setConfigValue}
                                            label={
                                                <Text style={{fontFamily: 'Visuelt', fontSize: '18px'}}
                                                    >Configuration Value
                                                </Text>
                                            } 
                                            style={{
                                                height: 40, 
                                                width: 300, 
                                                borderRadius: 10
                                            }}/>  
                                        <div style={{height: 70}}/>
                                        <div style={{height: 40, width: 300}}>
                                            <Button
                                                sx={{   
                                                    backgroundColor: '#B4F481',
                                                    color: 'black',
                                                    fontFamily: 'Visuelt', 
                                                    fontSize: '16px',
                                                    borderColor: 'black',
                                                    '&:hover': {
                                                        backgroundColor: '#D9FAC0',
                                                    },
                                                    height: 40, 
                                                    width: 300
                                                }}
                                                onClick={() => {
                                                    setModalOpened(false)
                                                    addConfiguration()
                                                }}>
                                                Save
                                            </Button>
                                        </div>
                                    </div> 
                                </div> 
                        )
                    }
                
            </Modal>
            {
                configurations?.length > 0 ? <ConfigurationTable selectConfiguration={selectConfiguration} data={configurations}/> : null
            }
            <div style={{height: 50}}/>
            <div 
                style={{
                    width: '100%', 
                    backgroundColor:'#F8F6F3', 
                    height: 90,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 30,
                    borderRadius: 10
                }}>
                <Button
                    onClick={() => setModalOpened(true)}
                    sx={{
                        backgroundColor: '#B4F481',
                        color: 'black',
                        fontFamily: 'Visuelt', 
                        fontSize: '16px',
                        borderColor: 'black',
                        border: '2px solid black',
                        '&:hover': {
                            backgroundColor: '#D9FAC0',
                        }
                    }}    
                    size={'lg'}>
                    Add New
                </Button>
                <Button
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        fontFamily: 'Visuelt', 
                        fontSize: '16px',
                        borderColor: 'black',
                        border: '2px solid black',
                        '&:hover': {
                            backgroundColor: '#FBFAF9'
                        }
                    }}    
                    size={'lg'}>
                    Edit Keys
                </Button>
            </div>
        </div>
    )
}

export default PartnershipConfigurations