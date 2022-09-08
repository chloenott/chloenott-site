import type { NextPage } from 'next';
import styles from '../styles/living_reduction.module.css';
import LivingReductionGraph from '../Components/LivingReductionGraph';

const LivingReductionPage: NextPage = () => {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <LivingReductionGraph />
      </main>
    </div>
  )
}

export default LivingReductionPage;
