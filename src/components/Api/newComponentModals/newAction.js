import React, { useState, useEffect } from 'react';
import {Text, Button, TextInput, JsonInput, Select, Textarea, Loader, Stepper, Center, Card} from '@mantine/core';
import axios from 'axios';
import parseCurl from 'parse-curl';
import SchemaTree from '../schema-tree'
import path from 'path';

const NewActionForm = ({ apiId, setModalOpen}) => {

    const [actionRequestBodySchemaExample, setActionRequestBodySchemaExample] = useState('')
    const [isInputValid, setIsInputValid] = useState(false)
    const [actionName, setActionName] = useState('')
    const [newActionLoading, setNewActionLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [actionResult, setActionResult] = useState({})
    const [actionMethod, setActionMethod] = useState('post')
    const [actionDescription, setActionDescription] = useState('')
    const [inputCurl, setInputCurl] = useState('')
    const [parsedCurl, setParsedCurl] = useState(null)
    const [curlError, setCurlError] = useState(null)
    const [actionResponseExample, setActionResponseExample] = useState('')
    const [actionResponseBodySchema, setActionResponseBodySchema] = useState('')
    const [isActionResponseBodySchemaValid, setIsActionResponseBodySchemaValid] = useState(false)
    const [actionParameters, setActionParameters] = useState(null)
    const [active, setActive] = useState(0)
    const [newAction, setNewAction] = useState(null)


    const isJson = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function processPathParameters (path) {
        const parameters = []
        const pathParts = path.split('/')
        pathParts.forEach(part => {
            if(part.startsWith('{{') && part.endsWith('}}')) {
                parameters.push({
                    name: part.replace('{{', '').replace('}}', ''),
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string'
                    },
                    schemaRef: 'inlineSchema'
                })
            }
        })
        return parameters
    }

    function processActionResponseBodySchema (schema, status) {
        setActionResponseBodySchema(schema)
        var updatedAction = newAction ? newAction : {}
        updatedAction.responses = []
        var response = {
            http_status_code: status,
            schema: schema,
            content_type: 'json'
        }
        updatedAction.responses.push(response)
        setNewAction(updatedAction)
    }

    function processCurlRequest(){
        // Replace any invalid apostrophe or quote characters
        var cURL = inputCurl.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')

        var updatedAction = newAction ? newAction : {}
        if(inputCurl.includes('--data-raw')){
            cURL = inputCurl.replace('--data-raw', '--data')
        } 
        try {
            const parsed = parseCurl(cURL)
            if(isJson(JSON.stringify(parsed))){
                console.log('parsed', parsed)
                setParsedCurl(parsed)

                // Confirm the method exists
                if(parsed.method){
                    if(newAction){
                        newAction.method = toLowercase(parsed.method)
                        setNewAction(newAction)
                    } else {
                        setNewAction({
                            method: toLowercase(parsed.method)
                        })
                    }
                }

                //Confirm the url exists and then process the URL and any path parameters it contains
                if(parsed.url){
                    var pathParameters = processPathParameters(parsed.url)
     
                    updatedAction.path = removeBaseURLFromEndpoint(parsed.url)

                    var pathParameterObject = {}

                    //If there are path parameters, add them to the action
                    if(pathParameters.length > 0){
                        pathParameters.forEach(parameter => {
                            pathParameterObject[parameter.name] = {
                                in: parameter.in,
                                required: parameter.required,
                                schema: parameter.schema,
                                schemaRef: parameter.schemaRef
                            }
                        })

                        if(updatedAction.parameterSchema){
                            updatedAction.parameterSchema.path = pathParameterObject
                        } else {
                            updatedAction.parameterSchema = {
                                path: pathParameterObject,
                                ...updatedAction.parameterSchema
                            }
                        }
                       
                    } 
                    setNewAction(updatedAction)
                }

                if(parsed.header){
                   
                    var headerObject = {}
                    var headerKeys = Object.keys(parsed.header)

                    headerKeys.forEach(key => {
                        if(key ==  'Content-Type' || key == 'Authorization'){
                        } else {
                            headerObject[key] = {}
                            headerObject[key].in = 'header'
                            headerObject[key].required = true
                            headerObject[key].name = key
                            headerObject[key].schema = {
                                type: 'string',
                                example: parsed.header[key]
                            }
                            headerObject[key].schemaRef = 'inlineSchema'
                        }
                        
                    })

                    if(updatedAction.parameterSchema){
                        updatedAction.parameterSchema.header = headerObject
                    } else {
                        updatedAction.parameterSchema = {
                            header: headerObject,
                            ...updatedAction.parameterSchema
                        }
                    }

                    setNewAction(updatedAction)
                }

                if(parsed.body){
                    var requestBody2Object = {}
                    var requestBodyObject = {}

                    if(parsed.header && parsed.header['Content-Type'] == 'application/json'){
                        requestBodyObject = {
                            type: 'json',
                            required: true,
                        }

                        requestBody2Object = {
                            type: 'json',
                            required: true,
                            schema: schemaFromExample(parsed?.body),
                            schemaRef: 'inlineSchema'
                        }
                    } else if(parsed.header && parsed.header['Content-Type'] == 'application/x-www-form-urlencoded') {
                        
                        requestBodyObject = {
                            type: 'form-urlencoded',
                            required: true,
                        }

                        requestBody2Object = {
                            type: 'form-urlencoded',
                            required: true,
                            schema: schemaFromExample(parsed?.body),
                            schemaRef: 'inlineSchema'
                        }
                        
                    } else {
                        requestBodyObject = {
                            type: 'json',
                            required: true,
                        }

                        requestBody2Object = {
                            type: 'json',
                            required: true,
                            schema: schemaFromExample(parsed?.body),
                            schemaRef: 'inlineSchema'
                        }
                    }

                    updatedAction.requestBody = requestBodyObject
                    updatedAction.requestBody2 = requestBody2Object

                }

                setActive(1)
            } else {
                setActive(0)
            }
        } catch (error) {
            console.log(error)
            setCurlError(error)
            setParsedCurl(null)
            setActive(0)
        }
        setLoading(false)
    }

    function processSchemaProperties (schema) {
        const properties = {}
        if(!schema) {
            return properties
        }
        const propertyKeys = Object.keys(schema) ? Object.keys(schema) : []

        propertyKeys.forEach(key => {
            properties[key] = {
                type: Array.isArray(schema[key]) ? 'array' : typeof schema[key],
                example: JSON.stringify(schema[key]),
                required: false
            }
            if(typeof schema[key] == 'object' && Array.isArray(schema[key]) == false) {
                properties[key].properties = processSchemaProperties(schema[key])
            }

            if(Array.isArray(schema[key]) == true && schema[key].length > 0) {
                if(typeof schema[key][0] == 'object' && Array.isArray(schema[key][0]) == false) {
                    properties[key].items = {
                    type: 'object',
                    required: [],
                    properties: processSchemaProperties(schema[key][0])
                    }
                } else {
                    properties[key].items = {
                        type: Array.isArray(schema[key][0]) ? 'array' : typeof schema[key][0],
                        example: JSON.stringify(schema[key][0]),
                        required: false
                    }
                }
            }
        })
        
        return properties
    }

   function schemaFromExample(json) {
        console.log('json', json)
        const schema = {} 
        const isArray = Array.isArray(JSON.parse(json))
        console.log('isArray', Array.isArray(JSON.parse(json)))
        try {
            JSON.parse(json)
        } catch (error) {
            console.log(error)
            return null
        }
        const exampleObj = isArray ? JSON.parse(json)[0] : JSON.parse(json)

        Object.keys(exampleObj).forEach(key => {
        
            if(typeof exampleObj[key] == 'object' && !Array.isArray(exampleObj[key])) {
                if(hasDynamicKeys(exampleObj[key])) {
                    console.log("has dynamic keys")
                    var dictionaryValues = Object.values(exampleObj[key])
                    schema[key] = {
                        type: 'object',
                        required: true,
                        example: JSON.stringify(exampleObj[key]),
                        properties: {
                            '{{dynamicKey}}': {
                                type: 'object',
                                description: 'Dynamic key for parent dictionary',
                                required: true,
                                properties: processSchemaProperties(dictionaryValues[0])
                            }
                        } 
                    }

                } else {
                    schema[key] = {
                        type: Array.isArray(exampleObj[key]) ? 'array' : typeof exampleObj[key],
                        example: JSON.stringify(exampleObj[key]),
                        required: false
                    }
                    
                    schema[key].properties = processSchemaProperties(exampleObj[key])
                }
                
            } else if(Array.isArray(exampleObj[key]) && exampleObj[key].length > 0) {
                
                schema[key] = {
                    type: Array.isArray(exampleObj[key]) ? 'array' : typeof exampleObj[key],
                    example: JSON.stringify(exampleObj[key]),
                    required: false
                }
                
                if(typeof exampleObj[key][0] == 'object' && Array.isArray(exampleObj[key][0]) == false) {
                        schema[key].items = {
                        type: 'object',
                        required: [],
                        properties: processSchemaProperties(exampleObj[key][0])
                    }
                } else {
                    schema[key].items = {
                        type: Array.isArray(schema[key][0]) ? 'array' : typeof schema[key][0],
                        example: JSON.stringify(schema[key][0]),
                        required: false
                    }
                }
            } else {
                schema[key] = {
                    type: Array.isArray(exampleObj[key]) ? 'array' : typeof exampleObj[key],
                    example: JSON.stringify(exampleObj[key]),
                    required: false
                }
                
            }

        })

        if (isArray) {
            return {
                "[array]": {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: [],
                        properties: schema
                    }
                }
            }
        } else {
            return schema
        }


   }

   function hasDynamicKeys(obj) {
        if(!obj){
            return false;
        }
        const keys = Object.keys(obj);
        if (keys.length === 0) {
        return true; // empty object has static keys with same properties
        }
        const firstKeyProps = Object.keys(obj[keys[0]]);
        for (let i = 1; i < keys.length; i++) {
        const keyProps = Object.keys(obj[keys[i]]);
        if (keyProps.length !== firstKeyProps.length) {
            return false; // keys have different number of properties
        }
        for (let j = 0; j < keyProps.length; j++) {
            const propName = keyProps[j];
            if (!firstKeyProps.includes(propName) || typeof obj[keys[i]][propName] !== typeof obj[keys[0]][propName]) {
            return false; // property name or type is different from first key
            }
        }
        }
        return true;
   }
  
   function generateAction(){
        const action = newAction 
        action.name = actionName
        action.parent_interface_uuid = apiId
        action.method = toLowercase(actionMethod)

        setNewActionLoading(true)
        saveNewAction(action)
   }

   function saveNewAction(action) {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/actions/new', action).then(res => {
            console.log(res)
            setActionResult(res.data)
            setNewActionLoading(false)
            return res.data
        } ).catch(err => {
            console.log(err)
            setNewActionLoading(false)
            return err
        })
   }

   function selectProperty (){

   }

   function removeBaseURLFromEndpoint(url){
        var path = "/" + url.split('/').slice(3).join('/')
        return path
   }

   function toLowercase(str) {
        return str.toLowerCase()
    }


    useEffect(() => {
        if(actionResponseExample || !actionResponseExample == '') {

                if(isJson(actionResponseExample)) {
                    setIsActionResponseBodySchemaValid(true)
                } else {
                    setIsActionResponseBodySchemaValid(false)
                }
 
        }
    }, [actionResponseExample])

    return newActionLoading ? (
        <div>
            <Loader color='dark' size='sm' />
        </div>
    ) : (
    
        <div>
            <div style={{height: '20px'}}></div>
            <Stepper color={'#B5B6FF'} radius="md" active={active} size='md' allowNextStepsSelect={false}>
                <Stepper.Step label={ <Text sx={{fontFamily: "Visuelt"}}>  Step 1 </Text>  } description={<Text sx={{fontFamily: "Visuelt", fontWeight: 100}}> Basic Action Details</Text>}>
                    {/* Action Details & cURL Input */}
                    <div>
                        <Text
                            sx={{
                                fontSize: '14px',
                                color: 'gray',
                                marginBottom: '10px',
                                display: 'block',
                                fontFamily: 'Visuelt',
                                fontWeight: 100
                                
                            }}
                        >
                        </Text>
                        <TextInput
                            label={
                                <Text
                                    sx={{
                                        fontSize: '14px',
                                        color: 'black',
                                        marginBottom: '10px',
                                        display: 'block',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 100
                                    }}
                                    >
                                    Action Name (no spaces)
                                    </Text>
                            }
                            onChange={(e) => setActionName(e.target.value.trim())}
                            value={actionName}
                            placeholder="e.g. createUser"
                        />
                        <div style={{height: '20px'}}></div>
                        <Textarea
                            label={
                                <Text
                                    sx={{
                                        fontSize: '14px',
                                        color: 'black',
                                        marginBottom: '10px',
                                        display: 'block',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 100
                                    }}
                                    >
                                    Action Description
                                </Text>
                            }
                            onChange={(e) => setActionDescription(e.target.value)}
                            value={actionDescription}
                            placeholder="e.g. Creates a new user"
                        />
                        <div style={{height: '20px'}}></div>
                        <Textarea
                            label={
                                <Text
                                    sx={{
                                        fontSize: '14px',
                                        color: 'black',
                                        marginBottom: '10px',
                                        display: 'block',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 100
                                    }}
                                    >
                                    cURL Request
                                </Text>
                            }
                            onChange={(e) => setInputCurl(e.target.value)}
                            value={inputCurl}
                            placeholder="Tandem uses a cURL request to quickly generate the action's request body schema, method, and endpoint."
                            style={{ height: 250 }} 
                            error={curlError ? "Invalid cURL Request" : null}
                            maxRows={10}
                            minRows={10}
                        />
                        <div style={{height: '30px'}}/>
                        <Button
                            loading={loading}
                            onClick={() => {
                                setLoading(true)
                                processCurlRequest()
                            }}
                            disabled={inputCurl == '' || !inputCurl || actionName == '' && inputCurl == '' || actionName == '' && !inputCurl || actionName == null && inputCurl == '' || actionName == null && !inputCurl}
                            sx={{
                                marginTop: '10px',
                                marginRight: '10px',
                                width: '100%',
                                backgroundColor: isInputValid ? '#030303' : '#E0E0E0',
                                color: isInputValid ? '#FFFFFF' : '#000000',
                                fontFamily: 'Visuelt',
                                fontWeight: 500,
                                fontSize: '14px',
                                border: 'none',
                                borderRadius: '0px',
                                ':hover': {
                                    backgroundColor: isInputValid ? '#030303' : '#E0E0E0',
                                    color: isInputValid ? '#FFFFFF' : '#000000',
                                },
                            }}
                        >
                            Process cURL Request
                        </Button>
                        
                    </div>
                </Stepper.Step>
                <Stepper.Step label={ <Text sx={{fontFamily: "Visuelt"}}>Step 2</Text>  } description={<Text sx={{fontFamily: "Visuelt", fontWeight: 100}}> Confirm Imported Details</Text>}>
                     {/* Parsed cURL Results for Confirmation*/}
                     <div style={{height: '30px'}}></div>
                     <Text
                        sx={{
                            fontSize: '20px',
                            color: 'black',
                            marginBottom: '10px',
                            display: 'block',
                            fontFamily: 'Visuelt',
                            fontWeight: 400
                        }}
                    >
                        Confirm Method, Path, and Request Body 
                    </Text>

                    {
                        parsedCurl ? (
                            <div>
                                <Card withBorder>
                                    <Card.Section sx={{padding: 20}}>
                                        <Text
                                                    sx={{
                                                        fontSize: '18px',
                                                        color: 'black',
                                                        marginBottom: '10px',
                                                        display: 'block',
                                                        fontFamily: 'Visuelt',
                                                        fontWeight: 400
                                                    }}
                                                    >
                                                    Method and Path
                                        </Text>
                                        <Text
                                            sx={{
                                                fontSize: '16px',
                                                color: 'black',
                                                marginBottom: '10px',
                                                display: 'block',
                                                fontFamily: 'Visuelt',
                                                fontWeight: 100
                                            }}

                                        >
                                            {parsedCurl?.method} { removeBaseURLFromEndpoint(parsedCurl?.url) }
                                        </Text>
                                                       
                                        {
                                            newAction?.parameterSchema && newAction?.parameterSchema?.path ? (
                                                Object.keys(newAction?.parameterSchema?.path).map((path, index) => {
                                                    return (
                                                        <>
                                                            <div key={index} style={{height: '20px'}}></div>
                                                            <Text
                                                                sx={{
                                                                    fontSize: '18px',
                                                                    color: 'black',
                                                                    marginBottom: '10px',
                                                                    display: 'block',
                                                                    fontFamily: 'Visuelt',
                                                                    fontWeight: 400
                                                                }}
                                                                >
                                                                Path Parameters
                                                            </Text>
                                                            <div key={index}>
                                                                <Text
                                                                    sx={{
                                                                        fontSize: '16px',
                                                                        color: 'black',
                                                                        marginBottom: '10px',
                                                                        display: 'block',
                                                                        fontFamily: 'Visuelt',
                                                                        fontWeight: 100
                                                                    }}
                                                            
                                                                >
                                                                    {path}
                                                                </Text>
                                                            </div>
                                                        </>
                                                    )
                                                })
                                            ) : null
                                        }
            
                                    </Card.Section>
                                </Card>
                                <div style={{height: '20px'}}/>
                                {
                                    parsedCurl?.header && newAction?.parameterSchema && newAction?.parameterSchema?.header ? (
                                        <Card withBorder>
                                            <Card.Section sx={{padding: 20}}>
                                                <Text
                                                    sx={{
                                                        fontSize: '18px',
                                                        color: 'black',
                                                        marginBottom: '10px',
                                                        display: 'block',
                                                        fontFamily: 'Visuelt',
                                                        fontWeight: 400
                                                    }}
                                                    >
                                                    Headers
                                                </Text>
                                                <Text
                                                    sx={{
                                                        fontSize: '16px',
                                                        color: 'black',
                                                        marginBottom: '10px',
                                                        display: 'block',
                                                        fontFamily: 'Visuelt',
                                                        fontWeight: 100
                                                    }}
        
                                                >
                                                    {
                                                        Object.keys(newAction?.parameterSchema?.header).map((header, index) => {
                                                            return (
                                                                <div key={index}>
                                                                    <Text
                                                                        sx={{
                                                                            fontSize: '16px',
                                                                            color: 'black',
                                                                            marginBottom: '10px',
                                                                            display: 'block',
                                                                            fontFamily: 'Visuelt',
                                                                            fontWeight: 100
                                                                        }}
                                                                
                                                                    >
                                                                        {header}
                                                                    </Text>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </Text>
                                            </Card.Section>
                                        </Card>
                                    ) : null
                                }
                               
                                <div style={{height: '20px'}}/>
                                {
                                    parsedCurl?.body && schemaFromExample(parsedCurl?.body) ? (   
                                        <Card withBorder>
                                            <Card.Section sx={{padding: 20}}>
                                                <Text
                                                    sx={{
                                                        fontSize: '18px',
                                                        color: 'black',
                                                        marginBottom: '10px',
                                                        display: 'block',
                                                        fontFamily: 'Visuelt',
                                                        fontWeight: 400
                                                    }}
                                                    >
                                                    Request Body Schema
                                                </Text>
                                                    
                                                <SchemaTree schemaTreeWidth={500} schema={schemaFromExample(parsedCurl?.body)} setSelectedSchemaProperty={selectProperty} schemaType='requestBody' actionUuid={"new"}/>
                                            </Card.Section>
                                        </Card>                  
                                    ): (
                                        <>
                                        </>
                                    )
                                }
                                <div style={{height: '20px'}}/>
                                <div style={{display:'flex', flexDirection: 'row'}}>
                                    <Button
                                        loading={loading}
                                        onClick={() => {
                                            setActive(0)

                                        }}
                                        sx={{
                                            marginTop: '10px',
                                            marginRight: '10px',
                                            width: '100%',
                                            backgroundColor: '#E0E0E0',
                                            color: '#000000',
                                            fontFamily: 'Visuelt',
                                            fontWeight: 500,
                                            fontSize: '14px',
                                            border: 'none',
                                            borderRadius: '0px',
                                            ':hover': {
                                                backgroundColor:'#E0E0E0',
                                                color: '#000000',
                                            },
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        loading={loading}
                                        onClick={() => {
                                            setActive(2)
                                        }}
                                        sx={{
                                            marginTop: '10px',
                                            marginRight: '10px',
                                            width: '100%',
                                            backgroundColor: '#030303',
                                            color: '#FFFFFF',
                                            fontFamily: 'Visuelt',
                                            fontWeight: 500,
                                            fontSize: '14px',
                                            border: 'none',
                                            borderRadius: '0px',
                                            ':hover': {
                                                backgroundColor:'#030303',
                                                color: '#FFFFFF',
                                            }
                                        }}
                                    >
                                        Confirm cURL Details
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                            </>
                        )
                    }
                </Stepper.Step>
                <Stepper.Step label={ <Text sx={{fontFamily: "Visuelt"}}>Step 3</Text>  } description={<Text sx={{fontFamily: "Visuelt", fontWeight: 100}}>Response Schema</Text>}>
                    <div>
                        <Text
                            sx={{
                                fontSize: '20px',
                                color: 'black',
                                marginBottom: '10px',
                                display: 'block',
                                fontFamily: 'Visuelt',
                                fontWeight: 400
                            }}
                        >
                            Action Response Schema (2XX)
                        </Text>
                            <JsonInput
                                label={
                                    <Text
                                        sx={{
                                            fontSize: '14px',
                                            color: 'black',
                                            marginBottom: '10px',
                                            display: 'block',
                                            fontFamily: 'Visuelt',
                                            fontWeight: 100
                                        }}
                                        >
                                        Provide an example of a successful response from this action in JSON.  Tandem will generate a schema from this, so ensure it contains examples of any property you intend to use in Tandem workflows.
                                        </Text>
                                }
                                onChange={setActionResponseExample}
                                value={actionResponseExample}
                                placeholder="2XX Example Response"
                                style={{ height: 250 }}
                                validationError="Invalid JSON"
                                maxRows={10}
                                minRows={10}
                                formatOnBlur
                            />
                        <div style={{height: '20px'}}/>
                             <div style={{display:'flex', flexDirection: 'row'}}>
                                <Button
                                    loading={loading}
                                    onClick={() => {
                                        setActive(1)
                                    }}
                                    sx={{
                                        marginTop: '10px',
                                        marginRight: '10px',
                                        width: '100%',
                                        backgroundColor: '#E0E0E0',
                                        color: '#000000',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        border: 'none',
                                        borderRadius: '0px',
                                        ':hover': {
                                            backgroundColor:'#E0E0E0',
                                            color: '#000000',
                                        },
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    loading={loading}
                                    onClick={() => {
                                        
                                        var responseSchema = schemaFromExample(actionResponseExample)
                                        if (responseSchema) {
                                            processActionResponseBodySchema(responseSchema, "2XX")
                                            setActive(3)
                                        } else {

                                        }
                                    }}
                                    disabled={!isActionResponseBodySchemaValid}
                                    sx={{
                                        marginTop: '10px',
                                        marginRight: '10px',
                                        width: '100%',
                                        backgroundColor: '#030303',
                                        color: '#FFFFFF',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        border: 'none',
                                        borderRadius: '0px',
                                        ':hover': {
                                            backgroundColor:'#030303',
                                            color: '#FFFFFF',
                                        }
                                    }}
                                >
                                    Process Response Schema
                                </Button>
                            </div>
                    </div>
                </Stepper.Step>
                <Stepper.Step label={ <Text sx={{fontFamily: "Visuelt"}}>Step 4</Text>  } description={<Text sx={{fontFamily: "Visuelt", fontWeight: 100}}>Confirm Response Schema</Text>}>
                    <div>
                        <Text
                            sx={{
                                fontSize: '20px',
                                color: 'black',
                                marginBottom: '10px',
                                display: 'block',
                                fontFamily: 'Visuelt',
                                fontWeight: 400
                            }}
                        >
                            Confirm Response Schema
                        </Text>
                            {
                                actionResponseBodySchema ? ( 
                                    <Card withBorder>
                                        <Card.Section sx={{padding: 20}}>
                                            <SchemaTree schemaTreeWidth={500} schema={actionResponseBodySchema} setSelectedSchemaProperty={selectProperty} schemaType='requestBody' actionUuid={"new"}/>
                                        </Card.Section>
                                    </Card>                    
                                ): (
                                    <>
                                    </>
                                )
                            }
                             <div style={{display:'flex', flexDirection: 'row'}}>
                                <Button
                                    loading={loading}
                                    onClick={() => {
                                        setActive(2)
                                    }}
                                    sx={{
                                        marginTop: '10px',
                                        marginRight: '10px',
                                        width: '100%',
                                        backgroundColor: '#E0E0E0',
                                        color: '#000000',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        border: 'none',
                                        borderRadius: '0px',
                                        ':hover': {
                                            backgroundColor:'#E0E0E0',
                                            color: '#000000',
                                        },
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    loading={loading}
                                    onClick={() => {
                                        
                                        var responseSchema = schemaFromExample(actionResponseExample)
                                        if (responseSchema) {
                                            setActionResponseBodySchema(responseSchema)
                                            setActive(4)
                                        } else {

                                        }
                                    }}
                                    disabled={!isActionResponseBodySchemaValid}
                                    sx={{
                                        marginTop: '10px',
                                        marginRight: '10px',
                                        width: '100%',
                                        backgroundColor: '#030303',
                                        color: '#FFFFFF',
                                        fontFamily: 'Visuelt',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        border: 'none',
                                        borderRadius: '0px',
                                        ':hover': {
                                            backgroundColor:'#030303',
                                            color: '#FFFFFF',
                                        }
                                    }}
                                >
                                    Confirm 2XX Response Schema
                                </Button>
                            </div>
                    </div>
                </Stepper.Step>
                <Stepper.Step label={ <Text sx={{fontFamily: "Visuelt"}}>Step 5</Text>  } description={<Text sx={{fontFamily: "Visuelt", fontWeight: 100}}>Create New Action</Text>}>

                    <div>
                        <Text
                            sx={{
                                fontSize: '20px',
                                color: 'black',
                                marginBottom: '10px',
                                display: 'block',
                                fontFamily: 'Visuelt',
                                fontWeight: 400
                            }}
                        >
                            Confirm and Create Action
                        </Text>
                        <Card withBorder>
                                <Card.Section sx={{paddingLeft:20, paddingTop:20}}>
                                <Text
                                        sx={{
                                            fontSize: '18px',
                                            color: 'black',
                                            marginBottom: '10px',
                                            display: 'block',
                                            fontFamily: 'Visuelt',
                                            fontWeight: 400
                                        }}
                                        >
                                        Action Key
                                    </Text>
                                    <Text
                                        sx={{
                                            fontSize: '14px',
                                            color: 'black',
                                            marginBottom: '10px',
                                            display: 'block',
                                            fontFamily: 'Visuelt',
                                            fontWeight: 100
                                        }}
                                        >
                                        {actionName}
                                    </Text>
                                    <Text>
                                        {actionDescription}
                                    </Text>
                                </Card.Section>
                                <Card.Section sx={{paddingLeft:20, paddingTop:20}}>
                                    <Text
                                        sx={{
                                            fontSize: '18px',
                                            color: 'black',
                                            marginBottom: '10px',
                                            display: 'block',
                                            fontFamily: 'Visuelt',
                                            fontWeight: 400
                                        }}
                                        >
                                        Method and Path
                                    </Text>
                                    {
                                        newAction ? (
                                            <Text
                                                sx={{
                                                    fontSize: '14px',
                                                    color: 'black',
                                                    marginBottom: '10px',
                                                    display: 'block',
                                                    fontFamily: 'Visuelt',
                                                    fontWeight: 100
                                                }}
                                                
                                            >
                                                {newAction.method} {newAction.path}
                                            </Text>
                    
                                        ) : null
                                    }
                                    {
                                        newAction && newAction.parameterSchema && newAction.parameterSchema.path ? (
                                            Object.keys(newAction.parameterSchema.path).map((param, index) => {
                                                return (
                                                    <Text
                                                        sx={{
                                                            fontSize: '14px',
                                                            color: 'black',
                                                            marginBottom: '10px',
                                                            display: 'block',
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 100
                                                        }}
                                                        key={index}
                                                    >
                                                        {param.name}
                                                    </Text>
                                                )
                                            })

                                        ) : (
                                            null
                                        )
                                    }
                                </Card.Section>
                                {
                                    newAction?.parameterSchema && newAction?.parameterSchema?.header ? (
                                        Object.keys(newAction?.parameterSchema?.header).map((header, index) => {
                                            return (
                                                <Card.Section key={index} sx={{paddingLeft:20}}>
                                                    <div style={{height: '20px'}}></div>
                                                    <Text
                                                        sx={{
                                                            fontSize: '18px',
                                                            color: 'black',
                                                            marginBottom: '10px',
                                                            display: 'block',
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400
                                                        }}
                                                        >
                                                        Header Parameters
                                                    </Text>
                                                    <div key={index}>
                                                        <Text
                                                            sx={{
                                                                fontSize: '16px',
                                                                color: 'black',
                                                                marginBottom: '10px',
                                                                display: 'block',
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 100
                                                            }}
                                                    
                                                        >
                                                            {header}
                                                        </Text>
                                                    </div>
                                                </Card.Section>
                                            )
                                        })
                                    ) : null
                                }
                                {
                                    newAction?.parameterSchema && newAction?.parameterSchema?.path ? (
                                        Object.keys(newAction?.parameterSchema?.path).map((path, index) => {
                                            return (
                                                <Card.Section key={index} sx={{paddingLeft:20}}>
                                                    <div style={{height: '20px'}}></div>
                                                    <Text
                                                        sx={{
                                                            fontSize: '18px',
                                                            color: 'black',
                                                            marginBottom: '10px',
                                                            display: 'block',
                                                            fontFamily: 'Visuelt',
                                                            fontWeight: 400
                                                        }}
                                                        >
                                                        Path Parameters
                                                    </Text>
                                                    <div key={index}>
                                                        <Text
                                                            sx={{
                                                                fontSize: '16px',
                                                                color: 'black',
                                                                marginBottom: '10px',
                                                                display: 'block',
                                                                fontFamily: 'Visuelt',
                                                                fontWeight: 100
                                                            }}
                                                    
                                                        >
                                                            {path}
                                                        </Text>
                                                    </div>
                                                </Card.Section>
                                            )
                                        })
                                    ) : null
                                }

                        </Card>
                        <div style={{height: '20px'}}/>
                            {
                                newAction?.requestBody && newAction?.requestBody2  ? (   
                                    <Card withBorder>
                                        <Card.Section sx={{padding: 20}}>
                                            <Text
                                                sx={{
                                                    fontSize: '18px',
                                                    color: 'black',
                                                    marginBottom: '10px',
                                                    display: 'block',
                                                    fontFamily: 'Visuelt',
                                                    fontWeight: 400
                                                }}
                                                >
                                                Request Body Schema
                                            </Text>
                                                
                                            <SchemaTree schemaTreeWidth={500} schema={schemaFromExample(parsedCurl?.body)} setSelectedSchemaProperty={selectProperty} schemaType='requestBody' actionUuid={"new"}/>
                                        </Card.Section>
                                    </Card>                  
                                ): (
                                    <>
                                    </>
                                )
                            }
                            {
                                newAction?.responses && newAction?.responses.length > 0 ? (
                                    <>
                                        <div style={{height: '20px'}}/>
                                        <Card withBorder>
                                            <Card.Section sx={{padding: 20}}>
                                                <Text
                                                    sx={{
                                                        fontSize: '18px',
                                                        color: 'black',
                                                        marginBottom: '10px',
                                                        display: 'block',
                                                        fontFamily: 'Visuelt',
                                                        fontWeight: 400
                                                    }}
                                                    >
                                                    Response Body Schema
                                                </Text>
                                                <SchemaTree schemaTreeWidth={500} schema={newAction?.responses[0].schema} setSelectedSchemaProperty={selectProperty} schemaType='requestBody' actionUuid={"new"}/>
                                            </Card.Section>
                                        </Card>     
                                    </> 
                                                   
                                ): (
                                    <>
                                    </>
                                )
                            }
                        <div style={{display:'flex', flexDirection: 'row'}}>
                            <Button
                                loading={loading}
                                onClick={() => {
                                    setActive(3)
                                }}
                                sx={{
                                    marginTop: '10px',
                                    marginRight: '10px',
                                    width: '100%',
                                    backgroundColor: '#E0E0E0',
                                    color: '#000000',
                                    fontFamily: 'Visuelt',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    border: 'none',
                                    borderRadius: '0px',
                                    ':hover': {
                                        backgroundColor:'#E0E0E0',
                                        color: '#000000',
                                    },
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                loading={loading}
                                onClick={() => {
                                    generateAction()
                                    setModalOpen(false)
                                }}
                                sx={{
                                    marginTop: '10px',
                                    marginRight: '10px',
                                    width: '100%',
                                    backgroundColor: '#030303',
                                    color: '#FFFFFF',
                                    fontFamily: 'Visuelt',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    border: 'none',
                                    borderRadius: '0px',
                                    ':hover': {
                                        backgroundColor:'#030303',
                                        color: '#FFFFFF',
                                    }
                                }}
                            >
                                Create New Action
                            </Button>
                        </div>
                       
                    </div>
                </Stepper.Step>
            </Stepper>

        </div>
    )

}

export default NewActionForm;