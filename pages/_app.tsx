import '../public/fonts/inter.css';
import '../public/fonts/ovo.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../Components/Layout';
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  )
}

export default MyApp
