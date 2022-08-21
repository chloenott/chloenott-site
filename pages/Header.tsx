import styles from '../styles/Home.module.css';
import Link from 'next/link';

const Header = () => {
  return (
    <>
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

