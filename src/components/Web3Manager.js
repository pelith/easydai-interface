// import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  useEagerConnect,
  useInactiveListener,
  useReadOnlyConnect,
} from '../hooks/ethereum'

export default function Web3Manager(props) {
  const { children } = props
  // const { active, error } = useWeb3React()

  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager)
  useReadOnlyConnect()

  return children
}
