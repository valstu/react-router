import expect from 'expect'
import resolveLocation from '../resolveLocation'

describe('resolveLocation', () => {
  const BaseMatch = { url: '/a/b', parents: [ '/a' ] }

  describe('bad matches', () => {
    const cases = [
      null,
      undefined
    ]

    cases.forEach(c => {
      it(`returns the location when match is ${c}`, () => {
        const location = { pathname: 'no-base' }
        expect(resolveLocation(location, c)).toEqual(location)
      })
    })
  })

  describe('joining a relative path', () => {
    it('correctly joins path to base match\'s url', () => {
      const pathname = resolveLocation('c', BaseMatch)
      expect(pathname).toBe('/a/b/c')
    })

    it('doesn\'t add an extra slash when joining', () => {
      const pathname = resolveLocation('c', { url: '/a/b/' })
      expect(pathname).toBe('/a/b/c')
    })
  })

  describe('double-dot notation relative paths', () => {
    it('uses match.parents array to determine url to resolve with', () => {
      const pathname = resolveLocation('../where', BaseMatch)
      expect(pathname).toBe('/a/where')
    })

    it('resolves with / when there are more double-dots than parents', () => {
      const pathname = resolveLocation('../../where', BaseMatch)
      expect(pathname).toBe('/where')
    })
  })

  describe('undefined location', () => {
    it('returns the parent match\'s url', () => {
      expect(resolveLocation(undefined, BaseMatch)).toEqual(BaseMatch.url)
    })
  })

  describe('string location', () => {
    it('returns a string', () => {
      const path = 'recipes'
      expect(resolveLocation(path, BaseMatch)).toBeA('string')
    })

    it('works for absolute pathnames', () => {
      const path = '/recipes'
      expect(resolveLocation(path, BaseMatch)).toBe(path)
    })
  })

  describe('object location', () => {
    it('returns an object with a pathname', () => {
      const location = { pathname: 'recipes' }
      const retLocation = resolveLocation(location)
      expect(retLocation).toBeA('object')
      expect(retLocation).toIncludeKey('pathname')
    })

    it('works for absolute pathname', () => {
      const location = { pathname: '/recipes' }
      expect(resolveLocation(location).pathname).toBe(location.pathname)
    })

    it('resolves to base match\'s url when there is no pathname', () => {
      const locations = [
        { search: '?c=d' },
        { hash: '#recipes' },
        {}
      ]
      locations.forEach(d => {
        expect(resolveLocation(d, BaseMatch).pathname).toBe(BaseMatch.url)
      })
    })
  })

  describe('trailing slash', () => {
    it('retains trailing slash of parent match when pathname is "empty"', () => {
      // this is mostly useful for dot notation and empty pathnames
      const cases = [
        // base without trailing slash
        [{ url: '/base' }, '', '/base'],
        [{ url: '/base/nested', parents: [ '/base' ]  }, '..', '/base'],
        [{ url: '/base/nested', parents: [ '/base' ]  }, '../', '/base/'],
        // base with trailing slash
        [{ url: '/base/' }, '', '/base/'],
        [{ url: '/base/nested', parents: [ '/base/' ] }, '..', '/base/'],
        [{ url: '/base/nested', parents: [ '/base/' ]  }, '../', '/base/'],
      ]
      cases.forEach(([base, pathname, expected]) => {
        expect(resolveLocation(pathname, base)).toEqual(expected)
      })
      
    })
  })
})
