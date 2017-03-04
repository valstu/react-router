import pathToRegexp from 'path-to-regexp'
import warning from 'warning'

const patternCache = {}
const cacheLimit = 10000
let cacheCount = 0

const compilePath = (pattern, options) => {
  const cacheKey = `${options.end}${options.strict}`
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {})

  if (cache[pattern])
    return cache[pattern]

  const keys = []
  const re = pathToRegexp(pattern, keys, options)
  const compiledPattern = { re, keys }

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern
    cacheCount++
  }

  return compiledPattern
}

/**
 * Public API for matching a URL pathname to a path pattern.
 */
const matchPath = (pathname, options = {}, parentMatch) => {
  if (typeof options === 'string')
    options = { path: options }

  const { exact = false, strict = false } = options
  let path = options.path != null ? options.path : options.from
  const isRelative = !isAbsolute(path)

  // a pathless route returns its parent match
  if (path == null)
    return parentMatch != null
      ? parentMatch
      : { url: pathname, isExact: true, params: {}, parent: null }

  warning(
    !(isRelative && parentMatch == null),
    'Relative paths will not be resolved when their parent match is null. You are most likely attempting to use a relative path inside of a parent <Route> that has a "children" prop, but that <Route>\'s path does not match the current location.'
  )

  // attempting to resolve when parent match is null is a losing battle
  if (isRelative && parentMatch != null)
    path = resolvePath(path, parentMatch)

  const { re, keys } = compilePath(path, { end: exact, strict })
  const match = re.exec(pathname)

  if (!match)
    return null

  const [ matchedURL, ...values ] = match
  const isExact = pathname === matchedURL

  if (exact && !isExact)
    return null

  const url = path === '/' && matchedURL === '' ? '/' : matchedURL

  const matchParams = keys.reduce((memo, key, index) => {
    memo[key.name] = values[index]
    return memo
  }, {})

  // merge parent match's params for relative paths
  // this allows resolving using parent match's url instead of path
  const params = isRelative
    ? Object.assign({}, parentMatch && parentMatch.params, matchParams)
    : matchParams

  return {
    path, // the path pattern used to match
    url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params,
    parent: getParent(url, parentMatch)
  }
}

// When the matched URL is the same as the parent match's URL
// we should link to that match's parent so that double-dot relative
// paths always resolve "up" the hierarchy, not "sideways".
// i.e., given the match url tree:
//   / -> /test -> /test/ing
// If we resolve the path ../ed, we would get the URL /test/ed
// However, if we allowed for duplicate URLs to show up in the tree:
//   / -> /test -> /test/ing -> /test/ing
// 
const getParent = (url, match) => {
  if (match == null)
    return null

  return url === match.url ? match.parent : match
}

const resolvePath = (pathname, match) => {
  if (pathname == null || isAbsolute(pathname))
    return pathname

  if (match == null)
    return pathname

  const base = match.url
  return pathname === '' ? base : `${addTrailingSlash(base)}${pathname}`
}

const isAbsolute = pathname => !!(pathname && pathname.charAt(0) === '/')

const addTrailingSlash = pathname =>
  hasTrailingSlash(pathname) ? pathname : pathname + '/'

const hasTrailingSlash = pathname => 
  !!pathname && pathname.charAt(pathname.length-1) === '/'


export default matchPath
