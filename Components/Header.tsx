import styles from '../styles/header.module.css';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

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
        <Link href="/particle_image" className={styles.homeLink}>
            <Image priority={true} width={75} height={75} src="/titleicon.png" alt="Home link, icon combo" />
        </Link>
        <div className={styles.logo_block}>
          <Link href="https://github.com/chloenott">
              <Image className={styles.logos} width={35} height={35} src="/iconmonstr-github-2.svg" alt="GitHub link, icon combo" />
          </Link>
          <Link href="https://www.linkedin.com/in/chloenott/">
              <Image className={styles.logos} width={35} height={35} src="/iconmonstr-linkedin-2.svg" alt="LinkedIn link, icon combo" />
          </Link>
        </div>
      </div>
    </>
  )
}

export default Header

