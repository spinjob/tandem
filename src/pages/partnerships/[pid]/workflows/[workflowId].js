import { useRouter } from 'next/router';
import { Breadcrumbs, Anchor, Loader, Text, Tabs, Center} from '@mantine/core';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'

const WorkflowStudio = () => {
    const router = useRouter();
    const { pid, workflowId } = router.query;
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 30,
            width: '100%'
          }}>
            <h1>Workflow Studio</h1>
            <p>Partner ID: {pid}</p>
            <p>Workflow ID: {workflowId}</p>
        </div>
    );
    }

export default WorkflowStudio;