import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react'
import BigNumber from 'bignumber.js'

import { useWeb3React } from '../hooks/ethereum'
import { useBlockNumber } from './Application'
import { useTokenBalance } from './Balances'
import { useBondDetails, useAllBondDetails } from './Bonds'
import { safeAccess, isAddress, getContract } from '../utils'
import {
  CSAI_CREATION_BLOCK_NUMBER,
  CDAI_CREATION_BLOCK_NUMBER,
  CUSDC_CREATION_BLOCK_NUMBER,
  ISAI_CREATION_BLOCK_NUMBER,
  CHAI_CREATION_BLOCK_NUMBER,
  ADAI_CREATION_BLOCK_NUMBER,
  POT_ADDRESS,
  AUSDT_CREATION_BLOCK_NUMBER,
  CUSDT_CREATION_BLOCK_NUMBER,
} from '../constants'
import POT_ABI from '../constants/abis/pot.json'

const BondEarnedContext = createContext()

export function useBondEarnedContext() {
  return useContext(BondEarnedContext)
}

const UPDATE = 'UPDATE'
const UPDATE_ALL = 'UPDATE_ALL'

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const {
        chainId,
        address,
        tokenAddress,
        transferEvents,
        exchangeRates,
        blockNumber,
      } = payload
      return {
        ...state,
        [chainId]: {
          ...safeAccess(state, [chainId]),
          [address]: {
            ...safeAccess(state, [chainId, address]),
            [tokenAddress]: {
              transferEvents,
              exchangeRates,
              blockNumber,
            },
          },
        },
      }
    }
    case UPDATE_ALL: {
      const { chainId, address, allLogs } = payload
      return {
        ...state,
        [chainId]: {
          ...safeAccess(state, [chainId]),
          [address]: {
            ...safeAccess(state, [chainId, address]),
            ...allLogs,
          },
        },
      }
    }
    default: {
      throw Error(
        `Unexpected action type in BondEarnedContext reducer: '${type}'.`,
      )
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  const update = useCallback(
    (
      chainId,
      address,
      tokenAddress,
      transferEvents,
      exchangeRates,
      blockNumber,
    ) =>
      dispatch({
        type: UPDATE,
        payload: {
          chainId,
          address,
          tokenAddress,
          transferEvents,
          exchangeRates,
          blockNumber,
        },
      }),
    [],
  )

  const updateAll = useCallback(
    (chainId, address, allLogs) =>
      dispatch({
        type: UPDATE_ALL,
        payload: { chainId, address, allLogs },
      }),
    [],
  )

  const value = useMemo(() => [state, { update, updateAll }], [
    state,
    update,
    updateAll,
  ])
  return (
    <BondEarnedContext.Provider value={value}>
      {children}
    </BondEarnedContext.Provider>
  )
}

const CREATION_BLOCK_NUMBER = {
  cSAI: CSAI_CREATION_BLOCK_NUMBER,
  cDAI: CDAI_CREATION_BLOCK_NUMBER,
  cUSDC: CUSDC_CREATION_BLOCK_NUMBER,
  cUSDT: CUSDT_CREATION_BLOCK_NUMBER,
  iSAI: ISAI_CREATION_BLOCK_NUMBER,
  CHAI: CHAI_CREATION_BLOCK_NUMBER,
  aDAI: ADAI_CREATION_BLOCK_NUMBER,
  aUSDT: AUSDT_CREATION_BLOCK_NUMBER,
}

const TRANSFER_TO = {
  Compound: 'to',
  Fulcrum: 'to',
  MakerDAO: 'dst',
  AAVE: 'to',
}

const TRANSFER_FROM = {
  Compound: 'from',
  Fulcrum: 'from',
  MakerDAO: 'src',
  AAVE: 'from',
}

async function getBondPastTransferEvents(bond, account, library, blockNumber) {
  const contract = getContract(bond.address, bond.abi, library)
  const fromBlock = blockNumber || CREATION_BLOCK_NUMBER[bond.symbol]
  const [transferInEvents, transferOutEvents] = await Promise.all([
    contract.getPastEvents('Transfer', {
      filter: { [TRANSFER_TO[bond.platform]]: account },
      fromBlock,
    }),
    contract.getPastEvents('Transfer', {
      filter: { [TRANSFER_FROM[bond.platform]]: account },
      fromBlock,
    }),
  ])

  return [...transferInEvents, ...transferOutEvents].sort(
    (a, b) => a.blockNumber - b.blockNumber,
  )
}

async function getBondPastExchangeRates(bond, transferEvents, library) {
  switch (bond.platform) {
    case 'Compound': {
      const contract = getContract(bond.address, bond.abi, library)
      return Promise.all([
        ...transferEvents
          .map(event => event.blockNumber)
          .map(blockNumber =>
            contract.methods.exchangeRateCurrent().call(null, blockNumber),
          ),
        contract.methods.exchangeRateCurrent().call(),
      ]).then(exchangeRates =>
        exchangeRates.map(exchangeRate =>
          new BigNumber(exchangeRate).shiftedBy(-18),
        ),
      )
    }
    case 'Fulcrum': {
      const contract = getContract(bond.address, bond.abi, library)
      return Promise.all([
        ...transferEvents
          .map(event => event.blockNumber)
          .map(blockNumber =>
            contract.methods.tokenPrice().call(null, blockNumber),
          ),
        contract.methods.tokenPrice().call(),
      ]).then(exchangeRates =>
        exchangeRates.map(exchangeRate =>
          new BigNumber(exchangeRate).shiftedBy(-18),
        ),
      )
    }
    case 'MakerDAO': {
      const contract = getContract(POT_ADDRESS, POT_ABI, library)
      return Promise.all([
        ...transferEvents
          .map(event => event.blockNumber)
          .map(blockNumber => contract.methods.chi().call(null, blockNumber)),
        contract.methods.chi().call(),
      ]).then(exchangeRates =>
        exchangeRates.map(exchangeRate =>
          new BigNumber(exchangeRate).shiftedBy(-27),
        ),
      )
    }
    default: {
      throw Error(`Unexpected bond platform: ${bond.platform}`)
    }
  }
}

async function getBondPastEventsAndExchangeRates(
  bond,
  address,
  library,
  blockNumber,
) {
  const newTransferEvents = await getBondPastTransferEvents(
    bond,
    address,
    library,
    blockNumber,
  )

  const newExchangeRates =
    bond.platform !== 'AAVE'
      ? await getBondPastExchangeRates(bond, newTransferEvents, library)
      : []

  return { newTransferEvents, newExchangeRates }
}

const returnValuesProp = {
  Compound: 'amount',
  Fulcrum: 'value',
  MakerDAO: 'wad',
}

function calculateEarned(
  address,
  transferEvents = [],
  exchangeRates = [],
  platform,
) {
  const balanceHistory = (transferEvents || []).reduce((balances, event) => {
    const amount = new BigNumber(event.returnValues[returnValuesProp[platform]])

    if (balances.length === 0) {
      return [amount]
    }

    const nextBalance =
      event.returnValues[TRANSFER_TO[platform]] === address
        ? balances[balances.length - 1].plus(amount)
        : balances[balances.length - 1].minus(amount)

    return [...balances, nextBalance]
  }, [])

  const spreadHistory = (exchangeRates || [])
    .map(rate => new BigNumber(rate))
    .reduce((spreads, rate, rateIndex, rates) => {
      if (rateIndex === 0) return []
      const nextSpreads = rate.minus(rates[rateIndex - 1])
      return [...spreads, nextSpreads]
    }, [])

  const earned = balanceHistory.reduce((sum, balance, index) => {
    return sum.plus(balance.times(spreadHistory[index]))
  }, new BigNumber(0))

  return earned
}

function calculateAaveEarned(address, transferEvents) {
  return null
}

export function useBondEarned(tokenAddress, address) {
  const { chainId, library } = useWeb3React()
  const globalBlockNumber = useBlockNumber()
  const bond = useBondDetails(tokenAddress)

  const [state, { update }] = useBondEarnedContext()
  const { transferEvents = [], exchangeRates = [], blockNumber } =
    safeAccess(state, [chainId, address, tokenAddress]) || {}

  useEffect(() => {
    if (
      (chainId || chainId === 0) &&
      isAddress(address) &&
      isAddress(tokenAddress) &&
      blockNumber !== globalBlockNumber &&
      library
    ) {
      let stale = false
      let isFirst = true
      getBondPastEventsAndExchangeRates(bond, address, library, blockNumber)
        .then(({ newTransferEvents, newExchangeRates }) => {
          const allTransferEvents = [...transferEvents, ...newTransferEvents]
          const allExchangeRates = [
            ...exchangeRates.slice(0, exchangeRates.length - 1),
            ...newExchangeRates,
          ]
          if (!stale || isFirst) {
            update(
              chainId,
              address,
              tokenAddress,
              allTransferEvents,
              allExchangeRates,
              globalBlockNumber,
            )
            isFirst = false
          }
        })
        .catch(err => {
          if (!stale || isFirst) {
            update(
              chainId,
              address,
              tokenAddress,
              null,
              null,
              globalBlockNumber,
            )
            isFirst = false
          }
        })

      return () => {
        stale = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, bond, globalBlockNumber, library, update])

  return bond.platform === 'AAVE'
    ? calculateAaveEarned(address, transferEvents)
    : calculateEarned(address, transferEvents, exchangeRates, bond.platform)
}

export function useAllBondEarned(address) {
  const { chainId, library } = useWeb3React()
  const globalBlockNumber = useBlockNumber()
  const allBonds = useAllBondDetails()

  const [state, { updateAll }] = useBondEarnedContext()
  const allLogs = safeAccess(state, [chainId, address]) || {}

  const getData = async () => {
    if (isAddress(address)) {
      const newLogs = {}
      await Promise.all(
        Object.keys(allBonds).map(async tokenAddress => {
          if (isAddress(tokenAddress)) {
            const bond = allBonds[tokenAddress]
            const log = allLogs[tokenAddress]
            const blockNumber = allLogs[tokenAddress]
              ? allLogs[tokenAddress].blockNumber
              : null
            const {
              newTransferEvents,
              newExchangeRates,
            } = await getBondPastEventsAndExchangeRates(
              bond,
              address,
              library,
              blockNumber,
            )
            const pastTransferEvents =
              log && log.transferEvents ? log.transferEvents : []
            const pastExchangeRates =
              log && log.exchangeRates ? log.exchangeRates : []
            const allTransferEvents = [
              ...pastTransferEvents,
              ...newTransferEvents,
            ]
            const allExchangeRates = [
              ...pastExchangeRates.slice(0, pastExchangeRates.length - 1),
              ...newExchangeRates,
            ]

            return (newLogs[tokenAddress] = {
              transferEvents: allTransferEvents,
              exchangeRates: allExchangeRates,
              blockNumber: globalBlockNumber,
            })
          }
        }),
      )
      updateAll(chainId, address, newLogs)
    }
  }
  useMemo(getData, [address, globalBlockNumber])

  return Object.keys(allLogs).reduce((earnings, tokenAddress) => {
    const bond = allBonds[tokenAddress]

    return {
      ...earnings,
      [tokenAddress]:
        bond.platform === 'AAVE'
          ? calculateAaveEarned(address, allLogs[tokenAddress].transferEvents)
          : calculateEarned(
              address,
              allLogs[tokenAddress].transferEvents,
              allLogs[tokenAddress].exchangeRates,
              bond.platform,
            ),
    }
  }, {})
}

export function useBondProfit(tokenAddress, address) {
  const { chainId, library } = useWeb3React()

  const globalBlockNumber = useBlockNumber()
  const bond = useBondDetails(tokenAddress)

  const [state] = useBondEarnedContext()
  const { exchangeRates = [] } =
    safeAccess(state, [chainId, address, tokenAddress]) || {}

  const balance = useTokenBalance(tokenAddress, address)

  // calculate AAVE profit
  const [principalBalance, setPrincipalBalance] = useState(0)
  useEffect(() => {
    let stale = false
    if (bond.platform === 'AAVE' && library) {
      const contract = getContract(bond.address, bond.abi, library)
      contract.methods
        .principalBalanceOf(address)
        .call()
        .then(value => {
          if (!stale) {
            setPrincipalBalance(new BigNumber(value))
          }
        })
        .catch(() => {
          if (!stale) {
            setPrincipalBalance(null)
          }
        })
    }

    return () => {
      stale = true
    }
  }, [address, bond, library, globalBlockNumber])

  if (bond.platform === 'AAVE') {
    if (balance && principalBalance) {
      return balance.minus(principalBalance)
    } else {
      return null
    }
  } else {
    if ((exchangeRates || []).length > 1) {
      return balance.times(
        exchangeRates[exchangeRates.length - 1].minus(
          exchangeRates[exchangeRates.length - 2],
        ),
      )
    } else {
      return null
    }
  }
}
