import React, { Suspense } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import styled from 'styled-components'
import Web3ReadOnlyContextProvider from './contexts/Web3ReadOnly'
import ApplicationContextProvider, {
  Updater as ApplicationContextUpdater,
} from './contexts/Application'
import BondsContextProvider from './contexts/Bonds'
import BalancesContextProvider from './contexts/Balances'
import AllowancesContextProvider from './contexts/Allowances'
import BondExchangeRatesContextProvider from './contexts/BondExchangeRates'
import BondAPRContextProvider from './contexts/BondAPR'
import BondEarnedContextProvider from './contexts/BondEarned'
import GatewaysContextProvider from './contexts/Gateways'
import DialogsProvider, { Dialogs } from './contexts/Dialogs'
import AppLoader from './components/AppLoader'
import Banner from './components/Banner'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Faq from './pages/Faq'
import Comp from './pages/Comp'
import ThemeProvider, { GlobalStyle } from './themes'

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/pelith/easydai',
  cache: new InMemoryCache(),
})

function getLibrary(provider) {
  return new Web3(provider)
}

function ContextProviders({ children }) {
  return (
    <Web3ReadOnlyContextProvider>
      <ApplicationContextProvider>
        <BondsContextProvider>
          <BalancesContextProvider>
            <AllowancesContextProvider>
              <BondExchangeRatesContextProvider>
                <BondAPRContextProvider>
                  <BondEarnedContextProvider>
                    <GatewaysContextProvider>
                      {children}
                    </GatewaysContextProvider>
                  </BondEarnedContextProvider>
                </BondAPRContextProvider>
              </BondExchangeRatesContextProvider>
            </AllowancesContextProvider>
          </BalancesContextProvider>
        </BondsContextProvider>
      </ApplicationContextProvider>
    </Web3ReadOnlyContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <ApplicationContextUpdater />
    </>
  )
}

const AppLayout = styled.div`
  width: 100vw;
`

const Body = styled.div`
  /* min-height: calc(100vh - 400px); Header: 100px, Footer: 300px */
  padding: 0 16px;

  ${({ theme }) => theme.mediaQuery.md`
    padding: 0 64px;
  `}
`

function Router() {
  return (
    <Suspense fallback={null}>
      <AppLoader>
        <BrowserRouter>
          <DialogsProvider>
            <Dialogs />
            <AppLayout>
              <Banner />
              <Header />
              <Body>
                <Switch>
                  <Route path='/faq' component={Faq} />
                  <Route path='/comp' component={Comp} />
                  <Route path='/' component={Home} />
                </Switch>
              </Body>
              <Footer />
            </AppLayout>
          </DialogsProvider>
        </BrowserRouter>
      </AppLoader>
    </Suspense>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ContextProviders>
          <Updaters />
          <ThemeProvider>
            <GlobalStyle />
            <Router />
          </ThemeProvider>
        </ContextProviders>
      </Web3ReactProvider>
    </ApolloProvider>
  )
}

export default App
