// const graphlib = require('graphlib');
// const Graph = graphlib.Graph;
// const openapiData = require('../test/otter-openAPI-v3-2021.json') 

// // Function to add schemas, inline properties, and parameters to graph
// function addElementsToGraph(graph, schemaName, schemaData, visited = new Set()) {
    
//     if (visited.has(schemaName)) {
//         return;
//     }
//     visited.add(schemaName);

//     if (schemaData.properties) {
//         for (const [prop, propData] of Object.entries(schemaData.properties)) {
//             let nestedSchemaName = null;
//             let isArray = false;
            
//             if (propData['$ref']) {
//                 nestedSchemaName = propData['$ref'].split('/').pop();
//             } else if (propData.type === 'array' && propData.items['$ref']) {
//                 nestedSchemaName = propData.items['$ref'].split('/').pop();
//                 isArray = true;

//                 // TO DO: Currently, there is no edge between the array property and it's item schema.
//                 // Right now the item schema and the schema that's a parent to the array property are connected.
//                 const arrayPropertyNodeName = `${schemaName}.${prop}`;
//                 graph.setNode(arrayPropertyNodeName, { type: 'array_property', dataType: 'array', itemSchema: nestedSchemaName, isArray: true });
//                 graph.setEdge(schemaName, arrayPropertyNodeName);
//             }   

//             if (nestedSchemaName) {
//                 if (openapiData.components.schemas[nestedSchemaName]) {
//                     graph.setNode(nestedSchemaName, { type: 'schema', dataType: propData.type, key: prop });
//                     graph.setEdge(schemaName, nestedSchemaName);
//                     addElementsToGraph(graph, nestedSchemaName, openapiData.components.schemas[nestedSchemaName], visited);
//                 } else {
//                     console.log(`Schema ${nestedSchemaName} does not exist in openapiData.components.schemas`);
//                 }         
//             } else {
//                 const virtualNodeName = prop == 'type' ?  `${schemaName}.${"_type"}` : `${schemaName}.${prop}`;
//                 graph.setNode(virtualNodeName, { type: 'inline_property', dataType: propData.type, isArray });
//                 graph.setEdge(schemaName, virtualNodeName);
//             }
//         }
//     } 
// }

// // Initialize Graph
// const G = new Graph({ directed: true });

// // Add schemas to the graph
// for (const [schemaName, schemaData] of Object.entries(openapiData.components.schemas)) { 
//     G.setNode(schemaName, { type: 'schema', dataType: schemaData.type ? schemaData.type : 'object' });
//     addElementsToGraph(G, schemaName, schemaData);
// }

// // Add paths and their parameters to the graph
// for (const [path, methods] of Object.entries(openapiData.paths)) {
//     for (const method of Object.keys(methods)) {
//         const uniquePathMethod = `${method.toUpperCase()}:${path}`;
//         G.setNode(uniquePathMethod, { type: 'path' });

//         const details = methods[method];
        
//         // Handle parameters
//         if (details.parameters) {
//             for (const param of details.parameters) {
//                 const paramData = param.name ? param : openapiData.components.parameters[param['$ref'].split('/').pop()];
//                 const paramName = paramData.name;
//                 const paramLocation = paramData.in;
//                 const paramNodeName = `${uniquePathMethod}.${paramLocation}.${paramName}`;
//                 G.setNode(paramNodeName, { type: 'parameter', location: paramLocation });
//                 G.setEdge(uniquePathMethod, paramNodeName);
//             }
//         }
        
//         // Handle request bodies
//         if (details.requestBody && details.requestBody.content) {
//             for (const contentType of Object.keys(details.requestBody.content)) {
//                 const contentDetails = details.requestBody.content[contentType];
//                 if (contentDetails.schema['$ref']) {
//                     const schemaName = contentDetails.schema['$ref'].split('/').pop();
//                     G.setEdge(uniquePathMethod, schemaName, { subtype: 'request' });
//                 }
//             }
//         }

//         // Handle responses
//         if (details.responses) {
//             for (const [responseCode, responseDetails] of Object.entries(details.responses)) {
//                 let actualResponseDetails = responseDetails;
//                 if (responseDetails['$ref']) {
//                     actualResponseDetails = openapiData.components.responses[responseDetails['$ref'].split('/').pop()];
//                 }
//                 if (actualResponseDetails.content) {
//                     for (const contentType of Object.keys(actualResponseDetails.content)) {
//                         const contentDetails = actualResponseDetails.content[contentType];
//                         if (contentDetails.schema['$ref']) {
//                             const schemaName = contentDetails.schema['$ref'].split('/').pop();
//                             const responseNode = `${uniquePathMethod}:${responseCode}`;
//                             G.setNode(responseNode, { type: 'response', responseCode });
//                             G.setEdge(uniquePathMethod, responseNode, { subtype: 'response' });
//                             G.setEdge(responseNode, schemaName);
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

function getNestedSchemaProperties(nestedSchemaName, graph, visited, parentName = '', isArray = false) {
    const path = `${parentName}->${nestedSchemaName}`;
    if (visited.has(path)) {
      return { properties: {} };
    }
    visited.add(path);
  
    const nestedProperties = getSchemaProperties(nestedSchemaName, graph, visited).properties;

    if (isArray) {
        return { properties: [nestedProperties] };  // Wrap it in an array
    } else {
        return { properties: nestedProperties };  // As is
    }
}


function getSchemaProperties(schemaName, graph, visited = new Set()) {
    const result = { properties: {} };

    const edges = graph.outEdges(schemaName);
    if (edges) {
        for (const edge of edges) {
            const targetNode = edge.w;
            const targetNodeData = graph.node(targetNode);
            let isArray = targetNodeData.isArray || false;
            if (targetNodeData.type === 'inline_property') {
                const propName = targetNode.split('.').pop();
                result.properties[propName] = targetNodeData.dataType;
            } else if (targetNodeData.type === 'schema') {
                const propName = targetNodeData.key ? targetNodeData.key : targetNode;
                let nestedSchemaName;
                
                //TO DO: Determine why the the propName for the array property is not being set correctly
                // The if statement will never be satisfied because the type is always schema.  Keeping this invalid logic because it prevents an issue with the output.
                if(targetNodeData.type === 'array_property'){
                    nestedSchema = targetNodeData.itemSchema;
                    isArray = true;
                } else {
                    nestedSchemaName = targetNode.split('.').pop();
                }

                const nestedProperties = getNestedSchemaProperties(nestedSchemaName, graph, visited, schemaName, isArray).properties;
                // Merge properties instead of overwriting
                result.properties[propName] = isArray ? [nestedProperties] : { ...result.properties[propName], ...nestedProperties };
            }
        }
    }

    return result;
}

function getSchemaUsage(schemaName, graph, visited = new Set()) {
    const result = {
        usage: []
    };

    const inEdges = graph.inEdges(schemaName);
    if(inEdges){
        for (const edge of inEdges) {
            const sourceNode = edge.v;
            const sourceNodeData = graph.node(sourceNode);
            if (sourceNodeData.type === 'path' || sourceNodeData.type === 'response') {
                result.usage.push(sourceNode);
            } else if (sourceNodeData.type === 'schema') {
                const parentSchemaUsage = getSchemaUsage(sourceNode, graph, visited).usage;
                result.usage = [...result.usage, ...parentSchemaUsage];
            }
        }
    } else {
        const parentSchemaUsage = getSchemaUsage(schemaName, graph, visited).usage;
        result.usage = [...result.usage, ...parentSchemaUsage];
    }

    return result;
}

module.exports = {getSchemaProperties, getSchemaUsage}