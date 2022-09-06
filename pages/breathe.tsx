import React from "react";
import type { NextPage } from 'next';
import styles from '../styles/breathe.module.css';
import Link from 'next/link';

const BreathePage: NextPage = () => {
  
  if (typeof window !== "undefined") {
    let maxTimerId = window.setTimeout(() => {}, 0);
    while (maxTimerId) {
      maxTimerId--;
      window.clearTimeout(maxTimerId);
    }
  }
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.breathe_container}>
          <Link href="/living_reduction">
            <a>
              <svg viewBox="0 0 25 25" className={styles.title_circle}>
                <circle cx='12.5px' cy='12.5px' r='12.5px' shapeRendering="geometricPrecision" />
              </svg>
            </a>
          </Link>
          <p className={styles.breathe_instructions_1}>
            <strong>Step 1: </strong>Breathe.
          </p>
          <p className={styles.breathe_instructions_2}>Click to proceed.</p>
        </div>
      </main>
    </div>
  )
}

export default BreathePage;
