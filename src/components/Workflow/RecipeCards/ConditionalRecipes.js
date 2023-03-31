import {Card, Text, NumberInput, TextInput, Image, Button, ActionIcon, Anchor, Modal, Select, Loader} from '@mantine/core'
import {useEffect, useState} from 'react'
import cancelIcon from '../../../../public/icons/delete-disabled.svg'
import {v4 as uuidv4} from 'uuid'

const IfThenRecipeCard = ({updateFormula, recipe, sourceProperty, targetProperty}) => {

    const [topLevelCondition, setTopLevelCondition] = useState('')
    const [topLevelConditionValue, setTopLevelConditionValue] = useState('')
    const [conditions, setConditions] = useState(null)

    useEffect (() => {
        if (conditions && conditions[0] && conditions[0] !== recipe?.inputs?.ifThen[0]) {
            updateFormula(recipe.uuid, {"ifThen": conditions})
           
        }
        if(conditions && conditions[0]){
            if (topLevelCondition == '') {
                setTopLevelCondition(conditions[0].if.condition)
            }
            if (topLevelConditionValue == '') {
                setTopLevelConditionValue(conditions[0].if.value)
            }
        }
    }, [conditions, topLevelCondition, topLevelConditionValue, recipe, updateFormula])

    useEffect (() => {
        if(!conditions && recipe?.inputs?.ifThen){
            setConditions(recipe?.inputs?.ifThen)
        } else if(!conditions && !recipe?.inputs?.ifThen){
            setConditions([{
                uuid: uuidv4(),
                if: {
                    property: sourceProperty,
                    condition: 'equals',
                    value: '',
                    or: []
                },
                then: {
                    property: targetProperty,
                    condition: 'equals',
                    value: ''
                },
                else: {
                    property: targetProperty,
                    condition: 'equals',
                    value: ''
                }
            }])
        }

    }, [conditions, recipe, sourceProperty, targetProperty])

    return (
        <>
            {
                 conditions?.map((condition, index) => {
            
                    return (
                        <div key={condition.uuid} style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', backgroundColor: 'white', display:'block', alignItems:'center', justifyContent:'start'}}>
                            <div style={{display:'flex', paddingTop: 10, paddingRight: 10, flexDirection: 'row', justifyContent:'space-between'}}>
                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                    If 
                                </Text>
                                {/* <Anchor
                                    onClick={() => {
                                        console.log('clicked')
                                    }}
                                    sx={{
                                        height: 40,
                                        backgroundColor: '#FFFFFF',
                                        color: 'black',
                                        fontFamily: 'Visuelt',
                                        fontSize: '16px',
                                        fontWeight: 400,
                                    }}
                                >
                                + Add
                                </Anchor> */}
                            </div>
                            <div style={{width: 10}}/>
                            <div>
                                <div style={{display:'flex', flexDirection: 'row'}}>
                                    <div style={{paddingLeft: 10, width: 180, height: 35, border: '1px solid #EBEBEB', borderRadius:4, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                                            {condition?.if?.property?.key}
                                        </Text>
                                    </div>
                                    <div style={{width: 10}}/>
                                    {
                                        sourceProperty?.type == 'string' ? (
                                            // StringConditions(condition?.if?.property, index, 'if', conditions, setConditions, condition, condition.if?.condition)
                                            <Select
                                            key={condition?.if?.property.uuid+'-selectTopCondition-if-'+index}
                                            onChange={(value) => {
                                                setTopLevelCondition(value)
                                                var newConditions = conditions
                                                newConditions[index].if.condition = value
                                               setConditions(newConditions)
                                            }}
                                            data={[
                                                {label: 'is', value: 'equals'},
                                                {label: 'is not', value: 'notEquals'},
                                            ]}
                                            value={topLevelCondition}
                                            sx={{
                                                width: 128,
                                                '& input': {
                                                    '&:focus':{
                                                        borderColor: 'black'
                                                    },
                                                    fontFamily: 'Visuelt',
                                                    fontSize: '16px',
                                                    fontWeight: 100
                                                }
                                            }}
                                            />

                                            ) : sourceProperty?.type == 'boolean' ? (
                                                <Select
                                                    key={condition?.if?.property.uuid+'-selectTopCondition-if-'+index}
                                                    onChange={(value) => {
                                                        setTopLevelCondition(value)
                                                        var newConditions = conditions
                                                        newConditions[index].if.condition = value
                                                    setConditions(newConditions)
                                                    }}
                                                    data={[
                                                        {label: 'is', value: 'equals'},
                                                        {label: 'is not', value: 'notEquals'},
                                                    ]}
                                                    value={topLevelCondition}
                                                    sx={{
                                                        width: 128,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}
                                                    />
                                            ) : sourceProperty?.type == 'number' || sourceProperty?.type == 'float' || sourceProperty?.type == 'integer' ? (
                                                <Select
                                                    key={condition?.if?.property.uuid+'-selectTopCondition-if-'+index}
                                                    onChange={(value) => {
                                                        setTopLevelCondition(value)
                                                        var newConditions = conditions
                                                        newConditions[index].if.condition = value
                                                    setConditions(newConditions)
                                                    }}
                                                    data={[
                                                        {label: 'equals', value: 'equals'},
                                                        {label: 'does not equal', value: 'notEquals'},
                                                        {label: 'is greater than', value: 'greaterThan'},
                                                        {label: 'is less than', value: 'lessThan'},
                                                        {label: 'is greater than or equal to', value: 'greaterThanOrEqual'},
                                                        {label: 'is less than or equal to', value: 'lessThanOrEqual'}
                                                    ]}
                                                    value={topLevelCondition}
                                                    sx={{
                                                        width: 220,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}
                                                    />
                                            ) 
                                            : null
                                    }
                                    <div style={{width: 10}}/>
                                    {
                                        sourceProperty?.type == 'string' && sourceProperty?.enum ? (
                                            
                                            <Select
                                            key={condition?.if?.property.uuid+'-selectCondition-if-'+index}
                                            onChange={(value) => {
                                                var newConditions = conditions
                                                newConditions[index].if.value = value
                                                setTopLevelConditionValue(value)
                                                setConditions(newConditions)
                                            }}
                                            data={sourceProperty?.enum?.map((enumValue) => {
                                                return {label: enumValue, value: enumValue}
                                            })}
                                            value={topLevelConditionValue}
                                            sx={{
                                                width: 380,
                                                '& input': {
                                                    '&:focus':{
                                                        borderColor: 'black'
                                                    },
                                                    fontFamily: 'Visuelt',
                                                    fontSize: '16px',
                                                    fontWeight: 100
                                                }
                                            }}
                                            />
                                            ) : sourceProperty?.type == 'string' && !sourceProperty?.enum ? (
                                                <TextInput 
                                                key={condition?.if?.property.uuid+'-selectCondition-if-'+index}
                                                onChange={(event) => {
                                                    var newConditions = conditions
                                                    newConditions[index].if.value = event.target.value
                                                    setTopLevelConditionValue(event.target.value)
                                                    setConditions(newConditions)
                                                }}
                                                value={topLevelConditionValue}
                                                sx={{
                                                    width: 380,
                                                    '& input': {
                                                        '&:focus':{
                                                            borderColor: 'black'
                                                        },
                                                        fontFamily: 'Visuelt',
                                                        fontSize: '16px',
                                                        fontWeight: 100
                                                    }
                                                    }}
                                                />
                                            
                                            ) : sourceProperty?.type == 'boolean' ? (
                                                    <Select
                                                    key={condition?.if?.property.uuid+'-selectCondition-if-'+index}
                                                    onChange={(value) => {
                                                        var newConditions = conditions
                                                        newConditions[index].if.value = value
                                                        setTopLevelConditionValue(value)
                                                        setConditions(newConditions)
                                                    }}
                                                    data={[
                                                        {label: 'true', value: true},
                                                        {label: 'false', value: false},
                                                    ]}
                                                    value={topLevelConditionValue}
                                                    sx={{
                                                        width: 380,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}
                                                    />
                                            ) : sourceProperty?.type == 'number' || sourceProperty?.type == 'float' || sourceProperty?.type == 'integer' ? (
                                                <NumberInput 
                                                    key={condition?.if?.property.uuid+'-selectCondition-if-'+index}
                                                    onChange={(event) => {
                                                        var newConditions = conditions
                                                        newConditions[index].if.value = event
                                                        setTopLevelConditionValue(event)
                                                        setConditions(newConditions)
                                                    }}
                                                    value={topLevelConditionValue}
                                                    sx={{
                                                        width: 290,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}
                                                />
                                            )
                                            : null
                                    }
                                    <div style={{width: 10}}/>
                                    {
                                        conditions.length > 1 ? (
                                            <ActionIcon 
                                            disabled={true}
                                            onClick={() => {
                                                console.log('deleteCondition')
                                            }}
                                            style={{width: 40, height: 40, color: 'black', fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 400,}}
                                        >
                                            <Image alt="delete" src={cancelIcon} style={{width: 20, height: 20}}/>
                                        </ActionIcon>
                                        ) : null
                                    }
                                </div>
                                <div style={{display:'flex', flexDirection: 'column'}}>

                                    {/* OR CONDITIONS */}
                                    {
                                        condition?.if?.or?.map((orCondition, index) => {
                                            return (
                                                <div key={orCondition+"-"+index}  style={{display: 'flex', flexDirection: 'column'}}>
                                                 <div style={{display:'flex', flexDirection: 'row', paddingTop: 10}}>
                                                    <div style={{paddingLeft: 10, width: 190, height: 35, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}/>
                                                    {
                                                        sourceProperty?.type == 'string' ? (
                                                            // StringConditions(orCondition?.property, index, 'or', conditions, setConditions, condition, orCondition?.condition)
                                                            <Select
                                                            key={orCondition.uuid+'-selectCondition-or-'+index}
                                                            value={orCondition?.condition}
                                                            onChange={(value) => {
                                                                var updatedConditions = [...conditions]
                                                                updatedConditions.filter((conditionItem) => {
                                                                    if (conditionItem.uuid == condition.uuid) {
                                                                        conditionItem.if.or[index].condition = value
                                                                    }
                                                                }
                                                                )
                                                                setConditions(updatedConditions)
                                                            }}
                                                            data={[
                                                                {label: 'is', value: 'equals'},
                                                                {label: 'is not', value: 'notEquals'},
                                                            ]}
                                                            sx={{
                                                                width: 128,
                                                                '& input': {
                                                                    '&:focus':{
                                                                        borderColor: 'black'
                                                                    },
                                                                    fontFamily: 'Visuelt',
                                                                    fontSize: '16px',
                                                                    fontWeight: 100
                                                                }
                                                            }} />

                                                        ) : sourceProperty?.type == 'boolean' ? (
                                                            <Select
                                                            key={orCondition.uuid+'-selectCondition-or-'+index}
                                                            value={orCondition?.condition}
                                                            onChange={(value) => {
                                                                var updatedConditions = [...conditions]
                                                                updatedConditions.filter((conditionItem) => {
                                                                    if (conditionItem.uuid == condition.uuid) {
                                                                        conditionItem.if.or[index].condition = value
                                                                    }
                                                                }
                                                                )
                                                                setConditions(updatedConditions)
                                                            }}
                                                            data={[
                                                                {label: 'is', value: 'equals'},
                                                                {label: 'is not', value: 'notEquals'},
                                                            ]}
                                                            sx={{
                                                                width: 128,
                                                                '& input': {
                                                                    '&:focus':{
                                                                        borderColor: 'black'
                                                                    },
                                                                    fontFamily: 'Visuelt',
                                                                    fontSize: '16px',
                                                                    fontWeight: 100
                                                                }
                                                            }} />
                                                        ) : sourceProperty?.type == 'number' || sourceProperty?.type == 'float' || sourceProperty?.type == 'integer'? (
                                                            <Select
                                                                key={orCondition.uuid+'-selectCondition-or-'+index}
                                                            value={orCondition?.condition}
                                                            onChange={(value) => {
                                                                var updatedConditions = [...conditions]
                                                                updatedConditions.filter((conditionItem) => {
                                                                    if (conditionItem.uuid == condition.uuid) {
                                                                        conditionItem.if.or[index].condition = value
                                                                    }
                                                                }
                                                                )
                                                                setConditions(updatedConditions)
                                                            }}
                                                            data={[
                                                                {label: 'equals', value: 'equals'},
                                                                {label: 'does not equal', value: 'notEquals'},
                                                                {label: 'is greater than', value: 'greaterThan'},
                                                                {label: 'is less than', value: 'lessThan'},
                                                                {label: 'is greater than or equal to', value: 'greaterThanOrEqual'},
                                                                {label: 'is less than or equal to', value: 'lessThanOrEqual'}
                                                            ]}
                                                            sx={{
                                                                width: 220,
                                                                '& input': {
                                                                    '&:focus':{
                                                                        borderColor: 'black'
                                                                    },
                                                                    fontFamily: 'Visuelt',
                                                                    fontSize: '16px',
                                                                    fontWeight: 100
                                                                }
                                                            }} />
                                                        ) : null
                                                    }
                                                    <div style={{width: 10}}/>
                                                    {
                                                        sourceProperty?.type == 'string' && sourceProperty?.enum ? (
                                                            // StringOptions(orCondition?.property, index, 'or', conditions, setConditions, condition, orCondition?.value)
                                                            <Select
                                                            key={orCondition.uuid+'-selectOption-or-'+index}
                                                            onChange={(value) => {
                                                                var updatedConditions = [...conditions]
                                                                updatedConditions.filter((conditionItem) => {
                                                                    if (conditionItem.uuid == condition.uuid) {
                                                                        conditionItem.if.or[index].value = value
                                                                    }
                                                                }
                                                                )
                                                                setConditions(updatedConditions)
                                                            }}
                                                            value={orCondition?.value}
                                                            data={sourceProperty?.enum?.map((enumItem) => {
                                                                return {label: enumItem, value: enumItem}
                                                            }
                                                            )}
                                                            sx={{
                                                                width: 380,
                                                                '& input': {
                                                                    '&:focus':{
                                                                        borderColor: 'black'
                                                                    },
                                                                    fontFamily: 'Visuelt',
                                                                    fontSize: '16px',
                                                                    fontWeight: 100
                                                                }
                                                            }} />

                                                       ) : sourceProperty?.type == 'boolean' ? (
                                                            <Select
                                                                key={orCondition.uuid+'-selectOption-or-'+index}
                                                                onChange={(value) => {
                                                                var updatedConditions = [...conditions]
                                                                    updatedConditions.filter((conditionItem) => {
                                                                        if (conditionItem.uuid == condition.uuid) {
                                                                            conditionItem.if.or[index].value = value
                                                                        }
                                                                    }
                                                                    )
                                                                    setConditions(updatedConditions)
                                                                }}
                                                                value={orCondition?.value}
                                                                data={[
                                                                    {label: 'true', value: true},
                                                                    {label: 'false', value: false},
                                                                ]}
                                                                sx={{
                                                                    width: 380,
                                                                    '& input': {
                                                                        '&:focus':{
                                                                            borderColor: 'black'
                                                                        },
                                                                        fontFamily: 'Visuelt',
                                                                        fontSize: '16px',
                                                                        fontWeight: 100
                                                                    }
                                                                }} />
                                                       ) : sourceProperty?.type == 'number' || sourceProperty?.type == 'float' || sourceProperty?.type == 'integer'  ? (
                                                        <NumberInput
                                                            key={orCondition.uuid+'-input-or-'+index}
                                                            value={orCondition?.value}
                                                            onChange={(event) => {
                                                                var updatedConditions = [...conditions]
                                                                updatedConditions.filter((conditionItem) => {
                                                                    if (conditionItem.uuid == condition.uuid) {
                                                                        conditionItem.if.or[index].value = event
                                                                    }
                                                                }
                                                            )
                                                                setConditions(updatedConditions)
                                                            }}
                                                            sx={{
                                                                width: 290,
                                                                '& input': {
                                                                    '&:focus':{
                                                                        borderColor: 'black'
                                                                    },
                                                                    fontFamily: 'Visuelt',
                                                                    fontSize: '16px',
                                                                    fontWeight: 100
                                                                }
                                                            }} />
                                                       ) : (
                                                          <TextInput
                                                            key={orCondition.uuid+'-input-or-'+index}
                                                            value={orCondition?.value}
                                                            onChange={(event) => {
                                                                var updatedConditions = [...conditions]
                                                                updatedConditions.filter((conditionItem) => {
                                                                    if (conditionItem.uuid == condition.uuid) {
                                                                        conditionItem.if.or[index].value = event.target.value
                                                                    }
                                                                }
                                                                )
                                                                setConditions(updatedConditions)
                                                            }}
                                                            sx={{
                                                                width: 380,
                                                                '& input': {
                                                                    '&:focus':{
                                                                        borderColor: 'black'
                                                                    },
                                                                    fontFamily: 'Visuelt',
                                                                    fontSize: '16px',
                                                                    fontWeight: 100
                                                                }
                                                            }} />

                                                       )
                                                    }
                                                    <div style={{width: 10}}/>
                                                    <ActionIcon 
                                                        onClick={() => {
                                                            var updatedConditions = [...conditions]
                                                            updatedConditions.filter((conditionItem) => {
                                                                if (conditionItem.uuid == condition.uuid) {
                                                                    conditionItem.if.or = conditionItem.if.or.filter((orConditionItem) => {
                                                                        if (orConditionItem.uuid != orCondition.uuid) {
                                                                            return orConditionItem
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                            setConditions(updatedConditions)
                
                                                        }}
                                                        style={{width: 40, height: 40, color: 'black', fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 400,}}
                                                    >
                                                        <Image alt="delete" src={cancelIcon} style={{width: 20, height: 20}}/>
                                                    </ActionIcon>
                                                    
                                                 </div>
                                      
                                                </div>
                                               
                                                
                                            )

                                        })
                                    }
                                    
                                 <div style={{display:'flex', flexDirection: 'row'}}>
                                <div style={{paddingLeft: 10, width: 180, height: 35, borderRadius:4, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}/>
                                    <div style={{width: 10}}/>
                                    <Anchor 
                                        onClick={() => {
                                            var updatedConditions = [...conditions]
                                            updatedConditions.filter((conditionItem) => {
                                                if (conditionItem.uuid == condition.uuid) {
                                                    var uuid = uuidv4()
                                                    condition.if.or.push({
                                                        "uuid": uuid,
                                                        "property": sourceProperty,
                                                        "condition": "equals",
                                                        "value": ""
                                                    })
                                                }
                                            })
                                            setConditions(updatedConditions)

                                        }}
                                        sx={{
                                            height: 40,
                                            backgroundColor: '#FFFFFF',
                                            color: 'black',
                                            fontFamily: 'Visuelt',
                                            fontSize: '16px',
                                            fontWeight: 400,
                                        }}
                                    >
                                        + Or
                                    </Anchor>
                                    </div>
                                </div>
                                    
                            </div>
                            <div style={{width: 10}}/>
                            <div style={{display:'flex', paddingTop: 10, paddingRight: 10, flexDirection: 'row', justifyContent:'space-between'}}>
                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                    Then 
                                </Text>
                                <div style={{width: 10}}/>
                            </div>
                            <div>
                                    <div style={{display:'flex', flexDirection: 'row'}}>
                                        <div style={{paddingLeft: 10, width: 180, height: 35, border: '1px solid #EBEBEB', borderRadius:4, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}>
                                            <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                                                {condition?.then?.property?.key}
                                            </Text>
                                        </div>
                                        <div style={{width: 10}}/>
                                        <Select
                                            key={condition.uuid+'-selectCondition-then'}
                                            data={[
                                                {label: 'is', value: 'equals'}
                                            ]}
                                            onChange={(value) => {
                                                var updatedConditions = [...conditions]
                                                updatedConditions.filter((conditionItem) => {
                                                    if (conditionItem.uuid == condition.uuid) {
                                                        conditionItem.then.condition = value
                                                    }
                                                })
                                                setConditions(updatedConditions)
                                            }}
                                            value={condition.then.condition}
                                            sx={{
                                                width: 128,
                                                '& input': {
                                                    '&:focus':{
                                                        borderColor: 'black'
                                                    },
                                                    fontFamily: 'Visuelt',
                                                    fontSize: '16px',
                                                    fontWeight: 100
                                                }
                                            }}/>
                                        <div style={{width: 10}}/>
                                        {
                                            targetProperty?.type == 'string' && targetProperty?.enum ? (
                                                // StringOptions(condition?.then?.property,index, 'then', conditions, setConditions, condition, condition.then?.value)
                                                <Select
                                                key={condition.uuid+'-selectOption-then'}
                                                onChange={(value) => {
                                                    var updatedConditions = [...conditions]
                                                    updatedConditions.filter((conditionItem) => {
                                                        if (conditionItem.uuid == condition.uuid) {
                                                            conditionItem.then.value = value
                                                        }
                                                    }
                                                    )
                                                    setConditions(updatedConditions)
                                                }}
                                                value={condition.then?.value}
                                                data={targetProperty?.enum?.map((enumItem) => {
                                                    return {label: enumItem, value: enumItem}
                                                }
                                                )}
                                                sx={{
                                                    width: 380,
                                                    '& input': {
                                                        '&:focus':{
                                                            borderColor: 'black'
                                                        },
                                                        fontFamily: 'Visuelt',
                                                        fontSize: '16px',
                                                        fontWeight: 100
                                                    }
                                                }}/>
                                            ) : targetProperty?.type == 'string' ? (
                                                <TextInput
                                                    key={condition.uuid+'-input-then'}
                                                    value={condition?.then?.value}
                                                    onChange={(event) => {
                                                        var updatedConditions = [...conditions]
                                                        updatedConditions.filter((conditionItem) => {
                                                            if (conditionItem.uuid == condition.uuid) {
                                                                conditionItem.then.value = event.target.value
                                                            }
                                                        }
                                                        )
                                                        setConditions(updatedConditions)
                                                    }}
                                                    sx={{
                                                        width: 380,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}/>
                                            ) : targetProperty?.type == 'boolean' ? (
                                                <Select
                                                    key={condition.uuid+'-selectOption-then'}
                                                    onChange={(value) => {
                                                        var updatedConditions = [...conditions]
                                                        updatedConditions.filter((conditionItem) => {
                                                            if (conditionItem.uuid == condition.uuid) {
                                                                conditionItem.then.value = value
                                                            }
                                                        }
                                                        )
                                                        setConditions(updatedConditions)
                                                    }}
                                                    value={condition.then?.value}
                                                    data={[
                                                        {label: 'true', value: true},
                                                        {label: 'false', value: false}
                                                    ]}
                                                    sx={{
                                                        width: 380,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}/>
                                            ) : null
                                            
                                        }
                                        <div style={{width: 10}}/>
                                    </div>
                                    <div style={{display:'flex', flexDirection: 'row'}}>
                                        <div style={{paddingLeft: 10, width: 180, height: 20, borderRadius:4, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}/>
                                    </div>
                            </div>
                            <div style={{width: 10}}/>
                            <div style={{display:'flex', paddingTop: 10, paddingRight: 10, flexDirection: 'row', justifyContent:'space-between'}}>
                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                    Else 
                                </Text>
                                <div style={{width: 10}}/>
                            </div>
                            <div>
                                    <div style={{display:'flex', flexDirection: 'row'}}>
                                        <div style={{paddingLeft: 10, width: 180, height: 35, border: '1px solid #EBEBEB', borderRadius:4, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}>
                                            <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                                                {condition?.else?.property?.key}
                                            </Text>
                                        </div>
                                        <div style={{width: 10}}/>
                                        <Select
                                            key={condition.uuid+'-selectCondition-else'}
                                            data={[
                                                {label: 'is', value: 'equals'}
                                            ]}
                                            onChange={(value) => {
                                                var updatedConditions = [...conditions]
                                                updatedConditions.filter((conditionItem) => {
                                                    if (conditionItem.uuid == condition.uuid) {
                                                        conditionItem.else.condition = value
                                                    }
                                                })
                                                setConditions(updatedConditions)
                                            }}
                                            value={condition?.else?.condition}
                                            sx={{
                                                width: 128,
                                                '& input': {
                                                    '&:focus':{
                                                        borderColor: 'black'
                                                    },
                                                    fontFamily: 'Visuelt',
                                                    fontSize: '16px',
                                                    fontWeight: 100
                                                }
                                            }}/>
                                        <div style={{width: 10}}/>
                                        {
                                            targetProperty?.type == 'string' && targetProperty?.enum ? (
                                                // StringOptions(condition?.then?.property,index, 'then', conditions, setConditions, condition, condition.then?.value)
                                                <Select
                                                key={condition.uuid+'-selectOption-else'}
                                                onChange={(value) => {
                                                    var updatedConditions = [...conditions]
                                                    updatedConditions.filter((conditionItem) => {
                                                        if (conditionItem.uuid == condition.uuid) {
                                                            conditionItem.else.value = value
                                                        }
                                                    }
                                                    )
                                                    setConditions(updatedConditions)
                                                }}
                                                value={condition.else?.value}
                                                data={targetProperty?.enum?.map((enumItem) => {
                                                    return {label: enumItem, value: enumItem}
                                                }
                                                )}
                                                sx={{
                                                    width: 380,
                                                    '& input': {
                                                        '&:focus':{
                                                            borderColor: 'black'
                                                        },
                                                        fontFamily: 'Visuelt',
                                                        fontSize: '16px',
                                                        fontWeight: 100
                                                    }
                                                }}/>
                                            ) : targetProperty?.type == 'string' ? (
                                                <TextInput
                                                    key={condition.uuid+'-input-else'}
                                                    value={condition?.else?.value}
                                                    onChange={(event) => {
                                                        var updatedConditions = [...conditions]
                                                        updatedConditions.filter((conditionItem) => {
                                                            if (conditionItem.uuid == condition.uuid) {
                                                                conditionItem.else.value = event.target.value
                                                            }
                                                        }
                                                        )
                                                        setConditions(updatedConditions)
                                                    }}
                                                    sx={{
                                                        width: 380,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}/>
                                            ) : targetProperty?.type == 'boolean' ? (
                                                <Select
                                                    key={condition.uuid+'-selectOption-else'}
                                                    onChange={(value) => {
                                                        var updatedConditions = [...conditions]
                                                        updatedConditions.filter((conditionItem) => {
                                                            if (conditionItem.uuid == condition.uuid) {
                                                                conditionItem.else.value = value
                                                            }
                                                        }
                                                        )
                                                        setConditions(updatedConditions)
                                                    }}
                                                    value={condition.else?.value}
                                                    data={[
                                                        {label: 'true', value: true},
                                                        {label: 'false', value: false}
                                                    ]}
                                                    sx={{
                                                        width: 380,
                                                        '& input': {
                                                            '&:focus':{
                                                                borderColor: 'black'
                                                            },
                                                            fontFamily: 'Visuelt',
                                                            fontSize: '16px',
                                                            fontWeight: 100
                                                        }
                                                    }}/>
                                            ) : null
                                            
                                        }
                                        <div style={{width: 10}}/>
                                    </div>
                                    <div style={{display:'flex', flexDirection: 'row'}}>
                                        <div style={{paddingLeft: 10, width: 180, height: 20, borderRadius:4, display: 'flex', flexDirection: 'row', justifyContent:'left', alignItems:'center'}}/>
                                    </div>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}

export default IfThenRecipeCard
