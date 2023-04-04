
import React, { useCallback, useState, useContext, useEffect, useRef} from 'react';
import useStore from '../../context/store'
import axios from 'axios'
import {Text, ScrollArea, Button, Image, Divider, Card, Center, Select, Accordion} from '@mantine/core';
import validationIcon from '../../../public/icons/programming-code-search-square.svg'
import authIcon from '../../../public/icons/key-square.4.svg'
const WorkflowValidationDrawer = ({nodeValidationResults }) => {

    const groupedData = nodeValidationResults ? nodeValidationResults.reduce((acc, item) => {
        const { action, type } = item;
        acc[action] = acc[action] || {};
        acc[action][type] = acc[action][type] || [];
        acc[action][type].push(item);
        return acc;
      }, {}) : null

    return (
        <div style={{padding: 30}}>
          <ScrollArea style={{height: 550}}>
            {
                nodeValidationResults ?
                <div>
                {Object.entries(groupedData).map(([action, types]) => (
                  <div key={action}>
                    <Text sx={{fontFamily: 'Visuelt', fontSize: 24}}>{action}</Text>
                    {Object.entries(types).map(([type, items]) => (
                      <div style={{paddingTop: 10, paddingBottom: 30, display: 'flex', flexDirection:'column'}} key={type}>
                        <Card shadow="sm" radius="md" withBorder>
                              <Card.Section sx={{padding: 20}}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                  <div style={{width: 30, height: 30}}>
                                      <Image alt="validationErrorIcon" src={ type == 'missing-required-data' ? validationIcon : type == 'missing-api-authentication' ? authIcon : validationIcon} />
                                  </div>
                                  <div style={{width: 10}}/>
                                  <div>
                                    <Text sx={{fontFamily: 'Visuelt', fontSize: 18}}>{type == 'missing-required-data' ? "Missing Required Data": type == 'missing-api-authentication' ? "API Authentication Invalid" : type}</Text>
                                    {items.map((item, index) => (
                                          <Text key={index}>{item.message}</Text>
                                    ))}
                                  </div>
                                  
                                </div>
                                
                              </Card.Section>
                        </Card>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
                :
                <div>
                    <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 400, fontSize: 16}}>Are you sure you want to activate this workflow?</Text>
                    <Divider style={{marginTop: 10, marginBottom: 10}}/>
                    <Text style={{fontFamily:'Visuelt', color: 'black', fontWeight: 400, fontSize: 16}}>This will start the workflow and send data to the configured actions.</Text>
                </div>


            }
          </ScrollArea>
        </div>
    )
}

export default WorkflowValidationDrawer