import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'

import { useEtherBalance, useTokenBalance } from '../../contexts/Balances'
import Dialog from './Dialog'
import { ReactComponent as CopyIcon } from '../../assets/copy.svg'
import { ReactComponent as TrialWalletIcon } from '../../assets/trial_wallet.svg'
import { shortenAddress, amountFormatter } from '../../utils'
import {
  SAI_ADDRESS,
  SAI_DECIMALS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  ETH_DECIMALS,
} from '../../constants'

const Title = styled.div`
  margin-bottom: 40px;
  font-size: 18px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const AddressWrapper = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 16px;
  }
`

const AddressText = styled.div`
  font-size: 20px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.roboto};
  color: ${({ theme }) => theme.colors.textColor};
`

const CopyButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 16px;
  padding: 0;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.blueGray100};
  }
`

const QRCodeWrapper = styled.div`
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const WarningMessageWrapper = styled.div`
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 8px;
  }
`

const WarningMessage = styled.div`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  color: ${({ theme }) => theme.colors.mahogany};
`

const BalancesWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.blueGray200};
  border-radius: 6px;
  padding: 32px 24px;
`

const BalancesTitle = styled.div`
  margin-bottom: 32px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const BalanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

const BalanceText = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
`

const BalanceValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.barlow};
  letter-spacing: 0.5px;
`

const TransferButton = styled.button.attrs(props => ({ type: 'button' }))`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 20px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.ultramarineBlue};
  color: ${({ theme }) => theme.colors.white};
  font-size: 13px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

const UnconnectButton = styled.button`
  width: calc(100% - 80px);
  height: 40px;
  margin: 32px 40px 32px 40px;
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

export default function TrialWalletDialog(props) {
  const { isOpen, onDismiss, onTransfer } = props

  const { t } = useTranslation()

  const { account, deactivate } = useWeb3React()
  const etherBalance = useEtherBalance(account)
  const saiBalance = useTokenBalance(SAI_ADDRESS, account)
  const usdcBalance = useTokenBalance(USDC_ADDRESS, account)

  const transfer = useCallback(() => {
    onTransfer()
  }, [onTransfer])

  const unconnectWallet = useCallback(() => {
    deactivate()
    onDismiss()
  }, [deactivate, onDismiss])

  const renderAccount = () => {
    if (account) {
      return (
        <>
          <AddressWrapper>
            <AddressText>{account && shortenAddress(account, 6)}</AddressText>
            <CopyToClipboard text={account}>
              <CopyButton>
                <CopyIcon />
              </CopyButton>
            </CopyToClipboard>
          </AddressWrapper>
          <QRCodeWrapper>
            <QRCode value={account} size={140} renderAs={'svg'} />
          </QRCodeWrapper>
        </>
      )
    } else {
      return null
    }
  }

  return (
    <Dialog isOpen={isOpen} onDismiss={onDismiss}>
      <Title>{t('trialWalletAccount')}</Title>
      {renderAccount()}
      <WarningMessageWrapper>
        <TrialWalletIcon />
        <WarningMessage>{t('trialWalletMessage')}</WarningMessage>
      </WarningMessageWrapper>
      <BalancesWrapper>
        <BalancesTitle>{t('availableBalance')}</BalancesTitle>
        <BalanceItem>
          <BalanceText>{`${t('ether')} ${t('balance')}`}</BalanceText>
          <BalanceValue>
            {etherBalance ? amountFormatter(etherBalance, ETH_DECIMALS) : '-'}
          </BalanceValue>
        </BalanceItem>
        <BalanceItem>
          <BalanceText>SAI {t('balance')}</BalanceText>
          <BalanceValue>
            {saiBalance ? amountFormatter(saiBalance, SAI_DECIMALS) : '-'}
          </BalanceValue>
        </BalanceItem>
        <BalanceItem>
          <BalanceText>USDC {t('balance')}</BalanceText>
          <BalanceValue>
            {usdcBalance ? amountFormatter(usdcBalance, USDC_DECIMALS) : '-'}
          </BalanceValue>
        </BalanceItem>
        <TransferButton onClick={transfer}>{t('transfer')}</TransferButton>
      </BalancesWrapper>
      <UnconnectButton onClick={unconnectWallet}>{t('logout')}</UnconnectButton>
    </Dialog>
  )
}
