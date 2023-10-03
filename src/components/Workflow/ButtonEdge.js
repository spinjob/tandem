import React, { useEffect, useState } from 'react';
import { getBezierPath } from 'reactflow';
import {ActionIcon, Text, Image, Center, createStyles} from '@mantine/core'
import {AiOutlineNodeIndex} from 'react-icons/ai'
import mappingIcon from '../../../public/icons/Programing, Data.1.svg'
import repeatIcon from '../../../public/icons/Arrow, Repeat, Rotate.2.svg'
import filterIcon from '../../../public/icons/filter-sort.3.svg'

const foreignObjectSize = 50;
import useStore from '../../context/store'

export default function ButtonEdge({ id, target, source, selected, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data}) {

  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});
  const [disabled, setDisabled] = React.useState(false)
  const nodeActions = useStore(state => state.nodeActions)
  const targetAction = nodeActions[target]
  const globalNodeState = useStore(state => state.nodeState)
  const [requiredPropertyCount, setRequiredPropertyCount] = useState(null)
  const [edgeSourceHandle, setEdgeSourceHandle] = useState(data?.handleId)
  const selectedEdge = useStore(state => state.selectedEdge)
  const drawerView = useStore(state => state.drawerView)
  const setDrawerView = useStore(state => state.setDrawerView)

  const [hovering, setHovering] = useState(false)

  const processNestedProperties = (properties, parent) => {
    const nestedPropertyKeys = Object.keys(properties)
    const nestedPropertyValues = Object.values(properties)
    const nestedPropertyObjects = nestedPropertyKeys.map((key, index) => {
        return {
            key: key,
            path: parent + "." + key,
            ...nestedPropertyValues[index]
        }
    })
    const requiredNestedPropertyArray = []
    const optionalNestedPropertyArray = []

    nestedPropertyObjects.forEach((property) => {
        if(property.required) {
            requiredNestedPropertyArray.push(property)
            if(property.properties){
                var {required} = processNestedProperties(property.properties, parent+ "." + property.key)
                var {optional} = processNestedProperties(property.properties, parent+ "." + property.key)
                var filteredRequiredArray = required.filter((item) => { 
                    return item.type !== "object" && item.type !== "array"
                })
                var filteredOptionalArray = optional.filter((item) => {
                    return item.type !== "object" && item.type !== "array"
                })
                requiredNestedPropertyArray.push(...filteredRequiredArray)
                optionalNestedPropertyArray.push(...filteredOptionalArray)
            }
        } else {
            optionalNestedPropertyArray.push(property)
            if(property.properties){
                processNestedProperties(property.properties)
                var {required} = processNestedProperties(property.properties, parent+ "." + property.key)
                var {optional} = processNestedProperties(property.properties, parent+ "." + property.key)
                var filteredRequiredArray = required.filter((item) => { 
                    return item.type !== "object" && item.type !== "array"
                })
                var filteredOptionalArray = optional.filter((item) => {
                    return item.type !== "object" && item.type !== "array"
                })
                optionalNestedPropertyArray.push(...required, ...optional)
            }
        } 
    })
    return {required: requiredNestedPropertyArray, optional: optionalNestedPropertyArray}
  }

  const processProperties = () => {
    
    if(targetAction && targetAction.requestBody2 && targetAction.requestBody2.schema){
    const propertyKeys = Object.keys(targetAction.requestBody2.schema)
    const propertyValues = Object.values(targetAction.requestBody2.schema)
    const propertyObjects = propertyKeys.map((key, index) => {
        return {
            key: key,
            path: key,
            ...propertyValues[index]
        }
    })
    const requiredPropertyArray = []
    const optionalPropertyArray = []

    propertyObjects.forEach((property) => {
        if(property.required) {
                if(property.properties){
                    var {required} = processNestedProperties(property.properties, property.key)
                    var {optional} = processNestedProperties(property.properties, property.key)
                    requiredPropertyArray.push(...required)
                    optionalPropertyArray.push(...optional)
                } else {
                    requiredPropertyArray.push(property)
                }
        } else {
            if(property.properties){
                var {required} = processNestedProperties(property.properties, property.key)
                var {optional} = processNestedProperties(property.properties, property.key)
                optionalPropertyArray.push(...required, ...optional)
            } else {
                optionalPropertyArray.push(property)
            }
        }
    })
  
    setRequiredPropertyCount(requiredPropertyArray.length)}

  }

useEffect(() => {
   if(requiredPropertyCount === null){
        processProperties()
   }
}, [requiredPropertyCount, processProperties])

  return !targetAction ? (
    <>
      <path
        id={id}
        style={
          {stroke:'#E6E5E5',
          '&:hover': {
            stroke: '#B4F481'
          }}
        }
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      </>
  ) : (
    <>
      {
        selectedEdge?.id == id && edgeSourceHandle == 'actionSuccess' ? (
            <path
              id={id}
              style={{
                stroke:'#B4F481'
              }}
              className="react-flow__edge-path"
              d={edgePath}
              markerEnd={markerEnd}
            /> 
        ) : 
        selectedEdge?.id == id && edgeSourceHandle == 'actionFailure' ? (
          <path
              id={id}
              style={
                {stroke:'#FFA39E'}
              }
              className="react-flow__edge-path"
              d={edgePath}
              markerEnd={markerEnd}
            /> 
        ) : (
          <path
            id={id}
            style={
              {stroke:'#E6E5E5',
              '&:hover': {
                stroke: '#B4F481'
              }}
            }
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
          /> 
        )
      }
      <foreignObject
        width={foreignObjectSize}
        height={hovering ? foreignObjectSize * 3.5 : foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        onMouseOver={() => {
          setHovering(true)
        }}
        onMouseOut={() => {
          setHovering(false)
        }}
        style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 4}}
      > 
       <ActionIcon 
          onClick={()=>{
            setDrawerView('mapping')
          }}
          size="xl" 
          variant="outline" 
          radius="xl" 
          style={{borderColor: '#E9ECEF',backgroundColor: selectedEdge?.id == id ? 'black' : 'white'}}>
            <Image alt="mapping" src={mappingIcon} style={{height: 20, width: 20, marginLeft: -4, filter: selectedEdge?.id == id ? 'invert(100%) sepia(0%) saturate(2%) hue-rotate(342deg) brightness(112%) contrast(101%)' : 'none'}} />
       </ActionIcon>
        {
          hovering && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 10}}/>
              <ActionIcon 
                onClick={()=>{
                  setDrawerView('repeat')
                }} 
                size="xl" 
                variant="outline" 
                radius="xl" 
                style={{borderColor: '#E9ECEF',backgroundColor: selectedEdge?.id == id ? 'black' : 'white'}}>
                <Image alt="repeat" src={repeatIcon} style={{height: 20, width: 20, filter: selectedEdge?.id == id ? 'invert(100%) sepia(0%) saturate(2%) hue-rotate(342deg) brightness(112%) contrast(101%)' : 'none'}} />
              </ActionIcon>
              <div style={{height: 10}}/>
              <ActionIcon 
                onClick={()=>{
                  setDrawerView('filter')
                }} 
                size="xl" 
                variant="outline" 
                radius="xl" 
                style={{borderColor: '#E9ECEF',backgroundColor: selectedEdge?.id == id ? 'black' : 'white'}}>
                <Image alt="filter" src={filterIcon} style={{height: 20, width: 20, filter: selectedEdge?.id == id ? 'invert(100%) sepia(0%) saturate(2%) hue-rotate(342deg) brightness(112%) contrast(101%)' : 'none'}} />
              </ActionIcon>
            </div>
            )
        }
      </foreignObject>

    </>
  );
}


