import { useState } from 'react';
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  Avatar,
  Image
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { type } from 'os';
import { useRouter } from 'next/router';
import cancelIcon from '../../../../public/icons/delete-disabled.svg'
import checkIcon from '../../../../public/icons/checkmark-medium.svg'

import {RxCaretSort} from 'react-icons/rx'

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
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
    zIndex: 1,

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface RowData {
  uuid: string;
  name: string;
  method: string;
  path: string;
  headerParameters: string;
  pathParameters: string;
  requestBodySchema: string;
  responseBodySchema: string;
}

interface TableSortProps {
  data: RowData[];
  statusFilter: string;
  setUUID: (event: React.MouseEvent<HTMLTableRowElement>) => void;
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  width: any;
  sortable: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, width, sortable, onSort }: ThProps) {
  const { classes } = useStyles();
  return (
    <th className={classes.th}>
      {
        sortable ? (
          <UnstyledButton onClick={onSort} className={classes.control}>
          <Group position="apart">
            <Text style={{fontFamily: 'Visuelt', fontSize:'12px'}} weight={500}>
              {children}
            </Text>
            {/* <RxCaretSort style={{color:'grey'}}/> */}
          </Group>
        </UnstyledButton>
        ) : ( 
              <Text style={{fontFamily: 'Visuelt'}} weight={500} size="sm">
                    {children}
                </Text>
            )
      }
    </th>
  );
}

function filterData(data: RowData[], search: any) {

  const query = search.toLowerCase().trim();
  if(!query || query.length == 0){
    return data;
  }
  return data.filter((item) =>
    {
      console.log(item)
      keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
    }
  );
}

function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string, statusFilter: string }
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

function LargeActionsTable({ data, statusFilter, setUUID }: TableSortProps) {
  const { classes, cx } = useStyles();
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const router  = useRouter();
  const [scrolled, setScrolled] = useState(false);

  const setSorting = (field: keyof RowData, filter: boolean) => {
    if(filter){
      setSortedData(sortData(data, { sortBy: field, reversed: false, search, statusFilter }));
    }
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search, statusFilter }));
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const { id } = event.currentTarget.dataset;
  };

  const rows = statusFilter != "None" ? (
    sortedData.filter((row) => row.method === statusFilter).map((row) => (
      <tr data-id={row.uuid} onClick={setUUID} style= {{cursor:'pointer'}} key={row.uuid}>
        <td style={{display:'flex',flexDirection:'row', alignItems:'center'}} data-id={row.uuid}>
            <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.name}</Text>
        </td>
        <td data-id={row.uuid}>
          <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.method}</Text>
        </td>
        <td data-id={row.uuid}>
            <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.path}</Text>
        </td> 
        <td data-id={row.uuid}>
            {
                row.headerParameters ? (
                    <div style={{width:20, height: 20}}>
                        <Image alt='checkIcon' src={checkIcon}/>
                    </div>
                ) : (
                    <div style={{width:20, height: 20}}>
                        <Image alt='cancelIcon' src={cancelIcon}/>
                    </div>
                )
            }
        </td>
        <td data-id={row.uuid}>
            <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.pathParameters}</Text>
        </td>
        <td data-id={row.uuid}>
            <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.requestBodySchema}</Text>
        </td>
        <td data-id={row.uuid}>
            <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.responseBodySchema}</Text>
        </td>
      </tr>
    ))

  ) : sortedData.map((row) => (
        <tr data-id={row.uuid} onClick={setUUID} style= {{cursor:'pointer'}} key={row.uuid}>
            <td style={{display:'flex',flexDirection:'row', alignItems:'center'}} data-id={row.uuid}>
                <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.name}</Text>
            </td>
            <td data-id={row.uuid}>
            <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.method}</Text>
            </td>
            <td data-id={row.uuid}>
                <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.path}</Text>
            </td> 
            <td data-id={row.uuid}>
                {
                    row.headerParameters == 'true' ? (
                        <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='checkIcon' src={checkIcon}/>
                            </div>
                        </div>
                       
                    ) : (
                        
                         <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='cancelIcon' src={cancelIcon}/>
                            </div>
                        </div>
                    )
                }
            </td>
            <td data-id={row.uuid}>
                {
                    row.pathParameters == 'true' ? (
                        <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='checkIcon' src={checkIcon}/>
                            </div>
                        </div>
                       
                    ) : (
                        
                         <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='cancelIcon' src={cancelIcon}/>
                            </div>
                        </div>
                    )
                }
            </td>
            <td data-id={row.uuid}>
                {
                    row.requestBodySchema == 'true' ? (
                        <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='checkIcon' src={checkIcon}/>
                            </div>
                        </div>
                       
                    ) : (
                        
                         <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='cancelIcon' src={cancelIcon}/>
                            </div>
                        </div>
                    )
                }
            </td>
            <td data-id={row.uuid}>
                {
                    row.responseBodySchema == 'true' ? (
                        <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='checkIcon' src={checkIcon}/>
                            </div>
                        </div>
                       
                    ) : (
                        
                         <div style={{display:'flex',flexDirection: 'row', width: '100%', justifyContent:'center', alignItems:'center'}}>
                            <div style={{width:20, height: 20}}>
                                <Image alt='cancelIcon' src={cancelIcon}/>
                            </div>
                        </div>
                    )
                }
            </td>
        </tr>
  ));



  return (
    <ScrollArea
      sx={{ height: 800, maxHeight: 600}}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table
        verticalSpacing="xs"
        highlightOnHover={true}
      >
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <Th
              sorted={sortBy === 'name'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('name', false)}
              width={200}
              sortable={true}
            >
              <div>
              </div>
              Action
            </Th>
            <Th
              sorted={sortBy === 'method'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('method', false)}
              width={200}
              sortable={true}
            >
              Method
            </Th>
            <Th
              sorted={sortBy === 'path'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('path', false)}
              width={200}
              sortable={true}
            >
              Endpoint
            </Th>
            <Th
              sorted={sortBy === 'headerParameters'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('headerParameters', false)}
              width={200}
              sortable={true}
            >
              Headers
            </Th>
            <Th
              sorted={sortBy === 'pathParameters'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('headerParameters', false)}
              width={200}
              sortable={true}
            >
              Path Parameters
            </Th>
            <Th
              sorted={sortBy === 'requestBodySchema'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('headerParameters', false)}
              width={200}
              sortable={true}
            >
              Request Body Schema
            </Th>
            <Th
              sorted={sortBy === 'responseBodySchema'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('responseBodySchema', false)}
              width={200}
              sortable={true}
            >
              Response Body Schema
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={7}>
                <Text weight={500} align="center">
                    Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );
}

export default LargeActionsTable