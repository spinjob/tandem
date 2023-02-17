
import {Table, Card, Text, Avatar, Center, Loader, Code, Divider, Button, Badge, ScrollArea} from '@mantine/core'
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css';
import {VscSymbolArray} from 'react-icons/vsc'
import {BiCodeCurly} from 'react-icons/bi'
import {RiDoubleQuotesL} from 'react-icons/ri'
import {AiOutlineNumber} from 'react-icons/ai'
import {RxComponentBoolean, RxQuestionMarkCircled} from 'react-icons/rx'
import { v4 as uuidv4 } from 'uuid';

function generateTreeData (schema, nested, parent) {

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

            const childTreeItems = generateTreeData(schemaValues[index].properties, true, path)
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

                const childTreeItems = generateTreeData(schemaValues[index].items.properties, true, path)
                treeItems = {...treeItems, ...childTreeItems}
                
            } else {
                // if array item schema is a primitive type

                treeItems[path] = childNode

                var inlineSchemaName = uuidv4();
                
                childNode = {
                    index: path,
                    children: [inlineSchemaName],
                    isFolder: true,
                    data: path,
                    type: schemaValues[index].type
                }

                var inlineArrayItemSchemaNode = {
                    index: inlineSchemaName,
                    children: [],
                    data: schemaValues[index].items.schemaName,
                    type: schemaValues[index].items.type
                }

                treeItems[inlineSchemaName] = inlineArrayItemSchemaNode

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
        case 'number' || 'integer' || 'float':
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


const SchemaTree = ({ schema, actionUuid, isLoading, setSelectedSchemaProperty}) => {

    const renderItemTitle = (title, item) => {

        var propertyName = title.split('.').pop()

        return (
            <div style={{display:'flex', flexDirection:'row', alignItems: 'baseline'}}>
                {returnIcon(item.type)}
                <div style={{width: '10px'}} />
                <Text style={{fontFamily: 'apercu-light-pro'}}>{propertyName}</Text>
            </div>
           
        )
    }

    return isLoading ? (
        <Center>
            <Loader color='dark' size="lg" />
        </Center>
    )
    : (
        <div>
            <UncontrolledTreeEnvironment
            dataProvider={new StaticTreeDataProvider(generateTreeData(schema, false, "root"), (item, newName) => ({ ...item, data: newName }))}
            getItemTitle={item => item.data}
            viewState={{}}
            onRenameItem={(item, name) => alert(`${item.data} renamed to ${name}`)}
            renderItemTitle={({title, item}) => renderItemTitle(title, item)}
            onSelectItems={(items) => {setSelectedSchemaProperty(items)}}
            >
            <Tree treeId={'tree-1'} rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>

        </div>
    )

}

export default SchemaTree