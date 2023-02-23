import {create} from 'zustand';

export type NodeData = {
  selectedAction: object
  schema: object
  view: string
  id: string
};

export type WorkflowData = {
  id: string;
  projectId: string;
  apis: Array<object>;
  webhooks: Array<object>;
  actions: Array<object>;
  name: string;
  trigger: object;
}

export type Mapping = {
  sourceProperty: object;
  targetProperty: object;
}

export type RFState = {
  workflow: WorkflowData;
  nodes: Array<object>;
  edges: Array<object>;
  nodeActions: object;
  nodeViews: object;
  selectedMapping: Mapping;
  selectedEdge: object;
  mappings: object;
  setWorkflow: (workflow: WorkflowData) => void;
  setNodes: (nodes: Array<object>) => void;
  setEdges: (edges: Array<object>) => void;
  setSelectedEdge: (selectedEdge: object) => void;
  setSelectedMapping: (selectedMapping: Mapping) => void;
  setMappings: (mappings: object) => void;
  setNodeViews: (nodeViews: Array<NodeData>) => void;
  setNodeAction: (nodeId: string, action: object) => void;
  setWorklow: (workflow: WorkflowData) => void;
};

  // this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => (
{
    nodes: [],
    edges: [],
    workflow: {trigger: {}, id: "", name: "", projectId: "", apis: [], webhooks: [], actions: []},
    nodeViews: {},
    selectedMapping: {sourceProperty: {}, targetProperty: {}},
    selectedEdge: {},
    mappings: {},
    setWorkflow: (workflow: WorkflowData) => {
      set({
        workflow: {
          trigger: workflow.trigger ? workflow.trigger : get().workflow.trigger,
          id: workflow.id ? workflow.id : get().workflow.id,
          projectId: workflow.projectId ? workflow.projectId : get().workflow.projectId,
          apis: workflow.apis ? workflow.apis : get().workflow.apis,
          webhooks: workflow.webhooks ? workflow.webhooks : get().workflow.webhooks,
          actions: workflow.actions ? workflow.actions : get().workflow.actions,
          name: workflow.name ? workflow.name : get().workflow.name
        }
      })
      console.log("Updated Workflow: ", get().workflow)
    },
    setNodes: (nodes: Array<object>) => {
      set({
        nodes: nodes
      })},
    setEdges: (edges: Array<object>) => {
      set({
        edges: edges
      })},
    setSelectedEdge: (selectedEdge: object) => {
      set({
        selectedEdge: selectedEdge
      })},
    setMappings: (mappings: object) => {
      set({
        mappings:  mappings
      })},
    setSelectedMapping: (updatedMapping: Mapping) => {
      set({
         selectedMapping: {
            sourceProperty: updatedMapping.sourceProperty ? updatedMapping.sourceProperty : get().selectedMapping.sourceProperty,
            targetProperty: updatedMapping.targetProperty ? updatedMapping.targetProperty : get().selectedMapping.targetProperty
         }
      })},
    setNodeViews: (updatedNodeViews: Array<NodeData>) => {
      var currentNodeViews = get().nodeViews
      var nodeViewKeys = Object.keys(currentNodeViews)
      var nodeViewValues = Object.values(currentNodeViews)
      nodeViewKeys.map((nodeViewKey: string, index) => {
        var nodeViewValue = nodeViewValues[index]
        if(nodeViewValue['view'] && nodeViewValue['view'] === "mapping") {
          nodeViewValue['view'] = "workflow"
        }})
        
      updatedNodeViews.map((updatedNodeView: NodeData) => {
        const nodeKey = updatedNodeView["id"];
        const nodeValue = updatedNodeView;
          set({
            nodeViews: {
              ...get().nodeViews,
              [nodeKey]: {...nodeValue}
            }
        })
      })
    },
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