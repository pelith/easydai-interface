import { useState, useMemo, useCallback, useEffect } from 'react'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'

import {
  injected as injectedConnector,
  network as networkConnector,
} from '../connectors'
import { getContract, getGasPrice, isContract } from '../utils'
import { NetworkContextName } from '../constants'

export function useWeb3React() {
  const context = useWeb3ReactCore()
  const contextNetwork = useWeb3ReactCore(NetworkContextName)

  return context.active ? context : contextNetwork
}

export function useIsContractAddress(address) {
  const { library } = useWeb3React()
  const [isContractAddress, setIsContractAddress] = useState(false)
  useEffect(() => {
    let stale = false
    isContract(address, library)
      .then(result => {
        if (!stale) {
          setIsContractAddress(result)
        }
      })
      .catch(() => {
        if (!stale) {
          setIsContractAddress(false)
        }
      })

    return () => {
      stale = true
    }
  })

  return isContractAddress
}

export function useContract(address, abi, withSignerIfPossible = true) {
  const { account, library } = useWeb3React()

  return useMemo(() => {
    try {
      return getContract(
        address,
        abi,
        library,
        withSignerIfPossible ? account : undefined,
      )
    } catch {
      return null
    }
  }, [address, abi, library, account, withSignerIfPossible])
}

export function useGasPrice() {
  const [level, setLevel] = useState('fast')
  const getPrice = useCallback(() => getGasPrice(level), [level])

  return { getPrice, setLevel }
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injectedConnector.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injectedConnector, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, [activate])

  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  useEffect(() => {
    const { ethereum } = window
    if (ethereum && !active && !error && !suppress) {
      const handleNetworkChanged = networkId => {
        activate(injectedConnector)
      }
      const handleAccountsChanged = accounts => {
        if (accounts.length > 0) {
          activate(injectedConnector)
        }
      }

      if (ethereum.on) {
        ethereum.on('networkChanged', handleNetworkChanged)
        ethereum.on('accountsChanged', handleAccountsChanged)
      }

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('networkChanged', handleNetworkChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }

    return () => {}
  }, [active, error, suppress, activate])
}

export function useReadOnlyConnect() {
  const { chainId, active } = useWeb3ReactCore()
  const {
    active: activeReadOnly,
    connector: connectorReadOnly,
    activate: activateReadOnly,
  } = useWeb3ReactCore(NetworkContextName)

  const changeChainId = useCallback(
    id => {
      if (connectorReadOnly === networkConnector) {
        connectorReadOnly.changeChainId(id)
      }
    },
    [connectorReadOnly],
  )

  useEffect(() => {
    activateReadOnly(networkConnector)
  }, [activateReadOnly])

  // chainId of read-only web3 is followed by injected connector
  useEffect(() => {
    if (active && activeReadOnly) {
      changeChainId(chainId)
    }
  }, [active, activeReadOnly, chainId, changeChainId])

  return changeChainId
}
