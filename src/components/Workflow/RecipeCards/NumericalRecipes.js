import {Card, Text, TextInput, Button, ActionIcon, NumberInput, Anchor, Modal, Select, Loader} from '@mantine/core'
import {useEffect, useState} from 'react'
import useStore from '../../../context/store'

const AdditionCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {

    const [inputs, setInputs] = useState(recipe?.inputs?.addition)
    const [showProperties, setShowProperties] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(recipe?.inputs?.addition)
    const inputPaths = useStore(state => state.inputPaths)
    var uniquePaths = [...new Set(inputPaths)]

    return (
        <>
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
                                updateFormula(recipe.uuid, {addition: e})
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
                            <NumberInput
                            defaultValue={0}
                            placeholder="Number of characters"
                            variant={'filled'}
                            withAsterisk
                            min={0}
                            type={'number'}
                            value={inputs}
                            onChange={(e)=>{
                                setInputs(e)
                                updateFormula(recipe.uuid, {"addition": e})
                            }}
                            sx={{
                                width: 90
                            }}
                        />
        
                        )
                    }
                    <div style={{width: 10}}/>
                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                            to the value
                    </Text>
                </div>
            </div>
            <div style={{display:'flex', width: '100%', alignItems:'flex-start', justifyContent:'flex-start', paddingLeft: '10px',paddingTop: '5px', fontSize:'15px'}}>
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
        </>

    )
}

const SubtractionCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {

    const [inputs, setInputs] = useState(recipe?.inputs?.subtraction)
    const [showProperties, setShowProperties] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(recipe?.inputs?.subtraction)
    const inputPaths = useStore(state => state.inputPaths)
    var uniquePaths = [...new Set(inputPaths)]

    return (
        <>
            <div style={{paddingLeft: 20,  border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', display:'flex', justifyContent:'center', flexDirection: 'column'}}>
                <div style={{display:'flex',alignItems:'center', justifyContent:'start'}}>
                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                            Subtract 
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
                                updateFormula(recipe.uuid, {subtraction: e})
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
                            <NumberInput
                            defaultValue={0}
                            placeholder="Number of characters"
                            variant={'filled'}
                            withAsterisk
                            min={0}
                            type={'number'}
                            value={inputs}
                            onChange={(e)=>{
                                setInputs(e)
                                updateFormula(recipe.uuid, {subtraction: e})
                            }}
                            sx={{
                                width: 90
                            }}
                        />
        
                        )
                    }
                    <div style={{width: 10}}/>
                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                            from the value
                    </Text>
                    
                </div>
            </div>
            <div style={{display:'flex', width: '100%', alignItems:'flex-start', justifyContent:'flex-start', paddingLeft: '10px',paddingTop: '5px', fontSize:'15px'}}>
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
        </>
    )
}

const MultiplicationCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {

    const [inputs, setInputs] = useState(recipe?.inputs?.multiplication)
    const [showProperties, setShowProperties] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(recipe?.inputs?.multiplication)
    const inputPaths = useStore(state => state.inputPaths)
    var uniquePaths = [...new Set(inputPaths)]

    return (
        <>
            <div style={{paddingLeft: 20,  border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', display:'flex', justifyContent:'center', flexDirection: 'column'}}>
                <div style={{display:'flex',alignItems:'center', justifyContent:'start'}}>
                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                            Multiply value by
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
                                updateFormula(recipe.uuid, {multiplication: e})
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
                            <NumberInput
                            defaultValue={0}
                            placeholder="Number of characters"
                            variant={'filled'}
                            withAsterisk
                            min={0}
                            type={'number'}
                            value={inputs}
                            onChange={(e)=>{
                                setInputs(e)
                                updateFormula(recipe.uuid, {multiplication: e})
                            }}
                            sx={{
                                width: 90
                            }}
                        />
        
                        )
                    }
                    <div style={{width: 10}}/>
                </div>
            </div>
            <div style={{display:'flex', width: '100%', alignItems:'flex-start', justifyContent:'flex-start', paddingLeft: '10px',paddingTop: '5px', fontSize:'15px'}}>
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
        </>
    )
}

const DivisionCard = ({ updateFormula, recipe, index, onEdit, onDelete, sourceProperty}) => {

    const [inputs, setInputs] = useState(recipe?.inputs?.division)
    const [showProperties, setShowProperties] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(recipe?.inputs?.division)
    const inputPaths = useStore(state => state.inputPaths)
    var uniquePaths = [...new Set(inputPaths)]

    return (
        <>
            <div style={{paddingLeft: 20,  border: '1px solid #EBEBEB', borderRadius: 12, width:'100%', height: 100, backgroundColor: 'white', display:'flex', display:'flex', justifyContent:'center', flexDirection: 'column'}}>
                <div style={{display:'flex',alignItems:'center', justifyContent:'start'}}>
                    <Text style={{fontFamily:'Visuelt', fontWeight: 100, color: 'black'}}>
                            Divide value by
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
                                updateFormula(recipe.uuid, {division: e})
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
                            <NumberInput
                            defaultValue={0}
                            placeholder="Number of characters"
                            variant={'filled'}
                            withAsterisk
                            min={0}
                            type={'number'}
                            value={inputs}
                            onChange={(e)=>{
                                setInputs(e)
                                updateFormula(recipe.uuid, {division: e})
                            }}
                            sx={{
                                width: 90
                            }}
                        />
        
                        )
                    }
                    <div style={{width: 10}}/>
                </div>
            </div>
            <div style={{display:'flex', width: '100%', alignItems:'flex-start', justifyContent:'flex-start', paddingLeft: '10px',paddingTop: '5px', fontSize:'15px'}}>
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
        </>
    )
}

export {AdditionCard, SubtractionCard, MultiplicationCard, DivisionCard}