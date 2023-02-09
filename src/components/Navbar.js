import { Navbar, createStyles, Group, Code, Image,Text, Avatar} from "@mantine/core";
import { useState, useCallback, useEffect } from "react";
import {useRouter} from 'next/navigation'
import {UserContext} from '../context/UserContext'
import {MdConnectWithoutContact} from 'react-icons/md'
import {CgListTree} from 'react-icons/cg'
import {BiBuildings} from 'react-icons/bi'
import {useUser} from '@auth0/nextjs-auth0/client'


const Navigation = ({setView}) => {
    const { user, error, isLoading } = useUser();
    const router = useRouter()

    const useStyles = createStyles((theme, _params, getRef) => {
        const icon = getRef('icon');
        return {
          header: {
            paddingBottom: theme.spacing.md,
            marginBottom: theme.spacing.md * 1.5,
            borderBottom: `1px solid ${
              theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
            }`,
          },
      
          footer: {
            paddingTop: theme.spacing.md,
            marginTop: theme.spacing.md,
            borderTop: `1px solid ${
              theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
            }`,
          },
      
          link: {
            ...theme.fn.focusStyles(),
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontFamily: 'Visuelt',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            borderRadius: theme.radius.sm,
            borderRadius: 12,
            width: '80%',
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      
              [`& .${icon}`]: {
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              },
            },
          },
      
          linkIcon: {
            ref: icon,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
            marginRight: theme.spacing.sm,
          },
      
          linkActive: {
            '&, &:hover': {
              backgroundColor: '#ffffff',
              borderRadius: 12,
              fontWeight: 600,
              color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              [`& .${icon}`]: {
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              },
            },
          },
        };
      });

    const { classes, cx } = useStyles();
    const [active, setActive] = useState('Partnerships');

    const data = [
        { link: '', label: 'Partnerships' },
        { link: '', label: 'My APIs'},
        { link: '', label: 'My Organization'}
    ];
    
    const renderIcon = (label) => {

        switch (label) {
            case 'Partnerships':
                return <MdConnectWithoutContact className={classes.linkIcon} />;
            case 'My APIs':
                return <CgListTree className={classes.linkIcon} />;
            case 'My Organization':
                return <BiBuildings className={classes.linkIcon} />;
            default:
                return null;
        }
    }

  const links = data.map((item) => (
    <a
      className={cx(classes.link, { [classes.linkActive]: item.label === active })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setView(item)
        setActive(item.label);
      }}
    >
        {renderIcon(item.label)}
      <span style={{fontSize: 18}}>{item.label}</span>
    </a>
  ));

    
    return (
        <div>
            <Navbar style={{backgroundColor: '#f2f2f8'}} height={'100vh'} width={{ sm: 300 }}>
                <Navbar.Section grow>
                    <Group className={classes.header} position="center">
                       <Image style={{paddingTop:20, paddingRight: 40, width:240}} alt='logo' src='https://i.ibb.co/ypxCSVd/tandem-logo.png' />
                    </Group>
                <Group position="center">
                     {links}
                </Group>
                    
                </Navbar.Section>
                <Navbar.Section className={classes.footer}>
                <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                    <span>Logout</span>
                </a>
                <a className={classes.link} onClick={()=> router.push('/api/auth/logout')}>
                    <div style={{alignItems: 'center', display:'flex', flexDirection: 'row', width: 200, height: 50,borderRadius: '5px', overflow: 'hidden'}}>                        <Avatar size={26} radius={26} src={user?.picture}/>
                        <Text style={{paddingLeft: 10}}>{user?.name}</Text>
                    </div>
                </a>
                </Navbar.Section>
            </Navbar>
        </div>
    )
}

export default Navigation