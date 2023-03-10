import { Navbar, createStyles, Group, Code, Tooltip, Image,Text, Avatar, Button} from "@mantine/core";
import { useState, useCallback, useContext, useEffect } from "react";
import {useRouter} from 'next/navigation'
import { useUser } from "@auth0/nextjs-auth0/client";
import {MdConnectWithoutContact} from 'react-icons/md'
import {CgListTree} from 'react-icons/cg'
import {BiBuildings} from 'react-icons/bi'
import {TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse} from 'react-icons/tb'
import AppContext from "../context/AppContext"
import axios from "axios";
import primaryLockupBlack from '../../public/logos/SVG/Primary Lockup_Black.svg'
import blackLogoIcon from '../../public/logos/SVG/Icon/Icon_Black.svg'
import partnershipsIcon from '../../public/icons/Programing, Data.8.svg'
import organizationIcon from '../../public/icons/high-rise-building.svg'
import apiIcon from '../../public/icons/programming-code.6.svg'
import logoutIcon from '../../public/icons/exit-door-log-out.3.svg'
import minimizeNavIcon from '../../public/icons/window-finder-minimize-resize.svg'
import maximizeNavIcon from '../../public/icons/window-finder-maximize-resize.svg'

const Navigation = ({setIsOpened, isOpened}) => {
    const { user, error, isLoading } = useUser();
    const router = useRouter()
    const {organization} = useContext(AppContext).state
    const {setOrganization} = useContext(AppContext)
    const {dbUser} = useContext(AppContext).state
    const {setDbUser} = useContext(AppContext)

    const useStyles = createStyles((theme, _params, getRef) => {
        const icon = getRef('icon');
        return {
          header: {
            paddingTop: 20,
            marginBottom: theme.spacing.md * 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent:'left',
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
            fontSize: 14,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
            padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            borderRadius: theme.radius.sm,
            borderRadius: 12,
            width: '80%',
            '&:hover': {
              backgroundColor: '#EAEAFF',
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

          linkInactive: {
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
              backgroundColor: '#EAEAFF',
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
                return <Image alt="partnerships" src={partnershipsIcon} />;
            case 'My APIs':
                return <Image alt="apis" src={apiIcon}/>;
            case 'My Organization':
                return <Image alt="organization" src={organizationIcon}/>;
            default:
                return null;
         }

      } 
        switch (label) {
            case 'Partnerships':
                return <>
                      <div style={{height: 26, width: 26}}>
                          <Image alt="partnerships" src={partnershipsIcon} className={classes.linkIcon} />
                       </div>
                       <div style={{width: 8}}/>
                      </>
                 ;
            case 'My APIs':
                return  <>
                        <div style={{height: 26, width: 26}}>
                            <Image alt="apis" src={apiIcon} className={classes.linkIcon} />
                        </div>
                        <div style={{width: 8}}/>
                        </>
            case 'My Organization':
                return <>
                        <div style={{height: 26, width: 26}}>
                            <Image alt="organization" src={organizationIcon} className={classes.linkIcon} />
                        </div>
                        <div style={{width: 8}}/>
                      </>;
            default:
                return null;
        }
    }

  const links = data.map((item) => 
   !organization && !dbUser?.organization ? 
      (
        <a
          className={cx(classes.link, { [classes.linkActive]: item.label === active })}
          key={item.label}
          onClick={(event) => {
          }}
        >
            {renderIcon(item.label)}

          <span >
          <Text sx={{fontSize: 14}}>
            {item.label}
          </Text></span>
        </a>
      ) : (
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
      )
  );

  const collapsedLinks = data.map((item) => (
    !organization ? (
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
            key={item.label}
            onClick={(event) => {

            }}
          > 
              {renderIcon(item.label)}
          </a>
    </Tooltip>
  
    ) : (
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
  
    )
   
  ));

    const fetchDbUser = useCallback(() => {
      axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + '/users/find',{email: user.email})
      .then((res) => {
          setDbUser(res.data)
          if(res.data.organization){
            console.log("Organization Found for User")
            setOrganization(res.data.organization)
          }
      })
      .catch((err) => {
          // console.log(err)
      })
    }, [user, setDbUser, setOrganization])

    useEffect(() => {
      if (!organization && user && !dbUser) {
        fetchDbUser()
      }
    }, [organization, user, dbUser, fetchDbUser])
    return !user ? (
    <div>

    </div>)
    : user && isOpened ? (
        <div style={{position:'fixed', width:300, zIndex: 9999999999}}>
            <Navbar style={{backgroundColor: '#F8F6F4'}} height={'100vh'} width={{ sm: 245 }}>
                <Navbar.Section grow>
                    <Group className={classes.header} position='left'>
                      <Image style={{
                        paddingLeft: 32,
                        paddingTop: 10, 
                        width: 180
                        }} alt='logo' src={primaryLockupBlack} />
                    </Group>
                    <div style={{height: 35}}/>
                    <Group position="center">
                        {links}
                    </Group> 
                </Navbar.Section>
                <Navbar.Section className={classes.footer}>
                <a href="#" className={classes.link} onClick={handleToggle}>
                  <div style={{alignItems: 'center', display:'flex', flexDirection: 'row'}}>
                    <Image alt="collapseNavigation" src = {minimizeNavIcon} width={26} height={26}/>
                    <div style={{width: 10}}/>
                    <Text style={{fontFamily: 'Visuelt', fontWeight: 100, fontSize: 16}}>Collapse</Text>  
                    </div>
                </a>
                <div style={{height: 10}}/>

                <a className={classes.link} style={{cursor:'pointer'}} onClick={()=> router.push('/api/auth/logout')}>
                    <div style={{alignItems: 'center', display:'flex', flexDirection: 'row', borderRadius: '5px', overflow: 'hidden'}}>                        
                    <Image alt="logout" src = {logoutIcon} width={26} height={26}/>
                    <Text style={{paddingLeft: 10, fontFamily: 'Visuelt', fontWeight: 100, fontSize: 16}}>Logout</Text>
                    </div>
                </a>
                <div style={{height: 10}}/>
                <a className={classes.link}>
                    <div style={{alignItems: 'center', display:'flex', flexDirection: 'row', width: 200, height: 30,borderRadius: '5px', overflow: 'hidden'}}>                        
                    <Avatar size={26} radius={26} src={user?.picture}/>
                    <Text style={{paddingLeft: 10, fontFamily: 'Visuelt', fontWeight: 100, fontSize: 16}}>{user?.name}</Text>
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
              <Image alt="logoIcon" src={blackLogoIcon} width={26} height={26} sx={{paddingTop: 10}} />
            </Group>
            <div style={{height: 35}}/>
            <Group position="center" style={{display:'flex', flexDirection:'column',alignItems: 'center'}}>
                {collapsedLinks}
            </Group> 
          </Navbar.Section>
          <Navbar.Section className={classes.footer}>
                <Tooltip
                  key = "expand"
                  withinPortal={true}
                  label={
                    <Text
                      sx={{
                        fontFamily: 'Visuelt',
                        fontSize: 16,
                        color: '#FFFFFF'
                      }}
                    >Expand Nav</Text>
                  }
                  color={'black'}
                  position="right"
                  offset={20}
                  sx={{
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display:'flex',
                    border: '1px solid #F8F6F3',
                    borderRadius: 12,
                  }}
                  >
                    <a style={{cursor:'pointer'}} className={classes.collapsedLink} onClick={handleToggle}>
                      <Image alt="expandNav" src = {maximizeNavIcon} width={26} height={26}/>       
                    </a>
                </Tooltip>  
                <div style={{height: 10}}/>
                <Tooltip
                      key = "logout"
                      withinPortal={true}
                     
                      label={
                        <Text
                          sx={{
                            fontFamily: 'Visuelt',
                            fontSize: 16,
                            color: '#FFFFFF'
                          }}
                        >Logout</Text>
                      }
                      color={'black'}
                      position="right"
                      offset={20}
                      sx={{
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        display:'flex',
                        border: '1px solid #F8F6F3',
                        borderRadius: 12,
                      }}
                      >
                <a className={classes.collapsedLink} style={{cursor:'pointer'}} onClick={()=> router.push('/api/auth/logout')}>
                    <Image alt="logout" src = {logoutIcon} width={26} height={26}/>  
                </a>
                </Tooltip>
                <div style={{height: 10}}/>
                <Tooltip
                  key = "profile"
                  withinPortal={true}
                  label={
                    <Text
                      sx={{
                        fontFamily: 'Visuelt',
                        fontSize: 16,
                        color: '#FFFFFF'
                      }}
                    >My Profile</Text>
                  }
                  color={'black'}
                  position="right"
                  offset={20}
                  sx={{
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display:'flex',
                    border: '1px solid #F8F6F3',
                    borderRadius: 12,
                  }}
                  >
                <a style={{cursor:'pointer'}} className={classes.collapsedLink}>
                    <Avatar size={26} radius={26} src={user?.picture}/>
                </a>
                </Tooltip>
          </Navbar.Section>
      </Navbar>
  </div>
  ) : null
}

export default Navigation