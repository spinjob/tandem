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

export type SelectedMapping = {
  sourceProperty: object;
  targetProperty: object;
  sourceNode: string;
  targetNode: string;
}

export type NewMapping ={
  id: string;
  stepIndex: number;
  input: object;
  output: object;
  sourcePath: string;
  targetPath: string;
  sourceNode: string;
  targetNode: string;
}

export type Mapping = {
  [key: string]: {
    id: string;
    stepIndex: number;
    input: object;
    output: object;
    sourcePath: string;
    targetPath: string;
    sourceNode: string;
    targetNode: string;
  }
}

export type RFState = {
  workflow: WorkflowData;
  nodes: Array<object>;
  edges: Array<object>;
  nodeActions: object;
  nodeViews: object;
  selectedMapping: SelectedMapping;
  selectedEdge: object;
  inputPaths: Array<string>;
  outputPaths: Array<string>;
  mappings: {[key: string]: object};
  actionProperties: {[key: string]: object};
  setActionProperties: (actionProperties: {[key: string]: object}) => void;
  setWorkflow: (workflow: WorkflowData) => void;
  addMapping: (newMapping: NewMapping) => void;
  setInputPaths: (inputPaths: Array<string>) => void;
  setOutputPaths: (outputPaths: Array<string>) => void;
  setNodes: (nodes: Array<object>) => void;
  setEdges: (edges: Array<object>) => void;
  setSelectedEdge: (selectedEdge: object) => void;
  setSelectedMapping: (selectedMapping: SelectedMapping) => void;
  setMappings: (mappings: {[key: string]: object}) => void;
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
    selectedMapping: {sourceProperty: {}, targetProperty: {}, sourceNode: "", targetNode: ""},
    selectedEdge: {},
    mappings: {},
    actionProperties: {},
    inputPaths: [],
    outputPaths: [],
    setInputPaths: (inputPaths: Array<string>) => {
      console.log("inputPaths", inputPaths)
      set({
        inputPaths: inputPaths
      })
    },
    setOutputPaths: (outputPaths: Array<string>) => {
      console.log("inputPaths", outputPaths)
      set({
        outputPaths: outputPaths
      })
    },
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
    },
    setActionProperties: (actionProperties: {[key: string]: object}) => {
      var currentActionProperties = get().actionProperties;
      var updatedActionProperties : {[key: string]: object} = {}
      var actionPropertiesKeys = Object.keys(actionProperties)
      var actionPropertiesValues = Object.values(actionProperties)
      actionPropertiesKeys.map((actionPropertyKey: string, index) => {
        var actionPropertyValue = actionPropertiesValues[index]
        var newActionProperty = {
          ...currentActionProperties[actionPropertyKey],
          ...actionPropertyValue
        }
        updatedActionProperties[actionPropertyKey] = newActionProperty
      })

      set({
        actionProperties: actionProperties
      })
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
    addMapping: (newMapping: NewMapping) => {
      var currentMappings = get().mappings;
      var currentActionMappings = currentMappings[newMapping.targetNode];
      set({
        mappings: {
          ...currentMappings,
          [newMapping.targetNode]: {
            ...currentActionMappings,
            [newMapping.targetPath]: newMapping
          }
        }
      })

    },
    setMappings: (mappings: {[key: string]: object}) => {
      set({
        mappings:  mappings
      })},
    setSelectedMapping: (updatedMapping: SelectedMapping) => {
      set({
         selectedMapping: {
            sourceNode: updatedMapping.sourceNode ? updatedMapping.sourceNode : get().selectedMapping.sourceNode,
            targetNode: updatedMapping.targetNode ? updatedMapping.targetNode : get().selectedMapping.targetNode,
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