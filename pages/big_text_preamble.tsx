import React from "react";
import type { NextPage } from 'next';
import styles from '../styles/big_text_preamble.module.css';
import Router from 'next/router';

const BigTextPage: NextPage = () => {

  if (typeof window !== "undefined") {
    let maxTimerId = window.setTimeout(() => {}, 0);
    while (maxTimerId) {
      maxTimerId--;
      window.clearTimeout(maxTimerId);
    }
    
    setTimeout(() => {
      Router.push('/big_text')
    }, 12000);
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <p className={styles.bigText_BASED_ON}>BASED ON INSPIRATIONAL INFLUENCES OF</p>
        <p className={styles.bigText_MOVIE}>A POPULAR MOVIE OF CINEMATIC MASTERPIECE</p>
        <p className={styles.bigText_MMORPG}>A POPULAR CHINESE MMORPG NEVER PLAYED</p>
        <p className={styles.bigText_AND}>AND</p>
        <p className={styles.bigText_ANOTHER_MMORPG}>A UNIVERSALLY ACCLAIMED MMORPG</p>
      </main>
    </div>
  )
}

export default BigTextPage;
