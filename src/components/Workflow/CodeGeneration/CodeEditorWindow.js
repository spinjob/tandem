import React, {useState} from 'react';
import Editor from '@monaco-editor/react';

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
                language={language || "javascript"}
                value={value}
                theme={theme || "light"}
                defaultVAlue="// Write your code here"
                onChange={handleEditorChange}
            />
        </div>
    )
}

export default CodeEditorWindow;