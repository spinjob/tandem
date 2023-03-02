import {Card, Text, TextInput, Button, ActionIcon, Modal, Select, Loader} from '@mantine/core'
import {useEffect, useState} from 'react'

const AppendCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {
    
    const [inputs, setInputs] = useState(recipe?.inputs?.append)

    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                Add 
            </Text>
            <div style={{width: 10}}/>
            <TextInput
                placeholder="String to append"
                onChange={(e)=>{
                    updateFormula(recipe.uuid, {append: e.currentTarget.value})
                    setInputs(e.currentTarget.value)
                }}
                value={inputs}
                sx={{
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

            <div style={{width: 10}}/>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                to the end of the
            </Text>
            <div style={{width: 5}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const PrependCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty }) => {
    const [inputs, setInputs] = useState(recipe?.inputs?.prepend)
    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                Add 
            </Text>
            <div style={{width: 10}}/>
            <TextInput
                onChange={(e)=>{
                    updateFormula(recipe.uuid, {prepend: e.currentTarget.value})
                    setInputs(e.currentTarget.value)
                }}
                value={inputs}
                placeholder="String to append"
                sx={{
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

            <div style={{width: 10}}/>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                to the beginning of the
            </Text>
            <div style={{width: 5}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const ReplaceCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {
    console.log(recipe)
    const [replaceFormulaState, setReplaceFormulaState] = useState({
        toReplace: '',
        replaceWith: ''
    })

    useEffect(()=>{
        updateFormula(recipe.uuid, replaceFormulaState)
    }, [replaceFormulaState, updateFormula, recipe.uuid])
    
    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                Replace instances of
            </Text>
            <div style={{width: 10}}/>
            <TextInput
                placeholder="Characters to replace"
                onChange={(e)=>{
                    setReplaceFormulaState({...replaceFormulaState, toReplace: e.currentTarget.value})
                }}
                sx={{
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
            <div style={{width: 10}}/>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                with
            </Text>
            <div style={{width: 10}}/>
            <TextInput
                placeholder="Replacement string"
                onChange={(e)=>{
                    setReplaceFormulaState({...replaceFormulaState, replaceWith: e.currentTarget.value})
                }}
                sx={{
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
            <div style={{width: 10}}/>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                within the
            </Text>
            <div style={{width: 5}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const ConcatenateCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty }) => {
    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                Add 
            </Text>
            <div style={{width: 10}}/>
            <TextInput
                placeholder="String to append"
                sx={{
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

            <div style={{width: 10}}/>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                to the beginning of the
            </Text>
            <div style={{width: 10}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const SubstringCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                Extract the 
            </Text>
            <div style={{height: 5}}/>
            <Select
                data={[
                    {label: 'First', value: 'first'},
                    {label: 'Last', value: 'last'},
                ]}
                sx={{
                    '& select': {
                        '&:focus':{
                            borderColor: 'black'
                        },
                        fontFamily: 'Visuelt',
                        fontSize: '16px',
                        fontWeight: 100
                    }
                }}

            />
            <div style={{width: 10}}/>
            <TextInput
                placeholder="String to append"
                sx={{
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

            <div style={{width: 10}}/>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                to the beginning of the
            </Text>
            <div style={{width: 10}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const TrimCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const UppercaseCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const LowercaseCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return(
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const CapitalizeCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

export {AppendCard, PrependCard, ReplaceCard, ConcatenateCard, SubstringCard, TrimCard, UppercaseCard, LowercaseCard, CapitalizeCard}