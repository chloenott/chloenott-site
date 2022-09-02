import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import Chart from '../Components/Graph'
import Header from '../Components/Header'

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Chart />
        <section className={styles.chart_info_card} id="chart_info_card">
          <p className={styles.card_title}>Chloe Nott</p><p className={styles.card_year}> 2022</p>
          <p className={styles.card_medium}>D3 in Next.js</p>
          <p className={styles.card_description}>{`Chloe reduced to keywords. Their data visualization experience comes from sensor R&D and manufacture. Tableau, Python, Minitab, Excel, and SQL were used to create change.`}</p>
          <p className={styles.card_instructions}>Use the hidden link to proceed.</p>
        </section>
      </main>
    </div>
  )
}

export default Home
