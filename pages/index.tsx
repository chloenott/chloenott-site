import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import Header from '../Components/Header'

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Link href="/living_reduction">
          <a>
            <svg viewBox="0 0 25 25" className={styles.title_circle}>
              <circle cx='12.5px' cy='12.5px' r='12.5px' shapeRendering="geometricPrecision" />
            </svg>
          </a>
        </Link>
      </main>
    </div>
  )
}

export default Home
