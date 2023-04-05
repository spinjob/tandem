
import {Table, Card, Text, Avatar, Center, Loader, Code, Divider, Button, Badge, ScrollArea} from '@mantine/core'
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css';
import {VscSymbolArray} from 'react-icons/vsc'
import {BiCodeCurly} from 'react-icons/bi'
import {RiDoubleQuotesL} from 'react-icons/ri'
import {AiOutlineNumber} from 'react-icons/ai'
import {RxComponentBoolean, RxQuestionMarkCircled} from 'react-icons/rx'
import { v4 as uuidv4 } from 'uuid';
import {useRef, useState,useEffect} from 'react'
import useStore from '../../context/store'

function generateTreeData (schema, parent) {

    const schemaKeys = Object.keys(schema)
    const schemaValues = Object.values(schema)
    

    var treeItems = {}
    if (parent=="root") {
        var root = {
            index: 'root',
            isFolder: true,
            children: schemaKeys,
            data: 'Root item'
        }
        treeItems["root"] = root
    } 

    schemaKeys.map((key, index) => {

        var childNode = {}
        var path = key

        if(parent != "root" && parent != undefined) {
            path = parent + "." + key
        }
        
        if(schemaValues[index].properties) {
            
            const propertyKeys = Object.keys(schemaValues[index].properties).map((key) => {
                return path + "." + key
            })

            childNode = {
                index: path,
                isFolder: true,
                children: propertyKeys,
                data: path,
                type: schemaValues[index].type
            }

            treeItems[path] = childNode

            const childTreeItems = generateTreeData(schemaValues[index].properties, path)
            treeItems = {...treeItems, ...childTreeItems}
           
        } else if (schemaValues[index].items) {
            // if schema property is an array and has a referenced array item schema

            if (schemaValues[index].items.properties) {
                // if array item schema has properties
                const arrayItemSchemaPropertyKeys = Object.keys(schemaValues[index].items.properties).map((key) => {
                    return path + "." + key
                })

                childNode = {
                    index: path,
                    isFolder: true,
                    children: arrayItemSchemaPropertyKeys,
                    data: path,
                    type: schemaValues[index].type
                }
                treeItems[path] = childNode

                const childTreeItems = generateTreeData(schemaValues[index].items.properties, path)
                treeItems = {...treeItems, ...childTreeItems}
                
            } else {
                // if array item schema is a primitive type

                treeItems[path] = childNode
                var inlineSchemaName = schemaValues[index].items.name ? schemaValues[index].items.name : schemaValues[index].items.type
                var inlineSchemaPath = path + "." + inlineSchemaName

                childNode = {
                    index: path,
                    children: [inlineSchemaPath],
                    isFolder: true,
                    data: path,
                    type: schemaValues[index].type
                }

                var inlineArrayItemSchemaNode = {
                    index: inlineSchemaPath,
                    children: [],
                    data: inlineSchemaPath,
                    type: schemaValues[index].items.type
                }

                treeItems[inlineSchemaPath] = inlineArrayItemSchemaNode

            }
           
        } else {
            childNode = {
                index: path,
                children: [],
                data: path,
                type: schemaValues[index].type
            }
        }
        treeItems[path] = childNode
    })
    return treeItems
}



const returnIcon = (type) => {
    switch (type) {
        case 'string':
            return (
                <RiDoubleQuotesL/>                                
        )
        case 'number':
            return (
                    <AiOutlineNumber/>                              
            )
        case 'integer':
            return (
                    <AiOutlineNumber/>
            )
        case 'float':
            return (
                    <AiOutlineNumber/>
            )
    
        case 'boolean':
            return (          
                    <RxComponentBoolean/>                           
            )
        case 'array':
            return (
                    <VscSymbolArray/>                          
            )
        case 'object':
            return (
                    <BiCodeCurly/>                        
            )
        default:
            return (
                    <RxQuestionMarkCircled/>                       
            )
    }
}

const WorkflowSchemaTree = ({ schema, isLoading, setSelectedSchemaProperty, schemaType, node}) => {

    const environment = useRef();
    const tree = useRef();

    const selectedMapping = useStore(state => state.selectedMapping)
    const setSelectedMapping = useStore(state => state.setSelectedMapping)
    const selectedEdge = useStore(state => state.selectedEdge)
    const [selectedSourceProperty, setSelectedSourceProperty] = useState(null)
    const [selectedTargetProperty, setSelectedTargetProperty] = useState(null)

    const getSchemaFromPath = (path) => {
        var schemaLocationArray = path.split('.')
       
        if(schemaLocationArray.length == 1) {
            return {...schema[schemaLocationArray[0]], path: path, key: schemaLocationArray[0]}
        } else {
            var parent = schema
            var parentContext = []

            
            for (var i = 0; i < schemaLocationArray.length; i++) {
                var child = parent[schemaLocationArray[i]]

                if(child?.properties && i !== schemaLocationArray.length - 1){
                    parent = child.properties
                        if(schemaLocationArray[i].includes('{{') && schemaLocationArray[i].includes('}}')) {
                            parentContext.push({contextType: 'dictionary', dictionaryKey: schemaLocationArray[i], parentContextKey: schemaLocationArray[i-1], path: path})
                        }
                    }                        

                else if(child?.items && i !== schemaLocationArray.length - 1){
                    if(child.items.properties) {
                        parent = child.items.properties
                        parentContext.push({contextType: 'array', parentContextKey: schemaLocationArray[i], path: path})
                    } else {
                        parent = child.items
                        parentContext.push({contextType: 'array', parentContextKey: schemaLocationArray[i], path: path})
                        // if(parentContext.length > 0){
                        //     return {...child.items, path: path, key: schemaLocationArray[i], parentContext}
                        // }
                        // return {...child.items, path: path, key: schemaLocationArray[i]}
                    }
                }
                else {     
                    var type = child?.type ? child.type : schemaLocationArray[i]
                    if(parentContext.length > 0){
                        return {...child, type: type, path: path, key: schemaLocationArray[i], parentContext}
                    }
                    return {...child, type: type, key: schemaLocationArray[i], path: path}
                }
    
            }
        }
    }
        
    const renderItemTitle = (title, item) => {
        var propertyName = title?.split('.').pop()

        return (
            <div style={{display:'flex', flexDirection:'row', alignItems: 'baseline'}}>
                {returnIcon(item.type)}
                <div style={{width: '10px'}} />
                <Text style={{fontFamily: 'apercu-light-pro', fontSize: 12}}>{propertyName}</Text>
            </div>
           
        )
    }

    useEffect(() => {
        if(node && selectedEdge && selectedMapping){

            //If the node this tree is rendered for is the Target node, then the selected property will be stored as the target.
            if(node?.id == selectedEdge?.target && selectedMapping?.targetProperty?.path && selectedMapping?.targetProperty?.path !== selectedTargetProperty) {
                tree.current?.selectItems([selectedMapping?.targetProperty?.path])

            } 
        
            //If the node this tree is rendered for is the Source node, then the selected property will be stored as the source.
            
        }
    }, [selectedMapping, selectedEdge, node, selectedTargetProperty])

    return isLoading ? (
        <Center>
            <Loader color='dark' size="lg" />
        </Center>
    )
    : (
        <div style={{width: 200}}>
        <style>{`
            :root {
            --rct-color-focustree-item-selected-bg: #000000;
            --rct-color-focustree-item-selected-text: #FFFFFF;
            --rct-item-height: 30px;
            --rct-bar-color: #000000;
            --rct-bar-width: 0px;
            }
        `}</style>
            <UncontrolledTreeEnvironment
            ref={environment}
            dataProvider={new StaticTreeDataProvider(generateTreeData(schema, "root"), (item, newName) => ({ ...item, data: newName }))}
            getItemTitle={item => item.data}
            viewState={{selectedItems: [selectedMapping.path]}}
            canDragAndDrop={false}
            canRenameItem={false}
            defaultInteractionMode={'click-arrow-to-expand'}
            renderItemTitle={({title, item}) => renderItemTitle(title, item)}
            onSelectItems={(items) => {

                if(node?.id == selectedEdge?.source){
                    if(selectedSourceProperty == items[0] ) {
                        tree.current?.selectItems([])
                        setSelectedSourceProperty(null)
                        setSelectedMapping({sourceProperty: {}})
                    } else if(items[0] == null) {
                        setSelectedSourceProperty(null)
                        setSelectedMapping({sourceProperty: {}})
                    }
                    else {
                        setSelectedSourceProperty(items[0])
                        console.log(items[0])
                        console.log(getSchemaFromPath(items[0]))
                        setSelectedMapping({sourceProperty: getSchemaFromPath(items[0])})
                    }

                }

                if(node?.id == selectedEdge?.target){
                    
                    if(selectedTargetProperty == items[0] ) {
                        console.log("deselecting")
                        tree.current?.selectItems([])
                        setSelectedTargetProperty(null)
                        setSelectedMapping({targetProperty: {}})
                    } else if(selectedMapping?.targetProperty?.path == items[0]) {
                       //Target Node Property Selected from SchemaMappingDrawer
                    }
                    else if(items[0] == null) {
                        setSelectedTargetProperty(null)
                        setSelectedMapping({targetProperty: {}})
                    }
                    else {
                       
                        setSelectedTargetProperty(items[0])
                        console.log(items[0])
                        setSelectedMapping({targetProperty: getSchemaFromPath(items[0])})
                        
                    }

                }
            }}
            >
            <Tree ref={tree} treeId={'tree-1'} rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>
        </div>
    )

}

export default WorkflowSchemaTree