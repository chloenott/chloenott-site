import React from "react";
import type { NextPage } from 'next';
import styles from '../styles/big_text.module.css';
import Router from 'next/router';

const BigTextPage: NextPage = () => {

  if (typeof window !== "undefined") {
    let maxTimerId = window.setTimeout(() => {}, 0);
    while (maxTimerId) {
      maxTimerId--;
      window.clearTimeout(maxTimerId);
    }
    
    setTimeout(() => {
      Router.push('/breathe')
    }, 8200);
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <p className={styles.bigText_THIS}>THIS</p>
        <p className={styles.bigText_IS}>IS</p>
        <p className={styles.bigText_THE}>THE</p>
        <p className={styles.bigText_2022}>2022</p>
        <p className={styles.bigText_PERSONAL_WEBSITE}><span className={styles.bigText_PERSONAL}>PERSONAL</span><br></br><span className={styles.bigText_WEBSITE}>WEBSITE</span></p>
        <p className={styles.bigText_OF}>OF</p>
        <p className={styles.bigText_CHLOE_NOTT}><span className={styles.bigText_CHLOE}>CHLOE</span><br></br><span className={styles.bigText_NOTT}>NOTT</span></p>
      </main>
    </div>
  )
}

export default BigTextPage;
