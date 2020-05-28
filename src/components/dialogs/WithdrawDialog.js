import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'

import { useBondByAssetAndPlatform } from '../../contexts/Bonds'
import Dialog from './Dialog'
import WithdrawForm from '../forms/WithdrawForm'

const Title = styled.div`
  margin-bottom: 32px;
  font-size: 18px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamilies.notoSans};
  letter-spacing: 1px;
  text-align: center;
`

const FormWrapper = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.blueGray200};
  border-radius: 6px;
  padding: 32px 24px;
`

export default function WithdrawDialog(props) {
  const { isOpen, onDismiss } = props
  const { t } = useTranslation()
  const { library, account } = useWeb3React()
  const { pathname } = useLocation()
  const asset = pathname.split('/')[1]
  const platform = pathname.split('/')[2]
  const bond = useBondByAssetAndPlatform(asset, platform) || {}

  return (
    <Dialog status='withdraw' isOpen={isOpen} onDismiss={onDismiss}>
      <Title>{t('withdraw')}</Title>
      <FormWrapper>
        <WithdrawForm
          library={library}
          account={account}
          tokenAddress={bond.address}
        />
      </FormWrapper>
    </Dialog>
  )
}
