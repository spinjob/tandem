import React from 'react';
import ReactFlow, { Background, Edge, Node, ProOptions, ReactFlowProvider } from 'reactflow';
import {Text, TextInput, Select, Button, Textarea } from '@mantine/core'

import 'reactflow/dist/style.css';
const proOptions: ProOptions = { account: 'paid-pro', hideAttribution: true };

const defaultNodes: Node[] = [
  {
    id: '1',
    data: { label: '🌮 Taco' },
    position: { x: 0, y: 0 },
    type: 'trigger',
  },
  {
    id: '2',
    data: { label: '🌮 Taco' },
    position: { x: 300, y: 0 },
    type: 'partner',
  }
];

const defaultEdges: Edge[] = [
  {
    id: '1=>2',
    source: '1',
    target: '2',
    type: 'placeholder',
  },
];

const fitViewOptions = {
  padding: 0,
};

const RecipeStudio = () => {
  
    return (
        <div>
           <Text>

           </Text>
        </div>
    )
}
export default RecipeStudio;