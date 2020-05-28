import React, { useMemo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useCollapse from 'react-collapsed'
import ReactGA from 'react-ga'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'

import Dialog from './Dialog'
import {
  ExpansionPanel,
  ExpansionPanelButton,
  ExpansionPanelDetails,
} from '../ExpansionPanel'
import CreateTrialWalletForm from '../forms/CreateTrialWalletForm'
import ImportTrialWalletForm from '../forms/ImportTrialWalletForm'
import DecryptTrialWalletForm from '../forms/DecryptTrialWalletForm'
import {
  injected as injectedConnector,
  walletconnect as walletconnectConnector,
} from '../../connectors'

const ModalTitle = styled.h4`
  margin: 0;
  margin-top: 4px;
  font-size: 18px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const ConnectorsContainer = styled.div`
  padding: 32px 14px;

  > *:not(:first-child) {
    margin-top: 16px;
  }
`

const ConnectorButton = styled.button`
  width: 100%;
  height: 84px;
  padding: 0 24px;
  border: ${({ theme, isConnected }) =>
    isConnected
      ? `1px solid ${theme.colors.ultramarineBlue}`
      : `1px solid ${theme.colors.blueGray200}`};
  border-radius: 6px;
  background-color: ${({ theme, isConnected }) =>
    isConnected ? theme.colors.blackSqueeze : theme.colors.white};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &[disabled] {
    cursor: not-allowed;
  }
`

const TrialConnectorPanel = styled.div`
  width: 100%;
  padding: 0 24px;
  padding-bottom: ${({ isOpen }) => (isOpen ? '20px' : 0)};
  border: ${({ theme, isOpen }) =>
    isOpen
      ? `1px solid ${theme.colors.ultramarineBlue}`
      : `1px solid ${theme.colors.blueGray200}`};
  border-radius: 6px;
`

const TrialConnectorButton = styled.div`
  width: 100%;
  padding: 32px 0;
  background-color: ${({ theme }) => theme.colors.white};
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const UnconnectorButton = styled.button`
  width: calc(100% - 80px);
  height: 40px;
  margin: 16px 40px 32px 40px;
  padding: 0;
  border: none;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.blueGray50};
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

const Text = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.blueGray900};
  text-align: left;
`

const StatusText = styled.div`
  font-size: 12px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.dullLime};
`

export default function WalletModal(props) {
  const {
    isOpen,
    onDismiss,
    onCreateTrialWallet,
    onImportTrialWallet,
    onDecryptTrialWallet,
  } = props

  const { t } = useTranslation()

  const { active, activate, deactivate, connector } = useWeb3React()

  const {
    getCollapseProps,
    getToggleProps,
    isOpen: isOpenPanel,
  } = useCollapse()

  const isDetectedWeb3 = !!window.ethereum || !!window.web3
  const isInjected = useMemo(() => active && connector === injectedConnector, [
    active,
    connector,
  ])

  const injectedStatusText = useMemo(() => {
    if (isInjected) {
      return t('loggedIn')
    } else if (isDetectedWeb3) {
      return t('detectWallet')
    } else {
      return t('detectNoWallet')
    }
  }, [isDetectedWeb3, isInjected, t])

  const isWalletConnected = useMemo(
    () => active && connector === walletconnectConnector,
    [active, connector],
  )

  const isDetectedKeystore = !!localStorage.getItem('keystore')

  const connectInjectedWallet = useCallback(async () => {
    try {
      await activate(injectedConnector, undefined, true)
      ReactGA.event({
        category: 'WalletLoggedIn',
        action: 'Injected',
      })
      onDismiss()
    } catch {
      console.log('You let me break. LoL')
    }
  }, [activate, onDismiss])

  const connectWalletconnect = useCallback(async () => {
    try {
      await activate(walletconnectConnector, undefined, true)
      ReactGA.event({
        category: 'WalletLoggedIn',
        action: 'WalletConnect',
      })
      onDismiss()
    } catch {
      console.log('You let me break. LoL')
    }
  }, [activate, onDismiss])

  const unconnectWallet = useCallback(() => {
    deactivate()
    if (connector === walletconnectConnector) {
      connector.close()
    }
    ReactGA.event({
      category: 'WalletLoggedIn',
      action: 'Logout',
    })
  }, [connector, deactivate])

  const [panelIndex, setPanelIndex] = useState()
  const renderTrialWalletLoginForm = () => {
    if (isDetectedKeystore) {
      return <DecryptTrialWalletForm onSubmit={onDecryptTrialWallet} />
    } else {
      return (
        <>
          <ExpansionPanel
            isOpen={panelIndex === 0}
            onClick={() => {
              if (panelIndex === 0) {
                setPanelIndex()
              } else {
                setPanelIndex(0)
              }
            }}
          >
            <ExpansionPanelButton>{t('createAccount')}</ExpansionPanelButton>
            <ExpansionPanelDetails>
              <CreateTrialWalletForm onSubmit={onCreateTrialWallet} />
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel
            isOpen={panelIndex === 1}
            onClick={() => {
              if (panelIndex === 1) {
                setPanelIndex()
              } else {
                setPanelIndex(1)
              }
            }}
          >
            <ExpansionPanelButton>{t('recoverAccount')}</ExpansionPanelButton>
            <ExpansionPanelDetails>
              <ImportTrialWalletForm onSubmit={onImportTrialWallet} />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </>
      )
    }
  }

  return (
    <Dialog isOpen={isOpen} onDismiss={onDismiss}>
      <ModalTitle>{t('selectLoginMode')}</ModalTitle>
      <ConnectorsContainer>
        <ConnectorButton
          isConnected={isInjected}
          disabled={!isDetectedWeb3}
          onClick={connectInjectedWallet}
        >
          <Text>{t('loginWithBrowserWallet')}</Text>
          <StatusText>{injectedStatusText}</StatusText>
        </ConnectorButton>
        <TrialConnectorPanel isOpen={isOpenPanel}>
          <TrialConnectorButton {...getToggleProps()}>
            <Text>{t('loginWithTrialWallet')}</Text>
          </TrialConnectorButton>
          <section {...getCollapseProps()}>
            {renderTrialWalletLoginForm()}
          </section>
        </TrialConnectorPanel>
        <ConnectorButton
          isConnected={isWalletConnected}
          onClick={connectWalletconnect}
        >
          <Text>{t('loginWithWalletConnect')}</Text>
          <StatusText>{isWalletConnected && t('loggedIn')}</StatusText>
        </ConnectorButton>
      </ConnectorsContainer>
      {(isInjected || isWalletConnected) && (
        <UnconnectorButton onClick={unconnectWallet}>
          {t('logout')}
        </UnconnectorButton>
      )}
    </Dialog>
  )
}
