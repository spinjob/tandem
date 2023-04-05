import { useState } from 'react';
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Button,
  Center,
  TextInput,
  Badge,
  Avatar,
  Loader,
  Switch,
  Menu,
  Image,
  ActionIcon
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { type } from 'os';
import { useRouter } from 'next/router';
import {BiSearch} from 'react-icons/bi'
import {RxCaretSort} from 'react-icons/rx'
import axios from 'axios';
import archiveIcon from '../../../public/icons/archive-documents-box-big.svg'
import workflowIcon from '../../../public/icons/Programing, Data.5.svg'
import draftIcon from '../../../public/icons/programming-code-edit.svg'
import elipsisIcon from '../../../public/icons/dots-menu.svg'

const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },
  tr:{
    fontFamily: 'Visuelt',
  },
  control: {
    width: '100%',
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));

import useStore from '../../context/store';
import { toLower } from 'lodash';

interface RowData {
  id: string;
  name: string;
  updated: string;
  active: string;
  status: string;
}

interface TableSortProps {
  data: RowData[];
  partnershipId: string;
  userId: string;
  apis: string[];
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  width: any;
  sortable: boolean;
  onSort(): void;
}

function Th({ children, width, reversed, sorted,  sortable, onSort }: ThProps) {
  const { classes } = useStyles();
  return (
    <th className={classes.th} style={{width: width}} >
      {
        sortable ? (
          <UnstyledButton onClick={onSort} className={classes.control}>
          <Group position="apart">
            <Text style={{fontFamily: 'Visuelt'}} weight={500} size="sm">
              {children}
            </Text>
            <RxCaretSort style={{color:'grey'}}/>
          </Group>
        </UnstyledButton>
        ): (null)

      }
     
    </th>
  );
}

function filterData(data: RowData[], search: any) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
  );
}

function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string, statusFilter: string }
) {
  const { sortBy} = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

function PartnershipWorkflowsTable({ data, partnershipId, apis, userId}: TableSortProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState("None");
  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const setNodeAction = useStore((state) => state.setNodeAction)
  const deleteNodeAction = useStore((state) => state.deleteNodeAction)
  const nodeActions = useStore((state) => state.nodeActions)

  const router  = useRouter();

  const [sortedData, setSortedData] = useState(data.filter((row) => row.status != "Archived"));
  
  const newWorkflowHandler = () => {
    var newWorkflow = {
      parent_project_uuid: partnershipId,
      trigger: {},
      steps: [],
      name: "Untitled Workflow",
      created_by: userId,
      status: "Draft",
      uuid: "",
      nodes: [],
      edges: [],
      interfaces: apis
    }

    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + partnershipId + '/workflows', newWorkflow).then((res) => {
      console.log(res)
      //Add WorkflowUUID to Partnership Workflows Array
        newWorkflow['uuid'] = res.data.uuid

        axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + partnershipId, {
          workflows: [newWorkflow]
        }).then((res) => {
          console.log(res)
      
          router.push(`/partnerships/${partnershipId}/workflows/${newWorkflow.uuid}`)
        }).catch((err) => {
          console.log(err)
        })
    }).catch((err) => {
      console.log(err)
    }
    )
  }

  const setSorting = (field: keyof RowData, filter: boolean) => {
  
    if (filter) {
      setSortedData(sortData(data, { sortBy: field, reversed: false, search, statusFilter }));
    }
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search, statusFilter }));
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
    const { id } = event.currentTarget.dataset;
    router.push(`/partnerships/${partnershipId}/workflows/${id}`)
  };

  const archiveWorkflow = (uuid: string) => {
    axios.put(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + partnershipId + '/workflows/' + uuid, {
      status: "Archived"
    }).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }

  const toLowerCase = (str: string) => {
    return str.toLowerCase();
  }

  const rows = statusFilter != "None" ? sortedData.filter((row) => row.status === statusFilter).map((row) => (
    <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
      <td data-id={row.id} style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>{
          row.active ? (
            <Switch color="dark" checked={true} />
          ) : row.status != 'Draft' ? (
            <div style={{borderRadius: 8, backgroundColor:'#EBE9E6',  height: 30, width: 30, padding: 5}}>
              <Image alt="workflowIcon" src={workflowIcon} />
            </div>
          ) : (
            <div style={{borderRadius: 8, opacity: '50%', backgroundColor:'#EBE9E6',  height: 30, width: 30, padding: 5}}>
              <Image alt="draftIcon" src={draftIcon} />
            </div>
          )
      }</td>
      <td onClick={(e) =>{handleRowClick(e)}} data-id={row.id}>{row.name}</td>
      <td onClick={(e) =>{handleRowClick(e)}} data-id={row.id}>
      <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          borderRadius: 20,
          width: 90,
          backgroundColor: row.status == 'Draft' ? '#E0E0E0' : row.status == 'active' ? '#B4F481' : '#FFA39E',
        }}>
          <Text sx={{fontFamily: 'apercu-regular-pro'}}>
            {toLowerCase(row.status) == 'active' ? 'Active' : toLowerCase(row.status) == 'inactive' ? 'Inactive' : row.status}
          </Text>
        </div>
      </td>
      <td onClick={(e) =>{handleRowClick(e)}} data-id={row.id}>{row.updated}</td>
      <td data-id={row.id}>
        <Menu trigger="hover">
            <Menu.Target>
                <ActionIcon>
                  <Image alt="elipsisIcon" src={elipsisIcon} style={{zIndex: 1,width: 20, height: 20}}/>
                </ActionIcon>        
            </Menu.Target>
            <Menu.Dropdown  >
                <Menu.Item onClick={()=>{ 
                    console.log('Delete Workflow: '+row.id)
                    archiveWorkflow(row.id)
                  }}>
                  <div style={{display:'flex', flexDirection: 'row'}}>
                    <div style={{width: 20, height: 20}}>
                      <Image alt="archiveIcon" src={archiveIcon} />
                      </div>
                      <div style={{width: 10}}/>
                      <Text sx={{fontFamily: 'Visuelt', fontWeight: 100}}>
                         Archive Workflow
                      </Text>
                  </div>
                   
                </Menu.Item>                    
            </Menu.Dropdown>
        </Menu>
      </td>
    </tr>
  )) : sortedData.map((row) => (
    <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
        <td data-id={row.id} style={{display:'flex', flexDirection:'row',alignItems:'center', justifyContent:'center'}}>{
          row.active ? (
            <Switch color="dark" checked={true} />
          ) : row.status != 'Draft' ? (
            <div style={{borderRadius: 8, backgroundColor:'#EBE9E6',  height: 30, width: 30, padding: 5}}>
              <Image alt="workflowIcon" src={workflowIcon} />
            </div>
          ) : (
            <div style={{borderRadius: 8, opacity: '50%', backgroundColor:'#EBE9E6',  height: 30, width: 30, padding: 5}}>
              <Image alt="draftIcon" src={draftIcon} />
            </div>
          )
      }</td>
      <td onClick={(e) =>{handleRowClick(e)}}  data-id={row.id}>{row.name}</td>
      <td onClick={(e) =>{handleRowClick(e)}} data-id={row.id}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          borderRadius: 20,
          width: 90,
          backgroundColor: row.status === 'Draft' ? '#E0E0E0' : row.status === 'active' ? '#B4F481' : '#FFA39E',
        }}>
          <Text sx={{fontFamily: 'apercu-regular-pro'}}>
            {toLowerCase(row.status) == 'active' ? 'Active' : toLowerCase(row.status) == 'inactive' ? 'Inactive' : row.status}
          </Text>
        </div>
      </td>
      <td onClick={(e) =>{handleRowClick(e)}} data-id={row.id}>{row.updated}</td>
      <td data-id={row.id}>
        <Menu trigger="hover">
            <Menu.Target>
                <ActionIcon>
                  <Image alt="elipsisIcon" src={elipsisIcon} style={{zIndex: 1,width: 20, height: 20}}/>
                </ActionIcon>        
            </Menu.Target>
            <Menu.Dropdown  >
                <Menu.Item onClick={()=>{ 
                    console.log('Delete Workflow: '+row.id)
                    archiveWorkflow(row.id)
                  }}>
                  <div style={{display:'flex', flexDirection: 'row'}}>
                    <div style={{width: 20, height: 20}}>
                      <Image alt="archiveIcon" src={archiveIcon} />
                      </div>
                      <div style={{width: 10}}/>
                      <Text sx={{fontFamily: 'Visuelt', fontWeight: 100}}>
                         Archive Workflow
                      </Text>
                  </div>
                   
                </Menu.Item>                    
            </Menu.Dropdown>
        </Menu>
      </td>
    </tr>
  ))


  return  (
    <div style={{width: '100%', maxWidth:1250}}>
        <div style={{paddingBottom: 10,paddingLeft: 10, paddingTop: 30, display:'flex'}}>
                <Button onClick={() => {setStatusFilter("None")}} style={{fontFamily: 'apercu-regular-pro', borderRadius: 30, height: 18, backgroundColor: 'black', color: 'white'}}> All </Button>
                <div style={{width: 10}}/>
                <Button onClick={() => {setStatusFilter("Draft")}} style={{fontFamily: 'apercu-regular-pro',  borderRadius: 30, height: 18, backgroundColor: '#e7e7e7', color: 'black', fontWeight: 4}}> Draft </Button>
                <div style={{width: 10}}/>
                <Button onClick={() => {setStatusFilter("INACTIVE")}} style={{fontFamily: 'apercu-regular-pro', borderRadius: 30, height: 18, backgroundColor: '#FFA39E', color: 'black', fontWeight: 4}}> Inactive </Button>
                <div style={{width: 10}}/>
                <Button onClick={() => {setStatusFilter("active")}} style={{fontFamily: 'apercu-regular-pro', borderRadius: 30, height: 18, backgroundColor: '#b4f481', color: 'black', fontWeight: 4}}>Active</Button>

        </div>
        <div style={{display: 'flex', flexDirection:'row', width: '100%',maxWidth:1250, height: 35, justifyContent: 'right'}}>
            {/* <TextInput
            size="sm"
            value={search}
            placeholder="Search"
            onChange={handleSearchChange}
            sx={{
                height: '20px',
                paddingLeft: '20px',
            }}
            /> */}
            <div style={{width: '10px'}}></div>
            <Button onClick={newWorkflowHandler} style={{backgroundColor: 'black', height: '35px',width: '150px', borderRadius: 8}}>New Workflow</Button>
        </div>
      <Table
        verticalSpacing="xs"
        highlightOnHover={true}
        sx={{ minWidth: '50vw' }}
      >
        <thead>
          <tr>
            <Th
              sorted={sortBy === 'active'}
              reversed={reverseSortDirection}
              onSort={() => 'active'}
              width={105}
              sortable={true}
            >
              Active
            </Th>
            <Th
              sorted={sortBy === 'name'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('name', false)}
              width={'50%'}
              sortable={true}
            >
              Name
            </Th>
            <Th
              sorted={sortBy === 'status'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('status', false)}
              width={200}
              sortable={true}
            >
              Status
            </Th>
            <Th
              sorted={sortBy === 'updated'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('updated', false)}
              width={200}
              sortable={true}
            >
              Updated
            </Th>
            <Th
              sorted={sortBy === 'updated'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('updated', false)}
              width={100}
              sortable={false}
            >
              
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={5}>
                <Text weight={500} align="center">
                  No Workflows. Create one!
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default PartnershipWorkflowsTable