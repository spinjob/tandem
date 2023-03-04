import React, { useEffect, useState } from 'react';
import { getBezierPath } from 'reactflow';
import {ActionIcon, Text, Image, Center} from '@mantine/core'
import {AiOutlineNodeIndex} from 'react-icons/ai'
import mappingIcon from '../../../public/icons/Programing, Data.1.svg'

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
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 4}}
      > 
        {/* {requiredPropertyCount > 0 ? (
            <div style={{
              zIndex:1, 
              position: 'absolute', 
              marginLeft: 28, 
              marginTop: -4, 
              width: 18, 
              height: 18, 
              borderRadius: '50%', 
              border: '1px solid white',
              backgroundColor: selected ? '#FFBD9A': 'black', 
              display: 'flex', 
              alignItems:'center'}}>
              <Text align="center" style={{width: '100%', height: '100%',fontFamily: 'Visuelt',fontSize: '11px',color: selected ? 'black': 'white', }}>{requiredPropertyCount}</Text> 
            </div>
        ) : null
      } */}

      {selectedEdge?.id == id ? (
          <ActionIcon size="xl" variant="outline" radius="xl" style={{borderColor: '#E9ECEF',backgroundColor: 'black'}}>
          {/* <AiOutlineNodeIndex style={{
            color: 'white',
            height: 20, 
            width: 20}} /> */}
          <Image alt="mapping" src={mappingIcon} style={{height: 20, width: 20, marginLeft: -4, filter: 'invert(100%) sepia(0%) saturate(2%) hue-rotate(342deg) brightness(112%) contrast(101%)'}} />
          </ActionIcon>
      ) 
      : (
        <ActionIcon size="xl" variant="outline" radius="xl" style={{borderColor: '#E9ECEF',backgroundColor: 'white'}}>
        {/* <AiOutlineNodeIndex style={{
          color: 'black',
          height: 20, 
          width: 20}} /> */}
        <Image  alt="mapping" src={mappingIcon} style={{height: 20, width: 20, marginLeft: -4}} />
      </ActionIcon>
      )
      }
         
      </foreignObject>
    </>
  );
}
