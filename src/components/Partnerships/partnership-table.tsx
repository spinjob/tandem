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
import partnershipIcon from '../../../public/icons/Interaction, Teamwork, Group.svg'
import arrowIcon from '../../../public/icons/Arrow.svg'
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
  id: string;
  name: string;
  updated: string;
  workflows: string;
  status: string;
  avatar: string;
}

interface TableSortProps {
  data: RowData[];
  statusFilter: string;
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
            <Text style={{fontFamily: 'Visuelt'}} weight={500} size="sm">
              {children}
            </Text>
            <RxCaretSort style={{color:'grey'}}/>
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

function PartnershipsTable({ data, statusFilter }: TableSortProps) {
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
    router.push(`/partnerships/${id}`)
  };

  const rows = statusFilter != "None" ? (
    sortedData.filter((row) => row.status === statusFilter).map((row) => (
      <tr data-id={row.id} onClick={handleRowClick} style= {{cursor:'pointer'}} key={row.id}>
        <td style={{display:'flex',flexDirection:'row', alignItems:'center'}} data-id={row.id}>
          <div style={{opacity: '50%', padding: 5, backgroundColor: '#EBE9E6', borderRadius: 8}}>
            <Image src={partnershipIcon} alt="partnership icon" width={20} height={20} />
          </div>
          <div style={{width: 10}}/>
         <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.name}</Text>
         <div style={{width: 10}}/>
         <div style={{opacity: '50%'}}>
            <Image src={arrowIcon} alt="arrow" width={12} height={12} />
          </div>
        </td>
        <td data-id={row.id}>
          <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.workflows}</Text>
        </td>
        <td data-id={row.id}>
          <Avatar.Group sx={{zIndex: 0}}>
            <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
            <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
            <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
            <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
            <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
          </Avatar.Group>
        </td> 
        <td data-id={row.id}>
          <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.updated}</Text>
        </td>
      </tr>
    ))

  ) : sortedData.map((row) => (
    <tr data-id={row.id} onClick={handleRowClick} style= {{cursor:'pointer'}} key={row.id}>
      <td style={{display:'flex',flexDirection:'row', alignItems:'center'}} data-id={row.id}>
        <div style={{opacity: '50%', padding: 5, backgroundColor: '#EBE9E6', borderRadius: 8}}>
          <Image src={partnershipIcon} alt="partnership icon" width={20} height={20} />
        </div>
        <div style={{width: 10}}/>
       <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.name}</Text>
       <div style={{width: 10}}/>
       <div style={{opacity: '50%'}}>
          <Image src={arrowIcon} alt="arrow" width={12} height={12} />
        </div>
      </td>
      <td data-id={row.id}>
        <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.workflows}</Text>
      </td>
      <td data-id={row.id}>
        <Avatar.Group sx={{zIndex: 0}}>
          <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
          <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
          <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
          <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
          <Avatar radius='xl' size={'sm'} sx={{border:'1px solid black'}} />
        </Avatar.Group>
      </td> 
      <td data-id={row.id}>
        <Text sx={{fontFamily:'Visuelt', fontWeight: 100}}>{row.updated}</Text>
      </td>
    </tr>
  ));



  return (
    <ScrollArea
      sx={{ height: 320, maxHeight: 500}}
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
              width={'50%'}
              sortable={true}
            >
              <div>
              </div>
              Partnership
            </Th>
            <Th
              sorted={sortBy === 'updated'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('name', false)}
              width={200}
              sortable={true}
            >
              Workflows
            </Th>
            <Th
              sorted={sortBy === 'avatar'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('name', false)}
              width={200}
              sortable={false}
            >
              Team
            </Th>
            <Th
              sorted={sortBy === 'workflows'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('updated', false)}
              width={200}
              sortable={true}
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
              <td colSpan={5}>
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

export default PartnershipsTable