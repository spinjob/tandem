import { useRouter } from 'next/router';
import React, { useCallback, useState, useContext, useEffect, useRef, use} from 'react';
import {
    Button,
    Text,
    Image,
    Divider
  } from '@mantine/core';

//   import ReactJson from 'react-json-view';

import axios from 'axios';
import useStore from '../../context/store'
import {Player } from '@lottiefiles/react-lottie-player';

import titleAnimation from '../../../public/animations/LevelUp_Icons_A_Circles.json'
import primaryLockupBlack from '../../../public/logos/SVG/Primary Lockup_Black.svg'

import {jsPDF} from 'jspdf'
import html2canvas from "html2canvas";


const WorkflowScope = ({partnership, shouldDownloadPdf, setShouldDownloadPdf}) => {
    
    const workflow = useStore(state => state.workflow)
    const nodeActions = useStore(state => state.nodeActions)
    const mappings = useStore(state => state.mappings)
    const nodes = useStore(state => state.nodes)
    const edges = useStore(state => state.edges)
    const printRef = React.useRef();
    const router = useRouter()
    const { pid, workflowId } = router.query

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

    useEffect(() => {
        if (shouldDownloadPdf){
            createPDF()
            setShouldDownloadPdf(false)
        }
    }, [shouldDownloadPdf,setShouldDownloadPdf])

    const renderAdaptionTable = (formulas, targetProperty, inputProperty, inputNodeId, outputNodeId) => {
        
        var rows = []
        //Specifying all of the mappings action IDs so we can filter out any previously mapped properties from other actions.
        console.log(formulas)
        console.log(targetProperty)
        console.log(inputProperty)

        formulas?.forEach((formula, index) => {
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
            } else if (formula.formula == 'multiplication'){
                var multiplicationInput = formula.inputs['multiplication']
                var fullFormula = inputProperty?.path + ' * ' + multiplicationInput
                if(index != 0){
                    fullFormula = rows[index - 1][0] + ' * ' + multiplicationInput
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (formula.formula == 'division'){
                var divisionInput = formula.inputs['division']
                var fullFormula = inputProperty?.path + ' / ' + divisionInput
                if(index != 0){
                    fullFormula = rows[index - 1][0] + ' / ' + divisionInput
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (formula.formula == 'concatenation'){
                var concatenationInput = formula.inputs['concatenation']
                var fullFormula = inputProperty?.path + ' + ' + concatenationInput
                if(index != 0){
                    fullFormula = rows[index - 1][0] + ' + ' + concatenationInput
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (formula.formula == 'append'){
                var appendInput = formula.inputs['append']
                var fullFormula = inputProperty?.path + ' + ' + appendInput
                if(index != 0){
                    fullFormula = rows[index - 1][0] + ' + ' + appendInput
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (formula.formula == 'prepend'){
                var prependInput = formula.inputs['prepend']
                var fullFormula = prependInput + ' + ' + inputProperty?.path
                if(index != 0){
                    fullFormula = prependInput + ' + ' + rows[index - 1][0]
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (formula.formula == 'substring'){
                var substringInput = formula.inputs['substring']
                console.log(substringInput)
                
                var fullFormula = inputProperty?.path + '.substring(' + substringInput.startingIndex + ',' + substringInput.endingIndex + ')'
                if(index != 0){
                    fullFormula = rows[index - 1][0] + '.substring(' + substringInput + ')'
                }
                var row = []
                row.push(inputProperty?.path)
                row.push(fullFormula)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (formula.formula == 'replace'){


            }

           
        })
        
        if(!formulas || formulas.length == 0){
            var row = []
            if(inputProperty.path.includes('$variable')){
                row.push('Configured Value')
                row.push("set value to "+inputProperty?.value)
                row.push(targetProperty?.path)
                rows.push(row)
            } else if (inputProperty.path.includes('$credential')){
                row.push('Configured Value')
                row.push("set value to Auth Credential: "+inputProperty?.key)
                row.push(targetProperty?.path)
                rows.push(row)
            }  else {
                row.push(inputProperty?.path)
                row.push('One to One Mapping')
                row.push(targetProperty?.path)
                rows.push(row)
            }
           
        }

        var cleanedRows = rows.length > 1 ? [rows[rows.length-1]] : rows
        
       return cleanedRows
    }

    const renderTriggerContent = () => {

        var trigger = workflow?.trigger
        var action1 = nodeActions['action-1-'+workflowId]

        if(trigger.type == 'webhook'){
            return(
                <div>
                    <div>
                        <Text
                            sx={{fontFamily: 'Vulf Sans', fontSize: '40px', color: '#000000'}}>
                            Webhook Trigger
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

    console.log(edges)
    return typeof window !== 'undefined' ? (
        <>
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
                    {
                        edges.map((edge) => 
                           {

                            console.log(edge)

                                return mappings[edge.target] ? (
                                
                                <div key={edge.id}>
                                     {
                                            Object.values(mappings[edge?.target]).filter((mapping)=> {
                                                return mapping.output?.in == 'configuration'
                                            }).length > 0 ? (
                                                    <>
                                                        <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                                            Set Configurations
                                                        </Text>
                                                        <table key={edge.target+'-ConfigurationAdaptionTable'} style={{ width: '85%', borderCollapse: 'collapse', border: '1px solid #E7E7E7',fontFamily: 'Visuelt',fontSize: '14px',fontWeight: 100,textAlign: 'left'}}>
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
                                                                        key={edge.target+"-ConfigurationAdaptionTableRow"}
                                                                        style={{
                                                                            height: '50px'
                                                                        }}
                                                                    >
                                                                        {[ "Input", 'Formula',"Configuration"].map((heading) => {
                                                                            return(
                                                                                <th key={heading}>{heading}</th>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                </thead>
                                                                <tbody
                                                                    key={edge.target+ '-ConfigurationAdaptionRows'}
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
                                                                        
                                                                        mappings[edge.target] ? (
                                                                            Object.keys(mappings[edge.target]).map((targetKey, index) => {
                                                                                var mappingValues = Object.values(mappings[edge.target])[index]
                                                                                if (mappingValues?.input?.actionId == nodeActions[edge.source]?.uuid && mappingValues?.output?.actionId == nodeActions[edge.target]?.uuid && mappingValues?.output?.in == 'configuration'){
                                                                                    const inputFormulas = mappingValues?.input?.formulas
                                                                                    var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,edge.source, edge.target)
                                                                                    return cleanedRows.map(
                                                                                        (row) => (
                                                                                            <tr
                                                                                                key={row+edge.target+"TableRow"}
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
                                                                                    key={edge.target+'noConfigurationAdaptionRows'}
                                                                                    style={{
                                                                                        height: '70px',
                                                                                        borderBottom: '1px solid #E7E7E7'
                                                                                    }}
                                                                                >
                                                                                    <td colSpan={3}>No Configuration Mappings</td>
                                                                                </tr>   
                                                                            )
                                                                    }
                                                                </tbody>
                                                        </table>
                                                        <div style={{height: 20}}/>
                                                        </>
                                            ) : null
                                        }
                                    <div>
                                        <Text sx={{fontFamily: 'Vulf Sans', fontSize: '40px', color: '#000000'}}>
                                           {edge.target.split('-')[1]}. {nodeActions[edge.target]?.method.toUpperCase()} {nodeActions[edge.target]?.path}
                                        </Text>
                                        <div style={{height: 20}}/>
                                        <Divider size={'xs'} sx={{width: '40%'}}/>
                                        <div style={{height: 10}}/>
                                        {
                                            edge.target.split('-')[1] == "1" && workflow?.trigger?.type == 'webhook' ? (
                                                <Text  sx={{fontFamily: 'Visuelt', fontWeight: 100,fontSize: '16px', width: '90%'}}>
                                                    When the {workflow?.trigger?.selectedWebhook?.name} webhook is received, the integration should send a {nodeActions[edge.target]?.method.toUpperCase()} request to the following endpoint: {nodeActions[edge.target]?.path} with the following data mappings:
                                                </Text>

                                            ) : edge.target.split('-')[1] == "1" && workflow?.trigger?.type == 'scheduled' ? (
                                                <Text  sx={{fontFamily: 'Visuelt', fontWeight: 100,fontSize: '16px', width: '90%'}}>
                                                    When the scheduled {workflow?.trigger?.cadence} cadence is triggered, the integration should send a {nodeActions[edge.target]?.method.toUpperCase()} request to the following endpoint: {nodeActions[edge.target]?.path} with the following data mappings:
                                                </Text>
                                            ) : (
                                                <Text  sx={{fontFamily: 'Visuelt', fontWeight: 100,fontSize: '16px', width: '90%'}}>
                                                   If {nodeActions[edge.source]?.name} responds {edge.sourceHandle == 'actionSuccess' ? 'successfully' : 'unsuccessfully'}, the integration should send a {nodeActions[edge.target]?.method.toUpperCase()} request to the following endpoint: {nodeActions[edge.target]?.path} with the following data mappings:
                                                </Text>
                                            )
                                        }
                                        
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
                                            </Text>
                                            
                                        </div>
                                        <div style={{height: 20}}/>
                                    </div>
                                    <div style={{height: 20}}/>
                                        {
                                            Object.values(mappings[edge?.target]).filter((mapping)=> {
                                                return mapping.output?.in == 'header'
                                            }).length > 0 ? (
                                                    <>
                                                        <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                                            Header Parameters
                                                        </Text>
                                                        <table key={edge.target+'-HeaderAdaptionTable'} style={{ width: '85%', borderCollapse: 'collapse', border: '1px solid #E7E7E7',fontFamily: 'Visuelt',fontSize: '14px',fontWeight: 100,textAlign: 'left'}}>
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
                                                                        key={edge.target+"-HeaderAdaptionTableRow"}
                                                                        style={{
                                                                            height: '50px'
                                                                        }}
                                                                    >
                                                                        {[ "Input", 'Formula',"Action Property"].map((heading) => {
                                                                            return(
                                                                                <th key={heading}>{heading}</th>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                </thead>
                                                                <tbody
                                                                    key={edge.target+ '-HeaderAdaptionRows'}
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
                                                                        
                                                                        mappings[edge.target] ? (
                                                                            Object.keys(mappings[edge.target]).map((targetKey, index) => {
                                                                                var mappingValues = Object.values(mappings[edge.target])[index]
                                                                                if (mappingValues?.input?.actionId == nodeActions[edge.source]?.uuid && mappingValues?.output?.actionId == nodeActions[edge.target]?.uuid && mappingValues?.output?.in == 'header'){
                                                                                    const inputFormulas = mappingValues?.input?.formulas
                                                                                    var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,edge.source, edge.target)
                                                                                    return cleanedRows.map(
                                                                                        (row) => (
                                                                                            <tr
                                                                                                key={row+edge.target+"TableRow"}
                                                                                                style={{
                                                                                                    height: '70px',
                                                                                                    borderBottom: '1px solid #E7E7E7'
                                                                                                }}
                                                                                            >
                                                                                                {
                                                                                                    row.map((cell) => {
                                                                                                        return (
                                                                                                            <td key={cell}>{cell}</td>
                                                                                                        ) 
                                                                                                    })
                                                                                                }
                                                                                            </tr>
                                                                                    )
                                                                                    )
                                                                                }
                                                                            })): (
                                                                                <tr
                                                                                    key={edge.target+'noHeaderAdaptionRows'}
                                                                                    style={{
                                                                                        height: '70px',
                                                                                        borderBottom: '1px solid #E7E7E7'
                                                                                    }}
                                                                                >
                                                                                    <td colSpan={3}>No Header Mappings</td>
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
                                            Object.values(mappings[edge?.target]).filter((mapping)=> {
                                                return mapping.output?.in == 'path'
                                            }).length > 0 ? (
                                                    <>
                                                        <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                                            Path Parameters
                                                        </Text>
                                                        <table key={edge.target+'-PathAdaptionTable'}  style={{ width: '85%',borderCollapse: 'collapse', border: '1px solid #E7E7E7',fontFamily: 'Visuelt',fontSize: '14px', fontWeight: 100,textAlign: 'left',}}>
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
                                                                    key={edge.target+"-PathAdaptionTableRow"}
                                                                    style={{
                                                                        height: '50px'
                                                                    }}
                                                                >
                                                                    {[ "Input", 'Formula',"Action Property"].map((heading) => {
                                                                        return(
                                                                            <th key={heading}>{heading}</th>
                                                                        )
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody
                                                                key={edge.target+'-PathAdaptionRows'}
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
                                                                    
                                                                    mappings[edge.target] ? (
                                                                        Object.keys(mappings[edge.target]).map((targetKey, index) => {
                                                                            var mappingValues = Object.values(mappings[edge.target])[index]
                                                                            if (mappingValues?.input?.actionId == nodeActions[edge.source]?.uuid && mappingValues?.output?.actionId == nodeActions[edge.target]?.uuid && mappingValues?.output?.in == 'path'){
                                                                                const inputFormulas = mappingValues?.input?.formulas
                                                                                var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,edge.input, edge.target)
                                                                                return cleanedRows.map(
                                                                                    (row) => (
                                                                                        <tr
                                                                                            key={edge.target+row+"PathTableRow"}
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
                                                                                key={edge.target+'noPathAdaptionRows'}
                                                                                style={{
                                                                                    height: '70px',
                                                                                    borderBottom: '1px solid #E7E7E7'
                                                                                }}
                                                                            >
                                                                                <td colSpan={3}>No Path Parameter Mappings</td>
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
                                            Object.values(mappings[edge?.target]).filter((mapping)=> {
                                                return mapping.output?.in == 'body'
                                            }).length > 0 ? (
                                                    <>
                                                        <Text sx={{fontFamily: 'Visuelt', fontSize: '24px', fontWeight: 500, color: '#000000'}}>
                                                            Request Body Data
                                                        </Text>
                                                        <table 
                                                                key={edge.target+'-RequestBodyAdaptionTable'}
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
                                                                            key={edge.target+"-RequestBodyAdaptionTableRow"}
                                                                            style={{
                                                                                height: '50px'
                                                                            }}
                                                                        >
                                                                            {[ "Input", 'Formula',"Action Property"].map((heading) => {
                                                                                return(
                                                                                    <th key={heading}>{heading}</th>
                                                                                )
                                                                            })}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody
                                                                        key={edge.target+'-RequestBodyAdaptionRows'}
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
                                                                        
                                                                            mappings[edge?.target] ? (
                                                                                Object.keys(mappings[edge?.target]).map((targetKey, index) => {
                                                                                    var mappingValues = Object.values(mappings[edge?.target])[index]
                                                                                    //Check that the action is the same as the source node and that the output is the body OR (if the mappings are all variables because the input has no data) that the input is a variable.
                                                                                    if (mappingValues?.input?.actionId == nodeActions[edge.source]?.uuid && mappingValues?.output?.actionId == nodeActions[edge.target]?.uuid && mappingValues?.output?.in == 'body' || mappingValues?.input?.path?.includes('$variable') && mappingValues?.output?.actionId == nodeActions[edge.target]?.uuid && mappingValues?.output?.in == 'body'|| mappingValues?.input?.path?.includes('$credential') && mappingValues?.output?.actionId == nodeActions[edge.target]?.uuid && mappingValues?.output?.in == 'body'){
                                                                                        const inputFormulas = mappingValues?.input?.formulas
                                                                                        var cleanedRows = renderAdaptionTable(inputFormulas, mappingValues?.output, mappingValues?.input,edge?.source, edge?.target)
                                                                                      
                                                                                        return cleanedRows.map(
                                                                                            (row) => (
                                                                                                <tr
                                                                                                    key={edge.target+row+"RequestBodyTableRow"}
                                                                                                    style={{
                                                                                                        height: '70px',
                                                                                                        borderBottom: '1px solid #E7E7E7'
                                                                                                    }}
                                                                                                >
                                                                                                    {row.map((cell, index) => {
                                                    
                                                                                                        return (
                                                                                                            <td key={cell+"-"+index}>{cell}</td>
                                                                                                        ) 
                                                                                                    })}
                                                                                                </tr>
                                                                                        )
                                                                                        )
                                                                                    }
                                                                                })): (
                                                                                    <tr
                                                                                        key={edge.target+'noRequestBodyAdaptionRows'}
                                                                                        style={{
                                                                                            height: '70px',
                                                                                            borderBottom: '1px solid #E7E7E7'
                                                                                        }}
                                                                                    >
                                                                                        <td colSpan={3}>No Mappings from Previous Action</td>
                                                                                    </tr>   
                                                                                )
                                                                        }
                                                                    </tbody>
                                                        </table>
                                                        <div style={{height: 20}}/>
                                                    </>
                                            ) : null
                                        }
                                </div>) : (
                                     <div key={edge.id}>
                                     <Text sx={{fontFamily: 'Vulf Sans', fontSize: '40px', color: '#000000'}}>
                                        {edge.target.split('-')[1]} {nodeActions[edge.target]?.method.toUpperCase()} {nodeActions[edge.target]?.path}
                                     </Text>
                                     <div style={{height: 20}}/>
                                     <Divider size={'xs'} sx={{width: '40%'}}/>
                                     <div style={{height: 10}}/>
                                     {
                                            edge.target.split('-')[1] == "1" && workflow?.trigger?.type == 'webhook' ? (
                                                <Text  sx={{fontFamily: 'Visuelt', fontWeight: 100,fontSize: '16px', width: '90%'}}>
                                                    When the {workflow?.trigger?.selectedWebhook?.name} webhook is received, the integration should send a {nodeActions[edge.target]?.method.toUpperCase()} request to the following endpoint: {nodeActions[edge.target]?.path}.  There are no mappings from the webhook schema.
                                                </Text>

                                            ) : edge.target.split('-')[1] == "1" && workflow?.trigger?.type == 'scheduled' ? (
                                                <Text  sx={{fontFamily: 'Visuelt', fontWeight: 100,fontSize: '16px', width: '90%'}}>
                                                    When the scheduled {workflow?.trigger?.cadence} cadence is triggered, the integration should send a {nodeActions[edge.target]?.method.toUpperCase()} request to the following endpoint: {nodeActions[edge.target]?.path}.
                                                </Text>
                                            ) : (
                                                <Text  sx={{fontFamily: 'Visuelt', fontWeight: 100,fontSize: '16px', width: '90%'}}>
                                                   If {nodeActions[edge.source]?.name} responds {edge.sourceHandle == 'actionSuccess' ? 'successfully' : 'unsuccessfully'}, the integration should send a {nodeActions[edge.target]?.method.toUpperCase()} request to the following endpoint: {nodeActions[edge.target]?.path}.  There are no mappings set from the previous response schema.
                                                </Text>
                                            )
                                    }
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
                                         </Text>
                                         
                                     </div>
                                     <div style={{height: 20}}/>
                                 </div>
                            )
                           }

                        )
                    }
              
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