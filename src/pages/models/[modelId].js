import React, {useState, useEffect, useCallback} from "react"
import {Text, Button, Card, Image, Center, Loader, useMantineTheme, TextInput, Select, Badge} from '@mantine/core'
import { useUser } from '@auth0/nextjs-auth0/client';
import {useContext} from 'react'
import axios from 'axios';
import { useRouter } from 'next/router'
import { CiSearch } from "react-icons/ci";
import SchemaTree from '../../components/Api/schema-tree'
import {getSchemaProperties, getSchemaUsage} from '../../utils/graph'

import graphlib from 'graphlib';
const Graph = graphlib.Graph;

const ModelDetails = () => {

    const router = useRouter()
    const { modelId } = router.query
    const [schema, setSchema] = useState(null)
    const [isLoading , setIsLoading] = useState(false)
    const [api, setApi] = useState(null)
    const [graph, setGraph] = useState(null)
    const [schemaResults, setSchemaResults] = useState(null)

    const setSelectedProperty = (property) => {
        console.log(property)
    }

    const renderUsageBades = (usage) => {
        return usage.map((use) => {
            let method = use.split(':')[0]
            let path = use.split(':')[1]
            let responseCode = use.split(':').length > 2 ? use.split(':')[2] : ''

            return (
                <Badge key={usage} size="lg" style={{marginRight: 10}} color="green">{method + " "+ path + " " + responseCode}</Badge>
            )
        })
    }
    
    const generateGraph = (dbGraph) => {
        let G = new Graph({ directed: true });
        let graph = dbGraph;
        const graphString = Buffer.from(dbGraph, 'base64').toString();
        graph = JSON.parse(graphString);
        if(graph.nodes && graph.edges){
            var nodeKeys = Object.keys(graph.nodes);
            var edgeKeys = Object.keys(graph.edges);

            for (var i = 0; i < nodeKeys.length; i++) {
                var node = graph.nodes[nodeKeys[i]];
                G.setNode(nodeKeys[i], node);
            }

            for (var i = 0; i < edgeKeys.length; i++) {
                var edge = graph.edges[edgeKeys[i]];
                G.setEdge(edge.v, edge.w);
            }
            setGraph(G)

            var schemaProperties = getSchemaProperties(schema.name, G)
            var schemaUsage = getSchemaUsage(schema.name, G)
            
            setSchemaResults({
                properties: schemaProperties.properties ? schemaProperties.properties: null ,
                usage: schemaUsage.usage ? schemaUsage.usage: null,
            })
            
        }

    }

    const fetchSchema = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/objects/'+ modelId)
            .then((res) => {
                setSchema(res.data)
            })
            .catch((err) => {
                console.log(err)
            }) 
    }, [modelId])

    const fetchApi = useCallback(() => {
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/'+ schema.parent_interface_uuid)
            .then((res) => {
                setApi(res.data)
            })
            .catch((err) => {
                console.log(err)
            }) 
    }
    , [schema])

    useEffect(() => {
        if(modelId && !schema){
            fetchSchema()
        }
    }, [modelId, schema])

    useEffect(() => {
        if(schema && !api){
            fetchApi()
        }
        if(!graph && api && api.graph){
            generateGraph(api.graph)
        }
    }
    , [schema, api])

    return (
        <div style={{display:'flex', flexDirection:'column', padding: 30}}>
            {
                schema && schema.name ? (
                    <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>{schema.name}</Text>
                ): (
                    <Text style={{paddingLeft: 20,paddingBottom: 30, fontFamily:'Visuelt', fontWeight: 650, fontSize: '40px'}}>Loading...</Text>
                )
            }
            {
                schemaResults && schemaResults.usage && schemaResults.usage.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <div>
                            <Text style={{paddingLeft: 20,paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 100, fontSize: '30px'}}>Usage</Text>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row', padding: 20  }}>
                            {renderUsageBades(schemaResults.usage)}
                        </div>
                        
                    </div>
                ): null
            }

            <div>
                <Text style={{paddingLeft: 20,paddingBottom: 10, fontFamily:'Visuelt', fontWeight: 100, fontSize: '30px'}}>Schema</Text>
                {schema && <SchemaTree schema={schema.properties} setSelectedSchemaProperty={setSelectedProperty} schemaType={'schema'} />}
            </div>
            
        </div>
    )
}

export default ModelDetails