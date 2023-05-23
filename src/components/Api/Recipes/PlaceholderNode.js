import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {Text, Select, Menu, Button, TextArea} from '@mantine/core'

const PlaceholderNode = ({ data, isConnectable }) => {
  return (
    <div style={{ borderRadius: 20, display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: '1px dotted black', width:120, height: 50}}>
      
      <Button 
        sx={{
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 100,
            color: 'black',
            fontFamily: 'Visuelt',
            width: '100%',
            height: '100%',
            borderRadius: 20,
        }}
        variant="subtle"
        color="black" 
      > 
      <Text sx={{ textAlign: 'center', fontSize: 10, fontWeight: 100, color: 'black',fontFamily: 'Visuelt'}}> + Add Component</Text></Button>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(PlaceholderNode);