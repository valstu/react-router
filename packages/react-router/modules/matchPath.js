import pathToRegexp from 'path-to-regexp'

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
      : { url: pathname, isExact: true, params: {}, parents: [] }

  if (isRelative)
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
    parents: joinParentURLs(url, parentMatch)
  }
}

// We do not want the same URL to be duplicated in the parents array
// so we must verify that the matched URL is not the same as the parent URL
const joinParentURLs = (url, match) => {
  if (match == null) {
    return []
  }
  return url === match.url ? match.parents : [match.url].concat(match.parents)
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
