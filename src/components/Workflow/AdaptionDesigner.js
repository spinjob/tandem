
import { Divider, Badge, Button, Text, ActionIcon, Menu, TextInput } from "@mantine/core"
import { useListState } from "@mantine/hooks"
import {BiPlus} from 'react-icons/bi'
import {BsChevronDown} from 'react-icons/bs'
import {HiOutlineLightningBolt} from 'react-icons/hi'
import {RiCloseLine} from 'react-icons/ri'
import { useState } from "react"
import {v4 as uuidv4} from 'uuid'
import {FormulaBuilder} from './FormulaBuilder'

const AdaptionDesigner = ({ formulas, handlers, mappings, selectedMapping, source, target}) => {


    const conditionMenuItems = [
        {
            name: 'If, then',
            formula: 'ifthen',
            description: 'Specify conditions to apply to the source property and the value to be applied if the conditions are met.' 
        }
    ]
    const stringFormulas = [
        {
            name: 'Append',
            formula: 'append',
            description: 'Adds the provided string to the end of the source string',
            inputs: {}
        }, {
            name: 'Prepend',
            formula: 'prepend',
            description: 'Adds the provided string to the beginning of the source string',
            inputs: {}
        }, {
            name: 'Replace',
            formula: 'replace',
            description: 'Replaces the provided substring of the source text with the provided string',
            inputs: {}
        
        },{
            name: 'Substring',
            formula: 'substring',
            description: 'Extracts a substring from the source string',
            inputs: {}
        }, {
            name: 'Trim',
            formula: 'trim',
            description: 'Removes leading and trailing whitespace from the source string',
            inputs: {}
        }, {
            name: 'Lowercase',
            formula: 'lowercase',
            description: 'Converts the source string to lowercase',
            inputs: {}
        }, {
            name: 'Uppercase',
            formula: 'uppercase',
            description: 'Converts the source string to uppercase',
            inputs: {}
        }, {
            name: 'Capitalize',
            formula: 'capitalize',
            description: 'Capitalizes the first letter of the source string and converts the rest to lowercase',
            inputs: {}
        }
    ]

    const renderOverflowDropdownMenu = (items) => {
        return(
            <Menu transition="pop-bottom" position='bottom' width={220} withinPortal>
            <Menu.Target>
                <ActionIcon 
                    style={{cursor: 'pointer', minWidth: 100, display:'flex', flexDirection: 'row', alignItems: 'center', height: 30, backgroundColor:'#B5B6FF'}} 
                    variant={'filled'} 
                    radius={'xl'}>
                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>More</Text>
                    <div style={{width: 5}}/>
                    <BsChevronDown 
                        style={{width: 15, height: 15, color: 'black'}}/>
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {
                    items.map((item) => {
                        var itemId = uuidv4()
                        return(
                            <Menu.Item
                                key={itemId}
                                onClick={()=>{
                                    var formulaObject = {
                                        ...item,
                                        uuid: itemId
                                    }
                                    handlers.setState([...formulas, formulaObject])
                                }}
                            >
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>{item.name}</Text>
                                    <div style={{width: 5}}/>
                                    <BiPlus style={{width: 15, height: 15, color: 'black'}}/>
                                </div>
                            </Menu.Item>
                        )
                    })
                }
            </Menu.Dropdown>
        </Menu>
        )
       
    }

    const renderConditionMenu = () => {
        return(
            <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'left', alignItems: 'center'}}>
                {conditionMenuItems.map((item, index) => {
                    return(
                        <div key={item.formula} style={{paddingLeft: 5, paddingRight: 5}}>
                            <ActionIcon
                                onClick={()=>{
                                    var formulaObject = {
                                        ...item,
                                        uuid: uuidv4()
                                    }
                                    handlers.setState([...formulas, formulaObject])
                                }}
                                sx={{
                                    ':hover': {
                                        backgroundColor: '#FFC97F'
                                    },
                                    paddingLeft: 10, 
                                    paddingRight: 10, 
                                    cursor: 'pointer', 
                                    width: '100%', 
                                    display:'flex', 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    height: 32, 
                                    backgroundColor:'#FFDFB4'
                                }}
                                variant={'filled'}
                                radius={'xl'}>
                                <HiOutlineLightningBolt style={{width: 18, height: 18, color: 'black'}}/>
                                <div style={{width: 5}}/>
                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>{item.name}</Text>
                                <div style={{width: 5}}/>
                                <BiPlus style={{width: 18, height: 18, color: 'black'}}/>
                            </ActionIcon>
                        </div>
                    )
                })}
            </div>
        )
    }

    function reorderFormulas(from, to) {
        handlers.reorder(from, to)
    }

    const renderRecipeMenu = () => {
        var sourcePropertyType = selectedMapping.sourceProperty.type
        var targetPropertyType = selectedMapping.targetProperty.type
        var overflowMenu = []

        //String Recipe Menu
        if(sourcePropertyType == 'string'){
            return (
                <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'left', alignItems: 'center'}}>
                    {stringFormulas.map((formula, index) => {
                        if(index > 5){
                            overflowMenu.push(formula)
                        } else {
                            return(
                                <div key={formula.formula} style={{paddingLeft: 5, paddingRight: 5}}>
                                    <ActionIcon 
                                        onClick={()=>{
                                            var formulaObject = {
                                                ...formula,
                                                uuid: uuidv4()
                                            }
                                            handlers.setState([...formulas, formulaObject])
                                        }}
                                        sx={{
                                            ':hover': {
                                                backgroundColor: '#C9CAFF'
                                            },
                                            paddingLeft: 10, 
                                            paddingRight: 10, 
                                            cursor: 'pointer', 
                                            width: '100%', 
                                            display:'flex', 
                                            flexDirection: 'row', 
                                            alignItems: 'center', 
                                            height: 32, 
                                            backgroundColor:'#EAEAFF'
                                        }}                                        
                                        variant={'filled'} 
                                        radius={'xl'}>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>{formula.name}</Text>
                                        <div style={{width: 5}}/>
                                        <BiPlus style={{width: 18, height: 18, color: 'black'}}/>
                                    </ActionIcon>
                                    <div style={{width: 10}}/>
                                </div>
                                
                            )
                        }   
                    })}
                    {
                        overflowMenu.length > 0 ? renderOverflowDropdownMenu(overflowMenu) : null
                    }
                   
                </div>
            )
        }

    }

    const renderParentContextBanner = (parentContextTypes) => {
     
       return parentContextTypes.map((parentContext, index) => {
           if(parentContext.contextType == 'dictionary') {
                return ( 
                    <div key={parentContext.contextType + '_'+index} style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width: '100%'}}>
                        <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', width: '100%', height: 30, backgroundColor: '#F8F6F3', borderRadius: 12}}>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>For each</Text>
                            <div style={{width: 5}}/>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}> {parentContext.dictionaryKey}</Text>
                            <div style={{width: 5}}/>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>in</Text>
                            <div style={{width: 5}}/>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>{parentContext.parentContextKey}</Text>
                            <div style={{width: 5}}/>
                            { 
                                index == parentContextTypes.length - 1 ? (
                                    <>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>run this adaption on</Text>
                                        <div style={{width: 5}}/>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}> {selectedMapping?.sourceProperty?.path}:</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>and...</Text>
                                    </>
                                )
                            }
                            
                        </div>
                        <div style={{height: 10}}/>
                    </div>
                )
           } else if(parentContext.contextType == 'array') {
                return  (  
                    <div key={parentContext.contextType + '_'+index} style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width: '100%'}}>
                        <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', width: '100%', height: 30, backgroundColor: '#F8F6F3', borderRadius: 12}}>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>For each item in</Text>
                            <div style={{width: 5}}/>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>{parentContext.parentContextKey}</Text>
                            <div style={{width: 5}}/>
                            { 
                                index == parentContextTypes.length - 1 ? (
                                    <>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>run this adaption on</Text>
                                        <div style={{width: 5}}/>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}> {selectedMapping?.sourceProperty?.path}:</Text>
                                    </>
                                ) : ( 
                                    <>
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>and...</Text>
                                    </>
                                )
                            }
                        </div>
                        <div style={{height: 10}}/>
                    </div>
                )
            }
                
        })
    }

    const removeFormula = (uuid) => {
        var newFormulas = formulas.filter((formula) => {
            return formula.uuid != uuid
        })
        handlers.setState(newFormulas)
    }

    //Utility Functions
    const append = (value, input) => {
        console.log(value, input)
        return value + input.append
    }

    const prepend = (value, input) => {
        return input.prepend + value
    }

    const replace = (value, input) => {
        var toReplace = input.toReplace
        var replaceWith = input.replaceWith
        return value.replace(toReplace, replaceWith)
    }

    const ifThen = (value, input) => {
        var inputValues = input['ifThen'][0]
        var conditionSatisfied = false 
        if(inputValues.if.property.path == inputValues.if.value && !conditionSatisfied){
            conditionSatisfied = true
            return inputValues.then.value
        } else if (!conditionSatisfied && inputValues.if.or.length > 0) {  
            for (let i = 0; i < inputValues.if.or.length; i++) {
                if(!conditionSatisfied){
                    if(inputValues.if.or[i].property.path == inputValues.if.or[i].value) {
                        conditionSatisfied = true
                        return inputValues.then.value
                    } else {
                
                    }
                } else {
                    return inputValues.then.value
                }
            }
        }
        return value
    }

    function updateFormula(uuid, inputs) {
        handlers.applyWhere(
            (item)=> item.uuid == uuid,
            (item)=> {
                var updatedItem = {
                    ...item,
                    inputs: inputs
                }
                return updatedItem
               
            }
        )

    }

    function renderSampleOutput (exampleValue, position) {

        var output = exampleValue
        var formulaOutputs = []
        for (let i = 0; i < formulas.length; i++) {
            var formula = formulas[i]
            if(formula.formula == 'append' && Object.keys(formula.inputs).length > 0) {
                output = append(output, formula.inputs)
                formulaOutputs.push(output)
            } else if(formula.formula == 'prepend' && Object.keys(formula.inputs).length > 0) {
                output = prepend(output, formula.inputs)
                formulaOutputs.push(output)
            } else if(formula.formula == 'replace' && Object.keys(formula.inputs).length > 0) {
                output = replace(output, formula.inputs)
                formulaOutputs.push(output)
            } 
            // else if (formula.formula == 'ifthen' && Object.keys(formula.inputs).length > 0) {
            //     output = ifThen(output,formula.inputs)
            //     formulaOutputs.push(output)
            // }
        }
        return formulaOutputs
    }


    return (
        <div style={{width: '100%',display: 'flex', flexDirection: 'column',}}>
            {
                selectedMapping?.sourceProperty?.parentContext ? (
                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        {renderParentContextBanner(selectedMapping.sourceProperty.parentContext)}
                        <div style={{height: 20}}/>
                    </div>
                ) : (null)
            }
            <div style={{paddingBottom: 20, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                {renderConditionMenu()}
            </div>
            <div style={{width: '100%', paddingBottom: 20, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                {renderRecipeMenu()}
            </div>
            <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <FormulaBuilder renderSampleOutput={renderSampleOutput} updateFormula={updateFormula} reorderFormulas={reorderFormulas} removeFormula={removeFormula} data={formulas}/>
            </div>
        </div>
    )

}

export default AdaptionDesigner