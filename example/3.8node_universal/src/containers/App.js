import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

/* generic styles */
import normalize from '../styles/normalize.css'
import base from '../styles/base.css'
// Object.assign(normalize, base)

import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

function App({ pushPath, children }) {
  return (
    <div>
      <Header />
      <main>      
        {children}
      </main>
      <Footer />
    </div>

  );
};

module.exports = connect(
  null
)(App)