import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Dialog from './Dialog'
import TransferForm from '../forms/TransferForm'

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

export default function TransferDialog(props) {
  const { isOpen, onDismiss, onCancel } = props
  const { t } = useTranslation()

  return (
    <Dialog isOpen={isOpen} onDismiss={onDismiss}>
      <Title>{t('transfer')}</Title>
      <FormWrapper>
        <TransferForm onCancel={onCancel} />
      </FormWrapper>
    </Dialog>
  )
}
