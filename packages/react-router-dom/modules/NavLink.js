import React, { PropTypes } from 'react'
import {
  Route,
  resolveLocation
} from 'react-router'
import Link from './Link'

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
const NavLink = ({
  to,
  exact,
  strict,
  activeClassName,
  className,
  activeStyle,
  style,
  isActive: getIsActive,
  ...rest
}, { route }) => {
  const resolvedTo = resolveLocation(to, route.match)
  const path = typeof resolvedTo === 'object' ? resolvedTo.pathname : resolvedTo
  return (
    <Route
      path={path}
      exact={exact}
      strict={strict}
      children={({ location, match }) => {
        const isActive = !!(getIsActive ? getIsActive(match, location) : match)

        return (
          <Link
            to={resolvedTo}
            className={isActive ? [ activeClassName, className ].join(' ') : className}
            style={isActive ? { ...style, ...activeStyle } : style}
            {...rest}
          />
        )
      }}
    />
  )
}

NavLink.propTypes = {
  to: Link.propTypes.to,
  exact: PropTypes.bool,
  strict: PropTypes.bool,
  activeClassName: PropTypes.string,
  className: PropTypes.string,
  activeStyle: PropTypes.object,
  style: PropTypes.object,
  isActive: PropTypes.func
}

NavLink.contextTypes = {
  route: PropTypes.shape({
    match: PropTypes.object
  })
}

export default NavLink
