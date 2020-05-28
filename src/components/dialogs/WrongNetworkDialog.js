import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Dialog from './Dialog'
import { ReactComponent as WrongNetworkIcon } from '../../assets/wrong_network.svg'

const WrongNetworkIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const ErrorText = styled.div`
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.mahogany};
`

const MessageText = styled.div`
  margin-top: 20px;
  margin-bottom: 40px;
  font-size: 16px;
  font-weight: 400;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textColor};
`

const NetworkSpan = styled.span`
  font-weight: 600;
`

export default function WrongNetworkModal(props) {
  const { isOpen, onDismiss } = props
  const { t } = useTranslation()

  return (
    <Dialog isOpen={isOpen} isError={true} onDismiss={onDismiss}>
      <WrongNetworkIconWrapper>
        <WrongNetworkIcon />
      </WrongNetworkIconWrapper>
      <ErrorText>{t('wrongNetwork')}</ErrorText>
      <MessageText>
        {t('pleaseConnectWallet')} <NetworkSpan>{t('mainnet')}</NetworkSpan>
      </MessageText>
    </Dialog>
  )
}
