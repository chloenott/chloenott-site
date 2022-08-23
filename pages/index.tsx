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
      </main>
    </div>
  )
}

export default Home
