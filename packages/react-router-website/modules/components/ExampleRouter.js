import React, { PropTypes } from 'react'

class ExampleRouter extends React.Component {

  static contextTypes = {
    history: PropTypes.object.isRequired
  }

  static childContextTypes = {
    route: PropTypes.object
  }

  getChildContext() {
    // the ExampleRouter needs to add its own context.route so that
    // its children do not inherit the one from the fake browser
    const { location } = this.context.history
    return {
      route: {
        location,
        match: {
          path: '/',
          url: '/',
          params: {},
          isExact: location.pathname === '/'
        }
      }
    }
  }

  render() {
    const { children } = this.props
    return children ? React.Children.only(children) : null
  }
}

export default ExampleRouter
