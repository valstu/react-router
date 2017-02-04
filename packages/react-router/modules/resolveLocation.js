const resolveLocation = (location, parentMatch) => {
  // when the parent match is null (<Route children>),
  // we are unable to resolve the location
  if (parentMatch == null)
    return location

  if (location == null) {
    return parentMatch.url
  } else if (typeof location === 'string') {
    return join(location, parentMatch)
  } else {
    return {
      ...location,
      pathname: join(location.pathname, parentMatch)
    }
  }
}

const join = (pathname, match) => {
  if (isAbsolute(pathname))
    return pathname
  else if (pathname == null)
    return match.url

  const { remainingPathname, count } = removeDoubleDots(pathname)
  const resolvedBase = getParentMatch(match, count)

  const resolvedPathname = addTrailingSlash(resolvedBase) + remainingPathname

  return noTrailingSlash(pathname, resolvedBase)
    ? stripTrailingSlash(resolvedPathname)
    : resolvedPathname
}

const getParentMatch = (match, depth) => {
  if (depth === 0) {
    return match.url
  }
  // if the double-dot count is greater than the known parents,
  // we will just resolve as if the base is the root
  const parentURL = match.parents[depth-1]
  return parentURL ? parentURL : '/'
}

const isAbsolute = pathname => !!(pathname && pathname.charAt(0) === '/')

// Count the number of ..'s at the beginning of the pathname
// to determine how many "levels" of parents we should go to figure out
// the correct parent match.url to resolve against. This also returns
// the pathname with the double-dots segments removed
const removeDoubleDots = pathname => {
  let remainingPathname = pathname
  let count = 0
  while (remainingPathname.substring(0, 2) === '..') {
    count++
    // also remove the forward slash
    const removeCount = remainingPathname.charAt(2) === '/' ? 3 : 2
    remainingPathname = remainingPathname.slice(removeCount)
  }
  return {
    remainingPathname,
    count
  }
}

const addTrailingSlash = pathname =>
  hasTrailingSlash(pathname) ? pathname : pathname + '/'

const hasTrailingSlash = pathname => 
  !!pathname && pathname.charAt(pathname.length-1) === '/'

// If neither the to or from paths had a trailing slash, then
// the returned pathname should not have one either. This is an issue
// with falsy pathnames like '' and undefined and dot notation paths (./ and ../)
const noTrailingSlash = (to, from) =>  !hasTrailingSlash(to) && !hasTrailingSlash(from)

const stripTrailingSlash = pathname => 
  pathname.length > 1 && hasTrailingSlash(pathname) ? pathname.slice(0, -1) : pathname

export default resolveLocation
