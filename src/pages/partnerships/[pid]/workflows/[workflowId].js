import { useRouter } from 'next/router';
import { useCallback, useState, useContext, useEffect, useRef} from 'react';
import {useUser} from '@auth0/nextjs-auth0/client'
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
    TextInput,
    Textarea,
    ActionIcon,
    Image,
    SegmentedControl,
    UnstyledButton,
    ScrollArea,
    Drawer,
    Modal,
    Tooltip,
    Box
  } from '@mantine/core';

import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    Handle, 
    Position,
    useReactFlow,
    ReactFlowProvider,
  } from 'reactflow';

import {Player } from '@lottiefiles/react-lottie-player';

import { TimeInput } from '@mantine/dates';  
import {AiOutlinePlusSquare, AiFillCheckCircle, AiFillMinusCircle, AiFillPlusCircle} from 'react-icons/ai'
import {FiChevronDown} from 'react-icons/fi'
import {HiOutlineArrowLeft, HiOutlineTrash, HiOutlineDocumentDownload, HiOutlineDotsHorizontal} from 'react-icons/hi'
import {HiOutlineCommandLine} from 'react-icons/hi2'
import {VscWand} from 'react-icons/vsc'
import {TiFlowSwitch} from 'react-icons/ti'
import {BsViewList} from 'react-icons/bs'
import {TbWebhook} from 'react-icons/tb'
import {IoHelpBuoyOutline} from 'react-icons/io5'
import {GrSchedulePlay, GrTrigger} from 'react-icons/gr'
import studioIcon from '../../../../../public/icons/Programing, Data.5.svg'
import blackLogoIcon from '../../../../../public/logos/SVG/Icon/Icon_Black.svg'
import 'reactflow/dist/style.css';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import { toPng } from 'html-to-image';
import AppContext from '../../../../context/AppContext';

import ButtonEdge from '../../../../components/Workflow/ButtonEdge';
import SchemaMappingDrawer from '../../../../components/Workflow/SchemaMappingDrawer';
import ActionMappingView from '../../../../components/Workflow/ActionMappingView';
import MappingModal from '../../../../components/Workflow/MappingModal';
import WorkflowScope from '../../../../components/Workflow/WorkflowScope';
import WorkflowMonitor from '../../../../components/Workflow/WorkflowMonitor';

import LoadingAnimation from '../../../../../public/animations/Loading_Animation.json'
import WorkflowAnimation from '../../../../../public/animations/ValueProp_Section2.json'

const nodeTypes = {trigger: TriggerNode, action: ActionNode}
const edgeTypes = {buttonEdge: ButtonEdge}

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

import useStore from '../../../../context/store';

function downloadImage(dataUrl){
    const a = document.createElement('a');

    a.setAttribute('download', 'reactflow.png');
    a.setAttribute('href', dataUrl);
    a.click();

}

function DownloadButton() {
    const onClick = () => {
        toPng(document.querySelector('.react-flow'), {
            filter: (node) => {
                if (node?.classList?.contains('react-flow__minimap') || node?.classList?.contains('react-flow__controls')
                ) {
                    return false;
                }
                return true;
            },
        }).then(downloadImage);
    };
    return(
        <Button onClick={onClick} style={{backgroundColor: '#EAEAFF', color: '#3F3F3F', fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px', borderRadius: 8, height: 40, width: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #E7E7E7', boxShadow:"rgba(0, 0, 0, 0.04) 0px 3px 5px" }}>
            <HiOutlineDocumentDownload size={20} />
        </Button>
    )
}

function ActionNode ({id, data}) {
    const {classes, cx} = useStyles();

    const [selectedAction, setSelectedAction] = useState(data.selectedAction?.uuid ? data.selectedAction : null)
    const [actionMenuOpened, setActionMenuOpened] = useState(false);
    const [selectedApi, setSelectedApi] = useState(data.selectedAction?.parent_interface_uuid ? data.selectedAction?.parent_interface_uuid : data.apis[0].uuid)
    const setNodeViews = useStore((state) => state.setNodeViews)
    const setNodeAction = useStore((state) => state.setNodeAction)
    const nodeActions = useStore((state) => state.nodeActions)
    const nodeViews = useStore((state) => state.nodeViews)
    const selectedEdge = useStore((state) => state.selectedEdge)
    const [sharedEdgeTargetNodes, setSharedEdgeTargetNodes] = useState([])

    const globalEdgeState = useStore((state) => state.edges)

    const HandleStyleCheck = {
        top: {
          right: -10,
        //   top: sharedEdgeTargetNodes.length > 0 ? 72 : 100,
          top: '30%',
          minWidth: 20,
          height: 20,
          border: "1px solid #E7E7E7",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: 'row',
          display: "flex",
          zIndex: 2,
          boxShadow: "rgba(0, 0, 0, 0.04) 0px 3px 5px"
        },
        bottom: {
          right: -10,
        //   top: sharedEdgeTargetNodes.length > 0 ? 168 : 140,
          top: '70%',
          minWidth: 20,
          height: 20,
          alignItems: "center",
          border: "1px solid #E7E7E7",
          justifyContent: "center",
          flexDirection: 'row',
          display: "flex",
          zIndex: 2,
          boxShadow: "rgba(0, 0, 0, 0.04) 0px 3px 5px"
        }
      };

    const filteredActions = data.actions.filter((action) => {
        return action.parent_interface_uuid == selectedApi
    })

    const menuOptions = filteredActions.map((action) => {
        return (
            <Menu.Item 
                key={action.uuid} 
                value={selectedAction}
                onClick={() => {
                    setSelectedAction(action)
                    data.selectedAction = action
                    setNodeViews([
                            {
                                id: id,
                                selectedAction: action
                            }
                        ])

                    setNodeAction(id, action)
                }}
                style={{width: 230}}>
                <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px'}}>
                    {action.name}
                </Text>
            </Menu.Item>
        )
    })

    useEffect(() => {

        var failureEdges = globalEdgeState.filter((edge) => {
            return edge.source === id && edge.data?.handleId === 'actionFailure'
        }).map((edge) => {
            return edge.target
        })
        
        var successEdges = globalEdgeState.filter((edge) => {
            return edge.source === id && edge.data?.handleId === 'actionSuccess'
        }).map((edge) => {
            return edge.target
        })

        failureEdges.map((failureEdge) => {
            if(successEdges.includes(failureEdge)){
                setSharedEdgeTargetNodes([...sharedEdgeTargetNodes, failureEdge])
            }
        })
    

    }, [ globalEdgeState, id])


    return(
        <div style={{zIndex:1, paddingBottom: 20, backgroundColor:'white', display:'flex', flexDirection:'column', width: 320, borderRadius:8, border: !nodeViews[data.id] || !nodeViews[data.id]?.view || nodeViews[data.id]?.view !== "mapping" ? '.5px solid #E7E7E7' : '2px solid black', boxShadow:"rgba(0, 0, 0, 0.04) 0px 3px 5px" }}>
            <div style={{paddingLeft: 10, width: '100%',backgroundColor: '#EAEAFF', height: 40, borderTopLeftRadius:8,borderTopRightRadius: 8, alignItems:'center', display:'flex'}}>
                {
                    selectedAction ? (
                        <div style={{ display:'flex', flexDirection: 'row'}}>
                            <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '16px', fontWeight: 600}}>{data.apis.filter((api) => api.uuid == selectedApi)[0].name}</Text>
                            <div style={{width: 10}}/>
                            <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '16px'}}>{selectedAction.name}</Text>
                        </div>
                    ) : (
                        <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '16px'}}>Action</Text>
                    )
                }
            </div>
            <Handle id="actionInput" type="target" position={Position.Left} isConnectable={true}/>
            <Tooltip  
                withArrow={true}
                arrowPosition="center"
                arrowSize={10}
                color={'black'}
                label={
                    <Text sx={{
                        fontFamily: 'apercu-regular-pro',
                        fontSize: '12px',
                        fontWeight: 100,
                        color: 'white',
                        marginBottom: 15,
                        backgroundColor: 'black',
                        padding: 10,
                        borderRadius: 5,
                    }}>
                        Drag to add a Success Action
                    </Text>
                }
                position="top" 
                sx={{
                    width: 20,
                    height: 20,
                    right: -10,
                    top: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                }}>
                <Handle
                    id="actionSuccess"
                    type="source"
                    position={Position.Right}
                    isConnectable={true}
                    style={{...HandleStyleCheck.top}}
                    data-id={'actionSucces'}
                > 
                    <AiFillPlusCircle size={20} style={{pointerEvents: "none", color: 'white'}}/> 
                </Handle>

            </Tooltip>
            <Tooltip 
                withArrow = {true}
                arrowPosition="center"
                arrowSize={10}
                color={'black'}
                label={
                    <Text sx={{
                        fontFamily: 'apercu-regular-pro',
                        fontSize: '12px',
                        fontWeight: 100,
                        color: 'white',
                        marginTop: 15,
                        backgroundColor: 'black',
                        padding: 8,
                        borderRadius: 5,
                    }}>
                        Drag to add a Failure Action
                    </Text>
                }
                position="bottom" 
                sx={{
                    width: 20,
                    height: 20,
                    right: -10,
                    top: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                }}>
            <Handle
                id="actionFailure"
                type="source"
                position={Position.Right}
                style={{...HandleStyleCheck.bottom}}
                isConnectable={true}
            > 
                <AiFillMinusCircle size={20} style={{pointerEvents: "none", color: 'white'}}/> 
                
            </Handle>
            </Tooltip>
             { !nodeViews[data.id] || !nodeViews[data.id]?.view || nodeViews[data.id]?.view !== "mapping" ? (
                                 <>
                                 <div style={{padding:15}}>
                                     <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Action</Text>
                                     <div style={{height: 15}}/>
                                     <Text style={{fontFamily:'Visuelt', fontSize:'12px', width: 270, color: 'grey'}}>Choose an API request to perform.</Text>
                                 </div>
                                 <div style={{backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                                     <SegmentedControl value={selectedApi} onChange={setSelectedApi} style={{fontFamily: 'Visuelt', backgroundColor: 'white', width: '90%', border:'.5px solid #E7E7E7',borderRadius: 8}} color='dark' radius='md' data={[{label:data.apis[0]?.name, value:data.apis[0]?.uuid}, {label:data.apis[1]?.name, value:data.apis[1]?.uuid}]}/>
                                 </div> 
                                 <div style={{paddingTop: 15,backgroundColor:'white', display:'flex', flexDirection:'column', alignItems:'center'}}>
                                     <Menu
                                         onOpen={() => setActionMenuOpened(true)}
                                         onClose={() => setActionMenuOpened(false)}
                                         radius="md"
                                         style={{width: '90%'}}
                                         >
                                         <Menu.Target>
                                         <UnstyledButton className={classes.control}>
                                         {selectedAction ? (
                                                 <Group spacing="xs">
                                                     <span className={classes.label}>{selectedAction?.name}</span>
                                                 </Group>
                                         ) : (
                                                 <Group spacing="xs">
                                                     <span className={classes.label}>Choose an Action</span>
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
                                 </>
             ) : (
                <div>
                   <ActionMappingView action={nodeActions[data.id]} node={data} edge={selectedEdge}/>
                </div>
             ) }

        </div>
    )

}

function TriggerNode ({data}) {
    const {classes, cx} = useStyles();

    const nodeViews = useStore((state) => state.nodeViews)
    const setNodeViews = useStore((state) => state.setNodeViews)
    const setNodeAction = useStore((state) => state.setNodeAction)
    const nodeActions = useStore((state) => state.nodeActions)
    const globalWorkflowState = useStore((state) => state.workflow)
    const setGlobalWorkflowState = useStore((state) => state.setWorkflow)

    const [selected, setSelected] = useState(globalWorkflowState?.trigger?.type ? globalWorkflowState?.trigger?.type : "scheduled")
    const [selectedApi, setSelectedApi] = useState(globalWorkflowState?.trigger?.selectedWebhook?.parent_interface_uuid ? globalWorkflowState?.trigger?.selectedWebhook?.parent_interface_uuid : data.apis[0].uuid)
    
    const triggerTypeOptions = data.webhooks.length > 0 ? [{label: 'Scheduled', value: 'scheduled'}, {label: 'Webhook', value: 'webhook'}] : [{label: 'Scheduled', value: 'scheduled'}]


    //Scheduled Trigger State
    const [selectedCadence, setSelectedCadence] = useState(globalWorkflowState?.trigger?.cadence ? {label: globalWorkflowState?.trigger?.cadence, value: globalWorkflowState?.trigger?.cadence, type:'scheduled' } : {label:'Daily', value:'Daily', type:'scheduled'})
    const [selectedRunTime, setSelectedRunTime] = useState(globalWorkflowState?.trigger?.time ? globalWorkflowState?.trigger?.time : null)
    const [selectedTimezone, setSelectedTimezone] = useState(globalWorkflowState?.trigger?.timezone ? {label: globalWorkflowState?.trigger?.timezone, value: globalWorkflowState?.trigger?.timezone, type: 'scheduled'} : {label: 'UTC', value: 'UTC', type: 'scheduled'})
    const [selectedDays, setSelectedDays] = useState(globalWorkflowState?.trigger?.days ? [...new Set(globalWorkflowState?.trigger?.days)] : [])
    const [cadenceOpened, setCadenceOpened] = useState(false);
    const [timezoneOpened, setTimezoneOpened] = useState(false);

    const cadenceOptions = [{label: 'Daily', value: 'Daily', type: 'scheduled'},{label: 'Weekly', value: 'Weekly', type: 'scheduled'}]
    const dayOptions = [{label: 'Su', value: 'sunday', type: 'scheduled'},{label: 'Mo', value: 'monday', type: 'scheduled'}, {label: 'Tu', value: 'tuesday', type: 'scheduled'}, {label: 'We', value: 'wednesday',type: 'scheduled'}, {label: 'Th', value: 'thursday', type: 'scheduled'}, {label: 'Fr', value: 'friday', type: 'scheduled'}, {label: 'Sa', value: 'saturday', type: 'scheduled'}]
    const timezoneOptions = [{label: 'UTC', value: 'UTC', type: 'scheduled'}, {label: 'EST', value: 'EST', type: 'scheduled'}, {label: 'CST', value: 'CST', type: 'scheduled'}, {label: 'MST', value: 'MST', type: 'scheduled'}, {label: 'PST', value: 'PST', type: 'scheduled'}]

    const addDay = (event) => {
        if (selectedDays)
        {
            if (selectedDays.includes(event.currentTarget.value)) {
                const uniqueNewDays = [...new Set(selectedDays.filter((day) => {
                    return day != event.currentTarget.value
                }))]
                setSelectedDays(uniqueNewDays)
                return uniqueNewDays
            } else {
                const uniqueNewDays = [...new Set([...selectedDays, event.currentTarget.value])]
                setSelectedDays(uniqueNewDays)
                return uniqueNewDays
                
            }
        } else {
            setSelectedDays([event.currentTarget.value])
            return [event.currentTarget.value]
        }
      
    }
    //Webhook Trigger State
    const [selectedWebhook, setSelectedWebhook] = useState(
        globalWorkflowState?.trigger?.selectedWebhook ? globalWorkflowState?.trigger?.selectedWebhook : null
    )
    const [webhookOpened, setWebhookOpened] = useState(false);
    const filteredWebhooks = data.webhooks.filter((webhook) => {    
        return webhook.parent_interface_uuid == selectedApi
    })

    const menuOptions = filteredWebhooks.map((webhook) => {
        return (
            <Menu.Item 
                key={webhook.uuid} 
                onClick={() => {
                    setSelectedWebhook(webhook)
                    setNodeAction(data.id, webhook)
                    setNodeViews([
                        {
                            id: data.id,
                            selectedAction: webhook
                        }
                    ])

                    if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "webhook"){
                        setGlobalWorkflowState({
                            trigger: {
                                ...globalWorkflowState.trigger,
                                selectedWebhook: webhook
                            }
                        })
                    } else {
                        setGlobalWorkflowState({
                            trigger: {
                                id: data.id,
                                type: "webhook",
                                selectedWebhook: webhook
                            }
                        })
                    }
                }}
                style={{width: 230}}>
                <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: '12px'}}>
                    {webhook.name}
                </Text>
            </Menu.Item>
        )
    })
    
    return (
        <div style={{zIndex:1, paddingBottom: 20, backgroundColor:'white', display:'flex', flexDirection:'column', width: 320, borderRadius:8, border: !nodeViews[data.id] || !nodeViews[data.id]?.view || nodeViews[data.id]?.view !== "mapping" ? '.5px solid #E7E7E7' : '2px solid black', boxShadow:"rgba(0, 0, 0, 0.04) 0px 3px 5px" }}>
            <div style={{paddingLeft: 10, width: '100%',backgroundColor: '#F2F0ED', height: 40, borderTopLeftRadius:8,borderTopRightRadius: 8, alignItems:'center', display:'flex'}}>
                {
                    selected === "scheduled" ? (
                        <GrSchedulePlay size={20} style={{paddingRight: 5}}/>
                    ): selected === "webhook" ? (
                        <TbWebhook size={20} style={{paddingRight: 5}}/>
                    ) : (
                        <GrTrigger size={20} style={{paddingRight: 5}}/>
                    )
                }       
                <Text style={{fontFamily: 'apercu-regular-pro', fontSize: '16px'}}>{
                    selected === "scheduled" ? "Scheduled Trigger" : selected === "webhook" ? "Webhook Trigger" : "Workflow Trigger"
                }</Text>
            </div>
            <Handle type="input" position={Position.Right}/>
            { 
            !nodeViews[data.id] || !nodeViews[data.id]?.view || nodeViews[data.id]?.view !== "mapping" ? (
                    <> 
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
                                                                <span className={classes.label}>Choose a cadence</span>
                                                            </Group>
                                                    )} 
                                                    <FiChevronDown className={classes.icon} />
                                                </UnstyledButton>
                                                </Menu.Target>
                                                <Menu.Dropdown value={selectedCadence} style={{backgroundColor: 'white'}}>{
                                                    <ScrollArea type="hover" style={{height: 80}}>
                                                        {cadenceOptions.map((cadence) => {
                                                                return (
                                                                    <Menu.Item 
                                                                        key={cadence.value} 
                                                                        onClick={() => {
                                                                            setSelectedCadence(cadence)
                                                                            setNodeAction(data.id, cadence)

                                                                            if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "scheduled"){
                                                                                setGlobalWorkflowState({
                                                                                    trigger: {
                                                                                        ...globalWorkflowState.trigger,
                                                                                        cadence: cadence.value
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                setGlobalWorkflowState({
                                                                                    trigger: {
                                                                                        id: data.id,
                                                                                        type: "scheduled",
                                                                                        cadence: cadence.value
                                                                                    }
                                                                                })
                                                                            }
                                                                        }}
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
                                        { selectedCadence && selectedCadence.value === "Daily" ? (
                                                <div style={{display:'block'}}>
                                                    <Text style={{fontFamily:'Visuelt', fontSize:'13px', width: 270, color: 'black'}}>Select Time</Text>
                                                    <div style={{display:'block'}}>
                                                    <TimeInput
                                                        onChange={(e) => {
                                                            console.log(e)
                                                            setSelectedRunTime(e)
                                                            if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "scheduled"){
                                                                setGlobalWorkflowState({
                                                                    trigger: {
                                                                        ...globalWorkflowState.trigger,
                                                                        time: e.toString()
                                                                    }
                                                                })
                                                            } else {
                                                                setGlobalWorkflowState({
                                                                    trigger: {
                                                                        id: data.id,
                                                                        type: "scheduled",
                                                                        time: e.toString()
                                                                    }
                                                                })
                                                            }
                                                        }} 
                                                        value={new Date(selectedRunTime)}
                                                        format="12"
                                                        amLabel="AM"
                                                        pmLabel="PM"
                                                        withAsterisk
                                                        clearable={false}
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
                                                                <ScrollArea type="hover" style={{height: 120, width: '100%'}}>
                                                                    {timezoneOptions.map((timezone) => {
        
                                                                            return (    
                                                                                <Menu.Item
                                                                                    key={timezone.value}
                                                                                    onClick={() => {
                                                                                        
                                                                                        setSelectedTimezone(timezone)

                                                                                        if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "scheduled"){
                                                                                            setGlobalWorkflowState({
                                                                                                trigger: {
                                                                                                    ...globalWorkflowState.trigger,
                                                                                                    timezone: timezone.value
                                                                                                }
                                                                                            })
                                                                                        } else {
                                                                                            setGlobalWorkflowState({
                                                                                                trigger: {
                                                                                                    id: data.id,
                                                                                                    type: "scheduled",
                                                                                                    timezone: timezone.value
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    
                                                                                    }}
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
                                            ): selectedCadence && selectedCadence.value === "Weekly" ? (
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
                                                                        onClick={(e)=>{
                                                                            
                                                                            if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "scheduled"){
                                                                                if(globalWorkflowState.trigger.days){
                                                                                    setGlobalWorkflowState({
                                                                                        trigger: {
                                                                                            ...globalWorkflowState.trigger,
                                                                                            days: addDay(e)
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    setGlobalWorkflowState({
                                                                                        trigger: {
                                                                                            ...globalWorkflowState.trigger,
                                                                                            days: addDay(e)
                                                                                        }
                                                                                    })
                                                                                }
                                        
                                                                            } else {
                                                                                addDay(e)
                                                                                setGlobalWorkflowState({
                                                                                    trigger: {
                                                                                        id: data.id,
                                                                                        type: "scheduled",
                                                                                        days: [day.value]
                                                                                    }
                                                                                })
                                                                            }
                                                                        }} 
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
                                                            onChange={(e) => {
                                                                console.log(e)
                                                                setSelectedRunTime(e)
                                                                if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "scheduled"){
                                                                    setGlobalWorkflowState({
                                                                        trigger: {
                                                                            ...globalWorkflowState.trigger,
                                                                            time: e
                                                                        }
                                                                    })
                                                                } else {
                                                                    setGlobalWorkflowState({
                                                                        trigger: {
                                                                            id: data.id,
                                                                            type: "scheduled",
                                                                            time: e
                                                                        }
                                                                    })
                                                                }
                                                            }} 
                                                            value={new Date(selectedRunTime)}
                                                            format="12"
                                                            
                                                            withAsterisk
                                                            clearable={false}
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
                                                                    <ScrollArea type="hover" style={{height: 120, width: '100%'}}>
                                                                        {timezoneOptions.map((timezone) => {
        
                                                                                return (    
                                                                                    <Menu.Item
                                                                                        key={timezone.value}
                                                                                        onClick={() => {
                                                                                            
                                                                                            setSelectedTimezone(timezone)

                                                                                            if(globalWorkflowState.trigger && globalWorkflowState.trigger.type == "scheduled"){
                                                                                                setGlobalWorkflowState({
                                                                                                    trigger: {
                                                                                                        ...globalWorkflowState.trigger,
                                                                                                        timezone: timezone.value
                                                                                                    }
                                                                                                })
                                                                                            } else {
                                                                                                setGlobalWorkflowState({
                                                                                                    trigger: {
                                                                                                        id: data.id,
                                                                                                        type: "scheduled",
                                                                                                        timezone: timezone.value
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        }}
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
                    </>
            ) : nodeActions[data.id] ? (
                <div>
                   <ActionMappingView node={data} action={nodeActions[data.id]} type={'trigger-webhook'}/>
                </div>
            ) : (
                    <div style={{display: 'flex', flexDirection:'column',alignItems: 'center', justifyContent:'center',height: 350}}>
                        <Image src="https://i.ibb.co/yFHmNmy/Screen-Shot-2023-02-22-at-2-17-50-PM.png" alt="No Data Coming from Trigger" width={80} height={80}/>
                        <Text style={{fontFamily: 'Visuelt'}}>No Schema Available</Text>
                        <Text style={{fontFamily: 'Visuelt', fontWeight:100, fontSize:'14px', width: 200, alignContent:'center'}}>You can configure a property or select one from your partnership configurations on the right.</Text>
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

            >
                Add Workflow Variable
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

function Flow({workflow, apis, actions, webhooks, toggleDrawer, suggestedNodes, suggestedEdges}) {
    const router = useRouter();
    const {pid, workflowId} = router.query;

    var initialNodes = [
        {
            id: 'trigger',
            type: 'trigger',
            position: { x: 350, y: 400 },
            deletable: false,
            data: {
                label: 'trigger',
                id: 'trigger',
                apis: apis,
                webhooks: webhooks
            } 
        },
        {
            id: 'action-1-'+workflowId,
            type: 'action',
            position: { x: 850, y: 400},
            deletable: false,
            data: {
                label: 'action-1-'+workflowId,
                id: 'action-1-'+workflowId,
                apis: apis,
                actions: actions
            } 
        }
      ];

    var initialEdges = [  {
        id: 'trigger-to-action-1',
        source: 'trigger',
        target: 'action-1-'+workflowId,
        type: 'buttonEdge',
        deletable: false,
        interactionWidth: 200,
      },];

    //For existing workflows, will need to load the nodes and edges from the workflow object
    if(workflow?.nodes?.length > 0){
        
        initialNodes = workflow.nodes

    }

    if(workflow?.edges?.length > 0){
        initialEdges = workflow.edges.map((edge) => {
            return {
                ...edge,
                type: 'buttonEdge',
                sourceHandle: edge?.data?.handleId
            }
        })

    }

    const reactFlowWrapper = useRef(null);
    const connectingNodeId = useRef(null);
    const connectingHandleId = useRef(null);
 
    const {project} = useReactFlow();
    const [captureElementClick, setCaptureElementClick] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const nodeActions = useStore((state) => state.nodeActions);
    const nodeViews = useStore((state) => state.nodeViews);
    const globalNodeState = useStore((state) => state.nodes);
    const globalEdgeState = useStore((state) => state.edges);
    const selectedEdge = useStore((state) => state.selectedEdge);
    const setGlobalNodeState = useStore((state) => state.setNodes);
    const setGlobalEdgeState = useStore((state) => state.setEdges);
    const setInputPaths = useStore((state) => state.setInputPaths);
    const setOutputPaths = useStore((state) => state.setOutputPaths);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const deleteNodeAction = useStore((state) => state.deleteNodeAction);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, sourceHandle: connectingHandleId.current, type:'buttonEdge', data: {
            handleId: connectingHandleId.current
        }}, eds)),
        [setEdges]
      );

    const onConnectStart = useCallback((_, { nodeId, handleId }) => {
        connectingNodeId.current = nodeId;
        connectingHandleId.current = handleId;
        }, []);

     const onChange = (event) => {
            setNodes((nds) =>
                nds.map((node) => {
                    const nodeSelectedAction = event.target.value;
                    setSelectedAction(nodeSelectedAction)
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            selectedAction: nodeSelectedAction,
                        }
                    }
                })
            )
    }
    
    const onConnectEnd = useCallback(
        (event) => {
            const targetIsPane = event.target.classList.contains('react-flow__pane');
            if (targetIsPane) {
                // Remove the wrapper bounds in order to get the correct position
                const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
                const newActionStepIndex = Number(connectingNodeId.current.split('action-')[1].split('-')[0]) + 1

                const targetNodeId = "action-" + newActionStepIndex + '-'+ uuidv4();
                const newNode = {
                    id: targetNodeId,
                    //We are removing half of the node width to center the new node
                    position: project({x: event.clientX - left - 100, y: event.clientY - top}),
                    type: 'action',
                    data: {
                        label: `Node ${targetNodeId}`,
                        id: targetNodeId,
                        apis: apis,
                        actions: actions,
                        onChange: onChange,
                        sourceHandle: connectingHandleId.current
                    }
                }
                const newEdgeId = connectingNodeId.current + "_to_" + targetNodeId+"_handle_"+connectingHandleId.current+ "_uuid_" + uuidv4();
                
                setNodes((nds) => nds.concat(newNode));
                setEdges((eds) => eds.concat({id: newEdgeId, source: connectingNodeId.current, target: targetNodeId, type: 'buttonEdge', sourceHandle: connectingHandleId.current, data: {
                    handleId: connectingHandleId.current
                }}));
                setGlobalEdgeState(edges)
                setGlobalNodeState(nodes)
            } 
        }, [project, setNodes, setEdges, apis, actions, onChange, edges, nodes, setGlobalEdgeState, setGlobalNodeState]
    );


    useEffect(()=> {
        if(nodes?.length !== globalNodeState?.length) {
            setGlobalNodeState(nodes)
        } 
        if(edges !== globalEdgeState) {
            setGlobalEdgeState(edges)
        }

    }, [nodes, edges, globalNodeState, globalEdgeState, setGlobalNodeState, setGlobalEdgeState])

    useEffect(() => {
        if(suggestedEdges && suggestedNodes){ 
            setNodes(suggestedNodes)
            setEdges(suggestedEdges)
        }
    }, [suggestedEdges, suggestedNodes])

    return (
        <div style={{ height: '100%', width:'100%', backgroundColor:'#FBFAF9'}}>
            <div style={{position:'absolute', padding: 40, zIndex: 1, height: 40, width: 220}}>
            <NewNodeButtonMenu />
            </div>
            <div ref={reactFlowWrapper} style={{height: '100%'}}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onNodesDelete={(nodes) => {
                        deleteNodeAction(nodes[0].id)
                        
                    }}
                    onEdgesChange={onEdgesChange}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    onConnect={onConnect}
                    edgeTypes={edgeTypes}
                    fitView
                    nodeTypes={nodeTypes}
                    onEdgeClick={(event, edge) => {
                        toggleDrawer(event, edge, nodes, edges)
                        setInputPaths([])
                        setOutputPaths([])                        
                    }}
                    zoomOnScroll={false}
                    style={{position:'absolute', zIndex: 2, background:'#FBFAF9' }}
                    >
                </ReactFlow>
            </div>
                
        

        </div>
    )
}

const WorkflowHeader = ({workflow, setView, view, apis, actions, setSuggestedEdges, setSuggestedNodes, webhooks, setWorkflowSuggestionModalOpen}) => {
    const { classes } = useStyles()
    const router = useRouter();
    const [isNameFieldActive, setIsNameFieldActive] = useState(false);
    const [nameFieldWidth, setNameFieldWidth] = useState(0);
    const [workflowName, setWorkflowName] = useState(workflow?.name ? workflow.name : 'My Untitled Workflow');
    const globalNodeState = useStore((state) => state.nodes);
    const globalEdgeState = useStore((state) => state.edges);
    const mappings = useStore((state) => state.mappings);
    const globalWorkflowState = useStore((state) => state.workflow);
    const setGlobalWorkflowState = useStore((state) => state.setWorkflow);
    const setNodeAction = useStore((state) => state.setNodeAction);
    const [saveInProgress, setSaveInProgress] = useState(false);
    
    const { pid, workflowId } = router.query;

    const processWorkflowSave = () => {
        setSaveInProgress(true)
        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL +'/projects/' + workflow.parent_project_uuid + '/workflows/' + workflow.uuid,{
            name: workflowName,
            nodes: globalNodeState,
            edges: globalEdgeState,
            trigger: globalWorkflowState.trigger,
            steps: [],
            status: "Draft",
            updated_at: new Date(),
            parent_project_uuid: workflow.parent_project_uuid,
            definition: {
                mappings: mappings
            }
        }).then((response) => {
            setSaveInProgress(false)
        } )
        .catch((error) => {
            console.log(error)
            setSaveInProgress(false)
        } )
    }


    useEffect(() => {
        if(workflowName.length > 0 && workflowName !== 'My Untitled Workflow') {
            setNameFieldWidth(workflowName.length * 8)
        } else {
            setWorkflowName('My Untitled Workflow')
        }
    }, [workflowName])

        return (
            <Header height={30} sx={{ zIndex: 2, backgroundColor: "transparent", borderBottom: 0 }} >
              <Container className={classes.inner} fluid>
                <Group>
                <ActionIcon onClick={() => router.push('/partnerships/'+pid)}>
                    <HiOutlineArrowLeft size={30} color={'black'} />
                </ActionIcon>

                { isNameFieldActive ?
                    (
                        <Container fluid sx={{
                            border: '1px solid #FFFFFF',
                            borderRadius: 5,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            width: {nameFieldWidth}
                        }}>
                    
                            <TextInput value={workflowName} onChange={(event) => { setWorkflowName(event.target.value);}} size={28} variant={'unstyled'}  style={{width:`${workflowName.length + 8}ch`}}/>
                        {
                        isNameFieldActive ? (
                            <>
                                <div style={{marginLeft: 10}}/>
                                <ActionIcon size='xl'>
                                <AiFillCheckCircle size={22} color={'#9595FF'} onClick={() => {
                                    
                                    setIsNameFieldActive(!isNameFieldActive)
                                    setGlobalWorkflowState({...globalWorkflowState, name: workflowName})

                                    }}  />
                                </ActionIcon>
                            </>
                           
                        ) : (
                            null
                        )
                    }  
                        </Container>
                    ) : (
                        <Text onClick={() => setIsNameFieldActive(!isNameFieldActive)} style={{fontFamily:'Visuelt', fontWeight: 600, fontSize:'28px'}}>{workflowName}</Text>
                    )
                }

                </Group>
                <Group>
                    <SegmentedControl 
                        onChange={(value) => {
                            setView(value)
                        }}
                        size='lg'
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 5
                        }}
                        data={
                            [
                                {
                                    value:'studio', 
                                    label: (
                                        <Center>
                                            <Image alt="workflowStudio" src={studioIcon} width={25} height={25}/>
                                        </Center>
                                    ) 
                              },
                              {
                                value:'scope', 
                                label: (
                                    <Center>
                                        <BsViewList size={25}/>
                                    </Center>
                                ) 
                          }, 
                          {
                            value:'monitor', 
                            label: (
                                <Center>
                                    <HiOutlineCommandLine size={25}/>
                                </Center>
                            ) 
                        }
                            ]}/>
                </Group>
                <Group>
                    {
                        view === 'studio' ? (
                        <Button
                            leftIcon={
                                <div style={{height:15, width: 15}}>
                                    <Image src={blackLogoIcon} />
                                </div>
                            } variant="outline"  
                            onClick={() => {
                                setWorkflowSuggestionModalOpen(true)
                            }}
                            sx={{
                                centerLoader: {
                                    color: 'black',
                                },
                                color: 'black',
                                fontFamily: 'Vulf Sans',
                                fontWeight: 300,
                                fontSize: '16px',
                                height: 40,
                                borderRadius: 5,
                                border: '1px solid #000000',
                                backgroundColor: 'white',
                                ':hover': {
                                    backgroundColor: '#FBFAF9',
                                    border: '1px solid #262626',
                                }
                            }}>
                            Suggest Workflow
                        </Button>
                        ) : view === 'scope' ? (
                            <Button
                            sx={{
                                centerLoader: {
                                    color: 'black',
                                },
                                color: 'black',
                                fontFamily: 'Vulf Sans',
                                fontWeight: 300,
                                fontSize: '16px',
                                height: 40,
                                borderRadius: 5,
                                border: '1px solid #000000',
                                backgroundColor: 'white',
                                ':hover': {
                                    backgroundColor: '#FBFAF9',
                                    border: '1px solid #262626',
                                }
                            }}>
                                Download PDF
                            </Button>
                        ) : view === 'monitor' ? (
                            <Button
                            sx={{
                                centerLoader: {
                                    color: 'black',
                                },
                                color: 'black',
                                fontFamily: 'Vulf Sans',
                                fontWeight: 300,
                                fontSize: '16px',
                                height: 40,
                                borderRadius: 5,
                                border: '1px solid #000000',
                                backgroundColor: 'white',
                                ':hover': {
                                    backgroundColor: '#FBFAF9',
                                    border: '1px solid #262626',
                                }
                            }}>
                                Trigger Workflow
                            </Button>
                        ) : null
                                
                    }
                    
                    <Button
                    loading={saveInProgress}
                    onClick={() => processWorkflowSave()} 
                    sx={{
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        fontFamily: 'Visuelt',
                        fontSize: '16px',
                        fontWeight: 500,
                        height: 40,
                        borderRadius: 5,
                        border: '2px solid #000000',
                        ':hover': {
                            backgroundColor: '#BABABA',
                            color: '#FFFFFF',
                            fontFamily: 'Visuelt',
                            fontSize: '16px',
                            fontWeight: 500,
                            height: 40,
                            border: '2px solid #BABABA',
                        }
                    }}>
                        Save Workflow
                    </Button>

                    <DownloadButton />
                    <Menu transition="fade" position='bottom-end' shadow="md" width={150}>
                        <Menu.Target>
                            <ActionIcon size="lg" radius="md" variant='outline'>
                               <HiOutlineDotsHorizontal size={15} color={'grey'} />
                            </ActionIcon>
                        </Menu.Target>
                      
                        <Menu.Dropdown >
                            <Menu.Item
                                style={{fontFamily:'Visuelt', fontWeight: 100}}  
                                icon={<IoHelpBuoyOutline size={20} color={'black'} />}
                            >Help</Menu.Item>
                            <Menu.Item
                                style={{fontFamily:'Visuelt', fontWeight: 100}} 
                                icon={<HiOutlineTrash size={20} color={'black'} />}
                            >Delete Workflow</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
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
    const [adaptionDrawerOpen, setAdaptionDrawerOpen] = useState(false);
    const [selectedAdaption, setSelectedAdaption] = useState(null);
    const [view, setView] = useState('studio');
    const [suggestedNodes, setSuggestedNodes] = useState(null);
    const [suggestedEdges, setSuggestedEdges] = useState(null);


    //From Global State
    const nodeActions = useStore((state) => state.nodeActions);
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const [mappingModalOpen, setMappingModalOpen] = useState(false);
    const setNodeViews = useStore((state) => state.setNodeViews);
    const setSelectedEdge = useStore((state) => state.setSelectedEdge);
    const setSelectedMapping = useStore((state) => state.setSelectedMapping);
    const setMappings = useStore((state) => state.setMappings);
    const setNodeAction = useStore((state) => state.setNodeAction);
    const selectedEdge = useStore((state) => state.selectedEdge);
    const setGlobalWorkflowState = useStore((state) => state.setWorkflow);

    //Workflow Suggestion Modal
    const [workflowDescription, setWorkflowDescription] = useState(null);
    const [workflowSuggestionModalOpen, setWorkflowSuggestionModalOpen] = useState(false);
    const [areSuggestionsLoading, setAreSuggestionsLoading] = useState(false);

    const generateOperationIdArray = (actions, apiIndex) => {
        const operationIdArray = []
        actions.forEach((action) => {
            operationIdArray.push(apiIndex + "$$" + action.name)
        })
        return operationIdArray
    }

    const generateSuggestedEdges = (nodes) => {
        
        var suggestedEdgesArray = [  {
            id: 'trigger-to-action-1',
            source: 'trigger',
            target: 'action-1-'+workflowId,
            type: 'buttonEdge',
            deletable: false,
            interactionWidth: 200
        }];

        nodes.forEach((node, index) => {
            if(index > 1){
                const newEdge = {
                    id: nodes[index - 1].id + '-to-' + node.id ,
                    source: nodes[index - 1].id,
                    target: node.id,
                    type: 'buttonEdge',
                    deletable: true,
                    interactionWidth: 200,
                    sourceHandle: 'actionSuccess',
                    data:{
                        handleId: 'actionSuccess'
                    }
                }
                suggestedEdgesArray.push(newEdge)
            }
        })
        
        return suggestedEdgesArray
    }


    const generateSuggestedNodes = (suggestions, api1Actions, api2Actions, webhooks) => {
    
        var suggestedNodeArray = [
            {
                id: 'trigger',
                type: 'trigger',
                position: { x: 350, y: 400 },
                deletable: false,
                data: {
                    label: 'trigger',
                    id: 'trigger',
                    apis: apis,
                    webhooks: webhooks
                } 
            }
        ];

        suggestions.forEach((suggestion, index) => {
            var actionNodeUuid = uuidv4()
            if(index > 0){
                const suggestionArray = suggestion.split("$$")
                const apiIndex = suggestionArray[0]
                const operationId = suggestionArray[1]
                const action = apiIndex == 'API1' ? api1Actions.filter((action) => action.name == operationId)[0] : api2Actions.filter((action) => action.name == operationId)[0]
                
                const newNode = {
                    id: 'action-' + (index + 1) + '-' + actionNodeUuid,
                    label: 'action-' + (index + 1) + '-' + actionNodeUuid,
                    type: 'action',
                    position: { x: 350 + ((index + 1) * 500), y: 400},
                    width: 320,
                    data: {
                        id: 'action-' + (index + 1) + '-' + actionNodeUuid,
                        label: 'action-' + (index + 1) + '-' + actionNodeUuid,
                        apis: apis,
                        actions: workflowActions,
                        selectedAction: action
                    }
                } 
                suggestedNodeArray.push(newNode)
                setNodeAction('action-' + (index + 1) + '-' + actionNodeUuid, action)

             } else {
                const suggestionArray = suggestion.split("$$")
                const apiIndex = suggestionArray[0]
                const operationId = suggestionArray[1]

                const action = apiIndex === 'API1' ? api1Actions.filter((action) => action.name === operationId)[0] : api2Actions.filter((action) => action.name === operationId)[0]

                var newNode =  {
                    id: 'action-1-'+workflowId,
                    type: 'action',
                    position: { x: 850, y: 400},
                    deletable: false,
                    data: {
                        label: 'action-1-'+workflowId,
                        id: 'action-1-'+workflowId,
                        apis: apis,
                        actions: workflowActions,
                        selectedAction: action
                    } 
                }
                suggestedNodeArray.push(newNode)
                setNodeAction('action-1-'+workflowId, action)
            }
        })
        
        return suggestedNodeArray
    }
         


    function fetchWorkflowSuggestions() {
        setAreSuggestionsLoading(true)
        const promptPrefix = "INTEGRATION_NAME: " + workflow.name + "." + "  INTEGRATION DESCRIPTION: "+ workflowDescription
        const api1OperationIds = generateOperationIdArray(workflowActions.filter((action) => action.parent_interface_uuid === apis[0].uuid), 'API1')
        const api2OperationIds = generateOperationIdArray(workflowActions.filter((action) => action.parent_interface_uuid === apis[1].uuid), 'API2')
        const api1Actions = workflowActions.filter((action) => action.parent_interface_uuid === apis[0].uuid)
        const api2Actions = workflowActions.filter((action) => action.parent_interface_uuid === apis[1].uuid)
        const systemMessage = {"role": "system", "content": "You are a helpful assistant that only provides a sequenced array of operationIds provided a name of workflow and a list of operationIds from two APIs (API1 and API2.)  The list should will not include all of the operationIds; only relevant operationIds in a sequence that satisfies the purpose of the integration. Only respond with an array with the operationIds and their API number separated with an underscore in the order you suggest."}
        const userContent = promptPrefix + " " + "API1: " + api1OperationIds + " API2: " + api2OperationIds
        const userMessage = {"role": "user", "content": userContent}

        axios.post('https://api.openai.com/v1/chat/completions',{
            "model": "gpt-4",
            "messages": [
                systemMessage,
                userMessage
            ]
        },{
            headers: {
                "Authorization": "Bearer " + process.env.NEXT_PUBLIC_OPEN_AI_API_KEY
            }
        }).then((response) => {      
            const suggestions = JSON.parse(response.data.choices[0].message.content)
            const suggestedNodes = generateSuggestedNodes(suggestions, api1Actions, api2Actions, workflowWebhooks)
            const suggestedEdges = suggestedNodes ? generateSuggestedEdges(suggestedNodes) : []

            if(suggestedNodes.length > 0 && suggestedEdges.length > 0){
                setSuggestedNodes(suggestedNodes)
                setSuggestedEdges(suggestedEdges)
                
            } else {
                setSuggestedNodes(null)
                setSuggestedEdges(null)
            }
     
            setAreSuggestionsLoading(false)
            setWorkflowSuggestionModalOpen(false)
        }).catch((error) => {
            console.log(error)
            setAreSuggestionsLoading(false)
            setWorkflowSuggestionModalOpen(false)
        })
    
    }

    const toggleMappingModal = () => {
        
        setMappingModalOpen(!mappingModalOpen)
    }

    const toggleDrawer = (event, edge, nodes, edges) => {

        var sourceNodeObject = {
            id: edge.source
        }

        var targetNodeObject = {
            id: edge.target,
            view: 'mapping'
        }

        if(adaptionDrawerOpen){
            sourceNodeObject['view'] = 'workflow'
            targetNodeObject['view'] = 'workflow'
            setSelectedEdge(null)
            setSelectedAdaption(null)
        } else {
            sourceNodeObject['view'] = 'mapping'
            targetNodeObject['view'] = 'mapping'
            setSelectedEdge(edge)
            setSelectedAdaption(edge)
            
        }
        setSelectedMapping({sourceProperty: {}, targetProperty: {}})
        setAdaptionDrawerOpen(!adaptionDrawerOpen);  
        setNodeViews([sourceNodeObject, targetNodeObject])

    }
    
    function getSchemaFromPath(path) {
        
        var schema =  selectedEdge?.source == 'trigger' && nodeActions['trigger']?.requestBody2?.schema ? nodeActions['trigger']?.requestBody2?.schema : nodeActions[selectedEdge?.source]?.responses && Object.keys(nodeActions[selectedEdge?.source]?.responses[0]?.schema).length > 0 ? 
            nodeActions[selectedEdge?.source]?.responses[0]?.schema :  null

        var schemaLocationArray = path.split('.')
       
        if(schemaLocationArray.length == 1) {
            return {...schema[schemaLocationArray[0]], path: path, key: schemaLocationArray[0]}
        } else {
            var parent = schema
            var parentContext = []

            
            for (var i = 0; i < schemaLocationArray.length; i++) {
                var child = parent[schemaLocationArray[i]]

                if(child?.properties && i !== schemaLocationArray.length - 1){
                    parent = child.properties
                        if(schemaLocationArray[i].includes('{{') && schemaLocationArray[i].includes('}}')) {
                            parentContext.push({contextType: 'dictionary', dictionaryKey: schemaLocationArray[i], parentContextKey: schemaLocationArray[i-1], path: path})
                        }
                    }                        

                else if(child?.items && i !== schemaLocationArray.length - 1){
                    if(child.items.properties) {
                        parent = child.items.properties
                        parentContext.push({contextType: 'array', parentContextKey: schemaLocationArray[i], path: path})
                    } else {
                        if(parentContext.length > 0){
                            return {...child.items, path: path, key: schemaLocationArray[i], parentContext}
                        }
                        return {...child.items, path: path, key: schemaLocationArray[i]}
                    }
                }
                else {     
                    var childKey = schemaLocationArray[i]
                    if(parentContext.length > 0){
                        return {...child, path: path, key: schemaLocationArray[i], parentContext}
                    }
                    return {...child, key: childKey, path: path}
                }
    
            }
        }

    }
   
    useEffect(() => {
        if (pid && workflowId && !workflow) {
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/workflows/' + workflowId + '/details').then((res) => {
                setWorkflow(res.data);

                setGlobalWorkflowState({
                    id: res.data[0].uuid,
                    projectId: res.data[0].parent_project_uuid,
                    trigger: res.data[0].trigger,
                    name: res.data[0].name
                });

                if(res.data[0].definition?.mappings){
                    setMappings(res.data[0].definition?.mappings)
                }

                if(res.data[0].nodes.length > 0) {
                    res.data[0].nodes.forEach((node) => {
                        if(node.data?.selectedAction){
                            setNodeAction(node.id, node.data?.selectedAction)
                        } else if (res.data[0]?.trigger?.type == "webhook" && node.type == "trigger"){
                            setNodeAction(node.id, res.data[0]?.trigger?.selectedWebhook)
                        }
                    });
                
                }
            }).catch((err) => {
                console.log(err);
            })
        }
        if (pid && !partnership) {
            axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + pid + '/details').then((res) => {
                setPartnership(res.data);
                var apiArray = [];

                res.data[0].interfaces.forEach((api) => {
                    axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/' + api).then((res) => {
                        apiArray.push(res.data);
                        setApis(apiArray);
                       
                        setGlobalWorkflowState({
                            apis: apiArray
                        })
                    
                    }).catch((err) => {
                        console.log(err);
                    })
                });
                
                if(!workflowActions){
                    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/actions', {
                        "interfaces": res.data[0].interfaces
                    }).then((res) => {
                        setWorkflowActions(res.data);
                        setGlobalWorkflowState({
                            actions: res.data
                        })
                    } ).catch((err) => {
                        console.log(err);
                    })
                }
                if (!workflowWebhooks){
                    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/interfaces/webhooks', {
                        "interfaces": res.data[0].interfaces
                    }).then((res) => {
                        setWorkflowWebhooks(res.data);
                        setGlobalWorkflowState({
                            webhooks: res.data
                        })
                        
                    } ).catch((err) => {
                        console.log(err);
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
        }

    }, [pid, workflowId, workflow, partnership, apis, setApis, setPartnership, workflowActions, setWorkflowActions, workflowWebhooks, setWorkflowWebhooks, setGlobalWorkflowState, setNodeAction, setMappings])

    return workflow && partnership && apis && workflowActions ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', marginLeft: -15}}>
            <Modal
                centered
                opened={mappingModalOpen}
                onClose={() => setMappingModalOpen(false)}
                overlayColor={'#000'}
                overlayOpacity={0.50}
                radius={'lg'}
                size={1000}
                title={<Text style={{padding:20, fontFamily:'Visuelt', fontSize: '30px', fontWeight: 600}}>Mapping Configuration</Text>}
            >
               <MappingModal apis={apis} getSchemaFromPath={getSchemaFromPath} toggleMappingModal={toggleMappingModal} partnership={partnership[0]} sourceNode={nodes.filter((node) => node.id === selectedEdge?.source)[0]} targetNode={nodes.filter((node) => node.id === selectedEdge?.target)[0]} edge={selectedEdge} nodes={nodeActions} />
            </Modal>
            <Modal
                centered
                opened={workflowSuggestionModalOpen}
                onClose={() => setWorkflowSuggestionModalOpen(false)}
                overlayColor={'#000'}
                overlayOpacity={0.50}
                radius={'lg'}
                size={800}
            >
                {
                    areSuggestionsLoading ? (
                        <div style={{display:'flex', flexDirection: 'column'}}>
                            <div style={{display:'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                {/* <Loader size={40} color={'dark'} /> */}
                                <Text style={{fontFamily: 'Vulf Sans', fontSize: '35px', fontWeight: 100}}>Generating Your Workflow...</Text>

                                <Player 
                                    autoplay
                                    loop
                                    speed={2}
                                    src={WorkflowAnimation}
                                    style={{ height: 400, width: 400 }}
                                />
                                <div style={{width: 20}}/>
                            </div>
                        </div>
                    ) : (
                        <div style={{display:'flex', flexDirection: 'column', paddingLeft: 20, paddingRight: 20}}>
                            <Text style={{fontFamily: 'Visuelt', fontSize: '30px', fontWeight: 500}}>Describe your workflow in plain English</Text>
                            <Text style={{fontFamily: 'Visuelt', fontSize: '20px', fontWeight: 100, color: '#A0A0A0'}}>Using your description, we will suggest a series of API requests that satisfies your purpose.</Text>

                            <div style={{height: 20}}/>
                            <Textarea 
                                styles={() => ({
                                    input: {
                                        backgroundColor: 'white',
                                        border: '1px solid #E5E5E5',
                                        borderRadius: '5px',
                                        padding: '10px',
                                        fontFamily: 'Visuelt',
                                        height: 200,
                                        fontSize: '16px',
                                        fontWeight: 400,
                                        color: 'black',
                                        '&:focus': {
                                            outline: 'none',
                                            border: '1px solid #E5E5E5',
                                            boxShadow: 'none',
                                        },
                                    },
                                })}
                                style={{width: '100%', fontFamily: 'Visuelt', fontSize: '30px', fontWeight: 100}}
                                placeholder="e.g. Every day, at 8am I want to retrieve a menu from API X and create a menu from that data in API Y."
                                value={workflowDescription}
                                onChange={(e) => setWorkflowDescription(e.target.value)}
                            />
                        <div style={{height: 20}}/>
                            <Button disabled={workflowDescription ? false : true} sx={{
                                width: '100%', 
                                backgroundColor: 'black', 
                                height: 45, 
                                fontFamily: 'Visuelt', 
                                color: 'white', 
                                fontSize: '16px', 
                                fontWeight: 400,
                                '&:hover': {
                                    backgroundColor: 'black',
                                    color: 'white',
                                },

                                }} onClick={() => {
                                    fetchWorkflowSuggestions()
                                    }}>
                                Generate Workflow
                            </Button>
                    </div>
                    )
                }
               
            </Modal>
            <Drawer lockScroll={false} size={610} style={{overflowY: 'scroll', zIndex: 1, position: 'absolute'}} opened={adaptionDrawerOpen} closeOnClickOutside={true} onClose={() => {setAdaptionDrawerOpen(false)}} withOverlay={false} position="right">
            <SchemaMappingDrawer partnership={partnership[0]} nodeActions={nodeActions} sourceNode={nodes.filter((node) => node.id === selectedEdge?.source)[0]} targetNode={nodes.filter((node) => node.id === selectedEdge?.target)[0]} action={nodeActions[selectedAdaption?.target]} toggleMappingModal={toggleMappingModal}/>   
            </Drawer>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 30,
                width: '100vw',
                height: 90,
                boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
                zIndex: 1,
                position: 'sticky'
            }}>
                <WorkflowHeader view={view} setWorkflowSuggestionModalOpen={setWorkflowSuggestionModalOpen} setSuggestedEdges={setSuggestedEdges} setSuggestedNodes={setSuggestedNodes} setView={setView} workflow={workflow[0]} webhooks={workflowWebhooks} actions={workflowActions} apis={apis} style={{ position: 'sticky', boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)', width: '100%'}} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '92vh'}}>
                {
                    view == 'scope' && typeof window !== undefined ? (
                        <WorkflowScope partnership={partnership}/>
                    ) : view == 'studio' && typeof window !== undefined ? (
                        <ReactFlowProvider>
                            <Flow suggestedNodes={suggestedNodes} suggestedEdges={suggestedEdges} toggleDrawer={toggleDrawer} workflow={workflow[0]} apis={apis} webhooks={workflowWebhooks} actions={workflowActions}/>
                        </ReactFlowProvider>
                    ) : (
                        <WorkflowMonitor workflow={workflow[0]}/>
                    )
                }
            </div>
        </div>
       
    ) :  (
        <Center sx={{
            width: '100vw',
            height: '100vh',
        }}>
            <Player
            src={LoadingAnimation}
            style={{width: 250, height: 250}}
            loop
            autoplay
            />
        </Center>   
    )
    }

export default WorkflowStudio;