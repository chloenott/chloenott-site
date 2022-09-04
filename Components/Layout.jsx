// components/layout.js

import Header from '../Components/Header'

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}