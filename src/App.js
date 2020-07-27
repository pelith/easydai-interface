import React, { Suspense } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { ethers } from 'ethers'
import styled from 'styled-components'
import ApplicationContextProvider, {
  Updater as ApplicationContextUpdater,
} from './contexts/Application'
import BondsContextProvider from './contexts/Bonds'
import BalancesContextProvider from './contexts/Balances'
import AllowancesContextProvider from './contexts/Allowances'
import BondExchangeRatesContextProvider from './contexts/BondExchangeRates'
import GatewaysContextProvider from './contexts/Gateways'
import DialogsProvider, { Dialogs } from './contexts/Dialogs'
import Web3Manager from './components/Web3Manager'
import AppLoader from './components/AppLoader'
import Banner from './components/Banner'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Faq from './pages/Faq'
import Comp from './pages/Comp'
import ThemeProvider, { GlobalStyle } from './themes'
import { NetworkContextName } from './constants'

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/pelith/easydai',
  cache: new InMemoryCache(),
})

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}

function ContextProviders({ children }) {
  return (
    <ApplicationContextProvider>
      <BondsContextProvider>
        <BalancesContextProvider>
          <AllowancesContextProvider>
            <BondExchangeRatesContextProvider>
              <GatewaysContextProvider>{children}</GatewaysContextProvider>
            </BondExchangeRatesContextProvider>
          </AllowancesContextProvider>
        </BalancesContextProvider>
      </BondsContextProvider>
    </ApplicationContextProvider>
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
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3Manager>
            <ContextProviders>
              <Updaters />
              <ThemeProvider>
                <GlobalStyle />
                <Router />
              </ThemeProvider>
            </ContextProviders>
          </Web3Manager>
        </Web3ReactProvider>
      </Web3ProviderNetwork>
    </ApolloProvider>
  )
}

export default App
