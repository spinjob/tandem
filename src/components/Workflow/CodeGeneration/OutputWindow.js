import React from 'react';
import {Text, Button} from "@mantine/core";

const OutputWindow = ({outputDetails}) => {
    const getOutput = () => {
        let statusId = outputDetails?.status?.id;

        if (statusId === 6) {
            //compilation error
            return (
                <pre style={{color: 'white'}}>
                    {
                        window.atob(outputDetails?.compile_output)
                    }
                </pre>
            )
        } else if (statusId === 3) {
            return (
                <pre style={{color: 'white'}}>
                    {
                        window.atob(outputDetails?.stdout) !== null ? `${window.atob(outputDetails?.stdout)}` : null
                    }
                </pre>
            )
        } else if (statusId === 5){
            return (
                <pre style={{color: 'white'}}>
                    {'Time Limit Exceeded'}
                </pre>
            )
        } else {
            return (
                <pre style={{color: 'white'}}>
                    {window.atob(outputDetails?.stderr)}
                </pre>
            )
        }

    }

    return (
        <div style={{ padding: 10, minHeight: 200, borderRadius: 10, backgroundColor: 'black', overflow:'scroll'}}>
            <Text style={{fontFamily: 'Visuelt', color:'white'}}>
                Output
            </Text>
            <div>
                {outputDetails ? <>{getOutput()}</> : null}
            </div>
        </div>
    )

}

export default OutputWindow;