import expect from 'expect'
import matchPath from '../matchPath'

describe('matchPath', () => {
  describe('with path="/"', () => {
    it('returns correct url at "/"', () => {
      const path = '/'
      const pathname = '/'
      const match = matchPath(pathname, path)
      expect(match.url).toBe('/')
    })

    it('returns correct url at "/somewhere/else"', () => {
      const path = '/'
      const pathname = '/somewhere/else'
      const match = matchPath(pathname, path)
      expect(match.url).toBe('/')
    })
  })

  describe('with path="/somewhere"', () => {
    it('returns correct url at "/somewhere"', () => {
      const path = '/somewhere'
      const pathname = '/somewhere'
      const match = matchPath(pathname, path)
      expect(match.url).toBe('/somewhere')
    })

    it('returns correct url at "/somewhere/else"', () => {
      const path = '/somewhere'
      const pathname = '/somewhere/else'
      const match = matchPath(pathname, path)
      expect(match.url).toBe('/somewhere')
    })
  })

  describe('cache', () => {
    it('creates a cache entry for each exact/strict pair', () => {
      // true/false and false/true will collide when adding booleans
      const trueFalse = matchPath(
        '/one/two',
        { path: '/one/two/', exact : true, strict: false }
      )
      const falseTrue = matchPath(
        '/one/two',
        { path: '/one/two/', exact : false, strict: true }
      )
      expect(!!trueFalse).toBe(true)
      expect(!!falseTrue).toBe(false)
    })
  })

  describe('no path', () => {
    it('returns the parent match', () => {
      const path = '/robert-frost'
      const parentMatch = {
        url: '/path-less-taken',
        path: '/:pun',
        params: { pun: 'path-less-taken' },
        isExact: true
      }
      const match = matchPath(path, {}, parentMatch)
      expect(match).toEqual(parentMatch)
    })

    it('returns a default match when parent match is falsy', () => {
      const path = '/robert-frost'
      const match = matchPath(path, {})
      expect(match).toEqual({
        url: path,
        params: {},
        isExact: true,
        parents: []
      })
    })
  })

  describe('parent match', () => {

    it('prepends parent match\'s url to match.parents', () => {
      const path = '/poet/jack-prelutsky/:poem'
      const pathname = '/poet/jack-prelutsky/a-pizza-the-size-of-the-sun'
      const parentMatch = {
        url: '/poet/jack-prelutsky',
        path: '/poet/:poet',
        params: { poet: 'jack-prelutsky' },
        isExact: true,
        parents: ['/poet']
      }
      const match = matchPath(pathname, { path }, parentMatch)
      expect(match.parents).toEqual(['/poet/jack-prelutsky', '/poet'])
    })

    it('does not prepend parent match\'s url when it is the same as the matched url', () => {
      const parent = { url: '/first/second', parents: [ '/first' ] }
      const match = matchPath(
        '/first/second',
        { path: '/first/second' },
        parent
      )
      expect(match.parents).toEqual([ '/first' ])
    })
  })

  describe('absolute path', () => {   
    it('does not merge parent params', () => {
      const parentMatch = {
        url: '/state/GA',
        path: '/state/:abbr',
        params: { abbr: 'GA' },
        isExact: true
      }
      const match = matchPath(
        '/state/GA',
        { path: '/state/GA' },
        parentMatch
      )

      expect(match.params.abbr).toBe(undefined)
    })

  })

  describe('relative path', () => {
    it('resolves using parentMatch.url before matching', () => {
      const parentMatch = {
        url: '/state',
        path: '/state',
        params: {},
        isExact: false
      }
      const match = matchPath(
        '/state/WI',
        { path: 'WI' },
        parentMatch
      )
      expect(match).toNotBe(null)
      expect(match.url).toBe('/state/WI')
    })

    it('merges parentMatch.params into match.params', () => {
      const parentMatch = {
        url: '/state/CO',
        path: '/state/:state',
        params: { state: 'CO' },
        isExact: false
      }
      const match = matchPath(
        '/state/CO/Denver',
        { path: ':city' },
        parentMatch
      )
      
      expect(match.params).toIncludeKeys(['state', 'city'])
    })

    it('works when parentMatch.url has trailing slash', () => {
      const parentMatch = {
        url: '/state/',
        path: '/state/',
        params: {},
        isExact: false
      }
      const match = matchPath(
        '/state/OR',
        { path: ':state' },
        parentMatch
      )
      
      expect(match.url).toBe('/state/OR')
      expect(match.path).toBe('/state/:state')
    })

    it('will fail when parentMatch is null', () => {
      const match = matchPath(
        '/state/CA',
        { path: 'state/:state' },
        null
      )
      
      expect(match).toBe(null)
    })

    describe('with path=""', () => {
      it('matches using parentMatch.url', () => {
        const parentMatch = {
          url: '/state',
          path: '/state',
          params: {},
          isExact: false
        }
        const match = matchPath(
          '/state/WA',
          { path: '' },
          parentMatch
        )
        
        expect(match.url).toBe('/state')
        expect(match.path).toBe('/state')
      })

      it('exact=true, but pathname is not exact', () => {
        const parentMatch = {
          url: '/state',
          path: '/state',
          params: {},
          isExact: false
        }
        const match = matchPath(
          '/state/WY',
          {
            path: '',
            exact: true
          },
          parentMatch
        )
        expect(match).toBe(null)
      })

      it('exact=true, and pathname is exact', () => {
        const parentMatch = {
          url: '/state',
          path: '/state',
          params: {},
          isExact: false
        }
        const match = matchPath(
          '/state',
          {
            path: '',
            exact: true
          },
          parentMatch
        )

        expect(match.url).toBe('/state')
        expect(match.path).toBe('/state')
      })
    })

  })
})
