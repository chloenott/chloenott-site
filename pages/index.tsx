import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

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
          <p className={styles.description}>Software Developer, B.Sc. Physics</p>
          <h1 className={styles.title}>
            Chloe Nott
          </h1>
          <h2 className={styles.subtitle}>
            Personal Website
          </h2>
        </div>
        <div className={styles.section_pagewidth}>
          <section className={styles.section_block}>
            <h2 className={styles.section_title}>Welcome</h2>
            <p className={styles.section_paragraph}>I really like Gundam Unicorn...</p>
          </section>
          <section className={styles.section_block}>
            <div className={styles.logo_block}>
            <a href="https://www.linkedin.com/in/chloenott/"><img src="/icons/iconmonstr-linkedin-2.svg" alt="LinkedIn logo"></img></a>
            <a href="https://github.com/chloenott"><img src="/icons/iconmonstr-github-2.svg" alt="GitHub logo"></img></a>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Home
