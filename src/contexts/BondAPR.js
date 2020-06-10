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
import {
  BLOCKS_PER_YEAR,
  POT_ADDRESS,
  LENDING_POOL_ADDRESS,
  AAVE_DAI_RESERVE_ADDRESS,
} from '../constants'
import POT_ABI from '../constants/abis/pot.json'
import LENDING_POOL_ABI from '../constants/abis/LendingPool.json'

const BondAPRContext = createContext()

export function useBondAPRContext() {
  return useContext(BondAPRContext)
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
      const { chainId, allAPRs } = payload
      return {
        ...state,
        [chainId]: {
          ...safeAccess(state, [chainId]),
          ...allAPRs,
        },
      }
    }
    default: {
      throw Error(
        `Unexpected action type in BondAPRContext reducer: '${type}'.`,
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

  const updateAll = useCallback((chainId, allAPRs) => {
    dispatch({
      type: UPDATE_ALL,
      payload: { chainId, allAPRs },
    })
  }, [])

  const value = useMemo(() => [state, { update, updateAll }], [
    state,
    update,
    updateAll,
  ])

  return (
    <BondAPRContext.Provider value={value}>{children}</BondAPRContext.Provider>
  )
}

async function getBondAPR(bond, library) {
  switch (bond.platform) {
    case 'Compound': {
      return getContract(bond.address, bond.abi, library)
        .methods.supplyRatePerBlock()
        .call()
        .then(result => new BigNumber(result).times(BLOCKS_PER_YEAR))
    }
    case 'Fulcrum': {
      return getContract(bond.address, bond.abi, library)
        .methods.supplyInterestRate()
        .call()
        .then(result => new BigNumber(result).div(100))
    }
    case 'MakerDAO': {
      return getContract(POT_ADDRESS, POT_ABI, library)
        .methods.dsr()
        .call()
        .then(result =>
          new BigNumber(result)
            .div(1e27)
            .minus(1)
            .times(60 * 60 * 24 * 365)
            .times(1e18),
        )
    }
    case 'AAVE': {
      return getContract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, library)
        .methods.getReserveData(AAVE_DAI_RESERVE_ADDRESS)
        .call()
        .then(result =>
          new BigNumber(result.liquidityRate).div(1e27).times(1e18),
        )
    }
    default: {
      throw Error(`Unexpected bond platform: ${bond.platform}`)
    }
  }
}

export function useBondAPR(tokenAddress) {
  const { chainId, library } = useWeb3ReadOnly()
  const globalBlockNumber = useBlockNumber()
  const bond = useBondDetails(tokenAddress)

  const [state, { update }] = useBondAPRContext()
  const { value, blockNumber } =
    safeAccess(state, [chainId, tokenAddress]) || {}

  useEffect(() => {
    let stale = false
    if (
      isAddress(tokenAddress) &&
      (value === undefined || blockNumber !== globalBlockNumber) &&
      (chainId || chainId === 1)
    ) {
      getBondAPR(bond, library)
        .then(apr => {
          if (!stale) {
            update(chainId, tokenAddress, apr, blockNumber)
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

export function useAllBondAPRs() {
  const { chainId, library } = useWeb3ReadOnly()
  const globalBlockNumber = useBlockNumber()
  const allBonds = useAllBondDetails()

  const [state, { updateAll }] = useBondAPRContext()
  const allAPRs = safeAccess(state, [chainId])

  const getData = async () => {
    const newAPRs = {}
    await Promise.all(
      Object.keys(allBonds).map(async tokenAddress => {
        if (isAddress(tokenAddress)) {
          const bond = allBonds[tokenAddress]
          const apr = await getBondAPR(bond, library).catch(() => null)

          return (newAPRs[tokenAddress] = {
            value: apr,
            blockNumber: globalBlockNumber,
          })
        }
      }),
    )
    updateAll(chainId, newAPRs)
  }
  useMemo(getData, [globalBlockNumber])

  return allAPRs
}
