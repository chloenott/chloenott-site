import type { NextPage } from 'next';
import styles from '../styles/living_reduction.module.css';
import LivingReductionGraph from '../Components/LivingReductionGraph';

const LivingReductionPage: NextPage = () => {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <LivingReductionGraph />
        <section className={styles.chart_info_card} id="chart_info_card">
          <p className={styles.card_title}>Chloe Nott</p><p className={styles.card_year}> 2022</p>
          <p className={styles.card_medium}>D3 in Next.js</p>
          <p className={styles.card_description}>{`Chloe reduced to keywords. Their data visualization experience comes from sensor R&D and manufacture. Tableau, Python, Minitab, Excel, and SQL were used to create change.`}</p>
          <p className={styles.card_instructions}><strong>Step 2: </strong>Use the hidden link.</p>
        </section>
      </main>
    </div>
  )
}

export default LivingReductionPage;
