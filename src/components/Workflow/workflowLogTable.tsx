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

interface RowData {
  id: string;
  timestamp: string;
  message: string;
  level: string;
  action: string;
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

function WorkflowLogsTable({ data, partnershipId, apis, userId}: TableSortProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState("None");
  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const setNodeAction = useStore((state) => state.setNodeAction)
  const deleteNodeAction = useStore((state) => state.deleteNodeAction)
  const nodeActions = useStore((state) => state.nodeActions)

  const router  = useRouter();

  const [sortedData, setSortedData] = useState(data);

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

  const rows = sortedData.map((row) => (
    <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
      <td data-id={row.id}>{row.timestamp}</td>
      <td data-id={row.id}>{row.level}</td>
      <td data-id={row.id}>{row.action ? row.action : 'No Action'}</td>
      <td data-id={row.id}>{row.message}</td>
    </tr>
  ))


  return  (
    <div style={{width: '100%', maxWidth:1250}}>
      <Table
        verticalSpacing="xs"
        highlightOnHover={true}
        sx={{ minWidth: '50vw' }}
      >
        <thead>
          <tr>
            <Th
              sorted={sortBy === 'timestamp'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('timestamp', false)}
              width={105}
              sortable={true}
            >
              Timestamp
            </Th>
            <Th
              sorted={sortBy === 'level'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('level', false)}
              width={200}
              sortable={true}
            >
              Level
            </Th>
            <Th
              sorted={sortBy === 'action'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('action', false)}
              width={'50%'}
              sortable={true}
            >
              Action
            </Th>
            <Th
              sorted={sortBy === 'message'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('message', false)}
              width={200}
              sortable={true}
            >
              Message
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
                  No Workflow Logs
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default WorkflowLogsTable