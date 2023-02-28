import {Card, Text, TextInput, Button, ActionIcon, Modal, Loader} from '@mantine/core'
import {useState} from 'react'

const AppendCard = ({ recipe, index, onEdit, onDelete, sourceProperty}) => {
    console.log(sourceProperty)
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
                to the end of the
            </Text>
            <div style={{width: 5}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const PrependCard = ({ recipe, index, onEdit, onDelete, sourceProperty }) => {
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
            <div style={{width: 5}}/>
            <Text  style={{fontFamily:'Visuelt', fontWeight: 500, color: 'black'}}>
                {sourceProperty?.key}   
            </Text>
        </div>
    )
}

const ReplaceCard = ({ recipe, index, onEdit, onDelete, sourceProperty}) => {
    return( 
        <div style={{paddingLeft: 20, border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'start'}}>
            <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                Replace instances of
            </Text>
            <div style={{width: 10}}/>
            <TextInput
                placeholder="Characters to replace"
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

const ConcatenateCard = ({ recipe, index, onEdit, onDelete, sourceProperty }) => {
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

const SubstringCard = ({ recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const TrimCard = ({ recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const UppercaseCard = ({ recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const LowercaseCard = ({ recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return(
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

const CapitalizeCard = ({ recipe, index, onEdit, onDelete, sourceProperty  }) => {
    return( 
        <div style={{border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Text>Inputs</Text>
        </div>
    )
}

export {AppendCard, PrependCard, ReplaceCard, ConcatenateCard, SubstringCard, TrimCard, UppercaseCard, LowercaseCard, CapitalizeCard}