import React, { createContext, useContext, useMemo } from 'react'
import Web3 from 'web3'

const Web3ReadOnlyContext = createContext()

export function useWeb3ReadOnly() {
  return useContext(Web3ReadOnlyContext)
}

export default function Provider({ children }) {
  const library = useMemo(
    () =>
      new Web3(process.env.REACT_APP_NETWORK_URL, null, {
        transactionPollingTimeout: 8000,
      }),
    [],
  )
  const value = useMemo(() => ({ library, chainId: 1 }), [library])

  return (
    <Web3ReadOnlyContext.Provider value={value}>
      {children}
    </Web3ReadOnlyContext.Provider>
  )
}
