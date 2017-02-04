import React, { PropTypes } from 'react'
import resolveLocation from './resolveLocation'

/**
 * The public API for updating the location programatically
 * with a component.
 */
class Redirect extends React.Component {
  static contextTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
      staticContext: PropTypes.object
    }).isRequired,
    route: PropTypes.shape({
      match: PropTypes.shape({
        url: PropTypes.string
      })
    })
  }

  static propTypes = {
    push: PropTypes.bool,
    to: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ])
  }

  static defaultProps = {
    push: false
  }

  componentWillMount() {
    if (this.context.history.staticContext)
      this.perform()
  }

  componentDidMount() {
    if (!this.context.history.staticContext)
      this.perform()
  }

  perform() {
    const { history, route } = this.context
    const { push, to } = this.props
    const loc = resolveLocation(to, route.match)
    if (push) {
      history.push(loc)
    } else {
      history.replace(loc)
    }
  }

  render() {
    return null
  }
}

export default Redirect
