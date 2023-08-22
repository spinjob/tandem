import React, {useState, useEffect} from 'react';
import Editor from '@monaco-editor/react';
import { Text, Loader } from "@mantine/core";
import axios from 'axios';

const CodeEditorWindow = ({onChange, language, code, theme}) => {
    const [value, setValue] = useState(code || '');

    const handleEditorChange = (value) => {
        setValue(value);
        onChange("code", value);
    }
    
    return (
        <div>
            <Editor
                height="85vh"
                width="100%"
                language={'python'}
                value={code}
                theme={theme || "light"}
                defaultValue="// Write your code here"
                onChange={handleEditorChange}
            />
        </div>
    )
}

export default CodeEditorWindow;