import React from 'react';
import { getBezierPath } from 'reactflow';
import {ActionIcon, Text, Center} from '@mantine/core'
import {AiOutlineNodeIndex} from 'react-icons/ai'
const foreignObjectSize = 50;
import { useStore } from 'zustand';

const onEdgeClick = (evt, id) => {
  evt.stopPropagation();
  alert(`remove ${id}`);
};

export default function ButtonEdge({ id, selected, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data}) {
  
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 4}}
      > 
        {data?.targetSchema.required > 0 ? (
            <div style={{
              zIndex:1, 
              position: 'absolute', 
              marginLeft: 28, 
              marginTop: -4, 
              width: 18, 
              height: 18, 
              borderRadius: '50%', 
              backgroundColor: 'black', 
              display: 'flex', 
              alignItems:'center'}}>

              <Text align="center" style={{width: '100%', height: '100%',fontFamily: 'Visuelt',fontSize: '11px',color: 'white'}}>{data.targetSchema.required}</Text> 
            </div>
        ) : null
      }

      {selected ? (
          <ActionIcon size="xl" variant="outline" radius="xl" style={{borderColor: '#E9ECEF',backgroundColor: 'black'}}>
          <AiOutlineNodeIndex style={{
  
            color: 'white',
            height: 20, 
            width: 20}} />
        </ActionIcon>
      ) 
      : (
        <ActionIcon size="xl" variant="outline" radius="xl" style={{borderColor: '#E9ECEF',backgroundColor: 'white'}}>
        <AiOutlineNodeIndex style={{

          color: 'black',
          height: 20, 
          width: 20}} />
      </ActionIcon>
      )
      }
         
      </foreignObject>
    </>
  );
}
