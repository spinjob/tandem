import {Card, Text, TextInput, Button, ActionIcon, NumberInput, Anchor, Modal, Select, Loader} from '@mantine/core'
import {useEffect, useState} from 'react'
import useStore from '../../../context/store'

const AppendCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {
    
    const [inputs, setInputs] = useState(recipe?.inputs?.append)
    const [showProperties, setShowProperties] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(recipe?.inputs?.append)
    const inputPaths = useStore(state => state.inputPaths)
    var uniquePaths = [...new Set(inputPaths)]

    return( 
        <div style={{paddingLeft: 20,  border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', display:'flex', justifyContent:'center', flexDirection: 'column'}}>
            <div style={{display:'flex',alignItems:'center', justifyContent:'start'}}>
                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                    Add 
                </Text>
                <div style={{width: 10}}/>
                {
                    showProperties ? 
                    (
                        <Select
                        placeholder="Select property"
                        sx={{
                            width: 350
                        }}
                        value={selectedProperty}
                        onChange={(e)=>{
                            updateFormula(recipe.uuid, {append: e})
                            setInputs(e)
                            setSelectedProperty(e)
                        }}
                        data={
                            uniquePaths.map((path) => {
                                return {
                                    label: path,
                                    value: path
                                }
                            })
                        }/>
                    ) : (
                        <TextInput
                        placeholder="String to append"
                        
                        onChange={(e)=>{
                            updateFormula(recipe.uuid, {append: e.currentTarget.value})
                            setInputs(e.currentTarget.value)
                        }}
                        value={inputs}
                        sx={{
                            width: 350,
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
                }
               
                <div style={{width: 10}}/>
                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                    to the end of the
                </Text>
                <div style={{width: 5}}/>
                <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                    {sourceProperty?.key}   
                </Text>
            </div>
            <div style={{display:'flex', marginBottom: -18, alignItems:'flex-start', justifyContent:'flex-start', paddingLeft: '40px',paddingTop: '5px', fontSize:'15px'}}>
                
                {
                    showProperties ?
                    (
                        <Anchor onClick={()=> {
                            setShowProperties(false)
                        }} color={'dark'} underline={true}>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 100, color:'black'}}>
                                Provide value
                            </Text>
                        </Anchor>
                    ): (
                        <Anchor onClick={()=> {
                            setShowProperties(true)
                        }} color={'dark'} underline={true}>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 100, color:'black'}}>
                                Choose property
                            </Text>
                        </Anchor>
                    )
                }
                
              
               
            </div>
        </div>
    )
}

const PrependCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty }) => {
    const [inputs, setInputs] = useState(recipe?.inputs?.prepend)
    const [showProperties, setShowProperties] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(null)
    const inputPaths = useStore(state => state.inputPaths)
    var uniquePaths = [...new Set(inputPaths)]


    return( 
        <div style={{paddingLeft: 20,  border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', display:'flex', justifyContent:'center', flexDirection: 'column'}}>
            <div style={{display:'flex',alignItems:'center', justifyContent:'start'}}>
                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                    Add 
                </Text>
                <div style={{width: 10}}/>
                {
                    showProperties ? 
                    (
                        <Select
                        placeholder="Select property"
                        sx={{
                            width: 350
                        }}
                        value={selectedProperty}
                        onChange={(e)=>{
                            updateFormula(recipe.uuid, {prepend: e})
                            setInputs(e)
                            setSelectedProperty(e)
                        }}
                        data={
                            uniquePaths.map((path) => {
                                return {
                                    label: path,
                                    value: path
                                }
                            })
                        }/>
                    ) : (
                        <TextInput
                        placeholder="String to prepend"
                        
                        onChange={(e)=>{
                            updateFormula(recipe.uuid, {prepend: e.currentTarget.value})
                            setInputs(e.currentTarget.value)
                        }}
                        value={inputs}
                        sx={{
                            width: 350,
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
                }
               
                <div style={{width: 10}}/>
                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                    to the beginning of the
                </Text>
                <div style={{width: 5}}/>
                <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                    {sourceProperty?.key}   
                </Text>
            </div>
            <div style={{display:'flex', marginBottom: -18, alignItems:'flex-start', justifyContent:'flex-start', paddingLeft: '40px',paddingTop: '5px', fontSize:'15px'}}>
                
                {
                    showProperties ?
                    (
                        <Anchor onClick={()=> {
                            setShowProperties(false)
                        }} color={'dark'} underline={true}>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 100, color:'black'}}>
                                Provide value
                            </Text>
                        </Anchor>
                    ): (
                        <Anchor onClick={()=> {
                            setShowProperties(true)
                        }} color={'dark'} underline={true}>
                            <Text sx={{fontFamily:'Visuelt', fontWeight: 100, color:'black'}}>
                                Choose property
                            </Text>
                        </Anchor>
                    )
                }
                
              
               
            </div>
        </div>
    )
}

const ReplaceCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {

    const [replaceFormulaState, setReplaceFormulaState] = useState({
        toReplace: '',
        replaceWith: ''
    })
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
                    updateFormula(recipe.uuid, {"replace": {...replaceFormulaState, toReplace: e.currentTarget.value}})
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
                    updateFormula(recipe.uuid, {"replace": {...replaceFormulaState, replaceWith: e.currentTarget.value}})
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
    const [error, setError] = useState(null)
    const [startingIndex, setStartingIndex] = useState(
        recipe?.inputs?.substring?.startingIndex || 0
    )
    const [endingIndex, setEndingIndex] = useState(
        recipe?.inputs?.substring?.endingIndex || 0
    )
    const [relativeView, setRelativeView] = useState(
        recipe?.inputs?.substring?.startingIndex == 'input.length' ? true : false
    )

    useEffect(()=>{
        if(startingIndex > endingIndex && error == null){
            setError("Must be >= to " + endingIndex)
        } else if(startingIndex <= endingIndex && error != null) {
            setError(null)
        }
    }, [startingIndex, endingIndex, error])

    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            {
                relativeView ? (
                    <div style={{display:'flex', flexDirection: 'column'}}>
                        <div style={{display:'flex', flexDirection: 'row', alignItems: 'baseline'}}>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                Extract the last
                            </Text>
                            <div style={{width: 5}}/>
                            <NumberInput
                                defaultValue={0}
                                placeholder="Number of characters"
                                variant={'filled'}
                                withAsterisk
                                min={0}
                                type={'number'}
                                value={endingIndex}
                                onChange={(e)=>{
                                    setEndingIndex(e)
                                    updateFormula(recipe.uuid, {"substring": {startingIndex: 'input.length', endingIndex: e}})
                                }}
                                sx={{
                                    width: 90
                                }}
                            />
                            <div style={{width: 5}}/>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                characters from the end of the
                            </Text>
                            <div style={{width: 5}}/>
                            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                                {sourceProperty?.key}
                            </Text>

                        </div>
                        <div style={{width: '200px'}}>
                            <Anchor onClick={()=> {
                                setRelativeView(false)
                            }} color={'dark'} underline={true}>
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 100, color:'black'}}>
                                    Select indices instead
                                </Text>
                            </Anchor>
                        </div>
                    </div>
                   
                ): (
                    <div style={{display:'flex', flexDirection: 'column'}}>
                        <div style={{display:'flex', flexDirection: 'row', alignItems:'baseline'}}>
                            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                Extract characters from index 
                            </Text>
                            <div style={{width: 5}}/>
                            <NumberInput
                                defaultValue={0}
                                placeholder="Starting index"
                                variant={'filled'}
                                withAsterisk
                                min={0}
                                type={'number'}
                                value={startingIndex}
                                onChange={(e)=>{
                                    setStartingIndex(e)
                                    updateFormula(recipe.uuid, {"substring": {startingIndex: e, endingIndex: endingIndex}})
                                }}
                                sx={{
                                    width: 90
                                }}
                                error={
                                    error != null ? (
                                        <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'red'}}>
                                            {error}
                                        </Text>
                                    ) : null
            
                                }/>
                            <div style={{width: 10}}/>
                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                    to index
                                </Text>
                                <div style={{width: 10}}/>
                                <NumberInput
                                    defaultValue={0}
                                    placeholder="Starting index"
                                    variant={'filled'}
                                    withAsterisk
                                    type={'number'}
                                    min={startingIndex}
                                    value={endingIndex}
                                    onChange={(e)=>{
                                        setEndingIndex(e)
                                        updateFormula(recipe.uuid, {"substring": {startingIndex: startingIndex, endingIndex: e}})
                                    }}
                                    sx={{
                                        width: 90,
                                
                                    }}
                                /> 
                                <div style={{width: 10}}/> 
                                <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                                from 
                                </Text>
                                <div style={{width: 10}}/> 
                                <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                                    {sourceProperty?.key}   
                                </Text>
                        </div>
                        <div>
                        <div style={{width: '200px'}}>
                            <Anchor
                            onClick={()=> {
                                setRelativeView(true)
                            }} color={'dark'} underline={true}>
                                <Text sx={{fontFamily:'Visuelt', fontWeight: 100, color:'black'}}>
                                    Use input length
                                </Text>
                            </Anchor>
                        </div>
                        </div>
                    </div>
                   
                )
            }

           
        </div>
    )
}

const TrimCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
          
        </div>
    )
}

const UppercaseCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
           
        </div>
    )
}

const LowercaseCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return(
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            
        </div>
    )
}

const CapitalizeCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
        
        </div>
    )
}

export {AppendCard, PrependCard, ReplaceCard, ConcatenateCard, SubstringCard, TrimCard, UppercaseCard, LowercaseCard, CapitalizeCard}