import type {NextPage} from 'next'
import Head from 'next/head'
import Landing from './landing'

const Index: NextPage = () => {
  return(
    <div>
      <Head>
        <title>Login Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
     <div>
       <Landing/>
      </div>
    </div>
  ) 
}

export default Index