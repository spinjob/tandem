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
  Button,
  Divider
} from '@mantine/core';
import { keys } from '@mantine/utils';
import {AiTwotoneCheckCircle} from 'react-icons/ai'
import {VscSymbolArray} from 'react-icons/vsc'
import {BiCodeCurly} from 'react-icons/bi'
import {RiDoubleQuotesL} from 'react-icons/ri'
import {AiOutlineNumber} from 'react-icons/ai'
import {RxComponentBoolean, RxQuestionMarkCircled} from 'react-icons/rx'

const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },
  td: {
    '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      },
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
  name: string;
  method: string;
  uuid: string;
}

interface TableSortProps {
  data: RowData[];
  setUUID: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
          <Text weight={500} size="sm">
            {children}
          </Text>
        </Group>
      </UnstyledButton>
    </th>
  );
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => item.name.toLowerCase().includes(query)
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

const returnIcon = (method: string) => {
    switch (method) {
        case 'post':
            return (<AiTwotoneCheckCircle style={{color: '#FFBE9A'}} />)
        case 'put':
            return (<AiTwotoneCheckCircle style={{color: '#FFA39E'}} />)
        case 'get':
            return (<AiTwotoneCheckCircle style={{color: '#DAFAC0'}} />)
        case 'delete':
            return (<AiTwotoneCheckCircle style={{color: '#eaeaff'}} />)
        default:
            return (<AiTwotoneCheckCircle style={{color: '#eaeaff'}} />)
    }
}

function ActionsTable({ data, setUUID }: TableSortProps) {
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

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

  const rows = sortedData.map((row) => (
    <tr key={row.uuid}>
        <td>
            <Button 
                value={row.uuid}
                className={activeAction === row.uuid ? 'active' : ''}
                onClick={(e) => {
                  setActiveAction(row.uuid)
                  setUUID(e)
                }} 
                sx={{
                    '&:hover': {
                        backgroundColor: '#F2F0EE',
                        color: 'black'
                    },
                    '&.active': {
                        backgroundColor: 'black',
                        color: 'white'
                    },
                    backgroundColor: 'white',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    fontFamily: 'Visuelt',
                    fontSize: 14,
                    color: 'black'
            }}>
                {returnIcon(row.method)}
                <div style={{width: 10}}/>
                <Text>{row.name}</Text>
            </Button>    
        </td>
    </tr>
  ));

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}} >
      <TextInput
      placeholder="Search for an Action"
      size="md"
      value={search}
      onChange={handleSearchChange}
      />
      <div style={{height: 30}}/>
      <ScrollArea style={{height: '70vh'}}>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          sx={{ tableLayout: 'fixed', maxWidth: 700 }}
        >
          <thead>
            <tr>
              {/* <Th
                sorted={sortBy === 'name'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('name')}
              >
                Name
              </Th> */}
              {/* <Th
                sorted={sortBy === 'email'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('email')}
              >
                Email
              </Th>
              <Th
                sorted={sortBy === 'company'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('company')}
              >
                Company
              </Th> */}
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
    </div>
  );
}

export default ActionsTable;