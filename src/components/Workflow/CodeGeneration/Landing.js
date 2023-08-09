import React, {useEffect, useState} from 'react';
import CodeEditorWindow from './CodeEditorWindow';
import {Button, Text} from "@mantine/core";
import axios from 'axios';

import useKeyPress from './hooks/useKeyPress';
// import Footer from "./Footer";
// import OutputWindow from "./OutputWindow";
// import CustomInput from "./CustomInput";
// import OutputDetails from "./OutputDetails";
// import ThemeDropdown from "./ThemeDropdown";

import LanguagesDropdown from "./LanguagesDropdown";

const javascriptDefault = '// Write your code here';

import { languageOptions } from './constants/languageOptions';

console.log("languageOptions", languageOptions);

const Landing = () => {
    const [code, setCode] = useState(javascriptDefault);
    const [language, setLanguage] = useState(
        {
            id: 63,
            name: "JavaScript (Node.js 12.14.0)",
            label: "JavaScript (Node.js 12.14.0)",
            value: "javascript",
        });
    const [theme, setTheme] = useState("light");
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(false);

    const enterPress = useKeyPress("Enter");
    const ctrlPress = useKeyPress("Control");

    const onSelectChange = (sl) => {
        console.log("sl", sl);
        let selectedLanguage = languageOptions.find((l) => l.value === sl);
        console.log("selectedLanguage", selectedLanguage);
        setLanguage(selectedLanguage);
    }

    useEffect(() => {
        if(enterPress && ctrlPress) {
            handleCompile();
        }
    }, [enterPress, ctrlPress]);

    const handleCompile = () => {
        setProcessing(true);
        const formData = {
            language_id: language.id,
            source_code: window.btoa(code),
            stdin: window.btoa(customInput)
        }

        const options = {
            method: 'POST',
            url: process.env.NEXT_PUBLIC_RAPID_API_URL,
            params: { base64_encoded: 'true', fields: '*' },
            headers: {
                'content-type': 'application/json',
                "Content-Type": "application/json",
                "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
                "X-RapidAPI-Host": process.env.NEXT_PUBLIC_RAPID_API_HOST
            },
            data: formData
        }

        axios
            .request(options)
            .then(function (response) {
                console.log("res.data", response.data);
                const token = response.data.token;
                checkStatus(token);
            })
            .catch(function (err) {
                let error = err.response ? err.response.data : err;
                console.log("error", error);
                setProcessing(false);
            });


    }

    const checkStatus = async (token) => {
        const options = {
            method: 'GET',
            url: process.env.NEXT_PUBLIC_RAPID_API_URL + "/" + token,
            params: { base64_encoded: 'true', fields: '*' },
            headers: {
                "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
                "X-RapidAPI-Host": process.env.NEXT_PUBLIC_RAPID_API_HOST
            },
        }
        try {
            let response = await axios.request(options);
            let statusId = response.data.status?.id;

            // We have a result 
            if (statusId === 1 || statusId === 2) {
                // Still processing
                setTimeout(() => {
                    checkStatus(token);
                }, 2000);
                return
            } else {
                setProcessing(false);
                setOutputDetails(response.data);
                console.log("response.data", response.data);
                return
            }
        } catch (error) {                
            console.log("error", error);
            setProcessing(false);
        }
    }

    const onChange = (action, data) => {
        switch (action) {
          case "code": {
            setCode(data);
            break;
          }
          default: {
            console.warn("case not handled!", action, data);
          }
        }
      };

    return (
        <>
            <div>
                <div>
                    <LanguagesDropdown onSelectChange={onSelectChange} />
                </div>
            </div>
            <div>
                <div>
                    <CodeEditorWindow onChange={onChange} language={language} code={code} theme={theme.value} />
                </div>
                <Button 
                    onClick={handleCompile}
                    disabled={!code}
                    >
                        {
                            processing ? "Processing..." : "Compile and Execute"
                        }
                </Button>
            </div>
        </>
    )
}

export default Landing;
