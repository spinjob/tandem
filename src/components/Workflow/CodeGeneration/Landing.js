import React, {useEffect, useState, useRef} from 'react';
import CodeEditorWindow from './CodeEditorWindow';
import {Button, Text, Loader} from "@mantine/core";
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import axios from 'axios';
import JSZip from 'jszip';

import useKeyPress from './hooks/useKeyPress';
import OutputWindow from './OutputWindow';
import OutputDetails from "./OutputDetails";
import GenerateCode from './GenerateCode';
import LanguagesDropdown from "./LanguagesDropdown";

const javascriptDefault = '// Write your code here';

import { languageOptions } from './constants/languageOptions';

const dataToTreeNodes = (data) => {
    console.log(data)
    var items = {
        root: {
            index: "root",
            isFolder: true,
            children: [],
            data: 'Project Files'
        }
    };

    data.forEach((item) => {
        items[item.filename] = {
            index: item.filename,
            children: [],
            data: item.filename,
            isFolder: false,
            canMove: false,
            canRename: false,
            content: item.content
        }
        items['root'].children.push(item.filename);
    })
    
    return items;
}



const Landing = ({workflowId}) => {
    const [code, setCode] = useState(javascriptDefault);
    const [language, setLanguage] = useState(
        {
            id: 63,
            name: "JavaScript (Node.js 12.14.0)",
            label: "JavaScript (Node.js 12.14.0)",
            value: "javascript",
        });
    const [theme, setTheme] = useState("active4d");
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState(null);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [fetchGeneratedFiles, setFetchGeneratedFiles] = useState(false);

    const fetchLatestFiles = async () => {
        setLoadingFiles(true);
        axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/code/'+ workflowId + '/files')
            .then(function (response) {

                const allFiles = response.data;

                // Extract the newest project version
                const maxVersion = allFiles.reduce((max, item) => {
                    const version = item.metadata.version;
                    return version > max ? version : max;
                  }, 0);

                // Filter files by newest version
                const newestVersionFiles = allFiles.filter((f) => f.metadata.version === maxVersion);

                // Set files
                setFiles(newestVersionFiles);

                if(response.data.length > 0) {
                    setSelectedFile(response.data[0].filename);
                    setCode(response.data[0].content);
                }
                setLoadingFiles(false);
                if(fetchGeneratedFiles) {
                    setFetchGeneratedFiles(false);
                }

            }).catch(function (error) {
                console.log(error);
                setFiles([]);
                setLoadingFiles(false);
                if(fetchGeneratedFiles) {
                    setFetchGeneratedFiles(false);
                }
            });
    }

    const downloadFiles = () => {
        let zip = new JSZip();
        files.forEach((f) => {
          zip.file(f.filename, f.content);
        });
      
        zip.generateAsync({ type: "blob" }).then((content) => {
          // Generate a download link and click it
          const url = window.URL.createObjectURL(content);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "project.zip";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        });
      };
    

    const enterPress = useKeyPress("Enter");
    const ctrlPress = useKeyPress("Control");

    const onSelectChange = (sl) => {
        console.log("sl", sl);
        let selectedLanguage = languageOptions.find((l) => l.value === sl);
        console.log("selectedLanguage", selectedLanguage);
        setLanguage(selectedLanguage);
    }

    useEffect(() => {
        if(!files || fetchGeneratedFiles) {
            fetchLatestFiles();
        }

    }, [files])


    useEffect(() => {
        if(enterPress && ctrlPress) {
            handleCompile();
        }
    }, [enterPress, ctrlPress]);

    const handleCompile = async () => {
        setProcessing(true);

        // Zip all files for compilation using Judge0 API

        let zip = new JSZip();
        files.map((f) => {
            zip.file(f.filename, f.content);
        })
        
        const additionalFiles = await zip.generateAsync({ type: "base64" });

        const formData = {
            language_id: 89,
            // source_code: window.btoa(code),
            stdin: window.btoa(customInput),
            additional_files: additionalFiles
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

    const FileTree = ({data}) => {
        const items = dataToTreeNodes(data);
        const environmentRef = useRef();
        const tree = useRef();
        const [selectedItems, setSelectedItems] = useState([]);

        const handleSelectItems = (items) => {
            const selectedItemKey = items[0];
            // Otherwise, select the new item
            setSelectedItems(selectedItemKey);
            const selectedItemContent = data.filter((item) => item.filename === selectedItemKey)[0].content;
            setCode(selectedItemContent);
        };

        return (
            <>
                <style>{`
                    :root {
                    --rct-color-focustree-item-selected-bg: #000000;
                    --rct-color-focustree-item-selected-text: #FFFFFF;
                    --rct-item-height: 30px;
                    --rct-bar-color: #000000;
                    --rct-bar-width: 0px;
                    }
                    `}
                </style>
                <UncontrolledTreeEnvironment
                    ref={environmentRef}
                    dataProvider={new StaticTreeDataProvider(items, (item,data) => ({...item, data}))}
                    viewState={{selectedItems: [selectedFile]}}
                    getItemTitle={(item) => {return item.data}}
                    defaultInteractionMode={'click-arrow-to-expand'}
                    onSelectItems={handleSelectItems}
                >
                    <Tree ref={tree} treeId="tree-1" rootItem="root" />
                </UncontrolledTreeEnvironment>
            </>

        )
    }
    

    return !files ? (
        <Loader />
    ) : files.length === 0 ? (
        <div style={{display:'flex', flexDirection: 'column', padding: 10}}>
            <GenerateCode workflowId={workflowId} setFetchGeneratedFiles={setFetchGeneratedFiles}/>
        </div>
    ) : (
        <div style={{display:'flex', flexDirection: 'column', height: '100%'}}>
            <div style={{display:'flex', padding: 10, width: '100%', height: '100%', alignItems: 'center', borderBottom: '1px solid grey'}}>
                {/* <div>
                    <LanguagesDropdown onSelectChange={onSelectChange} />
                </div> */}
                <Button onClick={downloadFiles} color='dark' style={{marginLeft: 'auto'}}>
                    Download Project
                </Button>
            </div>
            <div style={{display:'flex', flexDirection: 'row', padding: 0, width: '100%', height: '100%'}}>
                <div style={{width: '15%', backgroundColor:'#EAEAFF'}}>
                    {
                        loadingFiles && !files ? (
                            <Loader />
                        ) : !loadingFiles && !files ? (
                            <div style={{padding: 10}}>No files found</div>
                        ) : (
                            <div style={{height: '100%'}}>
                                <div style={{padding: 10, borderBottom: '1px solid grey'}}>
                                    <Text size='small' weight='bold'>Files</Text>
                                </div>
                                <div style={{height: '10px'}} />
                                <FileTree data={files} />
                            </div>
                        )
                    }
                </div>
                <div style={{width: '65%'}}>
                    <div style={{padding: 10, borderBottom: '1px solid grey'}}>
                        <Text size='small' weight='bold'>Code</Text>
                    </div>
                    <div style={{height: '10px'}} />
                    <CodeEditorWindow onChange={onChange} language={language} code={code} theme={theme.value} />
                </div>
                <div style={{width: '20%'}}>
                    <div style={{padding: 10, borderBottom: '1px solid grey'}}>
                        <Text size='small' weight='bold'>Compile & Execute</Text>
                    </div>
                    <div style={{height: '10px'}} />
                    <div style={{paddingLeft: 10, paddingRight: 10}}>
                        <OutputWindow outputDetails={outputDetails} />
                    </div>
                    <div style={{height: '10px'}} />
                    <div style={{paddingLeft: 10, paddingRight: 10}}>
                        <Button 
                            onClick={handleCompile}
                            disabled={!code}
                            color='dark'
                            >
                                {
                                    processing ? "Processing..." : "Compile & Execute"
                                }
                        </Button>
                        <div style={{height: '10px'}} />
                        <OutputDetails outputDetails={outputDetails} />
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Landing;
