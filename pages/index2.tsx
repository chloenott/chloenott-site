import type { NextPage } from 'next';
import styles from '../styles/index.module.css';
import Link from 'next/link';

const IndexPage: NextPage = () => {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>WELCOME</h1>
        <h2></h2>
      </main>
    </div>
  )
}

export default IndexPage;
