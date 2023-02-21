import {create} from 'zustand';

export type NodeData = {
  selectedAction: object
  schema: object
  view: string
  id: string
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
  nodeViews: object;
  selectedMapping: object;
  selectedEdge: object;
  mappings: object;
  setSelectedEdge: (selectedEdge: object) => void;
  setSelectedMapping: (selectedMapping: object) => void;
  setMappings: (mappings: object) => void;
  setNodeViews: (nodeViews: Array<NodeData>) => void;
  setNodeAction: (nodeId: string, action: object) => void;
  setWorklow: (workflow: WorkflowData) => void;
};

  // this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => (
{
    workflow: {id: "", apis: [], webhooks: [], actions: []},
    nodeViews: {},
    selectedMapping: {},
    selectedEdge: {},
    mappings: {},
    setSelectedEdge: (selectedEdge: object) => {
      set({
        selectedEdge: selectedEdge
      })},
    setMappings: (mappings: object) => {
      set({
        mappings:  mappings
      })},
    setSelectedMapping: (selectedMapping: object) => {
      set({
        selectedMapping: selectedMapping
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