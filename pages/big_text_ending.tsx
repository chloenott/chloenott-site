import React from "react";
import type { NextPage } from 'next';
import styles from '../styles/big_text_ending.module.css';
import Router from 'next/router';

const BigTextPage: NextPage = () => {

  if (typeof window !== "undefined") {
    let maxTimerId = window.setTimeout(() => {}, 0);
    while (maxTimerId) {
      maxTimerId--;
      window.clearTimeout(maxTimerId);
    }
    
    setTimeout(() => {
      Router.push('/living_reduction')
    }, 11000);
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <p className={styles.bigText_NOW}>NOW</p>
        <p className={styles.bigText_SIT_BACK}>SIT BACK</p>
        <p className={styles.bigText_RELAX}>RELAX</p>
        <p className={styles.bigText_AND}>AND</p>
        <p className={styles.bigText_EXPECTATIONS}>(YOU HAVE NO IDEA WHAT TO EXPECT, HUH)</p>
      </main>
    </div>
  )
}

export default BigTextPage;
