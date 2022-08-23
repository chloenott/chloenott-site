import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Head from 'next/head';

const Header = () => {
  return (
    <>
      <Head>
        <title>chloenott.xyz</title>
        <meta name="chloe nott" content="so we meet again..." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" /> 
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.title_container}>
        <p className={styles.description}>Disclaimer: This Site is in WIP</p>
        <h1 className={styles.title}>
          <Link href="/" className={styles.homeLink}>Chloe Nott</Link>
        </h1>
        <h2 className={styles.subtitle}>
          Personal Website
        </h2>
      </div>
      <div className={styles.logo_block}>
        <a href="https://www.linkedin.com/in/chloenott/"><img src="/icons/iconmonstr-linkedin-2.svg" alt="LinkedIn logo"></img></a>
        <a href="https://github.com/chloenott"><img src="/icons/iconmonstr-github-2.svg" alt="GitHub logo"></img></a>
      </div>
    </>
  )
}

export default Header

