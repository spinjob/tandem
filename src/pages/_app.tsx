import { AppProps } from "next/app";
import { Container, MantineProvider } from "@mantine/core";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import AppContext from '../context/AppContext';
import {CustomFonts} from '../../Global.js'
import {useState, useEffect} from 'react'
import "../styles/global.css"
import Navigation from "@/components/Navbar.js";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [organization, setOrganization] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [pathHistory, setPathHistory] = useState([])
  const [isNavOpen,setIsNavOpen] = useState(false)
  const [appMargin, setAppMargin] = useState(300)

  const setIsOpened = (opened: boolean) => {
    setIsNavOpen(opened)
    if(opened){
      setAppMargin(300)
    }else{
      setAppMargin(100)
    }
  }

  useEffect(() => {
    if (isNavOpen === false) {
      setAppMargin(100)
    } else {
      setAppMargin(300)
    }
  }, [isNavOpen])

  return (
    <AppContext.Provider
      value={{
        state: { 
          organization: organization,
          dbUser: dbUser
        },
        setOrganization: setOrganization,
        setDbUser: setDbUser
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
        <Navigation setIsOpened={setIsOpened} isOpened={isNavOpen} />
        <Container size="xl" style={{width: '100%', marginLeft: appMargin}}>
          <Component {...pageProps} /> 
        </Container>
        </div>
        </UserProvider> 
        <CustomFonts />
      </MantineProvider>
      </AppContext.Provider>
       
  );
}