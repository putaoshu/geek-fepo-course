import React, { Component, PropTypes } from 'react'
import styles from './Footer.css'

export default class Footer extends Component {

  constructor (props) {
    super(props)
  }
  
  render () {
    return (
    	<footer className={styles.footer}>
    		<span>Copyright © Weather.com</span>
    	</footer>
    )
  }

}
