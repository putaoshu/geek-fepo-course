import React, { Component } from 'react'
import { Link } from 'react-router'

class Home extends Component {
  constructor (props) {
    super(props)
  }

  render () {
      return (
        <p>
    			<a href="https://api.ooopn.com/weather/api.php?city=北京">北京</a> | <a href="https://api.ooopn.com/weather/api.php?city=上海">上海</a> | <a href="https://api.ooopn.com/weather/api.php?city=广州">广州</a> | <a href="https://api.ooopn.com/weather/api.php?city=深圳">深圳</a>
        </p>
      )
  }
}

export default Home