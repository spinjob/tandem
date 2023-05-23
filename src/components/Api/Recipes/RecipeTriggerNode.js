import React, { memo, useState, useContext } from 'react';
import { Handle, Position } from 'reactflow';
import {Text, Select, Menu, Button, TextArea} from '@mantine/core'

const RecipeTriggerNode = ({ data, isConnectable }) => {

    // const [recipeTrigger, setRecipeTrigger] = useState('')

    return (
        <div style={{ borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: '1px solid black', width:150, height: 80}}>
        <Text sx={{fontFamily: 'Visuelt', fontSize: 16}}>
            Recipe Trigger
        </Text>
         {/* {  recipeTrigger == '' ? (
                <Menu withinPortal sx={{ width: '100%', height: '100%', textAlign: 'center',  fontSize: 10, fontWeight: 100,color: 'black', fontFamily: 'Visuelt'}}>
                    <Menu.Target>
                        <Button variant={'subtle'} sx={{
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: 100,
                            color: 'black',
                            fontFamily: 'Visuelt',
                            width: '100%',
                            height: '100%'
                        }}>Choose a trigger</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={(e) => {
                            setRecipeTrigger('cadence')
                        }}>Run on a cadence</Menu.Item>
                        <Menu.Item onClick={(e) => {
                            setRecipeTrigger('webhook')
                        }}>Start on Webhook Receipt</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            ) : (
                <div>
                    <Text sx={{ textAlign: 'center', fontSize: 12, fontWeight: 100, color: 'black',fontFamily: 'Visuelt'}}>{recipeTrigger}</Text>
                    <Button variant={'filled'} color={'dark'} sx={{ textAlign: 'center', color: 'white', fontSize: 10, fontWeight: 100, fontFamily: 'Visuelt', width: '100%', height: 20}}
                        onClick={(e) => {
                            setRecipeTrigger('')
                        }}
                    >Change Trigger</Button>
                </div>

            )
                
        } */}
        <Handle
            type="source"
            position={Position.Bottom}
            id="b"
            style={{ background: '#555' }}
            isConnectable={isConnectable}
        />
        </div>
    );
};

export default memo(RecipeTriggerNode);