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
  Switch
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { type } from 'os';
import { useRouter } from 'next/router';
import {BiSearch} from 'react-icons/bi'
import {RxCaretSort} from 'react-icons/rx'
import axios from 'axios';

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
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const { classes } = useStyles();
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text style={{fontFamily: 'Visuelt'}} weight={500} size="sm">
            {children}
          </Text>
          <RxCaretSort style={{color:'grey'}}/>
        </Group>
      </UnstyledButton>
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
  const router  = useRouter();

  const [sortedData, setSortedData] = useState(data);
  
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

    console.log("Creating New Workflow")
    axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/projects/' + partnershipId + '/workflows', newWorkflow).then((res) => {
      console.log(res)
      //Add WorkflowUUID to Partnership Workflows Array
        console.log("Adding Workflow to Partnership")
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

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const { id } = event.currentTarget.dataset;
    router.push(`/partnerships/${partnershipId}/workflows/${id}`)
  };

  const rows = statusFilter != "None" ? sortedData.filter((row) => row.status === statusFilter).map((row) => (
    <tr data-id={row.id} onClick={handleRowClick} key={row.id}>
      <td data-id={row.id}>{
        <Switch color="dark" checked={
            row.active === 'true' ? true : false
        }
         />
      }</td>
      <td data-id={row.id}>{row.name}</td>
      <td data-id={row.id}>
        <Badge color={
            row.status === 'Draft' ? 'gray' : row.status === 'Active' ? 'lime' : 'red'
        } style={{fontFamily:'Visuelt', fontWeight: 100}}>
            {row.status}
        </Badge>
      </td>
      <td data-id={row.id}>{row.updated}</td>
    </tr>
  )) : sortedData.map((row) => (
    <tr data-id={row.id} 
    onClick={handleRowClick} 
    key={row.id}>
      <td data-id={row.id}>{
        <Switch color="dark" checked={
            row.active === 'true' ? true : false
        }
         />
      }</td>
      <td data-id={row.id}>{row.name}</td>
      <td data-id={row.id}>
        <Badge color={
            row.status === 'Draft' ? 'gray' : row.status === 'Active' ? 'lime' : 'red'
        } style={{fontFamily:'apercu-light-pro', color: 'black'}}>
            {row.status}
        </Badge>
      </td>
      <td data-id={row.id}>{row.updated}</td>
    </tr>
  ))


  return  (
    <div style={{width: '100%', maxWidth:1250}}>
        <div style={{paddingBottom: 10,paddingLeft: 10, paddingTop: 30, display:'flex'}}>
                <Button onClick={() => {setStatusFilter("None")}} style={{fontFamily: 'apercu-regular-pro', borderRadius: 30, height: 18, backgroundColor: 'black', color: 'white'}}> All </Button>
                <div style={{width: 10}}/>
                <Button onClick={() => {setStatusFilter("Active")}} style={{fontFamily: 'apercu-regular-pro', borderRadius: 30, height: 18, backgroundColor: '#b4f481', color: 'black', fontWeight: 4}}>Active</Button>
                <div style={{width: 10}}/>
                <Button onClick={() => {setStatusFilter("Upublished")}} style={{fontFamily: 'apercu-regular-pro', borderRadius: 30, height: 18, backgroundColor: '#FFBD9A', color: 'black', fontWeight: 4}}> Unpublished </Button>
                <div style={{width: 10}}/>
                <Button onClick={() => {setStatusFilter("Draft")}} style={{fontFamily: 'apercu-regular-pro',  borderRadius: 30, height: 18, backgroundColor: '#e7e7e7', color: 'black', fontWeight: 4}}> Draft </Button>
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
            >
              Active
            </Th>
            <Th
              sorted={sortBy === 'name'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('name', false)}
            >
              Name
            </Th>
            <Th
              sorted={sortBy === 'status'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('status', false)}
            >
              Status
            </Th>
            <Th
              sorted={sortBy === 'updated'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('updated', false)}
            >
              Updated
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={4}>
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