import styles from '../styles/header.module.css';
import Link from 'next/link';
import Head from 'next/head';

const Header = () => {
  return (
    <>
      <Head>
        <title>chloenott.xyz</title>
        <meta name="Chloe Nott" content="So we meet again..." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" /> 
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.title_container}>
        <Link href="/" className={styles.homeLink}><img width="75" height="75" src="/titleicon.svg"></img></Link>
        <div className={styles.logo_block}>
          <a href="https://github.com/chloenott"><img width="35" height="35" src="/icons/iconmonstr-github-2.svg" alt="GitHub logo"></img></a>
          <a href="https://www.linkedin.com/in/chloenott/"><img width="35" height="35" src="/icons/iconmonstr-linkedin-2.svg" alt="LinkedIn logo"></img></a>
        </div>
      </div>
    </>
  )
}

export default Header

