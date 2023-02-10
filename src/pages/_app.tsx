import { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import AppContext from '../context/AppContext';
import {CustomFonts} from '../../Global.js'
import {useState} from 'react'
import "../styles/global.css"
import Navigation from "@/components/Navbar.js";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [organization, setOrganization] = useState(null)
  const [dbUser, setDbUser] = useState(null)

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
        <div style={{display: 'flex'}}>
          {/* <Navigation/> */}
          <UserProvider>
            <Component {...pageProps} /> 
            </UserProvider>             
        </div>
        <CustomFonts />
      </MantineProvider>
      </AppContext.Provider>

  );
}