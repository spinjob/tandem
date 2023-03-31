import { useState } from 'react';
import {
  createStyles,
  Table,
  UnstyledButton,
  Group,
  Text,
  TextInput,
  Select,
  Image
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { useRouter } from 'next/router';
import {RxCaretSort} from 'react-icons/rx'
import searchIcon from '../../../public/icons/programming-code-search copy 2.svg'
import arrowDownIcon from '../../../public/icons/arrow-down.1.svg'


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
  timestamp: string;
  message: string;
  level: string;
  action: string;
  traceId: string;
}

interface TableSortProps {
  data: RowData[];
  actions: string[];
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

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
    if (!query || query.length === 0) {
          return data;
    } else {
      return data.filter((item) =>
      keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
    );
    }

}


function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string}
) {
  const { sortBy } = payload;

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

function WorkflowLogsTable({ data, partnershipId, apis, userId, actions}: TableSortProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const router  = useRouter();

  const [sortedData, setSortedData] = useState(data);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };
  

  const setSorting = (field: keyof RowData) => {
  
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search}));
  };

  // const handleRowClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
  //   const { id } = event.currentTarget.dataset;
  //   router.push(`/partnerships/${partnershipId}/workflows/${id}`)
  // };

  const rows = actionFilter !== 'all' && levelFilter != 'all' ?  sortedData.filter((row) => row.level === levelFilter && row.action == actionFilter).map((row) => (
    <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
      <td data-id={row.id}>{row.timestamp}</td>
      <td data-id={row.id}>{row.traceId}</td>
      <td data-id={row.id}>{row.level}</td>
      <td data-id={row.id}>{row.action ? row.action : 'No Action'}</td>
      <td data-id={row.id}>{row.message}</td>
    </tr>
  )) : actionFilter == 'all' && levelFilter != 'all' ? 
  (
    sortedData.filter((row) => row.level === levelFilter).map((row) => (
      <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
        <td data-id={row.id}>{row.timestamp}</td>
        <td data-id={row.id}>{row.traceId}</td>
        <td data-id={row.id}>{row.level}</td>
        <td data-id={row.id}>{row.action ? row.action : 'No Action'}</td>
        <td data-id={row.id}>{row.message}</td>
      </tr>
    ))
  ) : actionFilter != 'all' && levelFilter == 'all' ? 
  (
    sortedData.filter((row) => row.action === actionFilter).map((row) => (
      <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
        <td data-id={row.id}>{row.timestamp}</td>
        <td data-id={row.id}>{row.traceId}</td>
        <td data-id={row.id}>{row.level}</td>
        <td data-id={row.id}>{row.action ? row.action : 'No Action'}</td>
        <td style={{overflow: 'hidden'}} data-id={row.id}>{row.message}</td>
      </tr>
    ))
  ) : sortedData.map((row) => (
    <tr style={{cursor:'pointer'}} data-id={row.id} key={row.id}>
      <td data-id={row.id}>{row.timestamp}</td>
      <td data-id={row.id}>{row.traceId}</td>
      <td data-id={row.id}>{row.level}</td>
      <td data-id={row.id}>{row.action ? row.action : 'No Action'}</td>
      <td data-id={row.id}>{row.message}</td>
    </tr>
  ))


  return  (
    <div style={{width: '100%'}}>
      <div style={{width: '100%', display: 'flex', flexDirection: 'row', paddingLeft: 10}}>
                <Select
                    value={levelFilter}
                    data={[
                        { label: 'All Levels', value: 'all' },
                        { label: 'Info', value: 'info' },
                        { label: 'Error', value: 'error' }
                    ]}
                    placeholder="Filter by level"
                    sx={{
                        width: 200,
                        '& input': {
                          '&: focus': {
                                  border: '1px solid black'
                          }
                      }
                    }}
                    styles={{
                        item: {
                            '&:hover': {
                                backgroundColor: '#F8F9FA',
                          
                            },
                            '&[data-selected]': {
                              '&, &:hover': {
                                backgroundColor: 'black',
                                color: 'white',
                              },
                            },
                        }
                    }}
                    onChange={(value: string) => {
                        setLevelFilter(value)
                    }}
                />
                <div style={{width: 20}} />
              <Select
                    value={actionFilter}
                    data={actions}
                    placeholder="Filter by action"
                    sx={{
                      width: 200,
                      '& input': {
                        '&: focus': {
                                border: '1px solid black'
                        }
                    }
                  }}
                  styles={{
                      item: {
                          '&:hover': {
                              backgroundColor: '#F8F9FA',
                        
                          },
                          '&[data-selected]': {
                            '&, &:hover': {
                              backgroundColor: 'black',
                              color: 'white',
                            },
                          },
                      }
                  }}
                    onChange={(value: string) => {
                        setActionFilter(value)
                    }}
                />
               <TextInput
                size="sm"
                value={search}
                placeholder="Search Logs"
                onChange={handleSearchChange}
                icon={
                  <div style={{height: 20, width: 20}}>
                    <Image alt="searchIcon" src={searchIcon} sx={{opacity: '50%'}} />
                  </div>
                  
                }
                sx={{
                    height: '20px',
                    width: '500px',
                    paddingLeft: '20px',
                    '& input': {
                      '&: focus': {
                              border: '1px solid black'
                      }
                  }
                }}
                />
            </div>
      <div style={{height: 20}} />
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
              onSort={() => setSorting('timestamp')}
              width={100}
              sortable={true}
            >
              Timestamp
            </Th>
            <Th
              sorted={sortBy === 'traceId'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('traceId')}
              width={100}
              sortable={true}
            >
              TraceId
            </Th>
            <Th
              sorted={sortBy === 'level'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('level')}
              width={100}
              sortable={true}
            >
              Level
            </Th>
            <Th
              sorted={sortBy === 'action'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('action')}
              width={100}
              sortable={true}
            >
              Action
            </Th>
            <Th
              sorted={sortBy === 'message'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('message')}
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