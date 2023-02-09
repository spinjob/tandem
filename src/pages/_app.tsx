import { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import {CustomFonts} from '../../Global.js'
import "../styles/global.css"

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    
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
            <Component {...pageProps} />
          </UserProvider>
        <CustomFonts />
      </MantineProvider>

  );
}