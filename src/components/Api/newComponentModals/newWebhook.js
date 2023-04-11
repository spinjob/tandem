import React, { useState, useEffect } from 'react';
import {Text, Button, TextInput, JsonInput} from '@mantine/core';
import axios from 'axios';

const NewWebhookForm = ({ apiId, setModalOpen}) => {
    const [webhookSchemaExample, setWebhookSchemaExample] = useState('')
    const [isInputValid, setIsInputValid] = useState(false)
    const [webhookName, setWebhookName] = useState('')
    const [loading, setLoading] = useState(false)
    const [webhookResult, setWebhookResult] = useState({})

    const isJson = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function processSchemaProperties (schema) {
        const properties = {}
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
                properties[key].items = {
                   type: 'object',
                   required: [],
                   properties: processSchemaProperties(schema[key][0])
                }
            }
        })
        
        return properties
    }

   function schemaFromExample() {
        const schema = {}
        const exampleObj = JSON.parse(webhookSchemaExample)
        
        Object.keys(exampleObj).forEach(key => {
            schema[key] = {
                type: Array.isArray(exampleObj[key]) ? 'array' : typeof exampleObj[key],
                example: JSON.stringify(exampleObj[key]),
                required: false
            }
            
            if(typeof exampleObj[key] == 'object' && !Array.isArray(exampleObj[key])) {
               
                schema[key].properties = processSchemaProperties(exampleObj[key])
                
            }

            if(Array.isArray(exampleObj[key]) && exampleObj[key].length > 0) {
               
                schema[key].items = {
                    type: 'object',
                    required: [],
                    properties: processSchemaProperties(exampleObj[key][0])
                }
            }

        })

        return schema
   }

   function generateWebhookSchema(){
        if(isInputValid) {
            const webhook = {
                name: webhookName,
                parent_interface_uuid: apiId,
                method: 'post',
                requestBody2: {
                   type: 'json',
                   schema: schemaFromExample(webhookSchemaExample),
                   validationType: 'all_of'
                },
                responses: [
                    {
                       http_status_code: "2XX",
                       content_type: 'json',
                       schema:[
                            "2XX"
                       ]
                    }
                ]
            }
            return saveNewWebhook(webhook)
        }   
   }

   function saveNewWebhook(webhook) {
        axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + apiId + '/webhooks/new', webhook).then(res => {
            console.log(res)
            setWebhookResult(res.data)
            setLoading(false)
            return res.data
        } ).catch(err => {
            console.log(err)
            setLoading(false)
            return err
        })
   }

    useEffect(() => {
        if(webhookSchemaExample || webhookSchemaExample == '' || webhookName || webhookName == '' ) {
   
                if(isJson(webhookSchemaExample)) {
                    setIsInputValid(true)
                } else {
                    setIsInputValid(false)
                }
 
        }
    }, [webhookSchemaExample, webhookName])
    
    return (
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
               Provide an example of the webhook and Tandem will generate the schema.
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
                        Webhook Name (no spaces)
                        </Text>
                }
                onChange={(e) => setWebhookName(e.target.value.trim())}
                value={webhookName}
                placeholder="Webhook Name"
            />
            <div style={{height: '20px'}}></div>
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
                        Webhook Schema Example in JSON
                        </Text>
                }
                onChange={setWebhookSchemaExample}
                value={webhookSchemaExample}
                placeholder="Webhook Schema Example JSON"
                style={{ height: 250 }}
                validationError="Invalid JSON"
                maxRows={10}
                minRows={10}
                formatOnBlur
            />
            <Button
                loading={loading}
                disabled={!isInputValid}
                onClick={() => {
                    setLoading(true)
                    generateWebhookSchema()
                    setModalOpen(false)
                }}
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
                Create Definition
            </Button>
        </div>
    )

}

export default NewWebhookForm;