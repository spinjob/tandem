import { AppProps } from "next/app";
import Head from 'next/head';
import { Container, MantineProvider } from "@mantine/core";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import AppContext from '../context/AppContext';
import { useRouter } from "next/router";
import {CustomFonts} from '../../Global.js'
import {useState, useEffect} from 'react'
import "../styles/global.css"
import Navigation from "@/components/Navbar.js";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [organization, setOrganization] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [isNavOpen,setIsNavOpen] = useState(true)
  const [appMargin, setAppMargin] = useState(225)
  const [hideNavigation, setHideNavigation] = useState(false)
  const router = useRouter()

  const setIsOpened = (opened: boolean) => {
    setIsNavOpen(opened)
    if(opened){
      setAppMargin(225)
    }else{
      setAppMargin(100)
    }
  }

  useEffect(() => {
    if (isNavOpen === false && hideNavigation === false) {
      setAppMargin(100)
    } else if (isNavOpen === true && hideNavigation === false){
      setAppMargin(225)
    } 
  }, [isNavOpen])

  useEffect(() => {
    if (router.pathname == '/partnerships/[pid]/workflows/[workflowId]' && hideNavigation === false){
      setHideNavigation(true)
      setAppMargin(0)
    } else if (router.pathname == '/partnerships/[pid]/workflows/[workflowId]' && hideNavigation === true){
      setHideNavigation(false)
      setAppMargin(100)
    } else if (router.pathname !== '/partnerships/[pid]/workflows/[workflowId]' ){
      setHideNavigation(false)
      if (appMargin === 0){
        setAppMargin(225)
      }
    }
  }, [router.pathname])

  return (
    <>
      <Head>
        <title>Tandem</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <AppContext.Provider
        value={{
          state: { 
            organization: organization,
            dbUser: dbUser,
            hideNavigation: hideNavigation
          },
          setOrganization: setOrganization,
          setDbUser: setDbUser,
          setHideNavigation: setHideNavigation
        }}
        >
        <MantineProvider
          withCSSVariables
          withGlobalStyles
          withNormalizeCSS
          theme={{
            components: {
              Input:{
                styles: {
                  input: {
                    fontFamily: "Visuelt"
                  },
                  value: {
                    fontFamily: "Visuelt"
                  }
                }
              }
            }
          }}
        >
          <UserProvider>
          <div style={{display:'flex'}}>
            {
              hideNavigation ? null : <Navigation setIsOpened={setIsOpened} isOpened={isNavOpen} />
            }
          <Container size="xl" style={{width: '100%', marginLeft: appMargin}}>
            <Component {...pageProps} /> 
          </Container>
          </div>
          </UserProvider> 
          <CustomFonts />
        </MantineProvider>
      </AppContext.Provider>
    </>

  );
}