import { useRouter } from 'next/router';
import React, { useCallback, useState, useContext, useEffect, useRef} from 'react';
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
    Card,
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
    Box,
    Divider
  } from '@mantine/core';

//   import ReactJson from 'react-json-view';

import axios from 'axios';
import useStore from '../../context/store'
import {Player } from '@lottiefiles/react-lottie-player';
import bannerImage from '../../../public/Mobile-Section-1-Drawing.svg'
import bannerComponentA from '../../../public/Banner_Component_A.svg'
import bannerComponentB from '../../../public/Banner_Component_B.svg'
import bannerComponentC from '../../../public/Banner_Component_C.svg'
import bannerComponentD from '../../../public/Banner_Component_D.svg'

import titleAnimation from '../../../public/animations/LevelUp_Icons_A_Circles.json'
import primaryLockupBlack from '../../../public/logos/SVG/Primary Lockup_Black.svg'
import scheduledIcon from '../../../public/icons/calendar-schedule-refresh.svg'
import webhookIcon from '../../../public/icons/programming-code-message-chat-2.svg'

import {jsPDF} from 'jspdf'
import html2canvas from "html2canvas";


const WorkflowScope = ({partnership}) => {
    
    const workflow = useStore(state => state.workflow)
    const nodeActions = useStore(state => state.nodeActions)
    const mappings = useStore(state => state.mappings)
    const nodes = useStore(state => state.nodes)
    const edges = useStore(state => state.edges)

    const printRef = React.useRef();

    const createPDF = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element);
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF("portrait", "pt", "a4");
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("print.pdf");
    }

    // console.log("Partnership")
    // console.log(partnership)

    // console.log("Global Workflow State")
    // console.log(workflow)

    // console.log("Node Actions")
    // console.log(nodeActions)

    // console.log("Mappings")
    // console.log(mappings)

    const renderAdaptionTable = (formulas, targetProperty, inputProperty, inputNodeId, outputNodeId) => {
        
        var rows = []
        //Specifying all of the mappings action IDs so we can filter out any previously mapped properties from other actions.
        var mappingInputActionId = inputProperty?.actionId
        var mappingOutputActionId = targetProperty?.actionId
        var inputAction = nodeActions[inputNodeId]
        var outputAction = nodeActions[outputNodeId]

        formulas.forEach((formula, index) => {
            if (formula.formula == 'ifthen'){
                var ifObject = formula.inputs['ifThen'][0]['if']
                var ifCondition = ifObject?.condition == 'equals' ? '==' : '!='
                var ifValue = ifObject?.value
                var thenObject = formula.inputs['ifThen'][0]['then']
                var thenValue = thenObject?.value
                var thenField = thenObject?.property?.path
                var orArray = ifObject?.or
                var orFormula = ''
                if (orArray && orArray.length > 0){
                    orArray.forEach((orObject) => {
                        var orCondition = orObject?.condition == 'equals' ? '==' : '!='
                        var orValue = orObject?.value
                        orFormula = orFormula + ' || ' + orObject?.property?.path + ' ' + orCondition + ' ' + orValue
                    })
                }

                var fullFormula = ifObject?.property?.path + ' ' + ifCondition + ' ' + ifValue + orFormula + ' ? ' + thenField + ' = ' + thenValue
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(thenField)
                rows.push(row)
            } else if (formula.formula == 'addition'){
                var additionInput = formula.inputs['addition']
                var fullFormula = inputProperty?.path + ' + ' + additionInput

                    if(index != 0 && formulas.length > 1){
                        fullFormula = rows[index - 1][0] + ' + ' + additionInput
                    }
                    var row = []
                    row.push(inputProperty?.path)
                    row.push(fullFormula)
                    row.push(targetProperty?.path)
                    rows.push(row)
                    
            } else if (formula.formula == 'subtraction'){
                var subtractionInput = formula.inputs['subtraction']              
                var fullFormula = '-' + subtractionInput
                if(index != 0){
                    fullFormula = rows[index - 1][0] + ' - ' + subtractionInput
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            }
           
        })
        
        if(!formulas || formulas.length == 0){
            var row = []
            if(inputProperty.path.includes('$variable')){
                row.push('{{Configuration}}')
                row.push("set value to "+inputProperty?.value)
                row.push(targetProperty?.path)
                rows.push(row)
            } else {
                row.push(inputProperty?.path)
                row.push('One to One Mapping')
                row.push(targetProperty?.path)
                rows.push(row)
            }
           
        }

        var cleanedRows = rows.length > 1 ? [rows[rows.length-1]] : rows
        console.log(cleanedRows)
        
       return cleanedRows
    }

    const renderTriggerContent = () => {

        var trigger = workflow?.trigger
        var action1 = nodeActions['action-1']

        if(trigger.type == 'webhook'){
            return(
                <div>
                    <div>
                        <Text
                            sx={{fontFamily: 'Vulf Sans', fontSize: '40px', color: '#000000'}}>
                            1. Webhook Trigger
                        </Text>
                        <div style={{height: 20}}/>
                         <Divider size={'xs'} sx={{width: '40%'}}/>
                         <div style={{height: 10}}/>
                        <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                paddingLeft: '40x'
                            }}>
                            <div style={{height: 10}}/>
                            <Text
                                sx={{
                                    fontFamily: 'Visuelt',
                                    fontWeight: 100,
                                    fontSize: '16px',
                                    width: '90%'
                                }}
                            >
                                The {workflow?.name} workflow will be triggered by the receipt of a webhook.  The following section describes how this webhook is described in the API documentation and the data mapping the Integration Manager has designed with the data it could contain.
                            </Text>
                            
                        </div>
                        <div style={{height: 20}}/>
                    </div>
                   <div style={{height: 20}}/>
                    <div style={{display: 'flex',flexDirection: 'column',justifyContent: 'flex-start',}}>
                        <div>
                            <Text sx={{fontFamily: 'Vulf Sans', fontSize: '24px', fontWeight: 300, color: '#000000'}}>
                               Webhook Documentation
                            </Text>
                            <Text sx={{fontFamily: 'Visuelt', fontSize: '16px', fontWeight: 100, color: '#000000'}}>
                                The metadata provided below is sourced directly from the API documentation for the selected webhook.
                            </Text>
                            <div style={{height: 30}}/>
                            <div style={{display:'flex', flexDirection: 'row'}} >
                                <Text sx={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 400, color: '#000000'}}>
                                    Name:
                                </Text>
                                <div style={{width: 10}}/>
                                <Text sx={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 100, color: '#000000'}}>
                                    {trigger?.selectedWebhook?.name}
                                </Text>
                            </div>
                            {
                                trigger?.selectedWebhook?.description ? (
                                    <div style={{display:'flex', flexDirection: 'row'}} >
                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 400, color: '#000000'}}>
                                        Description:
                                    </Text>
                                    <div style={{width: 10}}/>
                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '18px', fontWeight: 100, color: '#000000'}}>
                                        {trigger?.selectedWebhook?.description}
                                    </Text>
                                </div>
                                ) : (null)
                            }
                        </div>
                        {/* <div style={{height: 40}}/>
                        <Text sx={{fontFamily: 'Visuelt', fontSize: '24px',fontWeight: 600, color: '#000000'}}>
                            SCHEMA TREE: 
                        </Text>
                        <div style={{height: 20}}/>
                        <ReactJson collapsed={true} src = {trigger?.selectedWebhook?.requestBody2?.schema}/>
                        <div style={{height: 40}}/> */}
                    </div>

                </div>
            )
        } else if (trigger.type == 'scheduled'){
            return(
                <div>
                    <div>
                        <Text
                            sx={{fontFamily: 'Vulf Sans', fontSize: '40px', color: '#000000'}}>
                            Scheduled Trigger
                        </Text>
                        <div style={{height: 20}}/>
                         <Divider size={'xs'} sx={{width: '40%'}}/>
                         <div style={{height: 10}}/>
                        <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                paddingLeft: '40x'
                            }}>
                            <div style={{height: 10}}/>
                            <Text
                                sx={{
                                    fontFamily: 'Visuelt',
                                    fontWeight: 100,
                                    fontSize: '16px',
                                    width: '90%'
                                }}
                            >
                                The {workflow?.name} workflow will be triggered on a scheduled cadence.  The following section describes the schedule that was selected for this workflow.
                            </Text>
                            
                        </div>
                        <div style={{height: 20}}/>
                    </div>
                    <div style={{height: 20}}/>
                    <div style={{display: 'flex', flexDirection:'row', alignItems:'baseline'}}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                            <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 100, color: '#000000'}}>
                                Run
                            </Text>
                            <div style={{width: 10}}/>
                            <Text  sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                {trigger?.cadence}
                            </Text>
                            <div style={{width: 10}}/>
                            <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 100, color: '#000000'}}>
                            at
                            </Text>
                            <div style={{width: 10}}/>
                            <Text  sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                 {new Date(trigger?.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                            <div style={{width: 10}}/>
                            <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 100, color: '#000000'}}> {trigger?.timezone}</Text>
                            <div style={{width: 10}}/>
                        </div>
                        { 
                        
                            trigger?.cadence == 'Weekly' || trigger?.cadence == 'weekly' ? (
                                <div style={{display:'flex', flexDirection:'row'}}>

                                <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 100, color: '#000000'}}>
                                    on
                                </Text>
                                {
                                        [...new Set(trigger?.days)].map((day,index) => {                         
                                            return ( 
                                                <div key={day} style={{display:'flex', flexDirection:'row'}}>
                                                    <div style={{width: 10}}/>
                                                    {
                                                        index < trigger?.days.length -1 ? (
                                                            <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                                                {day.toUpperCase()},
                                                            </Text>
                                                        ) : (
                                                            <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                                                and {day.toUpperCase()}
                                                            </Text>
                                                        )
                                                    }
                                                    
                                                </div>
                                            )
                                        })
                                }
                                
                                </div>
                                ) : (
                                    null
                                )

                            }

                    </div>  
                  
                    
                
                </div>
            )
        }

    }

    const renderTriggeredActionContent = () => {
        const triggeredAction = nodeActions['action-1']
        const trigger = workflow?.trigger
        var headings = [ trigger?.selectedWebhook?.name ? trigger?.selectedWebhook?.name + " Property" : 'Webhook Property' , 'Formula', triggeredAction?.name ? triggeredAction?.name + ' Property' : "Action Property"]
        var inputActionId = nodeActions['trigger']?.uuid
        var outputActionId = nodeActions['action-1']?.uuid
        return(

        <div>
            <div>
                <Text sx={{fontFamily: 'Vulf Sans', fontSize: '40px', color: '#000000'}}>
                   2.  {triggeredAction?.method.toUpperCase()} {triggeredAction?.path}
                </Text>
                <div style={{height: 20}}/>
                 <Divider size={'xs'} sx={{width: '40%'}}/>
                 <div style={{height: 10}}/>
                <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        paddingLeft: '40x'
                    }}>
                    <div style={{height: 10}}/>
                    <Text
                        sx={{
                            fontFamily: 'Visuelt',
                            fontWeight: 100,
                            fontSize: '16px',
                            width: '90%'
                        }}
                    >
                            {
                                trigger?.type == 'webhook' ? (
                                    <Text  sx={{  fontFamily: 'Visuelt', fontWeight: 100,  fontSize: '16px',  width: '90%'}}>
                                        When the {trigger?.selectedWebhook?.name} webhook is received, the integration should send a {triggeredAction?.method.toUpperCase()} request to the following endpoint: {triggeredAction?.path}
                                    </Text>
                                ) : (
                                    <Text  sx={{ fontFamily: 'Visuelt',  fontWeight: 100, fontSize: '16px', width: '90%'}}>
                                        The following section describes the action that will be triggered on a scheduled cadence.
                                    </Text>
                                )
                            }
                    </Text>
                    
                </div>
                <div style={{height: 20}}/>
            </div>
           <div style={{height: 20}}/>
          
            <div style={{display: 'flex',flexDirection: 'column',justifyContent: 'flex-start',}}>
            { 
                mappings['action-1'] ? 
                (
                    <div>
                    {
                        Object.values(mappings['action-1']).filter((mapping)=> {
                            return mapping.output?.in == 'header'
                        }).length > 0 ? (
                                <>
                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                        Header Parameters
                                    </Text>
                                    <table key={'actionHeaderAdaptionTable'} style={{ width: '85%', borderCollapse: 'collapse', border: '1px solid #E7E7E7',fontFamily: 'Visuelt',fontSize: '14px',fontWeight: 100,textAlign: 'left',}}>
                                            <colgroup>
                                                <col style={{width: '30%'}}/>
                                                <col style={{width: '40%'}}/>
                                                <col style={{width: '30%'}}/>
                                            </colgroup>
                                            <thead
                                                style={{
                                                    backgroundColor: '#E7E7E7',
                                                    color: '#000000',
                                                    fontFamily: 'Vulf Sans',
                                                    fontSize: '18px',
                                                    fontWeight: 600,
                                                    lineHeight: '16px',
                                                    textAlign: 'left',
                                                    textTransform: 'uppercase',
                                                    height: '30px'
                                                }}
                                            >
                                                <tr
                                                    style={{
                                                        height: '50px'
                                                    }}
                                                >
                                                    {headings.map((heading) => {
                                                        return(
                                                            <th key={heading}>{heading}</th>
                                                        )
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody
                                                key={'triggerAdaptionRows'}
                                                style={{
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#000000',
                                                    fontFamily: 'apercu-regular-pro',
                                                    fontSize: '14px',
                                                    fontWeight: 100,
                                                    textAlign: 'left'
                                                }}
                                            >
                                                {
                                                    
                                                    mappings['action-1'] ? (
                                                        Object.keys(mappings['action-1']).map((targetKey, index) => {
                                                            var mappingValues = Object.values(mappings['action-1'])[index]
                                                            if (mappingValues?.input?.actionId == inputActionId && mappingValues?.output?.actionId == outputActionId && mappingValues?.output?.in == 'header'){
                                                                const inputFormulas = mappingValues?.input?.formulas
                                                                var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,'trigger', 'action-1')
                                                                return cleanedRows.map(
                                                                    (row) => (
                                                                        <tr
                                                                            key={row}
                                                                            style={{
                                                                                height: '70px',
                                                                                borderBottom: '1px solid #E7E7E7'
                                                                            }}
                                                                        >
                                                                            {row.map((cell) => {
                                                                                return (
                                                                                    <td key={cell}>{cell}</td>
                                                                                ) 
                                                                            })}
                                                                        </tr>
                                                                )
                                                                )
                                                            }
                                                        })): (
                                                            <tr
                                                                key={'noTriggerAdaptionRows'}
                                                                style={{
                                                                    height: '70px',
                                                                    borderBottom: '1px solid #E7E7E7'
                                                                }}
                                                            >
                                                                <td colSpan={3}>No Mappings from Webhook</td>
                                                            </tr>   
                                                        )
                                                }
                                            </tbody>
                                    </table>
                                    <div style={{height: 20}}/>
                                    </>
                        ) : null
                    }
                    {
                        Object.values(mappings['action-1']).filter((mapping)=> {
                            return mapping.output?.in == 'path'
                        }).length > 0 ? (
                                <>
                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                        Path Parameters
                                    </Text>
                                    <table key={'actionPathAdaptionTable'}  style={{ width: '85%',borderCollapse: 'collapse', border: '1px solid #E7E7E7',fontFamily: 'Visuelt',fontSize: '14px', fontWeight: 100,textAlign: 'left',}}>
                                        <colgroup>
                                            <col style={{width: '30%'}}/>
                                            <col style={{width: '40%'}}/>
                                            <col style={{width: '30%'}}/>
                                        </colgroup>
                                        <thead
                                            style={{
                                                backgroundColor: '#E7E7E7',
                                                color: '#000000',
                                                fontFamily: 'Vulf Sans',
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                lineHeight: '16px',
                                                textAlign: 'left',
                                                textTransform: 'uppercase',
                                                height: '30px'
                                            }}
                                        >
                                            <tr
                                                style={{
                                                    height: '50px'
                                                }}
                                            >
                                                {headings.map((heading) => {
                                                    return(
                                                        <th key={heading}>{heading}</th>
                                                    )
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody
                                            key={'triggerAdaptionRows'}
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                color: '#000000',
                                                fontFamily: 'apercu-regular-pro',
                                                fontSize: '14px',
                                                fontWeight: 100,
                                                textAlign: 'left'
                                            }}
                                        >
                                            {
                                                
                                                mappings['action-1'] ? (
                                                    Object.keys(mappings['action-1']).map((targetKey, index) => {
                                                        var mappingValues = Object.values(mappings['action-1'])[index]
                                                        if (mappingValues?.input?.actionId == inputActionId && mappingValues?.output?.actionId == outputActionId && mappingValues?.output?.in == 'path'){
                                                            const inputFormulas = mappingValues?.input?.formulas
                                                            var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,'trigger', 'action-1')
                                                            return cleanedRows.map(
                                                                (row) => (
                                                                    <tr
                                                                        key={row}
                                                                        style={{
                                                                            height: '70px',
                                                                            borderBottom: '1px solid #E7E7E7'
                                                                        }}
                                                                    >
                                                                        {row.map((cell) => {
                                                                            return (
                                                                                <td key={cell}>{cell}</td>
                                                                            ) 
                                                                        })}
                                                                    </tr>
                                                            )
                                                            )
                                                        } 
                                                    })): (
                                                        <tr
                                                            key={'noTriggerAdaptionRows'}
                                                            style={{
                                                                height: '70px',
                                                                borderBottom: '1px solid #E7E7E7'
                                                            }}
                                                        >
                                                            <td colSpan={3}>No Mappings from Webhook</td>
                                                        </tr>   
                                                    )
                                            }
                                        </tbody>
                                    </table>
                                    <div style={{height: 20}}/>
                                </>
                        ) : null
                    }
                                        {
                        Object.values(mappings['action-1']).filter((mapping)=> {
                            return mapping.output?.in == 'body'
                        }).length > 0 ? (
                                <>
                                    <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                        Request Body Data
                                    </Text>
                                    <table 
                                            key={'triggerAdaptionTable'}
                                            style={{ 
                                                width: '85%',
                                                borderCollapse: 'collapse',
                                                border: '1px solid #E7E7E7',
                                                fontFamily: 'Visuelt',
                                                fontSize: '14px',
                                                fontWeight: 100,
                                                textAlign: 'left',

                                            }}>
                                                <colgroup>
                                                    <col style={{width: '30%'}}/>
                                                    <col style={{width: '40%'}}/>
                                                    <col style={{width: '30%'}}/>
                                                </colgroup>
                                                <thead
                                                    style={{
                                                        backgroundColor: '#E7E7E7',
                                                        color: '#000000',
                                                        fontFamily: 'Vulf Sans',
                                                        fontSize: '18px',
                                                        fontWeight: 600,
                                                        lineHeight: '16px',
                                                        textAlign: 'left',
                                                        textTransform: 'uppercase',
                                                        height: '30px'
                                                    }}
                                                >
                                                    <tr
                                                        style={{
                                                            height: '50px'
                                                        }}
                                                    >
                                                        {headings.map((heading) => {
                                                            return(
                                                                <th key={heading}>{heading}</th>
                                                            )
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody
                                                    key={'triggerAdaptionRows'}
                                                    style={{
                                                        backgroundColor: '#FFFFFF',
                                                        color: '#000000',
                                                        fontFamily: 'apercu-regular-pro',
                                                        fontSize: '14px',
                                                        fontWeight: 100,
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    {
                                                    
                                                        mappings['action-1'] ? (
                                                            Object.keys(mappings['action-1']).map((targetKey, index) => {
                                                                var mappingValues = Object.values(mappings['action-1'])[index]
                                                                if (mappingValues?.input?.actionId == inputActionId && mappingValues?.output?.actionId == outputActionId && mappingValues?.output?.in == 'body'){
                                                                    const inputFormulas = mappingValues?.input?.formulas
                                                                    var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,'trigger', 'action-1')
                                                                    return cleanedRows.map(
                                                                        (row) => (
                                                                            <tr
                                                                                key={row}
                                                                                style={{
                                                                                    height: '70px',
                                                                                    borderBottom: '1px solid #E7E7E7'
                                                                                }}
                                                                            >
                                                                                {row.map((cell) => {
                                                                                    return (
                                                                                        <td key={cell}>{cell}</td>
                                                                                    ) 
                                                                                })}
                                                                            </tr>
                                                                    )
                                                                    )
                                                                }
                                                            })): (
                                                                <tr
                                                                    key={'noTriggerAdaptionRows'}
                                                                    style={{
                                                                        height: '70px',
                                                                        borderBottom: '1px solid #E7E7E7'
                                                                    }}
                                                                >
                                                                    <td colSpan={3}>No Mappings from Webhook</td>
                                                                </tr>   
                                                            )
                                                    }
                                                </tbody>
                                    </table>
                                    <div style={{height: 20}}/>
                                </>
                        ) : null
                    }
                    </div>
                ) : null
            }
            </div>

        </div>
        )

    }

    const renderActionContent = () => {
        var startingNodeId = 'action-1'
        var startingEdges = edges.filter((edge) => edge.source == startingNodeId)
        var successEdges = edges.filter((edge) => edge.sourceHandle == 'actionSuccess')
        var failureEdges = edges.filter((edge) => edge.sourceHandle == 'actionFailure')
        

    }


    return typeof window !== 'undefined' ? (
        <>
            <Button  sx={{
                height: '40px',
                radius:0,
                backgroundColor: '#000000',
                '&:hover': {
                    backgroundColor: '#858585',
                },
            }} onClick={createPDF}>Download PDF</Button>
            <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: 60}}>
                
                <div style={{display: 'flex', flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center', width: '100%', paddingRight: 180}}>
                    <div style={{ display: 'flex',  flexDirection: 'row', alignItems: 'center' }}>
                        <Player
                        src={titleAnimation} 
                        style={{width: 100, height: 100}}
                        loop
                        autoplay
                        />
                        <Text
                            sx={{
                                fontFamily:'Vulf Sans',
                                fontWeight: 700,
                                fontSize: '50px',
                            }}
                        >{workflow?.name}</Text>
                    </div>
                    <div style={{display: 'flex',  flexDirection: 'row', alignItems: 'center', paddingRight: 20}}>
                        <Text sx={{color: '#000000', fontFamily: 'Vulf Sans', fontSize:'20px'}}>
                                Scope Generated in 
                        </Text>
                        <div style={{width: '10px'}}/>
                        <div style={{
                                display: 'flex',  flexDirection: 'row', alignItems: 'center',
                                width: 100,
                            }}>

                            <Image alt="logo" src={primaryLockupBlack} sx={{
                                width: 100,
                                height: '100%'
                            }}/>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        paddingLeft: 100,
                        paddingTop: 50
                    }}
                >
                {renderTriggerContent()}
                </div>
                <div style={{height: 20}}/>

                <div
                    style={{
                        paddingLeft: 100,
                        paddingTop: 50
                    }}
                >
                 {renderTriggeredActionContent()}
                </div>
               
            </div>
        </>
     ) : (
        <div>   
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 180}}>
                <div style={{ display: 'flex',  flexDirection: 'row', alignItems: 'center' }}>
                    <Player
                    src={titleAnimation}
                    style={{width: 100, height: 100}}
                    loop
                    autoplay
                    />
                </div>
            </div>
            </div>
     )
    

}

export default WorkflowScope