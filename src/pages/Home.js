import React, { Suspense, lazy } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import styled from 'styled-components'

import AssetSelector from '../components/AssetSelector'
import { ReferralWhiteList } from '../constants'

const AssetDashboard = lazy(() => import('../components/AssetDashboard'))
const AssetOverview = lazy(() => import('../components/AssetOverview'))

const AppWrapper = styled.div`
  ${({ theme }) => theme.mediaQuery.lg`
    padding-top: 20px;
    display: flex;
  `}
`

const NavWrapper = styled.div`
  width: 100%;

  ${({ theme }) => theme.mediaQuery.lg`
    max-width: 248px;
    margin-right: 48px;
  `}
`

const MainWrapper = styled.div`
  margin-top: 32px;

  ${({ theme }) => theme.mediaQuery.lg`
    margin-top: 0;
    flex: 1;
  `}
`

export default function Home() {
  return (
    <AppWrapper>
      <NavWrapper>
        <AssetSelector />
      </NavWrapper>
      <MainWrapper>
        <Suspense fallback={null}>
          <Switch>
            <Route exact strict path='/overview'>
              <AssetOverview />
            </Route>
            {// old referral links
            Object.keys(ReferralWhiteList).map(name => (
              <Redirect
                key={name}
                exact
                strict
                from={`/${name}`}
                to={`/sai/compound?referral=${name}`}
              />
            ))}
            <Route exact strict path='/:token/:platform'>
              <AssetDashboard />
            </Route>
            <Redirect to='/overview' />
          </Switch>
        </Suspense>
      </MainWrapper>
    </AppWrapper>
  )
}
