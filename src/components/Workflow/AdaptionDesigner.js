
import { Divider, Badge, Button, Text, ActionIcon, Menu, TextInput } from "@mantine/core"
import {BiPlus} from 'react-icons/bi'
import {BsChevronDown} from 'react-icons/bs'
import {HiOutlineLightningBolt} from 'react-icons/hi'
import {RiCloseLine} from 'react-icons/ri'
import { useState } from "react"
import {v4 as uuidv4} from 'uuid'
import {AppendCard, PrependCard, ReplaceCard, ConcatenateCard, SubstringCard, TrimCard, UppercaseCard, LowercaseCard, CapitalizeCard} from './RecipeCards/StringRecipes'

const AdaptionDesigner = ({ mappings, selectedMapping, source, target}) => {

    const [formulas, setFormulas] = useState([])

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
            description: 'Adds the provided string to the end of the source string'
        }, {
            name: 'Prepend',
            formula: 'prepend',
            description: 'Adds the provided string to the beginning of the source string'
        }, {
            name: 'Replace',
            formula: 'replace',
            description: 'Replaces the provided substring of the source text with the provided string'
        },{
            name: 'Substring',
            formula: 'substring',
            description: 'Extracts a substring from the source string'
        }, {
            name: 'Trim',
            formula: 'trim',
            description: 'Removes leading and trailing whitespace from the source string'
        }, {
            name: 'Lowercase',
            formula: 'lowercase',
            description: 'Converts the source string to lowercase'
        }, {
            name: 'Uppercase',
            formula: 'uppercase',
            description: 'Converts the source string to uppercase'
        }, {
            name: 'Capitalize',
            formula: 'capitalize',
            description: 'Capitalizes the first letter of the source string and converts the rest to lowercase'
        },
        // {
        //     name: 'Concatenate', 
        //     formula:'concatenate',
        //     description: 'Concatenates the source string with the provided string'
        // }
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
                                    setFormulas([...formulas, formulaObject])
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
                                            setFormulas([...formulas, formulaObject])
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
        setFormulas(newFormulas)
    }


    const renderFormulaCards = () => {
        return(
            formulas.map((formula) => {
                    return(
                        <>
                            <div style={{display:'flex', flexDirection:'Column', border: '1px solid #E4E2DF', borderRadius: 12, width: '98%', padding: 18, paddingLeft: 20, paddingRight:20, background:'#F8F6F3', justifyContent: 'space-between', alignItems:'center'}}>
                            <div style={{display:'flex', flexDirection:'row',width: '100%', justifyContent: 'space-between', alignItems:'start'}}> 
                               <div style={{display:'block'}}>
                                    <Text style={{fontFamily:'Visuelt', fontWeight: 500, fontSize:'16px'}}>{formula.name}</Text>
                                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, fontSize:'13px'}}>{formula.description}</Text>
                               </div>
                               
                               <ActionIcon  
                                    onClick={()=>{
                                      removeFormula(formula.uuid) 
                                    }}>
                                    <RiCloseLine/>
                               </ActionIcon>
                            </div>
                            <div style={{height: 20}}/>
                            {
                                formula.formula == 'append' ? 
                                        <AppendCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : formula.formula == 'prepend' ? 
                                    <PrependCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : formula.formula == 'replace' ? 
                                    <ReplaceCard sourceProperty={selectedMapping?.sourceProperty}/>
                                // : formula.formula == 'concatenate' ?
                                //     <ConcatenateCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : formula.formula == 'substring' ?
                                    <SubstringCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : formula.formula == 'trim' ?
                                    <TrimCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : formula.formula == 'lowercase' ?
                                    <LowercaseCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : formula.formula == 'uppercase' ?
                                    <UppercaseCard sourceProperty={selectedMapping?.sourceProperty} />
                                : formula.formula == 'capitalize' ?
                                    <CapitalizeCard sourceProperty={selectedMapping?.sourceProperty}/>
                                : null
                            }
                            </div>
                            <div style={{height: 20}}/>
                        </>
                       
                        
                    )
            })
        )
       
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
                {renderFormulaCards()}
            </div>
        </div>
    )

}

export default AdaptionDesigner