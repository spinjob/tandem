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
  Avatar
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { useRouter } from 'next/router';

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
  key: string;
  type: string;
  value: string;
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
  const query = search.toString().toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toString().toLowerCase().includes(query))
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

function TeamTable({ data }: TableSortProps) {
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const router  = useRouter();

  const setSorting = (field: keyof RowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const { id } = event.currentTarget.dataset;
    // router.push(`/partnerships/${id}`)
  };

  const rows = sortedData.map((row) => (
    <tr data-id={row.id} onClick={handleRowClick} key={row.id}>
      <td data-id={row.id}>{row.key}</td>
      <td data-id={row.id}>{
        <Text style={{fontFamily:'apercu-regular-pro', fontSize:'15px', color:'grey'}}>{row.type}</Text>
      }</td>
      <td data-id={row.id}>{
        <Text style={{fontFamily:'apercu-regular-pro', fontSize:'15px', color:'grey'}}>{row.value}</Text>
      }</td>
    </tr>
  ));

  return (
    <ScrollArea>
      <div style={{height: 30}}/>
      {/* <TextInput
        placeholder="Search by any field"
        mb="md"
        value={search}
        onChange={handleSearchChange}
        sx={{
            width: 450,
            '& input': {
                '&: focus': {
                    border: '1px solid #000'
                }
            }
        }}
      /> */}
      <Table
        verticalSpacing="xs"
        highlightOnHover={true}
        sx={{maxWidth:'75vw' }}
      >
        <thead>
          <tr>
            <Th
              sorted={sortBy === 'key'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('key')}
            >
              <Text style={{fontFamily:'Visuelt', fontSize:'15px'}}>Config Key</Text>
            </Th>
            <Th
              sorted={sortBy === 'type'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('type')}
            >
               <Text>Data Type</Text>
            </Th>
            <Th
              sorted={sortBy === 'value'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('value')}
            >
               <Text>Value</Text>
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
    </ScrollArea>
  );
}

export default TeamTable