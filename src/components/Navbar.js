import { Navbar, createStyles, Group, Code, Tooltip, Image,Text, Avatar, Button} from "@mantine/core";
import { useState, useCallback, useEffect } from "react";
import {useRouter} from 'next/navigation'
import { useUser } from "@auth0/nextjs-auth0/client";
import {MdConnectWithoutContact} from 'react-icons/md'
import {CgListTree} from 'react-icons/cg'
import {BiBuildings} from 'react-icons/bi'
import {TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse} from 'react-icons/tb'

const Navigation = ({setIsOpened, isOpened}) => {
    const { user, error, isLoading } = useUser();
    const router = useRouter()

    const useStyles = createStyles((theme, _params, getRef) => {
        const icon = getRef('icon');
        return {
          header: {
            paddingTop: 20,
            marginBottom: theme.spacing.md * 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent:'center',
            flexDirection: 'row'
          },
          collapsedHeader: {
            paddingTop: 20,
            marginBottom: theme.spacing.md * 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent:'center',
            flexDirection: 'row'
          },
      
          footer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent:'center',
            flexDirection: 'column',
            height: 400,
            paddingTop: theme.spacing.md,
            marginTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
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
              backgroundColor: '#ffffff',
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
              fontWeight: 500,
              color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              [`& .${icon}`]: {
                color: theme.colorScheme === 'dark' ? theme.white : theme.black,
              },
            },
          },
                
          collapsedLink: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            borderRadius: theme.radius.sm,
            borderRadius: 12,
            width: 50,
            height: 50,
            '&:hover': {
              backgroundColor: '#ffffff',
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

    const handleToggle = useCallback(() => {
        setIsOpened(!isOpened);
      }, [setIsOpened, isOpened]);

    const data = [
        { link: '/', label: 'Partnerships' },
        { link: '/myApis', label: 'My APIs'},
        { link: '/myOrganization', label: 'My Organization'}
    ];
    
    const renderIcon = (label) => {

      if(!isOpened) {
          switch (label) {
            case 'Partnerships':
                return <MdConnectWithoutContact style={{fontSize: 24}} />;
            case 'My APIs':
                return <CgListTree  />;
            case 'My Organization':
                return <BiBuildings/>;
            default:
                return null;
         }

      } 
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
        router.push(item.link);
        setActive(item.label);
      }}
    >
        {renderIcon(item.label)}
      <span style={{fontSize: 18}}>{item.label}</span>
    </a>
  ));

  const collapsedLinks = data.map((item) => (
    <Tooltip
      key = {item.label}
      withinPortal={true}
      label={
        <Text
          sx={{
            fontFamily: 'Visuelt',
            fontSize: 16,
            color: '#FFFFFF'
          }}
        >{item.label}</Text>
      }
      color={'black'}
      position="right"
      offset={8}
      sx={{
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        display:'flex',
        border: '1px solid #F8F6F3',
        borderRadius: 12,
      }}
      >
      <a
            className={cx(classes.collapsedLink, { [classes.linkActive]: item.label === active })}
            href={item.link}
            key={item.label}
            onClick={(event) => {
              event.preventDefault();
              router.push(item.link);
              setActive(item.label);
            }}
          > 
              {renderIcon(item.label)}
          </a>
    </Tooltip>
    

  ));

    
    return !user ? (
    <div>

    </div>)
    : user && isOpened ? (
        <div style={{position:'fixed', width:300, zIndex: 9999999999}}>
            <Navbar style={{backgroundColor: '#F8F6F4'}} height={'100vh'} width={{ sm: 300 }}>
                <Navbar.Section grow>
                    <Group className={classes.header} position="center">
                       <Image style={{paddingTop:20, paddingRight: 40, width:240}} alt='logo' src='https://i.ibb.co/QM4cyP9/Screen-Shot-2023-02-13-at-10-01-35-PM.png' />
                    </Group>
                    <Group position="center">
                        {links}
                    </Group> 
                </Navbar.Section>
                <Navbar.Section className={classes.footer}>
                <a href="#" className={classes.link} onClick={handleToggle}>
                  <div style={{alignItems: 'center', display:'flex', flexDirection: 'row'}}>
                    <TbLayoutSidebarLeftCollapse/>
                    <div style={{width: 10}}/>
                    <Text>Collapse</Text>  
                    </div>
                </a>
                <a className={classes.link} onClick={()=> router.push('/api/auth/logout')}>
                    <div style={{alignItems: 'center', display:'flex', flexDirection: 'row', width: 200, height: 50,borderRadius: '5px', overflow: 'hidden'}}>                        
                    <Avatar size={26} radius={26} src={user?.picture}/>
                    <Text style={{paddingLeft: 10}}>{user?.name}</Text>
                    </div>
                </a>
                </Navbar.Section>
            </Navbar>
        </div>
    )
    : user && !isOpened ? (
      <div style={{position:'fixed'}}>
      <Navbar style={{backgroundColor: '#F8F6F4'}} height={'100vh'} width={{ sm: 120 }}>
          <Navbar.Section grow  style={{display:'flex', flexDirection:'column',alignItems: 'center'}} >
            <Group className={classes.collapsedHeader}  style={{display:'flex', flexDirection:'row',alignItems: 'center'}}>
                  <Image style={{paddingRight: 15, paddingLeft: 15, paddingTop: 20, width: 100}} alt='logo' src='https://i.ibb.co/HBdWHQX/Screen-Shot-2023-02-16-at-2-46-33-PM.png' />
            </Group>
            <Group position="center" style={{display:'flex', flexDirection:'column',alignItems: 'center'}}>
                {collapsedLinks}
            </Group> 
          </Navbar.Section>
          <Navbar.Section className={classes.footer}>
                <a className={classes.collapsedLink} onClick={handleToggle}>
                    <TbLayoutSidebarRightCollapse/>            
                </a>
                <a className={classes.collapsedLink} onClick={()=> router.push('/api/auth/logout')}>
                    <Avatar size={26} radius={26} src={user?.picture}/>
                </a>
          </Navbar.Section>
      </Navbar>
  </div>
  ) : null
}

export default Navigation