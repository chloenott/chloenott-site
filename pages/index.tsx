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
        <h1 className={styles.title}>
          hi, i&apos;m chloe.
        </h1>
      </main>
    </div>
  )
}

export default Home
