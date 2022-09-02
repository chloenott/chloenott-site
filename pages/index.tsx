import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import Header from '../Components/Header'

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.breathe_container}>
          <Link href="/living_reduction">
            <a>
              <svg viewBox="0 0 25 25" className={styles.title_circle}>
                <circle cx='12.5px' cy='12.5px' r='12.5px' shapeRendering="geometricPrecision" />
              </svg>
            </a>
          </Link>
          <p className={styles.breathe_instructions_1}>Breathe with the dot.</p>
          <p className={styles.breathe_instructions_2}>Click to proceed.</p>
        </div>
      </main>
    </div>
  )
}

export default Home
