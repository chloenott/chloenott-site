import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Chart from './chart'
import Header from './Header'

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      
      <Head>
        <title>chloenott.xyz</title>
        <meta name="chloe nott" content="so we meet again..." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" /> 
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className={styles.main}>
        <Chart />
      </main>

    </div>
  )
}

export default Home
