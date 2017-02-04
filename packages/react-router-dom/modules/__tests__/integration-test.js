import expect from 'expect'
import React from 'react'
import ReactDOM from 'react-dom'
import { Simulate } from 'react-addons-test-utils'
import MemoryRouter from 'react-router/MemoryRouter'
import Link from '../Link'
import Route from 'react-router/Route'
import Switch from 'react-router/Switch'

describe('Integration Tests', () => {
  describe('clicking a relative <Link>', () => {
    it('navigates correctly', () => {
      const node = document.createElement('div')
      const initialEntries = ['/', '/recipes']
      const RESTAURANTS = 'RESTAURANTS'
      ReactDOM.render((
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
          <Switch>
            <Route path='/recipes' render={() => (
              <Link to='../restaurants'>Order Takeout</Link>
            )} />
            <Route path='/restaurants' render={() => (
              <div>{RESTAURANTS}</div>
            )} />
          </Switch>
        </MemoryRouter>
      ), node)
      expect(node.textContent).toNotContain(RESTAURANTS)
      const a = node.getElementsByTagName('a')[0]
      Simulate.click(a, {
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true },
        metaKey: null,
        altKey: null,
        ctrlKey: null,
        shiftKey: null,
        button: 0
      })
      expect(node.textContent).toContain(RESTAURANTS)
    })
  })  
})
