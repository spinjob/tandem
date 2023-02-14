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
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
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

function PartnershipWorkflowsTable({ data }: TableSortProps) {
  const [search, setSearch] = useState('');
  
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const router  = useRouter();

  const [sortedData, setSortedData] = useState(data);

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = event.currentTarget;
//     setSearch(value);
//     setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
//   };

//   const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
//     const { id } = event.currentTarget.dataset;
//     router.push(`/partnerships/${id}`)
//   };

  const rows = sortedData.map((row) => (
    <tr data-id={row.id} 
    // onClick={handleRowClick} 
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
        } style={{fontFamily:'Visuelt', fontWeight: 100}}>
            {row.status}
        </Badge>
      </td>
      <td data-id={row.id}>{row.updated}</td>
    </tr>
  ));

  return  (
    <div style={{width: '70vw'}}>
        <div style={{display: 'flex', flexDirection:'row', width: '70vw', height: 35, justifyContent: 'right'}}>
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
            <Button style={{backgroundColor: 'black', height: '35px',width: '150px', borderRadius: 8}}>New Workflow</Button>
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
              onSort={() => setSorting('name')}
            >
              Name
            </Th>
            <Th
              sorted={sortBy === 'status'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('status')}
            >
              Status
            </Th>
            <Th
              sorted={sortBy === 'updated'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('updated')}
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
              <td colSpan={Object.keys(data[0]).length}>
                <Text weight={500} align="center">
                  Nothing found
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