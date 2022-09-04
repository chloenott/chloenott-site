import '../public/fonts/inter.css'
import '../public/fonts/ovo.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../Components/Header'
import Layout from '../Components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
