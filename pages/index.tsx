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
        <section className={styles.chart_info_card}>
          <p className={styles.card_title}>Living Reduction</p><p className={styles.card_year}>, 2022</p>
          <p className={styles.card_medium}>D3 in Next.js</p>
          <p className={styles.card_description}>{`Reduction of Chloe's life to professional relevancy. Chloe's data visualization experience comes from a career in sensor R&D and manufacturing where Tableau, Python, Minitab, Excel, and SQL were used to realize product insights and motivate changes.`}</p>
          <p className={styles.card_instructions}>Instructions: Find the hidden link to proceed.</p>
        </section>
      </main>
    </div>
  )
}

export default Home
