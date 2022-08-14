import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>chloe nott</title>
        <meta name="chloe nott" content="so we meet again..." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.title_container}>
          <h1 className={styles.title}>
            Chloe Nott
          </h1>
          <h2 className={styles.subtitle}>
            Personal Website
          </h2>
        </div>
      </main>
    </div>
  )
}

export default Home
