import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
} from 'react'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

import { useWeb3React, useGasPrice } from '../hooks/ethereum'
import { safeAccess, isAddress, getContract } from '../utils'
import CSAI_GATEWAY_1_ABI from '../constants/abis/cSaiGateway1.json'
import CSAI_GATEWAY_2_ABI from '../constants/abis/cSaiGateway2.json'
import CSAI_GATEWAY_3_ABI from '../constants/abis/cSaiGateway3.json'
// import CSAI_GATEWAY_4_ABI from '../constants/abis/cSaiGateway4.json'
import CSAI_REFERRAL_GATEWAY_ABI from '../constants/abis/cSaiReferralGateway.json'
import CDAI_GATEWAY_1_ABI from '../constants/abis/cDaiGateway1.json'
import CDAI_GATEWAY_2_ABI from '../constants/abis/cDaiGateway2.json'
import CDAI_GATEWAY_3_ABI from '../constants/abis/cDaiGateway3.json'
// import CDAI_GATEWAY_4_ABI from '../constants/abis/cDaiGateway4.json'
import CDAI_REFERRAL_GATEWAY_ABI from '../constants/abis/cDaiReferralGateway.json'
import CUSDC_GATEWAY_1_ABI from '../constants/abis/cUsdcGateway1.json'
import CUSDC_GATEWAY_2_ABI from '../constants/abis/cUsdcGateway2.json'
import CUSDC_GATEWAY_3_ABI from '../constants/abis/cUsdcGateway3.json'
import CUSDC_REFERRAL_GATEWAY_ABI from '../constants/abis/cUsdcReferralGateway.json'
import CUSDT_GATEWAY_1_ABI from '../constants/abis/cUsdtGateway1.json'
import ISAI_GATEWAY_1_ABI from '../constants/abis/iSaiGateway1.json'
import ISAI_GATEWAY_2_ABI from '../constants/abis/iSaiGateway2.json'
import ISAI_GATEWAY_3_ABI from '../constants/abis/iSaiGateway3.json'
// import ISAI_GATEWAY_4_ABI from '../constants/abis/iSaiGateway4.json'
import ISAI_REFERRAL_GATEWAY_ABI from '../constants/abis/iSaiReferralGateway.json'
import CHAI_GATEWAY_1_ABI from '../constants/abis/chaiGateway1.json'
import CHAI_GATEWAY_2_ABI from '../constants/abis/chaiGateway2.json'
import CHAI_GATEWAY_3_ABI from '../constants/abis/chaiGateway3.json'
// import CHAI_GATEWAY_4_ABI from '../constants/abis/chaiGateway4.json'
import ADAI_GATEWAY_1_ABI from '../constants/abis/aDaiGateway1.json'
import ADAI_GATEWAY_2_ABI from '../constants/abis/aDaiGateway2.json'
import ADAI_GATEWAY_3_ABI from '../constants/abis/aDaiGateway3.json'
import ADAI_GATEWAY_4_ABI from '../constants/abis/aDaiGateway4.json'
import AUSDT_GATEWAY_1_ABI from '../constants/abis/aUsdtGateway1.json'

const GatewaysContext = createContext()

export function useGatewaysContext() {
  return useContext(GatewaysContext)
}

const ABI = 'abi'
const TARGET_ADDRESS = 'targetAddress'
const TARGET_SYMBOL = 'targetSymbol'
const ISREFERRAL = 'isReferral'
const METHOD_NAMES = 'methodNames'
const GASES = 'gases'

const GATEWAYS_CONTEXTS = {
  1: {
    '0xb4d79feeb4b4e0dae1a33e784f398ad1062c3584': {
      [TARGET_ADDRESS]: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
      [TARGET_SYMBOL]: 'cSai',
      [ISREFERRAL]: false,
      [ABI]: CSAI_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherTocDai'],
      [GASES]: {
        fallback: 275000,
      },
    },
    '0x61255c7977c40bbeaefd9ae3070396dfc0be00e6': {
      [TARGET_ADDRESS]: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
      [TARGET_SYMBOL]: 'cSai',
      [ISREFERRAL]: false,
      [ABI]: CSAI_GATEWAY_2_ABI,
      [METHOD_NAMES]: ['etherTocDai'],
      [GASES]: {
        fallback: 450000,
      },
    },
    '0xd76510f11ee52bc1de8de2811972977c09a2ed98': {
      [TARGET_ADDRESS]: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
      [TARGET_SYMBOL]: 'cSai',
      [ISREFERRAL]: false,
      [ABI]: CSAI_GATEWAY_3_ABI,
      [METHOD_NAMES]: ['etherTocDai'],
      [GASES]: {
        fallback: 800000,
      },
    },
    // '0xf98d68b719fb01789bb2da429ecf1583fa2d2186': {
    //   [TARGET_ADDRESS]: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
    //   [TARGET_SYMBOL]: 'cSai',
    //   [ISREFERRAL]: false,
    //   [ABI]: CSAI_GATEWAY_4_ABI,
    //   [METHOD_NAMES]: ['etherTocDai'],
    //   [GASES]: {
    //     fallback: 650000,
    //   },
    // },
    '0x70287b389aa4d35368bc9ee39cec7bf43e7439a8': {
      [TARGET_ADDRESS]: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
      [TARGET_SYMBOL]: 'cSai',
      [ISREFERRAL]: true,
      [ABI]: CSAI_REFERRAL_GATEWAY_ABI,
      [METHOD_NAMES]: [
        'etherTocDai1',
        'etherTocDai2',
        'etherTocDai3',
        // 'etherTocDai4',
      ],
      [GASES]: {
        etherTocDai1: 300000,
        etherTocDai2: 475000,
        etherTocDai3: 825000,
        // etherTocDai4: 575000,
      },
    },
    '0xd318fb94fA2d7e7d5855330ec2976Adcd9C27f8E': {
      [TARGET_ADDRESS]: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      [TARGET_SYMBOL]: 'cUSDC',
      [ISREFERRAL]: false,
      [ABI]: CUSDC_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherTocUSDC'],
      [GASES]: {
        fallback: 275000,
      },
    },
    '0xCee9B0F2e9F8b1fD5D2A4035278bdCf95cdfcf2F': {
      [TARGET_ADDRESS]: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      [TARGET_SYMBOL]: 'cUSDC',
      [ISREFERRAL]: false,
      [ABI]: CUSDC_GATEWAY_2_ABI,
      [METHOD_NAMES]: ['etherTocUSDC'],
      [GASES]: {
        fallback: 450000,
      },
    },
    '0x7d53f81AFf8AFb53d0dA7fDEaF789829a09152A4': {
      [TARGET_ADDRESS]: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      [TARGET_SYMBOL]: 'cUSDC',
      [ISREFERRAL]: false,
      [ABI]: CUSDC_GATEWAY_3_ABI,
      [METHOD_NAMES]: ['etherTocUSDC'],
      [GASES]: {
        fallback: 800000,
      },
    },
    '0x878281852d6658b17cf35daa947b70c156c80d5d': {
      [TARGET_ADDRESS]: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      [TARGET_SYMBOL]: 'cUSDC',
      [ISREFERRAL]: true,
      [ABI]: CUSDC_REFERRAL_GATEWAY_ABI,
      [METHOD_NAMES]: ['etherTocUSDC1', 'etherTocUSDC2', 'etherTocUSDC3'],
      [GASES]: {
        etherTocUSDC1: 300000,
        etherTocUSDC2: 475000,
        etherTocUSDC3: 825000,
      },
    },
    '0xD6Bb78878f694E0C55598C4291fD5797D162eF31': {
      [TARGET_ADDRESS]: '0x14094949152eddbfcd073717200da82fed8dc960',
      [TARGET_SYMBOL]: 'iSai',
      [ISREFERRAL]: false,
      [ABI]: ISAI_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherToiDai'],
      [GASES]: {
        fallback: 275000,
      },
    },
    '0x59f76D251f117Aa6546FDBE029Ec13b7f28e8911': {
      [TARGET_ADDRESS]: '0x14094949152eddbfcd073717200da82fed8dc960',
      [TARGET_SYMBOL]: 'iSai',
      [ISREFERRAL]: false,
      [ABI]: ISAI_GATEWAY_2_ABI,
      [METHOD_NAMES]: ['etherToiDai'],
      [GASES]: {
        fallback: 450000,
      },
    },
    '0xFB8793852597B2357Bc6679E31Ee4bD20cBD6bf2': {
      [TARGET_ADDRESS]: '0x14094949152eddbfcd073717200da82fed8dc960',
      [TARGET_SYMBOL]: 'iSai',
      [ISREFERRAL]: false,
      [ABI]: ISAI_GATEWAY_3_ABI,
      [METHOD_NAMES]: ['etherToiDai'],
      [GASES]: {
        fallback: 800000,
      },
    },
    // '0xae5e23e7c1820E10c8aB850B456D36aED6225bff': {
    //   [TARGET_ADDRESS]: '0x14094949152eddbfcd073717200da82fed8dc960',
    //   [TARGET_SYMBOL]: 'iSai',
    //   [ISREFERRAL]: false,
    //   [ABI]: ISAI_GATEWAY_4_ABI,
    //   [METHOD_NAMES]: ['etherToiDai'],
    //   [GASES]: {
    //     fallback: 650000,
    //   },
    // },
    '0x1987c3aB6895fD3A62d8d33C60B78B601c237a19': {
      [TARGET_ADDRESS]: '0x14094949152eddbfcd073717200da82fed8dc960',
      [TARGET_SYMBOL]: 'iSai',
      [ISREFERRAL]: true,
      [ABI]: ISAI_REFERRAL_GATEWAY_ABI,
      [METHOD_NAMES]: [
        'etherToiDai1',
        'etherToiDai2',
        'etherToiDai3',
        // 'etherToiDai4',
      ],
      [GASES]: {
        etherToiDai1: 300000,
        etherToiDai2: 475000,
        etherToiDai3: 825000,
        // etherToiDai4: 575000,
      },
    },
    '0x4AEDeD2F07c51f1026A91e79049E0e8545114CB1': {
      [TARGET_ADDRESS]: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      [TARGET_SYMBOL]: 'cDai',
      [ISREFERRAL]: false,
      [ABI]: CDAI_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherTocDai'],
      [GASES]: {
        fallback: 275000,
      },
    },
    '0x341BAFfD0b71a1435378FeD01cdEa14610f0e51b': {
      [TARGET_ADDRESS]: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      [TARGET_SYMBOL]: 'cDai',
      [ISREFERRAL]: false,
      [ABI]: CDAI_GATEWAY_2_ABI,
      [METHOD_NAMES]: ['etherTocDai'],
      [GASES]: {
        fallback: 450000,
      },
    },
    '0x7ddee332180Bb7E6977C154ca212D3D404Be39d1': {
      [TARGET_ADDRESS]: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      [TARGET_SYMBOL]: 'cDai',
      [ISREFERRAL]: false,
      [ABI]: CDAI_GATEWAY_3_ABI,
      [METHOD_NAMES]: ['etherTocDai'],
      [GASES]: {
        fallback: 1080000,
      },
    },
    // '0xE9294DCf42cA192EfD5A3DC0AbE1c6729e926035': {
    //   [TARGET_ADDRESS]: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    //   [TARGET_SYMBOL]: 'cDai',
    //   [ISREFERRAL]: false,
    //   [ABI]: CDAI_GATEWAY_4_ABI,
    //   [METHOD_NAMES]: ['etherTocDai'],
    //   [GASES]: {
    //     fallback: 650000,
    //   },
    // },
    '0xBa52428B34a6D5a817d4525dBA20139f64414A0F': {
      [TARGET_ADDRESS]: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      [TARGET_SYMBOL]: 'cDai',
      [ISREFERRAL]: true,
      [ABI]: CDAI_REFERRAL_GATEWAY_ABI,
      [METHOD_NAMES]: ['etherTocDai1', 'etherTocDai2', 'etherTocDai3'],
      [GASES]: {
        etherTocDai1: 300000,
        etherTocDai2: 475000,
        etherTocDai3: 825000,
      },
    },
    '0x2e1fB28384d474a77B37fd6F35A5F430f61B9b6b': {
      [TARGET_ADDRESS]: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
      [TARGET_SYMBOL]: 'CHAI',
      [ISREFERRAL]: false,
      [ABI]: CHAI_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherTochai'],
      [GASES]: {
        fallback: 275000,
      },
    },
    '0x6eFFAA6450aF6F6564157314021D04C33d306897': {
      [TARGET_ADDRESS]: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
      [TARGET_SYMBOL]: 'CHAI',
      [ISREFERRAL]: false,
      [ABI]: CHAI_GATEWAY_2_ABI,
      [METHOD_NAMES]: ['etherTochai'],
      [GASES]: {
        fallback: 450000,
      },
    },
    '0x69186f8680A614D3E0c56284Fab0Fd65C79f1283': {
      [TARGET_ADDRESS]: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
      [TARGET_SYMBOL]: 'CHAI',
      [ISREFERRAL]: false,
      [ABI]: CHAI_GATEWAY_3_ABI,
      [METHOD_NAMES]: ['etherTochai'],
      [GASES]: {
        fallback: 800000,
      },
    },
    // '0xCC56131Cbc8962d068c04d899C760ba2Fc78C13E': {
    //   [TARGET_ADDRESS]: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
    //   [TARGET_SYMBOL]: 'CHAI',
    //   [ISREFERRAL]: false,
    //   [ABI]: CHAI_GATEWAY_4_ABI,
    //   [METHOD_NAMES]: ['etherTochai'],
    //   [GASES]: {
    //     fallback: 650000,
    //   },
    // },
    '0xE37B49C50C1B95C63336725688DEE33fdDa58f50': {
      [TARGET_ADDRESS]: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
      [TARGET_SYMBOL]: 'aDAI',
      [ISREFERRAL]: false,
      [ABI]: ADAI_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherToaDai'],
      [GASES]: {
        fallback: 300000,
      },
    },
    '0x1dd0339e916771243d7287890cc5aa51278f6b24': {
      [TARGET_ADDRESS]: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
      [TARGET_SYMBOL]: 'aDAI',
      [ISREFERRAL]: false,
      [ABI]: ADAI_GATEWAY_2_ABI,
      [METHOD_NAMES]: ['etherToaDai'],
      [GASES]: {
        fallback: 450000,
      },
    },
    '0x79143db86c2C9Ea72e366B5cB9Ea0e849E7c6EcA': {
      [TARGET_ADDRESS]: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
      [TARGET_SYMBOL]: 'aDAI',
      [ISREFERRAL]: false,
      [ABI]: ADAI_GATEWAY_3_ABI,
      [METHOD_NAMES]: ['etherToaDai'],
      [GASES]: {
        fallback: 800000,
      },
    },
    '0x1F8EACee9062a4bdD4FDaF5CB04F2F8336DC37ff': {
      [TARGET_ADDRESS]: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
      [TARGET_SYMBOL]: 'aDAI',
      [ISREFERRAL]: false,
      [ABI]: ADAI_GATEWAY_4_ABI,
      [METHOD_NAMES]: ['etherToaDai'],
      [GASES]: {
        fallback: 650000,
      },
    },
    '0xbb4f27D0612419ea9B7D1851b7474e78188137DA': {
      [TARGET_ADDRESS]: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
      [TARGET_SYMBOL]: 'aUSDT',
      [ISREFERRAL]: false,
      [ABI]: AUSDT_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherToaUSDT'],
      [GASES]: {
        fallback: 800000,
      },
    },
    '0x4b845B1e441B986D4593e14eb1Fc1155dfc071D9': {
      [TARGET_ADDRESS]: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
      [TARGET_SYMBOL]: 'cUSDT',
      [ISREFERRAL]: false,
      [ABI]: CUSDT_GATEWAY_1_ABI,
      [METHOD_NAMES]: ['etherTocUSDT'],
      [GASES]: {
        fallback: 800000,
      },
    },
  },
}

export default function Provider({ children }) {
  return (
    <GatewaysContext.Provider value={GATEWAYS_CONTEXTS}>
      {children}
    </GatewaysContext.Provider>
  )
}

export function useGatewaysByTarget(targetAddress, isReferral) {
  const { chainId } = useWeb3React()
  const gatewaysContext = useGatewaysContext()
  const gatewaysObject = safeAccess(gatewaysContext, [chainId])

  return useMemo(
    () =>
      Object.keys(gatewaysObject)
        .map(gatewayAddress => ({
          address: gatewayAddress,
          ...gatewaysObject[gatewayAddress],
        }))
        .filter(
          gateway =>
            gateway.targetAddress === targetAddress &&
            gateway.isReferral === isReferral,
        ),
    [gatewaysObject, isReferral, targetAddress],
  )
}

export function useGatewaySwap(targetAddress) {
  const gateways = useGatewaysByTarget(targetAddress, false)

  const { library: libraryReadOnly } = useWeb3React()
  const call = useCallback(
    async amount => {
      if (gateways.length) {
        const randomAddress = ethers.Wallet.createRandom().address
        const estimatedAmounts = await Promise.all(
          gateways.map(gateway =>
            getContract(
              gateway.address,
              gateway.abi,
              libraryReadOnly,
            ).callStatic[gateway.methodNames[0]](randomAddress, {
              value: amount.toString(),
            }),
          ),
        )

        const maxAmount = BigNumber.maximum(
          ...estimatedAmounts.map(amount => new BigNumber(amount.toString())),
        )

        const maxAmountIndex = estimatedAmounts.findIndex(amount =>
          new BigNumber(amount.toString()).eq(maxAmount),
        )

        return { gatewayNumber: maxAmountIndex + 1, outputAmount: maxAmount }
      }
    },
    [gateways, libraryReadOnly],
  )

  const { account, library } = useWeb3React()
  const { getPrice } = useGasPrice()
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState()
  const send = useCallback(
    async (amount, gatewayNumber) => {
      if (!gatewayNumber) {
        throw Error('gatewayNumber is undefined.')
      }
      if (isAddress(account) && library) {
        const gateway = gateways[gatewayNumber - 1]
        const gasPrice = await getPrice()

        try {
          const signer = await library.getSigner()
          const tx = await signer.sendTransaction({
            to: gateway.address,
            value: `0x${amount.toString(16)}`,
            gasLimit: `0x${gateway.gases.fallback.toString(16)}`,
            gasPrice: `0x${gasPrice.toString(16)}`,
          })
          setIsSending(true)
          await tx.wait()
        } catch (err) {
          console.log(err)
          setSendError(err.message)
        } finally {
          setIsSending(false)
        }
      }
    },
    [account, gateways, getPrice, library],
  )

  return { call, send, isSending, sendError }
}

export function useReferralGatewaySwap(targetAddress, referralAddress) {
  const gateways = useGatewaysByTarget(targetAddress, true)

  const { library: libraryReadOnly } = useWeb3React()

  const call = useCallback(
    async amount => {
      if (isAddress(referralAddress) && gateways.length) {
        const gateway = gateways[0]
        const gatewayContract = getContract(
          gateway.address,
          gateway.abi,
          libraryReadOnly,
        )
        const randomAddress = ethers.Wallet.createRandom().address
        const estimatedAmounts = await Promise.all(
          gateway.methodNames.map(method =>
            gatewayContract.callStatic[method](randomAddress, referralAddress, {
              value: amount.toString(),
            }),
          ),
        )
        const maxAmount = BigNumber.maximum(
          ...estimatedAmounts.map(amount => new BigNumber(amount.toString())),
        )
        const maxAmountIndex = estimatedAmounts.findIndex(amount =>
          new BigNumber(amount.toString()).eq(maxAmount),
        )

        return { gatewayNumber: maxAmountIndex + 1, outputAmount: maxAmount }
      }
    },
    [gateways, libraryReadOnly, referralAddress],
  )

  const { account, library } = useWeb3React()
  const { getPrice } = useGasPrice()
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState()
  const send = useCallback(
    async (amount, gatewayNumber) => {
      if (!gatewayNumber) {
        throw Error('gatewayNumber is undefined.')
      }
      if (isAddress(account) && isAddress(referralAddress) && library) {
        const gateway = gateways[0]
        const gatewayContract = getContract(
          gateway.address,
          gateway.abi,
          library,
        )
        const method = gateway.methodNames[gatewayNumber - 1]
        const gasPrice = await getPrice()

        try {
          const tx = await gatewayContract[method](account, referralAddress, {
            from: account,
            value: amount,
            gas: gateway.gases[method],
            gasPrice,
          })
          setIsSending(true)
          await tx.wait()
        } catch (err) {
          setSendError(err.message)
        } finally {
          setIsSending(false)
        }
      }
    },
    [account, gateways, getPrice, library, referralAddress],
  )

  return { call, send, isSending, sendError }
}
