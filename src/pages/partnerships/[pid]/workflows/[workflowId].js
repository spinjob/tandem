import { useRouter } from 'next/router';
import { useCallback, useState, useMemo, useEffect} from 'react';
import {
    createStyles,
    Menu,
    Loader,
    Center,
    Header,
    Container,
    Group,
    Button,
    Select,
    Text,
    ActionIcon,
    useMantineTheme,
    SegmentedControl,
    UnstyledButton,
    ScrollArea,
    SimpleGrid
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

  import {
    TimeInput
  } from '@mantine/dates';  

import {TiFlowSwitch} from 'react-icons/ti'
import {AiOutlinePlusSquare} from 'react-icons/ai'
import {FiChevronDown} from 'react-icons/fi'
import 'reactflow/dist/style.css';
import axios from 'axios';


const nodeTypes = {trigger: TriggerNode}

const useStyles = createStyles((theme,opened, checked ) => ({
  inner: {
    height: 30,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  icon: {
    transition: 'transform 150ms ease',
    transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
  },
  control: {
    width: 270,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderRadius: theme.radius.md,
    fontFamily: 'Visuelt',
    fontWeight: 100,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]
    }`,
    transition: 'background-color 150ms ease',
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[opened ? 5 : 6]
        : opened
        ? theme.colors.gray[0]
        : theme.white,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },
}));


function TriggerNode ({data}) {
    const {classes, cx} = useStyles();

    const [selected, setSelected] = useState("scheduled")
    const [selectedApi, setSelectedApi] = useState(data.apis[0].uuid)
    
    const triggerTypeOptions = data.webhooks.length > 0 ? [{label: 'Scheduled', value: 'scheduled'}, {label: 'Webhook', value: 'webhook'}] : [{label: 'Scheduled', value: 'scheduled'}]

    //Scheduled Trigger State
    const [selectedCadence, setSelectedCadence] = useState("weekly")
    const [selectedRunTime, setSelectedRunTime] = useState(null)
    const [selectedTimezone, setSelectedTimezone] = useState(null)
    const [selectedDays, setSelectedDays] = useState(null)
    const [cadenceOpened, setCadenceOpened] = useState(false);
    const [timezoneOpened, setTimezoneOpened] = useState(false);

    const cadenceOptions = [{label: 'Daily', value: 'daily'},{label: 'Weekly', value: 'weekly'}]
    const dayOptions = [{label: 'Su', value: 'sunday'},{label: 'Mo', value: 'monday'}, {label: 'Tu', value: 'tuesday'}, {label: 'We', value: 'wednesday'}, {label: 'Th', value: 'thursday'}, {label: 'Fr', value: 'friday'}, {label: 'Sa', value: 'saturday'}]
    const timezoneOptions = [{label: 'UTC', value: 'utc'}, {label: 'EST', value: 'est'}, {label: 'CST', value: 'cst'}, {label: 'MST', value: 'mst'}, {label: 'PST', value: 'pst'}]

    const addDay = (event) => {
        if (selectedDays)
        {
            if (selectedDays.includes(event.currentTarget.value)) {
                setSelectedDays(selectedDays.filter((day) => {return day != event.currentTarget.value}))
            } else {
                setSelectedDays([...selectedDays, event.currentTarget.value])
            }
        } else {
            setSelectedDays([event.currentTarget.value])
        }
       
    }
    //Webhook Trigger State
    const [selectedWebhook, setSelectedWebhook] = useState(null)
    const [webhookOpened, setWebhookOpened] = useState(false);
    const filteredWebhooks = data.webhooks.filter((webhook) => {    
        return webhook.parent_interface_uuid == selectedApi
    })

    const menuOptions = filteredWebhooks.map((webhook) => {
        return (
            <Menu.Item 
                key={webhook.uuid} 
                onClick={() => setSelectedWebhook(webhook)}
                style={{width: 230}}>
                <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px'}}>
                    {webhook.name}
                </Text>
            </Menu.Item>
        )
    })
    
    return(
        <div style={{zIndex:1, paddingBottom: 20, backgroundColor:'white', display:'flex', flexDirection:'column', width: 320, borderRadius:8, border:'.5px solid #E7E7E7', boxShadow:"rgba(0, 0, 0, 0.04) 0px 3px 5px" }}>
            <div style={{paddingLeft: 10, width: '100%',backgroundColor: '#F2F0ED', height: 40, borderTopLeftRadius:8,borderTopRightRadius: 8, alignItems:'center', display:'flex'}}>
                <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '16px'}}>Workflow Trigger</Text>
            </div>
                <Handle type="target" position={Position.Right}/>
            <div style={{paddingTop: 15,backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                <SegmentedControl value={selected} onChange={setSelected} style={{fontFamily: 'Visuelt', backgroundColor:'white', borderRadius: 8, border:'.5px solid #E7E7E7',  width: '90%'}} color='dark' radius='md' data={triggerTypeOptions}/>
            </div> 
            {
                selected === "webhook" ? (
                    <div>
                        <div style={{ paddingTop: 15, backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center', }}>
                        <Text style={{fontFamily:'Visuelt', fontSize:'12px', width: 270, color: 'grey'}}>Choose the webhook that, when received, will initiate the workflow.</Text>
                        <div style={{height: 15}}/>
                        <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Webhook</Text>
                        </div>
                        <div style={{height: 5}}/>
                        <div style={{backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                            <SegmentedControl value={selectedApi} onChange={setSelectedApi} style={{fontFamily: 'Visuelt', backgroundColor: 'white', width: '90%', border:'.5px solid #E7E7E7',borderRadius: 8}} color='dark' radius='md' data={[{label:data.apis[0].name, value:data.apis[0].uuid}, {label:data.apis[1].name, value:data.apis[1].uuid}]}/>
                        </div> 
                        <div style={{paddingTop: 15,backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                            <Menu
                                onOpen={() => setWebhookOpened(true)}
                                onClose={() => setWebhookOpened(false)}
                                radius="md"
                                width="target"
                                zIndex={1}    
                                >
                                <Menu.Target>
                                <UnstyledButton className={classes.control}>
                                {selected ? (
                                        <Group spacing="xs">
                                            <span className={classes.label}>{selectedWebhook?.name}</span>
                                        </Group>
                                ) : (
                                        <Group spacing="xs">
                                            <span className={classes.label}>Choose a webhook</span>
                                        </Group>
                                )} 
                                    <FiChevronDown className={classes.icon} />
                                </UnstyledButton>
                                </Menu.Target>
                                <Menu.Dropdown>{
                                    <ScrollArea type="hover" style={{height: 300, width: '100%'}}>
                                        {menuOptions}
                                    </ScrollArea>   
                                }</Menu.Dropdown>
                            </Menu>
                        </div>
                    </div>
                ) : selected === "scheduled" ? (
                    <div style={{ paddingTop: 15, backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center', }}>
                        <div style={{display:'block'}}>
                            <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Cadence</Text>
                            <Menu
                                    onOpen={() => setCadenceOpened(true)}
                                    onClose={() => setCadenceOpened(false)}
                                    radius="md"
                                    width="target"
                                    zIndex={1}   
                                    >
                                    <Menu.Target>
                                    <UnstyledButton className={classes.control}>
                                        {selectedCadence ? (
                                                <Group spacing="xs">
                                                    <span className={classes.label}>{selectedCadence?.label}</span>
                                                </Group>
                                        ) : (
                                                <Group spacing="xs">
                                                    <span className={classes.label}>Choose a webhook</span>
                                                </Group>
                                        )} 
                                        <FiChevronDown className={classes.icon} />
                                    </UnstyledButton>
                                    </Menu.Target>
                                    <Menu.Dropdown style={{backgroundColor: 'white'}}>{
                                        <ScrollArea type="hover" style={{height: 80}}>
                                            {cadenceOptions.map((cadence) => {
                                                    return (
                                                        <Menu.Item 
                                                            key={cadence.value} 
                                                            onClick={() => setSelectedCadence(cadence)}
                                                            style={{width: 230}}>
                                                            <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px'}}>
                                                                {cadence.label}
                                                            </Text>
                                                        </Menu.Item>
                                                    )
                                                })}
                                        </ScrollArea>
                                    }</Menu.Dropdown>
                            </Menu>
                        </div>
                        <div style={{height: 15}}/>
                            { selectedCadence && selectedCadence.value === "daily" ? (
                                    <div style={{display:'block'}}>
                                        <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Time</Text>
                                        <div style={{display:'block'}}>
                                        <TimeInput
                                            onChange={setSelectedRunTime} 
                                            defaultValue={new Date()}
                                            format="12"
                                            amLabel="am"
                                            pmLabel="pm"
                                            withAsterisk
                                            clearable
                                        />
                                        <div style={{height: 15}}/>
                                        <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Timezone</Text>
                                        <Menu
                                                onOpen={() => setTimezoneOpened(true)}
                                                onClose={() => setTimezoneOpened(false)}
                                                radius="md"
                                                width="target"
                                                zIndex={1}
                                                >
                                                <Menu.Target>
                                                <UnstyledButton className={classes.control}>
                                                    {selectedTimezone ? (

                                                            <Group spacing="xs">
                                                                <span className={classes.label}>{selectedTimezone?.label}</span>
                                                            </Group>
                                                    ) : (

                                                            <Group spacing="xs">
                                                                <span className={classes.label}>Timezone</span>
                                                            </Group>
                                                    )}
                                                    <FiChevronDown className={classes.icon} />
                                                </UnstyledButton>
                                                </Menu.Target>
                                                <Menu.Dropdown style={{backgroundColor: 'white'}}>{
                                                    <ScrollArea type="hover" style={{height: 80, width: '100%'}}>
                                                        {timezoneOptions.map((timezone) => {

                                                                return (    
                                                                    <Menu.Item
                                                                        key={timezone.value}
                                                                        onClick={() => setSelectedTimezone(timezone)}
                                                                        style={{width: 230}}>
                                                                        <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px'}}>
                                                                            {timezone.label}
                                                                        </Text>
                                                                    </Menu.Item>
                                                                )
                                                            })}
                                                    </ScrollArea>
                                                }</Menu.Dropdown>
                                        </Menu>
                                        </div>
                                    </div>
                                ): selectedCadence && selectedCadence.value === "weekly" ? (
                                    <div style={{display:'block'}}>
                                        <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Day(s)</Text>
                                        <div style={{border:"1px #E7E7E7 solid", borderRadius: 4, height: 40, width: 270, padding: 5}}>
                                            {
                                                dayOptions.map((day) => {
                                                    return  ( 
                                                        <UnstyledButton 
                                                            key={day.value}
                                                            value={day.value} 
                                                            checked={
                                                                selectedDays?.includes(day.value)
                                                            } 
                                                            onClick={addDay} 
                                                            sx={{
                                                                backgroundColor: selectedDays?.includes(day.value) ? 'black' : 'white',
                                                                color: selectedDays?.includes(day.value) ? 'white' : '#858585',
                                                                borderRadius: 4,
                                                                height: 30,
                                                                width: 30,
                                                                '&:hover': {
                                                                    backgroundColor: '#E7E7E7'
                                                                }
                                                             }}>
                                                            <div style={{display: "flex", flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
                                                                <Text style={{display: "flex", flexDirection: 'row', fontFamily: 'Visuelt', fontSize: '12px'}}>
                                                                    {day.label}
                                                                </Text>
                                                            </div>
                                                        </UnstyledButton>
                                                    )
                                                })
                                            }
                                        </div>
                                        <div style={{height: 15}}/>
                                        <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Time</Text>
                                        <div style={{display:'block'}}>
                                            <TimeInput
                                                onChange={setSelectedRunTime} 
                                                defaultValue={new Date()}
                                                format="12"
                                                amLabel="am"
                                                pmLabel="pm"
                                                withAsterisk
                                                clearable
                                            />
                                            <div style={{height: 15}}/>
                                            <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Timezone</Text>
                                            <Menu
                                                    onOpen={() => setTimezoneOpened(true)}
                                                    onClose={() => setTimezoneOpened(false)}
                                                    radius="md"
                                                    width="target"
                                                    zIndex={1}
                                                    >
                                                    <Menu.Target>
                                                    <UnstyledButton className={classes.control}>
                                                        {selectedTimezone ? (

                                                                <Group spacing="xs">
                                                                    <span className={classes.label}>{selectedTimezone?.label}</span>
                                                                </Group>
                                                        ) : (

                                                                <Group spacing="xs">
                                                                    <span className={classes.label}>Timezone</span>
                                                                </Group>
                                                        )}
                                                        <FiChevronDown className={classes.icon} />
                                                    </UnstyledButton>
                                                    </Menu.Target>
                                                    <Menu.Dropdown style={{backgroundColor: 'white'}}>{
                                                        <ScrollArea type="hover" style={{height: 80, width: '100%'}}>
                                                            {timezoneOptions.map((timezone) => {

                                                                    return (    
                                                                        <Menu.Item
                                                                            key={timezone.value}
                                                                            onClick={() => setSelectedTimezone(timezone)}
                                                                            style={{width: 230}}>
                                                                            <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px'}}>
                                                                                {timezone.label}
                                                                            </Text>
                                                                        </Menu.Item>
                                                                    )
                                                                })}
                                                        </ScrollArea>
                                                    }</Menu.Dropdown>
                                            </Menu>
                                        </div>
                                    </div>
                                ) : (
                                   <div/>
                                ) 
                            }
                    </div>
                ) : (
                    <div>
                        <Text>Choose a Trigger Type</Text>
                    </div>
                )
            }
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

const generateTriggerNode = ({apis, webhooks}) => {
    
    const data = {
        label: '1',
        apis: apis,
        webhooks: webhooks
    }
    const triggerNode = 
        { 
            id: '1', 
            position: { x: 500, y: 500 }, 
            type: 'trigger', 
            data: data
        }

    return triggerNode
}

function Flow({workflow, apis, actions, webhooks}) {

    //For existing workflows, will need to load the nodes and edges from the workflow object
    const emptyTriggerNode = generateTriggerNode({apis: apis, webhooks: webhooks})
    const initialNodes = [
        emptyTriggerNode
      ];
    const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [workflowState, setWorkflowState] = useState(null);

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
                 zoomOnScroll={false}
                 style={{position:'absolute', zIndex: 2}}
            >
            <Background color="#FBFAF9" />
            </ReactFlow>
        </div>
    )
}

const WorkflowHeader = ({workflow}) => {
    const { classes } = useStyles();

        return (
            <Header height={30} sx={{ borderBottom: 0 }} mb={120}>
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

const WorkflowStudio = () => {
    const router = useRouter();
    const { pid, workflowId } = router.query;
    const [workflow, setWorkflow] = useState(null);
    const [apis, setApis] = useState(null);
    const [partnership, setPartnership] = useState(null);
    const [workflowActions, setWorkflowActions] = useState(null);
    const [workflowWebhooks, setWorkflowWebhooks] = useState(null);
    
    useEffect(() => {
        if (pid && workflowId && !workflow) {
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/workflows/' + workflowId + '/details').then((res) => {
                setWorkflow(res.data);
                console.log("WORKFLOW: ")
                console.log(res.data)
            }).catch((err) => {
                console.log(err);
            })
        }
        if (pid && !partnership) {
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/details').then((res) => {
                setPartnership(res.data);
                var apiArray = [];
                console.log("PARTNERSHIP: ")
                console.log(res.data)

                res.data[0].interfaces.forEach((api) => {
                    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + api).then((res) => {
                        apiArray.push(res.data);
                        setApis(apiArray);
                        console.log("APIs: ")
                        console.log(res.data)
                    }).catch((err) => {
                        console.log(err);
                    })
                });
                
                if(!workflowActions){
                    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/actions', {
                        "interfaces": res.data[0].interfaces
                    }).then((res) => {
                        setWorkflowActions(res.data);
                        console.log("WORKFLOW ACTIONS: ")
                        console.log(res.data)
                    } ).catch((err) => {
                        console.log(err);
                    })
                }
                if (!workflowWebhooks){
                    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/webhooks', {
                        "interfaces": res.data[0].interfaces
                    }).then((res) => {
                        setWorkflowWebhooks(res.data);
                        console.log("WORKFLOW WEBHOOKS: ")
                        console.log(res.data)
                    } ).catch((err) => {
                        console.log(err);
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
        }

    }, [pid, workflowId, workflow, partnership, apis, setApis, setPartnership, workflowActions, setWorkflowActions, workflowWebhooks, setWorkflowWebhooks])

    return workflow && partnership && apis && workflowActions && workflowWebhooks ? (
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
            <Flow workflow={workflow} apis={apis} webhooks={workflowWebhooks} actions={workflowActions}/>
         </div>
        </div>
       
    ) : (
        <Center>
            <Loader />
        </Center>   
    )
    }

export default WorkflowStudio;