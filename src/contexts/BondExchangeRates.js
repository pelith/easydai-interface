import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import BigNumber from 'bignumber.js'

import { useWeb3ReadOnly } from './Web3ReadOnly'
import { useBlockNumber } from './Application'
import { useBondDetails, useAllBondDetails } from './Bonds'
import { safeAccess, isAddress, getContract } from '../utils'
import { POT_ADDRESS } from '../constants'
import POT_ABI from '../constants/abis/pot.json'

const BondExchangeRatesContext = createContext()

export function useBondExchangeRatesContext() {
  return useContext(BondExchangeRatesContext)
}

const UPDATE = 'UPDATE'
const UPDATE_ALL = 'UPDATE_ALL'

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { chainId, tokenAddress, value, blockNumber } = payload
      return {
        ...state,
        [chainId]: {
          ...safeAccess(state, [chainId]),
          [tokenAddress]: {
            value,
            blockNumber,
          },
        },
      }
    }
    case UPDATE_ALL: {
      const { chainId, allExchangeRates } = payload
      return {
        ...state,
        [chainId]: {
          ...safeAccess(state, [chainId]),
          ...allExchangeRates,
        },
      }
    }
    default: {
      throw Error(
        `Unexpected action type in BondExchangeRatesContext reducer: '${type}'.`,
      )
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  const update = useCallback((chainId, tokenAddress, value, blockNumber) => {
    dispatch({
      type: UPDATE,
      payload: { chainId, tokenAddress, value, blockNumber },
    })
  }, [])

  const updateAll = useCallback((chainId, allExchangeRates) => {
    dispatch({
      type: UPDATE_ALL,
      payload: { chainId, allExchangeRates },
    })
  }, [])

  const value = useMemo(() => [state, { update, updateAll }], [
    state,
    update,
    updateAll,
  ])

  return (
    <BondExchangeRatesContext.Provider value={value}>
      {children}
    </BondExchangeRatesContext.Provider>
  )
}

function getBondExchangeRate(bond, library) {
  switch (bond.platform) {
    case 'Compound': {
      return getContract(bond.address, bond.abi, library)
        .methods.exchangeRateCurrent()
        .call()
        .then(result => new BigNumber(result).shiftedBy(-18))
    }
    case 'Fulcrum': {
      return getContract(bond.address, bond.abi, library)
        .methods.tokenPrice()
        .call()
        .then(result => new BigNumber(result).shiftedBy(-18))
    }
    case 'MakerDAO': {
      return getContract(POT_ADDRESS, POT_ABI, library)
        .methods.chi()
        .call()
        .then(result => new BigNumber(result).shiftedBy(-27))
    }
    default: {
      throw Error(`Unexpected bond plarform: ${bond.platform}`)
    }
  }
}

export function useBondExchangeRate(tokenAddress) {
  const { chainId, library } = useWeb3ReadOnly()
  const globalBlockNumber = useBlockNumber()
  const bond = useBondDetails(tokenAddress)

  const [state, { update }] = useBondExchangeRatesContext()
  const { value, blockNumber } =
    safeAccess(state, [chainId, tokenAddress]) || {}

  useEffect(() => {
    let stale = false
    if (
      isAddress(tokenAddress) &&
      (value === undefined || blockNumber !== globalBlockNumber) &&
      (chainId || chainId === 1)
    ) {
      getBondExchangeRate(bond, library)
        .then(value => {
          if (!stale) {
            update(chainId, tokenAddress, value, blockNumber)
          }
        })
        .catch(() => {
          if (!stale) {
            update(chainId, tokenAddress, null, blockNumber)
          }
        })
    }

    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bond, chainId, globalBlockNumber, library, tokenAddress, update])

  return value
}

export function useAllBondExchangeRates() {
  const { chainId, library } = useWeb3ReadOnly()
  const globalBlockNumber = useBlockNumber()
  const allBonds = useAllBondDetails()

  const [state, { updateAll }] = useBondExchangeRatesContext()
  const allExchangeRates = safeAccess(state, [chainId])

  const getData = async () => {
    const newExchangeRates = {}
    await Promise.all(
      Object.keys(allBonds).map(async tokenAddress => {
        if (isAddress(tokenAddress)) {
          const bond = allBonds[tokenAddress]
          const exchangeRate = await getBondExchangeRate(bond, library).catch(
            () => null,
          )

          return (newExchangeRates[tokenAddress] = {
            value: new BigNumber(exchangeRate),
            blockNumber: globalBlockNumber,
          })
        }
      }),
    )
    updateAll(chainId, newExchangeRates)
  }
  useMemo(getData, [globalBlockNumber])

  return allExchangeRates
}
