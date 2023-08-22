import { Text, Col, Button, Card, Grid, Textarea, ActionIcon, Loader } from "@mantine/core";
import { JavascriptOriginal, GoOriginalWordmark, PythonPlain } from 'devicons-react';
import React, {useState, useEffect} from 'react';
import axios from 'axios';

const GenerateCode = ({ workflowId, setFetchGeneratedFiles }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('Javascript');
    const [additionalInstructions, setAdditionalInstructions] = useState('');
    const [supportedLanguages, setSupportedLanguages] = useState(['Javascript', 'Python', 'Go']);
    const [generating, setGenerating] = useState(false);
    
    const handleButtonClick = (language) => {
      setSelectedLanguage(language);
    };

    const generateLanguageCards = () => {
      return supportedLanguages.map((language) => {
          return (
            <Col key={language} sm={3} md={3} lg={3} sx={{display:'flex',flexDirection: 'column', alignItems:'center', justifyContent: 'center'}}>
              <ActionIcon
                  variant={selectedLanguage === language ? 'filled' : 'outline'}
                  
                  onClick={() => handleButtonClick(language)}
                  sx={{width: 100, height: 100}}
                >
                  {
                    language === 'Python' ? <PythonPlain size={80} /> : language === 'Javascript' ? <JavascriptOriginal size={80} /> : <GoOriginalWordmark size={80} />
                  }
              </ActionIcon>
              <Text styles={{alignItems:'center', justifyContent: 'center', width: '100%'}}>
                {language}
              </Text>
            </Col>
          )
      })
    }

    const generateCode = () => {
      setGenerating(true);
      const promptPrefix = additionalInstructions.length > 0 ? "Generate a compilable application in " + selectedLanguage + " with these assumptions and requirements: " + additionalInstructions : "Generate a compilable application in " + selectedLanguage + " with these these requirements: ";
      const prompt = promptPrefix + "Integration Details: " + " Objective: Build an integration between the specified APIs in python with comments to allow a developer to understand the components of the implementation.  \n\nVariables: Double curly brackets refer to a variable whose value will have to be generated or will be provided by input data. Curly brackets define a variable.  If the variable is in the \"Mapping Table\" between steps, then it's value should be set according to the formula and the input.  If the variable is not in the \"Mapping Table\", assume it is hardcoded.  \n\nMapping Tables: Between API Requests, there may be a \"Mapping Table.\" The \"Mapping Table\" will contain three columns: INPUT_OBJECT_PROPERTY_PATH, FORMULA, and OUTPUT_OBJECT_PROPERTY_PATH. INPUT_OBJECT_PROPERTY_PATH values are dot-notation representations of a property in an input JSON object (i.e. a REST API response body.)  FORMULA values specify changes to the value of the INPUT_OBJECT_PROPERTY_PATH value that need to be made before setting that value to the output object's property.  The OUTPUT_OBJECT_PROPERTY_PATH values are dot-notation representations of a property in an object that will be the request body for another API request.\n\n// INFORMATION ABOUT THE INVOLVED APIS (AUTHENTICATION AND BASE URLS FOR REQUESTS)\n1. API #1\n1a. Base URL: https://partners.cloudkitchens.com\n1b. Authentication: OAuth 2.0 \n1c. How to Generate a Token\n- Make an HTTP Request : \n    Path: POST https://partners.cloudkitchens.com/v1/auth/token\n    Method: POST\n    Form-Encoded (x-www-form-urlencoded): [scope: \"menus.get_current menus.publish orders.update storefront.store_availability menus.entity_suspension orders.create\", grant_type: 'client_credentials', client_id: {clientId}, client_secret: {clientSecret}]\n- Store the Token: The response will contain an object with the token stored at '.access_token' as a String.\n\n2. API #2\n2a. Base URL: https://partners.cloudkitchens.com\n2b. Authentication: OAuth 2.0\n2c. How to Generate a Token\n- Make an HTTP Request : \n    Path: POST https://partners.cloudkitchens.com/v1/auth/token\n    Method: POST\n    Form-Encoded (x-www-form-urlencoded): [scope: \"callback.error.write manager.menus manager.orders menus.async_job.read menus.get_current menus.read menus.upsert menus.upsert_hours orders.read ping\", grant_type: 'client_credentials', client_id: {clientId}, client_secret: {clientSecret}]\n- Store the Token: The response will contain an object with the token stored at '.access_token' as a String.\n\n//HOW THE INTEGRATION SHOULD BE RUN\nThis integration should run on the following cadence: Weekly at 7:00 PM Eastern Standard Time on Monday, Thursday, and Saturday.  \n\n// HERE IS A DESCRIPTION OF THE STEPS FOR THE INTEGRATION\nStep 1. Generate bearer tokens for both API #1 and API #2.  These will be used to make the HTTP requests specified in this workflow.\nStep 2. Make a GET request to API #1 at the path /v1/menu with the following Headers and Parameters:\n    Step 2a. Request Headers (key and value type): [\"X-Store-Id\": \"String\", \"Authorization\": \"Bearer {token}\"]\n\nStep 3. When a response is received, translate the JSON into a new JSON object according to the mapping table below.  The INPUT_OBJECT_PROPERTY_PATH contains the dot-notation representation of an input object property stored in the JSON of an API response.  It describes the structure of the object you will receive from the API request.  The value of that property will need to have the FORMULA applied to it to produce the output value (if the formula is One to One then the value is not changed.) The OUTPUT_OBJECT_PROPERTY_PATH is the dot-notation representation of an output object property.  The output properties combined describe all of the required output object properties.  If there are any {} they represTheent variables that should be set according to the input value and the formula to apply.\nIf the formula is \"No Changes to Input\", then the input property's value will not need to change when setting the output object's property.\n\n//Mapping Table\nINPUT_OBJECT_PROPERTY_PATH\tFORMULA\tOUTPUT_OBJECT_PROPERTY_PATH\ncategories.{categoryId}\tNo Changes to Input\tcategories.{categoryId}\ncategories.{categoryId}.id\tNo Changes to Input\tcategories.{categoryId}.id\ncategories.{categoryId}.name\tNo Changes to Input\tcategories.{categoryId}.name\nmodifierGroups.{modifierGroupId}\tNo Changes to Input\tmodifierGroups.{modifierGroupId}\n\nStep 4. Using the result of the translation as the Request Body, make a POST request to API #2's /v1/menus path with the following headers and parameters:\nStep 4a. Request Headers (key and value type): [\"X-Store-Id\": \"String\", \"Authorization\": \"Bearer {token}\"]\n" ;
      
      const requestBody = {
        project_path: 'projects/'+workflowId,
        project_prompt: prompt,
        metadata: {
          workflow_id: workflowId,
          language: selectedLanguage,
          additional_instructions: additionalInstructions
        }
      }

      axios.post(process.env.NEXT_PUBLIC_API_BASE_URL+ '/code/'+workflowId+'/generate', requestBody)
        .then((response) => {
          console.log(response.data)
          setGenerating(false);
          setFetchGeneratedFiles(true);
        })
        .catch((error) => {
          setGenerating(false);
          console.log(error);
        })
      
    }

    return (
      <div style={{display:'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
        <Card
          shadow="md"
          padding="lg"
          radius="md"
          style={{display:'flex', flexDirection: 'column',padding:'20px', width: '70%', alignItems:'center', justifyContent:'center'}}
        >
          {
            generating ? (
                <div style={{display:'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
                  <Loader size="xl" />
                  <div style={{height: 20}} />
                  <Text sx={{fontFamily: 'Visuelt', fontWeight: 400, fontSize: '20px'}}>Generating Code...</Text>
                </div>
            ) : (
                <>
                  <div>
                    <Text sx={{fontFamily: 'Visuelt', fontWeight: 400, fontSize: '30px'}}>Generate an Integration</Text>
                      <Text sx={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '15px'}}>
                        Here, we are generating code based on your workflow diagram and data mappings. 
                        Select the programming language and provide any additional instructions if needed.
                      </Text>
                  </div>
                  <div style={{height: 30}} />
                  <div style={{display:'flex', flexDirection: 'column', width: '100%'}}>
                    <Text sx={{fontFamily: 'Visuelt', fontWeight: 400, fontSize: '20px'}}>Select Programming Language</Text>
                    <Text sx={{fontFamily: 'Visuelt', fontWeight: 100}} size="sm">
                      Choose the programming language you would like to generate code in.
                    </Text>
                    <div style={{height: 20}} />
                    <Grid gutter="sm" justify='flex-start'>
                      {generateLanguageCards()}
                    </Grid>
                  </div>
                  <div style={{height: 50}} />
                  <div>
                    <Text sx={{fontFamily: 'Visuelt', fontWeight: 400, fontSize: '20px'}}>Specific Assumptions or Instructions</Text>
                    <Text sx={{fontFamily: 'Visuelt', fontWeight: 100}} size="sm">
                      If you have any specific implementation requirements, provide them here.  Examples include, but are not limited to, packages to use, file names for logic, etc.
                    </Text>
                    <div style={{height: 20}} />
                    <Textarea
                      placeholder="Packages to use, file names, etc."
                      multiline
                      autosize
                      minRows={3}
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.currentTarget.value)}
                    />
                  </div>
                  <div style={{height: 20}} />
                  <div style={{width: '100%', display:'flex', flexDirection: 'column', alignItems:'flex-end'}}>
                    <Button
                      variant='filled'
                      color="dark"
                      size="lg"
                      radius="md"
                      style={{width: 200, height: 50}}
                      onClick={() => {
                        setGenerating(true);
                        generateCode();
                      }}
                    >
                      Generate Code
                    </Button>
                  </div>
                </>
            )
          }

          
        </Card>
        
      </div>
    );
  };
  
  export default GenerateCode;