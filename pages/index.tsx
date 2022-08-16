import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Chart from './chart'

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      
      <Head>
        <title>chloe nott</title>
        <meta name="chloe nott" content="so we meet again..." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <div className={styles.title_container}>
          <p className={styles.description}>Disclaimer: This Site is in WIP</p>
          <h1 className={styles.title}>
            Chloe Nott
          </h1>
          <h2 className={styles.subtitle}>
            Personal Website
          </h2>
        </div>
        <div className={styles.logo_block}>
          <a href="https://www.linkedin.com/in/chloenott/"><img src="/icons/iconmonstr-linkedin-2.svg" alt="LinkedIn logo"></img></a>
          <a href="https://github.com/chloenott"><img src="/icons/iconmonstr-github-2.svg" alt="GitHub logo"></img></a>
        </div>
      </header>

      <main className={styles.main}>
        <Chart />
      </main>

    </div>
  )
}

export default Home
