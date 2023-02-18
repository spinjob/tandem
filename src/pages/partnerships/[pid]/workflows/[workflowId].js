import { useRouter } from 'next/router';
import { useCallback, useState, useMemo} from 'react';
import {
    createStyles,
    Menu,
    Center,
    Header,
    Container,
    Group,
    Button,
    Select,
    Text,
    ActionIcon,
    useMantineTheme,
    SegmentedControl
  } from '@mantine/core';

import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle, 
    Position
  } from 'reactflow';

import {TiFlowSwitch} from 'react-icons/ti'
import {AiOutlinePlusSquare} from 'react-icons/ai'
import 'reactflow/dist/style.css';


const HEADER_HEIGHT = 30;

const nodeTypes = {trigger: TriggerNode}

const initialNodes = [
    { id: '1', position: { x: 500, y: 500 }, type: 'trigger', data: { label: '1' } }
  ];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];



const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}));


function TriggerNode ({data}) {
    return(
        <div style={{backgroundColor:'white', display:'flex', flexDirection:'column', width: 320, height: 300, borderRadius:8, border:'.5px solid #E7E7E7', boxShadow:"rgba(0, 0, 0, 0.04) 0px 3px 5px" }}>
            <div style={{paddingLeft: 10, width: '100%',backgroundColor: '#F2F0ED', height: 40, borderTopLeftRadius:8,borderTopRightRadius: 8, alignItems:'center', display:'flex'}}>
                <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '16px'}}>Workflow Trigger</Text>
            </div>
                <Handle type="target" position={Position.Right}/>
            <div style={{paddingTop: 15,backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                
                <SegmentedControl style={{fontFamily: 'Visuelt', backgroundColor:'white', borderRadius: 8, border:'.5px solid #E7E7E7',  width: '85%'}} color='dark' radius='md' data={[{label:'Webhook', value:'webhook'}, {label:'Scheduled', value:'scheduled'}]}/>
            </div>            
            <div style={{ paddingTop: 15, backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center', }}>
                <Text style={{fontFamily:'Visuelt', fontSize:'12px', width: 270, color: 'grey'}}>Choose the webhook that, when received, will initiate the workflow.</Text>
            <div style={{height: 15}}/>
                <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Webhook</Text>
            </div>
            <div style={{height: 5}}/>
            <div style={{backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                <SegmentedControl style={{fontFamily: 'Visuelt', backgroundColor: 'white', width: '85%', border:'.5px solid #E7E7E7',borderRadius: 8}} color='dark' radius='md' data={[{label:'API1', value:'API1'}, {label:'API2', value:'API2'}]}/>
            </div> 
            <div style={{paddingTop: 15,backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
            <Select
                style={{fontFamily: 'Visuelt', borderRadius: 8,  width: '85%', position:'absolute', zIndex: 1}}
                placeholder="Pick one"
                data={[
                    { value: 'react', label: 'React' },
                    { value: 'ng', label: 'Angular' },
                    { value: 'svelte', label: 'Svelte' },
                    { value: 'vue', label: 'Vue' },
                ]}
                />
            </div>
        </div>
    )
}

const NewNodeButtonMenu = () => {
    return( 
        <Menu transition="pop-top-right" position='right-start' width={220} withinPortal>
            <Menu.Target>
            <ActionIcon style={{height: 40, width: 40, background: 'white', borderColor: '#E7E7E7'}} variant="default" radius={10} >
                <AiOutlinePlusSquare size={22} color="gray"/>
            </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
            <Menu.Item
                rightSection={
                <Text size="xs" transform="uppercase" weight={700} color="dimmed">
                    Ctrl + P
                </Text>
                }
            >
                Project
            </Menu.Item>
            <Menu.Item
                rightSection={
                <Text size="xs" transform="uppercase" weight={700} color="dimmed">
                    Ctrl + T
                </Text>
                }
            >
                Task
            </Menu.Item>
            <Menu.Item
                rightSection={
                <Text size="xs" transform="uppercase" weight={700} color="dimmed">
                    Ctrl + U
                </Text>
                }
            >
                Team
            </Menu.Item>
            <Menu.Item
                rightSection={
                <Text size="xs" transform="uppercase" weight={700} color="dimmed">
                    Ctrl + E
                </Text>
                }
            >
                Event
            </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
}

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);


    return (
        <div style={{ height: '100%', backgroundColor:'#FBFAF9'}}>
            <div style={{position:'absolute', padding: 40, zIndex: 1, height: 40, width: 220}}>
            <NewNodeButtonMenu />
            </div>
            <ReactFlow
                 nodes={nodes}
                 edges={edges}
                 onNodesChange={onNodesChange}
                 onEdgesChange={onEdgesChange}
                 onConnect={onConnect}
                 nodeTypes={nodeTypes}
            >
            <Background color="#FBFAF9" />
            </ReactFlow>
        </div>
    )
}

const WorkflowHeader = ({workflow}) => {
    const { classes } = useStyles();

        return (
            <Header height={HEADER_HEIGHT} sx={{ borderBottom: 0 }} mb={120}>
              <Container className={classes.inner} fluid>
                <Group>
                  <Text style={{fontFamily:'Visuelt', fontWeight: 600, fontSize:'28px'}}>My Untitled Workflow</Text>
                </Group>
                <Group spacing={5} className={classes.links}>
                    <ActionIcon size='xl'>
                        <TiFlowSwitch size={23} />
                    </ActionIcon>
                </Group>
                <Button radius="xl" sx={{ height: 30 }}>
                  Get early access
                </Button>
              </Container>
            </Header>
          );
    
}

const WorkflowStudio = ({workflow}) => {
    const router = useRouter();
    const { pid, workflowId } = router.query;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
            <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 30,
            width: '93vw',
            height: 90,
            boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
          }}>
            <WorkflowHeader style={{boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)', width: '100%'}} />
            
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '93vw', height: '93vh'}}>
            <Flow />
         </div>


        </div>
       
    );
    }

export default WorkflowStudio;