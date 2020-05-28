import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import styled from 'styled-components'
import { ethers } from 'ethers'

import {
  useDialogsContext,
  WRONG_NETWORK,
  WALLET,
  TRIAL_WALLET,
} from '../contexts/Dialogs'
import {
  injected as injectedConnector,
  network as networkConnector,
  walletconnect as walletconnectConnector,
} from '../connectors'
import { shortenAddress } from '../utils'

const BaseButton = styled.button`
  width: 132px;
  height: 40px;
  border: none;
  border-radius: 20px;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.notoSans};
  letter-spacing: 1px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const ConnectButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.ultramarineBlue};
  color: ${({ theme }) => theme.colors.white};
`

const AccountButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.blueGray600};
`

const ErrorButton = styled(BaseButton)`
  background-color: ${({ theme }) => theme.colors.sunglo};
  color: ${({ theme }) => theme.colors.white};
`

export default function Web3Status() {
  const { t } = useTranslation()
  const { account, connector, activate } = useWeb3React()

  const [error, setError] = useState()

  const [, { open }] = useDialogsContext()

  const openWallet = useCallback(() => {
    if (
      connector === injectedConnector ||
      connector === walletconnectConnector
    ) {
      open(WALLET)
    } else {
      open(TRIAL_WALLET)
    }
  }, [connector, open])

  // logic to detect log{ins,outs}...
  useEffect(() => {
    const { ethereum } = window
    if (connector === injectedConnector) {
      // ...poll to check the accounts array, and if it's ever 0 i.e. the user logged out, update the connector
      if (ethereum) {
        const accountPoll = setInterval(() => {
          const library = new ethers.providers.Web3Provider(ethereum)
          library.listAccounts().then(accounts => {
            if (accounts.length === 0) {
              activate(networkConnector)
            }
          })
        }, 750)

        return () => {
          clearInterval(accountPoll)
        }
      }
    } else {
      if (
        connector === networkConnector &&
        ethereum &&
        ethereum.on &&
        ethereum.removeListener
      ) {
        function tryToActivateInjected() {
          const library = new ethers.providers.Web3Provider(window.ethereum)
          library.listAccounts().then(accounts => {
            if (accounts.length >= 1) {
              activate(injectedConnector)
                .then(() => {
                  setError()
                })
                .catch(error => {
                  // ...and if the error is that they're on the wrong network, display it, otherwise eat it
                  if (error.code === UnsupportedChainIdError) {
                    setError(error)
                  }
                })
            }
          })
        }

        ethereum.on('networkChanged', tryToActivateInjected)
        ethereum.on('accountsChanged', tryToActivateInjected)

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('networkChanged', tryToActivateInjected)
            ethereum.removeListener('accountsChanged', tryToActivateInjected)
          }
        }
      }
    }
  })

  if (error) {
    return (
      <ErrorButton onClick={() => open(WRONG_NETWORK)}>
        {t('wrongNetwork')}
      </ErrorButton>
    )
  } else if (!account) {
    return (
      <ConnectButton onClick={() => open(WALLET)}>{t('login')}</ConnectButton>
    )
  } else {
    return (
      <AccountButton onClick={openWallet}>
        {shortenAddress(account)}
      </AccountButton>
    )
  }
}
