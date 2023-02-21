import {create} from 'zustand';
import { useRef } from 'react';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow
  } from 'reactflow';

  export type NodeData = {
    selectedAction: object
    schema: object
    view: string
  };
 
  export type WorkflowData = {
    id: string;
    apis: Array<object>;
    webhooks: Array<object>;
    actions: Array<object>;
  }

  export type RFState = {
    workflow: WorkflowData;
    nodeActions: object;
    setNodeAction: (nodeId: string, action: object) => void;
    setWorklow: (workflow: WorkflowData) => void;
  };

  // this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => (
{
    workflow: {id: "", apis: [], webhooks: [], actions: []},
    nodeActions: {},
    setNodeAction: (nodeId: string, action: object) => {
        set({
            nodeActions: {
                ...get().nodeActions,
                [nodeId]: action
            }
        })
    },
    setWorklow: (workflow: WorkflowData) => {
        set({
            workflow: workflow
        })
    }
  }));
  
  export default useStore;